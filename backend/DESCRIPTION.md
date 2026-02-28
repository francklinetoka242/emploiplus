# API Endpoints nécessaire pour le frontend statique

Ce document recense les routes qui doivent exister dans le backend pour
satisfaire aux appels effectués par le frontend (mockés dans
`frontend/src/lib/api-static.ts`). Le code côté frontend suppose les routes
suivantes et les structures de requêtes/réponses décrites ici.

Organisé par fonctionnalité.

---

## 1. Authentification

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/admin/login` | **POST** | `AuthController.loginAdmin` | `AuthService.loginAdmin` | `{ email, password }` | `{ success:boolean, token?:string, message?:string }` |
| `/api/logout`* | **POST** | `AuthController.logout` | `AuthService.logout` | *aucune* | `{ success:boolean }` |
| `/api/user` (ou `/api/me`) | **GET** | `AuthController.getCurrentUser` | `AuthService.getCurrentUser` | *aucune* | `{ data: User }` |

\* le frontend invoque `api.logout()` mais n'utilise pas la réponse.

### Modèle de données `User`
```ts
interface User {
  id: string;
  email: string;
  role?: string;          // candidate|company|admin
  full_name: string;
  avatar_url?: string;
  user_type?: string;     // candidate|company|admin
  is_verified?: boolean;
  created_at?: string;
  // Profil interne éventuel
  profile?: {
    phone?: string;
    location?: string;
    bio?: string;
    experience_years?: number;
    skills?: string[];
    portfolio_url?: string;
    linkedin_url?: string;
    cv_url?: string;
  };
}
```

---

## 2. Offres d'emploi (`jobs`)

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/jobs` | **GET** | `JobController.getJobs` | `JobService.list` | `?params` (filtrage/page) | `{ data: Job[] }` |
| `/api/jobs/:id` | **GET** | `JobController.getJobById` | `JobService.getById` | *aucune* | `{ data: Job }` |
| `/api/jobs` | **POST** | `JobController.createJob` | `JobService.create` | `JobPayload` | `{ data: Job }` |
| `/api/jobs/:id` | **PUT** | `JobController.updateJob` | `JobService.update` | `Partial<JobPayload>` | `{ data: Job }` |
| `/api/jobs/:id` | **DELETE** | `JobController.deleteJob` | `JobService.delete` | *aucune* | `{ success: boolean }` |

### `JobPayload`
```ts
interface JobPayload {
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  employment_type?: string;
  job_category?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  company_logo?: string;
  posted_date?: string;
  deadline?: string;
  is_active?: boolean;
}
```

### Modèle `Job` (complète)
contient tous les champs de `JobPayload` plus `id`, `created_at`,
`view_count`, `applicants_count`.

---

## 3. Formations (`formations`)

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/formations` | **GET** | `FormationController.getFormations` | `FormationService.list` | `?params` | `{ data: Formation[] }` |
| `/api/formations/:id` | **GET** | `FormationController.getFormationById` | `FormationService.getById` | *aucune* | `{ data: Formation }` |
| `/api/formations/:id/enroll` | **POST** | `FormationController.enroll` | `FormationService.enroll` | *aucune* | `{ success:boolean, message?:string }` |

### `Formation` modèle
```ts
interface Formation {
  id: string;
  title: string;
  provider: string;
  category: string;
  level: string;
  duration_hours: number;
  price: number;
  currency: string;
  description: string;
  thumbnail: string;
  instructor: string;
  rating: number;
  students_count: number;
  modules: number;
  certificate: boolean;
}
```

---

## 4. Publications / Newsfeed (`publications`)

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/publications` | **GET** | `PublicationController.getPublications` | `PublicationService.list` | `?params` | `{ data: Publication[] }` |
| `/api/publications/:id` | **GET** | `PublicationController.getPublicationById` | `PublicationService.getById` | *aucune* | `{ data: Publication }` |
| `/api/publications` | **POST** | `PublicationController.createPublication` | `PublicationService.create` | `PublicationPayload` | `{ data: Publication }` |
| `/api/publications/:id` | **DELETE** | `PublicationController.deletePublication` | `PublicationService.delete` | *aucune* | `{ success:boolean }` |

### `PublicationPayload`
```ts
interface PublicationPayload {
  author_id?: string;
  content: string;
  image_url?: string;
  visibility?: 'public'|'private'|'connections';
  category?: string;
  achievement?: boolean;
}
```

### `Publication` modèle complet
inclut tous les champs du payload plus `id`, timestamps,
`likes_count`, `comments_count`, `author` (objet utilisateur).

---

## 5. FAQ (`faq`)

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/faq` | **GET** | `FaqController.getFAQ` | `FaqService.list` | *aucune* | `{ data: FaqItem[] }` |

### `FaqItem`
```ts
interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  is_active?: boolean;
}
```

---

## 6. Notifications (`notifications`)

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/notifications` | **GET** | `NotificationController.getNotifications` | `NotificationService.list` | *aucune* | `{ data: Notification[] }` |
| `/api/notifications/:id/read` | **POST** | `NotificationController.markAsRead` | `NotificationService.markAsRead` | *aucune* | `{ success:boolean }` |

### `Notification`
```ts
interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  status: 'read'|'unread';
  created_at: string;
  data?: any;
}
```

---

## 7. Dashboard (`dashboard`)

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/dashboard/stats` | **GET** | `DashboardController.getStats` | `DashboardService.stats` | *aucune* | `{ data: DashboardStats }` |

### `DashboardStats`
```ts
interface DashboardStats {
  total_users: number;
  total_jobs: number;
  total_formations: number;
  total_publications: number;
  active_candidates: number;
  active_companies: number;
  monthly_revenue: number;
  system_health: {
    status: string;
    uptime_percentage: number;
    response_time_ms: number;
    database_connections: number;
    cache_hit_rate: number;
  };
}
```

---

## 8. Services (`services`)

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/services` | **GET** | `ServiceController.getServices` | `ServiceService.list` | *aucune* | `{ data: ServiceItem[] }` |

### `ServiceItem`
```ts
interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  icon?: string;
}
```

---

## 9. Companies (`companies`)

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/companies` | **GET** | `CompanyController.getCompanies` | `CompanyService.list` | *aucune* | `{ data: Company[] }` |
| `/api/companies/:id` | **GET** | `CompanyController.getCompanyById` | `CompanyService.getById` | *aucune* | `{ data: Company }` |

### `Company`
```ts
interface Company {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  location?: string;
  employees_count?: number;
  industry?: string;
  founded_year?: number;
  verified?: boolean;
}
```

---

## 10. Users (`users`)

| Route | Méthode | Contrôleur | Service | Requête | Réponse |
|-------|---------|------------|---------|---------|---------|
| `/api/users` | **GET** | `UserController.getUsers` | `UserService.list` | *aucune* | `{ data: User[] }` |
| `/api/users/:id` | **GET** | `UserController.getUserById` | `UserService.getById` | *aucune* | `{ data: User }` |

(`User` modèle déjà décrit ci‑dessus)

---

## 11. Fallback générique

Le frontend appelle également des méthodes `get/post/put/delete(url)` génériques
qui ne sont pas mappées sur une fonctionnalité concrète. Le backend pourra
implémenter un routeur ``/api/*`` catch‑all ou ignorer ces appels.

---

> **Note** : tous les contrôleurs/services référencés ci-dessus sont des noms
> suggérés. Vous pouvez adapter la nomenclature selon votre architecture (MVC,
> hexagonale, etc.). L'important est de prévoir les routes, les méthodes HTTP,
> et la structure des requêtes/réponses listées.


```markdown
Cette description doit vivre à la racine du dossier `backend/` afin que les
développeurs backend puissent immédiatement voir quels endpoints sont
requises pour tenir la promesse de l'interface frontend.
```
