# 🚀 Guide d'automatisation du Sitemap SEO - Emploiplus Group

Configuration complète pour générer automatiquement un `sitemap.xml` mis en cache avec cron journalier et actualisation manuelle via admin.

---

## 📋 Sommaire des améliorations

1. **Génération automatique quotidienne** à 03:00 du matin (node-cron)
2. **Fichier statique** pour économiser les ressources VPS
3. **Endpoint d'actualisation manuelle** pour les admins
4. **Gestion d'erreurs robuste** : ne pas écraser l'ancien sitemap en cas d'erreur
5. **Intégration Apache** pour servir le fichier à `/sitemap.xml`

---

## 🔧 Installation

### Étape 1 : Installer node-cron

```bash
cd backend
npm install node-cron
```

### Étape 2 : Vérifier l'environnement

S'assurer que `.env` contient :

```dotenv
# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/emploi_plus_db_cg

# Server Configuration
PORT=5000
NODE_ENV=production

# URL de base (important pour les sitemaps)
BASE_URL=https://emploiplus-group.com
```

### Étape 3 : Vérifier que le dossier `public/` existe

```bash
ls -la backend/public/
# Doit contenir : robots.txt, manifest.json, sw.js, etc.
```

Le fichier `sitemap.xml` sera créé automatiquement dans ce dossier au premier démarrage.

---

## 🔄 Fonctionnement

### À la startup du serveur

1. Backend Node.js démarre
2. **Génération initiale** du sitemap dans `backend/public/sitemap.xml`
3. **Activation du cron** pour l'exécution quotidienne à 03:00

### Quotidiennement à 03:00 AM

Le cron job exécute automatiquement :
- Récupère tous les jobs publiés de la DB
- Récupère toutes les formations publiées de la DB
- Génère un XML complet avec les priorités SEO
- Écrit le fichier physiquement dans `public/sitemap.xml`
- **En cas d'erreur** : l'ancien sitemap n'est pas écrasé

### Actualisation manuelle (Admin)

Les administrateurs super_admin peuvent forcer la rétrogénération via :

```
GET /api/admin/seo/refresh
```

**Réponse en cas de succès** (200 OK) :

```json
{
  "success": true,
  "message": "Sitemap généré avec succès (256 URLs)",
  "filepath": "/path/to/backend/public/sitemap.xml",
  "urlCount": 256,
  "timestamp": "2026-03-07T15:30:45.123Z"
}
```

### Consulter les infos du sitemap

Les admins peuvent vérifier l'état du sitemap courant :

```
GET /api/admin/seo/info
```

**Réponse** (200 OK) :

```json
{
  "success": true,
  "exists": true,
  "path": "/path/to/backend/public/sitemap.xml",
  "size": 45230,
  "sizeKB": "44.17",
  "lastModified": "2026-03-07T03:00:12.000Z"
}
```

---

## 🌐 Configuration Apache

Pour que Google puisse accéder à `https://emploiplus-group.com/sitemap.xml`, configurez Apache comme suit :

### Option 1 : Proxy simple (Recommandé)

Dans votre VirtualHost Apache (ex : `/etc/apache2/sites-available/emploiplus-group.com.conf`) :

```apache
<VirtualHost *:443>
    ServerName emploiplus-group.com
    ServerAlias www.emploiplus-group.com
    
    # 🔐 SSL Certificates
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # ===== SITEMAP STATIQUE =====
    # Sert le fichier sitemap.xml généré par le cron
    ProxyPreserveHost On
    ProxyPass        /sitemap.xml  http://127.0.0.1:5000/sitemap.xml
    ProxyPassReverse /sitemap.xml  http://127.0.0.1:5000/sitemap.xml
    
    # ===== AUTRES ROUTES API =====
    <Location /api>
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:5000/api
        ProxyPassReverse http://127.0.0.1:5000/api
    </Location>
    
    # ... reste de la configuration
</VirtualHost>
```

### Option 2 : Accès direct au fichier public (Performance maximale)

Si votre configuration web root pointe vers le backend :

```apache
DocumentRoot /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend/public

<Directory /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend/public>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
    
    # Cache le sitemap pendant 1 jour
    <FilesMatch "\.xml$">
        Header set Cache-Control "public, max-age=86400"
    </FilesMatch>
</Directory>
```

### Option 3 : Rewrite avec mod_rewrite

```apache
RewriteEngine On
RewriteRule ^/sitemap\.xml$ /api/seo/sitemap.xml [P,L]
```

---

## ✅ Vérification

### 1. Vérifier que le sitemap est généré

```bash
# Via SSH sur le serveur
cat /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend/public/sitemap.xml
```

Ou via API admin :

```bash
curl -X GET http://localhost:5000/api/admin/seo/info \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 2. Tester l'accès public

```bash
# Doit retourner du XML valide
curl -I https://emploiplus-group.com/sitemap.xml
# Doit afficher : Content-Type: application/xml

curl https://emploiplus-group.com/sitemap.xml | head -20
```

### 3. Vérifier le cron dans les logs

```bash
# Consulter les logs du backend
tail -f backend/server.log | grep CRON

# Ou, voir les logs du serveur Node.js
pm2 logs emploi-connect-backend
```

### 4. Forcer une actualisation depuis Admin

```bash
# Dans le panel admin Emploiplus :
# 1. Aller dans Paramètres > SEO
# 2. Cliquer sur "Actualiser le sitemap"
# 3. Vérifier que la réponse affiche le nombre d'URLs générées
```

---

## 📊 Structure du Sitemap généré

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <!-- Pages institutionnelles -->
  <url>
    <loc>https://emploiplus-group.com/</loc>
    <priority>1.0</priority>
  </url>
  
  <!-- Pages dynamiques issues de la DB -->
  <url>
    <loc>https://emploiplus-group.com/jobs/123</loc>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://emploiplus-group.com/formations/456</loc>
    <priority>0.8</priority>
  </url>
  
  <!-- ... autres URLs -->
</urlset>
```

**Priorités appliquées** :
- Accueil `/` → `1.0` (maximum)
- Offres d'emploi `/jobs/:id` → `0.9` (très important)
- Formations `/formations/:id` → `0.8` (important)
- Pages institutionnelles → `0.6` à `0.7`
- Pages légales (CGU, Cookies, etc.) → `0.4`

---

## 🛡️ Robustesse & Gestion d'erreurs

### Scénario 1 : La DB est down à 03h du matin

**Avant** (version dynamique) : Pas de sitemap retourné à Google

**Maintenant** : Le cron essaie, log l'erreur, mais **ne supprime pas l'ancien sitemap**. Google continue à crawler avec l'ancien sitemap valide.

**Code** :
```javascript
if (result.success) {
  console.log(`✓ Sitemap généré`);
} else {
  console.log(`✗ Erreur: ${result.message}`);
  // L'ancien sitemap reste intouché
}
```

### Scénario 2 : Redis/Cache down

Sans impact. Chaque requête lit le fichier statique du disque.

### Scénario 3 : Crash du backend

Google continue à crawler le sitemap statique existant jusqu'au prochain redémarrage/cron.

---

## 📝 Logs et monitoring

### Voir les logs de génération en direct

```bash
# Terminal 1 : Démarrer le backend
cd backend && npm run dev

# Les logs afficheront :
# [STARTUP] Génération initiale du sitemap...
# [STARTUP] ✓ Sitemap initial généré (256 URLs)
# [STARTUP] ✓ Cron job de sitemap activé (03:00 chaque jour)

# [CRON] ⏰ Exécution du cron - 03:00:00
# [CRON] ✓ Sitemap généré avec succès (256 URLs)
```

### Monitoring en production

Si vous utilisez PM2 :

```bash
pm2 logs emploi-connect | grep CRON
pm2 logs emploi-connect | grep SITEMAP
```

---

## 🔐 Sécurité

- ✅ Endpoint `/api/admin/seo/refresh` **protégé** : `requireAdmin + super_admin`
- ✅ Endpoint `/api/admin/seo/info` **protégé** : `requireAdmin + super_admin`
- ✅ Endpoint `/sitemap.xml` **public** (pour Google)
- ✅ Pas de secrets/tokens dans le sitemap XML lui-même

---

## 📚 Fichiers modifiés/créés

| Fichier | Statut | Description |
|---------|--------|-------------|
| `backend/services/sitemap-generator.service.js` | ✨ Créé | Logique de génération XML |
| `backend/services/sitemap-cron.service.js` | ✨ Créé | Planification cron quotidienne |
| `backend/controllers/seo.controller.js` | 📝 Modifié | Ajout endpoints admin |
| `backend/routes/seo.routes.js` | 📝 Modifié | Routes admin protégées |
| `backend/server.js` | 📝 Modifié | Initialisation cron au startup |
| `backend/public/sitemap.xml` | 🎯 Généré | Fichier statique (auto-créé) |
| `package.json` | 📝 Modifié | +node-cron |

---

## 🚀 Déploiement en production

### Sur VPS Linux (Ubuntu/Debian)

```bash
# 1. Déployer le code
git pull origin main

# 2. Installer les dépendances
cd backend && npm install

# 3. Vérifier que BASE_URL est correcte dans .env
cat .env | grep BASE_URL

# 4. Redémarrer et vérifier les logs
pm2 restart emploi-connect-backend
pm2 logs emploi-connect-backend | head -50

# 5. Tester l'accès
curl https://emploiplus-group.com/sitemap.xml | head -10
```

### Configuration supervisord (alternative à PM2)

```ini
[program:emploi-connect-backend]
command=/usr/local/bin/node /var/www/emploi-connect/backend/server.js
directory=/var/www/emploi-connect/backend
user=www-data
environment=NODE_ENV=production,DATABASE_URL=postgresql://...
autostart=true
autorestart=true
stderr_logfile=/var/log/emploi-connect-stderr.log
stdout_logfile=/var/log/emploi-connect-stdout.log
```

---

## 🐛 Troubleshooting

### Le sitemap n'est pas généré au startup

```bash
# Vérifier les logs
tail -50 backend/server.log

# Vérifier que node-cron est installé
npm list | grep node-cron

# Vérifier les permissions du dossier public
ls -la backend/public/
chmod 755 backend/public/
```

### Le cron ne s'exécute pas à 03:00

```bash
# Vérifier la timezone du serveur
date
timedatectl

# Vérifier la cron expression (utiliser un validateur)
# https://crontab.guru/ → "0 3 * * *" = 03:00 chaque jour
```

### Les URLs ne sont pas à jour dans Google Search Console

```bash
# 1. Manuellement forcer la regénération via API
curl -X GET http://localhost:5000/api/admin/seo/refresh \
  -H "Authorization: Bearer THIS_IS_YOUR_ADMIN_JWT_TOKEN"

# 2. Soumettre le sitemap à Google Search Console
# Accueil → Sitemaps → Ajouter → https://emploiplus-group.com/sitemap.xml
```

---

## 📞 Support

Pour toute question :
- Consulter les logs : `pm2 logs emploi-connect-backend`
- Tester l'endpoint admin : `GET /api/admin/seo/info`
- Vérifier que la DB est accessible : `psql $DATABASE_URL`

