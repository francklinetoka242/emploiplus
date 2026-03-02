# 🚀 Guide Démarrage Rapide - APIs Utilisateurs, Notifications & Administrateurs

> Dernière mise à jour: 2 mars 2026

---

## ⚡ Démarrage Rapide (5 minutes)

### 1️⃣ Prérequis

```bash
# Vérifier Node.js est installé
node --version  # v18+ recommandé

# Vérifier npm
npm --version   # v9+ recommandé

# Vérifier PostgreSQL
psql --version  # PostgreSQL 13+ recommandé
```

### 2️⃣ Installation des Dépendances

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend

# Installer les packages
npm install

# ✓ Dépendances installées
```

### 3️⃣ Configuration Environnement

Créer un fichier `.env` à la racine du backend:

```env
# .env
PORT=5000
NODE_ENV=development

# PostgreSQL Connection
DATABASE_URL=postgresql://username:password@localhost:5432/emploi_connect

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# CORS
CORS_ORIGIN=http://localhost:3000

# Mail (optionnel)
MAIL_SERVICE=gmail
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### 4️⃣ Démarrer le Serveur

```bash
# Lancer le serveur
node server.js

# ✓ Output attendu:
# ✓ Database connection successful
# ✓ Server listening on port 5000
# ✓ API available at http://localhost:5000/api
```

---

## 🧪 Tests Rapides

### Via cURL

#### 1. Tester l'endpoint public (Utilisateurs)

```bash
# Pas d'authentification requise
curl -s "http://localhost:5000/api/users" | jq
```

**Réponse attendue:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "candidate",
      "created_at": "2026-03-02T10:30:00Z"
    }
  ]
}
```

#### 2. Obtenir un Token Admin

```bash
# D'abord, créer un compte superadmin (si première utilisation)
curl -X POST "http://localhost:5000/api/auth/superadmin/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "TestPassword123",
    "first_name": "Admin",
    "last_name": "Test"
  }'

# Puis se connecter pour obtenir le token
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:5000/api/auth/superadmin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "TestPassword123"
  }' | jq -r '.token')

echo "Token: $ADMIN_TOKEN"
```

#### 3. Créer un Utilisateur (Admin)

```bash
# Remplacer $ADMIN_TOKEN par votre token réel
curl -X POST "http://localhost:5000/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "candidate@example.com",
    "first_name": "Marie",
    "last_name": "Martin",
    "password": "hashedPassword123",
    "user_type": "candidate"
  }' | jq
```

#### 4. Tester les Notifications

```bash
# Supposons que USER_TOKEN est un token d'utilisateur régulier
curl -s "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# Nombre non-lus
curl -s "http://localhost:5000/api/notifications/unread-count" \
  -H "Authorization: Bearer $USER_TOKEN" | jq
```

#### 5. Tester les Administrateurs

```bash
# Lister tous les administrateurs (super_admin)
curl -s "http://localhost:5000/api/admin/management/admins" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

---

## 📋 Checklist de Vérification

Avant de considérer les APIs comme prêtes:

- [ ] **Utilisateurs**
  - [ ] `GET /api/users` retourne une liste (public)
  - [ ] `GET /api/users/1` retourne un utilisateur (public)
  - [ ] `POST /api/users` crée un utilisateur (admin required)
  - [ ] `PUT /api/users/1` met à jour un utilisateur (admin required)
  - [ ] `DELETE /api/users/1` supprime un utilisateur (admin required)

- [ ] **Notifications**
  - [ ] `GET /api/notifications` retourne une liste (auth required)
  - [ ] `GET /api/notifications/unread-count` retourne le compteur (auth required)
  - [ ] `POST /api/notifications/1/read` marque comme lue (auth required)
  - [ ] `DELETE /api/notifications/1` supprime la notification (auth required)

- [ ] **Administrateurs**
  - [ ] `GET /api/admin/management/admins` retourne une liste (super_admin required)
  - [ ] `POST /api/admin/management/admins/1/block` bloque admin (super_admin required)
  - [ ] `DELETE /api/admin/management/admins/1` supprime admin (super_admin required)
  - [ ] `PUT /api/admin/management/admins/1/role` change le rôle (super_admin required)

---

## 🔧 Dépannage Courant

### Erreur: "Cannot find module 'dotenv'"

```bash
# Solution: Installer les dépendances
npm install

# Vérifier que package-lock.json existe
ls -la package-lock.json
```

### Erreur: "PostgreSQL connection failed"

```bash
# Vérifier la variable DATABASE_URL dans .env
echo $DATABASE_URL

# Vérifier que PostgreSQL est en cours d'exécution
psql -U postgres -c "SELECT NOW()"

# Vérifier que la base de données existe
psql -U postgres -l | grep emploi_connect
```

### Erreur: "Port 5000 already in use"

```bash
# Vérifier quel processus utilise le port
lsof -i :5000

# Tuer le processus
kill -9 <PID>

# Ou utiliser un port différent
PORT=5001 node server.js
```

### Erreur: "Unauthorized: admin access required"

```bash
# Raison: Vous utilisez un token utilisateur pour un endpoint admin
# Solution: Utiliser un token admin (obtenu via /api/auth/superadmin/login)

# Vérifier le token JWT
node -e "console.log(require('jsonwebtoken').decode('your_token_here'))"
```

### Erreur: 404 "Route not found"

```bash
# Vérifier que toutes les routes sont montées dans server.js
grep "app.use.*routes" server.js

# Vérifier l'orthographe de l'endpoint
curl -v "http://localhost:5000/api/users"
```

---

## 🧬 Structure de Fichiers Corrigée

```
backend/
├── models/
│   ├── user.model.js          ✅ Corrigé (first_name, last_name, password)
│   ├── notification.model.js   ✅ Corrigé (read, no type/updated_at)
│   ├── admin.model.js          ✅ Corrigé (no last_login)
│   └── ...
├── controllers/
│   ├── user.controller.js      ✅ Corrigé
│   ├── notification.controller.js  ✅ OK
│   ├── admin.controller.js     ✅ OK
│   └── ...
├── services/
│   ├── user.service.js         ✅ Corrigé
│   ├── notification.service.js ✅ OK
│   ├── admin.service.js        ✅ OK
│   └── ...
├── routes/
│   ├── user.routes.js          ✅ OK
│   ├── notification.routes.js  ✅ OK
│   ├── admin-management.routes.js ✅ OK
│   └── ...
├── middleware/
│   └── auth.middleware.js      ✅ OK
├── config/
│   ├── db.js                   ✅ OK
│   └── env.js                  ✅ OK
├── server.js                   ✅ Montages OK
└── API_ENDPOINTS.md            ✅ Documentation
```

---

## 📊 Variables d'Environnement

```env
# Requis
PORT=5000
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=your_secret_key

# Optionnel mais recommandé
NODE_ENV=development|production
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info|debug|error
```

---

## 🎯 Exemples API Basique

### GET (Public)
```bash
curl "http://localhost:5000/api/users"
```

### GET (Protected)
```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/notifications"
```

### POST (Create)
```bash
curl -X POST "http://localhost:5000/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "first_name": "Test", "last_name": "User", "password": "hash"}'
```

### PUT (Update)
```bash
curl -X PUT "http://localhost:5000/api/users/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Pierre"}'
```

### DELETE (Remove)
```bash
curl -X DELETE "http://localhost:5000/api/users/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📚 Ressources Supplémentaires

1. **Documentation Complète**: Lire [API_ENDPOINTS.md](API_ENDPOINTS.md)
2. **Exemples de Test**: Voir [API_TESTING_EXAMPLES.md](API_TESTING_EXAMPLES.md)
3. **Résumé des Corrections**: Lire [CORRECTIONS_SUMMARY.md](CORRECTIONS_SUMMARY.md)

---

## ✅ Vérification Finale

Pour confirmer que tout fonctionne:

```bash
# 1. Démarrer le serveur
node server.js &

# 2. Attendre 2 secondes
sleep 2

# 3. Vérifier la connexion BD
curl -s "http://localhost:5000/" | jq

# 4. Tester GET public (Utilisateurs)
curl -s "http://localhost:5000/api/users" | jq

# 5. S'arrêter
kill %1
```

**Résultat attendu**: Toutes les requêtes retournent des réponses JSON valides ✅

---

**🎉 Vous êtes prêt à utiliser les APIs!**

Pour toute question ou problème supplémentaire, consultez la [documentation complète](API_ENDPOINTS.md).
