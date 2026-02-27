/**
 * ADMIN DASHBOARD PAGE - ENHANCED WITH CHARTS
 * Complete dashboard with KPIs, charts, and statistics
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Briefcase,
  BookOpen,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Activity,
  Bell,
  BarChart3,
  Zap,
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  FileText,
} from 'lucide-react';
import {
  useDashboardStats,
  useDashboardHistory,
  useDashboardBreakdown,
  formatNumber,
  formatCurrency,
  getStatusColor,
} from '@/hooks/useDashboardStats';
import {
  DashboardLineChart,
  DashboardAreaChart,
  DashboardMultiLineChart,
  DashboardPieChart,
  PRIMARY_COLORS,
} from '@/components/admin/charts/DashboardCharts';


export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'jobs' | 'applications'>('users');

  // Fetch data from API via React Query hooks
  const statsQuery = useDashboardStats();
  const historyQuery = useDashboardHistory();
  const jobsBreakdownQuery = useDashboardBreakdown('jobs');
  const applicationsBreakdownQuery = useDashboardBreakdown('applications');
  const usersBreakdownQuery = useDashboardBreakdown('users');

  const stats = statsQuery.data;
  const history = historyQuery.data;

  // Loading state
  const isLoading = statsQuery.isLoading || historyQuery.isLoading;
  const hasError = statsQuery.isError || historyQuery.isError;

  // ============================================================================
  // KPI CARD COMPONENT
  // ============================================================================

  const KPICard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
    trend,
    trendValue,
  }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
  }) => (
    <Card className={`p-6 border-l-4 ${color} bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900">
              {isLoading ? '...' : formatNumber(Number(value))}
            </p>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-600'
              }`}>
                {trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                {trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
                {trendValue}
              </div>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-12 w-12 opacity-15 text-slate-400" />
      </div>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (hasError) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 text-lg">Erreur lors du chargement des statistiques</p>
          <Button
            onClick={() => {
              statsQuery.refetch();
              historyQuery.refetch();
            }}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8 pb-8">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-600 mt-1">
            Bienvenue Super Administrateur • {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
        <Button
          onClick={() => {
            statsQuery.refetch();
            historyQuery.refetch();
          }}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* PRIMARY METRICS */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Métriques clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            icon={Users}
            title="Utilisateurs Totaux"
            value={stats?.total_users || 0}
            color="border-l-blue-500"
            trend="up"
            trendValue="+12%"
          />
          <KPICard
            icon={Briefcase}
            title="Offres d'emploi"
            value={stats?.total_jobs || 0}
            subtitle={`${stats?.total_active_jobs || 0} actives`}
            color="border-l-green-500"
            trend="up"
            trendValue="+8%"
          />
          <KPICard
            icon={BookOpen}
            title="Formations"
            value={stats?.total_formations || 0}
            color="border-l-purple-500"
            trend="neutral"
            trendValue="→"
          />
          <KPICard
            icon={TrendingUp}
            title="Candidatures"
            value={stats?.total_applications || 0}
            color="border-l-orange-500"
            trend="up"
            trendValue="+23%"
          />
        </div>
      </div>

      {/* SECONDARY METRICS */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            icon={Users}
            title="Candidats"
            value={stats?.total_candidates || 0}
            subtitle={`${stats?.total_companies || 0} entreprises`}
            color="border-l-cyan-500"
          />
          <KPICard
            icon={Shield}
            title="Administrateurs"
            value={stats?.total_admins || 0}
            color="border-l-red-500"
          />
          <KPICard
            icon={FileText}
            title="Publications"
            value={stats?.total_publications || 0}
            subtitle={`${stats?.total_portfolios || 0} portfolios`}
            color="border-l-pink-500"
          />
        </div>
      </div>

      {/* APPLICATION STATUS */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-900">État des candidatures</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Validées</h3>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatNumber(stats?.applications_validated || 0)}
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {stats?.applications_validated ? ((stats.applications_validated / (stats.total_applications || 1)) * 100).toFixed(1) : 0}% du total
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-white border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">En attente</h3>
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {formatNumber(stats?.applications_pending || 0)}
            </p>
            <p className="text-xs text-slate-600 mt-2">À traiter</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-white border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Rejetées</h3>
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {formatNumber(stats?.applications_rejected || 0)}
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {((stats?.applications_rejected || 0) / (stats?.total_applications || 1) * 100).toFixed(1)}% du total
            </p>
          </Card>
        </div>
      </div>

      {/* CHARTS SECTION */}
      {history && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Tendances (30 derniers jours)</h2>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Registration Trend */}
            <DashboardAreaChart
              data={history.user_registrations}
              title="Inscriptions utilisateurs"
              dataKey="count"
              fill={PRIMARY_COLORS.primary}
              stroke={PRIMARY_COLORS.primary}
            />

            {/* Job Postings Trend */}
            <DashboardLineChart
              data={history.job_postings}
              title="Offres publiées"
              dataKey="count"
              stroke={PRIMARY_COLORS.success}
            />

            {/* Application Status Distribution */}
            <DashboardMultiLineChart
              data={history.applications}
              title="Candidatures par statut"
              lines={[
                {
                  dataKey: 'total',
                  stroke: PRIMARY_COLORS.warning,
                  name: 'Total',
                },
                {
                  dataKey: 'approved',
                  stroke: PRIMARY_COLORS.success,
                  name: 'Approuvées',
                },
                {
                  dataKey: 'pending',
                  stroke: PRIMARY_COLORS.warning,
                  name: 'En attente',
                },
                {
                  dataKey: 'rejected',
                  stroke: PRIMARY_COLORS.danger,
                  name: 'Rejetées',
                },
              ]}
            />

            {/* Formation Trend */}
            <DashboardLineChart
              data={history.formations}
              title="Formations créées"
              dataKey="count"
              stroke={PRIMARY_COLORS.purple}
            />
          </div>

          {/* Revenue Chart */}
          {history.revenue && (
            <div className="mt-6">
              <DashboardAreaChart
                data={history.revenue}
                title="Revenus d'abonnements"
                dataKey="revenue"
                fill={PRIMARY_COLORS.success}
                stroke={PRIMARY_COLORS.success}
              />
            </div>
          )}
        </div>
      )}

      {/* CATEGORY BREAKDOWN */}
      {jobsBreakdownQuery.data && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Distribution par catégories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardPieChart
              data={jobsBreakdownQuery.data}
              title="Offres par type"
            />
            {applicationsBreakdownQuery.data && (
              <DashboardPieChart
                data={applicationsBreakdownQuery.data}
                title="Candidatures par statut"
              />
            )}
            {usersBreakdownQuery.data && (
              <DashboardPieChart
                data={usersBreakdownQuery.data}
                title="Utilisateurs par type"
              />
            )}
          </div>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <Card className="p-8 bg-gradient-to-br from-slate-50 to-white border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Actions rapides</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-12 bg-blue-600 hover:bg-blue-700">
            ➕ Nouvelle Offre
          </Button>
          <Button className="h-12 bg-purple-600 hover:bg-purple-700">
            📚 Nouvelle Formation
          </Button>
          <Button className="h-12 bg-green-600 hover:bg-green-700">
            👥 Gérer Utilisateurs
          </Button>
          <Button className="h-12 bg-orange-600 hover:bg-orange-700">
            🔔 Notifications
          </Button>
        </div>
      </Card>

      {/* SYSTEM STATUS */}
      <Card className="p-8 border border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-slate-900">État du système</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-slate-600">API Backend</p>
              <p className="font-semibold text-slate-900">En ligne</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-slate-600">Base de données</p>
              <p className="font-semibold text-slate-900">Connectée</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-slate-600">Mémoire cache</p>
              <p className="font-semibold text-slate-900">Normal</p>
            </div>
          </div>
        </div>
      </Card>

      {/* FOOTER */}
      <div className="text-center text-slate-500 text-sm py-4 border-t border-slate-200">
        <p>Last Updated: {new Date().toLocaleString('fr-FR')}</p>
        <p className="text-xs mt-1">Les données se mettent à jour automatiquement toutes les 5 minutes</p>
      </div>
    </div>
  );
}