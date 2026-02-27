# Explication — Configuration backend et routes

Ce document résume la configuration du backend, les variables d'environnement importantes, les routes API principales et où modifier les URLs depuis le code frontend.

## 1) Emplacement principal
- Code backend: [backend](backend)
- Entrée serveur: [backend/src/server.ts](backend/src/server.ts#L1)

## 2) Variables d'environnement importantes
- `PORT` — port d'écoute du backend (ex: `5000`).
- `BACKEND_URL` — URL publique du backend si définie.
- `CORS_ORIGINS` — origines autorisées pour CORS (ex: `http://localhost:5173,https://mon-site-prod`).
- `REDIS_HOST`, `REDIS_PORT`, etc. pour la configuration Redis.

Fichiers qui lisent ces variables:
- [backend/src/server.ts](backend/src/server.ts#L1)
- [backend/src/config/constants.ts](backend/src/config/constants.ts#L1)

## 3) Routes API principales (exemples)
Les routes exposées par le backend suivent majoritairement le préfixe `/api`.

- Auth / comptes
  - POST `/api/auth/login` — authentification (admin/user)
  - POST `/api/auth/register` — inscription utilisateur
  - POST `/api/auth/super-admin/register` — création du super-admin (utilisé au premier démarrage)
  - POST `/api/auth/admin/register` — inscription admin (contenu/entreprise selon implémentation)

- Administration
  - POST `/api/admin/register` — (backend) création admin via endpoint admin
  - POST `/api/admin/create` — création d'autres comptes administrateurs (souvent protégé)

- Données publiques
  - GET `/api/publications` — récupérer publications
  - POST `/api/jobs` — création d'offres (exemple)

- Santé / outils
  - GET `/api/health` — check de santé

Ces routes sont implémentées dans les controllers du backend, par exemple:
- [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts#L1)

## 4) Socket / temps réel
- Socket.IO est intégré côté backend (endpoint usuel: backend sur le même domaine/port). Voir:
  - [backend/src/integrations/socketio.ts](backend/src/integrations/socketio.ts#L1)
  - Les origines autorisées sont configurées via `CORS_ORIGINS`.

## 5) Comment le frontend appelle l'API (production-safe)
- Frontend (Vite) doit utiliser une variable d'env pour l'URL de l'API afin d'éviter d'avoir des `http://localhost:5000` hardcodés en production.
- Variable utilisée dans ce projet: `VITE_API_URL` (nouveau) — fallback historique: `VITE_API_BASE_URL`.

Points d'entrée côté frontend:
- Construction d'URL centralisée: [src/lib/headers.ts](src/lib/headers.ts#L1)
  - `getApiBaseUrl()` retourne `import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''`.
  - `buildApiUrl(path)` construit l'URL complète en s'assurant que le `path` commence par `/`.

Exemples d'appel frontend (bonne pratique):

```js
// Utiliser la variable d'env (exemple montré dans le code modifié)
await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, { method: 'POST', ... })

// Ou avec helper centralisé
fetch(buildApiUrl('/admin/create'), { method: 'POST', headers: authHeaders('application/json', 'adminToken'), body })
```

Fichiers frontend à vérifier / exemples:
- [src/pages/Login.tsx](src/pages/Login.tsx#L1)
- [src/pages/LoginUser.tsx](src/pages/LoginUser.tsx#L1)
- [src/pages/Register.tsx](src/pages/Register.tsx#L1)
- [src/pages/admin/register/components/RegisterForm.tsx](src/pages/admin/register/components/RegisterForm.tsx#L1)
- [src/components/AdminRegister.tsx](src/components/AdminRegister.tsx#L1)
- [src/components/SuperAdminRegister.tsx](src/components/SuperAdminRegister.tsx#L1)

## 6) Proxy Vite (développement)
- En développement, Vite peut proxy les requêtes `/api` vers `http://localhost:5000` via `vite.config.ts`.
- Ce comportement est pour DEV uniquement; en production, le frontend doit appeler l'URL complète fournie par `VITE_API_URL`.
- Fichier de configuration: [vite.config.ts](vite.config.ts#L1)

## 7) Bonnes pratiques et étapes de déploiement
- Dans l'environnement de production (Vercel, Netlify, etc.) configurer la variable `VITE_API_URL` vers l'URL publique du backend (ex: `https://api.monsite.com`).
- Ne jamais laisser d'URL `http://localhost:5000` hardcodée dans le frontend destiné à la production.
- Pour CI/CD: ajouter `VITE_API_URL` aux variables d'environnement du pipeline.

## 8) Debug / vérifications rapides
- Vérifier que `getApiBaseUrl()` retourne bien la valeur attendue: [src/lib/headers.ts](src/lib/headers.ts#L1).
- Dans le navigateur, vérifier dans l'onglet Réseau que les requêtes pointent vers l'API de production et non vers `localhost`.

## 9) Liens utiles dans le repo
- Frontend helpers: [src/lib/headers.ts](src/lib/headers.ts#L1)
- Pages d'authentification frontend: [src/pages/Login.tsx](src/pages/Login.tsx#L1), [src/pages/Register.tsx](src/pages/Register.tsx#L1)
- Admin register form: [src/pages/admin/register/components/RegisterForm.tsx](src/pages/admin/register/components/RegisterForm.tsx#L1)
- Backend serveur: [backend/src/server.ts](backend/src/server.ts#L1)
- Backend auth controller: [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts#L1)

---
Si vous voulez, je peux:
- Committer ces changements et préparer un message de commit.
- Ajouter un petit script de vérification qui scanne `src/**` pour URLs `localhost` avant build.

Fin de l'explication.
