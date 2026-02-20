# Analyse — Erreur 404 : Super Admin Registration

## Résumé du Problème

Le frontend reçoit une **erreur 404** lors de la tentative d'inscription d'un Super Admin. Cela indique que l'URL appelée par le frontend ne correspond pas à une route définie sur le backend.

---

## Configuration actuelle

### Backend — Montage des routeurs (`backend/src/server.ts`, ligne 68-69)

```typescript
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
```

### Backend — Définition de la route (`backend/src/routes/auth.ts`, ligne 107)

```typescript
router.post('/super-admin/register', async (req: Request, res: Response) => {
  // ...
});
```

### Frontend — Appel API (`src/pages/admin/register/components/RegisterForm.tsx`, ligne 58)

```tsx
const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/super-admin/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
```

---

## Calcul de l'URL complète

### URL générée par le frontend
```
${VITE_API_URL}/auth/super-admin/register
```

**Exemple concret :**
- Si `VITE_API_URL = https://emploiplus-group.com`
- URL appelée : `https://emploiplus-group.com/auth/super-admin/register`

### URL attendue par le backend

Lorsqu'une requête arrive au backend avec l'URL `https://emploiplus-group.com/auth/super-admin/register` :

1. Express extrait le chemin : `/auth/super-admin/register`
2. Le middleware `app.use('/api/auth', authRoutes)` cherche un chemin commençant par `/api/auth`
3. **PROBLÈME** : Le chemin reçu est `/auth/...` et non `/api/auth/...` — **MISMATCH — 404 !**

---

## Solution

Il y a deux approches pour corriger le 404 :

### Option A : Frontend utilise `buildApiUrl()` (Recommandée depuis nos corrections)

Modifier le frontend pour utiliser la fonction helper `buildApiUrl()` qui ajoute automatiquement `/api` :

**Avant (FAUTIF) :**
```tsx
const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/super-admin/register`, {
```

**Après (CORRECT) :**
```tsx
const res = await fetch(buildApiUrl('/auth/super-admin/register'), {
```

Importer en haut du fichier :
```tsx
import { buildApiUrl } from '@/lib/headers';
```

**URL générée par `buildApiUrl()` :** `https://emploiplus-group.com/api/auth/super-admin/register` ✅

### Option B : Frontend ajoute explicitement `/api`

Si tu ne veux pas utiliser `buildApiUrl()`, ajouter manuellement `/api` au chemin :

```tsx
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/super-admin/register`, {
```

**URL générée :** `https://emploiplus-group.com/api/auth/super-admin/register` ✅

---

## Fichiers à modifier

### 1. `src/pages/admin/register/components/RegisterForm.tsx` (ligne 58)

Remplacer :
```tsx
const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/super-admin/register`, {
```

Par :
```tsx
import { buildApiUrl } from '@/lib/headers';

// ...

const res = await fetch(buildApiUrl('/auth/super-admin/register'), {
```

### 2. `src/components/SuperAdminRegister.tsx` (ligne 40)

Même correction.

---

## Résumé des routes backend disponibles

Les routes d'authentification sont montées sous **`/api/auth`** :

| Méthode | Chemin complet             | Description                      |
|---------|----------------------------|----------------------------------|
| POST    | `/api/auth/admin/register` | Inscription d'un Admin           |
| POST    | `/api/auth/super-admin/register` | **Inscription d'un Super Admin** |
| POST    | `/api/auth/admin/login`    | Connexion Admin                  |
| POST    | `/api/auth/user/register`  | Inscription Candidat/Entreprise  |
| POST    | `/api/auth/user/login`     | Connexion Candidat/Entreprise    |

---

## Vérification post-correction

Après correction :

1. Vérifier que les imports `buildApiUrl` sont présents
2. Tester en ouvrant DevTools (F12) et vérifier l'**URL réelle** envoyée dans l'onglet **Network**
3. Vérifier que la URL affiche : `https://emploiplus-group.com/api/auth/super-admin/register`
4. Regarder la réponse du backend (logs côté serveur et réponse HTTP)

---

## Notes techniques

- **Port du backend** : généralement 5000 ou 3000 selon la configuration `.env`
- **Variables d'environnement frontend** : `VITE_API_URL` définie dans `.env` ou `.env.production`
- **Rate limiting** : une limite de 120 requêtes/15 min est appliquée sur `/api/` (voir `backend/src/server.ts` ligne 58)
