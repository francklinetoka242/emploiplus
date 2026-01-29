# Redis Configuration Usage - Developer Reference

## 🎯 Quick Overview

The Redis configuration system intelligently handles both local and cloud environments:
- **Local Dev:** Automatically uses `localhost:6379`
- **Render/Cloud:** Automatically uses `REDIS_URL` environment variable

## 📖 Using Redis in Your Code

### Option 1: Using the Config Helper (Recommended)

```typescript
import { getRedisConfig } from '../config/redis.js';

// In your file initialization
const redisConfig = getRedisConfig();

// Use with BullMQ
import { Queue, Worker } from 'bullmq';

const myQueue = new Queue('myQueue', {
  connection: redisConfig as any,
});

const worker = new Worker('myQueue', async (job) => {
  // Process job
}, { connection: redisConfig as any });
```

### Option 2: Using with Socket.io

```typescript
import { createClient as createRedisClient } from 'redis';
import { getRedisConfig } from '../config/redis.js';

const redisConfig = getRedisConfig();

if (redisConfig.url || process.env.REDIS_HOST) {
  const pubClient = createRedisClient(redisConfig as any);
  const subClient = pubClient.duplicate();
  
  io.adapter(createAdapter(pubClient, subClient));
}
```

## 🔧 Configuration Details

### What getRedisConfig() Returns

**When REDIS_URL is set (Render/Cloud):**
```typescript
{
  url: "redis://default:password@host:port",
  maxRetriesPerRequest: null
}
```

**When REDIS_URL is not set (Local Dev):**
```typescript
{
  host: "localhost",
  port: 6379,
  password: undefined,  // or password if REDIS_PASSWORD is set
  maxRetriesPerRequest: null
}
```

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `REDIS_URL` | Cloud Redis connection string (Render) | `redis://default:pwd@host:6379` |
| `REDIS_HOST` | Local Redis hostname | `localhost` |
| `REDIS_PORT` | Local Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (optional) | `mypassword` |

## 🚀 Migration from Hardcoded Config

### Before (❌ Hardcoded)
```typescript
const redis = new Redis({
  host: 'localhost',
  port: 6379
});
```

### After (✅ Using Config Helper)
```typescript
import { getRedisConfig } from '../config/redis.js';

const redis = new Redis(getRedisConfig());
```

## 📍 Files Using Redis Configuration

### Notification Queue
**File:** `backend/src/services/notificationQueue.ts`
```typescript
import { getRedisConfig } from '../config/redis.js';

const notificationQueue = new Queue('notifications', {
  connection: getRedisConfig() as any,
});
```

### Microservice Queues
**File:** `backend/src/services/microserviceQueues.ts`
```typescript
import { getRedisConfig } from '../config/redis.js';

const jobAnalysisQueue = new Queue('jobAnalysis', {
  connection: getRedisConfig() as any,
});

const jobAnalysisWorker = new Worker('jobAnalysis', handler, {
  connection: getRedisConfig() as any,
});
```

### Socket.io Real-time
**File:** `backend/src/integrations/socketio.ts`
```typescript
import { createClient as createRedisClient } from 'redis';
import { getRedisConfig } from '../config/redis.js';

const pubClient = createRedisClient(getRedisConfig() as any);
```

## ✅ Best Practices

### 1. Always Import the Config Helper
```typescript
import { getRedisConfig } from '../config/redis.js';
```

### 2. Use as Config Parameter
```typescript
new Queue('name', { connection: getRedisConfig() as any })
```

### 3. Add Logging for Debugging
```typescript
const config = getRedisConfig();
console.log('Redis Config:', JSON.stringify(config, null, 2));
```

### 4. Handle Connection Errors
```typescript
const queue = new Queue('name', { connection: getRedisConfig() as any });

queue.on('error', (err) => {
  console.error('[Queue Error]', err);
});
```

## 🧪 Testing Your Redis Config

### Run Test Script
```bash
cd backend
node test-redis-config.js
```

### With REDIS_URL (Render Simulation)
```bash
export REDIS_URL="redis://default:password@host:6379"
node test-redis-config.js
```

## 🔍 Debugging Redis Issues

### Check Current Configuration
```bash
# See what config is being used
node test-redis-config.js

# Look for:
# "[Redis] Using REDIS_URL for connection" (Render)
# "[Redis] Using host:port configuration" (Local)
```

### Verify Environment Variables
```bash
echo $REDIS_URL        # Check if set
echo $REDIS_HOST       # Should be localhost by default
echo $REDIS_PORT       # Should be 6379 by default
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED localhost:6379` | Redis not running locally | Start Redis: `redis-server` |
| `Unable to connect to Redis URL` | Invalid REDIS_URL on Render | Verify URL format and credentials |
| `maxRetriesPerRequest error` | Wrong config for BullMQ | Use config from helper, not custom |

## 📚 Full Code Example

### Complete Notification Queue Setup
```typescript
import { Queue, Worker } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { getRedisConfig } from '../config/redis.js';

// Get Redis config (auto-detects REDIS_URL or falls back to localhost)
const redisConfig = getRedisConfig();

// Create notification queue
const notificationQueue = new Queue('notifications', {
  connection: redisConfig as any,
});

// Create worker
const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    console.log(`Processing notification job ${job.id}`);
    // ... process notification
  },
  { connection: redisConfig as any }
);

// Event handlers
notificationQueue.on('error', (err) => {
  console.error('[NotificationQueue Error]', err);
});

notificationWorker.on('error', (err) => {
  console.error('[NotificationWorker Error]', err);
});

console.log('[NotificationQueue] Initialized with config:', JSON.stringify(redisConfig, null, 2));
```

## 🎓 Understanding the Flow

```
Application Startup
         ↓
    Import getRedisConfig()
         ↓
         ┌─────────────────────────┐
         │ Check REDIS_URL env var │
         └────────────┬────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
     IS SET                   NOT SET
         │                         │
         ↓                         ↓
    Use Cloud      Use Local (host:port)
    Redis URL      with fallbacks
         │                         │
         └────────────┬────────────┘
                      │
              Return Config Object
                      │
              ┌───────┴──────────┐
              │                  │
           BullMQ           Socket.io
           Queue            Adapter
           │                │
    Process jobs    Enable real-time
    in background   messaging
```

## 📖 Related Documentation

- **Deployment Guide:** `REDIS_RENDER_DEPLOYMENT.md`
- **Configuration Status:** `REDIS_CONFIGURATION_COMPLETE.md`
- **Config Source:** `backend/src/config/redis.ts`

---

**Ready to use Redis in your code!** 🚀
