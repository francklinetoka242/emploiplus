# Configuration Reverse Proxy Apache + Backend Node.js
## Déploiement avec HashRouter et Management des Routes Profondes

**Date**: 21 février 2026  
**Objectif**: Configurer Apache comme reverse proxy frontal pour le backend Node.js (port 5000)

---

## ✅ Modifications Effectuées

### 1. Frontend (.env)
```dotenv
# AVANT:
VITE_API_URL=https://emploiplus-group.com

# APRÈS:
VITE_API_URL=/api
```

**Impact**: Toutes les requêtes API vont via `/api` (gérées par Apache → 127.0.0.1:5000)

---

### 2. Backend (src/server.ts)
```typescript
// AVANT:
const HOST = '0.0.0.0';

// APRÈS:
const HOST = '127.0.0.1'; // Écoute localement pour le reverse proxy Apache
```

**Impact**: Backend n'est accessible que via localhost (sécurité réseau)

---

### 3. Frontend Routing (App.tsx)
```typescript
// AVANT:
import { BrowserRouter, ... }
<BrowserRouter>

// APRÈS:
import { HashRouter, ... }
<HashRouter>
```

**Impact**: URLs utilisent le format `#` : `https://emploiplus-group.com/#/formations`

---

## 📋 Architecture du Déploiement

```
Client Browser
    ↓
HTTPS (Apache Certificat SSL)
    ↓
Apache VirtualHost (Port 443)
    ├─ /     → Frontend (dist/)     [HashRouter SPA]
    └─ /api  → Backend Proxy        [127.0.0.1:5000]
         ↓
Node.js Backend (5000, localhost only)
    ├─ Database: PostgreSQL (5432)
    └─ Cache: Redis (6379)
```

---

## 🔧 Configuration Apache

### Fichier de Référence
Voir: `apache-reverse-proxy.conf`

### Modules Requis
```bash
# Sur Ubuntu/Debian:
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite

# Sur XAMPP (macOS):
# Éditer: /Applications/XAMPP/etc/httpd/conf/httpd.conf
# Décommenter:
# LoadModule proxy_module modules/mod_proxy.so
# LoadModule proxy_http_module modules/mod_proxy_http.so
# LoadModule headers_module modules/mod_headers.so
# LoadModule rewrite_module modules/mod_rewrite.so
```

### VirtualHost Minimum

```apache
<VirtualHost *:443>
    ServerName emploiplus-group.com
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.crt
    SSLCertificateKeyFile /path/to/key.key
    
    # ✅ Reverse Proxy pour /api
    <Location /api>
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:5000/api
        ProxyPassReverse http://127.0.0.1:5000/api
    </Location>
    
    # ✅ Frontend SPA
    DocumentRoot /path/to/dist
    <Directory /path/to/dist>
        Options -MultiViews
    </Directory>
</VirtualHost>
```

---

## 🧪 Vérifications & Tests

### 1. Backend Écoute en Local
```bash
# Vérifier que Node.js écoute sur 127.0.0.1:5000
netstat -tulpn | grep 5000
# OU
lsof -i :5000

# Résultat attendu:
# tcp  0  0  127.0.0.1:5000  0.0.0.0:*  LISTEN  <pid>/node
```

### 2. Backend Health Check
```bash
# Tester l'endpoint de santé
curl http://127.0.0.1:5000/_health

# Résultat attendu:
# {"status":"ok","timestamp":"2026-02-21T...","env":"production","database":"connected"}
```

### 3. Apache Reverse Proxy
```bash
# Tester le reverse proxy
curl -H "Host: emploiplus-group.com" http://localhost/api/_health

# Ou depuis le shell:
curl https://emploiplus-group.com/api/_health
```

### 4. Frontend Tests
```bash
# Build le frontend
npm run build

# Vérifier le hash dans l'URL:
# ✅ OK:        https://emploiplus-group.com/#/formations
# ❌ À éviter:  https://emploiplus-group.com/formations

# Test des routes (depuis DevTools console):
# navigation.push('/formations')  → URL devient /#/formations
```

---

## 📝 Variables d'Environnement

### Frontend (.env)
```dotenv
VITE_API_URL=/api              # ✅ Correct pour reverse proxy
# VITE_API_URL=/api/v1         # Alternative (adapter le backend routes)
# VITE_API_URL=http://localhost:5000  # ❌ Ne pas utiliser en prod
```

### Backend (.env)
```dotenv
PORT=5000                       # Port d'écoute Node.js
NODE_ENV=production
DATABASE_URL=postgresql://...   # PostgreSQL
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
FRONTEND_URL=https://emploiplus-group.com
BACKEND_URL=http://127.0.0.1:5000  # Interne seulement
```

---

## 🚀 Étapes Déploiement

### Phase 1: Préparation
```bash
# 1. Backend
cd backend
npm install
npm run build  # Si TypeScript

# 2. Frontend
npm run build
# → Génère dist/ avec tous les assets

# 3. Copier dist/ vers le DocumentRoot Apache
cp -r dist /var/www/emploiplus-group.com/html
```

### Phase 2: Configuration Apache

```bash
# 1. Copier la config
sudo cp apache-reverse-proxy.conf /etc/apache2/sites-available/emploiplus-group.conf

# 2. Adapter les chemins:
sudo nano /etc/apache2/sites-available/emploiplus-group.conf
# - DocumentRoot
# - SSLCertificateFile / SSLCertificateKeyFile
# - ErrorLog / CustomLog

# 3. Activer le site
sudo a2ensite emploiplus-group

# 4. Test de syntaxe
sudo apache2ctl configtest
# Résultat attendu: "Syntax OK"

# 5. Recharger Apache
sudo systemctl reload apache2
```

### Phase 3: Lancer le Backend

```bash
# Option 1: Directement
cd backend
node dist/server.js

# Option 2: Avec PM2 (production)
pm2 start dist/server.js --name "emploi-api"
pm2 save
pm2 startup

# Option 3: Systemd service
# Créer: /etc/systemd/system/emploi-api.service
# Puis: sudo systemctl enable emploi-api && sudo systemctl start emploi-api
```

### Phase 4: Vérification

```bash
# 1. Backend tourne?
ps aux | grep node

# 2. Écoute en local?
netstat -tulpn | grep 5000

# 3. API répond?
curl http://127.0.0.1:5000/_health

# 4. Apache reverse proxy fonctionne?
curl https://emploiplus-group.com/api/_health

# 5. Frontend charge?
curl https://emploiplus-group.com | grep "<!DOCTYPE"
```

---

## ⚠️ Points Critiques

### ✅ À Faire
- [x] VITE_API_URL=/api dans .env frontend
- [x] Backend HOST=127.0.0.1 (sécurité)
- [x] HashRouter dans App.tsx pour les URLs #/routes
- [x] ProxyPass + ProxyPassReverse configurés
- [x] Headers Apache pour les WebSockets

### ❌ À Éviter
- Ne pas garder BrowserRouter (404 Apache)
- Ne pas laisser VITE_API_URL=https://... (contourne le proxy)
- Ne pas écouter sur 0.0.0.0:5000 en production (sécurité)
- Ne pas oublier les certificats SSL Apache

---

## 🔗 Fichiers Modifiés

| Fichier | Modification | Raison |
|---------|--------------|--------|
| `.env` | `VITE_API_URL=/api` | Routes via reverse proxy |
| `src/App.tsx` | `HashRouter` au lieu de `BrowserRouter` | URLs avec # |
| `backend/src/server.ts` | `HOST=127.0.0.1` | Sécurité réseau |
| `apache-reverse-proxy.conf` | **Nouveau** | Config proxy Apache |

---

## 📞 Support & Débogage

### Logs Apache
```bash
# Erreurs:
tail -f /var/log/apache2/error.log

# Requêtes:
tail -f /var/log/apache2/access.log

# X-Forwarded-For (vérifier IP réelle):
grep "X-Forwarded-For" /var/log/apache2/access.log
```

### Logs Backend
```bash
# Si lancé directement:
pm2 logs emploi-api

# Ou journalctl:
journalctl -u emploi-api -f
```

### Test Requests
```bash
# POST avec authentification
curl -X POST https://emploiplus-group.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass"}'

# GET avec paramètres
curl "https://emploiplus-group.com/api/jobs?limit=10&offset=0"

# Avec token Bearer
curl -H "Authorization: Bearer TOKEN_HERE" \
  https://emploiplus-group.com/api/admin/dashboard
```

---

**Dernière mise à jour**: 21 février 2026  
**Statut**: ✅ Configuration complète et testée
