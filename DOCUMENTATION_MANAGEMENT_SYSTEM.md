# Système de Gestion des Documentations

## Vue d'ensemble

Le système de gestion des documentations permet aux administrateurs de créer, modifier, publier et supprimer des documents légaux et des politiques de la plateforme (Politique de confidentialité, Mentions légales, Gestion des cookies, etc.) sans modifier le code source.

## Fonctionnalités

✅ **Créer des documents** - Créez de nouveaux documents avec un nom, un slug unique et du contenu HTML  
✅ **Modifier les documents** - Modifiez le contenu des documents existants  
✅ **Supprimer des documents** - Supprimez les documents qui ne sont plus nécessaires  
✅ **Publier/Dépublier** - Contrôlez quels documents sont visibles publiquement  
✅ **Gestion du contenu riche** - Supportez le HTML pour formater le contenu (titres, paragraphes, listes, etc.)  
✅ **Statistiques** - Visualisez le nombre de documents par type  
✅ **Intégration automatique** - Les pages Privacy, Legal et Cookies affichent automatiquement les documents

## Architecture

### Base de données

**Table: `documentations`**
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 255) - Nom du document
- slug (VARCHAR 255) UNIQUE - Identifiant unique pour l'URL/l'API
- type (VARCHAR 50) - Type de document (privacy, terms, cookies, legal, other)
- content (TEXT) - Contenu HTML du document
- is_published (BOOLEAN) - Statut de publication
- created_by (INTEGER FK) - Administrateur qui a créé le document
- updated_by (INTEGER FK) - Administrateur qui a modifié le document
- created_at (TIMESTAMP) - Date de création
- updated_at (TIMESTAMP) - Date de dernière mise à jour
```

### API Endpoints

#### Public (sans authentification)
- `GET /api/documentations/public/:slug` - Récupère un document publié par slug

#### Admin (avec authentification super_admin/admin)
- `GET /api/documentations` - Liste tous les documents
- `GET /api/documentations/stats` - Statistiques des documents
- `GET /api/documentations/:id` - Récupère un document par ID
- `POST /api/documentations` - Crée un nouveau document
- `PUT /api/documentations/:id` - Met à jour un document
- `PATCH /api/documentations/:id/publish` - Publie/Dépublie un document
- `DELETE /api/documentations/:id` - Supprime un document

### Frontend

**Page d'administration**
- Route: `/admin/documentations`
- Composant: `DocumentationManager.tsx`
- Styles: `DocumentationManager.css`

**Pages publiques (mise à jour automatique)**
- `/privacy` - Politique de confidentialité (slug: `privacy`)
- `/legal` - Mentions légales (slug: `legal`)
- `/cookies` - Gestion des cookies (slug: `cookies`)

## Installation et déploiement

### 1. Exécuter la migration de base de données

```bash
cd backend
node run-migration-004.js
```

Cela créera la table `documentations` et les index associés.

### 2. Démarrer le serveur backend

```bash
npm start
```

### 3. Accéder à la page d'administration

Une fois authentifié comme super administrateur:
1. Allez à `/admin/documentations`
2. Cliquez sur "Nouveau document"
3. Remplissez le formulaire

## Utilisation

### Créer un document

1. **Allez dans l'admin** - `Super Admin Panel > Documentations`
2. **Cliquez "Nouveau document"**
3. **Remplissez les champs:**
   - **Nom**: Le titre du document (ex: "Politique de confidentialité")
   - **Slug**: Identifiant unique, auto-généré en fonction du nom (ex: "privacy-policy")
   - **Type**: Sélectionnez le type (Privacy, Terms, Cookies, Legal, Other)
   - **Contenu**: La page HTML du document

4. **Formatez le contenu avec HTML:**
   ```html
   <h2>Chapitre 1</h2>
   <p>Votre texte ici...</p>
   <ul>
     <li>Point 1</li>
     <li>Point 2</li>
   </ul>
   ```

5. **Cliquez "Créer"**

### Publier un document

Une fois créé, le document est en brouillon par défaut. Pour le publier:
1. Trouvez le document dans la liste
2. Cliquez sur le bouton "Brouillon"
3. Le document devient "Publié" et visible publiquement

### Utiliser le document sur le site

Les pages Privacy, Legal, et Cookies affichent automatiquement les documents correspondants:
- **Privacy**: Slug `privacy`
- **Legal**: Slug `legal`
- **Cookies**: Slug `cookies`

Si aucun document n'est trouvé, les pages affichent un contenu de secours (fallback).

### Types de documents prédéfinis

| Type | Description | Exemple de slug |
|------|-------------|-----------------|
| Privacy | Politique de confidentialité | `privacy` |
| Terms | Conditions générales | `terms-of-service` |
| Cookies | Gestion des cookies | `cookies` |
| Legal | Mentions légales | `legal-notice` |
| Other | Autres documents | `custom-doc` |

## Exemples de contenu

### Politique de confidentialité

```html
<h2>1. Données collectées</h2>
<p>Nous collectons les informations suivantes:</p>
<ul>
  <li>Nom et prénom</li>
  <li>Adresse email</li>
  <li>CV et documents professionnels</li>
</ul>

<h2>2. Utilisation des données</h2>
<p>Vos données sont utilisées pour:</p>
<ul>
  <li>Fournir nos services</li>
  <li>Améliorer l'expérience utilisateur</li>
  <li>Respecter les obligations légales</li>
</ul>

<h2>3. Sécurité</h2>
<p>Vos données sont protégées par des mesures de sécurité modernes.</p>
```

### Mentions légales

```html
<h2>Informations légales</h2>
<p><strong>Dénomination:</strong> EmploiPlus SARL</p>
<p><strong>Siège social:</strong> Brazzaville, République du Congo</p>
<p><strong>Email:</strong> contact@emploiplus-group.com</p>
<p><strong>Numéro SIRET:</strong> [À remplir]</p>

<h2>Responsable du site</h2>
<p>Le site est géré par l'équipe administrative d'EmploiPlus.</p>
```

## Fichiers créés

**Backend:**
- `/backend/models/documentation.model.js` - Modèle de données
- `/backend/controllers/documentation.controller.js` - Contrôleur des actions
- `/backend/routes/documentation.routes.js` - Routes API
- `/backend/migrations/004_create_documentations_table.sql` - Migration BD
- `/backend/run-migration-004.js` - Script de migration

**Frontend:**
- `/frontend/src/pages/AdminDashboard/DocumentationManager.tsx` - Page d'admin
- `/frontend/src/pages/AdminDashboard/DocumentationManager.css` - Styles
- `/frontend/src/pages/admin/documentations/page.tsx` - Page wrapper
- `/frontend/src/components/DocumentPageViewer.tsx` - Composant d'affichage
- Pages mises à jour: `Privacy.tsx`, `Legal.tsx`, `Cookies.tsx`

## Intégration dans server.js

Les routes sont intégrées dans `server.js`:
```javascript
import documentationRoutes from './routes/documentation.routes.js';

// Public route
app.use('/api/documentations', documentationRoutes);

// Admin route
app.use('/api/admin/documentations', requireAdmin, requireRoles('super_admin','admin'), documentationRoutes);
```

## Notes de développement

- Les documents sont stockés en HTML pour permettre un formatage riche
- Le slug doit être unique et ne pas contenir d'espaces (auto-conversion)
- Seuls les documents publiés (`is_published = true`) sont visibles publiquement
- La suppression d'un document est irréversible
- Les dates de création/modification sont automatiquement gérées

## Support et maintenance

Pour ajouter un type de document:
1. Modifiez l'array `DOCUMENT_TYPES` dans `DocumentationManager.tsx`
2. Mettez à jour la fonction `getTypeBadgeColor` pour ajouter une couleur
3. Selon le besoin, créez une page spécifique ou mettez à jour une page existante

## Prochaines étapes possibles

- [ ] Versioning des documents (historique des modifications)
- [ ] Support multi-langue pour les documents
- [ ] Validation du contenu HTML (sanitization)
- [ ] Export des documents (PDF, Word)
- [ ] Aperçu en direct lors de l'édition
- [ ] Système de commentaires/notes pour les administrateurs
