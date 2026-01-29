# 🚀 Pre-Render Deployment Checklist

## ⏰ Timeline: Before Deploying to Render

### Phase 1: Verification (Right Now - 5 minutes)
- [ ] Verify Redis configuration test passes
  ```bash
  cd backend && node test-redis-config.js
  ```
- [ ] Confirm no Redis-related TypeScript errors
  ```bash
  cd backend && npx tsc --noEmit 2>&1 | grep -i redis
  ```
- [ ] Verify all Redis imports are from config helper
  ```bash
  grep -r "from '../config/redis'" backend/src/
  ```

### Phase 2: Code Review (10 minutes)
- [ ] Review `backend/src/config/redis.ts` exists
- [ ] Verify `getRedisConfig()` is exported
- [ ] Check 3 main files use `redisConfig`:
  - [ ] `backend/src/services/notificationQueue.ts`
  - [ ] `backend/src/services/microserviceQueues.ts`
  - [ ] `backend/src/integrations/socketio.ts`
- [ ] No hardcoded `redis.createClient()` calls
- [ ] No hardcoded `localhost:6379` in connection strings

### Phase 3: Render Preparation (15 minutes)
- [ ] Access Render Dashboard
- [ ] Go to Backend Service → Environment
- [ ] Check existing environment variables:
  - [ ] `CORS_ORIGINS` is set
  - [ ] `DATABASE_URL` is set
  - [ ] `SUPABASE_URL` is set
  - [ ] `SUPABASE_ANON_KEY` is set
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Get Render Redis URL from Redis instance:
  - [ ] Go to Render Dashboard → Redis instance
  - [ ] Copy "Internal Database URL"
  - [ ] Format: `redis://default:PASSWORD@HOST:PORT`

### Phase 4: Add REDIS_URL to Render (5 minutes)
- [ ] Click "Add Environment Variable" on Render
- [ ] Key: `REDIS_URL`
- [ ] Value: (paste your Render Redis URL)
- [ ] Save changes

### Phase 5: Deploy (10 minutes)
- [ ] Go to Backend Service → Manual Deploy (or git push if auto-deploy)
- [ ] Monitor deployment progress
- [ ] Wait for "deployed" status
- [ ] Check recent logs in Render

### Phase 6: Verify Deployment (10 minutes)
- [ ] Look for these logs:
  ```
  [Redis] Using REDIS_URL for connection
  [Socket.io] Redis adapter enabled
  Server is running on port X
  ```
- [ ] Check for any errors related to Redis connection
- [ ] Verify admin routes respond:
  ```bash
  curl https://your-backend-url/api/admin/login
  ```

### Phase 7: Test Application (15 minutes)
- [ ] Go to https://emploiplus.vercel.app/admin/register/super-admin
- [ ] Create a test super-admin account
- [ ] Verify registration succeeds (backend is running)
- [ ] Try admin login
- [ ] Create a test job posting
- [ ] Verify job appears in list

---

## ✅ Success Criteria

### Backend Should:
- [ ] Start without Redis connection errors
- [ ] Have access to cloud Redis (not localhost)
- [ ] Process background jobs via BullMQ
- [ ] Handle real-time messaging via Socket.io
- [ ] Respond to all API endpoints

### You Should See:
```
✓ Server is running on port XXXX
✓ [Redis] Using REDIS_URL for connection
✓ [Socket.io] Redis adapter enabled
✓ Database connected
✓ No errors in startup logs
```

### You Should NOT See:
```
✗ Cannot find module 'redis'
✗ ECONNREFUSED localhost:6379
✗ REDIS_URL not found
✗ Redis connection timeout
✗ Socket adapter initialization failed
```

---

## 🆘 If Something Goes Wrong

### Error: "Cannot find module 'redis'"
- **Action:** Ensure `backend/src/integrations/socketio.ts` has the import
- **Check:** `import { createClient as createRedisClient } from 'redis';`

### Error: "ECONNREFUSED localhost:6379"
- **Action:** `REDIS_URL` not set on Render
- **Fix:** Add `REDIS_URL` to Render environment variables
- **Redeploy:** After adding env var, deploy backend again

### Error: "Unable to connect to Redis at URL..."
- **Action:** Invalid `REDIS_URL` format
- **Check:** URL should be `redis://default:password@host:port`
- **Verify:** Copy directly from Render Redis instance settings

### Error: "BullMQ queue connection failed"
- **Action:** Config not reaching queue initialization
- **Check:** Verify `redisConfig` is imported in queue file
- **Check:** Verify `getRedisConfig()` is called, not hardcoded config

### Backend starts but jobs don't process
- **Check:** Look for `[Queue] Worker initialized` message
- **Check:** Verify Redis adapter logs appear
- **Solution:** May need to restart backend after Redis is available

---

## 📱 Quick Status Check

### After Deployment, Run This:
```bash
# Check if backend is responding
curl https://your-backend-url/health || echo "Backend not responding"

# Check if admin endpoints work
curl https://your-backend-url/api/admin/login -X POST

# Check logs in Render
# Dashboard → Backend Service → Logs
```

---

## 📞 Support Resources

### Documentation Files:
- **Deployment Guide:** `REDIS_RENDER_DEPLOYMENT.md`
- **Configuration Details:** `REDIS_CONFIGURATION_COMPLETE.md`
- **Developer Reference:** `REDIS_DEVELOPER_REFERENCE.md`

### Quick Links:
- Render Dashboard: https://dashboard.render.com
- Redis Instance Logs: Dashboard → Redis → Logs
- Backend Logs: Dashboard → Backend Service → Logs

---

## 🎯 Final Checklist

Before clicking "Deploy" on Render:

- [ ] All code changes verified
- [ ] REDIS_URL added to Render environment
- [ ] Other env vars checked and present
- [ ] Ready to monitor logs after deployment

---

## ✨ Expected Outcome

After successful deployment:
- ✅ Backend runs on Render with cloud Redis
- ✅ No hardcoded localhost:6379 connection attempts
- ✅ BullMQ queues process jobs
- ✅ Socket.io handles real-time messaging
- ✅ Application is fully functional

---

**You're Ready to Deploy!** 🚀

Last step: Add REDIS_URL to Render and deploy the backend.
