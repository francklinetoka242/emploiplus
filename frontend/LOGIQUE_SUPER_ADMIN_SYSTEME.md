# Logique du compte Super Admin

Ce document résume la logique technique autour du compte `super_admin` telle qu'implémentée dans le backend.

**Fichiers analysés**
- [backend/src/routes/auth.ts](backend/src/routes/auth.ts)
- [backend/src/routes/admin-auth.ts](backend/src/routes/admin-auth.ts)
- [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)
- [backend/src/services/adminAuthService.ts](backend/src/services/adminAuthService.ts)
- [backend/init-db.js](backend/init-db.js)
- [backend/src/types/index.ts](backend/src/types/index.ts)

---

## 1) Identification

- Lors de la connexion d'un administrateur (route login), le code récupère la ligne correspondante dans la table `admins` puis injecte la valeur du champ `role` dans le token JWT créé.
- Exemples concrets dans le code:
  - `backend/src/services/adminAuthService.ts` — loginAdmin: le token est généré par `jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" })`.
  - `backend/src/routes/auth.ts` — pour certaines routes d'admin le token est aussi créé avec `jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' })`.

=> Conclusion: la différenciation `admin` vs `super_admin` se fait via la valeur string stockée dans la colonne `role` de la table `admins`, réinjectée dans le JWT au login/inscription.

## 2) Protection des routes (middlewares)

- Middleware principal interdisant l'accès aux actions réservées au Super Admin:
  - `isSuperAdmin` (fonction exportée) — fichier: [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)
    - Vérifie le header `Authorization`, décode le token et refuse si `decoded.role !== 'super_admin'` (renvoie 403 avec message `Seul un Super Admin peut effectuer cette action`).

- Middleware d'authentification utilisé en amont:
  - `authenticateToken` — fichier: [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)
    - Vérifie la présence/validité du JWT et attache `req.body.userId = decoded.id`.

- Middleware `adminAuth` — fichier: [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)
  - Autorise plusieurs rôles: `['admin', 'super_admin', 'admin_content']`. Important: `adminAuth` n'empêche PAS un admin classique d'accéder aux routes admin; il permet l'accès aux admins et super_admin. Seul `isSuperAdmin` est exclusif.

Fichiers / routes qui utilisent explicitement `isSuperAdmin`:
- `POST /api/admin/create` — route définie dans [backend/src/routes/admin-auth.ts](backend/src/routes/admin-auth.ts) utilise les middlewares `authenticateToken, isSuperAdmin` (ligne: `router.post("/create", authenticateToken, isSuperAdmin, ...)`).

## 3) Payload JWT (données injectées dans le token de session)

- Forme standard injectée pour les comptes admin:

```json
{ "id": <admin.id>, "role": "<role_string>" }
```

- Emplacements de génération:
  - `backend/src/services/adminAuthService.ts` (loginAdmin): `jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" })`.
  - `backend/src/routes/auth.ts` (admin/user registration & login snippets): `jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' })` ou pour les users `{ id: user.id, role: user.user_type }`.
  - `backend/src/middleware/auth.ts` (helper `generateToken`) : renvoie `jwt.sign({ id: userId, role: userRole }, JWT_SECRET, { expiresIn: '30d' })` — note: c'est un helper utilisé par certains controllers (durée différente).

=> Remarques sur l'expiration:
- Deux durées observées : `7d` (utilisé par `adminAuthService.ts` et certaines routes) et `30d` (utilisé par `generateToken` dans `middleware/auth.ts`).

## 4) Privilèges — Actions réservées au Super Admin (selon le code actuel)

- Route explicitement protégée par `isSuperAdmin` :
  - `POST /api/admin/create` — [backend/src/routes/admin-auth.ts](backend/src/routes/admin-auth.ts)
    - Description: création d'un compte admin (role forced to `'admin'`) par un Super Admin.

- Routes de type « super-admin only » supplémentaires :
  - Aucune autre route dans `backend/src/routes/*` applique actuellement `isSuperAdmin`. (Des fichiers `server.ts` historiques/bak contiennent des vérifications, mais elles ne font pas partie des routes actives analysées.)

=> Conclusion: Dans l'état actuel du code, la seule action explicitement réservée exclusivement au `super_admin` est la création d'autres admins via `POST /api/admin/create` protégée par `isSuperAdmin`.

## 5) Persistance (table `admins` dans PostgreSQL)

- Script de création initial (extrait) : [backend/init-db.js](backend/init-db.js)
  - Création observée :

```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
)
```

- Insertion d'exemple (initialisation) :
  - `INSERT INTO admins (email, password, full_name, role) VALUES (..., 'super_admin')` — cf. `init-db.js`.

- Observations importantes (incohérences) :
  - Le script `init-db.js` crée la colonne `full_name` pour `admins`.
  - En revanche, `backend/src/services/adminAuthService.ts` exécute un `INSERT INTO public.admins (last_name, first_name, email, password, role, ...)` et `RETURNING id, email, last_name, first_name, role` — i.e. il s'attend à des colonnes `last_name` / `first_name` et non `full_name`.
  - Cette divergence entre le script d'initialisation et les requêtes SQL dans les services constitue un risque d'erreur (colonnes manquantes). Il faut harmoniser le schéma (utiliser `last_name`/`first_name` ou `full_name` partout).

## 6) Résumé concis

- Identification: La différenciation `admin` vs `super_admin` repose sur le champ `role` stocké dans la table `admins`, propagé dans le JWT lors du login/inscription.
- Middleware bloquant l'accès: `isSuperAdmin` (backend/src/middleware/auth.ts) — c'est le seul middleware explicitement restrictif pour `super_admin`.
- JWT payload: objet `{ id, role }` signé avec `JWT_SECRET` (durée: `7d` ou `30d` selon l'appel).
- Actions réservées: actuellement uniquement `POST /api/admin/create` (route protégée par `authenticateToken, isSuperAdmin`).
- Persistance: colonne `role` (TEXT) dans `admins`; attention à l'incohérence `full_name` vs `first_name`/`last_name` entre `init-db.js` et `adminAuthService.ts`.

---

Si tu veux, j'aligne maintenant le schéma SQL avec les requêtes (`last_name`/`first_name`) ou je corrige les requêtes pour utiliser `full_name`. Veux-tu que je propose un patch de migration ?
