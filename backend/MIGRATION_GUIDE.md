# Guide de Migration vers Architecture Modulaire

## 📋 Aperçu

Votre fichier `server.ts` contient 3401 lignes et couvre:
- ✅ Authentification (admin login/register)
- ✅ Offres d'emploi (CRUD)
- ✅ Formations (CRUD)
- ✅ Gestion des admins
- ✅ Utilisateurs (profiles)
- ✅ Documents et Skills
- ✅ Vérifications de compte
- ✅ FAQs
- ✅ Publications/Newsfeed
- ✅ Catalogues de services
- ✅ Statistiques
- ✅ Portfolios
- ✅ Canaux de communication
- ✅ Upload de fichiers
- ✅ Notifications

## 🎯 Stratégie de Migration

### Phase 1: Foundation (En cours)
- [x] Créer structure de dossiers (routes/, controllers/, middleware/, utils/, config/)
- [x] Extraire middleware d'authentification
- [x] Créer fichier de constantes
- [x] Créer fichiers utilitaires helpers
- [ ] Créer fichier d'erreurs middleware
- [ ] Créer fichier de validation

**Fichiers créés:**
- `backend/src/middleware/auth.ts` - Authentification
- `backend/src/config/constants.ts` - Constantes
- `backend/src/utils/helpers.ts` - Utilitaires
- `backend/src/routes/index.ts` - Registre des routes
- `backend/src/server-modular.ts` - Server principal (version modulaire)

### Phase 2: Routes modulaires (À faire)

Migrer chaque section du server.ts vers sa propre route:

#### 2.1 Authentication Routes
**Fichier:** `routes/auth.ts`
**Endpoints:**
- POST /api/auth/admin/register
- POST /api/auth/admin/login
- POST /api/auth/user/register
- POST /api/auth/user/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

#### 2.2 User Routes
**Fichier:** `routes/users.ts`
**Endpoints:**
- GET /api/users/me
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id
- GET /api/users/candidates?limit=X
- GET /api/users/me/profile-stats
- POST /api/users/me/documents
- DELETE /api/users/me/documents/:id
- GET /api/users/me/skills
- POST /api/users/me/skills
- DELETE /api/users/me/skills/:id

#### 2.3 Jobs Routes
**Fichier:** `routes/jobs.ts`
**Endpoints:**
- GET /api/jobs
- POST /api/jobs (userAuth)
- GET /api/jobs/:id
- PUT /api/jobs/:id (userAuth)
- DELETE /api/jobs/:id (userAuth)
- GET /api/jobs/recommendations/for-me (userAuth)
- POST /api/jobs/:id/apply (userAuth)
- GET /api/company/jobs (userAuth)
- GET /api/company/stats (userAuth)

#### 2.4 Formations Routes
**Fichier:** `routes/formations.ts`
**Endpoints:**
- GET /api/formations
- POST /api/formations (adminAuth)
- GET /api/formations/:id
- PUT /api/formations/:id (adminAuth)
- DELETE /api/formations/:id (adminAuth)
- POST /api/formations/:id/register (userAuth)
- GET /api/formations/my-enrollments (userAuth)

#### 2.5 Admin Routes
**Fichier:** `routes/admin.ts`
**Endpoints:**
- GET /api/admin/users (adminAuth)
- GET /api/admin/jobs (adminAuth)
- POST /api/admin/site-notifications (adminAuth)
- GET /api/admin/stats (adminAuth)
- PUT /api/admin/site-settings (adminAuth)
- GET /api/admin/site-settings (adminAuth)
- [... autres routes admin]

#### 2.6 Publications Routes
**Fichier:** `routes/publications.ts`
**Endpoints:**
- GET /api/publications
- POST /api/publications (userAuth)
- GET /api/publications/:id
- PUT /api/publications/:id (userAuth)
- DELETE /api/publications/:id (userAuth)
- POST /api/publications/:id/like (userAuth)
- DELETE /api/publications/:id/like (userAuth)

#### 2.7 Notifications Routes
**Fichier:** `routes/notifications.ts`
**Endpoints:**
- GET /api/notifications (userAuth)
- POST /api/notifications/:id/read (userAuth)
- GET /api/site-notifications
- POST /api/admin/site-notifications (adminAuth)

#### 2.8 Other Routes
- `routes/faqs.ts` - FAQ management
- `routes/portfolios.ts` - Portfolio management
- `routes/services.ts` - Service catalogs
- `routes/upload.ts` - File upload
- `routes/verification.ts` - Account verification

### Phase 3: Controllers (À faire)

Créer des contrôleurs pour chaque domaine:
- `controllers/authController.ts`
- `controllers/userController.ts`
- `controllers/jobController.ts`
- `controllers/formationController.ts`
- `controllers/adminController.ts`
- `controllers/publicationController.ts`
- `controllers/notificationController.ts`
- `controllers/portfolioController.ts`

**Exemple de pattern:**
```typescript
// controllers/userController.ts
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ success: false });
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // ... update logic
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
};
```

### Phase 4: Services (À faire)

Créer des services pour la logique métier réutilisable:
- `services/emailService.ts` - Envoi d'emails
- `services/fileService.ts` - Gestion des fichiers
- `services/analyticsService.ts` - Tracking événements
- `services/verificationService.ts` - Vérification de comptes

### Phase 5: Models (À faire)

Centraliser les requêtes DB:
- `models/User.ts`
- `models/Job.ts`
- `models/Formation.ts`
- `models/Publication.ts`

## 🚀 Utilisation Immédiate

### Option 1: Progressive (Recommandé)
1. Garder `server.ts` en place
2. Créer progressivement les fichiers modulaires
3. Rediriger les imports dans `server.ts` vers les nouveaux fichiers
4. Tester à chaque étape
5. Supprimer le code ancien une fois migré

### Option 2: Remplacer immédiatement
1. Copier tout le code du `server.ts` existant
2. Le migrer dans les fichiers modulaires
3. Remplacer `server.ts` par `server-modular.ts`

## 📦 Prochaines étapes

1. **Créer `routes/auth.ts`** - Extraire toutes les routes d'authentification
2. **Créer `routes/users.ts`** - Extraire les routes utilisateur
3. **Créer les controllers** - Créer logique métier pour chaque route
4. **Tester progressivement** - Vérifier que chaque route fonctionne
5. **Documenter** - Ajouter des commentaires et documentation API

## 📝 Checklist de Migration

- [ ] Phase 1: Foundation (EN COURS)
  - [x] Structure dossiers
  - [x] Middleware auth
  - [x] Constantes
  - [x] Helpers
  - [ ] Error middleware
  - [ ] Validators
- [ ] Phase 2: Routes modulaires
  - [ ] Auth routes
  - [ ] User routes
  - [ ] Job routes
  - [ ] Formation routes
  - [ ] Admin routes
  - [ ] Publication routes
  - [ ] Notification routes
  - [ ] Other routes
- [ ] Phase 3: Controllers
  - [ ] Auth controller
  - [ ] User controller
  - [ ] Job controller
  - [ ] Formation controller
  - [ ] Admin controller
  - [ ] Publication controller
- [ ] Phase 4: Services
  - [ ] Email service
  - [ ] File service
  - [ ] Analytics service
  - [ ] Verification service
- [ ] Phase 5: Models
  - [ ] User model
  - [ ] Job model
  - [ ] Formation model
  - [ ] Publication model
- [ ] Testing & Validation
- [ ] Documentation complète

## 🔗 Ressources

- Architecture fichier: `/backend/ARCHITECTURE.md`
- Config constantes: `/backend/src/config/constants.ts`
- Middleware auth: `/backend/src/middleware/auth.ts`
- Utils helpers: `/backend/src/utils/helpers.ts`
- Routes index: `/backend/src/routes/index.ts`
- Server modular: `/backend/src/server-modular.ts`

## ⚠️ Notes importantes

1. **Backward Compatibility**: Le `server.ts` existant reste inchangé pour l'instant
2. **Types TypeScript**: Assurez-vous d'importer les types Express corrects
3. **JWT Secret**: Toujours utiliser la variable d'env JWT_SECRET
4. **Pool PostgreSQL**: Importer depuis `config/database.ts`
5. **Testingapprofondie requise** avant de supprimer le code original
