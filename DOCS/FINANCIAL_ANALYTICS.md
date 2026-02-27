# Financial Analytics Dashboard - Documentation

## 📊 Vue d'ensemble

Le nouveau module **Financial Analytics** fournit une supervision complète du super administrateur sur les aspects financiers et comportementaux de la plateforme. Ce module s'intègre au tableau de bord admin existant et offre 4 sections principales.

---

## 🎯 Fonctionnalités principales

### 1️⃣ Revenue Tracker (Onglet Revenus)

**Objectif** : Suivre les revenus de toutes les sources de monétisation.

#### Indicateurs de revenus (KPI Cards) :
- **Revenu total** : Somme de tous les revenus (abonnements + formations + services premium)
- **Abonnements actifs** : Revenus des abonnements d'entreprises
- **Formations** : Revenus générés par les formations payantes
- **Services Premium** : Revenus des services premium (CV Premium, Flyers, etc.)

#### Graphiques :
- **Area Chart** : Évolution du revenu sur 7 jours, 30 jours ou 12 mois
  - 3 séries : Abonnements, Formations, Services
  - Données mensuelles historiques et projection

- **Pie Chart** : Répartition des revenus
  - Visualise le pourcentage de chaque source
  - Barres horizontales avec valeurs exactes

**Calculs** :
```
Revenus abonnements = nombre d'entreprises actives × 5000 XAF
Revenus formations = SUM(formation.price)
Revenus services = SUM(service_catalogs.price)
Total = Subscriptions + Formations + Services
```

---

### 2️⃣ Recruitment Funnel (Onglet Entonnoir)

**Objectif** : Analyser le pipeline de recrutement et les taux de conversion.

#### Étapes du funnel :
1. **Candidatures totales** : Nombre total de candidatures reçues
2. **Invitations à entretien** : Candidatures ayant reçu une invitation
3. **Entretiens planifiés** : Candidats ayant un entretien confirmé
4. **Offres émises** : Candidats ayant reçu une offre
5. **Offres acceptées** : Taux final de conversion

#### KPI Cards :
- Affichent les chiffres bruts + pourcentage de progression à chaque étape
- Indicateurs visuels (flèches haut/bas)

#### Graphique en barres horizontales :
- Représentation visuelle du funnel
- Chaque barre = une étape avec sa couleur
- Facilite l'identification des goulets d'étranglement

#### Analyse détaillée :
- **Barres de progression** pour chaque étape
- **Taux de conversion** à chaque niveau
- **Conversion globale** = offres acceptées / candidatures totales

**Statuts mappés** :
```
interview_invitation → Invitations à entretien
interview_scheduled → Entretiens planifiés
offer → Offres émises
accepted → Offres acceptées
```

---

### 3️⃣ Real-time Activity (Onglet Activité)

**Objectif** : Monitorer l'activité utilisateurs en temps réel.

#### KPI Cards :
- **Utilisateurs actifs (24h)** : Nombre distinct d'utilisateurs ayant effectué une action
- **Messages (24h)** : Nombre total de publications/commentaires
- **Interactions** : Moyenne d'interactions par utilisateur

#### Graphiques :
- **Bar Chart (Connexions)** : Volume de connexions par heure (24h)
  - Permet d'identifier les heures de pointe
  - Données réelles de la base de données

- **Line Chart (Messages)** : Activité des messages timeline
  - Évolution hourly du nombre de publications
  - Tendance d'engagement des utilisateurs

#### Données en temps réel :
- Actualisée toutes les **30 secondes**
- Requête directe à la base de données
- Filtre : créé au cours des 24 dernières heures

---

### 4️⃣ Popularity Analytics (Onglet Popularité)

**Objectif** : Identifier les offres et formations les plus populaires.

#### Top 5 Offres les plus consultées :
- **Classement numéroté** (#1 à #5)
- **Informations** : Titre, Entreprise, Nombre de vues, Nombre de candidatures
- **Badge visuel** : Ranking avec couleur bleue
- **Tri** : Par nombre de vues DESC, puis candidatures DESC

#### Top 5 Formations les plus vendues :
- **Classement numéroté** (#1 à #5)
- **Informations** : Titre, Catégorie, Nombre de ventes, Revenu généré
- **Badge visuel** : Ranking avec couleur verte
- **Tri** : Par nombre de ventes DESC, puis revenu DESC

#### Analyse détaillée (4 statistiques clés) :
1. **Total offres consultées** : Sum des vues de top 5
2. **Ventes formations** : Sum des ventes de top 5
3. **Revenu formations** : Sum des revenus de top 5
4. **Taux conversion** : (total applications / total views) × 100

---

## 🔧 Architecture technique

### Frontend Components

#### FinancialAnalytics.tsx
- **Localisation** : `src/components/admin/FinancialAnalytics.tsx`
- **Taille** : ~700 lignes
- **Type** : Functional Component avec Hooks
- **Dependencies** :
  - React Query pour les données
  - Recharts pour les graphiques
  - shadcn/ui pour les composants
  - Lucide Icons pour les icônes

#### Interfaces TypeScript
```typescript
interface RevenueData {
  subscriptions: number;
  formations: number;
  premium_services: number;
  total_revenue: number;
  monthly_revenue: Array<{ month: string; subscriptions: number; formations: number; services: number; }>;
}

interface RecruitmentFunnel {
  total_applications: number;
  interview_invitations: number;
  interview_scheduled: number;
  offers_made: number;
  offers_accepted: number;
  conversion_rate: number;
}

interface ActivityData {
  logins_24h: Array<{ hour: string; count: number; }>;
  total_messages: number;
  messages_timeline: Array<{ time: string; count: number; }>;
  active_users: number;
}

interface Popularity {
  top_jobs: Array<{ id: number; title: string; company: string; views: number; applications: number; }>;
  top_formations: Array<{ id: number; title: string; category: string; sales: number; revenue: number; }>;
}

interface FinancialStats {
  revenue: RevenueData;
  recruitment_funnel: RecruitmentFunnel;
  activity: ActivityData;
  popularity: Popularity;
}
```

---

## 🌐 Endpoints Backend

### 1. GET /api/admin/financial
**Description** : Récupère les données financières, entonnoir et popularité

**Authentification** : Admin Auth (Bearer Token)

**Réponse** :
```json
{
  "revenue": {
    "subscriptions": 125000,
    "formations": 87500,
    "premium_services": 32000,
    "total_revenue": 244500,
    "monthly_revenue": [
      { "month": "Jan", "subscriptions": 118750, "formations": 80500, "services": 28160 },
      // ...12 mois de données
    ]
  },
  "recruitment_funnel": {
    "total_applications": 450,
    "interview_invitations": 180,
    "interview_scheduled": 95,
    "offers_made": 38,
    "offers_accepted": 22,
    "conversion_rate": 4.89
  },
  "popularity": {
    "top_jobs": [
      {
        "id": 1,
        "title": "Senior Developer",
        "company": "TechCorp",
        "views": 1250,
        "applications": 45
      },
      // ...top 5
    ],
    "top_formations": [
      {
        "id": 1,
        "title": "React Advanced",
        "category": "Web Development",
        "sales": 156,
        "revenue": 78000
      },
      // ...top 5
    ]
  }
}
```

**Fréquence de rafraîchissement** : Chaque 60 secondes (React Query)

---

### 2. GET /api/admin/activity
**Description** : Récupère les données d'activité en temps réel (24h)

**Authentification** : Admin Auth (Bearer Token)

**Réponse** :
```json
{
  "logins_24h": [
    { "hour": "0h", "count": 12 },
    { "hour": "1h", "count": 8 },
    // ...24 heures
  ],
  "total_messages": 342,
  "messages_timeline": [
    { "time": "0h", "count": 5 },
    { "time": "1h", "count": 8 },
    // ...24 heures
  ],
  "active_users": 87
}
```

**Fréquence de rafraîchissement** : Chaque 30 secondes (React Query)

---

## 📊 Intégration dans Admin.tsx

### Navigation
```tsx
<TabsTrigger value="financial" className="flex items-center gap-2">
  <DollarSign className="h-4 w-4" /> Finance
</TabsTrigger>

<TabsContent value="financial" className="space-y-6">
  <FinancialAnalytics />
</TabsContent>
```

### Ordre des onglets
1. 📊 Dashboard (AdminDashboard)
2. 👥 Utilisateurs (UsersManagement)
3. 💼 Offres
4. 📚 Formations
5. 🔔 Notifications
6. 📋 Candidatures
7. 📊 Analytics (AnalyticsView)
8. **💰 Finance (NEW)** ← Nouveau onglet

---

## 🎨 Design & UX

### Tabs dans Financial Analytics
```
[Revenus] [Entonnoir] [Activité] [Popularité]
```

### Color Scheme
- **Revenus** : Gradients bleus, verts, oranges
- **Entonnoir** : Progression de couleurs (bleu → rouge)
- **Activité** : Bleu pour connexions, vert pour messages
- **Popularité** : Bleu pour offres, vert pour formations

### Responsive Design
- Desktop : Grille complète avec tous les détails
- Tablet : Ajustement des colonnes (2 colonnes au lieu de 4)
- Mobile : Empilage vertical, graphiques redimensionnés

---

## 📈 Sources de données

### Revenue Tracker
```sql
-- Formations
SELECT COALESCE(SUM(CAST(f.price AS INTEGER)), 0) FROM formations f

-- Services premium
SELECT COALESCE(SUM(price), 0) FROM service_catalogs WHERE is_active = true

-- Abonnements
SELECT COUNT(*) FROM users WHERE user_type IN ('company', 'entreprise')
-- Valeur = count × 5000 XAF
```

### Recruitment Funnel
```sql
-- Applications
SELECT COUNT(*) FROM job_applications

-- Interview Invitations
SELECT COUNT(*) FROM job_applications WHERE status = 'interview_invitation'

-- Interview Scheduled
SELECT COUNT(*) FROM job_applications WHERE status = 'interview_scheduled'

-- Offers
SELECT COUNT(*) FROM job_applications WHERE status = 'offer'

-- Accepted
SELECT COUNT(*) FROM job_applications WHERE status = 'accepted'
```

### Activity Data
```sql
-- Logins (24h)
SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
FROM users WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY EXTRACT(HOUR FROM created_at)

-- Messages (24h)
SELECT COUNT(*) FROM publications WHERE created_at >= NOW() - INTERVAL '24 hours'

-- Active users (24h)
SELECT COUNT(DISTINCT user_id) FROM (
  SELECT applicant_id as user_id FROM job_applications WHERE created_at >= NOW() - INTERVAL '24 hours'
  UNION ALL
  SELECT creator_id as user_id FROM publications WHERE created_at >= NOW() - INTERVAL '24 hours'
) as activities
```

### Popularity
```sql
-- Top jobs
SELECT j.id, j.title, j.company, COUNT(DISTINCT ja.id) as applications, j.views
FROM jobs j LEFT JOIN job_applications ja ON j.id = ja.job_id
GROUP BY j.id ORDER BY j.views DESC LIMIT 5

-- Top formations
SELECT f.id, f.title, f.category, COUNT(DISTINCT ...) as sales, SUM(CAST(f.price AS INTEGER)) as revenue
FROM formations f ... GROUP BY f.id ORDER BY sales DESC LIMIT 5
```

---

## 🔐 Permissions & Security

- **Endpoint** : `/api/admin/financial` et `/api/admin/activity`
- **Authentification** : JWT Bearer Token obligatoire
- **Rôles autorisés** : admin, super_admin, admin_content
- **Rate Limiting** : 120 requêtes / 60 secondes
- **CORS** : Configurable via env CORS_ORIGINS

---

## 🚀 Performance & Optimisations

### Frontend
- **React Query** : Caching automatique et invalidation intelligente
- **Recharts** : Rendu optimisé des graphiques responsifs
- **Lazy Loading** : Chargement du composant à la demande (Tab-based)

### Backend
- **Parallel Queries** : Promise.all() pour exécution simultanée
- **Indexes** : Requêtes groupées par status, company_id, etc.
- **Pagination** : LIMIT 10-50 pour les résultats volumineux
- **Caching** : Rechargement toutes les 30-60 secondes (ajustable)

---

## 📝 Cas d'usage

### 1. Super Admin analyse revenus mensuels
- Accède à l'onglet "Revenus"
- Consulte le graphique Area Chart multi-séries
- Identifie les tendances (formations ↑, services ↓)
- Exporte les données pour rapport

### 2. RH évalue pipeline recrutement
- Accède à l'onglet "Entonnoir"
- Voit le taux de conversion global (4.89%)
- Identifie le goulet étranglement (étape Entretiens → Offres)
- Prend action corrective

### 3. Product Manager suit engagement temps réel
- Accède à l'onglet "Activité"
- Voit 87 utilisateurs actifs en 24h
- Consulte heures de pointe (11h-14h)
- Adapte les notifications/promotions

### 4. Responsable contenu optimise popularité
- Accède à l'onglet "Popularité"
- Identifie les offres #1 (1250 vues)
- Remet en avant les formations meilleures ventes
- Promeut contenu similaire

---

## 🔄 Prochaines améliorations

1. **Filtrage par date** : Sélecteur de période personnalisé
2. **Export PDF** : Génération de rapports téléchargeables
3. **Alertes** : Notifications si revenus ↓ 10% ou conversion ↓
4. **Prédictions** : ML pour forecast revenu mois prochain
5. **Comparaisons** : M-o-M, Y-o-Y analysis
6. **Drilldown** : Cliquer sur top 5 pour voir détail complet
7. **Benchmark** : Comparaison avec industrie/competitors

---

## 📞 Support & Maintenance

**Responsable** : Team Admin Backend  
**Contact** : [email du responsable]  
**Documentation** : Cette page  
**Issues** : Signaler bugs sur [système de tickets]

---

## Version & Changelog

**Version** : 1.0  
**Date** : 16 Janvier 2026  
**Statut** : Production Ready

### Changes in v1.0
- ✅ Création du module FinancialAnalytics
- ✅ 4 onglets complets (Revenue, Funnel, Activity, Popularity)
- ✅ 2 endpoints backend (/api/admin/financial, /api/admin/activity)
- ✅ Intégration dans Admin.tsx
- ✅ Responsif & accessible
- ✅ Zéro erreurs TypeScript
