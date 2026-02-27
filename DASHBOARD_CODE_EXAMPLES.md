/**
 * DASHBOARD EXAMPLES - Cas d'utilisation et code de démonstration
 * 
 * File: DASHBOARD_CODE_EXAMPLES.md
 */

# 💡 Exemples de code pour le Dashboard

---

## 1. Afficher les KPIs simples

```tsx
import { useDashboardStats, formatNumber } from '@/hooks/useDashboardStats';
import { Card } from '@/components/ui/card';

function MyComponent() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-4">
      <h2>Métriques</h2>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Utilisateurs</p>
          <p className="text-3xl font-bold">
            {formatNumber(stats?.total_users || 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Offres Active</p>
          <p className="text-3xl font-bold">
            {formatNumber(stats?.total_active_jobs || 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Candidatures</p>
          <p className="text-3xl font-bold">
            {formatNumber(stats?.total_applications || 0)}
          </p>
        </Card>
      </div>
    </div>
  );
}

export default MyComponent;
```

---

## 2. Afficher un graphique simple ligne

```tsx
import { useDashboardHistory } from '@/hooks/useDashboardStats';
import { DashboardLineChart, PRIMARY_COLORS } from '@/components/admin/charts/DashboardCharts';

function UserGrowthChart() {
  const { data: history, isLoading } = useDashboardHistory();

  if (isLoading) return <div>Chargement graphique...</div>;

  return (
    <DashboardLineChart
      data={history?.user_registrations || []}
      title="Croissance des utilisateurs"
      dataKey="count"
      stroke={PRIMARY_COLORS.primary}
    />
  );
}

export default UserGrowthChart;
```

---

## 3. Afficher plusieurs graphiques

```tsx
import { useDashboardHistory } from '@/hooks/useDashboardStats';
import {
  DashboardLineChart,
  DashboardAreaChart,
  PRIMARY_COLORS
} from '@/components/admin/charts/DashboardCharts';

function DashboardOverview() {
  const { data: history, isLoading } = useDashboardHistory();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Graphique 1: Utilisateurs */}
      <DashboardAreaChart
        data={history?.user_registrations || []}
        title="Inscriptions"
        dataKey="count"
        fill={PRIMARY_COLORS.primary}
        stroke={PRIMARY_COLORS.primary}
      />

      {/* Graphique 2: Offres */}
      <DashboardLineChart
        data={history?.job_postings || []}
        title="Offres publiées"
        dataKey="count"
        stroke={PRIMARY_COLORS.success}
      />

      {/* Graphique 3: Candidatures */}
      <DashboardLineChart
        data={history?.applications || []}
        title="Candidatures"
        dataKey="total"
        stroke={PRIMARY_COLORS.warning}
      />

      {/* Graphique 4: Formations */}
      <DashboardLineChart
        data={history?.formations || []}
        title="Formations créées"
        dataKey="count"
        stroke={PRIMARY_COLORS.purple}
      />
    </div>
  );
}

export default DashboardOverview;
```

---

## 4. Afficher un camembert avec répartition

```tsx
import { useDashboardBreakdown } from '@/hooks/useDashboardStats';
import { DashboardPieChart } from '@/components/admin/charts/DashboardCharts';

function JobTypeDistribution() {
  const { data: breakdown, isLoading } = useDashboardBreakdown('jobs');

  if (isLoading) return <div>Chargement...</div>;

  return (
    <DashboardPieChart
      data={breakdown || []}
      title="Répartition des offres par type"
    />
  );
}

export default JobTypeDistribution;
```

---

## 5. Afficher les candidatures par statut

```tsx
import { useDashboardHistory } from '@/hooks/useDashboardStats';
import { DashboardMultiLineChart, PRIMARY_COLORS } from '@/components/admin/charts/DashboardCharts';

function ApplicationsByStatus() {
  const { data: history, isLoading } = useDashboardHistory();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <DashboardMultiLineChart
      data={history?.applications || []}
      title="Candidatures par statut (30 jours)"
      lines={[
        {
          dataKey: 'pending',
          stroke: PRIMARY_COLORS.warning,
          name: 'En attente'
        },
        {
          dataKey: 'approved',
          stroke: PRIMARY_COLORS.success,
          name: 'Approuvées'
        },
        {
          dataKey: 'rejected',
          stroke: PRIMARY_COLORS.danger,
          name: 'Rejetées'
        },
        {
          dataKey: 'total',
          stroke: PRIMARY_COLORS.primary,
          name: 'Total'
        }
      ]}
    />
  );
}

export default ApplicationsByStatus;
```

---

## 6. Combiner stats et history

```tsx
import {
  useDashboardStats,
  useDashboardHistory,
  formatCurrency,
  formatNumber
} from '@/hooks/useDashboardStats';

function RevenueOverview() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: history, isLoading: historyLoading } = useDashboardHistory();

  if (statsLoading || historyLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div>
        <h3>Revenus globaux</h3>
        <p className="text-4xl font-bold">
          {formatCurrency(stats?.total_subscription_revenue || 0)}
        </p>
        <p className="text-sm text-gray-600">
          {formatNumber(stats?.active_subscriptions || 0)} abonnements actifs
        </p>
      </div>

      {/* Tendance sur 30 jours */}
      <div>
        <h3>Revenus du mois: {formatCurrency(stats?.monthly_revenue || 0)}</h3>
        <p className="text-sm text-gray-600">
          {formatNumber((history?.revenue || []).reduce((sum, item) => sum + (item.transactions || 0), 0))} transactions
        </p>
      </div>
    </div>
  );
}

export default RevenueOverview;
```

---

## 7. Avec gestion d'erreurs avancée

```tsx
import { useDashboardStats, useDashboardHistory } from '@/hooks/useDashboardStats';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

function DashboardWithErrorHandling() {
  const statsQuery = useDashboardStats();
  const historyQuery = useDashboardHistory();

  if (statsQuery.isSuccess && historyQuery.isSuccess) {
    return (
      // Afficher les données
      <div>Données: {JSON.stringify(statsQuery.data)}</div>
    );
  }

  if (statsQuery.isLoading || historyQuery.isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-300 mb-4 rounded"></div>
        <div className="h-20 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (statsQuery.isError || historyQuery.isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        Erreur lors du chargement des données du dashboard.
        {(statsQuery.error || historyQuery.error) instanceof Error && (
          <p className="text-sm mt-2">
            {(statsQuery.error || historyQuery.error) instanceof Error
              ? (statsQuery.error || historyQuery.error).message
              : 'Erreur inconnue'}
          </p>
        )}
      </Alert>
    );
  }

  return null;
}

export default DashboardWithErrorHandling;
```

---

## 8. Avec filtres par période

```tsx
import { useState } from 'react';
import { useDashboardHistory } from '@/hooks/useDashboardStats';
import { Button } from '@/components/ui/button';
import { DashboardLineChart, PRIMARY_COLORS } from '@/components/admin/charts/DashboardCharts';

function FilteredDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const { data: history, isLoading } = useDashboardHistory();

  // Filtrer les données selon la période
  const filteredData = history?.user_registrations.slice(0, timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90) || [];

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            onClick={() => setTimeRange(range)}
          >
            Derniers {range === '7d' ? '7' : range === '30d' ? '30' : '90'} jours
          </Button>
        ))}
      </div>

      {/* Graphique */}
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <DashboardLineChart
          data={filteredData}
          title={`Utilisateurs - ${timeRange}`}
          dataKey="count"
          stroke={PRIMARY_COLORS.primary}
        />
      )}
    </div>
  );
}

export default FilteredDashboard;
```

---

## 9. Export des données

```tsx
import { useDashboardStats, useDashboardHistory } from '@/hooks/useDashboardStats';
import { Button } from '@/components/ui/button';

function ExportDashboard() {
  const { data: stats } = useDashboardStats();
  const { data: history } = useDashboardHistory();

  const handleExportCSV = () => {
    const csv = [
      ['Métrique', 'Valeur'],
      ['Utilisateurs totaux', stats?.total_users || 0],
      ['Offres actives', stats?.total_active_jobs || 0],
      ['Candidatures', stats?.total_applications || 0],
      ['Candidatures validées', stats?.applications_validated || 0],
      ['Revenu du mois', stats?.monthly_revenue || 0],
      ['Abonnements actifs', stats?.active_subscriptions || 0],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExportJSON = () => {
    const data = {
      stats,
      history,
      exportedAt: new Date().toISOString()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportCSV}>Exporter en CSV</Button>
      <Button onClick={handleExportJSON}>Exporter en JSON</Button>
    </div>
  );
}

export default ExportDashboard;
```

---

## 10. Dashboard widget personnel

```tsx
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

function PersonalDashboardWidget() {
  const { data: stats, isLoading, refetch } = useDashboardStats();

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Vue rapide</h3>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-blue-100 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? '⟳' : '⟲'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Utilisateurs</span>
          <span className="text-2xl font-bold text-blue-600">
            {stats?.total_users || '...'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Candidatures</span>
          <span className="text-2xl font-bold text-green-600">
            {stats?.total_applications || '...'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Revenu</span>
          <span className="text-2xl font-bold text-purple-600">
            €{stats?.monthly_revenue?.toLocaleString('fr-FR') || '...'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
        <TrendingUp className="h-3 w-3" />
        <span>À jour: {new Date().toLocaleTimeString('fr-FR')}</span>
      </div>
    </Card>
  );
}

export default PersonalDashboardWidget;
```

---

## 🎯 Cas d'utilisation courants

### Afficher le total des utilisateurs
```tsx
const { data } = useDashboardStats();
<p>{data?.total_users}</p>
```

### Afficher la tendance sur 30 jours
```tsx
const { data } = useDashboardHistory();
<DashboardLineChart data={data?.user_registrations} ... />
```

### Afficher le revenu du mois
```tsx
const { data } = useDashboardStats();
<p>{formatCurrency(data?.monthly_revenue)}</p>
```

### Afficher la répartition des offres
```tsx
const { data } = useDashboardBreakdown('jobs');
<DashboardPieChart data={data} ... />
```

---

## 🔗 Fichiers sources

- **Hooks**: `/src/hooks/useDashboardStats.ts`
- **Composants**: `/src/components/admin/charts/DashboardCharts.tsx`
- **Page**: `/src/components/admin/pages/AdminDashboardPage.tsx`

---

**Dernière mise à jour**: 23 février 2026
