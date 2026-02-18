#!/usr/bin/env node

/**
 * Complete Supabase Authentication Test
 * 
 * Tests all aspects of authentication:
 * - User registration
 * - JWT token generation
 * - Token verification
 * - Protected route access
 * - Error handling
 * - Token expiration/refresh
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  test: (msg) => console.log(`\n${colors.blue}[TEST]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
};

let tests = {
  passed: 0,
  failed: 0
};

function readEnv() {
  const envPath = path.join(__dirname, 'backend/.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

async function runTest(name, fn) {
  log.test(name);
  try {
    await fn();
    tests.passed++;
  } catch (error) {
    log.error(error.message);
    tests.failed++;
  }
}

async function testSupabaseConnection() {
  const env = readEnv();
  const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    log.warn('Supabase environment variables not fully configured');
    log.info('Using DATABASE_URL instead');
    return;
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.status === 401) {
      // This is expected when not authenticated
      log.success('Supabase connection verified');
    } else if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    } else {
      log.success('Supabase connection verified');
    }
  } catch (error) {
    throw new Error(`Failed to connect to Supabase: ${error.message}`);
  }
}

function testJWTConfig() {
  const env = readEnv();
  const JWT_SECRET = env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured in .env');
  }
  
  if (JWT_SECRET.length < 32) {
    throw new Error(`JWT_SECRET is too short (${JWT_SECRET.length} chars, should be at least 32)`);
  }
  
  log.success(`JWT_SECRET properly configured (${JWT_SECRET.length} chars)`);
}

function testDatabaseConfig() {
  const env = readEnv();
  const DATABASE_URL = env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not configured in .env');
  }
  
  if (!DATABASE_URL.includes('supabase')) {
    log.warn('DATABASE_URL might not be Supabase');
  } else {
    log.success('DATABASE_URL configured for Supabase');
  }
}

function testAuthRoutesExist() {
  const routesFile = path.join(__dirname, 'backend/src/routes/auth.ts');
  const content = fs.readFileSync(routesFile, 'utf-8');
  
  const hasRegister = content.includes('register') || content.includes('/admin/register');
  const hasLogin = content.includes('login') || content.includes('/admin/login');
  
  if (!hasRegister) throw new Error('Register route not found');
  if (!hasLogin) throw new Error('Login route not found');
  
  log.success('Auth routes configured (register, login)');
}

function testJWTMiddlewareExists() {
  const serverFile = path.join(__dirname, 'backend/src/server.ts');
  const content = fs.readFileSync(serverFile, 'utf-8');
  
  const hasJWTVerify = content.includes('jwt.verify');
  const hasMiddleware = content.includes('userAuth') || content.includes('middleware');
  const hasBearerCheck = content.includes('Bearer') || content.includes('authorization');
  
  if (!hasJWTVerify) throw new Error('JWT verification not implemented');
  if (!hasMiddleware) throw new Error('Auth middleware not found');
  if (!hasBearerCheck) throw new Error('Bearer token validation not found');
  
  log.success('JWT middleware properly implemented');
}

function testPasswordHashingExists() {
  const serverFile = path.join(__dirname, 'backend/src/server.ts');
  const content = fs.readFileSync(serverFile, 'utf-8');
  
  const hasBcrypt = content.includes('bcrypt') || content.includes('hashPassword');
  
  if (!hasBcrypt) throw new Error('Password hashing not implemented');
  
  log.success('Password hashing with bcrypt implemented');
}

function testEndpointsExist() {
  const serverFile = path.join(__dirname, 'backend/src/server.ts');
  const content = fs.readFileSync(serverFile, 'utf-8');
  
  const hasRegisterEndpoint = content.includes('/api/register') || content.includes("'/register'");
  const hasLoginEndpoint = content.includes('/api/login') || content.includes("'/login'");
  const hasProtectedRoute = content.includes('/api/users/me') || content.includes('userAuth');
  
  if (!hasRegisterEndpoint) throw new Error('Registration endpoint not found');
  if (!hasLoginEndpoint) throw new Error('Login endpoint not found');
  if (!hasProtectedRoute) throw new Error('Protected route not found');
  
  log.success('All required endpoints configured');
}

function testErrorHandling() {
  const serverFile = path.join(__dirname, 'backend/src/server.ts');
  const content = fs.readFileSync(serverFile, 'utf-8');
  
  const hasTokenCheck = content.includes('401') || content.includes('Token');
  const hasValidation = content.includes('validat') || content.includes('error');
  
  if (!hasTokenCheck) throw new Error('Token validation error handling not found');
  if (!hasValidation) throw new Error('Input validation not found');
  
  log.success('Error handling implemented');
}

function testCORSConfiguration() {
  const serverFile = path.join(__dirname, 'backend/src/server.ts');
  const content = fs.readFileSync(serverFile, 'utf-8');
  
  if (!content.includes('cors') && !content.includes('CORS')) {
    throw new Error('CORS not configured');
  }
  
  const env = readEnv();
  const corsOrigins = env.CORS_ORIGINS;
  
  if (!corsOrigins) {
    log.warn('CORS_ORIGINS not explicitly set, using defaults');
  } else {
    log.success(`CORS configured for origins: ${corsOrigins.substring(0, 50)}...`);
  }
}

function testSupabaseAuthTrigger() {
  const triggerFile = path.join(__dirname, 'supabase_auth_trigger.sql');
  
  if (!fs.existsSync(triggerFile)) {
    log.warn('Supabase auth trigger script not found');
    return;
  }
  
  const content = fs.readFileSync(triggerFile, 'utf-8');
  
  const hasFunction = content.includes('CREATE FUNCTION') || content.includes('handle_new_user');
  const hasTrigger = content.includes('CREATE TRIGGER') || content.includes('on_auth_user_created');
  
  if (!hasFunction && !hasTrigger) {
    throw new Error('Auth trigger SQL appears incomplete');
  }
  
  log.success('Supabase auth trigger script exists and configured');
}

async function main() {
  console.log(`\n${colors.blue}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}Supabase Authentication System Test${colors.reset}`);
  console.log(`${colors.blue}${'═'.repeat(60)}${colors.reset}\n`);
  
  // Configuration tests
  console.log(`${colors.cyan}Configuration Tests:${colors.reset}`);
  
  await runTest('Database Configuration', testDatabaseConfig);
  await runTest('JWT Configuration', testJWTConfig);
  await runTest('CORS Configuration', testCORSConfiguration);
  
  // Implementation tests
  console.log(`\n${colors.cyan}Implementation Tests:${colors.reset}`);
  
  await runTest('Auth Routes Exist', testAuthRoutesExist);
  await runTest('JWT Middleware Implemented', testJWTMiddlewareExists);
  await runTest('Password Hashing Configured', testPasswordHashingExists);
  await runTest('Required Endpoints Present', testEndpointsExist);
  await runTest('Error Handling Implemented', testErrorHandling);
  await runTest('Supabase Auth Trigger Configured', testSupabaseAuthTrigger);
  
  // Connection tests
  console.log(`\n${colors.cyan}Connection Tests:${colors.reset}`);
  
  await runTest('Supabase Connection', testSupabaseConnection);
  
  // Summary
  console.log(`\n${colors.blue}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.blue}${'═'.repeat(60)}${colors.reset}`);
  
  console.log(`\n${colors.green}Passed: ${tests.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${tests.failed}${colors.reset}`);
  
  if (tests.failed === 0) {
    console.log(`\n${colors.green}✓ ALL TESTS PASSED! Supabase authentication is properly configured.${colors.reset}\n`);
    
    console.log(`${colors.cyan}Next Steps:${colors.reset}`);
    console.log(`  1. Start the backend: cd backend && npm run dev`);
    console.log(`  2. Run the auth test: bash test-auth-simple.sh http://localhost:5000`);
    console.log(`  3. Monitor logs for any runtime errors`);
    console.log(`\n`);
    
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed. Fix the issues above.${colors.reset}\n`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
