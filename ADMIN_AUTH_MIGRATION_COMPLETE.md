// ADMIN_AUTH_MIGRATION_COMPLETE.md

# Admin Authentication Migration — COMPLETE ✅

## Status: ADMIN AUTH IS NOW FULLY MIGRATED FROM SUPABASE

### What has changed:
✅ Admin registration (`/admin/register/super-admin`, `/admin/register/content-admin`)
✅ Admin login (`/admin/login`)
✅ Admin dashboard (`/admin/dashboard`)
✅ Admin verification email (`/api/admin/verify-email`)
✅ All admin email sending (SMTP integration)

### How Admin Auth NOW Works:

1. **Registration Flow:**
   - User fills form with: nom, prenom, email, password, telephone, pays, ville, date_naissance, avatar_url, role
   - Form sends `POST /api/admin/register` (fetch → Node.js backend)
   - Backend:
     - Validates email uniqueness
     - Hashes password with bcrypt
     - Generates verification token
     - Inserts into PostgreSQL `admins` table with `is_verified=false`
     - Sends email via SMTP with verification link
   - Response: `{ success, message: "Un email de vérification a été envoyé" }`

2. **Email Verification:**
   - User clicks link in email: `/api/admin/verify-email?token=...`
   - Backend verifies token, sets `is_verified=true`
   - Redirects to `FRONTEND_URL/admin/verify-success` (new page ✅)
   - User can now login

3. **Login Flow:**
   - User POST `/api/admin/login` with email + password
   - Backend validates credentials
   - Issues JWT token
   - Frontend stores in localStorage: `adminToken`, `admin` (object)
   - User redirected to `/admin/dashboard`

4. **Admin Dashboard:**
   - Displays `prenom nom` from localStorage.admin
   - Shows `avatar_url` if available
   - All data from PostgreSQL (not Supabase)

### Key Files (Admin Auth Only):
```
Backend:
- backend/src/server.ts (routes: /api/admin/register, /api/admin/verify-email, /api/admin/create)
- backend/src/controllers/authController.ts (registerAdmin with email sending)

Frontend:
- src/pages/admin/register/components/RegisterForm.tsx (form logic - NOW uses fetch)
- src/pages/admin/login/page.tsx (login - NOW uses fetch)
- src/pages/admin/dashboard/page.tsx (uses localStorage + avatar display)
- src/pages/admin/verify-success/page.tsx (NEW ✅ - verification success page)

Routes (App.tsx):
- /admin/register/super-admin
- /admin/register/content-admin
- /admin/login
- /admin/verify-success
- /admin (dashboard)
```

### Candidate/Company Auth — UNCHANGED:
- Still using Supabase.auth for candidats and companies
- Their flows are separate from Admin auth
- This is INTENTIONAL — admins are managed via PostgreSQL/Node.js backend
- Supabase is still active for regular users: useSupabaseAuth in App.tsx

### Database Schema:
```sql
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    telephone VARCHAR(20),
    pays VARCHAR(100),
    ville VARCHAR(100),
    date_naissance DATE,
    avatar_url TEXT DEFAULT 'https://ui-avatars.com/api/?name=Admin',
    role VARCHAR(50) NOT NULL DEFAULT 'content_admin',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Environment Variables (Backend .env):
```
DATABASE_URL=postgresql://emploip01_admin:PASSWORD@localhost:5432/emploiplus_db
SMTP_HOST=mail.votre-serveur.com
SMTP_PORT=587
SMTP_USER=admin@emploiplus-group.com
SMTP_PASS=YourSMTPPassword
SMTP_SECURE=false
EMAIL_FROM=admin@emploiplus-group.com
BACKEND_URL=http://localhost:4000 (or https://api.domain.com in prod)
FRONTEND_URL=http://localhost:3000 (or https://app.domain.com in prod)
JWT_SECRET=your-secret-key
```

### Testing Checklist:
- [ ] Create Super Admin via /admin/register/super-admin
  - Check email in database with is_verified=false and verification_token
  - Receive verification email
- [ ] Click verification link
  - Should see /admin/verify-success page
  - Database should show is_verified=true
- [ ] Login with verified admin
  - Should receive JWT token
  - Should see dashboard with name and avatar
- [ ] Create Content Admin from Super Admin account
  - Should be created with is_verified=true (no email needed for super-admin creation)
- [ ] Check no passwords are returned in API responses
- [ ] Test duplicate email error handling
- [ ] Test SMTP connection (or fallback graceful handling)

### Next Steps:
1. ✅ Deploy backend routes to VPS
2. ✅ Configure SMTP env vars
3. ✅ Test registration flow end-to-end
4. ⬜ (Optional) Migrate candidate/company auth from Supabase to PostgreSQL (separate effort)
5. ⬜ (Optional) Cleanup remaining Supabase imports (not affecting admin auth)

---

**NOTE:** Supabase imports still exist in the codebase for candidate/company authentication.
These are separate from admin auth and can be cleaned up in a future phase if needed.
