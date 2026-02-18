// src/pages/admin/dashboard/page.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Briefcase,
  BookOpen,
  LogOut,
  TrendingUp,
  Calendar,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import AdminDashboard from "@/components/admin/AdminDashboard";

interface Stats {
  jobs: number;
  formations: number;
  admins: number;
  users: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ jobs: 0, formations: 0, admins: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const displayName = admin?.prenom && admin?.nom ? `${admin.prenom} ${admin.nom}` : (admin?.full_name || admin?.email || 'Admin');
  const [showFullDashboard, setShowFullDashboard] = useState(true);

  // Analytics realtime modal
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [events, setEvents] = useState<Array<{ time: string; type: string; payload: any }>>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Charger les statistiques
    fetchStats();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error("Erreur stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast.success("Déconnecté");
    navigate("/admin/login");
  };

  const startAnalyticsStream = () => {
    if (eventSourceRef.current) return; // already started
    const token = localStorage.getItem("adminToken") || "";
    // Note: backend must expose an SSE endpoint that accepts token via query param
    const url = `/api/admin/realtime?token=${encodeURIComponent(token)}`;
    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;
      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          setEvents((prev) => [{ time: new Date().toLocaleTimeString(), type: payload.type || "event", payload }, ...prev].slice(0, 200));
        } catch (err) {
          setEvents((prev) => [{ time: new Date().toLocaleTimeString(), type: "raw", payload: e.data }, ...prev].slice(0, 200));
        }
      };
      es.onerror = (err) => {
        console.error("SSE error:", err);
        es.close();
        eventSourceRef.current = null;
        toast.error("Connexion au flux en direct interrompue");
      };
      toast.success("Connexion au flux en direct établie");
    } catch (err) {
      console.error("Erreur ouverture SSE:", err);
      toast.error("Impossible d'ouvrir le flux en direct");
    }
  };

  const stopAnalyticsStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    toast.success("Flux en direct arrêté");
  };

  const exportEventsAsPdf = () => {
    // Simple approach: open print view for modal content
    window.print();
  };

  const statCards = [
    {
      title: "Offres d'emploi",
      value: stats.jobs,
      icon: Briefcase,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      link: "/admin/jobs",
    },
    {
      title: "Formations",
      value: stats.formations,
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      link: "/admin/formations",
    },
    {
      title: "Utilisateurs",
      value: stats.users,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      link: "/admin/users",
    },
    {
      title: "Administrateurs",
      value: stats.admins,
      icon: Shield,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      link: "/admin/admins",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              Tableau de bord Administrateur
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-3">
              <span>Bienvenue {displayName} • {admin.role?.replace(/_/g, " ").toUpperCase()}</span>
              {admin?.avatar_url ? (
                <img src={admin.avatar_url} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
              ) : null}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setShowFullDashboard(!showFullDashboard)} 
              variant="outline"
              className="text-sm"
            >
              {showFullDashboard ? "Vue simple" : "Vue complète"}
            </Button>

            <Button onClick={() => { setAnalyticsOpen(true); startAnalyticsStream(); }} className="bg-amber-500 text-white">
              Suivi en temps réel
            </Button>

            <Button variant="destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <main className="p-8 max-w-7xl mx-auto">
        {/* Show full dashboard if toggled */}
        {showFullDashboard && (
          <div className="mb-12 bg-white rounded-lg shadow-lg p-6">
            <AdminDashboard />
          </div>
        )}

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="p-8 hover:shadow-lg transition cursor-pointer group"
                onClick={() => navigate(stat.link)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                    <p className="text-4xl font-bold mt-2 text-gray-900">
                      {loading ? "..." : stat.value}
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-green-600 text-sm font-medium">
                      <TrendingUp className="h-4 w-4" />
                      <span>+12% ce mois</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-full ${stat.bgColor} group-hover:scale-110 transition`}>
                    <Icon className={`h-8 w-8 ${stat.textColor}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Cartes d'actions rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Offres d'emploi */}
          <Card className="p-8 border-l-4 border-l-green-600 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Gérer les offres</h3>
                <p className="text-muted-foreground mt-2">Créez et modifiez vos offres d'emploi</p>
                <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={() => navigate("/admin/jobs") }>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Accéder
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <Briefcase className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </Card>

          {/* Formations */}
          <Card className="p-8 border-l-4 border-l-blue-600 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Gérer les formations</h3>
                <p className="text-muted-foreground mt-2">Ajoutez et mettez à jour vos formations</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/admin/formations") }>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Accéder
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <BookOpen className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </Card>

          {/* Utilisateurs */}
          <Card className="p-8 border-l-4 border-l-purple-600 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Gérer les utilisateurs</h3>
                <p className="text-muted-foreground mt-2">Consultez candidats et entreprises</p>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => navigate("/admin/users") }>
                  <Users className="mr-2 h-4 w-4" />
                  Accéder
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <Users className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Infos système */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Statut du système
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base de données</span>
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  En ligne
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Serveur API</span>
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  En ligne
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stockage</span>
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  45 Go disponibles
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Activités récentes
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">Système opérationnel</p>
                  <p className="text-sm text-muted-foreground">À l'instant</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">Base de données synchronisée</p>
                  <p className="text-sm text-muted-foreground">Maintenant</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-orange-600 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">Tous les services actifs</p>
                  <p className="text-sm text-muted-foreground">100% disponibilité</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Analytics modal */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setAnalyticsOpen(false); stopAnalyticsStream(); }} />
          <div className="relative bg-white w-[90%] md:w-3/4 lg:w-1/2 max-h-[80vh] overflow-auto rounded shadow-lg p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Suivi en temps réel - Interactions</h2>
              <div className="flex items-center gap-2">
                <Button onClick={exportEventsAsPdf} className="bg-blue-600 text-white">Exporter (PDF)</Button>
                <Button variant="ghost" onClick={() => { setAnalyticsOpen(false); stopAnalyticsStream(); }}>Fermer</Button>
              </div>
            </div>

            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-muted-foreground">Aucun événement reçu. Cliquez sur "Suivi en temps réel" pour commencer.</div>
              ) : (
                events.map((ev, idx) => (
                  <div key={idx} className="p-3 border rounded">
                    <div className="text-xs text-muted-foreground">{ev.time} — {ev.type}</div>
                    <pre className="text-xs mt-2 bg-gray-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(ev.payload, null, 2)}</pre>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button onClick={startAnalyticsStream} className="bg-green-600 text-white">Connecter</Button>
              <Button onClick={stopAnalyticsStream} variant="destructive">Déconnecter</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
