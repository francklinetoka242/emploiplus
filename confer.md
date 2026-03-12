# Architecture de navigation

Ce document cartographie l'architecture de navigation du projet React (`frontend/src`). Il doit servir de base à la génération d'une barre de navigation dynamique.

---

## 1. Plan des routes

> Les routes sont définies dans `frontend/src/App.tsx`. Le composant `<Layout />` encapsule l'ensemble des routes publiques (header + footer). Un second `Layout` sert pour l'administration.

```
<HashRouter>
  <Routes>
    <!-- PUBLIC (Layout) -->
    <Route element={<Layout />}>                                                      // parent global
      /                          ➜ Home
      /services                  ➜ Services
      /emplois                   ➜ Jobs
      /formations                ➜ Formations
      /formations/inscription    ➜ FormationEnrollment (formulaire)
      /a-propos                  ➜ About
      /compte                    ➜ Profile
      /utilisateur/:userId       ➜ UserProfile
      /parametres                ➜ SettingsLayout (voir sous-routes)
      /fil-actualite             ➜ Newsfeed
      /mes-publications          ➜ MyPublications
      /publication/:publicationId/report    ➜ PublicationReportPage
      /publication/:publicationId/hide      ➜ PublicationHidePage
      /publication/:publicationId/share     ➜ PublicationSharePage
      /company/validations                   ➜ CompanyValidations
      /candidats                              ➜ Candidates
      /candidate/:candidateId                ➜ CandidateDetailPage
      /spontaneous-application/:companyId    ➜ SpontaneousApplication
      /recrutement                            ➜ Recrutement
      /search                                 ➜ SearchResults
      /annuaire                               ➜ Annuaire
      /documents                              ➜ DocumentationPage
      /company/:id                            ➜ CompanyPage
      /recrutement/postuler/:id               ➜ ApplyJob
      /merci                                  ➜ ThankYou
      /candidature-intelligente/:jobId        ➜ CandidatureIntelligente
      /notifications                          ➜ Notifications
      /test-competence                        ➜ CompetenceTest
      /simulateur-entretien                   ➜ InterviewSimulator
      /matching-demo                          ➜ MatchingDemo
      /connexions                             ➜ Connections
      /messages                               ➜ Messages
      <!-- outils/services individuels -->
      /cv-generator                           ➜ CVGenerator
      /cv-modeles                             ➜ CVTemplates
      /letter-generator                       ➜ LetterGenerator
      /letter-modeles                         ➜ MotivationLetters
      /services/redaction                     ➜ DocumentService
      /services/informatique                  ➜ ITService
      /services/digital                       ➜ SocialMediaService
      /services/design                        ➜ GraphicDesignService
      /services/redaction-documents            ➜ RedactionDocuments
      /services/conception-informatique       ➜ ConceptionInformatique
      /services/gestion-plateformes           ➜ GestionPlateformes
      /services/conception-graphique         ➜ ConceptionGraphique
      /services/numeriques                    ➜ ServicesNumeriques
      <!-- catalogues -->
      /services/redaction-pro                 ➜ RedactionServices
      /services/informatique-pro              ➜ InformatiqueServices
      /services/digital-pro                   ➜ DigitalServices
      /services/graphique-pro                 ➜ GraphiqueServices
      /services/flyers                        ➜ FlyerGallery
      /services/flyer-creator                 ➜ FlyerCreator
      /services/banner-creator                ➜ BannerCreator
      /services/banner-templates              ➜ BannerTemplates
      /services/business-card-editor          ➜ BusinessCardEditor
      /services/business-card-models          ➜ BusinessCardModels
      /services/portfolio-builder             ➜ PortfolioBuilder
      /services/portfolio-templates           ➜ PortfolioTemplates
      /services/portfolio-minimaliste-editor  ➜ PortfolioMinialisteEditor
    </Route>

    <!-- AUTHENTICATION / PUBLIC (hors Layout) -->
    /connexion                ➜ LoginUser
    /inscription              ➜ Register
    /auth/callback            ➜ AuthCallback
    /contact                  ➜ Contact
    /privacy                  ➜ Privacy
    /legal                    ➜ Legal
    /cookies                  ➜ Cookies

    <!-- ADMIN (AdminLayout) -->
    /admin                    ➜ AdminLayout (dashboard)
      /admin/dashboard        ➜ DashboardPage (protected)
      /admin/login-history    ➜ LoginHistoryPage (super_admin)
      /admin/system-health    ➜ SystemHealthPage (super_admin)
      /admin/jobs             ➜ JobsPage (permission guard)
      /admin/publications     ➜ PublicationsAdminPage (roles)
      /admin/users            ➜ UsersPage (permission guard)
      /admin/users/:userId    ➜ AdminUserProfile (roles)
      /admin/subscriptions    ➜ AdminSubscriptionsPage (roles)
      /admin/admins           ➜ AdminsPage (super_admin)
      /admin/audit-logs       ➜ AuditLogsPage (super_admin)
      /admin/formations       ➜ FormationsPage (super_admin)
      /admin/services         ➜ ServicesPage (super_admin)
      /admin/faqs             ➜ AdminFaqsPage (super_admin)
      /admin/documents        ➜ DocumentsAdminPage (super_admin)
      /admin/documentations   ➜ DocumentationsPage (super_admin)
      /admin/notifications    ➜ AdminNotificationsPage (auth)
      /admin/parametres       ➜ AdminParametresPage (auth)
      /admin/verify-requests  ➜ VerifyRequestsPage (super_admin)
      /admin/portfolios       ➜ PortfoliosAdminPage (super_admin)
      /admin/catalogs         ➜ CatalogsPage (super_admin)
      /admin/catalogues-services ➜ CataloguesServicesPage (super_admin)
      /admin/export           ➜ AdminExport (super_admin)
      /admin/profile          ➜ AdminProfilePage (auth)
      /admin/admin-management ➜ AdminManagement (super_admin)

    <!-- ADMIN PAGES hors layout -->
    /admin/login             ➜ AdminLogin
    /admin/verify-success    ➜ VerifySuccessPage
    /admin/verify-email      ➜ VerifyEmailPage
    /admin/register/super-admin        ➜ SuperAdminRegister
    /admin/register/content-admin      ➜ ContentAdminRegister
    /admin/register/user-admin         ➜ UserAdminRegister
    /admin/access-denied      ➜ AccessDenied

    /* 404 catch‑all */
    *                        ➜ NotFound
  </Routes>
</HashRouter>
```

### 1.1 Sous-routes de `/parametres`

```
/parametres                         (SettingsLayout)
├─ index                          ➜ SettingsDashboard
├─ securite                       ➜ SettingsSecurity
├─ verification                   ➜ SettingsVerification
├─ recommandations               ➜ SettingsRecommendations
├─ supprimer                     ➜ SettingsDelete
├─ profil                        ➜ CandidateProfile
├─ informations                  ➜ CandidateInformation
├─ confidentialite-profil        ➜ CandidatePrivacy
├─ profil-entreprise             ➜ CompanyProfile
├─ localisation                  ➜ CompanyLocation
├─ confidentialite               ➜ CompanyPrivacy
├─ abonnement                    ➜ Subscription
```

> Ces routes sont chargées dans `SettingsLayout` qui contient un `<Outlet />` et la barre latérale.

---

## 2. Structure des pages majeures

### 2.1 Emplois (`Jobs`)

- **Wrapper mobile** : `PWALayout` (notificationCount/messageCount).
- **Composants clés** : `JobSearchCompact`, `JobSearchInput`, `JobListItem`, `SaveJobButton`, `BottomNavigationBar` (via PWALayout).
- **Fonctions** : recherche avec debouncing (`useJobSearch`), filtres, infinite scroll (`useInfiniteScroll`), recommandations personnalisées.
- **Sous‑pages/actions** : `/recrutement/postuler/:id` (via page `ApplyJob`), candidature intelligente, rapport/masquer/partager publication.

### 2.2 Services (`Services`)

- **Wrapper mobile** : `PWALayout`.
- **Navigation interne** : onglets `optimization`, `tools`, `visual`, `digital` avec barres mobile (grid) et sidebar desktop.
- **Composants clés** : `HeroServices`, `SearchBar`, `OptimizationCandidates`, `OptimizationCompanies`, `CareerTools`, `VisualCreation`, `DigitalServices`, `Breadcrumb`.
- **Bibliothèques** : icônes lucide-react, composants UI génériques (Card, Button…).
- **Sous‑pages** : nombreuses routes `/services/...` (voir plan des routes). Chaque service a sa propre page isolée.

### 2.3 Formations (`Formations`)

- **Wrapper mobile** : `PWALayout` avec `hideHeader` (remplacé par `FormationSearchCompact`).
- **Composants clés** : `FormationSearchCompact`, `FormationListItem`, `ProfileSidebar` (desktop), filtres, pagination, barre latérale de conseils pour l’utilisateur.
- **Sous‑page** : `/formations/inscription` (page `FormationEnrollment` contenant le formulaire d’inscription) et redirections / merci.

### 2.4 Profil (`Profile`)

- **Route** : `/compte`.
- **Composants clés** : `SettingsSidebar` (latéral), formulaires d’édition du profil, indicateur de complétude (`Progress` component), boutons de navigation vers les sections paramétrages.
- **Interactions** : chargement via API `/api/users/me`, gestion d’état `profileData`, champ photo, suppression du compte.
- **Pages enfants** : les routes `/parametres/...` (celles listées plus haut) constituent l’exploration détaillée des réglages. Elles sont rendues dans `SettingsLayout`.


> Les autres pages importantes (Newsfeed, Recrutement, Candidature intelligente, etc.) suivent un schéma similaire : wrapper `PWALayout` + composants métiers.

---

## 3. Layout actuel et injection de la navigation mobile

- **Desktop** : la barre de navigation (header + footer) est définie dans `components/Layout.tsx`. Elle s’applique à tous les enfants de la route publique (`<Layout />` dans `App.tsx`).
- **Mobile PWA** : la navigation (header mobile, barre bas, drawer) vit dans `components/layout/PWALayout.tsx`.
  - Ce layout **n’est pas utilisé globalement**. Chaque page qui doit afficher la navigation mobile importe et encadre son contenu avec `<PWALayout>`.
  - Exemple : `Jobs`, `Services`, `Formations`, `Newsfeed`, `Messages`, etc. Les pages d’authentification (`LoginUser`, `Register`) envoient `hideNavigation` pour masquer les boutons.
  - Paramètres : `notificationCount`, `messageCount`, `hideNavigation`, `hideHeader` (recherche), etc.
- **Injection** : l’élément `<PWALayout>` se place manuellement dans le composant de page, souvent en position racine du JSX retourné. Certaines pages (ApplyJob, Profile) ne l’utilisent pas et se reposent uniquement sur le layout global.

---

## 4. Flux de navigation spéciaux

Certaines vues n’utilisent pas le menu principal ou nécessitent des boutons d’action arrière/valider :

1. **Pages d'authentification** (`/connexion`, `/inscription`, `/auth/callback`) : `PWALayout hideNavigation` → pas de barre mobile, interface épurée.
2. **Formulaires / wizard**
   - `/formations/inscription` (`FormationEnrollment`) : flux multi‑étapes avec bouton `Retour` générique et validation en bas de page.
   - `/recrutement/postuler/:id` (`ApplyJob`) : page de candidature avec lien explicite « Retour aux offres » et plusieurs états (deadline dépassée, déjà postulé, succès).
   - `/recrutement` : centre d’upload CV et simulation ; utilise des boutons de validation interne.
3. **Pages de navigation interne**
   - `Services` : onglets mobiles avec navigation par état `activeTab` – pas de menu bas fixe mais boutons de filtre.
   - `Messages` : la page conversation (`Messages.tsx`) présente un titre dynamique et un bouton « Retour » pour quitter le chat.
4. **Vues éphémères / résultat**
   - `/merci`, `/publication/:id/report`, `/publication/:id/share` offrent des liens de retour clairs.
5. **Pages avec recherche** : `Formations`, `JobsOptimized` provoquent la disparition du header mobile via `hideHeader` et s’appuient sur une barre de recherche fixe.

> Observations utiles pour une barre dynamique :
> - Besoin d’un mécanisme « page principale » vs « page secondaire » pour basculer entre menu bas et bouton retour (`SecondaryHeader` est utilisé en production).
> - Prop `hideNavigation` et `hideHeader` contrôlent la présence de la nav sur mobile.
> - Les boutons de validation sont implémentés localement, pas par un layout commun.

---

## 5. À retenir pour l'implémentation d'une barre de navigation dynamique

1. **Analyser la route active** : utiliser le plan de routes pour déterminer si l’on est dans l’espace public, admin, ou page isolée.
2. **Vérifier les métadonnées de la page** : chaque page/route peut exporter ou définir un flag (`hideNavigation`, `secondaryHeader`, `requiresBack`, `noNav`) qui l’informe comment s’afficher.
3. **Rendre le layout conditionnel** : conserver `PWALayout` tel quel mais permettre qu’il s’attache automatiquement via un wrapper HOC ou configuration de route plutôt qu’une importation manuelle.
4. **Prévoir actions spécifiques** : ajouter des emplacements `leftAction` / `rightAction` (Retour, Valider) dans le header mobile pour les flux de candidature, formulaire, etc.
5. **Consistance mobile/desktop** : le footer existant restera inchangé ; la barre dynamique se charge uniquement sur les écrans `md:hidden`.

> Cette cartographie donne l’ensemble des éléments nécessaires pour générer un algorithme capable de parcourir l’objet de routes (`App.tsx`) et d’annoter chaque vue avec les paramètres de navigation adaptés. Une fois structurée, un autre assistant ou un script pourra générer le composant de barre de navigation dynamique automatiquement.
