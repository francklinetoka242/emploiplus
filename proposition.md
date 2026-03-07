# Proposition d'organisation du dossier backend/uploads/

## Analyse des formulaires et composants d'upload

### Frontend - Composants avec upload de fichiers :

1. **CandidatureIntelligente.tsx**
   - Upload de CV (PDF uniquement) pour extraction de données
   - Route backend : `/api/ai/extract-cv`

2. **CandidateDocumentsUpload.tsx**
   - CV (PDF, DOC, DOCX)
   - Lettre de Motivation (PDF, DOC, DOCX)
   - Diplômes (PDF, JPG, PNG)
   - Certificats de Travail (PDF, JPG, PNG)
   - CNI/Carte Nationale (PDF, JPG, PNG)
   - Passeport (PDF, JPG, PNG)
   - Carte de Résidence (PDF, JPG, PNG)
   - NUI (PDF, JPG, PNG)
   - Récépissé ACPE (PDF, JPG, PNG)

3. **AdminProfile.tsx**
   - Upload d'avatar/photo de profil (JPG, PNG, WEBP)

4. **Recrutement.tsx**
   - Images pour offres d'emploi (JPG, PNG, WEBP)

5. **Admin Catalogs (services)**
   - Images pour services (JPG, PNG, WEBP)

6. **Admin Notifications**
   - Images accompagnant les notifications (JPG, PNG, WEBP)

### Backend - Routes et middlewares :

1. **routes/upload.routes.js**
   - Middleware : Multer avec destination 'tmp/'
   - Route : `POST /api/uploads/candidate`
   - Gère les documents candidats via `uploadCandidateDocAndSave`

2. **routes/ai.routes.js**
   - Middleware : Multer en mémoire pour PDF
   - Routes : `POST /api/ai/extract-cv`, `POST /api/ai/analyze-cv`
   - Gère l'extraction et analyse de CV PDF

3. **Configuration centralisée (config/upload.config.js)**
   - Définit tous les types de fichiers et leurs règles

## Proposition d'arborescence idéale

Basée sur la configuration existante et les besoins identifiés :

```
backend/uploads/
├── public/           # Fichiers accessibles publiquement
│   ├── avatars/      # Photos de profil utilisateurs (JPG, PNG, WEBP)
│   ├── job-images/   # Images des offres d'emploi (JPG, PNG, WEBP)
│   ├── portfolios/   # Images de portfolios (JPG, PNG, WEBP)
│   ├── notifications/# Images des notifications (JPG, PNG, WEBP)
│   ├── services/     # Images des services/catalogues (JPG, PNG, WEBP)
│   └── trainings/    # Images des formations (JPG, PNG, WEBP)
│
├── private/          # Fichiers protégés (accès via API sécurisée)
│   ├── cv/           # Curriculum Vitae (PDF, DOC, DOCX)
│   ├── resumes/      # Lettres de motivation (PDF, DOC, DOCX)
│   ├── diplomas/     # Diplômes et certificats (PDF, JPG, PNG)
│   ├── identity/     # Documents d'identité (PDF, JPG, PNG)
│   ├── company-docs/ # Documents légaux d'entreprises (PDF, JPG, PNG)
│   └── temp/         # Fichiers temporaires pour IA (PDF)
│
└── .htaccess         # Protection des dossiers private/
```

## Détails par dossier

### Public (accessible via /uploads/)
- **avatars/** : Photos de profil - Public car affiché sur les profils
- **job-images/** : Images d'offres d'emploi - Public pour attractivité
- **portfolios/** : Images de projets portfolio - Public pour démonstration
- **notifications/** : Images de notifications - Public si partagé
- **services/** : Images de services - Public pour catalogue

### Privé/Protégé (accès via /api/uploads/secure/)
- **cv/** : CV des candidats - Privé pour confidentialité
- **resumes/** : Lettres de motivation - Privé pour confidentialité
- **diplomas/** : Diplômes et certificats - Privé pour confidentialité
- **identity/** : Documents d'identité (CNI, passeport, etc.) - Privé pour sécurité
- **company-docs/** : Documents légaux d'entreprises - Privé pour confidentialité
- **temp/** : Fichiers temporaires IA - Privé, nettoyés automatiquement

## Recommandations d'implémentation

1. **Migration des fichiers existants** : Script pour déplacer les fichiers vers la nouvelle structure
2. **Mise à jour des routes** : Adapter les chemins dans upload.config.js
3. **Sécurisation** : .htaccess pour bloquer l'accès direct aux dossiers private/
4. **Nettoyage automatique** : Pour le dossier temp/ (24h comme configuré)
5. **Logs d'accès** : Monitoring des accès aux fichiers privés</content>
<parameter name="filePath">/Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/proposition.md