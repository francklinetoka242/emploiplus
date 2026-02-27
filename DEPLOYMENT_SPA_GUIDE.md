# 🚀 GUIDE COMPLET DE DÉPLOIEMENT - EMPLOI+ ADMIN MODULES

## 📋 RÉSUMÉ DES PROBLÈMES RÉSOLUS

### ✅ Problème 1: Erreur 404 sur /admin/register/super-admin
**Cause** : Le serveur (Apache/Nginx) ne redirige pas les requêtes SPA vers index.html
**Solution** : Créer un fichier .htaccess (Apache) ou configurer Nginx

### ✅ Problème 2: Modules Formations/Services/Admins invisibles
**Cause** : Routes manquantes dans App.tsx ou navigation Sidebar non mise à jour
**Solution** : Routes et Sidebar sont MAINTENANT complets et corrects

---

## 🔍 VÉRIFICATIONS PRÉ-DÉPLOIEMENT

### 1️⃣ Vérifier que les routes existent dans src/App.tsx
```bash
grep -E "(formations|admins|services)" src/App.tsx
```

**Résultat attendu :**
```
- /admin/formations (ligne 243)
- /admin/admins (ligne 235)
- /admin/services (ligne 249)
- /admin/register/super-admin (ligne 280)
- /admin/register/content-admin (ligne 281)
- /admin/register/user-admin (ligne 282)
```

### 2️⃣ Vérifier les imports des pages admin
```bash
grep -E "import.*Page from.*admin/(formations|admins|services)" src/App.tsx
```

**Résultat attendu :**
```
✅ FormationsPage from "./pages/admin/formations/page"
✅ AdminsPage from "./pages/admin/admins/page"
✅ ServicesPage from "./pages/admin/services/page"
```

### 3️⃣ Vérifier la Sidebar
```bash
grep -A2 "admin_offres" src/components/admin/Sidebar.tsx
```

**Résultat attendu :**
```tsx
{ label: "Offres d'emploi", icon: Briefcase, path: "/admin/jobs" },
{ label: "Formations", icon: BookOpen, path: "/admin/formations" },
{ label: "Services", icon: ShoppingBag, path: "/admin/services" },
```

### 4️⃣ Vérifier que les fichiers existent
```bash
ls -la src/pages/admin/{formations,admins,services}/page.tsx
ls -la src/components/admin/{formations,admins,services}/
```

### 5️⃣ Vérifier la route API backend
```bash
grep -n "'/super-admin/register'" backend/src/routes/auth.ts
```

**Résultat attendu :**
```
✅ router.post('/super-admin/register', async (req: Request, res: Response) => {
```

---

## 📦 FICHIERS CRÉÉS/MODIFIÉS

### ✅ Fichiers modifiés :
- [x] `src/App.tsx` - Routes et imports vérifiés
- [x] `src/components/admin/Sidebar.tsx` - Navigation mise à jour
- [x] `src/pages/admin/services/page.tsx` - CRÉÉ
- [x] `src/components/admin/services/ServiceList.tsx` - CRÉÉ
- [x] `.htaccess` - CRÉÉ pour Apache SPA routing
- [x] `nginx.conf.example` - CRÉÉ pour Nginx SPA routing

---

## 🛠️ ÉTAPES DE DÉPLOIEMENT

### Étape 1: Préparer le build
```bash
# Installer les dépendances (si nécessaire)
npm install

# Nettoyer les anciens builds
rm -rf dist/

# Créer le build de production
npm run build

# Vérifier que dist/ a été créé et contient index.html
ls -la dist/index.html
```

### Étape 2: Déployer sur Apache (VPS)
```bash
# Se connecter au VPS
ssh user@emploiplus-group.com

# Accéder au répertoire du site
cd /var/www/emploiplus-group.com/html
# ou
cd /home/emploiplus-group/public_html

# Copier les fichiers dist
cp -r dist/* .

# Copier le .htaccess
cp .htaccess ./

# Vérifier que .htaccess est présent
ls -la .htaccess

# Donner les bons droits
chmod 644 .htaccess
chmod 755 .
```

### Étape 3: Déployer sur Nginx (VPS)
```bash
# Se connecter au VPS
ssh user@emploiplus-group.com

# Copier les fichiers dist
sudo cp -r dist/* /var/www/emploi-connect/

# Copier la config Nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/emploi-connect

# Activer la configuration
sudo ln -s /etc/nginx/sites-available/emploi-connect /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Étape 4: Vérifier le déploiement
```bash
# Vérifier que index.html est accessible
curl https://emploiplus-group.com/

# Vérifier que les routes SPA fonctionnent
curl https://emploiplus-group.com/admin/register/super-admin -I

# Résultat attendu : HTTP/1.1 200 OK (et pas 404)

# Vérifier les API
curl https://emploiplus-group.com/api/auth/super-admin/register -X POST
```

---

## 🔐 VÉRIFIER LA ROUTE SUPER-ADMIN

### Backend API Endpoint
```
POST /api/auth/super-admin/register
```

**Format de la requête :**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "admin@emploiplus-group.com",
  "password": "SecurePassword123!"
}
```

**ou format alternatif :**
```json
{
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "admin@emploiplus-group.com",
  "password": "SecurePassword123!"
}
```

### Tester l'endpoint
```bash
curl -X POST https://emploiplus-group.com/api/auth/super-admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "Super",
    "email": "admin@emploiplus.com",
    "password": "TestPass123!"
  }'
```

---

## 🌐 CONFIGURATION APACHE HTACCESS

Le fichier `.htaccess` créé contient :

### Redirection SPA
```apache
RewriteEngine On
RewriteRule ^ index.html [QSA,L]
```

Cela signifie : **Toute requête qui n'est pas un fichier/dossier réel est redirigée vers index.html**

### Ce qui se passe :
1. Requête vers `/admin/register/super-admin`
2. Apache vérifie : est-ce un fichier? → NON
3. Apache vérifie : est-ce un dossier? → NON
4. Apache redirige vers `index.html`
5. React Router intercepte la route et affiche la bonne page

---

## 🌐 CONFIGURATION NGINX

Équivalent Nginx du .htaccess :
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## ✅ CHECKLIST FINALE

- [ ] `.htaccess` est présent à la racine du site (niveau d'index.html)
- [ ] `src/App.tsx` contient les routes `/admin/formations`, `/admin/admins`, `/admin/services`
- [ ] `src/App.tsx` contient la route `/admin/register/super-admin`
- [ ] `Sidebar.tsx` affiche les liens "Formations", "Services", "Administrateurs"
- [ ] Les fichiers pages existent : `src/pages/admin/{formations,admins,services}/page.tsx`
- [ ] Les composants existent : `src/components/admin/{formations,admins,services}/*`
- [ ] Le build passe sans erreurs : `npm run build`
- [ ] Le dossier `dist/` contient `index.html`
- [ ] Les fichiers sont copiés sur le VPS
- [ ] `.htaccess` ou Nginx config est correctement configuré
- [ ] Test : `curl https://emploiplus-group.com/admin/register/super-admin -I` retourne HTTP 200

---

## 🆘 DÉPANNAGE

### Erreur 404 persiste ?
1. Vérifier que `.htaccess` est bien présent
2. Vérifier que `mod_rewrite` est activé : `a2enmod rewrite`
3. Redémarrer Apache : `systemctl restart apache2`
4. Vider le cache du navigateur (Ctrl+Shift+Del)

### Routes ne répondent pas ?
1. Vérifier que `index.html` est accessible : `curl https://emploiplus-group.com/`
2. Vérifier les logs : `tail -100 /var/log/apache2/error.log`
3. Vérifier que les API répondent : `curl https://emploiplus-group.com/api/health`

### Modules ne s'affichent pas ?
1. Vérifier la console (F12) pour les erreurs JavaScript
2. Vérifier que les composants sont importés : `grep -n "import.*FormationsPage" src/App.tsx`
3. Vérifier que vous êtes connecté en tant que super_admin
4. Vérifier le localStorage : `localStorage.getItem('admin')`

---

## 📞 CONTACT SUPPORT

Si les problèmes persistent :
1. Vérifier les logs du backend : `docker logs backend` (ou selon votre setup)
2. Vérifier les logs du serveur : SSH et `tail -100 /var/log/apache2/error.log`
3. Activer le DevTools : F12 dans le navigateur et regarder l'onglet Network
