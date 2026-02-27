import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Users,
  Briefcase,
  BookOpen,
  Zap,
  Eye,
  Heart,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
} from "lucide-react";
import { api } from "@/lib/api";

// ============ TYPES & INTERFACES ============

interface RevenueData {
  subscriptions: number;
  formations: number;
  premium_services: number;
  total_revenue: number;
  monthly_revenue: Array<{
    month: string;
    subscriptions: number;
    formations: number;
    services: number;
  }>;
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
  logins_24h: Array<{
    hour: string;
    count: number;
  }>;
  total_messages: number;
  messages_timeline: Array<{
    time: string;
    count: number;
  }>;
  active_users: number;
}

interface Popularity {
  top_jobs: Array<{
    id: number;
    title: string;
    company: string;
    views: number;
    applications: number;
  }>;
  top_formations: Array<{
    id: number;
    title: string;
    category: string;
    sales: number;
    revenue: number;
  }>;
}

interface FinancialStats {
  revenue: RevenueData;
  recruitment_funnel: RecruitmentFunnel;
  activity: ActivityData;
  popularity: Popularity;
}

// ============ COMPONENT ============

const FinancialAnalytics = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const [dateRange, setDateRange] = useState("month");

  // Fetch financial data
  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financialStats"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch("/api/admin/financial", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch financial data");
      return response.json() as Promise<FinancialStats>;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch activity data separately for real-time updates
  const { data: activityData } = useQuery({
    queryKey: ["activityData"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch("/api/admin/activity", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch activity data");
      return response.json() as Promise<ActivityData>;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  // ===== KPI CARD COMPONENT =====
  const KPICard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    color,
  }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: "up" | "down";
    color: string;
  }) => (
    <Card className={`p-6 border-l-4 ${color} relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{isLoading ? "..." : value}</p>
          {subtitle && (
            <div className="flex items-center mt-2 gap-1">
              {trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              ) : null}
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          )}
        </div>
        <Icon className="h-12 w-12 opacity-20" />
      </div>
    </Card>
  );

  if (isLoading && !financialData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Chargement des données financières...</p>
      </div>
    );
  }

  const revenue = financialData?.revenue || {
    subscriptions: 0,
    formations: 0,
    premium_services: 0,
    total_revenue: 0,
    monthly_revenue: [],
  };

  const funnel = financialData?.recruitment_funnel || {
    total_applications: 0,
    interview_invitations: 0,
    interview_scheduled: 0,
    offers_made: 0,
    offers_accepted: 0,
    conversion_rate: 0,
  };

  const activity = activityData || financialData?.activity || {
    logins_24h: [],
    total_messages: 0,
    messages_timeline: [],
    active_users: 0,
  };

  const popularity = financialData?.popularity || {
    top_jobs: [],
    top_formations: [],
  };

  // Prepare funnel chart data
  const funnelData = [
    { name: "Candidatures", value: funnel.total_applications, fill: "#3b82f6" },
    { name: "Invitations", value: funnel.interview_invitations, fill: "#10b981" },
    { name: "Entretiens", value: funnel.interview_scheduled, fill: "#f59e0b" },
    { name: "Offres", value: funnel.offers_made, fill: "#8b5cf6" },
    { name: "Acceptées", value: funnel.offers_accepted, fill: "#ec4899" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Financiers</h2>
          <p className="text-muted-foreground mt-1">Tableaux de bord financiers et comportementaux en temps réel</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={dateRange === "week" ? "default" : "outline"}
            onClick={() => setDateRange("week")}
            size="sm"
          >
            7 jours
          </Button>
          <Button
            variant={dateRange === "month" ? "default" : "outline"}
            onClick={() => setDateRange("month")}
            size="sm"
          >
            30 jours
          </Button>
          <Button
            variant={dateRange === "year" ? "default" : "outline"}
            onClick={() => setDateRange("year")}
            size="sm"
          >
            1 an
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenus
          </TabsTrigger>
          <TabsTrigger value="recruitment" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Entonnoir
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Activité
          </TabsTrigger>
          <TabsTrigger value="popularity" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Popularité
          </TabsTrigger>
        </TabsList>

        {/* ===== REVENUE TAB ===== */}
        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              icon={DollarSign}
              title="Revenu total"
              value={`${revenue.total_revenue.toLocaleString()} XAF`}
              color="border-l-blue-600"
              trend="up"
              subtitle="+12.5% vs mois dernier"
            />
            <KPICard
              icon={Users}
              title="Abonnements"
              value={`${revenue.subscriptions.toLocaleString()} XAF`}
              color="border-l-green-600"
              trend="up"
              subtitle="+8.3% vs mois dernier"
            />
            <KPICard
              icon={BookOpen}
              title="Formations"
              value={`${revenue.formations.toLocaleString()} XAF`}
              color="border-l-orange-600"
              trend="up"
              subtitle="+15.2% vs mois dernier"
            />
            <KPICard
              icon={Zap}
              title="Services Premium"
              value={`${revenue.premium_services.toLocaleString()} XAF`}
              color="border-l-purple-600"
              trend="down"
              subtitle="-2.1% vs mois dernier"
            />
          </div>

          {/* Revenue Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Évolution du revenu ({dateRange === "week" ? "7 jours" : dateRange === "month" ? "30 jours" : "12 mois"})</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={revenue.monthly_revenue || []}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorServ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} XAF`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorSub)"
                  name="Abonnements"
                />
                <Area
                  type="monotone"
                  dataKey="formations"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorForm)"
                  name="Formations"
                />
                <Area
                  type="monotone"
                  dataKey="services"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorServ)"
                  name="Services"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Répartition des revenus</h3>
            <div className="grid grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Abonnements", value: revenue.subscriptions },
                      { name: "Formations", value: revenue.formations },
                      { name: "Services", value: revenue.premium_services },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} XAF`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Abonnements actifs</p>
                  <p className="text-2xl font-bold">{revenue.subscriptions.toLocaleString()} XAF</p>
                  <div className="mt-2 h-2 bg-blue-600 rounded-full" style={{ width: "100%" }}></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenus formations</p>
                  <p className="text-2xl font-bold">{revenue.formations.toLocaleString()} XAF</p>
                  <div
                    className="mt-2 h-2 bg-green-600 rounded-full"
                    style={{
                      width: `${(revenue.formations / revenue.total_revenue) * 100}%`,
                    }}
                  ></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Services premium</p>
                  <p className="text-2xl font-bold">{revenue.premium_services.toLocaleString()} XAF</p>
                  <div
                    className="mt-2 h-2 bg-orange-600 rounded-full"
                    style={{
                      width: `${(revenue.premium_services / revenue.total_revenue) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ===== RECRUITMENT FUNNEL TAB ===== */}
        <TabsContent value="recruitment" className="space-y-6">
          {/* Funnel KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <KPICard
              icon={Briefcase}
              title="Candidatures"
              value={funnel.total_applications}
              color="border-l-blue-600"
            />
            <KPICard
              icon={Users}
              title="Invitations"
              value={funnel.interview_invitations}
              color="border-l-green-600"
              subtitle={`${((funnel.interview_invitations / funnel.total_applications) * 100).toFixed(1)}%`}
            />
            <KPICard
              icon={Calendar}
              title="Entretiens"
              value={funnel.interview_scheduled}
              color="border-l-orange-600"
              subtitle={`${((funnel.interview_scheduled / funnel.interview_invitations) * 100).toFixed(1)}%`}
            />
            <KPICard
              icon={Award}
              title="Offres"
              value={funnel.offers_made}
              color="border-l-purple-600"
              subtitle={`${((funnel.offers_made / funnel.interview_scheduled) * 100).toFixed(1)}%`}
            />
            <KPICard
              icon={TrendingUp}
              title="Acceptées"
              value={funnel.offers_accepted}
              color="border-l-red-600"
              subtitle={`${funnel.conversion_rate.toFixed(1)}% conversion`}
              trend="up"
            />
          </div>

          {/* Funnel Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Entonnoir de recrutement</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 200 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={180} />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Conversion Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Analyse des conversions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Candidatures → Invitations</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{
                        width: `${(funnel.interview_invitations / funnel.total_applications) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">
                    {((funnel.interview_invitations / funnel.total_applications) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Invitations → Entretiens</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: `${(funnel.interview_scheduled / funnel.interview_invitations) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">
                    {((funnel.interview_scheduled / funnel.interview_invitations) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Entretiens → Offres</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600"
                      style={{
                        width: `${(funnel.offers_made / funnel.interview_scheduled) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">
                    {((funnel.offers_made / funnel.interview_scheduled) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Offres → Acceptées</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600"
                      style={{
                        width: `${(funnel.offers_accepted / funnel.offers_made) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">
                    {((funnel.offers_accepted / funnel.offers_made) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="border-t pt-4 flex items-center justify-between">
                <span className="text-sm font-bold">Taux de conversion global</span>
                <span className="text-lg font-bold text-green-600">{funnel.conversion_rate.toFixed(2)}%</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ===== ACTIVITY TAB ===== */}
        <TabsContent value="activity" className="space-y-6">
          {/* Activity KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              icon={Users}
              title="Utilisateurs actifs (24h)"
              value={activity.active_users || 0}
              color="border-l-blue-600"
              trend="up"
              subtitle="+5.2% vs hier"
            />
            <KPICard
              icon={MessageSquare}
              title="Messages (24h)"
              value={activity.total_messages || 0}
              color="border-l-green-600"
              trend="up"
              subtitle="+12.3% vs hier"
            />
            <KPICard
              icon={Zap}
              title="Interactions"
              value={Math.round((activity.total_messages || 0) / (activity.active_users || 1))}
              color="border-l-orange-600"
              subtitle="Par utilisateur"
            />
          </div>

          {/* Login Activity Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Connexions utilisateurs (24h)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activity.logins_24h || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Connexions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Message Activity Timeline */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Activité des messages (timeline)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activity.messages_timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Messages"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* ===== POPULARITY TAB ===== */}
        <TabsContent value="popularity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Jobs */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" /> Top 5 Offres les plus consultées
              </h3>
              <div className="space-y-4">
                {(popularity.top_jobs || []).slice(0, 5).map((job, idx) => (
                  <div key={job.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.company}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{job.views} vues</p>
                      <p className="text-xs text-muted-foreground">{job.applications} candidatures</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Formations */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5" /> Top 5 Formations les plus vendues
              </h3>
              <div className="space-y-4">
                {(popularity.top_formations || []).slice(0, 5).map((formation, idx) => (
                  <div key={formation.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-medium">{formation.title}</p>
                          <p className="text-xs text-muted-foreground">{formation.category}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formation.sales} ventes</p>
                      <p className="text-xs text-muted-foreground">{formation.revenue.toLocaleString()} XAF</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Popularity Details */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Analyse détaillée</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total offres consultées</p>
                <p className="text-2xl font-bold mt-1">
                  {(popularity.top_jobs || []).reduce((sum, job) => sum + job.views, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Ventes formations</p>
                <p className="text-2xl font-bold mt-1">
                  {(popularity.top_formations || []).reduce((sum, f) => sum + f.sales, 0)}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Revenu formations</p>
                <p className="text-2xl font-bold mt-1">
                  {(popularity.top_formations || []).reduce((sum, f) => sum + f.revenue, 0).toLocaleString()} XAF
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Taux conversion</p>
                <p className="text-2xl font-bold mt-1">
                  {popularity.top_jobs && popularity.top_jobs.length > 0
                    ? (
                        (popularity.top_jobs.reduce((sum, job) => sum + job.applications, 0) /
                          popularity.top_jobs.reduce((sum, job) => sum + job.views, 0)) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialAnalytics;
