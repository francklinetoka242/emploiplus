# Route Middleware Mapping Guide

This document shows which routes should use which authentication middleware based on the new dual-flow system.

## Middleware Options
- **`authenticateJWT`** — Accept both admin and user tokens (generic authorization)
- **`requireAdmin`** — Admin tokens only (reject user tokens)
- **`requireUser`** — User tokens only (reject admin tokens)
- **No middleware** — Public/open endpoint

---

## Auth Routes (`/api/auth`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| POST | `/register` | Public | Public | Create first super admin |
| POST | `/login` | Public | Public | Admin login |
| POST | `/user/login` | Public | Public | User login |

---

## Job Routes (`/api/jobs`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| GET | `/` | Public | Public | Browse jobs (public) |
| GET | `/:id` | Public | Public | View job detail (public) |
| POST | `/` | `authenticateJWT` | **`requireAdmin`**, `requireRoles('super_admin','admin_offres')` | Create jobs = admin function |
| PUT | `/:id` | `authenticateJWT` | **`requireAdmin`**, `requireRoles('super_admin','admin_offres')` | Update jobs = admin function |
| DELETE | `/:id` | `authenticateJWT` | **`requireAdmin`**, `requireRoles('super_admin','admin_offres')` | Delete jobs = admin function |

**Update Code:**
```javascript
const { requireAdmin } = require('../middleware/auth.middleware');

router.post('/', requireAdmin, createJob);      // Admin only
router.put('/:id', requireAdmin, updateJob);    // Admin only
router.delete('/:id', requireAdmin, deleteJob); // Admin only
```

---

## Formation Routes (`/api/formations`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| GET | `/` | Public | Public | Browse formations (public) |
| GET | `/:id` | Public | Public | View formation detail (public) |
| POST | `/:id/enroll` | `authenticateJWT` | **`requireUser`** | Only users can enroll |

**Update Code:**
```javascript
const { requireUser } = require('../middleware/auth.middleware');

router.post('/:id/enroll', requireUser, enroll); // User only
```

---

## Publication Routes (`/api/publications`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| GET | `/` | Public | Public | Browse publications (public) |
| GET | `/:id` | Public | Public | View publication (public) |
| POST | `/` | `authenticateJWT` | **`requireAdmin`** | Create publications = admin function |
| DELETE | `/:id` | `authenticateJWT` | **`requireAdmin`** | Delete publications = admin function |

---

## Notification Routes (`/api/notifications`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| GET | `/` | `authenticateJWT` | **`requireUser`** | Users get their notifications |
| POST | `/:id/read` | `authenticateJWT` | **`requireUser`** | Users mark their notifications |

---

## Dashboard Routes (`/api/dashboard`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| GET | `/stats` | `authenticateJWT` | **`requireAdmin`** | Admin dashboard stats only |

---

## Upload Routes (`/api/uploads`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| POST | `/candidate` | `authenticateJWT` | **`requireUser`** | Users upload documents |

---

## FAQ Routes (`/api/faq`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| GET | `/` | Public | Public | Public FAQ |

---

## Services Routes (`/api/services`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| GET | `/` | Public | Public | Public services list |

---

## Companies Routes (`/api/companies`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| GET | `/` | Public | Public | Browse companies |
| GET | `/:id` | Public | Public | View company detail |

---

## Users Routes (`/api/users`)

| Method | Endpoint | Current | Recommended | Reason |
|--------|----------|---------|-------------|--------|
| GET | `/` | Public | Public | Browse users (public for networking) |
| GET | `/:id` | Public | Public | View user profile (public) |

---

## Implementation Steps

### Step 1: Update Job Routes
```bash
File: backend/routes/job.routes.js
Change: authenticateJWT → requireAdmin (for POST, PUT, DELETE)
```

### Step 2: Update Formation Routes
```bash
File: backend/routes/formation.routes.js
Change: authenticateJWT → requireUser (for enroll endpoint)
```

### Step 3: Update Publication Routes
```bash
File: backend/routes/publication.routes.js
Change: authenticateJWT → requireAdmin (for POST, DELETE)
```

### Step 4: Update Notification Routes
```bash
File: backend/routes/notification.routes.js
Change: authenticateJWT → requireUser (for all endpoints)
```

### Step 5: Update Dashboard Routes
```bash
File: backend/routes/dashboard.routes.js
Change: authenticateJWT → requireAdmin
```

### Step 6: Update Upload Routes
```bash
File: backend/routes/upload.routes.js
Change: authenticateJWT → requireUser
```

---

## Benefits of This Mapping

✅ **Authorization clarity** — Routes explicitly state who can access them  
✅ **Security** — User tokens can't access admin routes and vice versa  
✅ **Error clarity** — Users get clear 403 error if they try admin endpoints  
✅ **Future-proof** — Easy to add role-based checks (e.g., `requireRole('admin_offres')`)

---

## Notes

- These are **recommended changes** based on logical role separation
- If your business logic differs, adjust middleware accordingly
- Always test both admin and user tokens against updated routes
- Refer to `AUTH_ARCHITECTURE.md` for detailed security guarantees
