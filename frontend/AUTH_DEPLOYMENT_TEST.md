# AUTH_DEPLOYMENT_TEST.md - Guide de test des routes d'authentification

**Date** : 20 février 2026  
**Objectif** : Vérifier que l'authentification fonctionne sur le VPS après déploiement

---

## 🔐 Routes d'authentification disponibles

### À partir du fichier `src/routes/auth.ts`

| Route | Méthode | Description | Authentification |
|-------|---------|-------------|------------------|
| `/api/auth/admin/register` | POST | Inscription admin | ❌ Non requise |
| `/api/auth/super-admin/register` | POST | Inscription super-admin | ❌ Non requise |
| `/api/auth/admin/login` | POST | Connexion admin | ❌ Non requise |
| `/api/auth/user/register` | POST | Inscription user/candidat | ❌ Non requise |
| `/api/auth/user/login` | POST | Connexion user | ❌ Non requise |
| `/api/auth/sync-google` | POST | Sync Google OAuth | ❌ Non requise |

**Note** : Toutes les routes acceptent aussi le préfixe sans `/api` :
- `/auth/admin/register` ✅ Fonctionne aussi
- `/auth/super-admin/register` ✅ Fonctionne aussi
- etc.

### À partir du fichier `src/routes/admin-auth.ts`

| Route | Méthode | Description | Authentification |
|-------|---------|-------------|------------------|
| `/api/admin/register` | POST | Inscription admin (alt) | ❌ Non requise |
| `/api/admin/verify-email` | GET | Vérification email token | ❌ Non requise |
| `/api/admin/login` | POST | Connexion admin (alt) | ❌ Non requise |
| `/api/admin/create` | POST | Créer admin (by SA) | ✅ SuperAdmin only |

**Note** : Accepte aussi `/admin/register`, `/admin/login`, etc.

---

## 🧪 Plan de test complet

### 1️⃣ TEST HEALTH CHECK

**Vérifier que le serveur répond** :

```bash
curl http://localhost:5000/_health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2026-02-20T10:00:00.000Z",
  "env": "production",
  "database": "connected"
}
```

### 2️⃣ TEST ADMIN REGISTRATION (Route 1)

**Test via `/auth/admin/register`** :

```bash
curl -X POST http://localhost:5000/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin1@test.com",
    "password": "AdminPass123!",
    "full_name": "Test Admin",
    "role": "admin"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Admin créé avec succès",
  "admin": {
    "id": "...",
    "email": "admin1@test.com",
    "full_name": "Test Admin"
  }
}
```

**Ou erreur si email existe déjà** :
```json
{
  "success": false,
  "message": "Admin avec cet email existe déjà"
}
```

### 3️⃣ TEST ADMIN REGISTRATION (Route 2)

**Pour vérifier que `/api/auth/admin/register` fonctionne aussi** :

```bash
curl -X POST http://localhost:5000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@test.com",
    "password": "AdminPass456!",
    "full_name": "Another Admin",
    "role": "admin"
  }'
```

**Doit aussi fonctionner !**

### 4️⃣ TEST SUPER-ADMIN REGISTRATION

**Test via `/auth/super-admin/register`** :

```bash
curl -X POST http://localhost:5000/auth/super-admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@test.com",
    "password": "SuperPass123!",
    "full_name": "Super Admin"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Super admin créé",
  "admin": {
    "role": "super_admin"
  }
}
```

### 5️⃣ TEST SUPER-ADMIN VIA `/api/admin/register`

**Alternative route** :

```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin2@test.com",
    "password": "SuperPass456!",
    "firstName": "Super",
    "lastName": "Admin2"
  }'
```

**Doit aussi fonctionner !**

### 6️⃣ TEST ADMIN LOGIN

**Test login via `/auth/admin/login`** :

```bash
curl -X POST http://localhost:5000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin1@test.com",
    "password": "AdminPass123!"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "email": "admin1@test.com",
    "role": "admin"
  }
}
```

### 7️⃣ TEST USER REGISTRATION

**Test user/candidat registration** :

```bash
curl -X POST http://localhost:5000/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidat@test.com",
    "password": "UserPass123!",
    "user_type": "candidat",
    "first_name": "Jean",
    "last_name": "Dupont"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Candidat créé",
  "user": {
    "id": "...",
    "email": "candidat@test.com"
  }
}
```

### 8️⃣ TEST USER LOGIN

**Test user login** :

```bash
curl -X POST http://localhost:5000/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidat@test.com",
    "password": "UserPass123!"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "candidat@test.com"
  }
}
```

### 9️⃣ TEST CORS (depuis un navigateur)

**Depuis la console du navigateur** (http://emploiplus-group.com) :

```javascript
fetch('http://localhost:5000/_health')
  .then(r => r.json())
  .then(d => console.log('✅ CORS works:', d))
  .catch(e => console.error('❌ CORS error:', e.message))
```

**Doit afficher** :
```
✅ CORS works: {status: "ok", ...}
```

---

## 📊 Matrice de tests

### Routes acceptées

| Endpoint | Avec `/api` | Sans `/api` | Status |
|----------|-------------|-----------|--------|
| `/auth/admin/register` | ✅ | ✅ | Should work |
| `/auth/super-admin/register` | ✅ | ✅ | Should work |
| `/admin/register` | ✅ | ✅ | Should work |
| `/auth/admin/login` | ✅ | ✅ | Should work |

---

## 🔍 Diagnostic d'erreurs

### Erreur : "404 Not Found"

**Cause** : Route non montée ou mauvais préfixe

**Solution** :
```bash
# Vérifier que /auth est bien monté
curl -X GET http://localhost:5000/auth 2>&1 | grep -i "404\|ok"

# Vérifier que /api/auth aussi
curl -X GET http://localhost:5000/api/health 2>&1
```

### Erreur : "CORS policy"

**Cause** : L'origine n'est pas autorisée

**Vérifier** : La variable `CORS_ORIGINS` dans le `.env` contient l'origin du frontend

```bash
.env exemple :
CORS_ORIGINS=https://emploiplus-group.com,http://emploiplus-group.com,http://localhost:3000
```

### Erreur : "Database unavailable"

**Solution** :
```bash
# Vérifier que PostgreSQL répond
curl http://localhost:5000/api/health/db

# Vérifier DATABASE_URL dans .env
echo $DATABASE_URL

# Tester la connexion directement
psql $DATABASE_URL -c "SELECT 1;"
```

### Erreur : "Invalid token" lors du login

**Cause** : Token JWT mal signé

**Vérifier** :
```bash
# JWT_SECRET doit être présent
echo $JWT_SECRET

# Doit être non-vide
[ -z "$JWT_SECRET" ] && echo "ERROR: JWT_SECRET not set"
```

---

## 📝 Checklist de test après déploiement VPS

- [ ] `npm run build` réussit (0 errors) ✅
- [ ] Serveur démarre sans crash
- [ ] Health check répond (`/_health`)
- [ ] Admin registration fonctionne (`/auth/admin/register`)
- [ ] Admin login retourne un token
- [ ] All two prefixes work (`/auth` ET `/api/auth`)
- [ ] User registration works (`/auth/user/register`)
- [ ] CORS n'affiche pas d'erreurs
- [ ] Token JWT valide (peut être décodé)
- [ ] Database connectée (`/api/health/db`)

---

## 🚀 Script de test complet (bash)

Créer un fichier `test-auth.sh` :

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"
ADMIN_EMAIL="test-admin-$(date +%s)@test.com"
USER_EMAIL="test-user-$(date +%s)@test.com"

echo "🧪 Testing EmploiPlus Authentication Routes..."

# 1. Health check
echo -n "1️⃣  Health check... "
curl -s -X GET "$BASE_URL/_health" | grep -q "ok" && echo "✅" || echo "❌"

# 2. Admin registration
echo -n "2️⃣  Admin registration... "
ADMIN_RESP=$(curl -s -X POST "$BASE_URL/auth/admin/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"Pass123!\",\"full_name\":\"Test Admin\",\"role\":\"admin\"}")
echo "$ADMIN_RESP" | grep -q "success" && echo "✅" || echo "❌"

# 3. Admin login
echo -n "3️⃣  Admin login... "
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"Pass123!\"}")
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
[ ! -z "$TOKEN" ] && echo "✅" || echo "❌"

# 4. User registration
echo -n "4️⃣  User registration... "
USER_RESP=$(curl -s -X POST "$BASE_URL/auth/user/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"Pass123!\",\"user_type\":\"candidat\",\"first_name\":\"Jean\",\"last_name\":\"Dupont\"}")
echo "$USER_RESP" | grep -q "success" && echo "✅" || echo "❌"

# 5. CORS test
echo -n "5️⃣  CORS check... "
CORS=$(curl -s -X OPTIONS "$BASE_URL/_health" \
  -H "Origin: http://emploiplus-group.com" \
  -H "Access-Control-Request-Method: GET" \
  -i | grep "Access-Control-Allow-Origin")
[ ! -z "$CORS" ] && echo "✅" || echo "❌"

echo ""
echo "All tests completed! ✅"
```

**Utiliser le script** :

```bash
chmod +x test-auth.sh
./test-auth.sh
```

---

## 📞 Support

Si une route ne fonctionne pas :

1. Vérifier ` npm run build` réussit
2. Vérifier le serveur démarre : `node dist/server.js`
3. Vérifier la route existe dans `src/routes/auth.ts`
4. Vérifier les logs du serveur pour erreurs
5. Contacter support avec les logs du serveur

---

**Version** : 1.0  
**Dernière mise à jour** : 20 février 2026
