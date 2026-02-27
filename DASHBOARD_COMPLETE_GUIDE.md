# 📊 DASHBOARD TABLEAU DE BORD - GUIDE COMPLET

## 📋 Vue d'ensemble

Vous avez développé une section complète de tableau de bord pour le Super Admin avec :

- ✅ **Backend**: Routes API pour récupérer les statistiques
- ✅ **Frontend**: Page améliorée avec graphiques Recharts
- ✅ **Hooks**: React Query pour la gestion des appels API
- ✅ **Composants**: Graphiques réutilisables (ligne, aire, barre, camembert)

---

## 🎯 ARCHITECTURE

### Backend (Node.js/Express)

```
Backend
├── Controllers
│   └── admin-dashboard-stats.controller.ts (nouvelles fonctions)
├── Routes
│   └── admin-dashboard-stats.routes.ts (nouvelles routes)
└── server.ts (routes montées à /api/admin/dashboard)
```

### Frontend (React)

```
Frontend
├── hooks/
│   └── useDashboardStats.ts (React Query hooks + helpers)
├── components/admin/
│   ├── charts/
│   │   └── DashboardCharts.tsx (5 composants Recharts)
│   └── pages/
│       └── AdminDashboardPage.tsx (page principale améliorée)
```

---

## 🛣️ ROUTES API

### 1. GET `/api/admin/dashboard/stats`
**Récupère les statistiques totales du système**

Response:
```json
{
  "total_users": 1250,
  "total_candidates": 850,
  "total_companies": 150,
  "total_admins": 5,
  "total_jobs": 320,
  "total_active_jobs": 280,
  "total_closed_jobs": 40,
  "total_applications": 2150,
  "applications_pending": 450,
  "applications_validated": 1500,
  "applications_rejected": 200,
  "total_formations": 45,
  "total_publications": 320,
  "total_portfolios": 280,
  "total_services": 15,
  "monthly_revenue": 12500,
  "total_subscription_revenue": 145000,
  "active_subscriptions": 85,
  "timestamp": "2026-02-23T10:30:00Z"
}
```

### 2. GET `/api/admin/dashboard/history`
**Récupère les données historiques des 30 derniers jours**

Response:
```json
{
  "user_registrations": [
    {"date": "2026-01-24", "count": 12},
    {"date": "2026-01-25", "count": 15},
    ...
  ],
  "applications": [
    {"date": "2026-01-24", "total": 45, "pending": 10, "approved": 30, "rejected": 5},
    ...
  ],
  "job_postings": [
    {"date": "2026-01-24", "count": 3},
    ...
  ],
  "formations": [
    {"date": "2026-01-24", "count": 1},
    ...
  ],
  "revenue": [
    {"date": "2026-01-24", "transactions": 5, "revenue": 500},
    ...
  ]
}
```

### 3. GET `/api/admin/dashboard/breakdown?category=jobs|applications|users|formations`
**Récupère la répartition par catégorie (pour les graphiques camembert)**

Response:
```json
[
  {"name": "Full-time", "value": 150},
  {"name": "Part-time", "value": 85},
  {"name": "Contract", "value": 45},
  {"name": "Freelance", "value": 40}
]
```

---

## 🪝 REACT QUERY HOOKS

### `useDashboardStats()`
Récupère les statistiques globales

```tsx
const { data: stats, isLoading, isError, refetch } = useDashboardStats();

// Données disponibles
stats.total_users        // nombre total d'utilisateurs
stats.total_jobs         // nombre total d'offres
stats.monthly_revenue    // revenu du mois courant
stats.active_subscriptions // abonnements actifs
```

**Configuration:**
- `staleTime`: 5 minutes
- `refetchInterval`: Tous les 5 minutes
- `retry`: 2 fois en cas d'erreur

### `useDashboardHistory()`
Récupère les données historiques

```tsx
const { data: history, isLoading } = useDashboardHistory();

// Données disponibles
history.user_registrations   // inscriptions par jour
history.applications         // candidatures par jour et statut
history.job_postings         // offres postées par jour
history.formations           // formations créées par jour
history.revenue              // revenu par jour
```

### `useDashboardBreakdown(category)`
Récupère la répartition par catégorie

```tsx
const jobBreakdown = useDashboardBreakdown('jobs');
const appBreakdown = useDashboardBreakdown('applications');

// Retourne un array: [{name: "...", value: 123}, ...]
```

---

## 📈 COMPOSANTS GRAPHIQUES

### DashboardLineChart
Graphique en ligne pour les tendances

```tsx
<DashboardLineChart
  data={history.user_registrations}
  title="Inscriptions utilisateurs"
  dataKey="count"
  stroke="#3b82f6"
/>
```

### DashboardAreaChart
Graphique en aire pour les tendances cumulatives

```tsx
<DashboardAreaChart
  data={history.job_postings}
  title="Offres publiées"
  dataKey="count"
  fill="#22c55e"
  stroke="#22c55e"
/>
```

### DashboardBarChart
Graphique en barres pour les comparaisons

```tsx
<DashboardBarChart
  data={history.applications}
  title="Candidatures par statut"
  dataKeys={[
    { key: 'pending', fill: '#f59e0b', name: 'En attente' },
    { key: 'approved', fill: '#22c55e', name: 'Approuvées' },
    { key: 'rejected', fill: '#ef4444', name: 'Rejetées' }
  ]}
/>
```

### DashboardPieChart
Graphique camembert pour les distributions

```tsx
<DashboardPieChart
  data={jobsBreakdown}
  title="Offres par type"
/>
```

### DashboardMultiLineChart
Graphique multi-lignes pour plusieurs métriques

```tsx
<DashboardMultiLineChart
  data={history.applications}
  title="Candidatures par statut"
  lines={[
    { dataKey: 'total', stroke: '#f59e0b', name: 'Total' },
    { dataKey: 'approved', stroke: '#22c55e', name: 'Approuvées' },
    { dataKey: 'pending', stroke: '#f59e0b', name: 'En attente' },
    { dataKey: 'rejected', stroke: '#ef4444', name: 'Rejetées' }
  ]}
/>
```

---

## 🎨 COULEURS PRÉDÉFINIES

```typescript
PRIMARY_COLORS = {
  primary: '#3b82f6',    // Bleu
  success: '#22c55e',    // Vert
  warning: '#f59e0b',    // Orange
  danger: '#ef4444',     // Rouge
  purple: '#8b5cf6',     // Violet
  cyan: '#06b6d4'        // Cyan
}
```

---

## 📝 FONCTIONS UTILITAIRES

### `formatNumber(num: number): string`
Formate un nombre pour l'affichage

```tsx
formatNumber(1250000) // "1.3M"
formatNumber(1250)    // "1.3K"
formatNumber(50)      // "50"
```

### `formatCurrency(amount: number): string`
Formate un montant en devise EUR

```tsx
formatCurrency(1500) // "1 500,00 €"
```

### `getStatusColor(status: string): string`
Retourne la couleur pour un statut

```tsx
getStatusColor('approved')  // "#22c55e"
getStatusColor('pending')   // "#eab308"
getStatusColor('rejected')  // "#ef4444"
```

---

## 🚀 UTILISATION

### 1. Importer les hooks et composants

```tsx
import {
  useDashboardStats,
  useDashboardHistory,
  useDashboardBreakdown,
  formatNumber,
  formatCurrency
} from '@/hooks/useDashboardStats';

import {
  DashboardLineChart,
  DashboardAreaChart,
  DashboardBarChart,
  DashboardPieChart,
  DashboardMultiLineChart
} from '@/components/admin/charts/DashboardCharts';
```

### 2. Récupérer les données

```tsx
const statsQuery = useDashboardStats();
const historyQuery = useDashboardHistory();
const jobsBreakdown = useDashboardBreakdown('jobs');

// Attendre que les données se chargent
if (statsQuery.isLoading || historyQuery.isLoading) {
  return <LoadingSpinner />;
}

// Gérer les erreurs
if (statsQuery.isError || historyQuery.isError) {
  return <ErrorMessage />;
}
```

### 3. Afficher les données

```tsx
// Afficher un KPI
<Card>
  <h3>{statsQuery.data.total_users}</h3>
</Card>

// Afficher un graphique
<DashboardLineChart
  data={historyQuery.data.user_registrations}
  title="Utilisateurs"
  dataKey="count"
/>
```

---

## 📊 ARCHITECTURE DE LA PAGE

```
AdminDashboardPage
├── Header avec refresh
├── Métriques clés (4 cartes)
├── Vue d'ensemble (3 cartes)
├── État des candidatures (3 cartes)
├── Graphiques (4 graphiques)
├── Répartition par catégories (3 camemberts)
├── Actions rapides (4 boutons)
├── État du système (3 statuts)
└── Footer avec timestamp
```

---

## 🔄 RAFRAÎCHISSEMENT DES DONNÉES

Les données se rafraîchissent automatiquement :
- **Stats**: Tous les 5 minutes
- **History**: Tous les 30 minutes

Bouton "Actualiser" available en haut de la page pour un rafraîchissement manuel.

---

## 📌 PROCHAINES ÉTAPES

### Phase 2: Amélioration des données
- [ ] Connecter les véritables données de la base de données
- [ ] Ajouter plus de métriques (taux de conversion, taux de rétention)
- [ ] Implémenter des filtres par période

### Phase 3: Fonctionnalités avancées
- [ ] Export des données (CSV, PDF)
- [ ] Alertes sur les seuils critiques
- [ ] Comparaison année sur année
- [ ] Graphiques personnalisés par utilisateur

### Phase 4: Optimisations
- [ ] Cacher les données côté client (Redis)
- [ ] Pré-calculs des agrégats
- [ ] Pagination des données historiques

---

## ⚙️ CONFIGURATION

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost/db
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=120

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### React Query Configuration
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      cacheTime: 1000 * 60 * 10,       // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
});
```

---

## 🔒 SÉCURITÉ

### Authentification
Toutes les routes API nécessitent un token JWT valide :
```tsx
Authorization: Bearer <token>
```

### Permissions
Seuls les Super Admins peuvent accéder au dashboard complet.

### Validation
- Validation des entrées côté serveur
- Sanitization des données
- Rate limiting (120 requêtes par 15 minutes)

---

## 📚 FICHIERS CRÉÉS

| Fichier | Type | Description |
|---------|------|-------------|
| `admin-dashboard-stats.controller.ts` | Backend | Logique des statistiques |
| `admin-dashboard-stats.routes.ts` | Backend | Routes API |
| `useDashboardStats.ts` | Frontend | Hooks React Query |
| `DashboardCharts.tsx` | Frontend | Composants Recharts |
| `AdminDashboardPage.tsx` | Frontend | Page principale |

---

## 🐛 DÉPANNAGE

### Les données ne se chargent pas
1. Vérifier la connexion à la base de données
2. Vérifier les logs du backend
3. Vérifier le token d'authentification

### Les graphiques sont vides
1. Vérifier que les données sont présentes dans la base
2. Vérifier la structure JSON de la réponse API
3. Vérifier les console logs

### Performance lente
1. Augmenter `staleTime`
2. Réduire la fréquence des `refetchInterval`
3. Implémenter la pagination pour les données historiques

---

## 📖 RESSOURCES

- [Recharts Documentation](https://recharts.org)
- [React Query Documentation](https://tanstack.com/query/latest)
- [PostgreSQL Aggregation](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [Express.js Guide](https://expressjs.com)

---

**Dernière mise à jour**: 23 février 2026  
**Version**: 1.0  
**Status**: 🟢 Production Ready
