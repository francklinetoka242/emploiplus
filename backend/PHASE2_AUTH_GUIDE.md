# Phase 2 - Module d'Authentification (Isolation Modulaire)

## 📋 Résumé

La Phase 2 complète l'architecture modulaire isolée en ajoutant un **module d'authentification robuste** qui :

✅ N'interrompt JAMAIS le serveur (isolation totale)  
✅ Valide les credentials via bcryptjs + JWT  
✅ Retourne des erreurs JSON structurées  
✅ Permet à Jobs et Formations de fonctionner même si Auth échoue  
✅ Utilise les middlewares d'erreur global pour la robustesse

---

## 🏗️ Architecture Implémentée

### 1️⃣ **Middlewares de Sécurité** (`src/middlewares/auth.middleware.ts`)

#### `authMiddleware(req, res, next)`
- ✅ Vérifie le JWT dans le header `Authorization: Bearer <token>`
- ✅ Valide et décode le token avec `JWT_SECRET`
- ✅ Ajoute les infos du user à `req.user` (id, email, role)
- ✅ Retourne 401 si le token manque ou est expiré
- ❌ N'interrompt JAMAIS le serveur

```typescript
// Usage dans les routes protégées
router.get('/protected', authMiddleware, asyncHandler(controller));
```

#### `requireRole(...allowedRoles)`
- ✅ Middleware optionnel pour vérifier le rôle de l'utilisateur
- ✅ Retourne 403 si le rôle n'est pas autorisé
- ❌ N'interrompt pas les autres routes

```typescript
// Usage pour restreindre les rôles
router.delete('/admin/users/:id', authMiddleware, requireRole('admin'), asyncHandler(deleteUser));
```

#### `optionalAuthMiddleware(req, res, next)`
- ✅ Ajoute `req.user` si le token est valide
- ✅ Continue sans user si pas de token (utile pour les routes publiques)
- ❌ Jamais d'erreur

---

### 2️⃣ **Contrôleur d'Authentification** (`src/controllers/auth.controller.ts`)

#### `login(req, res)` - POST /api/auth/login

**Requête:**
```json
{
  "email": "admin@emploiplus-group.com",
  "password": "securepassword123"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Authentification réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "123",
      "email": "admin@emploiplus-group.com",
      "role": "admin",
      "first_name": "John",
      "last_name": "Doe"
    },
    "expiresIn": 86400
  }
}
```

**Réponse (401):**
```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect",
  "error": {
    "context": "authController.login.credentials",
    "statusCode": 401
  }
}
```

**Logique:**
1. Validation du email et password
2. Recherche l'admin par email (LOWER pour case-insensitive)
3. Vérifie que le compte n'est pas désactivé
4. Compare le password avec bcryptjs
5. Génère un JWT signé avec `JWT_SECRET`
6. Retourne le token + infos de l'admin

#### `getMe(req, res)` - GET /api/auth/me (Protégé)

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Profil récupéré",
  "data": {
    "id": "123",
    "email": "admin@emploiplus-group.com",
    "role": "admin",
    "first_name": "John",
    "last_name": "Doe",
    "status": "active",
    "created_at": "2026-02-20T..."
  }
}
```

**Réponse (401/404):**
```json
{
  "success": false,
  "message": "Utilisateur non authentifié / Admin non trouvé",
  "error": { ... }
}
```

#### `logout(req, res)` - POST /api/auth/logout (Protégé)

**Réponse (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie",
  "note": "Supprimez le token du localStorage côté client"
}
```

**Note:** Avec les JWT stateless, la déconnexion se fait côté client en supprimant le token.

#### `hashPassword(password)`
- Fonction utilitaire pour hasher un mot de passe avec bcryptjs
- Utilisée lors de la création/modification d'un admin

---

### 3️⃣ **Routes** (`src/routes/auth.routes.ts`)

```typescript
POST   /api/auth/login           // Authentification (public)
GET    /api/auth/me              // Profil (protégé par authMiddleware)
POST   /api/auth/logout          // Déconnexion (protégé par authMiddleware)
```

---

### 4️⃣ **Intégration Centrale** (`src/routes/index.ts`)

```typescript
router.use('/auth', authRouter);       // Module Auth
router.use('/jobs', jobsRouter);       // Module Jobs
router.use('/formations', formationsRouter); // Module Formations
```

**Endpoints disponibles:**
```
GET  /api                      // Info API
GET  /api/health               // Health Check
POST /api/auth/login           // Login
GET  /api/auth/me              // Profil (protégé)
POST /api/auth/logout          // Logout (protégé)
GET  /api/jobs                 // Récupérer les jobs
GET  /api/formations           // Récupérer les formations
```

---

## 🔐 Isolation Modulaire Garantie

| Scénario | Auth | Jobs | Formations | Résultat |
|----------|------|------|------------|----------|
| Table `admins` manque | ❌ 500 erreur structurée | ✅ Fonctionne | ✅ Fonctionne | ✅ Découplage |
| DB indisponible | ❌ 500 erreur structurée | ❌ 500 erreur structurée | ❌ 500 erreur structurée | ✅ Middleware capture tout |
| Token expiré | ❌ 401 Unauthorized | ✅ Accessible en public | ✅ Accessible en public | ✅ Isolation |
| Erreur SQL dans Auth | ❌ Capturée par middleware | ✅ Continue | ✅ Continue | ✅ asyncHandler isolate |

**Clé du succès:**
- ✅ `asyncHandler` wrapper + `CustomError`
- ✅ `errorMiddleware` global capture tout
- ✅ Chaque module enregistré via `router.use()`
- ✅ Pas de `process.exit()` ou `throw` non gérés

---

## 🔑 Variables d'Environnement Requises

```bash
# JWT
JWT_SECRET="e!@63w*ploi_cw*onn6hgw44w42congw*o_5876w*5"  # ✅ Déjà configuré
JWT_EXPIRES_IN=86400  # Optionnel (24h par défaut)

# Bcrypt
BCRYPT_SALT_ROUNDS=10  # Optionnel (10 par défaut)

# Autres (déjà configurés)
DB_USER="emploip01_admin"
DB_PASSWORD="vcybk24235GDWe"
DB_HOST="127.0.0.1"
DB_PORT=5432
DB_NAME="emploiplus_db"
```

---

## 🧪 Tests de l'API

### Via cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@emploiplus-group.com","password":"changeme123"}'

# Récupérer le profil (remplacer TOKEN)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Déconnexion
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

### Via le Script de Test

```bash
chmod +x /home/emploiplus-group.com/public_html/backend/test-auth.sh
./test-auth.sh
```

---

## 🛠️ Gestion des Erreurs

### Erreurs Capturées par le Middleware Global

```json
{
  "success": false,
  "message": "Erreur lors de l'authentification: ...",
  "error": {
    "context": "authController.login",
    "path": "/api/auth/login",
    "method": "POST",
    "timestamp": "2026-02-25T10:30:00.000Z",
    "statusCode": 500
  }
}
```

### Types d'Erreurs Gérées

| Code | Erreur | Cause |
|------|---------|-------|
| 400  | Bad Request | Email/password manquant |
| 401  | Unauthorized | Credentials invalides / Token expiré |
| 403  | Forbidden | Compte désactivé |
| 404  | Not Found | Admin non trouvé |
| 500  | Internal Server Error | Erreur DB, config, etc. |

**Toutes les erreurs sont capturées par `asyncHandler` et passées au `errorMiddleware` global.**

---

## 🔑 Sécurité Implémentée

### ✅ Validations

- Email et password validés avant requête DB
- Email en lowercase pour éviter les doublons
- Vérification du statut du compte

### ✅ Hachage du Mot de Passe

- `bcryptjs.compare()` pour la vérification
- Aucun mot de passe en clair jamais loggé
- Hachage visible uniquement en debug

### ✅ JWT Signé

- Signal avec `JWT_SECRET` de 32+ caractères
- Token inclut: `id`, `email`, `role`
- Expiration: 24h (configurable)

### ✅ Secrets Protégés

- Database credentials en `.env`
- JWT_SECRET en `.env`
- Pas de secrets en logs production

### ✅ Isolation des Erreurs

- Les erreurs DB n'exposent jamais les détails
- "Email ou mot de passe incorrect" vague intentionnellement
- Pas de révélation si l'email existe

---

## 📊 Flux d'Authentification

```
┌─────────────────┐
│  Client (Frontend) │
└────────┬──────────┘
         │ POST /api/auth/login {email, password}
         ▼
┌──────────────────────┐
│ Route: auth.routes.ts │
└────────┬─────────────┘
         │
         ▼
┌───────────────────────────────────┐
│ asyncHandler(authController.login) │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ authController.login()        │
├──────────────────────────────┤
│ 1. Valider email/password     │
│ 2. Chercher l'admin par email │
│ 3. Comparer password avec bcrypt │
│ 4. Générer JWT           │
│ 5. Retourner token + infos│
└────────┬─────────────────────┘
         │ ✅ Succès: { success, token, admin }
         │ ❌ Erreur: throw CustomError
         ▼
┌──────────────────────────────┐
│ errorMiddleware (si erreur)   │
├──────────────────────────────┤
│ - Log l'erreur en console    │
│ - Retourne JSON { success: false }
│ - NE COUPE PAS LE SERVEUR   │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────┐
│ Client (Frontend) │ ◄── JSON Response
└─────────────────┘
```

---

## 🚀 Déploiement Prêt

✅ Isolation modulaire testée  
✅ Gestion des erreurs robuste  
✅ Variables d'environnement configurées  
✅ JWT signé et validé  
✅ Bcryptjs pour les passwords  
✅ Middleware authMiddleware optionnel  
✅ Roles et permissions extensibles  

**Prochaines étapes:**
- Ajouter des routes protégées par `authMiddleware` (ex: admin operations)
- Implémenter `requireRole('admin')` pour restreindre les accès
- Ajouter une table de blacklist pour les tokens révoqués (optionnel)
- Implémenter un "password reset" flow

---

## 📁 Fichiers Modifiés/Créés

```
src/
├── middlewares/
│   ├── auth.middleware.ts       ✨ NOUVEAU
│   └── errorMiddleware.ts       ✅ Existant
├── controllers/
│   ├── auth.controller.ts       ✨ NOUVEAU
│   ├── jobs.controller.ts       ✅ Existant
│   └── formations.controller.ts ✅ Existant
├── routes/
│   ├── auth.routes.ts          ✨ NOUVEAU
│   ├── jobs.routes.ts          ✅ Existant
│   ├── formations.routes.ts    ✅ Existant
│   └── index.ts                ✏️ MODIFIÉ (added auth router)
├── config/
│   └── database.ts             ✅ Existant
└── ...

test-auth.sh                    ✨ NOUVEAU (Test script)
```

---

**Version:** 1.0.0  
**Date:** 2026-02-25  
**Environnement:** Production ready  
**Isolation:** ✅ Complète
