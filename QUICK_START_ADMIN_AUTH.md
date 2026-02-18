// QUICK_START_ADMIN_AUTH.md

# Quick Start: Admin Authentication Migration ⚡

## 1. Backend Setup (VPS)

### Prerequisites:
- PostgreSQL 16 running on VPS
- Database `emploiplus_db` and user `emploip01_admin` already configured ✅
- Node.js 20+ installed

### Step 1: Configure Backend Environment

Edit `.env` in the backend directory:

```env
# Database
DATABASE_URL=postgresql://emploip01_admin:YOUR_PASSWORD@localhost:5432/emploiplus_db

# SMTP Configuration (Email Server)
SMTP_HOST=mail.votre-serveur.com
SMTP_PORT=587
SMTP_USER=admin@emploiplus-group.com
SMTP_PASS=YourSMTPPassword
SMTP_SECURE=false
EMAIL_FROM=admin@emploiplus-group.com

# URLs
BACKEND_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this

# Node Environment
NODE_ENV=development
PORT=4000
```

### Step 2: Start Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
🚀 Server is running on port 4000
✅ Essential DB schema ensured
```

### Step 3: Verify Database Tables

The backend will automatically create the `admins` table on startup. You can verify:

```bash
psql -U emploip01_admin -d emploiplus_db -c "\dt admins"
```

Should output:
```
       List of relations
 Schema | Name  | Type  | Owner
--------+-------+-------+----------
 public | admins | table | emploip01_admin
```

---

## 2. Frontend Setup (Local)

### Step 1: Ensure API URL is Set

In frontend `.env` (or use default):
```env
VITE_API_BASE_URL=http://localhost:4000
```

### Step 2: Start Frontend

```bash
npm run dev
```

---

## 3. Test Admin Authentication Flow

### Test 1: Create First Admin (Super Admin)

1. Navigate to: `http://localhost:3000/admin/register/super-admin`
2. Fill form:
   - **Nom:** Dupont
   - **Prénom:** Jean
   - **Email:** admin@example.com
   - **Mot de passe:** SecurePass123
   - **Téléphone:** +24143333333
   - **Pays:** Congo
   - **Ville:** Brazzaville
   - **Date de naissance:** 1990-01-15
   - **Avatar URL:** (leave empty for default)

3. Click "Créer Super Admin"
4. Expected: Toast message → "Super Admin créé ! Un email de validation a été envoyé."
5. Redirected to → `/admin/login`

### Test 2: Verify Email

1. Check your email (configured SMTP)
2. Look for subject: "Confirmez votre adresse email — Emploi Plus"
3. Click the verification link in email
4. Expected: `http://localhost:3000/admin/verify-success` page with countdown
5. Auto-redirect to `/admin/login` after 5 seconds

### Test 3: Login

1. On login page, fill:
   - **Email:** admin@example.com
   - **Mot de passe:** SecurePass123
2. Click "Se connecter"
3. Expected: Redirected to `/admin/dashboard`
4. Should see: "Bienvenue Jean Dupont • SUPER_ADMIN" with avatar

### Test 4: Database Verification

```bash
psql -U emploip01_admin -d emploiplus_db -c "SELECT id, nom, prenom, email, is_verified, role FROM admins;"
```

Expected output:
```
 id |   nom   | prenom |      email      | is_verified |   role
----+---------+--------+-----------------+-------------+-------------
  1 | Dupont  | Jean   | admin@example.com | t         | super_admin
```

### Test 5: Create Content Admin (from Super Admin account)

1. Logged in as Super Admin
2. Navigate to: `/admin/register/content-admin`
3. Fill form with different email and create
4. Expected: "Admin Offres créé avec succès !"
5. New admin created with `is_verified=true` (no email needed for admin creations)

### Test 6: Try Duplicate Email

1. Try to create another admin with: admin@example.com
2. Expected: Error toast → "Cet email est déjà utilisé"
3. Form not submitted

---

## 4. Troubleshooting

### Issue: "Serveur injoignable" error

**Solution:**
- Verify backend is running: `http://localhost:4000`
- Check backend `.env` file
- Check CORS is enabled in backend (should be by default)

### Issue: Email not received

**Solution:**
- Verify SMTP credentials in `.env`
- Check backend logs for: "Error sending verification email"
- Test SMTP manually:
  ```bash
  curl -X POST http://localhost:4000/api/test-email -H "Content-Type: application/json" -d '{"email":"your@email.com"}'
  ```

### Issue: "Token invalid" on verify link

**Solution:**
- Token expires after generation
- Ensure verification link is clicked within reasonable time
- Check database for: `verification_token` matching the link

### Issue: Login fails with "Identifiants incorrects"

**Solution:**
- Verify email and password are correct
- Check that `is_verified=true` in database
- Verify password was hashed correctly

---

## 5. Production Deployment Checklist

- [ ] Update `.env` with production database URL
- [ ] Update `.env` with production SMTP credentials
- [ ] Update `BACKEND_URL` and `FRONTEND_URL` to production domains
- [ ] Change `JWT_SECRET` to a strong random key
- [ ] Set `NODE_ENV=production`
- [ ] Test full flow in production
- [ ] Monitor email delivery (check spam folder)
- [ ] Backup database before deploying

---

## 6. API Endpoints Reference

### Create Admin (Registration)
```bash
POST /api/admin/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "SecurePass123",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+24143333333",
  "pays": "Congo",
  "ville": "Brazzaville",
  "date_naissance": "1990-01-15",
  "avatar_url": "https://ui-avatars.com/api/?name=Jean+Dupont",
  "role": "super_admin"
}

Response:
{
  "success": true,
  "message": "Admin créé. Un email de vérification a été envoyé.",
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "super_admin",
    "created_at": "2026-02-18T10:00:00.000Z"
  }
}
```

### Verify Email
```bash
GET /api/admin/verify-email?token=abc123def456...
```
Redirects to: `{FRONTEND_URL}/admin/verify-success`

### Login
```bash
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "super_admin",
    "created_at": "2026-02-18T10:00:00.000Z"
  }
}
```

### Create Admin (by Super Admin)
```bash
POST /api/admin/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "content@example.com",
  "password": "SecurePass456",
  "nom": "Martin",
  "prenom": "Marie",
  "role": "content_admin"
}

Response:
{
  "success": true,
  "admin": { ... }
}
```

---

## 7. Next: Deploy to Production VPS

When ready to deploy to Ubuntu VPS:

1. Push code to repository
2. SSH into VPS
3. Pull latest code
4. Install dependencies: `npm install`
5. Compile TypeScript: `npm run build`
6. Start with PM2 or systemd:
   ```bash
   pm2 start dist/server.js --name "emploi-api"
   ```
7. Verify running:
   ```bash
   curl http://localhost:4000/api/admin/login
   ```

---

**Status:** ✅ Admin auth migration complete and ready for testing!
