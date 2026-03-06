# SITE_STRUCTURE.md - Architecture et Fonctionnement de Emploi+

## 1. Vision Globale

**Emploi+** est une plateforme de recrutement et de services professionnels dédiée au marché congolais (République du Congo). Elle vise à connecter candidats et recruteurs tout en offrant des outils professionnels avancés pour l'accompagnement carrière.

### Objectifs principaux :
- **Recrutement efficace** : Mise en relation simplifiée entre candidats et entreprises
- **Services professionnels** : Outils d'accompagnement carrière (CV, portfolio, coaching IA)
- **Accessibilité** : Plateforme web responsive et PWA (Progressive Web App)
- **Innovation** : Intégration d'IA pour l'optimisation des processus

### Valeurs clés :
- **Simplicité d'usage** : Interface intuitive et workflows optimisés
- **Qualité** : Contenus professionnels et outils fiables
- **Communauté** : Écosystème complet pour l'emploi et la formation

---

## 2. Modules Frontend (React/TypeScript + Tailwind CSS)

### A. Module Recrutement
- **Liste d'emplois** : Affichage paginé avec filtres avancés (secteur, localisation, salaire, type de contrat)
- **Détail d'offre** : Page complète avec description, entreprise, et boutons d'action (postuler, sauvegarder)
- **Dépôt de candidatures** : Formulaire multi-étapes avec upload de CV et lettre de motivation
- **Filtres de recherche** : Recherche textuelle, filtres par catégorie, localisation, salaire
- **Tableau de bord candidat** : Suivi des candidatures, offres sauvegardées, historique

### B. Services Pro (Éditeurs)

#### Constructeur de CV
- **Modèles prédéfinis** : Olivia Wilson, Pastel, Modern, Classic, Creative
- **Éditeur visuel** : Drag & drop des sections (expérience, formation, compétences)
- **Import/Export** : Import depuis LinkedIn/PDF, export PDF/HTML
- **Personnalisation** : Couleurs, polices, mise en page responsive
- **Sauvegarde automatique** : Stockage cloud avec versioning

#### Constructeur de Portfolio
- **Galerie par catégories** : Projets, réalisations, témoignages
- **Templates professionnels** : Designs adaptés aux différents secteurs
- **Médias intégrés** : Images, vidéos, liens externes
- **Export multi-formats** : HTML statique, PDF, partage direct
- **SEO optimisé** : Métadonnées et structure sémantique

#### Studio de Bannières
- **Formats réseaux sociaux** : LinkedIn, Facebook, Twitter, Instagram
- **Simulation Safe Zone** : Aperçu optimisé pour chaque plateforme
- **Éditeur graphique** : Texte, images, formes, filtres
- **Bibliothèque d'assets** : Templates prédéfinis, icônes, polices
- **Export optimisé** : Formats adaptés à chaque réseau

### C. Espace Coaching IA

#### Simulateur d'entretien
- **Niveaux de sévérité** : Débutant, Intermédiaire, Expert, Spécialisé
- **Questions générées** : IA adaptative selon le poste et secteur
- **Évaluation temps réel** : Feedback immédiat sur les réponses
- **Rapport détaillé** : Points forts/faibles, conseils d'amélioration
- **Mode entraînement** : Sessions illimitées avec progression

#### Tests de compétences
- **QCM générés par IA** : Questions contextualisées par domaine
- **Domaines couverts** : IT, Design, Management, Communication, Marketing
- **Évaluation personnalisée** : Niveau adapté au profil candidat
- **Certificats** : Génération automatique de certificats de réussite
- **Historique et progression** : Suivi des performances dans le temps

### D. Espace Formations
- **Catalogue complet** : Formations par domaine et niveau
- **Suivi de progression** : Avancement, certificats, badges
- **Contenu multimédia** : Vidéos, PDF, quiz interactifs
- **Communauté d'apprenants** : Forums, groupes d'étude
- **Intégration IA** : Recommandations personnalisées

---

## 3. Structure des Utilisateurs

### A. Candidat
- **Profil complet** : Informations personnelles, photo, résumé professionnel
- **Mes documents** : CV sauvegardés, portfolios, lettres de motivation
- **Mes tests** : Historique des tests de compétences, scores, certificats
- **Mes bannières** : Bibliothèque de bannières créées, templates favoris
- **Candidatures** : Suivi des postulations, relances automatiques
- **Favoris** : Offres et formations sauvegardées

### B. Recruteur / Entreprise
- **Profil entreprise** : Logo, description, secteur d'activité, site web
- **Gestion des offres** : Création, modification, publication/dépublication
- **Candidatures reçues** : Tri, filtrage, statut (en attente, accepté, refusé)
- **Base de données candidats** : Recherche avancée, tags, notes
- **Statistiques** : Métriques d'engagement, taux de conversion
- **Communication** : Messages aux candidats, invitations

### C. Administrateur
- **Dashboard global** : Vue d'ensemble de la plateforme
- **Gestion des utilisateurs** : CRUD utilisateurs, rôles, statuts
- **Modération contenu** : Validation offres, formations, commentaires
- **Analytics** : KPIs, rapports, tendances
- **Configuration système** : Paramètres globaux, maintenance
- **À venir** : Gestion granulaire des rôles et permissions

---

## 4. Flux de Données & API

### A. Extraction de données CV (IA)
- **OCR avancé** : Reconnaissance texte depuis PDF/images
- **Parsing intelligent** : Extraction structurée (expérience, formation, compétences)
- **Normalisation** : Standardisation des formats et terminologies
- **Enrichissement** : Ajout de métadonnées et suggestions d'amélioration

### B. Génération de contenu (IA)
- **Gemini/OpenAI** : API pour génération de contenu personnalisé
- **Questions d'entretien** : Contextualisées selon poste et niveau
- **Feedback personnalisé** : Analyse des réponses et conseils adaptés
- **Contenu éducatif** : Génération de cours et exercices

### C. Exportations
- **html2canvas** : Capture d'écran haute qualité pour PDF
- **react-to-print** : Impression optimisée avec styles préservés
- **Export multi-formats** : PDF, HTML, PNG, JPG selon les besoins
- **Optimisation** : Compression et optimisation pour le web

### D. Architecture API
- **RESTful API** : Endpoints standardisés pour toutes les ressources
- **Authentification JWT** : Sessions sécurisées avec refresh tokens
- **Rate limiting** : Protection contre les abus
- **Caching** : Redis pour les données fréquemment accédées
- **WebSockets** : Notifications temps réel (chat, mises à jour)

---

## 5. Stack Technique

### A. Frontend
- **React 18** : Framework JavaScript avec hooks et composants fonctionnels
- **TypeScript** : Typage statique pour la robustesse du code
- **Tailwind CSS** : Framework CSS utilitaire pour le styling rapide
- **Vite** : Outil de build rapide et serveur de développement
- **React Router** : Navigation côté client
- **React Query** : Gestion d'état serveur et cache
- **Framer Motion** : Animations fluides et transitions

### B. Backend
- **Node.js** : Runtime JavaScript côté serveur
- **Express.js** : Framework web minimaliste et flexible
- **PostgreSQL** : Base de données relationnelle robuste
- **Prisma** : ORM moderne avec migrations automatisées
- **JWT** : Authentification stateless
- **bcrypt** : Hashage sécurisé des mots de passe

### C. IA & Services Externes
- **Google Gemini** : Génération de contenu et analyse IA
- **OpenAI API** : Modèles de langage avancés
- **html2canvas** : Capture d'écran pour exports
- **react-to-print** : Bibliothèque d'impression React
- **Cloudinary** : Stockage et optimisation d'images

### D. DevOps & Outils
- **Docker** : Conteneurisation pour déploiement consistant
- **GitHub Actions** : CI/CD automatisé
- **ESLint/Prettier** : Qualité et formatage du code
- **Playwright** : Tests end-to-end automatisés
- **Vercel/Netlify** : Déploiement frontend
- **Railway/Render** : Hébergement backend

### E. Sécurité
- **Helmet.js** : Headers de sécurité HTTP
- **CORS** : Contrôle des origines cross-domain
- **Rate limiting** : Protection contre les attaques par déni de service
- **Validation input** : Sanitisation et validation des données
- **Logs sécurisés** : Audit trail sans données sensibles

---

## 6. Architecture Générale

### A. Pattern Architecture
- **MVC adapté** : Séparation logique métier/presentation/données
- **Services métier** : Logique réutilisable dans des modules dédiés
- **Middleware** : Authentification, validation, logging
- **Hooks personnalisés** : Logique React réutilisable

### B. Structure de fichiers
```
/
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/         # Pages principales
│   │   ├── hooks/         # Hooks personnalisés
│   │   ├── services/      # Appels API
│   │   └── utils/         # Utilitaires
├── backend/
│   ├── controllers/       # Logique métier
│   ├── models/           # Modèles de données
│   ├── routes/           # Définition des routes
│   ├── middleware/       # Middleware Express
│   └── services/         # Services métier
└── shared/               # Code partagé (types, constantes)
```

### C. Déploiement
- **Frontend** : Build statique déployé sur CDN
- **Backend** : API déployée sur serveur dédié/scalabilité auto
- **Base de données** : PostgreSQL managé avec backups automatiques
- **Monitoring** : Logs centralisés, alertes, métriques

---

*Document généré le 6 mars 2026 - Emploi+ Architecture Overview*