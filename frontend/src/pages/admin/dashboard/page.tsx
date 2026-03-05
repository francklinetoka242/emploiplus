// src/pages/admin/dashboard/page.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Users,
  Briefcase,
  BookOpen,
  LogOut,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";

interface Stats {
  jobs: number;
  formations: number;
  admins: number;
  users: number;
}

interface RecentActivity {
  id: string;
  type: 'job' | 'formation' | 'user' | 'application' | 'service';
  title: string;
  date: string;
  count?: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ jobs: 0, formations: 0, admins: 0, users: 0 });
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const displayName = admin?.first_name && admin?.last_name ? `${admin.first_name} ${admin.last_name}` : (admin?.prenom && admin?.nom ? `${admin.prenom} ${admin.nom}` : (admin?.email || 'Admin'));

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      // Extract numbers from nested objects
      setStats({
        jobs: data?.jobs?.total_jobs || data?.jobs || 0,
        formations: data?.formations?.total_formations || data?.formations || 0,
        users: data?.users?.total_users || data?.users || 0,
        admins: data?.admins?.total_admins || data?.admins || 0,
      });
    } catch (err) {
      console.error("Erreur stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await api.getDashboardHistory();
      setHistory(data);
    } catch (err) {
      console.error("Erreur historique:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast.success("Déconnecté");
    navigate("/admin/login");
  };

  const statCards = [
    {
      title: "Offres d'emploi",
      value: stats.jobs,
      icon: Briefcase,
      link: "/admin/jobs",
    },
    {
      title: "Formations",
      value: stats.formations,
      icon: BookOpen,
      link: "/admin/formations",
    },
    {
      title: "Utilisateurs",
      value: stats.users,
      icon: Users,
      link: "/admin/users",
    },
    {
      title: "Administrateurs",
      value: stats.admins,
      icon: Users,
      link: "/admin/admins",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b">
        <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
            <p className="text-sm text-gray-600 mt-1">Bienvenue {displayName}</p>
          </div>
          <Button variant="destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="p-6 border hover:bg-gray-50 transition cursor-pointer"
                onClick={() => navigate(stat.link)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-semibold mt-1 text-gray-900">
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activities Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Dernières activités (30 jours)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {historyLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="p-4 border">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-12 mb-3" />
                    <Skeleton className="h-3 w-20" />
                  </Card>
                ))}
              </>
            ) : history ? (
              <>
                {/* Nouvelles inscriptions */}
                <Card className="p-4 border hover:bg-blue-50 transition">
                  <p className="text-sm text-gray-600 mb-2">Nouveaux inscrits</p>
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {stats.users || 0}
                  </p>
                  <p className="text-xs text-gray-500">utilisateurs ajoutés</p>
                </Card>

                {/* Nouvelles offres d'emploi */}
                <Card className="p-4 border hover:bg-green-50 transition">
                  <p className="text-sm text-gray-600 mb-2">Offres d'emploi</p>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {stats.jobs || 0}
                  </p>
                  <p className="text-xs text-gray-500">offres publiées</p>
                </Card>

                {/* Nouvelles formations */}
                <Card className="p-4 border hover:bg-purple-50 transition">
                  <p className="text-sm text-gray-600 mb-2">Formations</p>
                  <p className="text-2xl font-bold text-purple-600 mb-1">
                    {stats.formations || 0}
                  </p>
                  <p className="text-xs text-gray-500">formations ajoutées</p>
                </Card>

                {/* Candidatures */}
                <Card className="p-4 border hover:bg-orange-50 transition">
                  <p className="text-sm text-gray-600 mb-2">Candidatures</p>
                  <p className="text-2xl font-bold text-orange-600 mb-1">
                    0
                  </p>
                  <p className="text-xs text-gray-500">soumises</p>
                </Card>

                {/* Administrateurs */}
                <Card className="p-4 border hover:bg-yellow-50 transition">
                  <p className="text-sm text-gray-600 mb-2">Administrateurs</p>
                  <p className="text-2xl font-bold text-yellow-600 mb-1">
                    {stats.admins || 0}
                  </p>
                  <p className="text-xs text-gray-500">connectés</p>
                </Card>
              </>
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Aucune donnée historique disponible
              </div>
            )}
          </div>
        </div>

        {/* Actions principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Offres d'emploi */}
          <Card className="p-6 border hover:bg-gray-50 transition">
            <h3 className="font-semibold text-gray-900 mb-2">Gérer les offres</h3>
            <p className="text-sm text-gray-600 mb-4">Offres d'emploi</p>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/jobs")}
              className="w-full"
            >
              Accéder
            </Button>
          </Card>

          {/* Formations */}
          <Card className="p-6 border hover:bg-gray-50 transition">
            <h3 className="font-semibold text-gray-900 mb-2">Gérer les formations</h3>
            <p className="text-sm text-gray-600 mb-4">Programmes de formation</p>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/formations")}
              className="w-full"
            >
              Accéder
            </Button>
          </Card>

          {/* Utilisateurs */}
          <Card className="p-6 border hover:bg-gray-50 transition">
            <h3 className="font-semibold text-gray-900 mb-2">Gérer les utilisateurs</h3>
            <p className="text-sm text-gray-600 mb-4">Candidats et entreprises</p>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/users")}
              className="w-full"
            >
              Accéder
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
