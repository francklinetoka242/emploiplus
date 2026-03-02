# VPS Deployment Checklist - Dual Authentication Flow

## Changes Summary

Your authentication system has been restructured to **strictly separate admin and user login flows**:

### What Changed
- **Endpoint 1:** `POST /api/auth/login` → Queries `public.admins` table only
- **Endpoint 2:** `POST /api/auth/user/login` → Queries `public.users` table only
- **JWT Tokens:** Now include `type` field ('admin' or 'user') to enforce access control
- **Middleware:** New `requireAdmin` and `requireUser` guards prevent token misuse

### Files Modified
1. `backend/controllers/auth.controller.js`
2. `backend/services/auth.service.js`
3. `backend/routes/auth.routes.js`
4. `backend/middleware/auth.middleware.js`
5. `backend/AUTH_ARCHITECTURE.md` (new documentation)

---

## Pre-Deployment Steps

### 1. Database Migration (VPS Only)
Ensure your VPS database has the `role` column in the `admins` table:

```bash
ssh emplo1205@195.110.35.133 -p 7932
psql -U your_db_user -d your_db_name -f backend/migrations/001_add_role_to_admins.sql
```

### 2. Environment Variables
Ensure these are set on VPS `.env`:
```
JWT_SECRET=your_secret_key
NODE_ENV=production
DATABASE_URL=your_connection_string
```

### 3. Backend Restart
After deploying the new code:
```bash
cd backend
npm install
npm run dev  # or your production start script
```

---

## Testing Checklist

### ✅ Admin Login (should work)
```bash
curl -X POST https://emploiplus-group.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"password123"}'
```
Expected: 200 OK with admin token

### ✅ User Login (new endpoint)
```bash
curl -X POST https://emploiplus-group.com/api/auth/user/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'
```
Expected: 200 OK with user token

### ✅ Admin Token on User Route (should fail)
```bash
curl -X POST https://emploiplus-group.com/api/auth/user/login \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '...'
```
Expected: 403 Forbidden (admin token rejected from user endpoint)

---

## Frontend Updates Needed

### Update Login Forms
**Admin Login Form:**
```javascript
// OLD
const res = await fetch(buildApiUrl('/api/auth/login'), { ... })

// NEW (already correct)
const res = await fetch(buildApiUrl('/api/auth/login'), { ... })
```

**User Login Form (NEW):**
```javascript
// Add a new login page for users that calls:
const res = await fetch(buildApiUrl('/api/auth/user/login'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### Update Route Protection
Any routes that create/manage admins should use the new middleware in routes:
```javascript
// For admin-only endpoints:
router.post('/admin/create', requireAdmin, createAdmin);

// For user-only endpoints:
router.get('/my-profile', requireUser, getProfile);
```

---

## Rollback Plan
If issues occur, revert to the previous version by reverting the git changes:
```bash
git checkout HEAD -- backend/controllers/auth.controller.js
git checkout HEAD -- backend/services/auth.service.js
git checkout HEAD -- backend/routes/auth.routes.js
git checkout HEAD -- backend/middleware/auth.middleware.js
```

---

## Support
Refer to `backend/AUTH_ARCHITECTURE.md` for detailed documentation on the dual-flow system.
