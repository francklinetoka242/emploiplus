# Documentation des APIs Emploi Connect

> **État du projet**: 2 mars 2026
> Les APIs suivantes sont maintenant **fonctionnelles** :
> - ✅ Authentification (Superadmin signup/login)
> - ✅ Publication des offres d'emploi
> - ✅ Utilisateurs (GET, POST, PUT, DELETE)
> - ✅ Notifications (GET, POST, PUT, DELETE)
> - ✅ Administrateurs (GET, POST, PUT, DELETE)

---

## 🔧 Configuration d'Authentification

Toutes les API protégées utilisent le token JWT dans l'en-tête `Authorization`:

```bash
Authorization: Bearer <your_jwt_token>
```

### Types de Tokens

- **Admin Token** (`type: 'admin'`): Pour les administrateurs et super admins
- **User Token** (`type: 'user'`): Pour les utilisateurs standards

---

## 📊 API Utilisateurs

### 1. **Récupérer tous les utilisateurs** (Public)

```http
GET /api/users?limit=20&offset=0
```

**Paramètres de requête:**
- `limit` (int, default: 20): Nombre d'utilisateurs à retourner
- `offset` (int, default: 0): Décalage pour la pagination

**Réponse réussi (200):**
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

---

### 2. **Récupérer un utilisateur par ID** (Public)

```http
GET /api/users/:id
```

**Réponse réussi (200):**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "candidate",
    "created_at": "2026-03-02T10:30:00Z"
  }
}
```

**Code d'erreur:** 404 (Utilisateur non trouvé)

---

### 3. **Créer un nouvel utilisateur** (Admin only - super_admin)

```http
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Corps de la requête:**
```json
{
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "hashedPassword123",
  "user_type": "company"
}
```

**Champs:**
- `email` (string, required): Adresse email unique
- `first_name` (string, required): Prénom
- `last_name` (string, required): Nom de famille
- `password` (string, required): Hash du mot de passe
- `user_type` (string, optional): Type d'utilisateur - `candidate` ou `company` (défaut: `candidate`)

**Réponse réussi (201):**
```json
{
  "data": {
    "id": 2,
    "email": "newuser@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "user_type": "company",
    "created_at": "2026-03-02T11:00:00Z"
  }
}
```

**Codes d'erreur:**
- 400: Email invalide ou déjà en utilisation
- 403: Accès refusé (nécessite super_admin)

---

### 4. **Mettre à jour un utilisateur** (Admin only - super_admin)

```http
PUT /api/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Corps de la requête:**
```json
{
  "first_name": "Janet",
  "email": "newemail@example.com",
  "job_title": "Software Engineer",
  "experience_years": 5
}
```

**Champs modifiables:**
- `email`, `first_name`, `last_name`, `user_type`, `phone`, `job_title`, `profession`, `experience_years`

**Réponse réussi (200):**
```json
{
  "data": {
    "id": 2,
    "email": "newemail@example.com",
    "first_name": "Janet",
    "last_name": "Smith",
    "user_type": "company",
    "created_at": "2026-03-02T11:00:00Z"
  }
}
```

---

### 5. **Supprimer un utilisateur** (Admin only - super_admin)

```http
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

**Réponse réussi (200):**
```json
{
  "message": "User deleted"
}
```

---

## 🔔 API Notifications

### 1. **Récupérer les notifications** (Utilisateur authentifié)

```http
GET /api/notifications?limit=20&offset=0
Authorization: Bearer <user_token>
```

**Paramètres de requête:**
- `limit` (int, default: 20): Nombre de notifications
- `offset` (int, default: 0): Décalage pour la pagination

**Réponse réussi (200):**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "sender_id": null,
      "title": "Nouvelle offre d'emploi",
      "message": "Une nouvelle offre correspond à votre profil",
      "read": false,
      "created_at": "2026-03-02T10:00:00Z"
    }
  ]
}
```

---

### 2. **Récupérer le nombre de notifications non lues** (Utilisateur authentifié)

```http
GET /api/notifications/unread-count
Authorization: Bearer <user_token>
```

**Réponse réussi (200):**
```json
{
  "data": {
    "unread_count": 3
  }
}
```

---

### 3. **Marquer une notification comme lue** (Utilisateur authentifié)

```http
POST /api/notifications/:id/read
Authorization: Bearer <user_token>
```

**Réponse réussi (200):**
```json
{
  "message": "Notification marked as read"
}
```

---

### 4. **Marquer toutes les notifications comme lues** (Utilisateur authentifié)

```http
POST /api/notifications/read-all
Authorization: Bearer <user_token>
```

**Réponse réussi (200):**
```json
{
  "data": {
    "updated_count": 5
  }
}
```

---

### 5. **Supprimer une notification** (Utilisateur authentifié)

```http
DELETE /api/notifications/:id
Authorization: Bearer <user_token>
```

**Réponse réussi (200):**
```json
{
  "message": "Notification deleted"
}
```

---

## 👥 API Administrateurs

### 1. **Récupérer la liste des administrateurs** (Super admin only)

```http
GET /api/admin/management/admins?limit=20&offset=0&status=active&role=1
Authorization: Bearer <super_admin_token>
```

**Paramètres de requête:**
- `limit` (int, default: 20): Nombre d'admins
- `offset` (int, default: 0): Décalage pour la pagination
- `status` (string, optional): Filtre par statut - `active`, `pending`, `blocked`
- `role` (int, optional): Filtre par niveau de rôle (1-5)
- `search` (string, optional): Recherche par nom ou email

**Réponse réussi (200):**
```json
{
  "success": true,
  "admins": [
    {
      "id": 1,
      "first_name": "Admin",
      "last_name": "Chief",
      "email": "admin@example.com",
      "role": "super_admin",
      "role_level": 1,
      "status": "active",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-03-02T10:00:00Z",
      "token_expires_at": null
    }
  ]
}
```

**Codes d'erreur:**
- 401: Token manquant ou invalide
- 403: Accès refusé (nécessite super_admin)

---

### 2. **Bloquer un administrateur** (Super admin only)

```http
POST /api/admin/management/admins/:id/block
Authorization: Bearer <super_admin_token>
```

**Réponse réussi (200):**
```json
{
  "success": true
}
```

---

### 3. **Débloquer un administrateur** (Super admin only)

```http
POST /api/admin/management/admins/:id/unblock
Authorization: Bearer <super_admin_token>
```

**Réponse réussi (200):**
```json
{
  "success": true
}
```

---

### 4. **Supprimer un administrateur** (Super admin only)

```http
DELETE /api/admin/management/admins/:id
Authorization: Bearer <super_admin_token>
```

**Réponse réussi (200):**
```json
{
  "success": true
}
```

---

### 5. **Mettre à jour le rôle d'un administrateur** (Super admin only)

```http
PUT /api/admin/management/admins/:id/role
Authorization: Bearer <super_admin_token>
Content-Type: application/json
```

**Corps de la requête:**
```json
{
  "role_level": 2
}
```

**Niveaux de rôle:**
- `1`: Super Admin (Accès complet)
- `2`: Admin Contenu (Gestion des contenus)
- `3`: Admin Utilisateurs (Gestion des utilisateurs)
- `4`: Admin Analytique (Visualisation des données)
- `5`: Admin Facturation (Gestion des paiements)

**Réponse réussi (200):**
```json
{
  "success": true
}
```

---

### 6. **Renvoyer une invitation** (Super admin only)

```http
POST /api/admin/management/admins/:id/resend-invite
Authorization: Bearer <super_admin_token>
```

**Réponse réussi (200):**
```json
{
  "success": true
}
```

---

### 7. **Vérifier le statut d'un administrateur** (Super admin only)

```http
GET /api/admin/management/admins/:id/verify-status
Authorization: Bearer <super_admin_token>
```

**Réponse réussi (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "status": "pending",
    "token_expires_at": "2026-03-10T00:00:00Z",
    "is_expired": false,
    "expires_in_hours": 192,
    "requires_resend": false
  }
}
```

---

### 8. **Exporter les statistiques** (Super admin only)

```http
GET /api/admin/management/admins/export/stats
Authorization: Bearer <super_admin_token>
```

**Réponse réussi (200):**
```json
{
  "success": true,
  "data": {
    "total_admins": 5,
    "active_admins": 4,
    "inactive_admins": 1,
    "super_admins": 1,
    "content_admins": 2,
    "user_admins": 1,
    "analytics_admins": 1,
    "billing_admins": 0,
    "last_created": "2026-02-28T15:30:00Z"
  }
}
```

---

## 🎯 Codes de Statut HTTP Standards

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Non trouvé |
| 500 | Erreur serveur |

---

## 🔐 Sécurité

- Tous les tokens JWT expirent après **24 heures**
- Les mots de passe doivent être **hachés avant l'envoi** à l'API
- Les endpoints admin exigent l'authentification et le rôle approprié
- Les en-têtes CORS sont configurés au niveau du serveur

---

## 📝 Notes importantes

1. **Authentification**: Utilisez les endpoints `/api/auth/signup` et `/api/auth/login` pour obtenir vos tokens
2. **Pagination**: Tous les endpoints GET de liste supportent `limit` et `offset`
3. **Filtres**: Les filtres sont optionnels et peuvent être combinés
4. **Erreurs**: Les messages d'erreur sont retournés dans le champ `message` ou `error`

---

**Dernière mise à jour**: 2 mars 2026
