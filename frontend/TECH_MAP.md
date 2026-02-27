TECH MAP - Emploi Connect / Emploi Plus
=====================================

Architecture Globale
- `backend/`: API server (TypeScript/Node). Contient
  - `backend/src/config/`: configuration (DB pool, constants) — ex: [backend/src/config/database.ts](backend/src/config/database.ts)
  - `backend/src/routes/`: route modules (auth, admin-auth, webhooks, microservices) — ex: [backend/src/routes/index.ts](backend/src/routes/index.ts)
  - `backend/src/controllers/`: controller helpers (auth, catalog...)
  - `backend/src/services/`: logique métier (newsfeed, push, matching)
  - `backend/src/middleware/`: auth, cors, error handling
  - `backend/src/types/`: types partagés
  - `backend/src/migrations/`: SQL migrations
- `src/`: Frontend React app (components, pages, lib/db helper)
- `public/`: assets statiques
- `DOCS/`, `scripts/`, `tests/`, `uploads/`, `bd/`: docs, utilitaires, tests, fichiers uploadés, DB helpers

Routes d'Authentification
- Fichiers principaux: [backend/src/routes/auth.ts](backend/src/routes/auth.ts) et [backend/src/routes/admin-auth.ts](backend/src/routes/admin-auth.ts)
- Endpoints exposés (préfixe `/api` monté dans le serveur):
  - POST /api/auth/admin/register — inscription admin
  - POST /api/auth/admin/login — connexion admin
  - POST /api/auth/super-admin/register — inscription super-admin
  - POST /api/auth/user/register — inscription utilisateur (candidate/company)
  - POST /api/auth/user/login — connexion utilisateur
  - POST /api/auth/sync-google — synchronisation OAuth Google
  - POST /api/admin/register — route admin (content/special) (voir [backend/src/routes/admin-auth.ts](backend/src/routes/admin-auth.ts))

Types d'utilisateurs gérés
- `candidate`, `company` (utilisateurs standards)
- `admin`, `super_admin`, `content_admin`, `admin_offers`, `admin_users` (rôles admin)

Points de Blocage TS (analyse ciblée)
- Remarque importante: il n'y a pas de `src/index.ts` à la racine du repo — les entrées serveur actives sont `backend/src/server.ts` et `backend/src/server-modular.ts` (vérifier les deux) — voir [backend/src/server.ts](backend/src/server.ts) et [backend/src/server-modular.ts](backend/src/server-modular.ts).
- Cause la plus probable de l'erreur de type sur `PORT`:
  - `process.env.PORT` est toujours une chaîne (`string | undefined`) selon Node typings.
  - Dans plusieurs fichiers le code mélange valeurs `string` et `number` (ex: `const PORT = process.env.PORT || API_PORT || 5000;`) ce qui produit un type `string | number`.
  - TypeScript signale une incompatibilité si on passe ce `PORT` à des API qui attendent `number` (ou si un `const PORT: number` est attendu ailleurs).
  - Certaines variantes utilisent `Number(PORT)` ou `parseInt(...)` (correct), d'autres non (source d'incohérence).
- Recommandation de correction (rapide):
  1. Unifier l'initialisation du port au même endroit (ex: dans [backend/src/config/constants.ts](backend/src/config/constants.ts) on exporte déjà `API_PORT` en `number`).
  2. Dans l'entrée serveur utiliser explicitement une conversion: `const PORT: number = Number(process.env.PORT ?? API_PORT ?? 5000);` ou `const PORT = parseInt(process.env.PORT ?? String(API_PORT ?? 5000), 10);` puis passer `PORT` (type `number`) à `listen`.
  3. Rechercher et remplacer les utilisations dispersées de `process.env.PORT || API_PORT || 5000` par la même helper/utilitaire.
  4. Vérifier qu'il n'existe pas de déclarations globales `process.env` modifiées (aucune `env.d.ts` évidente dans `backend/src/types`), et s'assurer que `tsconfig.json` accepte `esModuleInterop`/`allowJs` selon le mix JS/TS.

État des API (routes actives / supprimées)
- Route centralisée: [backend/src/routes/index.ts](backend/src/routes/index.ts).
  - Actives / montées: `/api/health`, plus les routes d'`auth` et `admin` montées explicitement par `server.ts` (`/api/auth`, `/auth`, `/api/admin`, `/admin`, `/api`).
  - Publications / newsfeed: les routes publications sont commentées/désactivées dans `routes/index.ts` (import/comment block). Le code métier pour le newsfeed existe toujours dans `backend/src/services/newsfeedService.ts` et plusieurs scripts/migrations touchent `publications` — la route elle-même est désactivée (donc le fichier de route `publications` peut être supprimé ou ré-intégré proprement). Voir [backend/src/routes/index.ts](backend/src/routes/index.ts) et [backend/src/services/newsfeedService.ts](backend/src/services/newsfeedService.ts).
- Jobs / Webhooks: webhooks et job webhook existent (`/api/jobs/notify`) dans [backend/src/routes/jobWebhook.ts](backend/src/routes/jobWebhook.ts) — attention: ce fichier initialise un client Supabase pour certaines opérations (clé de service) même si la DB principale utilise `pg`.
- Microservices & utilitaires: notifications, PDF, matching exposés depuis [backend/src/routes/microservices.ts](backend/src/routes/microservices.ts) (souvent montés séparément selon configuration).
- Résumé des fichiers supprimés/ignorés: les routes de `publications` sont désactivées dans la configuration actuelle; cependant des services/migrations logiques liés aux `publications` subsistent (migrations `003_fix_publications_schema.sql`, services `newsfeedService.ts`). Il faut nettoyer ou ré-activer de manière cohérente.

Base de données
- Le backend communique directement avec PostgreSQL via `node-postgres (pg)` et un `Pool` : configuration et pool dans [backend/src/config/database.ts](backend/src/config/database.ts). Supabase SDK est encore référencé dans certains microservices/webhooks (ex: job webhook uses `@supabase/supabase-js`), mais la connexion principale à la DB se fait via `pg` (DATABASE_URL ou DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD).
- Comportement attendu:
  - Priorité à `DATABASE_URL` si présent (connection string)
  - Sinon, fallback sur env vars `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

Actions recommandées pour stabiliser le build et l'accès Admin
- Unifier l'entrée serveur: décider si vous utilisez `backend/src/server.ts` ou `backend/src/server-modular.ts` et supprimer/archiver l'autre version (`server.old.ts`, `server.ts.bak` restent pour référence).
- Corriger l'initialisation du `PORT` pour respecter `number` partout (utiliser `Number()`/`parseInt()` centralisé).
- Réactiver / nettoyer les routes publications: soit ré-intégrer les routes (et garder les services), soit purger les références restantes aux publications si la fonctionnalité ne doit plus exister.
- Valider la configuration `.env` (ex: `backend/.env`), s'assurer que `PORT`, `DATABASE_URL`/DB_* et `JWT_SECRET` existent pour les environnements de dev/prod.

Fichiers clés à consulter rapidement
- Serveur (entrée): [backend/src/server.ts](backend/src/server.ts) — production; [backend/src/server-modular.ts](backend/src/server-modular.ts) — alternative
- Routes auth: [backend/src/routes/auth.ts](backend/src/routes/auth.ts), [backend/src/routes/admin-auth.ts](backend/src/routes/admin-auth.ts)
- Routes générales: [backend/src/routes/index.ts](backend/src/routes/index.ts)
- DB pool: [backend/src/config/database.ts](backend/src/config/database.ts)
- Constantes: [backend/src/config/constants.ts](backend/src/config/constants.ts)
- Newsfeed/publications logic: [backend/src/services/newsfeedService.ts](backend/src/services/newsfeedService.ts)

Si vous voulez, je peux:
- appliquer le fix type-safe du `PORT` dans `backend/src/server-modular.ts` et `backend/src/server.ts` (une PR/patch)
- chercher et lister toutes les références restantes à `publications` et proposer une PR de nettoyage

Fin du TECH MAP
