# 🔧 Guide de Débogage - Inscription Super Admin

## 📋 Améliorations apportées

### 1. **Frontend - RegisterForm.tsx** (Logs ajoutés)
```tsx
console.log('📤 Frontend envoie au serveur:', JSON.stringify(body, null, 2));
console.log('   form.nom:', form.nom);
console.log('   form.prenom:', form.prenom);
console.log('   form.email:', form.email);
```

**Structure envoyée:**
```json
{
  "firstName": "Jean",      // from form.prenom
  "lastName": "Dupont",     // from form.nom
  "email": "admin@test.com",
  "password": "password123"
}
```

---

### 2. **Backend Route - /super-admin/register** (Logs complets)

#### A. Réception de la requête
```log
👉 Requête reçue sur la route d'inscription Super Admin (auth.ts /super-admin/register)
📥 Données reçues pour inscription: {
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "admin@test.com",
  "password": "password123"
}
✅ Role forced by route: super_admin
```

#### B. Extraction des champs
```log
🔍 Champs extraits:
   firstName: Jean
   lastName: Dupont
   email: admin@test.com
   password: ***
```

#### C. Validation
- ✅ SI VALIDE: Affiche `📤 Appel au service registerAdmin avec:`
- ❌ SI INVALIDE: Affiche `❌ Validation échouée - champs manquants` + détails

```log
❌ Validation échouée - champs manquants
{
  "success": false,
  "message": "Tous les champs sont requis (firstName/nom, lastName/prenom, email, password)",
  "received": {
    "firstName": "Jean",
    "lastName": null,      // ⚠️ Manquant!
    "email": "admin@test.com",
    "password": "defined"
  }
}
```

#### D. Appel au service
```log
📤 Appel au service registerAdmin avec:
   email: admin@test.com
   nom: Dupont
   prenom: Jean
   role: super_admin
```

---

### 3. **Backend Service - adminAuthService.ts** (Mapping)

#### A. Préparation des données
```log
   📝 Données envoyées à la DB: { 
     last_name: 'Dupont', 
     first_name: 'Jean', 
     email: 'admin@test.com', 
     role: 'super_admin' 
   }
```

#### B. INSERT SQL
```sql
INSERT INTO public.admins (last_name, first_name, email, password, role)
VALUES ($1, $2, $3, $4, $5)
RETURNING *
-- $1: 'Dupont'
-- $2: 'Jean'
-- $3: 'admin@test.com'
-- $4: <hashed_password>
-- $5: 'super_admin'
```

#### C. Résultat
```log
   ✅ INSERT successful, returned admin: {
     id: 1,
     last_name: 'Dupont',
     first_name: 'Jean',
     email: 'admin@test.com',
     role: 'super_admin',
     created_at: '2026-02-18T...'
   }
```

---

### 4. **Backend Route - Response** (Résumé)

#### ✅ Succès
```log
📋 Résultat du service: { success: true, message: '...' }
✅ Inscription super admin réussie!
```

Response HTTP 200:
```json
{
  "success": true,
  "message": "Admin créé! Un email de confirmation a été envoyé.",
  "admin": {
    "id": 1,
    "email": "admin@test.com",
    "last_name": "Dupont",
    "first_name": "Jean",
    "role": "super_admin"
  }
}
```

#### ❌ Erreur
```log
⚠️ Inscription super admin échouée: Cet email est déjà utilisé
```

Response HTTP 400:
```json
{
  "success": false,
  "message": "Cet email est déjà utilisé"
}
```

---

## 📊 Flux Complet - Graphique

```
Frontend (RegisterForm.tsx)
  ├─ Récupère: form.nom, form.prenom, form.email, form.password
  ├─ Mappe: { firstName: form.prenom, lastName: form.nom, email, password }
  ├─ Envoie log: "📤 Frontend envoie au serveur: {...}"
  └─ POST http://localhost:5000/api/auth/super-admin/register
       │
       ▼
Backend Route (auth.ts /super-admin/register)
  ├─ Reçoit JSON: { firstName, lastName, email, password }
  ├─ Envoie log: "📥 Données reçues pour inscription: {...}"
  ├─ Extrait: lastName = req.body.lastName || req.body.nom
  ├─ Extrait: firstName = req.body.firstName || req.body.prenom
  ├─ Valide: ✅ lastName, firstName, email, password requis
  ├─ Force role: "super_admin" (jamais du req.body)
  ├─ Envoie log: "📤 Appel au service registerAdmin avec: {...}"
  └─ Appelle: registerAdmin({ email, password, nom: lastName, prenom: firstName, role })
       │
       ▼
Backend Service (adminAuthService.ts)
  ├─ Valide format email
  ├─ Vérifie pas de doublon
  ├─ Hash password (bcrypt, 10 rounds)
  ├─ Prépare: last_name = data.nom, first_name = data.prenom
  ├─ Envoie log: "📝 Données envoyées à la DB: {...}"
  ├─ Exécute: INSERT INTO public.admins (last_name, first_name, email, password, role)
  ├─ Envoie log: "✅ INSERT successful, returned admin: {...}"
  ├─ Envoie email de vérification
  └─ Retourne: { success: true, admin: {...} }
       │
       ▼
Backend Route (Response)
  ├─ Envoie log: "📋 Résultat du service: {...}"
  ├─ SI success=true:
  │  ├─ Envoie log: "✅ Inscription super admin réussie!"
  │  └─ HTTP 200 + JSON response
  └─ SI success=false:
     ├─ Envoie log: "⚠️ Inscription super admin échouée: [...message]"
     └─ HTTP 400 + error response
```

---

## 🧪 Tests à Faire

### Test 1: Vérifier qu'on envoie bien firstName/lastName du frontend
```
1. Ouvrir Console (F12) dans le navigateur
2. Naviguer à http://localhost:5173/admin/register/super-admin
3. Remplir: Prénom=Jean, Nom=Dupont, Email=jean@test.com, Pass=12345678
4. Soumettre le formulaire
5. Chercher dans Console: "📤 Frontend envoie au serveur:"
6. Vérifier { firstName: "Jean", lastName: "Dupont", email, password }
```

### Test 2: Vérifier la réception dans le backend
```
1. Terminal: cd backend && npm run dev
2. Observer tous les logs jusqu'à "✅ Name forced by route"
3. Vérifier que firstName=Jean et lastName=Dupont
```

### Test 3: Vérifier l'insertion en DB
```
1. Observer le log: "📝 Données envoyées à la DB: { last_name: 'Dupont', first_name: 'Jean', ... }"
2. Puis: "✅ INSERT successful"
3. Vérifier la réponse HTTP 200 avec admin object
```

### Test 4: Vérifier l'email de vérification
```
1. Chercher dans les logs du serveur SMTP
2. Vérifier qu'un email a été envoyé à jean@test.com
3. Cliquer sur le lien de vérification
```

---

## 🐛 Diagnostiquer les Erreurs

### ❌ Erreur 400: "Tous les champs sont requis"

**Cause probable:** Un champ manquant dans JSON envoyé du frontend.

**Solution:** 
1. Vérifier les logs frontend: `console.log('📤 Frontend envoie...')`
2. Vérifier que form.nom et form.prenom ne sont pas vides
3. Vérifier que le formulaire HTML a les bons champs

### ❌ Erreur 500: "Erreur serveur"

**Cause probable:** Problème SQL (colonne inexistante, type incohérent, etc.)

**Solution:**
1. Vérifier log: "❌ SQL Error:"
2. Chercher le code d'erreur PostgreSQL (ex: 42703 = column doesn't exist)
3. Vérifier que les colonnes first_name, last_name existent en DB:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name='admins';
   ```

### ❌ Erreur "Cet email est déjà utilisé"

**Cause:** Adresse email déjà en base.

**Solution:**
1. Utiliser un nouvel email
2. Ou nettoyer la base: `DELETE FROM admins WHERE email ILIKE '%test%';`

---

## 📌 Checklist Avant Déploiement

- [ ] Frontend envoie `{ firstName, lastName, email, password }`
- [ ] Backend reçoit et log ces champs
- [ ] Route /super-admin/register force role='super_admin' (jamais du body)
- [ ] Service mappe firstName→first_name, lastName→last_name
- [ ] INSERT utilise colonnes anglaises (first_name, last_name)
- [ ] Pas d'erreur 400 sur validation
- [ ] Admin créé apparaît en base de données
- [ ] Email de vérification envoyé

---

## 🔗 Fichiers Modifiés

1. **frontend:** `/src/pages/admin/register/components/RegisterForm.tsx`
   - Logs: Frontend envoie les données

2. **backend:** `/src/routes/auth.ts` (POST /super-admin/register)
   - Logs: Requête reçue, champs extraits, validation, appel au service, résultat

3. **backend:** `/src/services/adminAuthService.ts` (registerAdmin)
   - LOG existant: Données envoyées à DB
   - SQL existant: INSERT avec colonnes first_name, last_name

---

## 💾 Résumé SQL Expected

```sql
-- Ce que le backend devrait envoyer à PostgreSQL:
INSERT INTO public.admins (last_name, first_name, email, password, role)
VALUES ('Dupont', 'Jean', 'jean@test.com', '$2a$10$...hashedpassword...', 'super_admin')
RETURNING *;

-- Résultat attendu:
id | last_name | first_name | email          | password               | role       | created_at
1  | Dupont    | Jean       | jean@test.com  | $2a$10$...hash...      | super_admin | 2026-02-18...
```

---

✅ **Avec ces logs, tu vois exactement où le problème se produit!**
