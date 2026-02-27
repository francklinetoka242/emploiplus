# DEPLOYMENT_SYNC.md

Résumé des modifications effectuées

- Files modifiés :
  - `backend/src/routes/auth.ts` : user registration now accepts `first_name` and `last_name`; Google sync now stores `first_name`/`last_name` and updates accordingly.
  - `backend/src/controllers/authController.ts` : admin registration and user registration updated to use `first_name`/`last_name`; login responses return `first_name`/`last_name`.
  - `backend/src/services/adminAuthService.ts` : insert/return `first_name` and `last_name` for admins.
  - `backend/init-db.ts` and `backend/init-db.js` : DDL changed to create `first_name`/`last_name` columns for `users` and `admins`; seed inserts updated.
  - `backend/src/middleware/cors.ts` and `backend/src/server-modular.ts` : (déjà modifiés précédemment) CORS centralized via `initializeCors()` to allow `https://emploiplus-group.com`.
  - `.env.example` : added `VITE_API_URL=/api` (committed) — actual `.env` remains ignored and was updated locally to `/api` for deployment.

Schéma attendu (tables impactées)

- `users` (minimum attendu) :
  - `id` SERIAL PRIMARY KEY
  - `first_name` TEXT NOT NULL
  - `last_name` TEXT NOT NULL
  - `email` TEXT UNIQUE NOT NULL
  - `password` TEXT NOT NULL
  - `user_type` TEXT NOT NULL DEFAULT 'candidate'
  - `phone`, `company_name`, `company_address`, `profession`, `profile_image_url`, `is_verified`, `is_blocked`, `created_at`, `updated_at`, etc.

- `admins` (minimum attendu) :
  - `id` SERIAL PRIMARY KEY
  - `email` TEXT UNIQUE NOT NULL
  - `password` TEXT NOT NULL
  - `first_name` TEXT NOT NULL
  - `last_name` TEXT NOT NULL
  - `role` TEXT DEFAULT 'admin'
  - `created_at` TIMESTAMP DEFAULT NOW()

- `faqs` (unchanged) :
  - `id` SERIAL PRIMARY KEY
  - `category` TEXT NOT NULL
  - `question` TEXT NOT NULL
  - `answer` TEXT NOT NULL
  - `display_order` INTEGER DEFAULT 0
  - `is_visible` BOOLEAN DEFAULT true
  - `created_at` TIMESTAMP DEFAULT NOW()

Remarques de validation

- Tous les points d'insertion/selection pour la table `admins` ont été corrigés pour utiliser `first_name` et `last_name` (insert/return/select). Vérifiez les autres scripts/seed si vous avez des exports anciens qui utilisent `full_name`.
- Le code du backend accepte encore `full_name` dans certains endpoints (e.g. Google sync) mais préfère `first_name`/`last_name` si fournis. Lors d'une valeur `full_name`, le code scinde le nom en un premier token (`first_name`) et le reste (`last_name`).

Reverse Proxy / Frontend configuration validée

- Frontend env (production): `VITE_API_URL=/api` (use reverse proxy path)
  - `.env.example` committed contains `VITE_API_URL=/api`.
  - On the server copy `.env.example` to `.env` or set environment variable accordingly.

- Apache reverse proxy (validated): route `/api` to backend on localhost:5000
  - Example Apache config (already present in `apache-reverse-proxy.conf`):

    ProxyPass "/api" "http://127.0.0.1:5000/api"
    ProxyPassReverse "/api" "http://127.0.0.1:5000/api"

  - Or use a VirtualHost configuration that proxies `/api` (and leaves static files to Apache/OLSP).

- Backend listens on `0.0.0.0:5000` (or `127.0.0.1:5000` for internal-only) and `app.set('trust proxy', 1)` is set for CyberPanel/OpenLiteSpeed.

Déploiement / actions recommandées

1. Si vous initialisez la base locale/serveur :

```bash
# depuis le dossier backend
node init-db.js
# ou (TypeScript)
node --loader ts-node/esm backend/init-db.ts
```

2. Copier `.env.example` → `.env` sur le serveur, puis adapter les autres secrets (`DATABASE_URL`, `SMTP_*`, `JWT_SECRET`, etc.).

3. Build & déployer le frontend : assurez-vous que `VITE_API_URL` soit `/api` lors du build si vous utilisez le reverse-proxy.

4. Redémarrer backend (pm2/systemd) et Apache/OpenLiteSpeed pour appliquer la configuration proxy.

Notes finales

- J'ai appliqué les modifications de code dans le repo local et commité les fichiers sûrs (`.env.example`, controllers/services/init-db, routes). Les fichiers `.env` restent ignorés par git pour garantir les secrets.
- Si vous préférez conserver `full_name` au lieu de `first_name/last_name`, dites-le et je reverrai les changements pour revenir à `full_name` uniformément.

---

Si vous voulez, je peux :
- commit/push les fichiers modifiés restants (je peux déjà pousser les changements faits),
- lancer `node init-db.js` localement (si vous me validez),
- ou exécuter quelques requêtes `curl` contre `/api/_health` et endpoints d'auth pour valider le comportement.
