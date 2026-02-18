import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Briefcase,
  Eye,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { authHeaders, buildApiUrl } from '@/lib/headers';
import { toast } from 'sonner';
import DashboardNewsfeed from '@/components/DashboardNewsfeed';

export default function CompanyDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [companyStats, setCompanyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect non-company users
    if (!authLoading && (!user || user.user_type !== 'company')) {
      navigate('/connexion');
      return;
    }

    if (!authLoading && user) {
      fetchCompanyStats();
    }
  }, [user, authLoading, navigate]);

  const fetchCompanyStats = async () => {
    try {
      setLoading(true);
      const headers = authHeaders('application/json');
      
      // Fetch company profile stats
      const res = await fetch(buildApiUrl('/api/users/me/profile-stats'), { headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setCompanyStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erreur chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Espace Entreprise
              </h1>
              <p className="text-muted-foreground mt-1">
                Bienvenue, {user.full_name || 'Entreprise'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/parametres/profil-entreprise')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="candidates" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Candidats</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Offres</span>
            </TabsTrigger>
            <TabsTrigger value="feed" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Fil</span>
            </TabsTrigger>
          </TabsList>

          {/* Aperçu Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Vous pouvez maintenant activer le <strong>Mode Recherche Discrète</strong> pour vos candidats ! 
                Cela permet à vos employés de chercher un nouveau poste sans être visible pour votre entreprise.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat Cards */}
              <StatCard
                icon={Briefcase}
                label="Offres Actives"
                value={companyStats?.active_jobs || 0}
                bgColor="bg-blue-50"
                iconColor="text-blue-600"
              />
              <StatCard
                icon={Users}
                label="Candidatures"
                value={companyStats?.total_applications || 0}
                bgColor="bg-green-50"
                iconColor="text-green-600"
              />
              <StatCard
                icon={Eye}
                label="Profils Visités"
                value={companyStats?.profile_visits || 0}
                bgColor="bg-purple-50"
                iconColor="text-purple-600"
              />
              <StatCard
                icon={Users}
                label="Candidats Visibles"
                value={companyStats?.visible_candidates || 0}
                bgColor="bg-orange-50"
                iconColor="text-orange-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Actions Rapides
                </h2>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => navigate('/recrutement')}
                  >
                    <span>Créer une offre d'emploi</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setActiveTab('candidates')}
                  >
                    <span>Consulter les candidats</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => navigate('/parametres')}
                  >
                    <span>Gérer mon profil</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Features */}
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-4">Nouveautés</h2>
                <div className="space-y-3">
                  <FeatureItem
                    title="Mode Recherche Discrète"
                    description="Permet à vos employés de chercher sans être vus par votre entreprise"
                    badge="Nouveau"
                  />
                  <FeatureItem
                    title="Recherche Dynamique d'Entreprise"
                    description="Les candidats peuvent maintenant chercher votre entreprise facilement"
                  />
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="mt-6">
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Gestion des Candidats</h2>
              <Button
                variant="outline"
                onClick={() => navigate('/candidats')}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Voir tous les candidats
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Consultez les profils des candidats, leurs candidatures et gérez les interactions.
              </p>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-6">
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Vos Offres d'Emploi</h2>
              <Button
                onClick={() => navigate('/recrutement')}
                className="gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Gérer vos offres
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Créez, modifiez ou supprimez vos offres d'emploi.
              </p>
            </Card>
          </TabsContent>

          {/* Feed Tab */}
          <TabsContent value="feed" className="mt-6">
            <DashboardNewsfeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  bgColor,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}

function FeatureItem({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{title}</p>
          {badge && (
            <Badge variant="default" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
