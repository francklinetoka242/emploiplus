// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api"; // ← Nouveau fichier api.t;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Briefcase, BookOpen, Bell, Trash2, BarChart3, DollarSign, MessageSquare, FileCheck, LogIn, ShoppingCart, AlertTriangle } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UsersManagement from "@/components/admin/UsersManagement";
import AnalyticsView from "@/components/admin/AnalyticsView";
import FinancialAnalytics from "@/components/admin/FinancialAnalytics";
import ModerateContent from "@/components/admin/ModerateContent";
import CertificationValidation from "@/components/admin/CertificationValidation";
import ImpersonateUser from "@/components/admin/ImpersonateUser";
import { ServiceCatalogManager } from "@/components/admin/ServiceCatalogManager";
import { SystemHealth } from "@/components/admin/SystemHealth";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const adminRole = admin.role || 'admin';

  // Formulaire Notification site-wide
  const [notification, setNotification] = useState({ title: "", message: "", target: "all", category: "", image_url: "", link: "" });

  // Formulaire Offre
  const [job, setJob] = useState({
    title: "", company: "", location: "", type: "CDI", sector: "", description: "", salary: ""
  });

  // Formulaire Formation
  const [formation, setFormation] = useState({
    title: "", category: "", level: "Débutant", duration: "", description: "", price: ""
  });

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: api.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Offre d'emploi ajoutée !");
      setJob({ title: "", company: "", location: "", type: "CDI", sector: "", description: "", salary: "" });
    },
    onError: () => toast.error("Erreur lors de l'ajout")
  });

  const createFormationMutation = useMutation({
    mutationFn: api.createFormation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      toast.success("Formation ajoutée !");
      setFormation({ title: "", category: "", level: "Débutant", duration: "", description: "", price: "" });
    },
    onError: () => toast.error("Erreur lors de l'ajout")
  });

  const createNotificationMutation = useMutation({
    mutationFn: (payload: any) => api.createSiteNotification(payload),
    onSuccess: () => {
      toast.success("Notification publiée !");
      setNotification({ title: "", message: "", target: "all", category: "", image_url: "", link: "" });
      queryClient.invalidateQueries({ queryKey: ["site-notifications"] });
    },
    onError: () => toast.error("Erreur lors de la publication")
  });

  // Stats en temps réel
  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: api.getJobs });
  const { data: formations = [] } = useQuery({ queryKey: ["formations"], queryFn: api.getFormations });
  const { data: siteNotifications = [] } = useQuery({ queryKey: ["site-notifications"], queryFn: api.getSiteNotifications });
  const { data: stats = { jobs: 0, formations: 0, admins: 0, users: 0, candidates: 0, companies: 0, applications: 0 } } = useQuery({ queryKey: ["stats"], queryFn: api.getStats });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: any) => api.deleteSiteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-notifications"] });
      toast.success('Notification supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);


  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Panneau d'administration</h1>

      {/* Dashboard summary visible to super_admin on the main dashboard */}
      {adminRole === 'super_admin' && activeTab === 'offers' && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Offres d'emploi</div>
            <div className="text-2xl font-bold">{stats.jobs ?? jobs.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Formations</div>
            <div className="text-2xl font-bold">{stats.formations ?? formations.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Candidats</div>
            <div className="text-2xl font-bold">{stats.candidates ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Entreprises</div>
            <div className="text-2xl font-bold">{stats.companies ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Candidatures reçues</div>
            <div className="text-2xl font-bold">{stats.applications ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Notifications</div>
                <div className="text-2xl font-bold">{siteNotifications ? siteNotifications.length : 0}</div>
              </div>
              <div>
                <Button onClick={() => navigate('/admin/notifications')} variant="outline">Voir</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 max-w-5xl mx-auto">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            👥 Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Offres
          </TabsTrigger>
          <TabsTrigger value="formations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Formations
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            📋 Candidatures
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            📊 Analytics
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Finance
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Modération
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" /> Certifications
          </TabsTrigger>
          <TabsTrigger value="impersonate" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" /> Login As
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Catalogue & Promos
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Santé du Système
          </TabsTrigger>
        </TabsList>

        {/* === TABLEAU DE BORD === */}
        <TabsContent value="dashboard" className="space-y-6">
          <AdminDashboard />
        </TabsContent>

        {/* === GESTION UTILISATEURS === */}
        <TabsContent value="users" className="space-y-6">
          <UsersManagement />
        </TabsContent>

        {/* === ANALYTICS === */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsView />
        </TabsContent>

        {/* === ANALYTICS FINANCIERS === */}
        <TabsContent value="financial" className="space-y-6">
          <FinancialAnalytics />
        </TabsContent>

        {/* === AJOUT OFFRE D'EMPLOI === */}
        <TabsContent value="offers" className="space-y-6">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Nouvelle offre d'emploi</h2>
            <form onSubmit={(e) => { e.preventDefault(); createJobMutation.mutate(job); }} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Titre du poste *</Label>
                <Input required value={job.title} onChange={e => setJob({ ...job, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Entreprise *</Label>
                <Input required value={job.company} onChange={e => setJob({ ...job, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ville *</Label>
                <Input required value={job.location} onChange={e => setJob({ ...job, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type de contrat *</Label>
                <Select value={job.type} onValueChange={v => setJob({ ...job, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Appel à projet">Appel à projet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secteur *</Label>
                <Input required value={job.sector} onChange={e => setJob({ ...job, sector: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Salaire (facultatif)</Label>
                <Input value={job.salary} onChange={e => setJob({ ...job, salary: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={5} value={job.description} onChange={e => setJob({ ...job, description: e.target.value })} />
              </div>
              <Button type="submit" size="lg" className="md:col-span-2" disabled={createJobMutation.isPending}>
                {createJobMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier l'offre"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* === AJOUT NOTIFICATION SITE-WIDE === */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Nouvelle notification (site)</h2>
            <form onSubmit={(e) => { e.preventDefault(); createNotificationMutation.mutate(notification); }} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Titre *</Label>
                <Input required value={notification.title} onChange={e => setNotification({ ...notification, title: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Message</Label>
                <Textarea rows={4} value={notification.message} onChange={e => setNotification({ ...notification, message: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cible</Label>
                <Select value={notification.target} onValueChange={v => setNotification({ ...notification, target: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="candidate">Candidats</SelectItem>
                    <SelectItem value="company">Entreprises</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catégorie (facultatif)</Label>
                <Input value={notification.category} onChange={e => setNotification({ ...notification, category: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Lien (facultatif)</Label>
                <Input value={notification.link} onChange={e => setNotification({ ...notification, link: e.target.value })} />
              </div>
              <Button type="submit" size="lg" className="md:col-span-2" disabled={createNotificationMutation.isPending}>
                {createNotificationMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer la notification"}
              </Button>
            </form>
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Notifications existantes</h3>
              {siteNotifications && siteNotifications.length > 0 ? (
                <div className="space-y-4">
                  {siteNotifications.map((n: any) => (
                    <div key={n.id} className="flex items-start justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-sm text-muted-foreground">{n.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">Cible: {n.target || 'all'} — {new Date(n.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="destructive" size="sm" onClick={() => deleteNotificationMutation.mutate(n.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Aucune notification trouvée</div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* === AJOUT FORMATION === */}
        <TabsContent value="formations" className="space-y-6">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Nouvelle formation</h2>
            <form onSubmit={(e) => { e.preventDefault(); createFormationMutation.mutate(formation); }} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Intitulé de la formation *</Label>
                <Input required value={formation.title} onChange={e => setFormation({ ...formation, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Input required value={formation.category} onChange={e => setFormation({ ...formation, category: e.target.value })} placeholder="ex: Informatique, Marketing..." />
              </div>
              <div className="space-y-2">
                <Label>Niveau *</Label>
                <Select value={formation.level} onValueChange={v => setFormation({ ...formation, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée *</Label>
                <Input required value={formation.duration} onChange={e => setFormation({ ...formation, duration: e.target.value })} placeholder="ex: 8 semaines" />
              </div>
              <div className="space-y-2">
                <Label>Prix (facultatif)</Label>
                <Input value={formation.price} onChange={e => setFormation({ ...formation, price: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={5} value={formation.description} onChange={e => setFormation({ ...formation, description: e.target.value })} />
              </div>
              <Button type="submit" size="lg" className="md:col-span-2" disabled={createFormationMutation.isPending}>
                {createFormationMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier la formation"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* === CANDIDATURES === */}
        <TabsContent value="applications" className="space-y-6">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Supervision des candidatures</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 bg-blue-50">
                <div className="text-sm text-muted-foreground">Total candidatures</div>
                <div className="text-2xl font-bold text-blue-600">{stats.applications || 0}</div>
              </Card>
              <Card className="p-4 bg-green-50">
                <div className="text-sm text-muted-foreground">Acceptées</div>
                <div className="text-2xl font-bold text-green-600">-</div>
              </Card>
              <Card className="p-4 bg-yellow-50">
                <div className="text-sm text-muted-foreground">En attente</div>
                <div className="text-2xl font-bold text-yellow-600">-</div>
              </Card>
              <Card className="p-4 bg-red-50">
                <div className="text-sm text-muted-foreground">Rejetées</div>
                <div className="text-2xl font-bold text-red-600">-</div>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground">Consultez la page des détails pour voir toutes les candidatures et gérer les statuts</p>
            <Button onClick={() => navigate('/admin/applications')} className="mt-4">
              Voir toutes les candidatures
            </Button>
          </Card>
        </TabsContent>

        {/* === CONTENU (Publications, Portfolios) === */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">📊 Statistiques de contenu</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-muted-foreground">Publications totales</span>
                  <span className="font-bold text-lg">-</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-muted-foreground">Portfolios (réalisations)</span>
                  <span className="font-bold text-lg">-</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-muted-foreground">Formations publiées</span>
                  <span className="font-bold text-lg">{formations.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-muted-foreground">Offres d'emploi</span>
                  <span className="font-bold text-lg">{jobs.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">🎯 Actions rapides</h2>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/admin/publications')}>
                  📝 Gérer publications
                </Button>
                <Button className="w-full" onClick={() => navigate('/admin/portfolios')}>
                  🎨 Gérer portfolios
                </Button>
                <Button className="w-full" onClick={() => navigate('/admin/services')}>
                  💼 Gérer services
                </Button>
                <Button className="w-full variant-outline" onClick={() => navigate('/admin/categories')}>
                  🏷️ Gérer catégories
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">📋 Contenu modéré</h2>
            <p className="text-sm text-muted-foreground mb-4">Manage and moderate all user-generated content across the platform</p>
            <Button onClick={() => navigate('/admin/moderation')} className="w-full">
              Accéder à la modération
            </Button>
          </Card>
        </TabsContent>

        {/* === MODÉRATION DU FIL D'ACTUALITÉ === */}
        <TabsContent value="moderation" className="space-y-6">
          <ModerateContent />
        </TabsContent>

        {/* === VALIDATION DES CERTIFICATIONS === */}
        <TabsContent value="certifications" className="space-y-6">
          <CertificationValidation />
        </TabsContent>

        {/* === IMPERSONNALISATION === */}
        <TabsContent value="impersonate" className="space-y-6">
          <ImpersonateUser />
        </TabsContent>

        {/* === GESTION CATALOGUE ET CODES PROMOS === */}
        <TabsContent value="catalog" className="space-y-6">
          <ServiceCatalogManager />
        </TabsContent>

        {/* === SANTÉ DU SYSTÈME === */}
        <TabsContent value="health" className="space-y-6">
          <SystemHealth />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;