// SUPABASE_CLEANUP_SUMMARY.md

# Supabase Cleanup — Admin Auth Migration Summary

## ✅ COMPLETED: Admin Auth is now Supabase-independent

### What was done:

1. **Backend Admin Routes:**
   - ✅ POST `/api/admin/register` — Uses PostgreSQL + bcrypt + Nodemailer (SMTP)
   - ✅ GET `/api/admin/verify-email?token=...` — PostgreSQL email verification
   - ✅ POST `/api/admin/create` — Super Admin creates other admins

2. **Frontend Admin Components:**
   - ✅ `RegisterForm.tsx` — Uses fetch() to backend API (NOT Supabase)
   - ✅ `Login.tsx` — Uses fetch() to backend API (NOT Supabase)
   - ✅ `Dashboard.tsx` — Displays admin data from localStorage (NOT Supabase)
   - ✅ `verify-success/page.tsx` — NEW page for email verification success

3. **Dependency Cleanup:**
   - ✅ `src/lib/headers.ts` — Removed Supabase import, kept authHeaders() for admin JWT

### Files Still Using Supabase (Non-Admin Features):

These are for **candidate/company auth** and can be cleaned up later if needed:
- `src/hooks/useSupabaseAuth.ts` — Used by candidate registration/login
- `src/hooks/useSupabaseUser.ts` — Used by candidate profile
- `src/lib/supabase.ts` — Supabase client initialization
- `src/pages/AuthCallback.tsx` — OAuth callback (candidate/company)
- Various backend webhooks and services

**These are INTENTIONALLY LEFT ALONE** because:
- They don't affect admin auth
- Migrating them would require major changes to candidate/company flows
- Admin auth is completely separated

### Database Schema (PostgreSQL):

```sql
-- Admin users table (via backend initialization)
CREATE TABLE IF NOT EXISTS admins (
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

### Environment Variables (Required):

Backend `.env`:
```
DATABASE_URL=postgresql://emploip01_admin:PASSWORD@localhost:5432/emploiplus_db
SMTP_HOST=mail.votre-serveur.com
SMTP_PORT=587
SMTP_USER=admin@emploiplus-group.com
SMTP_PASS=YourSMTPPassword
EMAIL_FROM=admin@emploiplus-group.com
BACKEND_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

### Architecture:

```
Admin Auth Flow (PostgreSQL-based):
┌─────────────────┐
│  Admin Browser  │
└────────┬────────┘
         │
    fetch("/api/admin/register")
         │
         ▼
┌──────────────────────┐
│  Node.js/Express     │
│  /api/admin/register │
└────────┬─────────────┘
         │
    ├─ Hash password (bcrypt)
    ├─ Generate verification token
    ├─ Insert into admins table
    ├─ Send verification email (SMTP)
         │
         ▼
    PostgreSQL
    admins table
```

### Regular User Auth Flow (Still Supabase):
```
Candidate/Company Browser
    │
    ├─ supabase.auth.signUp
    └─ supabase.auth.signIn
    │
    ▼
Supabase Auth Service
(Unchanged - not affected by admin migration)
```

### Testing the Admin Auth Flow:

1. **Create First Admin (Super Admin):**
   ```bash
   curl -X POST 'http://localhost:4000/api/admin/register' \
     -H 'Content-Type: application/json' \
     -d '{
       "email":"admin@example.com",
       "password":"SecurePass123",
       "nom":"Dupont",
       "prenom":"Jean",
       "telephone":"+24112345678",
       "pays":"Congo",
       "ville":"Brazzaville",
       "date_naissance":"1980-01-01",
       "avatar_url":"https://ui-avatars.com/api/?name=Jean+Dupont",
       "role":"super_admin"
     }'
   ```

2. **Verify Email:** Check email for verification link and click it
   - Should see `/admin/verify-success` page

3. **Login:**
   ```bash
   curl -X POST 'http://localhost:4000/api/admin/login' \
     -H 'Content-Type: application/json' \
     -d '{"email":"admin@example.com","password":"SecurePass123"}'
   ```

4. **Access Dashboard:**
   - Store returned `token` in localStorage.adminToken
   - Navigate to `/admin`
   - Should see dashboard with admin name and avatar

### Migration Status:

| Feature | Status | Details |
|---------|--------|---------|
| Admin Registration | ✅ DONE | Uses PostgreSQL + Node.js |
| Admin Login | ✅ DONE | Uses PostgreSQL + JWT |
| Email Verification | ✅ DONE | Token-based, SMTP delivery |
| Admin Dashboard | ✅ DONE | Displays from localStorage |
| Candidate Registration | 🔄 UNCHANGED | Still uses Supabase |
| Candidate Login | 🔄 UNCHANGED | Still uses Supabase |
| Company Registration | 🔄 UNCHANGED | Still uses Supabase |
| Company Login | 🔄 UNCHANGED | Still uses Supabase |

### Next Steps:

1. Deploy updated backend to VPS with new routes
2. Test admin registration flow end-to-end
3. (Optional) Migrate candidate/company auth to PostgreSQL (future effort)
4. (Optional) Clean up remaining Supabase imports (no impact on admin)

### Key Differences from Supabase Auth:

| Aspect | Supabase | PostgreSQL (Admin) |
|--------|----------|-------------------|
| Storage | Supabase database | PostgreSQL on VPS |
| Password | Hashed by Supabase | Hashed by bcrypt in Node.js |
| JWT | Issued by Supabase | Issued by Node.js (signed with JWT_SECRET) |
| Email Verification | Supabase email service | SMTP (via Node.js Nodemailer) |
| Token Header | `Authorization: Bearer {token}` | `Authorization: Bearer {token}` |

---

**Summary:** Admin authentication is now completely independent of Supabase and uses a dedicated PostgreSQL + Node.js backend. Candidate and company authentication remains unchanged (Supabase-based) and can be migrated separately if needed.
