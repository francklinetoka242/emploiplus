# Refactorisation Complète : Suppression Supabase & Migration Vers API Locale

## ✅ Résumé des Modifications

### 1. **Backend - Nouvelles Routes & Services**

#### Fichiers Créés :
- `backend/src/services/adminAuthService.ts` - Service d'authentification complet avec:
  - Registration avec email verification
  - Login avec verification status check
  - Hash de mot de passe avec bcryptjs
  - Génération de tokens JWT (7 jours validité)
  - Email de confirmation via nodemailer
  - Support du role-based creation (super_admin crée d'autres admins)

- `backend/src/routes/admin-auth.ts` - Routes REST:
  - `POST /api/admin/register` - Inscription super admin (pas besoin de token)
  - `GET /api/admin/verify-email?token=...` - Vérification d'email
  - `POST /api/admin/login` - Connexion
  - `POST /api/admin/create` - Création d'admin par super admin (authentifié)

- `backend/migrations/002-add-admin-profile-fields.ts` - Migration base de données

#### Fichiers Modifiés :
- `backend/src/server.ts` - Import et montage des routes admin
- `backend/.env` - Ajout variables SMTP_PASSWORD, SMTP_SECURE, JWT_SECRET

### 2. **Frontend - Intégration API**

#### Fichiers Créés :
- `src/pages/admin/verify-email/page.tsx` - Page de confirmation d'email avec:
  - Extraction du token depuis URL
  - Appel API GET /api/admin/verify-email
  - Redirection automatique après vérification

#### Fichiers Modifiés :
- `src/App.tsx` - Ajout route `/admin/verify-email`
- `.env.local` - Ajout `VITE_API_BASE_URL=http://localhost:5000`

### 3. **Suppression Complète Supabase**

#### Frontend - Imports Supprimés :
- ✅ `src/lib/supabase.ts` - **FICHIER SUPPRIMÉ**
- ✅ `src/lib/uploadProfileFile.ts` - Imports Supabase éliminés
- ✅ `src/hooks/useSupabaseAuth.ts` - Type Session remplacé
- ✅ `src/app/auth/callback/route.ts` - Import Supabase éliminé
- ✅ `src/services/optimizedNewsfeedService.ts` - Imports Supabase éliminés
- ✅ `vite.config.ts` - Suppression de @supabase/supabase-js des optimizeDeps

#### Backend - Imports Supprimés :
- ✅ `backend/src/routes/jobWebhook.ts`
- ✅ `backend/src/routes/webhooks.ts`
- ✅ `backend/src/routes/webhook-microservices.ts`
- ✅ `backend/src/services/microserviceQueues.ts`
- ✅ `backend/src/services/pushNotificationService.ts`
- ✅ `backend/src/services/notificationQueue.ts`
- ✅ `backend/src/utils/socket.ts`
- ✅ `backend/src/integrations/socketio.ts`
- ✅ `backend/webhooks/subscriptionWebhook.js`

#### Scripts Supprimés :
- ✅ `scripts/test-supabase-connection.js`
- ✅ `scripts/test-suite.js`
- ✅ `scripts/test-auth-flows.js`

#### Package.json - Dépendance Supprimée :
- ✅ `backend/package.json` - Suppression `@supabase/supabase-js`

---

## 🔐 Données Utilisateur Admin (Champs Obligatoires)

Les formulaires d'inscription (SuperAdminRegister, ContentAdminRegister) envoient tous ces champs :

```typescript
{
  email: string;              // Format: email valide
  password: string;           // Min 6 caractères, hashé avec bcrypt10
  nom: string;                // Nom de famille
  prenom: string;             // Prénom
  telephone?: string;         // Numéro de téléphone
  pays?: string;              // Pays de résidence
  ville?: string;             // Ville
  date_naissance?: string;    // Format: YYYY-MM-DD
  avatar_url?: string;        // URL de l'image de profil
  role: "super_admin" | "content_admin" | "admin_offres" | "admin_users";
}
```

---

## 🛠️ Variables d'Environnement

### Frontend (.env.local)
```dotenv
VITE_API_BASE_URL=http://localhost:5000
```

**Utilisation dans le code :**
```typescript
import { buildApiUrl } from '@/lib/headers';
const apiUrl = buildApiUrl("/api/admin/register");
```

### Backend (.env)
```dotenv
# Database
DATABASE_URL=postgresql://...

# Email (SMTP)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=admin@example.com
SMTP_PASSWORD=your_password
SMTP_FROM="Admin <admin@example.com>"
SMTP_SECURE=false

# Authentication
JWT_SECRET=emploi_connect_congo_secret_2025
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Workflow d'Authentification

### 1. Inscription Super Admin (Première fois)
```mermaid
graph LR
    A[SuperAdminRegister.tsx] -->|POST /api/admin/register| B[Backend]
    B -->|Hash Password| C[bcryptjs]
    B -->|Generate Token| D[Crypto.randomBytes]
    B -->|Insert Admin| E[PostgreSQL]
    B -->|Send Email| F[Nodemailer]
    F -->|Email Link| G[/admin/verify-email?token=abc123]
    G -->|Click Link| H[Frontend Verify Page]
    H -->|GET /api/admin/verify-email?token=abc123| B
    B -->|Update is_verified=true| E
    B -->|Redirect| I[/admin/login]
```

### 2. Connexion
```
POST /api/admin/login
{
  email: "admin@example.com",
  password: "password123"
}

Response:
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIs...",
  admin: { id, email, nom, prenom, role, ... }
}
```

### 3. Création d'Admin par Super Admin
```
POST /api/admin/create
Headers: Authorization: Bearer <adminToken>
Body: { email, password, nom, prenom, role, ... }

Requiert : 
- Token JWT valide (adminToken dans localStorage)
- Role = "super_admin"
```

---

## 📝 Migration Base de Données

Exécutez cette migration pour ajouter les colonnes :

```bash
cd backend
npx tsx migrations/002-add-admin-profile-fields.ts
```

**Colonnes Ajoutées à la Table `admins` :**
- `nom` TEXT
- `prenom` TEXT
- `telephone` TEXT
- `pays` TEXT
- `ville` TEXT
- `date_naissance` DATE
- `avatar_url` TEXT
- `verification_token` TEXT UNIQUE
- `is_verified` BOOLEAN DEFAULT false
- `verification_token_expires_at` TIMESTAMP

---

## 🧪 Guide de Test

### Test 1 : Inscription Super Admin
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "super@example.com",
    "password": "password123",
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+243970123456",
    "pays": "République Démocratique du Congo",
    "ville": "Kinshasa",
    "date_naissance": "1990-05-15",
    "role": "super_admin"
  }'
```

**Réponse Attendue :**
```json
{
  "success": true,
  "message": "Admin créé! Un email de confirmation a été envoyé.",
  "admin": {
    "id": 1,
    "email": "super@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "super_admin"
  }
}
```

### Test 2 : Vérification Email
```bash
# Récupérer le token depuis l'email reçu
curl -X GET "http://localhost:5000/api/admin/verify-email?token=<verification_token>"
```

### Test 3 : Connexion
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "super@example.com",
    "password": "password123"
  }'
```

### Test 4 : Création Admin par Super Admin
```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <adminToken>" \
  -d '{
    "email": "admin2@example.com",
    "password": "password456",
    "nom": "Martin",
    "prenom": "Pierre",
    "role": "content_admin"
  }'
```

---

## 📍 Frontend - Stockage du Token

**Après connexion réussie :**
```typescript
const response = await fetch(buildApiUrl("/api/admin/login"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(credentials)
});

const data = await response.json();
localStorage.setItem("adminToken", data.token);
```

**Pour les requêtes authentifiées :**
```typescript
import { authHeaders } from '@/lib/headers';

const headers = authHeaders('application/json', 'adminToken');
// Résultat: { "Content-Type": "application/json", "Authorization": "Bearer <token>" }
```

---

## ⚠️ Points Importants

### 1. Email Verification
- Token valable 24 heures
- Admin ne peut se connecter que si `is_verified = true`
- Token généré avec `crypto.randomBytes(32).toString('hex')`

### 2. Sécurité Mot de Passe
- Minimum 6 caractères requis
- Hashé avec bcryptjs (salt rounds: 10)
- Jamais stocké en clair
- Comparaison avec `bcryptjs.compareSync()`

### 3. JWT Tokens
- Valables 7 jours
- Secret : `JWT_SECRET` depuis `.env`
- Payload : `{ id, role, email }`
- Utilisé pour authenticateToken → isSuperAdmin middleware

### 4. CORS Configuration
- Frontend peut appeler backend sur `http://localhost:5000`
- Headers autorisés : Content-Type, Authorization
- Credentials supportées

---

## 🔄 Migration depuis Supabase

### Avant (Supabase)
```typescript
import { createClient } from '@supabase/supabase-js';
const { data, error } = await supabase.auth.signUp({ email, password });
```

### Après (API Locale)
```typescript
const response = await fetch(buildApiUrl("/api/admin/register"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, nom, prenom, role })
});
```

---

## 📦 Dépendances Utilisées

**Backend :**
- `bcryptjs` - Hash de mots de passe
- `jsonwebtoken` - Génération/vérification JWT
- `nodemailer` - Envoi d'emails
- `pg` - Client PostgreSQL
- `express` - Framework web

**Frontend :**
- `react` - Framework UI
- `react-router-dom` - Routage
- `sonner` - Toast notifications

---

## ✨ Architecture Finale

```
Frontend (Vite + React)
    ↓
buildApiUrl + fetch
    ↓
http://localhost:5000/api/admin/*
    ↓
Backend (Express + TypeScript)
    ↓
adminAuthService (Business Logic)
    ↓
PostgreSQL (Data Storage)
    ↓
Email (Nodemailer)
```

---

**Date :** 18 février 2026
**Version :** 1.0.0 - Authentification Admin Complète
