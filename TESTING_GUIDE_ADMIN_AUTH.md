# 🧪 TESTING GUIDE - Admin Authentication System

**Last Updated:** 18 février 2026  
**Test Scope:** Complete Auth Flow (Register → Verify → Login)

---

## 📋 Pre-Test Checklist

- [ ] Backend `.env` configuré (SMTP variables)
- [ ] Frontend `.env.local` avec `VITE_API_BASE_URL`
- [ ] Migration BD exécutée
- [ ] Deux terminaux ouverts (backend & frontend)
- [ ] Postman/Cursor HTTP Client disponible (optionnel)

---

## 🚀 Test 1: Backend Server Startup

### Terminal 1 - Backend
```bash
cd backend
npm run build
npm run dev
```

**Expected Output:**
```
> tsx watch src/server.ts
[...watching for changes...]
💼 Server running on http://localhost:5000
✅ Connected to PostgreSQL database
Listening on port 5000
```

### Verification
```bash
# Terminal 3
curl http://localhost:5000/api/admin/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

**Expected:** Should not get "ECONNREFUSED" error

---

## 🚀 Test 2: Frontend Dev Server

### Terminal 2 - Frontend
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-
npm install
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Quick Verification
Open http://localhost:5173 in browser → Should load home page

---

## 🔐 Test 3: Database Migration

```bash
cd backend
npx tsx migrations/002-add-admin-profile-fields.ts
```

**Expected Output:**
```
Running migration: Add profile fields to admins table...
✅ Migration completed successfully!
```

### Verify in Database
```bash
# Terminal 3
psql postgresql://emploip01_admin:4CS5dw2/JUsXHbPoL@localhost:5433/emploiplus_db -c "\d admins"
```

**Look for new columns:**
- nom
- prenom
- telephone
- pays
- ville
- date_naissance
- avatar_url
- verification_token
- is_verified
- verification_token_expires_at

---

## 🧑‍💼 Test 4: Admin Registration Flow

### Step 1: Navigate to Registration Page
```
Open: http://localhost:5173/admin/register/super-admin
```

### Step 2: Fill Registration Form
```
Email:         test_admin_001@emploi-connect.test
Password:      MySecurePass123 (min 6 chars)
Nom:           Dupont
Prénom:        Jean
Téléphone:     +243970123456
Pays:          République Démocratique du Congo
Ville:         Kinshasa
Date de Naissance: 1990-05-15
Avatar URL:    (leave empty for now)
```

### Step 3: Submit Form
Click "Créer Super Admin" button

### Expected Response
```
✅ Toast notification: "Super Admin créé! Un email de validation a été envoyé."
Browser stays on page (no redirect yet)
```

### Backend Logs Check
```
✅ [Auth] registerAdmin: Processing test_admin_001@emploi-connect.test
✅ [Password] Hashed with bcryptjs (rounds: 10)
✅ [DB] Admin inserted with verification_token
✅ [Email] Attempting to send verification email
✅ [Mailer] Email sent successfully to test_admin_001@emploi-connect.test
```

### Database Verification
```sql
SELECT 
  id, 
  email, 
  nom, 
  prenom, 
  is_verified, 
  verification_token IS NOT NULL as has_token,
  verification_token_expires_at > NOW() as token_valid
FROM admins 
WHERE email = 'test_admin_001@emploi-connect.test';
```

**Expected Result:**
```
 id | email                              | nom    | prenom | is_verified | has_token | token_valid
----+------------------------------------+--------+--------+-------------+-----------+------------
  1 | test_admin_001@emploi-connect.test | Dupont | Jean   | f           | t         | t
```

---

## 📧 Test 5: Email Verification

### Option A: Get Token from Backend Logs
```
Look for: "Verification URL: http://localhost:5173/admin/verify-email?token=abc123def456..."
Copy everything after token=
```

### Option B: Get Token from Database
```sql
SELECT verification_token 
FROM admins 
WHERE email = 'test_admin_001@emploi-connect.test';
```

### Step 1: Navigate to Verification Page
```
http://localhost:5173/admin/verify-email?token=YOUR_TOKEN_HERE
```

### Step 2: Wait for Page Load
- Should show spinner for ~1 second
- Then show success message: "✓ Email confirmé!"

### Step 3: Auto-Redirect
- After 2 seconds, redirects to `/admin/login`

### Expected Behavior
```
✅ Spinner spinning
✅ "Email confirmé avec succès!" message
✅ Redirect countdown
✅ Auto-redirect to /admin/login
```

### Backend Logs
```
✅ [Auth] verifyEmailToken: Processing verification for user
✅ [DB] Update is_verified=true WHERE id=...
✅ [DB] Clear verification_token
```

### Database Verification
```sql
SELECT 
  id, 
  email, 
  is_verified, 
  verification_token
FROM admins 
WHERE email = 'test_admin_001@emploi-connect.test';
```

**Expected:**
```
 id | email                              | is_verified | verification_token
----+------------------------------------+-------------+--------------------
  1 | test_admin_001@emploi-connect.test | t           | (null)
```

---

## 🔑 Test 6: Admin Login

### After Auto-Redirect (or Manual)
```
URL: http://localhost:5173/admin/login
```

### Step 1: Enter Credentials
```
Email:     test_admin_001@emploi-connect.test
Password:  MySecurePass123
```

### Step 2: Click "Se Connecter"

### Expected Response
```
✅ Toast: "Connexion réussie"
✅ localStorage contains "adminToken" 
✅ Redirect to /admin (dashboard)
```

### Backend Logs
```
✅ [Auth] loginAdmin: Retrieved admin from DB
✅ [Password] bcrypt.compareSync: Password matches
✅ [JWT] Generated token with 7d expiry
✅ [Response] Returning token + admin data
```

### Verify JWT Token
```javascript
// In browser console:
const token = localStorage.getItem('adminToken');
console.log(token);

// Should output JWT like:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0M...
```

---

## 👥 Test 7: Super Admin Creating Another Admin

### As Super Admin (from Test 6)
```
URL: http://localhost:5173/admin/register/content-admin
```

### Step 1: Fill "Create Content Admin" Form
```
Email:         content_admin_001@emploi-connect.test
Password:      ContentPass123
Nom:           Martin
Prénom:        Pierre
Téléphone:     +243970654321
Pays:          Congo
Ville:         Lubumbashi
Date de Naissance: 1995-03-20
```

### Step 2: Click "Créer Admin Offres"

### Expected Response
```
✅ Toast: "Admin Offres créé avec succès!"
✅ Redirect to /admin
```

### Backend Should Log
```
✅ [Auth] authenticateToken: token validated
✅ [Auth] isSuperAdmin: role=super_admin ✓
✅ [Auth] createAdminBySuperAdmin: Processing new admin
✅ [Email] Verification email sent
```

### Database Verification
```sql
SELECT 
  id, 
  email, 
  nom, 
  prenom, 
  role, 
  is_verified
FROM admins 
WHERE email LIKE 'content_admin%';
```

**Expected:**
```
 id | email                            | nom    | prenom | role         | is_verified
----+----------------------------------+--------+--------+--------------+-------------
  2 | content_admin_001@emploi-connect | Martin | Pierre | content_admin| f
```

---

## ❌ Test 8: Error Scenarios

### Scenario A: Invalid Email Format
**Input:** `notanemail` (no @)  
**Expected:** Error: "Format email invalide"

### Scenario B: Duplicate Email
**Input:** Same email as registered  
**Expected:** Error: "Cet email est déjà utilisé"

### Scenario C: Short Password
**Input:** Password: `abc` (< 6 chars)  
**Expected:** Error: "Le mot de passe doit contenir au moins 6 caractères"

### Scenario D: Wrong Login Password
**Input:** Email valid, Password wrong  
**Expected:** Error: "Email ou mot de passe incorrect"

### Scenario E: Unverified Email Login
**Input:** Email valid but not verified yet  
**Expected:** Error: "Veuillez vérifier votre email avant de vous connecter"

### Scenario F: Creating Admin Without Super Admin Token
**POST /api/admin/create** without auth header  
**Expected:** 401 Unauthorized "Authentification requise"

### Scenario G: Non-Super Admin Creating Admin
**As:** Content Admin  
**POST /api/admin/create**  
**Expected:** 403 Forbidden "Accès super_admin requis"

---

## 🧹 Test 9: Cleanup & Reset

### Delete Test Admin (for re-testing)
```bash
cd backend
psql $DATABASE_URL -c "DELETE FROM admins WHERE email LIKE 'test_%' OR email LIKE 'content_admin_%';"
```

### Verify Deletion
```sql
SELECT COUNT(*) FROM admins;
```

---

## 📊 Test Report Template

```
Test Date:     [DATE]
Tester:        [NAME]
Build Version: [GIT_COMMIT]
Database:      [DB_NAME]
Frontend:      http://localhost:5173
Backend:       http://localhost:5000

Test Results:
✅ Test 1: Backend Startup         PASS / FAIL
✅ Test 2: Frontend Startup        PASS / FAIL
✅ Test 3: Database Migration      PASS / FAIL
✅ Test 4: Registration            PASS / FAIL
✅ Test 5: Email Verification      PASS / FAIL
✅ Test 6: Admin Login             PASS / FAIL
✅ Test 7: Create Sub-Admin        PASS / FAIL
✅ Test 8: Error Scenarios         PASS / FAIL

Issues Found:
[List any issues]

Notes:
[Additional observations]
```

---

## 🚨 Debugging Commands

### See All Backend Logs
```bash
cd backend && npm run dev 2>&1 | tee backend.log
```

### MongoDB/PostgreSQL Debug
```sql
-- See all admins
SELECT * FROM admins;

-- See verification tokens
SELECT email, verification_token, verification_token_expires_at FROM admins;

-- See token expiry status
SELECT email, verification_token_expires_at > NOW() as valid FROM admins;
```

### frontend Network Log
```javascript
// In Browser Console:
localStorage.getItem('adminToken')      // See JWT
fetch('http://localhost:5000/api/admin/login')
  .then(r => r.json())
  .then(d => console.log(d))             // See API response
```

### Check SMTP Configuration
```bash
# Send test email via nodemailer
cd backend && npx tsx -e "
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({...});
transporter.verify((err, success) => {
  console.log(err || success ? '✅ SMTP OK' : '❌ SMTP Failed');
});
"
```

---

## ✅ Full Test Checklist

- [ ] Backend server starts without errors
- [ ] Frontend dev server loads
- [ ] Database migration completes
- [ ] Super Admin registers successfully
- [ ] Verification email generated
- [ ] Email link verifies token
- [ ] Admin can login after verification
- [ ] Super Admin can create Content Admin
- [ ] Error cases handled gracefully
- [ ] Database data correct for each step
- [ ] Tokens generate and validate
- [ ] No console errors in browser/terminal

---

## 🎉 Success Criteria

✅ **All tests pass** without modifications required  
✅ **No console errors** in browser or terminal  
✅ **Data flows** correctly through all layers  
✅ **Emails send** without failures  
✅ **Tokens work** for 7 days  
✅ **Error messages** are clear and actionable  

---

**Any issues? Check QUICKSTART_ADMIN_AUTH.md for troubleshooting**

Good luck with testing! 🚀
