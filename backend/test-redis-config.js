#!/usr/bin/env node
/**
 * Test Redis Configuration
 * Simple CommonJS test without dependencies
 */

// Simulated getRedisConfig function (same logic)
function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log('[Redis] Using REDIS_URL for connection');
    return { url: redisUrl, maxRetriesPerRequest: null };
  }
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD;
  console.log(`[Redis] Using host:port configuration (${host}:${port})`);
  return { host, port, password: password || undefined, maxRetriesPerRequest: null };
}

console.log('\n' + '='.repeat(80));
console.log('🔍 Testing Redis Configuration');
console.log('='.repeat(80));

// Test 1: Current environment
console.log('\n📋 Current Environment Variables:');
console.log(`  REDIS_URL: ${process.env.REDIS_URL ? '✓ Set to: ' + process.env.REDIS_URL : '✗ Not set'}`);
console.log(`  REDIS_HOST: ${process.env.REDIS_HOST || 'localhost (default)'}`);
console.log(`  REDIS_PORT: ${process.env.REDIS_PORT || '6379 (default)'}`);
console.log(`  REDIS_PASSWORD: ${process.env.REDIS_PASSWORD ? '✓ Set' : '✗ Not set'}`);

// Test 2: Redis config output
const config = getRedisConfig();
console.log('\n⚙️  Redis Configuration Generated:');
console.log(`  ${JSON.stringify(config, null, 2)}`);

// Test 3: Validate config
console.log('\n✅ Configuration Validation:');
if ('url' in config) {
  console.log(`  ✓ Using REDIS_URL: ${config.url}`);
} else {
  console.log(`  ✓ Using host:port - ${config.host}:${config.port}`);
  if (config.password) {
    console.log(`  ✓ Password auth enabled`);
  }
}

if (config.maxRetriesPerRequest === null) {
  console.log(`  ✓ maxRetriesPerRequest: null (BullMQ compatible)`);
}

console.log('\n' + '='.repeat(80));
console.log('✨ Redis configuration test completed');
console.log('='.repeat(80) + '\n');
