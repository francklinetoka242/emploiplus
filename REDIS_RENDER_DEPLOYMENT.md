# Redis Configuration - Render Deployment Guide

## ✅ What's Been Fixed

### Summary
Fixed critical Redis configuration issue preventing backend from running on Render. The application was hardcoded to connect to `localhost:6379`, which doesn't exist on Render's infrastructure.

### Changes Made

#### 1. **New Redis Config Helper** (`backend/src/config/redis.ts`)
```typescript
export function getRedisConfig(): RedisConfig {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log('[Redis] Using REDIS_URL for connection');
    return { url: redisUrl, maxRetriesPerRequest: null };
  }
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD;
  return { host, port, password: password || undefined, maxRetriesPerRequest: null };
}
```

**Key Features:**
- ✅ Prioritizes `REDIS_URL` (provided by Render)
- ✅ Falls back to `host:port` configuration for local development
- ✅ Supports password authentication
- ✅ BullMQ-compatible config (`maxRetriesPerRequest: null`)

#### 2. **Updated Files Using Redis**

| File | Changes |
|------|---------|
| `backend/src/services/notificationQueue.ts` | Imported `redisConfig`, removed hardcoded config |
| `backend/src/services/microserviceQueues.ts` | Imported `redisConfig`, removed `* as Redis` import, updated all Queue/Worker constructors |
| `backend/src/integrations/socketio.ts` | Imported `createClient as createRedisClient` from 'redis', updated Redis adapter initialization |

#### 3. **Test Script** (`backend/test-redis-config.js`)
Created test script to verify Redis configuration works in both environments:
- Local: Uses `localhost:6379`
- Render: Uses `REDIS_URL` environment variable

---

## 🚀 Deployment Steps for Render

### Step 1: Add REDIS_URL Environment Variable

1. Go to Render Dashboard → Your Backend Service
2. Navigate to **Environment** tab
3. Add new environment variable:
   - **Key:** `REDIS_URL`
   - **Value:** (Get from Render Redis instance or your cloud Redis provider)

**Finding your Redis URL on Render:**
- Dashboard → Redis instance → Connection info → Internal Database URL
- Format: `redis://default:password@host:port`

### Step 2: Verify Other Environment Variables

Ensure these are also set on Render:
```
CORS_ORIGINS=https://emploiplus.vercel.app,http://localhost:3000
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Step 3: Deploy Backend

Option A: **Manual Deploy**
1. Go to Render Dashboard → Backend Service
2. Click **Manual Deploy** button
3. Wait for deployment to complete

Option B: **Git Push** (if auto-deploy enabled)
```bash
git add -A
git commit -m "fix: redis configuration for render deployment"
git push origin main
```

### Step 4: Monitor Logs

After deployment, check logs for Redis connection:
```
[Redis] Using REDIS_URL for connection
[Socket.io] Redis adapter enabled
[Queue] Notification queue initialized
[Queue] Job analysis queue initialized
```

---

## 🧪 Testing Redis Configuration

### Local Testing (No REDIS_URL)
```bash
cd backend
node test-redis-config.js
```
Expected: Uses `localhost:6379`

### Render Testing (With REDIS_URL)
```bash
export REDIS_URL="redis://default:password@your-render-redis:6379"
node test-redis-config.js
```
Expected: Uses provided `REDIS_URL`

---

## 🔍 What Each Service Uses Redis For

1. **BullMQ Queues** (`notificationQueue.ts`, `microserviceQueues.ts`)
   - Notification queue (push/email/SMS)
   - Job analysis queue (process job postings)
   - Post moderation queue (moderate posts)
   - Activity scoring queue (score user engagement)

2. **Socket.io Adapter** (`socketio.ts`)
   - Multi-server scaling
   - Real-time messaging across multiple instances
   - Pub/Sub for broadcast events

---

## 🛠️ Troubleshooting

### Error: "ECONNREFUSED localhost:6379"
- **Cause:** `REDIS_URL` environment variable not set on Render
- **Fix:** Add `REDIS_URL` to Render environment variables

### Error: "Unable to connect to Redis at URL..."
- **Cause:** Invalid `REDIS_URL` format
- **Fix:** Verify URL format: `redis://[username:password@]host:port`
- **Fix:** Check Redis instance is running and accessible

### BullMQ Jobs Not Processing
- **Check:** Verify Redis is connected (look for `[Socket.io] Redis adapter enabled` in logs)
- **Check:** Verify `REDIS_URL` is correctly configured
- **Check:** Ensure Render Redis instance quota is not exceeded

---

## 📋 Files Modified Summary

### Created Files
- `backend/src/config/redis.ts` - Redis configuration helper
- `backend/test-redis-config.js` - Redis config test script
- `backend/test-redis-config.ts` - TypeScript version of test

### Modified Files
- `backend/src/services/notificationQueue.ts`
- `backend/src/services/microserviceQueues.ts`
- `backend/src/integrations/socketio.ts`

### Build Status
- ✅ Frontend builds successfully
- ✅ Backend TypeScript compiles (10 pre-existing errors unrelated to Redis changes)
- ✅ No Redis-specific compilation errors
- ✅ Redis configuration tested and verified

---

## ✨ Key Improvements

1. **Cloud-First Architecture:** Prioritizes cloud Redis (REDIS_URL) over local
2. **Backward Compatible:** Still supports local development without configuration
3. **Centralized Config:** Single source of truth for Redis configuration
4. **Type Safe:** Proper TypeScript types for all Redis configurations
5. **Defensive Logging:** Console logs indicate which config mode is active

---

## 🎯 Next Steps

1. ✅ Verify Redis configuration (done - test scripts confirm)
2. ⏳ Set `REDIS_URL` on Render
3. ⏳ Deploy backend to Render
4. ⏳ Monitor logs for successful Redis connection
5. ⏳ Test admin registration workflow (`/admin/register/super-admin`)
6. ⏳ Test job creation and BullMQ queue processing

---

**Ready to deploy to Render!** 🚀
