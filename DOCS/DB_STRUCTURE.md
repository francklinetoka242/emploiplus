# Structure de la base de données — Emploi Connect Congo

Ce document décrit la structure des tables créées par `backend/init-db.ts` et utilisées par le serveur.

## Tables principales

### users
- id: UUID (PK)
- email: TEXT UNIQUE
- password_hash: TEXT
- role: TEXT (e.g., 'candidate', 'company', 'admin')
- full_name: TEXT
- profession: TEXT          -- (nouveau champ) profession principale
- job_title: TEXT           -- (nouveau champ) intitulé
- diploma: TEXT             -- diplôme principal
- experience_years: INTEGER -- années d'expérience
- skills: JSONB             -- liste/objet de compétences (recherches et recommandations)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### admins
- id, email, password_hash, role, created_at

### jobs
- id, title, description, company_id, sector, location, published_at, etc.

### formations
- id, title, description, provider, dates, etc.

### portfolios
- id, user_id, title, description, service_slug, images (JSON), created_at

### publications
- id, title, content, author_id, published_at, visibility

### user_documents
- id: UUID (PK)
- user_id: UUID (FK -> users.id)
- doc_type: TEXT ('cv'|'letter'|other)
- title: TEXT
- metadata: JSONB (stores the CV/letter data snapshot)
- storage_url: TEXT (URL/path to stored file under `/uploads/`)
- created_at: TIMESTAMP

Notes:
- Business rules enforced in backend:
  - Saved documents per user per type limited to 2 (e.g., max 2 CVs saved in account).
  - Monthly creation limit (e.g., 10 per month) enforced server-side to avoid abuse.

### service_catalogs
- id, service_slug, items JSONB, created_at

### site_settings
- id, key, value JSONB — used to store toggles and global site settings manageable by admin

### communication_channels, faqs, ...
- Tables additionnelles pour stocker canaux de contact, FAQ, etc.

## Relations importantes
- `users` 1 — * `portfolios`
- `users` 1 — * `user_documents`
- `admins` can manage `publications`, `service_catalogs`, `site_settings`

## Exécution et réinitialisation
- Le script `backend/init-db.ts` supprime et recrée les tables (utilisé en dev). Il insère aussi des comptes de démonstration (super admin, un candidat, une entreprise) pour tests.

Commande pour lancer le script (depuis `backend/`):

```bash
cd backend
npx tsx init-db.ts
```

## Chemin physique des fichiers uploadés
- Les fichiers uploadés par `POST /api/upload` sont stockés dans le dossier `uploads/` à la racine du projet et servis statiquement par le backend. La colonne `storage_url` contient le chemin relatif (par ex. `/uploads/2025-12-11_cv_johndoe.pdf`).

## Recommandations de sauvegarde et migration
- Exporter périodiquement les tables critiques (`users`, `user_documents`, `jobs`, `publications`) via dump PostgreSQL.
- Pour la production, déplacer le stockage de fichiers vers un objet store (ex: S3, DigitalOcean Spaces) et mettre à jour `storage_url` pour pointer vers les URLs publiques.

## Comment ajouter un nouveau champ
1. Ajouter la colonne dans `backend/init-db.ts` (script de migration initiale) ou créer une migration SQL.
2. Mettre à jour les types côté backend (`backend/src/types` si présent) et l'API (`backend/src/server.ts`).
3. Mettre à jour le frontend (`src/hooks/useAuth.ts`, formulaires de profil) pour lire/écrire ces champs.

----

Si vous voulez que je génère un diagramme ER (image SVG) ou un script SQL d'export pour documentation, je peux le faire ensuite.