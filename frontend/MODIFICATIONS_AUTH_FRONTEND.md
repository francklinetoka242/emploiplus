# Résumé des Modifications Frontend - Authentification

**Date:** 21 février 2026  
**Objectif:** Corriger les routes d'authentification et le format des données pour correspondre au backend Express (Port 5000)

---

## 📋 Fichiers Modifiés

### 1. **src/pages/Login.tsx** (Admin Login)
**Route corrigée:** `/auth/login` → `/api/auth/admin/login`

```diff
- const res = await fetch(buildApiUrl('/auth/login'), {
+ const res = await fetch(buildApiUrl('/api/auth/admin/login'), {
```

**Impact:** Les administrateurs peuvent maintenant se connecter via l'endpoint admin correct.

---

### 2. **src/pages/LoginUser.tsx** (User Login)
**Route corrigée:** `/auth/admin/login` → `/api/auth/user/login`

```diff
- const response = await fetch(buildApiUrl('/auth/admin/login'), {
+ const response = await fetch(buildApiUrl('/api/auth/user/login'), {
```

**Impact:** Les utilisateurs (candidats/entreprises) se connectent maintenant via l'endpoint user.

---

### 3. **src/pages/Register.tsx** (User Registration - Candidat & Entreprise)

#### Candidat Registration (handleCandidatSubmit):
**Route corrigée:** `/auth/admin/register` → `/api/auth/user/register`

**Avant:**
```typescript
const resp = await fetch(buildApiUrl('/auth/admin/register'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: candidatForm.email,
    password: candidatForm.password,
    full_name: `${candidatForm.firstName} ${candidatForm.lastName}`.trim(),
    country: candidatForm.country,
    city: candidatForm.city,
    phone: candidatForm.phone,
    metadata,
    role: 'admin'
  })
});
```

**Après:**
```typescript
const resp = await fetch(buildApiUrl('/api/auth/user/register'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: candidatForm.firstName,
    last_name: candidatForm.lastName,
    email: candidatForm.email,
    password: candidatForm.password,
    user_type: 'candidate'
  })
});
```

**Changements:**
- ✅ URL endpoint: `/api/auth/user/register`
- ✅ Champs: `first_name` et `last_name` (snake_case au lieu de camelCase)
- ✅ Changement: `user_type: 'candidate'` au lieu de `role: 'admin'`
- ✅ Suppression: métadata complexe (full_name, country, city, phone, etc.) → Backend maintient ces données séparément

#### Entreprise Registration (handleEntrepriseSubmit):
**Avant:**
```typescript
const resp = await fetch(buildApiUrl('/auth/admin/register'), {
  method: 'POST',
  body: JSON.stringify({
    email: entrepriseForm.email,
    password: entrepriseForm.password,
    full_name: entrepriseForm.representative || entrepriseForm.companyName,
    country: 'congo',
    company_name: entrepriseForm.companyName,
    company_address: entrepriseForm.address,
    role: 'admin',
    metadata,
  })
});
```

**Après:**
```typescript
const resp = await fetch(buildApiUrl('/api/auth/user/register'), {
  method: 'POST',
  body: JSON.stringify({
    first_name: entrepriseForm.representative || entrepriseForm.companyName,
    last_name: entrepriseForm.companyName,
    email: entrepriseForm.email,
    password: entrepriseForm.password,
    user_type: 'company'
  })
});
```

**Changements:**
- ✅ URL endpoint: `/api/auth/user/register`
- ✅ Champs: `first_name` et `last_name` avec valeurs appropriées
- ✅ Changement: `user_type: 'company'` au lieu de `role: 'admin'`
- ✅ Suppression: métadata complexe

---

### 4. **src/pages/admin/Login.tsx** (Alternate Admin Login)
**Route corrigée:** `/admin/login` → `/api/auth/admin/login`

```diff
- const res = await fetch(buildApiUrl("/admin/login"), {
+ const res = await fetch(buildApiUrl("/api/auth/admin/login"), {
```

---

### 5. **src/pages/admin/login/page.tsx** (Alternate Admin Login - Route Page)
**Route corrigée:** `/admin/login` → `/api/auth/admin/login`

```diff
- const res = await fetch(buildApiUrl("/admin/login"), {
+ const res = await fetch(buildApiUrl("/api/auth/admin/login"), {
```

---

### 6. **src/components/AdminRegister.tsx** (Admin Registration Component)

**Route corrigée:** `/auth/admin/register` → `/api/auth/admin/register`

**Champs corrigés:** `firstName`/`lastName` → `first_name`/`last_name`

**Avant:**
```typescript
const resp = await fetch(buildApiUrl('/auth/admin/register'), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password,
  }),
});
```

**Après:**
```typescript
const resp = await fetch(buildApiUrl('/api/auth/admin/register'), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    first_name: form.firstName,
    last_name: form.lastName,
    email: form.email,
    password: form.password,
  }),
});
```

---

### 7. **src/pages/admin/Register.tsx** (Super Admin Initial Registration)

**Route corrigée:** `/admin/register` → `/api/auth/admin/register`

**Champs corrigés:** `firstName`/`lastName` → `first_name`/`last_name`

```diff
- const res = await fetch(buildApiUrl("/admin/register"), {
+ const res = await fetch(buildApiUrl("/api/auth/admin/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
-       firstName: form.fullName || "",
-       lastName: "",
+       first_name: form.fullName || "",
+       last_name: "",
        email: form.email,
        password: form.password,
      }),
    });
```

---

### 8. **src/pages/admin/register/components/RegisterForm.tsx** (Admin Registration Form)

**Route corrigée:** `/auth/super-admin/register` → `/api/auth/admin/register`

**Champs corrigés:** `firstName`/`lastName` → `first_name`/`last_name`

**Avant:**
```typescript
const body = {
  firstName: form.prenom,
  lastName: form.nom,
  email: form.email,
  password: form.password,
};

const res = await fetch(buildApiUrl('/auth/super-admin/register'), {
```

**Après:**
```typescript
const body = {
  first_name: form.prenom,
  last_name: form.nom,
  email: form.email,
  password: form.password,
};

const res = await fetch(buildApiUrl('/api/auth/admin/register'), {
```

---

## 🔄 Résumé des Changements

| Aspect | Avant | Après | Impact |
|--------|-------|-------|--------|
| **User Login** | `/auth/admin/login` | `/api/auth/user/login` | ✅ Utilise l'endpoint user correct |
| **Admin Login** | `/auth/login`, `/admin/login` | `/api/auth/admin/login` | ✅ Uniformisé sur un seul endpoint |
| **User Register** | `/auth/admin/register` | `/api/auth/user/register` | ✅ Utilise l'endpoint user correct |
| **Admin Register** | `/auth/admin/register`, `/admin/register` | `/api/auth/admin/register` | ✅ Uniformisé |
| **Champs Utilisateur** | `firstName`, `lastName`, `full_name` | `first_name`, `last_name` | ✅ Correspond à schéma PostgreSQL |
| **Champs Admin** | `firstName`, `lastName` | `first_name`, `last_name` | ✅ Correspond à schéma PostgreSQL |
| **User Type** | `role: 'admin'` | `user_type: 'candidate'` ou `'company'` | ✅ Distinction correcte utilisateur/admin |
| **Métadata Complexe** | Envoyée au backend | Supprimée (pas requise) | ✅ Simplifie les payloads |

---

## ✅ Tests à Valider Post-Commit

### 1. Test User Login
```bash
curl -X POST https://emploiplus-group.com/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"candidat@test.com","password":"SecurePass123!"}'
```

**Réponse attendue:** `201` avec token et user data

### 2. Test User Registration
```bash
curl -X POST https://emploiplus-group.com/api/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"Jean",
    "last_name":"Dupont",
    "email":"jean.dupont@test.com",
    "password":"SecurePass123!",
    "user_type":"candidate"
  }'
```

**Réponse attendue:** `201` avec token et user data

### 3. Test Admin Login
```bash
curl -X POST https://emploiplus-group.com/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@emploiplus-group.com","password":"AdminPass123!"}'
```

**Réponse attendue:** `200` avec token et admin data

### 4. Test Admin Registration
```bash
curl -X POST https://emploiplus-group.com/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"Admin",
    "last_name":"Test",
    "email":"admin-test@emploi.cg",
    "password":"AdminPass123!",
    "role":"admin"
  }'
```

**Réponse attendue:** `201` avec token et admin data

---

## 📦 Commit GitHub Recommandé

```bash
git add src/pages/Login.tsx \
        src/pages/LoginUser.tsx \
        src/pages/Register.tsx \
        src/pages/admin/Login.tsx \
        src/pages/admin/login/page.tsx \
        src/pages/admin/Register.tsx \
        src/pages/admin/register/components/RegisterForm.tsx \
        src/components/AdminRegister.tsx

git commit -m "fix(auth): Uniformaliser les endpoints et champs d'authentification

- Utiliser /api/auth/user/ pour authentification utilisateur
- Utiliser /api/auth/admin/ pour authentification administrateur
- Changer camelCase (firstName/lastName) en snake_case (first_name/last_name)
- Correcter user_type vs role pour différencier user/admin
- Supprimer métadata complexe non requise par le backend

Routes corrigées:
- /auth/login → /api/auth/admin/login
- /auth/admin/login → /api/auth/user/login
- /auth/admin/register → /api/auth/user/register (user)
- /auth/admin/register → /api/auth/admin/register (admin)
- /admin/login → /api/auth/admin/login
- /admin/register → /api/auth/admin/register

Fichiers modifiés: 8
- Login.tsx
- LoginUser.tsx
- Register.tsx (2 fonctions)
- admin/Login.tsx
- admin/login/page.tsx
- admin/Register.tsx
- admin/register/components/RegisterForm.tsx
- AdminRegister.tsx"
```

---

## 🚀 Prochaines Étapes

1. ✅ **Commit** - Push les modifications sur GitHub
2. ✅ **Test** - Valider les endpoints avec curl (voir section "Tests à Valider")
3. ✅ **Build** - `npm run build` pour vérifier la compilation
4. ✅ **Deploy** - Déployer sur le VPS avec `npm run build && pm2 restart app`

---

**Modification complétée:** 21 février 2026, 09:45 UTC
