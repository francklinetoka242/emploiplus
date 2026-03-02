# Documentation des routes API

Cette documentation liste les routes montées dans `server.js` et les endpoints disponibles sous chaque base path.

---

## Authentification
Endpoint : `/api/auth`

Description : Gestion des authentifications pour les administrateurs et les utilisateurs (candidats/entreprises). Comprend l'enregistrement initial du Super Admin et les logins.

Méthodes :
- POST /register : Créer un Super Admin (utilisé pour le premier admin). Body attendu : `{ email, password, first_name, last_name }`.
- POST /login : Authentification Admin. Body attendu : `{ email, password }`. Retourne un token JWT et les infos de l'admin.
- POST /user/login : Authentification utilisateur (candidat/entreprise). Body attendu : `{ email, password }`. Retourne un token JWT et les infos de l'utilisateur.

---

## Jobs
Endpoint : `/api/jobs`

Description : CRUD pour les offres d'emploi. Certaines opérations sont protégées et nécessitent un token admin.

Méthodes :
- GET / : Récupère la liste des offres. Query params possibles : `limit`, `offset`.
- GET /:id : Récupère une offre par son ID.
- POST / : Crée une nouvelle offre (protégé, admin). Body exemple : `{ title, description, location, salary, jobType, companyId }`.
- PUT /:id : Met à jour une offre existante (protégé, admin).
- DELETE /:id : Supprime une offre (protégé, admin).

---

## Formations
Endpoint : `/api/formations`

Description : Gestion des formations; consultation publique et inscription (enrollment) pour les utilisateurs authentifiés.

Méthodes :
- GET / : Récupère la liste des formations. Query params : `limit`, `offset`.
- GET /:id : Récupère une formation par ID.
- POST /:id/enroll : Inscrire l'utilisateur courant à la formation (protégé, JWT requis). Paramètre URL : `id` (formationId).

---

## Publications
Endpoint : `/api/publications`

Description : Gestion des publications (flux). Certaines opérations (création/suppression) sont réservées aux admins.

Méthodes :
- GET / : Récupère les publications (pagination/filtrage possible).
- GET /:id : Récupère une publication par ID.
- POST / : Crée une publication (protégé, admin). Body exemple : `{ content, image_url?, visibility?, category?, achievement? }`.
- DELETE /:id : Supprime une publication (protégé, admin).

---

## FAQ
Endpoint : `/api/faq`

Description : Accès public aux entrées de la FAQ.

Méthodes :
- GET / : Récupère toutes les entrées de la FAQ.

---

## Notifications
Endpoint : `/api/notifications`

Description : Gestion des notifications pour l'utilisateur courant; requiert authentification.

Méthodes :
- GET / : Récupère les notifications de l'utilisateur courant (protégé, JWT requis). Query params : `limit`, `offset`.
- POST /:id/read : Marquer une notification comme lue (protégé, JWT requis). Paramètre URL : `id` (notificationId).

---

## Dashboard
Endpoint : `/api/dashboard`

Description : Endpoints d'administration pour récupérer des statistiques globales du système (accès admin uniquement).

Méthodes :
- GET /stats : Récupère les statistiques du tableau de bord (protégé, admin requis). Retourne état du système, métriques utilisateurs, revenus, etc.

---

## Services
Endpoint : `/api/services`

Description : Liste publique des services disponibles sur la plateforme.

Méthodes :
- GET / : Récupère tous les services.

---

## Companies (Entreprises)
Endpoint : `/api/companies`

Description : Consultation des entreprises enregistrées.

Méthodes :
- GET / : Récupère la liste des entreprises. Query params : `limit`, `offset`.
- GET /:id : Récupère une entreprise par ID.

---

## Users
Endpoint : `/api/users`

Description : Consultation des utilisateurs (candidats/entreprises). Endpoints en lecture publique pour affichage.

Méthodes :
- GET / : Récupère la liste des utilisateurs. Query params : `limit`, `offset`.
- GET /:id : Récupère un utilisateur par ID.

---

## Uploads
Endpoint : `/api/uploads`

Description : Endpoints pour l'upload de fichiers (ex : documents candidats). Les uploads sont protégés (JWT requis) et stockés côté serveur.

Méthodes :
- POST /candidate : Accept a single file under field `file` (protégé, JWT requis). Utilise `multipart/form-data`. Stocke le fichier et associe son URL au profil utilisateur.

---

*Remarque* : Les chemins indiqués sont ceux montés par `server.js` (préfixe `/api/...`). Les protections (JWT, admin) sont indiquées selon les middlewares utilisés dans les fichiers de routes.
