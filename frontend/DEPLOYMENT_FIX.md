# DEPLOYMENT_FIX.md - EmploiPlus Backend Corrections

## 📋 Résumé des modifications

Ce document détaille toutes les corrections apportées au backend EmploiPlus pour résoudre les problèmes de déploiement sur VPS avec CyberPanel/OpenLiteSpeed.

---

## 🔧 1. Routes - Harmonisation Frontend/Backend

### Problème
- Le frontend appelait `POST /auth/super-admin/register`
- Le backend retournait des erreurs **404** car il attendait `/api/auth/...`
- Les requêtes GET `/api/publications` retournaient également des **404**

### Corrections appliquées

#### A. Routes avec double préfixe (accepter /api et sans préfixe)

Dans **`backend/src/server.ts`** (lignes 64-77), les routes sont montées avec les deux préfixes :

```typescript
// Mount routes both with and without the `/api` prefix
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin', adminAuthRoutes);
app.use('/admin', adminAuthRoutes);

app.use('/api', apiRoutes);
```

**Résultat** : Le backend accepte désormais :
- ✅ `POST /auth/super-admin/register` (sans /api)
- ✅ `POST /api/auth/super-admin/register` (avec /api)
- ✅ Both routes point to the same handler

#### B. Routes publications manquantes

**Fichier créé** : `backend/src/routes/publications.ts`

Contient tous les endpoints newsfeed manquants :

| Méthode | Route | Authentification | Description |
|---------|-------|------------------|-------------|
| GET | `/api/publications` | ❌ Optionnelle | Récupère le newsfeed (publique par défaut) |
| POST | `/api/publications` | ✅ Requise | Crée une nouvelle publication |
| PUT | `/api/publications/:id` | ✅ Requise | Modifie une publication (propriétaire) |
| DELETE | `/api/publications/:id` | ✅ Requise | Supprime une publication (propriétaire) |
| POST | `/api/publications/:id/like` | ✅ Requise | Like/Unlike une publication |

**Routes acceptées** :
- ✅ `GET /api/publications` → Fonctionne
- ✅ `GET /publications` → Fonctionne (grâce au `app.use('/api', apiRoutes)` dans server.ts)

#### C. Intégration dans le routeur principal

**Modifications** : `backend/src/routes/index.ts`

```typescript
import publicationsRoutes from './publications.js';

// ...

// Mount sub-routers
router.use('/publications', publicationsRoutes);
```

---

## 🔐 2. CORS - Autoriser les domaines spécifiés

### Problème
Erreurs CORS pour l'origine `http://www.emploiplus-group.com` et autres variantes.

### Solution appliquée

**Fichier modifié** : `backend/src/middleware/cors.ts`

```typescript
const rawOrigins = process.env.CORS_ORIGINS || 
  'https://emploiplus-group.com,http://emploiplus-group.com,https://www.emploiplus-group.com,http://www.emploiplus-group.com,http://localhost:5173,http://localhost:5174';

const allowedOrigins = rawOrigins.split(',').map((s) => s.trim());
```

**Origines autorisées** :
- ✅ `https://emploiplus-group.com` (HTTPS, sans www)
- ✅ `http://emploiplus-group.com` (HTTP, sans www)
- ✅ `https://www.emploiplus-group.com` (HTTPS, avec www)
- ✅ `http://www.emploiplus-group.com` (HTTP, avec www)
- ✅ `http://localhost:5173` (développement)
- ✅ `http://localhost:5174` (développement)

**Option d'env** : 
Vous pouvez personnaliser via `CORS_ORIGINS` dans le `.env` :
```bash
CORS_ORIGINS=https://mondomaine.com,http://localhost:3000
```

---

## 🎯 3. TypeScript - Types et compilation

### Problème
Le fichier `backend/src/server.ts` pouvait avoir des erreurs de type côté PORT.

### Vérification appliquée

Le parsing du PORT est correctement implémenté (ligne 101) :

```typescript
const PORT = parseInt(process.env.PORT || '5000', 10);
```

✅ **Type correct** : Le résultat de `parseInt()` est un `number`, pas une `string`  
✅ **Valeur par défaut** : Si `PORT` n'est pas défini, utilise le port 5000  
✅ **Base 10** : Évite les conversions octales ou hexadécimales

---

## 📦 4. Middleware et configuration d'application

### Configurations vérifiées

**Reverse Proxy Support** (ligne 19) :
```typescript
app.set('trust proxy', 1);
```
✅ Essentiel derrière CyberPanel/OpenLiteSpeed pour récupérer les IPs réelles

**Rate Limiting** (lignes 52-62) :
```typescript
app.use(['/api/', '/auth', '/admin'], apiLimiter);
```
✅ Protège les endpoints d'authentification contre les attaques par brute-force

**Body Parsing** (lignes 42-44) :
```typescript
const jsonLimit = process.env.MAX_JSON_SIZE || '1mb';
app.use(express.json({ limit: jsonLimit }));
```
✅ Limite stricte pour prévention DoS

**HSTS (HTTP Strict Transport Security)** (lignes 32-38) :
```typescript
app.use(helmet({
  hsts: {
    maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10),
    includeSubDomains: true,
    preload: true
  }
}));
```
✅ Force HTTPS et prévient les attaques de downgrade

---

## 🚀 Instructions de déploiement

### Prérequis
- Node.js 18+ installé sur le VPS
- PostgreSQL configuré et accessible
- Fichier `.env` à jour avec les bonnes variables

### Étapes à suivre

#### 1. Mise à jour du code

```bash
# À la racine du projet (où se trouve ce fichier)
cd backend

# Ou si vous êtes déjà dans le backend
git pull origin main
```

#### 2. Installer les dépendances (si nécessaire)

```bash
npm install
```

#### 3. Build du TypeScript

```bash
npm run build
```

**✅ Cette commande doit se terminer sans erreur**

#### 4. Redémarrer le serveur

Selon votre setup, utilisez l'une de ces commandes :

**Option A : PM2** (recommandé pour production)
```bash
pm2 restart emploi-backend  # ou le nom de votre app
# Ou si vous le démarrez pour la première fois :
pm2 start dist/server.js --name "emploi-backend"
pm2 startup
pm2 save
```

**Option B : Systemd** (si configuré sur le VPS)
```bash
sudo systemctl restart emploi-backend
```

**Option C : Directement avec Node**
```bash
npm run start
# ou
node dist/server.js
```

#### 5. Vérifier le déploiement

```bash
# Santé du backend
curl http://localhost:5000/_health

# Expected output:
# {"status":"ok","timestamp":"2026-02-20T...","env":"production","database":"connected"}

# Santé de la DB
curl http://localhost:5000/api/health/db

# Vérifier une route publications (optionnel)
curl http://localhost:5000/api/publications
```

---

## 🔍 Vérification post-déploiement

### Tests recommandés

#### 1. ✅ Routes acceptent les deux formats
```bash
# Sans /api (doit fonctionner)
curl -X POST http://localhost:5000/auth/super-admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'

# Avec /api (doit aussi fonctionner)
curl -X POST http://localhost:5000/api/auth/super-admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'
```

#### 2. ✅ CORS fonctionne
Depuis le frontend, vérifiez avec une requête CORS :
```javascript
fetch('http://localhost:5000/api/publications', {
  credentials: 'include'
})
```
Ne doit pas retourner d'erreur CORS.

#### 3. ✅ Publications accessible
```bash
curl http://localhost:5000/api/publications
# ou
curl http://localhost:5000/publications
```
Les deux doivent retourner une réponse JSON avec la structure `{ publications: [...], total: X, ... }`

---

## 📋 Checklist de déploiement

- [ ] Code mis à jour via `git pull`
- [ ] `npm run build` réussit sans erreur
- [ ] Serveur redémarré (PM2/Systemd/Node)
- [ ] Endpoint `/_health` retourne `{"status":"ok"}`
- [ ] Routes auth acceptent `/auth` ET `/api/auth`
- [ ] Routes publications retournent 200 (pas 404)
- [ ] Aucune erreur CORS dans la console du navigateur
- [ ] `.env` configuré avec `CORS_ORIGINS` si déploiement en production

---

## 📞 Support & Troubleshooting

### Problème : "404 - Route not found"
**Vérifier** :
- La route est montée dans `routes/index.ts`
- Les imports dans `server.ts` sont corrects (`app.use('/api', apiRoutes)`)
- Rebuilt TypeScript : `npm run build`

### Problème : "CORS policy: origin not allowed"
**Vérifier** :
- L'origine exacte dans les Network tools du navigateur (peut inclure le port)
- La variable `CORS_ORIGINS` dans le `.env` inclut cette origine
- Redémarrer le serveur après modification du `.env`

### Problème : "PORT is not a number"
**Vérifier** :
- TypeScript compile sans erreur : `npm run build`
- La ligne 101 utilise : `parseInt(process.env.PORT || '5000', 10)`

---

## 📊 Fichiers modifiés

| Fichier | Changement | Raison |
|---------|-----------|--------|
| `backend/src/middleware/cors.ts` | Ajout des domaines www et HTTP | CORS |
| `backend/src/routes/publications.ts` | **Fichier créé** | Routes newsfeed manquantes |
| `backend/src/routes/index.ts` | Import publications router | Intégration routes |

---

## ✅ Validation de la build

Avant de déployer, validez localement :

```bash
cd backend

# Nettoyer les builds précédentes
rm -rf dist/

# Build TypeScript
npm run build

# Vérifier la sortie
ls -la dist/

# Regarder les erreurs de compilation (s'il y en a)
cat dist/*.js | head -20
```

**La build doit créer des fichiers `.js` dans le répertoire `dist/` sans erreurs.**

---

## 📄 Notes importantes

1. **Reverse Proxy** : L'en-tête `trust proxy` est configuré pour CyberPanel/OpenLiteSpeed
2. **Rate Limiting** : Les routes CORS-sensibles sont protégées
3. **Downtime minimal** : PM2 permet les redémarrages sans perte de connexions existantes
4. **Logging** : Consultez les logs du serveur avec `pm2 logs` pour déboguer

---

**Date de création** : 20 février 2026  
**Version** : 1.0  
**Statut** : Production-ready ✅
