// src/components/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "recharts";
import {
  Users,
  Briefcase,
  BookOpen,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Trophy,
  Activity,
  Settings,
  Eye,
  Heart,
  MessageSquare,
  Bell,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface AdminApplication {
  id: number;
  job_id: number;
  job_title: string;
  job_company: string;
  applicant_id: number;
  applicant_name: string;
  applicant_email: string;
  status: string;
  created_at: string;
}

interface AdminPublication {
  id: number;
  title: string;
  creator_id: number;
  created_at: string;
}

interface AdminStats {
  total_users: number;
  total_candidates: number;
  total_companies: number;
  total_admins: number;
  total_jobs: number;
  total_applications: number;
  applications_pending: number;
  applications_validated: number;
  applications_rejected: number;
  total_formations: number;
  total_portfolios: number;
  total_publications: number;
  total_deployment_formations: number;
  total_services?: number;
  total_notifications?: number;
  jobs_per_company: Array<{ company: string; job_count: number }>;
  applications_per_company: Array<{ company_name: string; applications_count: number }>;
  applications_by_status: Array<{ status: string; count: number }>;
  recent_applications: AdminApplication[];
  top_candidates: Array<{ id?: number; full_name: string; email?: string; applications_count: number }>;
  top_companies: Array<{ id?: number; company_name: string; email?: string; job_count: number; applications_received: number }>;
  top_publishers: Array<{ id?: number; full_name: string; publications_count: number }>;
  recent_publications: AdminPublication[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const KPICard = ({ icon: Icon, title, value, subtitle, color }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; title: string; value: string | number; subtitle?: string; color: string }) => (
    <Card className={`p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{loading ? "..." : value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-12 w-12 opacity-20" />
      </div>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-12">Chargement des statistiques...</div>;
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-red-600">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="applications">Candidatures</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="companies">Entreprises</TabsTrigger>
          <TabsTrigger value="candidates">Candidats</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        {/* === VUE D'ENSEMBLE === */}
        <TabsContent value="overview" className="space-y-8">
          {/* KPI Cards Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              icon={Users}
              title="Utilisateurs totaux"
              value={stats.total_users}
              subtitle={`${stats.total_candidates} candidats, ${stats.total_companies} entreprises`}
              color="border-l-blue-500"
            />
            <KPICard
              icon={Briefcase}
              title="Offres d'emploi"
              value={stats.total_jobs}
              subtitle="Actives et inactives"
              color="border-l-green-500"
            />
            <KPICard
              icon={FileText}
              title="Candidatures"
              value={stats.total_applications}
              subtitle={`${stats.applications_validated} validées`}
              color="border-l-yellow-500"
            />
            <KPICard
              icon={BookOpen}
              title="Formations"
              value={stats.total_formations}
              subtitle={`${stats.total_deployment_formations} déploiements`}
              color="border-l-purple-500"
            />
          </div>

          {/* KPI Cards Row 2 - Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              icon={FileText}
              title="Publications"
              value={stats.total_publications}
              subtitle={`${Math.round((stats.total_publications / Math.max(stats.total_users, 1)) * 100) / 100} par utilisateur`}
              color="border-l-pink-500"
            />
            <KPICard
              icon={Trophy}
              title="Portfolios"
              value={stats.total_portfolios}
              subtitle={`${Math.round((stats.total_portfolios / Math.max(stats.total_candidates, 1)) * 100)}% des candidats`}
              color="border-l-orange-500"
            />
            <KPICard
              icon={Activity}
              title="Services"
              value={stats.total_services || 0}
              subtitle="Offres de services"
              color="border-l-indigo-500"
            />
            <KPICard
              icon={Bell}
              title="FAQ actives"
              value={stats.total_faqs_active || 0}
              subtitle="Questions visibles"
              color="border-l-cyan-500"
            />
          </div>

          {/* Conversion & Engagement Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversion Rate */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Taux de conversion</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Applications validées</span>
                    <span className="text-sm font-semibold">
                      {stats.total_applications > 0 
                        ? Math.round((stats.applications_validated / stats.total_applications) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{width: `${stats.total_applications > 0 ? (stats.applications_validated / stats.total_applications) * 100 : 0}%`}}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Applications rejetées</span>
                    <span className="text-sm font-semibold">
                      {stats.total_applications > 0 
                        ? Math.round((stats.applications_rejected / stats.total_applications) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{width: `${stats.total_applications > 0 ? (stats.applications_rejected / stats.total_applications) * 100 : 0}%`}}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Applications en attente</span>
                    <span className="text-sm font-semibold">
                      {stats.total_applications > 0 
                        ? Math.round((stats.applications_pending / stats.total_applications) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{width: `${stats.total_applications > 0 ? (stats.applications_pending / stats.total_applications) * 100 : 0}%`}}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* User Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Distribution utilisateurs</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Candidats</span>
                    <span className="text-sm font-semibold">
                      {stats.total_users > 0 
                        ? Math.round((stats.total_candidates / stats.total_users) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{width: `${stats.total_users > 0 ? (stats.total_candidates / stats.total_users) * 100 : 0}%`}}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Entreprises</span>
                    <span className="text-sm font-semibold">
                      {stats.total_users > 0 
                        ? Math.round((stats.total_companies / stats.total_users) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{width: `${stats.total_users > 0 ? (stats.total_companies / stats.total_users) * 100 : 0}%`}}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Platform Health */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Santé de la plateforme</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Taux d'engagement</span>
                  <span className="text-sm font-semibold text-green-600">
                    {Math.round(((stats.total_publications + stats.total_portfolios) / Math.max(stats.total_users, 1)) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Offres par entreprise</span>
                  <span className="text-sm font-semibold">
                    {stats.total_companies > 0 ? (stats.total_jobs / stats.total_companies).toFixed(1) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Candidatures par offre</span>
                  <span className="text-sm font-semibold">
                    {stats.total_jobs > 0 ? (stats.total_applications / stats.total_jobs).toFixed(1) : 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by Status Pie Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">État des candidatures</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.applications_by_status || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Job Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top 5 Entreprises (offres)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.jobs_per_company?.slice(0, 5) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="company" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="job_count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Statistics Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Résumé global</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Portfolios</p>
                <p className="text-2xl font-bold">{stats.total_portfolios}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Publications</p>
                <p className="text-2xl font-bold">{stats.total_publications}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Administrateurs</p>
                <p className="text-2xl font-bold">{stats.total_admins}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Candidatures acceptées</p>
                <p className="text-2xl font-bold text-green-600">{stats.applications_validated}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* === CANDIDATURES === */}
        <TabsContent value="applications" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              icon={Briefcase}
              title="Total candidatures"
              value={stats.total_applications}
              color="border-l-blue-500"
            />
            <KPICard
              icon={AlertCircle}
              title="En attente"
              value={stats.applications_pending}
              color="border-l-yellow-500"
            />
            <KPICard
              icon={CheckCircle}
              title="Validées"
              value={stats.applications_validated}
              color="border-l-green-500"
            />
            <KPICard
              icon={AlertCircle}
              title="Rejetées"
              value={stats.applications_rejected}
              color="border-l-red-500"
            />
          </div>

          {/* Applications per Company */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Candidatures par entreprise</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats.applications_per_company?.slice(0, 10) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="company_name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications_count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Applications */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Candidatures récentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Candidat</th>
                    <th className="text-left py-2 px-2">Poste</th>
                    <th className="text-left py-2 px-2">Entreprise</th>
                    <th className="text-left py-2 px-2">Statut</th>
                    <th className="text-left py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_applications?.slice(0, 10).map((app: AdminApplication) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{app.applicant_name || "Anonyme"}</td>
                      <td className="py-2 px-2">{app.job_title || "N/A"}</td>
                      <td className="py-2 px-2">{app.job_company || "N/A"}</td>
                      <td className="py-2 px-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            app.status === "validated"
                              ? "bg-green-100 text-green-700"
                              : app.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {app.status || "En attente"}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* === CONTENU === */}
        <TabsContent value="content" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              icon={BookOpen}
              title="Total formations"
              value={stats.total_formations}
              color="border-l-blue-500"
            />
            <KPICard
              icon={FileText}
              title="Portfolios"
              value={stats.total_portfolios}
              color="border-l-green-500"
            />
            <KPICard
              icon={FileText}
              title="Publications"
              value={stats.total_publications}
              color="border-l-purple-500"
            />
            <KPICard
              icon={Trophy}
              title="Déploiements"
              value={stats.total_deployment_formations}
              color="border-l-orange-500"
            />
          </div>

          {/* Recent Publications */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Publications récentes</h3>
            <div className="space-y-4">
              {stats.recent_publications?.slice(0, 8).map((pub: AdminPublication) => (
                <div key={pub.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <p className="font-semibold">{pub.title || "Sans titre"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(pub.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* === ENTREPRISES === */}
        <TabsContent value="companies" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KPICard
              icon={Users}
              title="Total entreprises"
              value={stats.total_companies}
              color="border-l-blue-500"
            />
            <KPICard
              icon={Briefcase}
              title="Offres actives"
              value={stats.total_jobs}
              color="border-l-green-500"
            />
          </div>

          {/* Top Companies */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 Entreprises</h3>
            <div className="space-y-3">
              {stats.top_companies?.slice(0, 10).map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{comp.company_name || "Entreprise"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="font-bold text-green-600">{comp.job_count}</span> offres
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {comp.applications_received} candidatures
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Applications per Company Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Candidatures reçues par entreprise (Top 10)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats.applications_per_company?.slice(0, 10) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="company_name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications_count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* === CANDIDATS === */}
        <TabsContent value="candidates" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KPICard
              icon={Users}
              title="Total candidats"
              value={stats.total_candidates}
              color="border-l-blue-500"
            />
            <KPICard
              icon={FileText}
              title="Portfolios totaux"
              value={stats.total_portfolios}
              color="border-l-green-500"
            />
          </div>

          {/* Top Candidates */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 Candidats (par candidatures)</h3>
            <div className="space-y-3">
              {stats.top_candidates?.slice(0, 10).map((cand, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{cand.full_name || "Candidat"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{cand.applications_count} candidatures</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Publishers */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 Éditeurs (publications)</h3>
            <div className="space-y-3">
              {stats.top_publishers?.slice(0, 10).map((pub, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{pub.full_name || "Utilisateur"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{pub.publications_count} publications</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-4">
        <Button onClick={fetchAdminStats} variant="outline">
          Actualiser les statistiques
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
