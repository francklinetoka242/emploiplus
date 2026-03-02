# Authentication Architecture (Admin vs. User)

## Overview
The application maintains **strict separation** between two independent user types:
1. **Admins** (staff) — stored in `public.admins` table
2. **Users** (candidates/companies) — stored in `public.users` table

Each type has its own:
- Table
- Login endpoint
- JWT token structure
- Token claim fields
- Middleware guards

This prevents cross-table authentication and ensures security.

---

## Database Schema Differences

### `public.admins` table (Staff)
```sql
Columns: id, email, password, role, first_name, last_name, is_active, ...
Role field: TEXT (e.g., 'super_admin', 'admin_offres', 'admin_users')
```

### `public.users` table (Clients)
```sql
Columns: id, email, password, user_type, first_name, last_name, is_verified, is_blocked, ...
User_type field: TEXT (e.g., 'candidate', 'company')
NOTE: Does NOT have a 'role' column
```

---

## API Endpoints

### 1. ADMIN ROUTES

#### POST `/api/auth/register` (Public)
**Purpose:** Create the first super admin (initial setup only)

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "strongpassword123",
  "first_name": "Admin",
  "last_name": "User"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "role": "super_admin",
    "first_name": "Admin",
    "last_name": "User"
  }
}
```

**Database Query:**
```sql
INSERT INTO admins (email, password, role, first_name, last_name, ...)
VALUES ($1, $2, 'super_admin', $3, $4, ...)
```

---

#### POST `/api/auth/login` (Public)
**Purpose:** Admin login — generates JWT for staff access

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "strongpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "super_admin",
    "firstName": "Admin",
    "lastName": "User"
  },
  "userType": "admin"
}
```

**JWT Payload:**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "role": "super_admin",
  "type": "admin"  // CRITICAL: marks token as admin token
}
```

**Database Query:**
```sql
SELECT id, email, password, role, first_name, last_name, is_active 
FROM admins 
WHERE email = $1
-- Checks: is_active = true
-- Does NOT query users table
```

---

### 2. USER ROUTES

#### POST `/api/auth/user/login` (Public)
**Purpose:** User (candidate/company) login — generates JWT for user access

**Request:**
```json
{
  "email": "user@example.com",
  "password": "userpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "user_type": "candidate",
    "firstName": "John",
    "lastName": "Doe",
    "is_verified": true
  },
  "userType": "user"
}
```

**JWT Payload:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "user_type": "candidate",
  "type": "user"  // CRITICAL: marks token as user token
}
```

**Database Query:**
```sql
SELECT id, email, password, user_type, first_name, last_name, is_verified, is_blocked
FROM users
WHERE email = $1
-- Checks: is_blocked = false, password is set
-- Does NOT query admins table
```

---

## Middleware Guards

### `authenticateJWT` (Generic)
Validates any JWT token (admin or user). Used on endpoints accessible to both.

```javascript
const { authenticateJWT } = require('../middleware/auth.middleware');
router.get('/profile', authenticateJWT, getProfile);
```

---

### `requireAdmin` (Admin-Only)
Validates JWT and ensures `type === 'admin'`. Rejects user tokens.

```javascript
const { requireAdmin, requireRoles } = require('../middleware/auth.middleware');
router.post('/admin/users', requireAdmin, createUser);  // Only admins can create users
// for endpoints that must be limited to a particular admin role use `requireRoles`:
// router.post('/admin/jobs', requireAdmin, requireRoles('super_admin','admin_offres'), createJob);
```

**Security Check:**
```javascript
if (decoded.type !== 'admin' && !decoded.role) {
  return res.status(403).json({ message: 'Forbidden: admin access required' });
}
```

### `requireRoles` (Role-Based Admin Access)
Use this generator to enforce one or more specific roles from the JWT payload.
This middleware depends on `requireAdmin` having already run (so `req.user` exists).

```javascript
// middleware definition:
// function requireRoles(...allowedRoles) { /* see auth.middleware.js */ }

// example usage:
router.post('/admin/jobs', requireAdmin, requireRoles('super_admin','admin_offres'), createJob);
```

If the token lacks any matching role, the request is rejected with 403 Forbidden.

---

### `requireUser` (User-Only)
Validates JWT and ensures `type === 'user'`. Rejects admin tokens.

```javascript
const { requireUser } = require('../middleware/auth.middleware');
router.get('/my-applications', requireUser, myApplications);  // Only users can view
```

**Security Check:**
```javascript
if (decoded.type !== 'user' || !decoded.user_type) {
  return res.status(403).json({ message: 'Forbidden: user access required' });
}
```

---

## Security Guarantees

### ✅ Isolation
- Admin login queries **ONLY** `public.admins`
- User login queries **ONLY** `public.users`
- No cross-table pollution

### ✅ Token Separation
- Admin tokens have `type: 'admin'` + `role` field
- User tokens have `type: 'user'` + `user_type` field
- Middlewares enforce token type on protected routes

### ✅ No Role Confusion
- Users never sent to admin queries (would fail: `role` column doesn't exist)
- Admins never sent to user queries (would fail: `user_type` expected but `role` present)

### ✅ Account State Checks
- Admins: requires `is_active = true`
- Users: requires `is_blocked = false`
- Prevents inactive/blocked accounts from accessing system

---

## Common Errors & Fixes

### Error: `column "role" does not exist`
**Cause:** Code tries to query `role` from `users` table (which doesn't have it)
**Fix:** Ensure user login uses `/api/auth/user/login` (not `/api/auth/login`)

### Error: `Forbidden: admin access required`
**Cause:** User token sent to admin-only endpoint
**Fix:** Use `requireAdmin` middleware on admin routes; ensure frontend sends correct token

### Error: `Forbidden: user access required`
**Cause:** Admin token sent to user-only endpoint
**Fix:** Use `requireUser` middleware on user routes; ensure frontend sends correct token

---

## Testing

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"strongpassword123"}'
```

### Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/user/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"userpassword123"}'
```

### Test Admin-Only Endpoint (with Admin Token)
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <ADMIN_JWT>"
```

### Test Admin-Only Endpoint (with User Token) — Should Fail
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <USER_JWT>"
# Expected response: 403 Forbidden
```

---

## Files Changed

- ✅ `backend/controllers/auth.controller.js` — Split login into `loginAdmin()` and `loginUser()`
- ✅ `backend/services/auth.service.js` — Dual table queries with proper isolation
- ✅ `backend/routes/auth.routes.js` — Added `/api/auth/user/login` endpoint
- ✅ `backend/middleware/auth.middleware.js` — Added `requireAdmin`, `requireUser` guards

---

## Next Steps

1. **Frontend Updates:** Update login forms to submit to correct endpoint:
   - Admin form → `/api/auth/login`
   - User form → `/api/auth/user/login`

2. **Route Protection:** Apply middleware to all protected routes:
   ```javascript
   router.get('/admin/dashboard', requireAdmin, getDashboard);
   router.get('/my-profile', requireUser, getProfile);
   ```

3. **Testing:** Test both flows on VPS after migration
