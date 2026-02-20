# ⚡ CHECKLIST PRÉ-DÉPLOIEMENT RAPIDE

## 🔧 AVANT LE BUILD

### Vérifications locales
```bash
# 1. Vérifier que le projet compile sans erreurs
npm run build

# 2. Vérifier que dist/ a été créé
ls -la dist/ | head -20

# 3. Vérifier que index.html existe
ls -la dist/index.html

# 4. Compter les fichiers (minimum 10+)
find dist -type f | wc -l

# 5. Vérifier la taille du build
du -sh dist/
```

### Tests locaux (si possible)
```bash
# Lancer le serveur local
npm run preview

# Ouvrir dans le navigateur et tester:
# ✅ http://localhost:4173/
# ✅ http://localhost:4173/admin/login
# ✅ http://localhost:4173/admin/register/super-admin
# ✅ http://localhost:4173/admin/formations
# ✅ http://localhost:4173/admin/services
# ✅ http://localhost:4173/admin/admins
```

---

## 📦 FICHIERS À VÉRIFIER AVANT DÉPLOIEMENT

### ✅ Fichier: src/App.tsx
```bash
# Vérifier que les routes existent
grep -c "path=\"/admin" src/App.tsx
# Résultat attendu: 20+

# Vérifier les imports
grep "import.*Page from" src/App.tsx | wc -l
# Résultat attendu: 15+
```

### ✅ Fichier: .htaccess
```bash
# Vérifier que le fichier existe
ls -la .htaccess

# Vérifier le contenu (doit contenir RewriteEngine)
grep -c "RewriteEngine" .htaccess
# Résultat attendu: 1
```

### ✅ Fichier: src/components/admin/Sidebar.tsx
```bash
# Vérifier les liens formations/services
grep -E "formations|services|admins" src/components/admin/Sidebar.tsx
# Résultat attendu: 3+ matches
```

---

## 🚀 DÉPLOIEMENT SUR VPS

### Étape 1: Préparer le VPS
```bash
# SSH into VPS
ssh user@emploiplus-group.com

# Go to site root (ADAPT PATH!)
cd /var/www/emploiplus-group.com/html
# OR
cd /home/emploiplus-group/public_html
# OR
cd /var/www/emploi-connect

# Backup current files (IMPORTANT!)
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# Clear old files
rm -rf *
rm -rf .git
rm -rf .htaccess
```

### Étape 2: Copier les fichiers
```bash
# FROM votre machine locale:

# Option A: Via SCP
scp -r dist/* user@emploiplus-group.com:/var/www/emploiplus-group.com/html/
scp .htaccess user@emploiplus-group.com:/var/www/emploiplus-group.com/html/

# Option B: Via Git (si déployé via Git)
cd /var/www/emploiplus-group.com/html
git pull origin main
npm install --production
npm run build
cp -r dist/* .
cp .htaccess .
```

### Étape 3: Vérifier le déploiement
```bash
# SSH into VPS
ssh user@emploiplus-group.com
cd /var/www/emploiplus-group.com/html

# Vérifier que index.html est présent
ls -la index.html

# Vérifier que .htaccess est présent et lisible
ls -la .htaccess

# Vérifier les permissions
chmod 755 .
chmod 644 .htaccess
chmod 644 index.html
chmod -R 755 assets/

# Vérifier que mod_rewrite est activé (si Apache)
grep -i "mod_rewrite" /etc/apache2/mods-enabled/rewrite.load 2>/dev/null && echo "✅ mod_rewrite activé" || echo "❌ mod_rewrite pas activé"

# Redémarrer Apache (si applicable)
sudo systemctl restart apache2

# Ou redémarrer Nginx (si applicable)
sudo systemctl restart nginx
```

---

## 🧪 TESTS POST-DÉPLOIEMENT

### Test 1: Page d'accueil
```bash
curl -I https://emploiplus-group.com/
# Expected: HTTP/1.1 200 OK
# Expected header: Content-Encoding: gzip (si compression activée)
```

### Test 2: Page SPA (formations)
```bash
curl -I https://emploiplus-group.com/admin/formations
# Expected: HTTP/1.1 200 OK (PAS 404!)
```

### Test 3: Page SPA (services)
```bash
curl -I https://emploiplus-group.com/admin/services
# Expected: HTTP/1.1 200 OK (PAS 404!)
```

### Test 4: Page SPA (super-admin registration)
```bash
curl -I https://emploiplus-group.com/admin/register/super-admin
# Expected: HTTP/1.1 200 OK (PAS 404!)
# THIS IS THE KEY TEST - Si c'est 404, le .htaccess n'est pas bien configuré
```

### Test 5: API endpoint
```bash
curl -X POST https://emploiplus-group.com/api/auth/super-admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
# Expected: {"success": false, "message": "..."}
# (201 / 400 / 500 sont OK, juste pas 404)
```

### Test 6: Assets (vérifier compression)
```bash
curl -I https://emploiplus-group.com/assets/main.js
# Expected: Content-Encoding: gzip
# OR at least Content-Type: application/javascript
```

### Test 7: Cache headers
```bash
curl -I "https://emploiplus-group.com/assets/main-abc123.js"
# Expected: Cache-Control: max-age=31536000
# (Les fichiers hachés peuvent être cachés longtemps)

curl -I https://emploiplus-group.com/index.html
# Expected: Cache-Control: max-age=0
# (index.html ne doit PAS être caché)
```

---

## 🔍 VÉRIFICATION DANS LE NAVIGATEUR

Ouvrir https://emploiplus-group.com dans le navigateur et tester:

### 1. Navigation publique
- [ ] Page d'accueil charge (`/`)
- [ ] Services visibles (`/services`)
- [ ] Connexion accessible (`/connexion`)

### 2. Navigation admin
- [ ] Page de connexion admin (`/admin/login`)
- [ ] Page d'enregistrement super-admin (`/admin/register/super-admin`)
- [ ] PAS D'ERREUR 404!

### 3. Après connexion (super-admin)
- [ ] Dashboard accessible (`/admin`)
- [ ] Formations module visible et cliquable (`/admin/formations`)
- [ ] Services module visible et cliquable (`/admin/services`)
- [ ] Admins module visible et cliquable (`/admin/admins`)

### 4. Vérifier la console (F12)
- [ ] Pas d'erreurs JavaScript (onglet Console)
- [ ] Pas de 404 sur les assets (onglet Network)
- [ ] API appels réussissent (onglet Network)

---

## ⚠️ SI ERREUR 404 PERSISTE

### Diagnostic Apache
```bash
# SSH into VPS
ssh user@emploiplus-group.com

# 1. Vérifier que .htaccess est présent
ls -la /var/www/emploiplus-group.com/html/.htaccess
# Expected: -rw-r--r-- ... .htaccess

# 2. Vérifier que mod_rewrite est activé
sudo a2enmod rewrite
sudo systemctl restart apache2

# 3. Vérifier le contenu du .htaccess
cat /var/www/emploiplus-group.com/html/.htaccess | head -20

# 4. Vérifier les logs Apache
tail -50 /var/log/apache2/error.log
tail -50 /var/log/apache2/access.log

# 5. Vérifier la configuration AllowOverride
sudo grep -A 5 "DocumentRoot /var/www/emploiplus-group.com/html" /etc/apache2/sites-available/*
# Doit avoir: AllowOverride All (pas All Only)
```

### Diagnostic Nginx
```bash
# SSH into VPS
ssh user@emploiplus-group.com

# 1. Tester la config
sudo nginx -t
# Expected: syntax is okay + successful

# 2. Vérifier que try_files est dans la config
grep -n "try_files" /etc/nginx/sites-available/emploi-connect
# Expected: try_files $uri $uri/ /index.html;

# 3. Vérifier les logs
tail -50 /var/log/nginx/error.log
tail -50 /var/log/nginx/access.log

# 4. Redémarrer
sudo systemctl restart nginx
```

---

## 📊 PERFORMANCE CHECKS

### Vérifier la compression
```bash
curl -I -H "Accept-Encoding: gzip" https://emploiplus-group.com/assets/main.js | grep -i encoding
# Expected: Content-Encoding: gzip
```

### Vérifier le cache
```bash
curl -I https://emploiplus-group.com/assets/main-abc123.js | grep -i cache
# Expected: Cache-Control: max-age=31536000
```

### Vérifier les MIME types
```bash
curl -I https://emploiplus-group.com/assets/main.js | grep -i content-type
# Expected: Content-Type: application/javascript

curl -I https://emploiplus-group.com/assets/style.css | grep -i content-type
# Expected: Content-Type: text/css
```

---

## ✅ CHECKLIST FINALE

### Avant déploiement
- [ ] `npm run build` exécuté avec succès
- [ ] `dist/` créé et contient `index.html`
- [ ] `.htaccess` présent à la racine du projet
- [ ] `src/App.tsx` contient toutes les routes
- [ ] Sidebar pointe vers les bonnes URLs

### Déploiement
- [ ] Fichiers `dist/*` copiés sur le VPS
- [ ] `.htaccess` copié sur le VPS
- [ ] Permissions correctes (644 pour .htaccess, 755 pour dossiers)

### Tests post-déploiement
- [ ] `curl https://url/admin/register/super-admin -I` → 200 OK
- [ ] `curl https://url/admin/formations -I` → 200 OK
- [ ] `curl https://url/admin/services -I` → 200 OK
- [ ] Navigateur: pas d'erreur console (F12)
- [ ] Assets chargent avec compression
- [ ] API endpoint répond (pas 404)

### Validation finale
- [ ] Super-admin peut se créer
- [ ] Super-admin peut se connecter
- [ ] Modules visibles après connexion
- [ ] Navigation fonctionne sans rechargement

---

## 📞 COMMANDES UTILES

```bash
# Vider le cache navigateur (JavaScript)
curl -X PURGE https://emploiplus-group.com/

# Voir les dernières erreurs
tail -100 /var/log/apache2/error.log

# Voir les dernières requêtes
tail -100 /var/log/apache2/access.log

# Redémarrer complètement
sudo systemctl restart apache2

# Voir les files actuelles
ls -la /var/www/emploiplus-group.com/html/ | head -20

# Vérifier la taille du build
du -sh /var/www/emploiplus-group.com/html/

# Voir les fichiers récents
ls -lt /var/www/emploiplus-group.com/html/ | head -10
```

---

**⏱️ Temps estimé pour le déploiement: 15-30 minutes**

**🎯 Prochaines étapes:**
1. ✅ Compiler le build
2. ✅ Copier les fichiers sur VPS
3. ✅ Vérifier les tests basiques
4. ✅ Tester dans le navigateur
5. ✅ Créer le premier super-admin
6. ✅ Valider que les modules s'affichent

**Bonne chance! 🚀**
