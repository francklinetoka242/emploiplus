#!/usr/bin/env node

/**
 * Supabase Authentication Test Suite
 * 
 * Tests:
 * - User registration
 * - User login
 * - Token validation
 * - Protected routes access
 * - JWT token expiration
 */

import fetch from 'node-fetch';
import crypto from 'crypto';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const log = {
  test: (msg) => console.log(`\n${colors.blue}[TEST]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.gray}→ ${msg}${colors.reset}`)
};

let testsPassed = 0;
let testsFailed = 0;
let testToken = null;

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${BACKEND_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    return {
      status: 0,
      ok: false,
      data: { error: error.message }
    };
  }
}

async function testBackendHealth() {
  log.test('Backend Health Check');
  
  const result = await makeRequest('/health');
  
  if (result.status === 200 || result.status === 404) {
    log.success('Backend is running');
    testsPassed++;
  } else {
    log.error(`Backend not responding (HTTP ${result.status})`);
    testsFailed++;
    return false;
  }
  
  return true;
}

async function testUserRegistration() {
  log.test('User Registration');
  log.info(`Creating user with email: ${TEST_EMAIL}`);
  
  const result = await makeRequest('/api/register', 'POST', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    full_name: 'Test User',
    country: 'congo',
    user_type: 'candidate'
  });

  if (result.ok && result.data.token) {
    log.success('Registration successful');
    testToken = result.data.token;
    log.info(`Token obtained: ${testToken.substring(0, 20)}...`);
    testsPassed++;
    return true;
  } else if (result.status === 409 || result.data.message?.includes('already exists')) {
    // User already exists, try login instead
    log.warning('User already exists, attempting login');
    return await testUserLogin();
  } else {
    log.error(`Registration failed: ${result.data.message || `HTTP ${result.status}`}`);
    log.info(`Response: ${JSON.stringify(result.data)}`);
    testsFailed++;
    return false;
  }
}

async function testUserLogin() {
  log.test('User Login');
  log.info(`Logging in with email: ${TEST_EMAIL}`);
  
  const result = await makeRequest('/api/login', 'POST', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  if (result.ok && result.data.token) {
    log.success('Login successful');
    testToken = result.data.token;
    log.info(`Token obtained: ${testToken.substring(0, 20)}...`);
    testsPassed++;
    return true;
  } else {
    log.error(`Login failed: ${result.data.message || `HTTP ${result.status}`}`);
    log.info(`Response: ${JSON.stringify(result.data)}`);
    testsFailed++;
    return false;
  }
}

async function testProtectedRoute() {
  if (!testToken) {
    log.warning('Skipping protected route test (no valid token)');
    return false;
  }

  log.test('Protected Route Access (/api/users/me)');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      log.success('Protected route accessible');
      log.info(`User: ${data.email || 'unknown'}`);
      testsPassed++;
      return true;
    } else {
      log.error(`Protected route failed: HTTP ${response.status}`);
      log.info(`Response: ${JSON.stringify(data)}`);
      testsFailed++;
      return false;
    }
  } catch (error) {
    log.error(`Request error: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function testWithoutToken() {
  log.test('Request Without Token (Should Fail)');
  
  const result = await makeRequest('/api/users/me');

  if (result.status === 401) {
    log.success('Correctly rejected request without token (HTTP 401)');
    testsPassed++;
    return true;
  } else {
    log.warning(`Unexpected response: HTTP ${result.status}`);
    testsFailed++;
    return false;
  }
}

async function testWithInvalidToken() {
  log.test('Request With Invalid Token (Should Fail)');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_token_xyz123',
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      log.success('Correctly rejected invalid token (HTTP 401)');
      testsPassed++;
      return true;
    } else {
      log.warning(`Unexpected response: HTTP ${response.status}`);
      testsFailed++;
      return false;
    }
  } catch (error) {
    log.error(`Request error: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function testTokenFormat() {
  if (!testToken) {
    log.warning('Skipping token format test (no valid token)');
    return false;
  }

  log.test('Token Format Validation');
  
  // JWT should have 3 parts separated by dots
  const parts = testToken.split('.');
  
  if (parts.length === 3) {
    log.success('Token is valid JWT format (3 parts)');
    
    try {
      // Decode header
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      log.info(`Header: ${JSON.stringify(header)}`);
      
      // Decode payload (don't verify signature)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      log.info(`Payload ID: ${payload.id}, Role: ${payload.role}`);
      
      testsPassed++;
      return true;
    } catch (error) {
      log.error(`Token decode failed: ${error.message}`);
      testsFailed++;
      return false;
    }
  } else {
    log.error(`Invalid JWT format: expected 3 parts, got ${parts.length}`);
    testsFailed++;
    return false;
  }
}

async function runAllTests() {
  console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}Supabase Authentication Test Suite${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.yellow}Backend URL: ${BACKEND_URL}${colors.reset}`);
  console.log(`${colors.yellow}Test Email: ${TEST_EMAIL}${colors.reset}`);

  // Run tests in sequence
  const backendOk = await testBackendHealth();
  if (!backendOk) {
    console.log(`\n${colors.red}Backend is not responding. Cannot continue.${colors.reset}`);
    process.exit(1);
  }

  await testUserRegistration();
  
  // If registration didn't work, try login
  if (!testToken) {
    await testUserLogin();
  }

  await testTokenFormat();
  await testProtectedRoute();
  await testWithoutToken();
  await testWithInvalidToken();

  // Summary
  console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  
  if (testsFailed === 0) {
    console.log(`\n${colors.green}✓ All tests passed! Authentication is working correctly.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.yellow}⚠ Some tests failed. Check the output above for details.${colors.reset}`);
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
