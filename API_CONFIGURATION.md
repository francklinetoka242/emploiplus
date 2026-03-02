# API Configuration Summary - Emploi+ Platform

## ✅ Status: Formations et Services API Configurés

Date: 2 Mars 2026
Backend: Node.js + Express + PostgreSQL
Frontend: React + TypeScript + Vite
Deployment: VPS (emploiplus-group.com)

---

## 📋 FORMATIONS API

### Public Endpoints
- `GET /api/formations` - Récupérer toutes les formations (paginées, publiées par défaut)
- `GET /api/formations/:id` - Récupérer une formation par ID
- `POST /api/formations/:id/enroll` - Inscription utilisateur à une formation (authentifié)

### Admin Endpoints
- `POST /api/formations` - Créer une formation (super_admin)
- `PUT /api/formations/:id` - Modifier une formation (super_admin)
- `DELETE /api/formations/:id` - Supprimer une formation (super_admin)
- `PATCH /api/formations/:id/publish` - Publier/dépublier une formation (super_admin)

**Montage**: `/api/admin/formations` → Same routes with auth protection

---

## 📋 CATALOGUES & SERVICES API

### Service Catalogs (Catégories)

#### Public Endpoints
- `GET /api/services/catalogs` - Récupérer tous les catalogues (paginés, publiés par défaut)
- `GET /api/services/catalogs/:id` - Récupérer un catalogue par ID

#### Admin Endpoints
- `POST /api/services/catalogs` - Créer un catalogue (super_admin)
- `PUT /api/services/catalogs/:id` - Modifier un catalogue (super_admin)
- `DELETE /api/services/catalogs/:id` - Supprimer un catalogue (super_admin)

**Montage Admin**:
- `/api/admin/services/catalogs` → Same catalog routes with auth
- `/api/admin/service-categories` → Alias for backward compatibility with frontend

### Services

#### Public Endpoints
- `GET /api/services` - Récupérer tous les services (paginés, visibles)
  - Query params: `?limit=20&offset=0&catalog_id=1&visible_only=true`
- `GET /api/services/:id` - Récupérer un service par ID
- `GET /api/services/search?q=terme` - Rechercher services par nom/description

#### Admin Endpoints  
- `POST /api/services` - Créer un service (super_admin, requires catalog_id)
- `PUT /api/services/:id` - Modifier un service (super_admin)
- `DELETE /api/services/:id` - Supprimer un service (super_admin)

**Montage Admin**: `/api/admin/services` → Same service routes with auth protection

---

## 🗄️ DATABASE SCHEMA

### Formations Table
```sql
CREATE TABLE formations (
  id INT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  provider VARCHAR(255),
  duration VARCHAR(100),
  level VARCHAR(50),
  category VARCHAR(100),
  deadline_date TIMESTAMP,
  certification VARCHAR(255),
  price NUMERIC(12,2),
  published BOOLEAN DEFAULT true,
  is_closed BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Services Catalog Table
```sql
CREATE TABLE services_catalog (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  category_id BIGINT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Services Table  
```sql
CREATE TABLE services (
  id INT PRIMARY KEY,
  catalog_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  rating NUMERIC(2,1) CHECK (rating >= 1 AND rating <= 5),
  is_promo BOOLEAN DEFAULT false,
  promo_text VARCHAR(255),
  is_visible BOOLEAN DEFAULT true,
  image_url TEXT,
  brochure_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Required Roles
- **super_admin**: Full access to create/update/delete all resources
- **admin_offres**: Can manage job offers (not applicable to formations/services)
- **authenticated users**: Can view and enroll in formations

### Token Format
- Bearer token in Authorization header
- JWT format: `Authorization: Bearer <token>`

### Middleware Stack
1. `requireAdmin` - Verifies admin token type
2. `requireRoles()` - Checks specific role permissions

---

## 📝 IMPLEMENTATION CHANGES

### Files Created
1. `/backend/models/service-catalog.model.js` - Database operations for service catalogs
2. `/backend/services/service-catalog.service.js` - Business logic for catalogs
3. `/backend/controllers/service-catalog.controller.js` - HTTP handlers for catalogs
4. `/backend/routes/service-catalog.routes.js` - Route definitions for catalogs

### Files Modified
1. `/backend/models/service.model.js` - Updated schema to match actual database structure with catalog_id
2. `/backend/controllers/service.controller.js` - Added CRUD operations (create, update, delete)
3. `/backend/routes/service.routes.js` - Added admin routes for CRUD operations
4. `/backend/services/service.service.js` - Enhanced validation and catalog_id requirement
5. `/backend/server.js` - Registered new routes and aliases

### Route Mounts Configured
```javascript
// Public routes
app.use('/api/formations', formationRoutes);
app.use('/api/services/catalogs', serviceCatalogRoutes);
app.use('/api/services', serviceRoutes);

// Admin-protected routes
app.use('/api/admin/formations', requireAdmin, requireRoles('super_admin'), formationRoutes);
app.use('/api/admin/services/catalogs', requireAdmin, requireRoles('super_admin'), serviceCatalogRoutes);
app.use('/api/admin/service-categories', requireAdmin, requireRoles('super_admin'), serviceCatalogRoutes);
app.use('/api/admin/services', requireAdmin, requireRoles('super_admin'), serviceRoutes);
```

---

## 🧪 TESTING CHECKLIST

### Formation API Tests
- [ ] GET /api/formations - Verify pagination works
- [ ] GET /api/formations/:id - Verify single formation retrieval
- [ ] POST /api/formations (admin) - Test creation with valid data
- [ ] PUT /api/formations/:id (admin) - Test update
- [ ] DELETE /api/formations/:id (admin) - Test deletion
- [ ] PATCH /api/formations/:id/publish (admin) - Test publish/unpublish

### Catalog API Tests
- [ ] GET /api/services/catalogs - Verify public list
- [ ] GET /api/services/catalogs/:id - Verify single catalog
- [ ] POST /api/services/catalogs (admin) - Test catalog creation
- [ ] PUT /api/services/catalogs/:id (admin) - Test catalog update
- [ ] DELETE /api/services/catalogs/:id (admin) - Test catalog deletion

### Service API Tests
- [ ] GET /api/services - Verify service listing with filters
- [ ] GET /api/services/:id - Verify single service
- [ ] GET /api/services/search?q=term - Test search functionality
- [ ] POST /api/services (admin) - Test service creation with catalog_id
- [ ] PUT /api/services/:id (admin) - Test service update
- [ ] DELETE /api/services/:id (admin) - Test service deletion

### Permission Tests
- [ ] Verify unauthenticated access denied for admin routes
- [ ] Verify non-super_admin denied access to admin operations
- [ ] Verify public routes accessible without auth

---

## 🚀 DEPLOYMENT NOTES

- **VPS Configuration**: emploiplus-group.com
- **Database**: PostgreSQL (remote or local)
- **JWT_SECRET**: Must be set in environment
- **CORS_ORIGIN**: Configured in .env
- **API Base**: https://emploiplus-group.com/api

All endpoints are VPS-ready and fully configured for production use.

---


---

## 👥 UTILISATEURS

### Public Endpoints
- `GET /api/users` - Récupérer tous les utilisateurs (paginés).
- `GET /api/users/:id` - Récupérer un utilisateur par ID.

### Admin Endpoints (super_admin)
- `POST /api/users` - Créer un utilisateur.
  - champs: `email`, `username`, `password` (hashé), `role`/`user_type`
- `PUT /api/users/:id` - Mettre à jour un utilisateur.
- `DELETE /api/users/:id` - Supprimer un utilisateur.

**Montage Admin**: `/api/admin/users` → mêmes routes protégées par `requireAdmin` + `super_admin`

## � ADMINISTRATEURS & SYSTÈME

### Admin Management
These endpoints are used by the super‑admin portal to manage other administrators. Calls require a valid admin JWT and **super_admin** role (or equivalent permissions).

- `GET /api/admin/management/admins` ‑ list admins with optional `?status=active|pending|blocked&role=number&search=text&limit&offset`
- `POST /api/admin/management/admins/:id/block` ‑ block an administrator account
- `POST /api/admin/management/admins/:id/unblock` ‑ reactivate a blocked account
- `DELETE /api/admin/management/admins/:id` ‑ remove an admin
- `PUT /api/admin/management/admins/:id/role` ‑ change role level (`{ role_level: 1..5 }`)
- `POST /api/admin/management/admins/:id/resend-invite` ‑ resend verification/invitation
- `GET /api/admin/management/admins/:id/verify-status` ‑ check invitation/token status

#### Exports & Stats
- `GET /api/admin/management/admins/export/stats` ‑ statistics summary for admin export UI
- `GET /api/admin/management/admins/export/json` ‑ export full list as JSON
- `POST /api/admin/management/admins/export/pdf` ‑ export list as PDF (stubbed)
- `POST /api/admin/management/admins/export/excel` ‑ export list as Excel (stubbed)

### Login History / Audit
The system records every administrative login attempt (success/failure) for auditing.
- `GET /api/admin/login-history` ‑ retrieve the audit log, supports `?admin_id=&success=true|false&date_from=&date_to=&limit=&offset=`

---

## �🔔 NOTIFICATIONS UTILISATEUR

Toutes les opérations sont protégées par un token utilisateur.

### User Endpoints
- `GET /api/notifications` - Liste des notifications de l'utilisateur
  - `?limit=20&offset=0`
- `GET /api/notifications/unread-count` - Nombre de notifications non lues.
- `POST /api/notifications/:id/read` - Marquer une notification comme lue.
- `POST /api/notifications/read-all` - Marquer toutes les notifications comme lues.
- `DELETE /api/notifications/:id` - Supprimer une notification.

### Service Methods (non exposées)
- `createNotification(userId,title,message,type)` - générer une notification.
- `markAllAsRead(user)` - utilitaire interne.

---

**Configuration Date**: 2 Mars 2026  
**Status**: ✅ Ready for Testing & Production
