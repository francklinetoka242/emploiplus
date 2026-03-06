# Documentation Système de Candidature Intelligente

## Vue d'Ensemble

Le système de Candidature Intelligente est une plateforme web moderne qui permet aux candidats de soumettre leur CV pour une analyse automatisée par IA. Le système compare le profil du candidat avec les offres d'emploi et génère automatiquement une lettre de motivation personnalisée.

### Fonctionnalités Principales
- ✅ Analyse automatique des CV via IA (Gemini)
- ✅ Comparaison CV/Offre d'emploi
- ✅ Génération de lettres de motivation personnalisées
- ✅ Interface utilisateur moderne (React + TypeScript)
- ✅ API REST robuste (Node.js + Express)
- ✅ Base de données PostgreSQL
- ✅ Progressive Web App (PWA)

---

## Architecture Système

### Architecture Générale
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Base de       │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Données        │
│                 │    │                 │    │   (PostgreSQL)  │
│ - Pages React   │    │ - API REST      │    │                 │
│ - Composants UI │    │ - Services IA   │    │ - jobs          │
│ - Gestion état  │    │ - Middleware    │    │ - companies     │
│ - PWA           │    │ - Authentification│    │ - users        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technologies Utilisées

#### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS
- **React Query** - Gestion des requêtes API
- **React Router** - Routing
- **Lucide React** - Icônes
- **Sonner** - Notifications toast

#### Backend
- **Node.js 22** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de données
- **Google Gemini AI** - Service d'IA
- **JWT** - Authentification
- **Multer** - Upload de fichiers
- **PDF-Parse** - Extraction texte PDF

#### DevOps
- **ES Modules** - Modules JavaScript modernes
- **Dotenv** - Gestion des variables d'environnement
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Sécurité HTTP

---

## Configuration Backend

### Variables d'Environnement (.env)

```bash
# Base de données PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/emploi_plus_db_cg

# Clé secrète JWT (à changer en production)
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Configuration serveur
PORT=5000
NODE_ENV=development

# Politique CORS
CORS_ORIGIN=*

# Clé API Google Gemini
GEMINI_API_KEY=AIzaSyDSAj76TtI_KjzrEZi-hSMji-WqH2GOXnQ
```

### Installation et Démarrage

```bash
# Installation des dépendances
cd backend
npm install

# Démarrage en développement
npm run dev

# Démarrage en production
npm start
```

### Structure des Dossiers Backend

```
backend/
├── config/           # Configuration base de données
├── controllers/      # Logique métier
│   ├── ai.controller.js      # Service IA Gemini
│   ├── job.controller.js     # Gestion des offres
│   └── user.controller.js    # Gestion utilisateurs
├── middleware/       # Middlewares Express
├── models/          # Modèles de données
├── routes/          # Définition des routes API
├── services/        # Services métier
├── utils/           # Utilitaires
├── server.js        # Point d'entrée serveur
└── package.json     # Dépendances
```

---

## Configuration Frontend

### Variables d'Environnement

Le frontend utilise Vite pour la gestion des variables d'environnement :

```bash
# .env.local ou .env
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_STATIC=false  # true pour mode statique
```

### Installation et Démarrage

```bash
# Installation des dépendances
cd frontend
npm install

# Démarrage en développement
npm run dev

# Build pour production
npm run build

# Prévisualisation build
npm run preview
```

### Structure des Dossiers Frontend

```
frontend/
├── public/           # Assets statiques
├── src/
│   ├── components/   # Composants réutilisables
│   ├── pages/        # Pages de l'application
│   ├── hooks/        # Hooks React personnalisés
│   ├── lib/          # Utilitaires et configurations
│   │   ├── api.ts    # Client API
│   │   └── api-static.ts  # Données mock
│   ├── stores/       # Gestion d'état (Zustand)
│   ├── types/        # Types TypeScript
│   └── utils/        # Fonctions utilitaires
├── vite.config.ts    # Configuration Vite
└── package.json      # Dépendances
```

---

## API Endpoints

### Jobs
```http
GET    /api/jobs              # Liste des offres
GET    /api/jobs/:id          # Détails d'une offre
POST   /api/jobs              # Créer une offre (admin)
PUT    /api/jobs/:id          # Modifier une offre (admin)
DELETE /api/jobs/:id          # Supprimer une offre (admin)
PATCH  /api/jobs/:id/publish  # Publier/dépublier (admin)
```

### IA et Candidatures
```http
POST   /api/ai/analyze-cv     # Analyser un CV
POST   /api/ai/send-application # Envoyer une candidature
```

### Authentification
```http
POST   /api/auth/login        # Connexion admin
POST   /api/auth/logout       # Déconnexion
GET    /api/auth/me           # Profil utilisateur
```

### Administration
```http
GET    /api/admin/jobs        # Gestion offres (admin)
GET    /api/admin/users       # Gestion utilisateurs (admin)
GET    /api/admin/stats       # Statistiques
```

---

## Flux de Fonctionnement

### 1. Sélection d'Offre
```
Utilisateur → Page Jobs → Sélection offre → Redirection /candidature-intelligente/:jobId
```

### Affichage des Détails d'Offre

La page Candidature Intelligente affiche toutes les informations disponibles de l'offre sélectionnée :

#### Informations Principales
- **Titre du poste**
- **Nom de l'entreprise** avec lien vers le site web (si disponible)
- **Logo de l'entreprise** (si disponible)

#### Détails du Poste
- **Localisation**
- **Type de contrat** (CDI, CDD, etc.)
- **Secteur d'activité**
- **Niveau d'expérience requis**
- **Salaire** (si spécifié)
- **Statut** (publiée/fermée)

#### Dates Importantes
- **Date de publication**
- **Date limite de candidature** (si spécifiée)

#### Contenu Détaillé
- **Description complète du poste**
- **Compétences et exigences requises**

#### Métadonnées
- **ID de l'offre**
- **Date de création**
- **Date de dernière modification**

### 3. Upload et Analyse CV
```
1. Upload PDF → Validation (type, taille)
2. Extraction texte → pdf-parse
3. Récupération offre → Base de données
4. Analyse IA → Google Gemini
5. Génération réponse → JSON structuré
```

### 4. Génération Lettre de Motivation
```
IA analyse → Score matching + Points forts + Lacunes + Lettre personnalisée
```

### 5. Soumission Finale
```
Utilisateur édite lettre → POST /api/ai/send-application → Stockage base de données
```

---

## Service IA Gemini

### Configuration Modèle

```javascript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});
```

### Prompt Système

Le système utilise un prompt détaillé qui définit le rôle de l'IA comme expert RH avec 20 ans d'expérience.

### Structure de Réponse Requise

```json
{
  "score_matching": 85,
  "points_forts": [
    "Expérience de 5 ans en développement web",
    "Maîtrise de React et Node.js",
    "Projets open source significatifs"
  ],
  "lacunes": [
    "Connaissances limitées en DevOps",
    "Expérience manquante en gestion d'équipe"
  ],
  "lettre_motivation": "Cher responsable recrutement,..."
}
```

### Gestion des Quotas

- **Limite gratuite** : 15 requêtes/minute
- **Détection** : Erreur `RESOURCE_EXHAUSTED`
- **Gestion** : Code HTTP 429 avec message informatif

---

## Gestion des Erreurs

### Codes HTTP Utilisés

| Code | Description | Contexte |
|------|-------------|----------|
| 200  | Succès | Opération réussie |
| 400  | Bad Request | Données invalides |
| 401  | Unauthorized | Non authentifié |
| 403  | Forbidden | Permissions insuffisantes |
| 404  | Not Found | Ressource inexistante |
| 429  | Too Many Requests | Quota IA dépassé |
| 500  | Internal Error | Erreur serveur |

### Gestion Frontend

```typescript
// Exemple de gestion d'erreur
const analyzeMutation = useMutation({
  mutationFn: async (file: File) => {
    const response = await fetch('/api/ai/analyze-cv', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

---

## Sécurité

### Authentification
- **JWT** pour les sessions admin
- **Middleware** de vérification des rôles
- **Expiration** automatique des tokens

### Upload de Fichiers
- **Validation type** : PDF uniquement
- **Limite taille** : 50 MB (augmenté pour gérer les CV volumineux)
- **Stockage mémoire** : Pas de fichiers temporaires

### API
- **CORS** configuré
- **Helmet** pour headers de sécurité
- **Rate limiting** sur les endpoints sensibles

### Variables Sensibles
- **Clé Gemini** dans .env
- **Secret JWT** dans .env
- **URL base de données** dans .env

---

## Déploiement

### Prérequis Serveur
- Node.js 18+
- PostgreSQL 12+
- PM2 pour gestion processus
- Nginx pour reverse proxy

### Variables Production
```bash
NODE_ENV=production
CORS_ORIGIN=https://votredomaine.com
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Build Frontend
```bash
cd frontend
npm run build
# Copier dist/ vers serveur web
```

### Démarrage Backend
```bash
cd backend
npm install --production
npm start
# Ou avec PM2: pm2 start server.js --name "emploi-connect"
```

---

## Dépannage

### Problèmes Courants

#### Backend ne démarre pas
```bash
# Vérifier les dépendances
npm install

# Vérifier la base de données
npm run test-db

# Vérifier les variables d'environnement
cat .env
```

#### Erreur PDF-Parse
```javascript
// Vérifier l'import
import { PDFParse } from 'pdf-parse';
// Au lieu de
import pdfParse from 'pdf-parse';
```

#### Erreur Gemini API
```bash
# Vérifier la clé API
echo $GEMINI_API_KEY

# Tester la connectivité
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  "https://generativelanguage.googleapis.com/v1/models"
```

#### Frontend ne charge pas les jobs
```bash
# Vérifier le proxy Vite
# Dans vite.config.ts
proxy: {
  "/api": "http://127.0.0.1:5000"
}

# Vérifier que le backend tourne
curl http://localhost:5000/api/jobs
```

#### Erreur "Unexpected token" ou parsing JSON
```javascript
// Cause: Réponse d'erreur non-JSON (multipart ou HTML)
// Solution: Gestion d'erreur améliorée côté frontend

// Le frontend gère maintenant:
// 1. Tentative de parsing JSON
// 2. Fallback vers texte brut
// 3. Message d'erreur HTTP générique
```

#### Erreurs Multer (upload)
```javascript
// Gestion des erreurs d'upload:
// - Fichier trop volumineux → 413 avec message JSON
// - Type de fichier incorrect → 400 avec message JSON
// - Erreur Multer générique → 400 avec message détaillé
```
```bash
# Logs console
node server.js

# Avec PM2
pm2 logs emploi-connect
```

#### Logs Frontend
```javascript
// Console navigateur (F12)
console.log('API Response:', data);

// Vérifier les requêtes réseau
// Onglet Network dans DevTools
```

#### Tests API
```bash
# Test endpoint jobs
curl http://localhost:5000/api/jobs

# Test avec authentification
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/admin/jobs
```

---

## Maintenance

### Mises à Jour
```bash
# Backend
cd backend && npm update

# Frontend
cd frontend && npm update

# Rebuild et redémarrage
npm run build && pm2 restart emploi-connect
```

### Sauvegarde Base de Données
```bash
# Dump PostgreSQL
pg_dump emploi_plus_db_cg > backup_$(date +%Y%m%d).sql

# Restauration
psql emploi_plus_db_cg < backup_20240305.sql
```

### Monitoring
- **PM2** : `pm2 monit`
- **Logs** : Rotation automatique
- **Health checks** : `/api/health`

---

## Support et Contact

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier les logs d'erreur
3. Tester les endpoints API
4. Ouvrir une issue sur le repository

**Version** : 1.0.0
**Date** : Mars 2026
**Auteur** : Équipe Développement Emploi Connect</content>
<parameter name="filePath">/Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/DOCUMENTATION_CANDIDATURE_INTELLIGENTE.md