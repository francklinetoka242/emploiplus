# Configuration Déploiement VPS Ubuntu + LiteSpeed

**Date:** 21 février 2026  
**Domaine:** https://emploiplus-group.com  
**Backend:** Node.js Express (Port 5000, PM2)  
**Frontend:** React SPA (Vite)

---

## 1. Analyse des Routes Backend

### Routes Définies dans Backend Node.js

Le backend Express (fichier [`backend/src/server.ts`](backend/src/server.ts)) monte les routes **SANS préfixe `/api` dans le code TypeScript**. Les routes sont organisées par module:

#### ✅ Routes d'Authentification (`backend/src/routes/auth.ts`)
```
Mountées sur:  /api/auth  ET  /auth
```

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/status` | Récupère l'état de l'utilisateur connecté | ✅ Token JWT requis |
| POST | `/admin/register` | Inscription administrateur | ❌ Publique |
| POST | `/admin/login` | Connexion administrateur | ❌ Publique |
| POST | `/user/register` | Inscription utilisateur | ❌ Publique |
| POST | `/user/login` | Connexion utilisateur | ❌ Publique |

**Accès depuis le frontend:**
- `https://emploiplus-group.com/api/auth/admin/login` ✅
- `https://emploiplus-group.com/api/auth/user/register` ✅
- `https://emploiplus-group.com/api/auth/status` ✅

#### ✅ Routes d'Administration (`backend/src/routes/admin.ts`)
```
Montées sur:  /api/admin  ET  /admin
```

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/dashboard` | Tableau de bord système | ✅ Admin |
| GET | `/dashboard/services` | État des services | ✅ Admin |
| GET | `/dashboard/metrics` | Métriques applicatives | ✅ Admin |
| GET | `/dashboard/database` | Statistiques base de données | ✅ Admin |
| ... | *28+ routes supplémentaires* | Gestion users, jobs, uploads, etc. | ✅ Admin |

#### ✅ Routes Admin Auth (`backend/src/routes/admin-auth.ts`)
```
Montées sur:  /api/admin-auth  ET  /admin-auth
```

#### ✅ Routes de Sécurité (`backend/src/routes/security-monitoring.ts`)
```
Montées sur:  /api/security  ET  /security
```

#### ✅ Routes API Générales (`backend/src/routes/index.ts`)
```
Montées sur:  /api
```

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Health check générale |
| GET | `/health/db` | Vérification base de données |
| GET | `/jobs/*` | Gestion des emplois |
| GET | `/trainings/*` | Gestion des formations |
| GET | `/faqs/*` | FAQ |
| GET | `/services/*` | Services |

#### ✅ Endpoint de Santé Global
```
GET  /_health
```
Accessible directement sur le backend (utile pour vérifier depuis le VPS).

---

## 2. Configuration .htaccess Requise

### ⚠️ Problème Actuel

Le fichier [`/public_html/.htaccess`](.htaccess) est configuré pour une **SPA React pure**, redirigeant tous les requêtes vers `index.html`. Cela bloque l'accès au backend.

### ✅ Solution: .htaccess Corrigé

Remplacez le contenu du fichier `.htaccess` à la racine (où se trouve `index.html`) par:

```apache
# .htaccess - Configuration Proxy + SPA Routing
# Frontend: React SPA routing + Backend API proxy

<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # ====================================================================
  # 1. PROXY API VERS LE BACKEND NODE.JS SUR LE PORT 5000
  # ====================================================================
  
  # Important: mod_proxy doit être activé sur le serveur
  # Si vous utilisez LiteSpeed avec Apache emulation, vérifiez dans le panel
  
  # Redirection des requêtes /api/* vers le backend (127.0.0.1:5000)
  # SANS supprimer le préfixe /api (le backend l'attend)
  RewriteCond %{REQUEST_URI} ^/api/ [OR]
  RewriteCond %{REQUEST_URI} ^/auth [OR]
  RewriteCond %{REQUEST_URI} ^/admin [OR]
  RewriteCond %{REQUEST_URI} ^/_health
  RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,QSA,L]
  
  # ====================================================================
  # 2. FICHIERS ET RÉPERTOIRES STATIQUES (Ne pas rediriger)
  # ====================================================================
  
  # Permettre l'accès aux fichiers d'assets (ne pas rediriger vers index.html)
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteRule ^ - [L]
  
  # Permettre l'accès aux répertoires existants
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Permettre l'accès aux liens symboliques
  RewriteCond %{REQUEST_FILENAME} -l
  RewriteRule ^ - [L]
  
  # ====================================================================
  # 3. SPA ROUTING (Last resort: React Router)
  # ====================================================================
  
  # Si aucune des conditions précédentes ne match, 
  # envoyer vers index.html pour que React Router gère le routing
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# ====================================================================
# TYPES MIME
# ====================================================================

<IfModule mod_mime.c>
  AddType application/javascript js
  AddType application/json json
  AddType text/css css
  AddType image/svg+xml svg svgz
  AddEncoding gzip svgz
  AddType image/x-icon ico
  AddType font/ttf ttf
  AddType font/otf otf
  AddType font/woff woff
  AddType font/woff2 woff2
  AddType application/wasm wasm
</IfModule>

# ====================================================================
# COMPRESSION GZIP (Important pour bas débit Congo)
# ====================================================================

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE font/truetype
  AddOutputFilterByType DEFLATE font/opentype
  AddOutputFilterByType DEFLATE application/vnd.ms-fontobject
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# ====================================================================
# CACHING
# ====================================================================

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 2 days"
  
  # Cache des assets avec hash (immutable, 1 an)
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/ttf "access plus 1 year"
  ExpiresByType font/otf "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  
  # Ne pas cacher index.html ni les fichiers sans hash
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType application/json "access plus 0 seconds"
</IfModule>

# ====================================================================
# SÉCURITÉ
# ====================================================================

<IfModule mod_headers.c>
  # Prévention MIME sniffing
  Header always set X-Content-Type-Options "nosniff"
  
  # Protection XSS
  Header always set X-XSS-Protection "1; mode=block"
  
  # Clickjacking protection (ajuster selon besoin)
  Header always set X-Frame-Options "SAMEORIGIN"
  
  # Politique du référant
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  
  # CSP basique (adapter selon votre application)
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
</IfModule>

# Désactiver la liste des répertoires
Options -Indexes
```

### 🔧 Notes Critiques sur la Configuration

#### **1. Module Proxy Requis**

LiteSpeed doit avoir le module `mod_proxy` activé. Vérifiez dans le panel CyberPanel/LiteSpeed:

```bash
# Sur le VPS Ubuntu
sudo /usr/local/lsws/bin/lswsctrl list
```

Cherchez `mod_proxy` dans la liste. Si absent, activez-le via CyberPanel ou dans la config LiteSpeed.

#### **2. Format du Proxy Rewrite**

```apache
RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,QSA,L]
```

- **`[P]`** = Proxy (crucial!) - Sans cela, LiteSpeed ne fera que rediriger HTTP au lieu de proxifier
- **`[QSA]`** = Query String Append - Conserve les paramètres URL
- **`[L]`** = Last rule - Arrête le traitement après cette règle

#### **3. Éviter le Double Préfixe `/api/api/`**

Le backend reçoit les routes **avec** le préfixe `/api`. Donc:

| Requête Frontend | Proxy vers | Backend Route | ✅ Status |
|------------------|-----------|---------------|----------|
| `/api/auth/admin/login` | `http://127.0.0.1:5000/api/auth/admin/login` | `/api/auth` → `/admin/login` | ✅ OK |
| `/api/health` | `http://127.0.0.1:5000/api/health` | `/api` → `/health` | ✅ OK |

**Ne pas utiliser `/api` en préfixe de réécriture** ❌

```apache
# ❌ MAUVAIS - Crée /api/api/
RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,QSA,L]

# ✅ BON - Préserve le chemin complet
RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,QSA,L]
```

---

## 3. Variables d'Environnement

### Backend (`.env` dans `/Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend/.env`)

**État Actuel:**
```dotenv
FRONTEND_URL="https://emploiplus-group.com"
BACKEND_URL="https://emploiplus-group.com"
PORT=5000
NODE_ENV=production
```

**✅ Cohérence Vérifiée:**

| Variable | Valeur | Cohérence | Explication |
|----------|--------|-----------|-------------|
| `FRONTEND_URL` | `https://emploiplus-group.com` | ✅ | Correct - Frontend accessible sur ce domaine |
| `BACKEND_URL` | `https://emploiplus-group.com` | ✅ | Correct - Les routes `/api/*` sont servies depuis le même domaine via proxy |
| `PORT` | `5000` | ✅ | Port PM2 interne, pas accessible depuis outside (proxy LiteSpeed) |
| `NODE_ENV` | `production` | ✅ | Mode production activé |
| `CORS_ORIGINS` | Non défini | ⚠️ | Utilise la valeur par défaut (voir ci-dessous) |

### Valeurs CORS par Défaut

Si `CORS_ORIGINS` n'est pas défini dans `.env`, le backend utilise (voir `backend/src/middleware/cors.ts`):

```
https://emploiplus-group.com
http://emploiplus-group.com
https://www.emploiplus-group.com
http://www.emploiplus-group.com
http://localhost:5173
http://localhost:5174
```

**Recommandation:** Ajouter `CORS_ORIGINS` explicitement dans `.env` pour clarté:

```dotenv
CORS_ORIGINS="https://emploiplus-group.com,https://www.emploiplus-group.com,http://localhost:5173"
```

### Frontend (`.env` à la racine du projet)

Vérifiez que le frontend utilise la bonne URL du backend:

```typescript
// expected in src/App.tsx or similar
const API_BASE_URL = process.env.VITE_API_URL || 'https://emploiplus-group.com/api';
```

Le fichier `.env` du frontend doit contenir:

```dotenv
VITE_API_URL="https://emploiplus-group.com/api"
VITE_BACKEND_URL="https://emploiplus-group.com"
```

---

## 4. Test de Validation

### Test 1: Vérifier que le Backend PM2 est Actif

```bash
# Sur le VPS Ubuntu
sudo pm2 list

# Doit afficher le processus Node.js avec status 'online'
# Exemple:
# │ id │ name             │ mode │ status │ restart │
# ├────┼──────────────────┼──────┼────────┼─────────┤
# │ 0  │ emploi-backend   │ fork │ online │ 0       │
```

Si le processus n'existe pas, démarrez-le:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend
npm run prod &
sudo pm2 start dist/server.js --name "emploi-backend"
sudo pm2 save
```

### Test 2: Vérifier depuis le VPS que le Backend Répond

```bash
# Directement sur le VPS (127.0.0.1:5000)
curl -X GET http://127.0.0.1:5000/_health
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-21T...",
  "env": "production",
  "database": "connected"
}
```

### Test 3: Test CURL Complet - Authentification Administrateur

**Via HTTPS depuis votre machine locale:**

```bash
curl -X POST https://emploiplus-group.com/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@emploiplus-group.com","password":"YourAdminPassword"}'
```

**Réponse attendue (succès):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "admin": {
    "id": "...",
    "email": "admin@emploiplus-group.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }
}
```

**Réponse attendue (authentification échouée):**
```json
{
  "success": false,
  "message": "Identifiants incorrects"
}
```

### Test 4: Test CURL - Inscription Utilisateur

```bash
curl -X POST https://emploiplus-group.com/api/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"Jean",
    "last_name":"Dupont",
    "email":"jean.dupont@example.com",
    "password":"SecurePass123!",
    "user_type":"candidate"
  }'
```

**Réponse attendue (succès):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@example.com",
    "user_type": "candidate"
  }
}
```

### Test 5: Test CURL - Vérifier l'État de l'Utilisateur Connecté

```bash
# Remplacez TOKEN par le jeton reçu lors du login
TOKEN="eyJhbGc..."

curl -X GET https://emploiplus-group.com/api/auth/status \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse attendue:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "jean.dupont@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "user_type": "candidate"
  }
}
```

### Test 6: Test CURL - Health Check Générale

```bash
curl https://emploiplus-group.com/api/health
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "service": "emploi-connect-api",
  "timestamp": "2026-02-21T..."
}
```

### Test 7: Test CURL - Vérification Complète du Chemin (Verbose)

Utilisez le flag `-v` pour voir les en-têtes HTTP complets:

```bash
curl -v -X POST https://emploiplus-group.com/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'
```

Dans la sortie, cherchez:
- `< HTTP/1.1 200 OK` ou `401 Unauthorized` (pas `404 Not Found`)
- `< Content-Type: application/json`
- `< X-Content-Type-Options: nosniff` (preuve que le backend répond)

### Test 8: Diagnostic - En Cas de 404

```bash
# Si vous recevez 404, cela signifie que .htaccess redirige vers index.html
# au lieu de proxifier vers le backend

# Vérifiez qu'Apache/LiteSpeed charge bien .htaccess:
# 1. Fichier existe: ✅
# 2. mod_rewrite activé: ✅ (vérifier dans LiteSpeed panel)
# 3. mod_proxy activé: ✅ (CRUCIAL pour [P] flag)

# Depuis le VPS, testez directement le backend:
curl -v http://127.0.0.1:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@emploiplus-group.com","password":"test"}'

# Si cela fonctionne → problème de .htaccess ou mod_proxy
# Si cela échoue → problème du backend lui-même
```

---

## 5. Checklist Déploiement

### Avant le Déploiement

- [ ] Backend Node.js compilé: `cd backend && npm run build`
- [ ] Backend testé localement: `npm run dev` ou `npm start`
- [ ] PM2 configuré et sauvegardé: `pm2 save && pm2 startup`
- [ ] `.env` backend contient `PORT=5000` et `NODE_ENV=production`
- [ ] `.env` backend contient `FRONTEND_URL` et `BACKEND_URL` corrects

### Configuration LiteSpeed

- [ ] Module `mod_proxy` activé (dans LiteSpeed Configuration ou CyberPanel)
- [ ] Module `mod_rewrite` activé
- [ ] Module `mod_deflate` activé (compression)
- [ ] Module `mod_headers` activé (sécurité)

### Configuration Frontend

- [ ] Build: `npm run build`
- [ ] Fichiers de build dans `/var/www/html/` ou répertoire public
- [ ] `.htaccess` remplacé avec la config du **Section 2**
- [ ] `.env` du frontend avec `VITE_API_URL=https://emploiplus-group.com/api`

### Vérifications Post-Déploiement

- [ ] `https://emploiplus-group.com/_health` → JSON (pas HTML)
- [ ] `https://emploiplus-group.com/api/health` → JSON
- [ ] `https://emploiplus-group.com/` → React SPA chargée
- [ ] `https://emploiplus-group.com/api/auth/user/login` → POST fonctionne (200 ou 401, pas 404)
- [ ] Logs PM2: `pm2 logs` → pas d'erreurs
- [ ] Logs LiteSpeed: `/usr/local/lsws/logs/error.log` → pas d'erreurs proxy

---

## 6. Troubleshooting

### Symptôme: `404 Cannot POST /api/auth/login`

**Causes Possibles:**

1. **`.htaccess` non appliqué** → Vérifiez que le fichier existe et que `mod_rewrite` est activé
2. **`mod_proxy` désactivé** → Activez via CyberPanel ou config LiteSpeed
3. **Backend non démarré** → `sudo pm2 list` doit afficher le processus avec status `online`
4. **Port 5000 bloqué par firewall** → `sudo ufw allow 5000`.

### Symptôme: `502 Bad Gateway` ou `Connection Refused`

- Backend n'écoute pas sur `127.0.0.1:5000`
- Vérifiez: `curl http://127.0.0.1:5000/_health` depuis le VPS
- Vérifiez les logs PM2: `pm2 logs`

### Symptôme: `CORS Error` dans la Console du Navigateur

- Vérifiez `CORS_ORIGINS` dans `.env` backend
- Doit inclure `https://emploiplus-group.com`

### Symptôme: Les Fichiers de Build du Frontend sont Servis, mais `index.html` est Redirigé vers `/api`

- La règle `.htaccess` pour l'API doit venir **avant** la règle SPA Routing
- Vérifiez l'ordre des `RewriteRule` dans le fichier `.htaccess`

---

## 7. Ressources Additionnelles

- [Express Documentation](https://expressjs.com/)
- [LiteSpeed RewriteRule Documentation](https://openlitespeed.org/kb/rewrite-rules/)
- [Apache mod_proxy Documentation](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

**Fin du Document de Configuration**

Généré: 21 février 2026
