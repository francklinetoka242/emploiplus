# 🧪 Exemples de Test des APIs

## Configuration Base

```bash
# Remplacez ces valeurs par les vôtres
BASE_URL="http://localhost:5000/api"
ADMIN_TOKEN="your_admin_token_here"
USER_TOKEN="your_user_token_here"
ADMIN_ID=1
USER_ID=1
NOTIFICATION_ID=1
```

---

## 🔑 Authentification

### 1. Créer un compte Super Admin (si première utilisation)

```bash
curl -X POST "$BASE_URL/auth/superadmin/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "SecurePassword123",
    "first_name": "Super",
    "last_name": "Admin"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "message": "Super admin created successfully",
  "admin": {
    "id": 1,
    "email": "superadmin@example.com",
    "first_name": "Super",
    "last_name": "Admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Connexion (Super Admin)

```bash
curl -X POST "$BASE_URL/auth/superadmin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "SecurePassword123"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👥 API Utilisateurs

### 1. Récupérer tous les utilisateurs

```bash
# Public (sans authentification requise)
curl -X GET "$BASE_URL/users?limit=10&offset=0"
```

### 2. Récupérer un utilisateur spécifique

```bash
curl -X GET "$BASE_URL/users/1"
```

### 3. Créer un nouvel utilisateur (Admin uniquement)

```bash
curl -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "newcandidate@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "password": "hashedPassword123",
    "user_type": "candidate"
  }'
```

### 4. Mettre à jour un utilisateur (Admin uniquement)

```bash
curl -X PUT "$BASE_URL/users/2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "first_name": "Pierre",
    "job_title": "Développeur Full Stack",
    "experience_years": 7
  }'
```

### 5. Supprimer un utilisateur (Admin uniquement)

```bash
curl -X DELETE "$BASE_URL/users/2" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🔔 API Notifications

### 1. Récupérer mes notifications

```bash
# Utilisateur authentifié uniquement
curl -X GET "$BASE_URL/notifications?limit=20&offset=0" \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 2. Récupérer le nombre de notifications non lues

```bash
curl -X GET "$BASE_URL/notifications/unread-count" \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 3. Marquer une notification comme lue

```bash
curl -X POST "$BASE_URL/notifications/1/read" \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 4. Marquer toutes les notifications comme lues

```bash
curl -X POST "$BASE_URL/notifications/read-all" \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 5. Supprimer une notification

```bash
curl -X DELETE "$BASE_URL/notifications/1" \
  -H "Authorization: Bearer $USER_TOKEN"
```

---

## 👥 API Administrateurs

### 1. Récupérer la liste des administrateurs

```bash
# Super admin uniquement
curl -X GET "$BASE_URL/admin/management/admins?limit=20&offset=0" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 2. Récupérer les administrateurs avec filtres

```bash
# Filtrer par statut
curl -X GET "$BASE_URL/admin/management/admins?status=active&role=2" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Rechercher par nom/email
curl -X GET "$BASE_URL/admin/management/admins?search=admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 3. Bloquer un administrateur

```bash
curl -X POST "$BASE_URL/admin/management/admins/2/block" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 4. Débloquer un administrateur

```bash
curl -X POST "$BASE_URL/admin/management/admins/2/unblock" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 5. Mettre à jour le rôle d'un administrateur

```bash
# Niveaux: 1=Super Admin, 2=Content Admin, 3=User Admin, 4=Analytics Admin, 5=Billing Admin
curl -X PUT "$BASE_URL/admin/management/admins/2/role" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "role_level": 3
  }'
```

### 6. Renvoyer une invitation à un administrateur

```bash
curl -X POST "$BASE_URL/admin/management/admins/2/resend-invite" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 7. Vérifier le statut de vérification d'un administrateur

```bash
curl -X GET "$BASE_URL/admin/management/admins/2/verify-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 8. Supprimer un administrateur

```bash
curl -X DELETE "$BASE_URL/admin/management/admins/2" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 9. Exporter les statistiques

```bash
curl -X GET "$BASE_URL/admin/management/admins/export/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📊 Exemples Python (Requests)

### Récupérer les utilisateurs

```python
import requests

BASE_URL = "http://localhost:5000/api"

# GET sans authentification
response = requests.get(f"{BASE_URL}/users?limit=10")
users = response.json()
print(users)
```

### Créer un utilisateur (Admin)

```python
import requests

BASE_URL = "http://localhost:5000/api"
ADMIN_TOKEN = "your_admin_token"

headers = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json"
}

payload = {
    "email": "newuser@example.com",
    "first_name": "Marie",
    "last_name": "Martin",
    "password": "hashedPassword123",
    "user_type": "company"
}

response = requests.post(f"{BASE_URL}/users", headers=headers, json=payload)
print(response.status_code)
print(response.json())
```

### Récupérer les notifications

```python
import requests

BASE_URL = "http://localhost:5000/api"
USER_TOKEN = "your_user_token"

headers = {
    "Authorization": f"Bearer {USER_TOKEN}"
}

response = requests.get(f"{BASE_URL}/notifications?limit=20", headers=headers)
notifications = response.json()
print(notifications)
```

### Marquer une notification comme lue

```python
import requests

BASE_URL = "http://localhost:5000/api"
USER_TOKEN = "your_user_token"

headers = {
    "Authorization": f"Bearer {USER_TOKEN}"
}

notification_id = 1
response = requests.post(f"{BASE_URL}/notifications/{notification_id}/read", headers=headers)
print(response.json())
```

---

## 🧪 Exemples JavaScript (Fetch API)

### Récupérer les utilisateurs (Frontend)

```javascript
const BASE_URL = "http://localhost:5000/api";

fetch(`${BASE_URL}/users?limit=10`)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Créer un utilisateur (Admin)

```javascript
const BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN = "your_admin_token";

const payload = {
  email: "newuser@example.com",
  first_name: "Sophie",
  last_name: "Leclerc",
  password: "hashedPassword123",
  user_type: "candidate"
};

fetch(`${BASE_URL}/users`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Récupérer les notifications

```javascript
const BASE_URL = "http://localhost:5000/api";
const USER_TOKEN = "your_user_token";

fetch(`${BASE_URL}/notifications?limit=20`, {
  headers: {
    "Authorization": `Bearer ${USER_TOKEN}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

---

## 📋 Collection Postman

Voici une collection Postman pour importer dans Postman:

```json
{
  "info": {
    "name": "Emploi Connect API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Utilisateurs",
      "item": [
        {
          "name": "GET - Tous les utilisateurs",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/users?limit=10&offset=0"
          }
        },
        {
          "name": "GET - Utilisateur par ID",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/users/1"
          }
        }
      ]
    }
  ]
}
```

---

## ✅ Checklist de Test

- [ ] GET /api/users (public)
- [ ] GET /api/users/:id (public)
- [ ] POST /api/users (admin required)
- [ ] PUT /api/users/:id (admin required)
- [ ] DELETE /api/users/:id (admin required)
- [ ] GET /api/notifications (user token required)
- [ ] POST /api/notifications/:id/read (user token required)
- [ ] GET /api/admin/management/admins (super_admin required)
- [ ] POST /api/admin/management/admins/:id/block (super_admin required)
- [ ] POST /api/admin/management/admins/:id/unblock (super_admin required)

---

**Remarques:**
- Remplacez `localhost:5000` par votre URL de serveur
- Utilisez HTTPS en production
- Les tokens JWT expirent après 24 heures
- Tous les mots de passe doivent être hachés avant d'être envoyés
