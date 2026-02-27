# Description complète du site — Emploi Connect Congo

Ce document décrit l'application web, ses fonctionnalités principales, l'architecture front-end et back-end, les composants et pages importants, ainsi que les outils et bibliothèques utilisés.

## But du site
- Plateforme de mise en relation entre candidats et entreprises au Congo.
- Permet aux candidats de créer, sauvegarder et exporter des CV et lettres de motivation, postuler aux offres, gérer leur profil et documents.
- Permet aux entreprises/administrateurs de publier des offres, publications, et gérer des catalogues de services.

## Fonctionnalités clés
- Création de CV et lettres via un éditeur WYSIWYG simplifié avec modèles/templates.
- Export PDF et Word (doc) côté client.
- Sauvegarde de documents sur le compte utilisateur (PDF stockés côté serveur et accessibles depuis `Paramètres`).
- Limites côté serveur : maximum 2 documents sauvegardés par type (CV/lettre) et maximum ~10 créations par mois par type (logique côté backend).
- Authentification JWT (login/logout) avec rôles (admin, candidat, entreprise). Les admins ont accès à l'interface d'administration pour gérer publications, catalogues, etc.
- Section "Publications" / Newsfeed gérée par admin.
- Portfolios / Réalisations affichées par service (silencieuses si aucune réalisation pour un service donné).
- Language selector (Français, English, Lingala) dans le pied de page pour pages légales (limité aux pages implémentées).

## Architecture générale
- Frontend: React + TypeScript (Vite)
  - Dossier principal: `src/`
  - Pages: `src/pages/` (Home, Jobs, Formations, CVGenerator, LetterGenerator, Settings, Privacy, Legal, Cookies, etc.)
  - Composants réutilisables: `src/components/`
  - Hooks: `src/hooks/` (`useAuth.ts`, etc.)
  - Intégrations: `src/integrations/supabase` (si présent) ou interfaces API dans `src/lib/api.ts`

- Backend: Node.js + Express + TypeScript
  - Dossier: `backend/`
  - Serveur: `backend/src/server.ts`
  - Configuration DB: `backend/src/config/database.ts`
  - Script d'initialisation: `backend/init-db.ts` (recrée le schéma et insère des données de démonstration/compte admin)
  - Endpoints importants:
    - `POST /api/upload` — reçoit `{ base64Content, originalName }`, écrit le fichier dans `uploads/` et renvoie `storage_url`.
    - `POST /api/user-documents`, `GET /api/user-documents`, `DELETE /api/user-documents/:id` — CRUD des documents utilisateur (contrôlé par JWT).
    - `GET/POST/PUT/DELETE /api/publications` — gestion des publications (admin).
    - `GET /api/portfolios` — récupération des réalisations par service.
    - `GET/PUT /api/users/me` — récupérer / mettre à jour profil (inclut champ `skills` JSONB).

## Composants et pages importants
- `src/pages/CVGenerator.tsx` — éditeur et aperçu des CV, export PDF/Word, sauvegarde dans le compte (upload PDF). Utilise `html2pdf.js` pour générer le PDF côté client.
- `src/pages/LetterGenerator.tsx` — éditeur de lettre de motivation, export et sauvegarde similaire.
- `src/pages/Settings.tsx` — paramètres du compte, upload de documents, gestion des documents sauvegardés, recommandation (compétences) et suppression de compte.
- `src/components/Header.tsx` — barre supérieure avec menu utilisateur rapide (Paramètres, Déconnexion).
- `src/components/Footer.tsx` — pied de page avec sélecteur de langue et liens vers pages légales.
- `src/pages/Jobs.tsx` / `src/pages/Formations.tsx` — listes d'offres et formation avec CTA d'abonnement et recommandations personnalisées selon le profil (`profession`, `skills`).

## Flux de sauvegarde de documents (CV / Lettre)
1. L'utilisateur clique sur "Enregistrer dans mon compte" (doit être connecté).
2. Le client génère un PDF côté navigateur via `html2pdf` à partir du DOM d'aperçu.
3. Le PDF est converti en base64 et envoyé à `POST /api/upload` avec `originalName` (par ex. `prenom-nom.pdf`).
4. Le backend stocke le fichier dans le dossier `uploads/` et retourne `storage_url`.
5. Le client appelle `POST /api/user-documents` pour créer l'entrée en base de données (`doc_type`, `title`, `metadata`, `storage_url`).
6. L'interface `Paramètres` liste ces documents et permet le téléchargement ou suppression.

## Exécution locale (raccourci)
- Prérequis: Node.js, npm ou pnpm, PostgreSQL
- Initialiser la base de données (depuis le dossier `backend/`):

```bash
cd backend
npx tsx init-db.ts
```

- Démarrer le backend (depuis `backend/`):

```bash
cd backend
npx tsx src/server.ts
# Le serveur écoute généralement sur http://localhost:5000
```

- Démarrer le frontend (depuis la racine du projet):

```bash
npm install    # si nécessaire
npm run dev
# ou pnpm dev
# Frontend exposé sur http://localhost:5173 (par défaut Vite)
```

## Emplacement des fichiers clés
- Backend server: `backend/src/server.ts`
- DB init script: `backend/init-db.ts`
- Frontend pages: `src/pages/` (CVGenerator, LetterGenerator, Settings...)
- Uploads statiques: `uploads/` (dans la racine du projet)

## Remarques et prochaines améliorations possibles
- Internationalisation (i18n) complète — aujourd'hui seul le sélecteur et les pages légales utilisent la langue.
- Validation côté client et traitement des erreurs améliorés (taille maximale de fichier, types acceptés).
- Génération côté serveur de PDF (si on veut standardiser rendu/embeds côté backend).
- Ajout d'assets/templates supplémentaires pour les CV (rouge, jaune) et contrôle des modèles selon l'état de connexion.

----

Si vous voulez, je peux ajouter des captures d'écran rapides, ou générer une version imprimable (PDF) de cette documentation.
