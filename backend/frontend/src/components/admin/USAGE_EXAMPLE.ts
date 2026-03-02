// EXEMPLE D'UTILISATION COMPLÈTE - Admin Interface

/**
 * ================================================================================
 * EXEMPLE: Comment utiliser la nouvelle interface Super Admin
 * ================================================================================
 */

// ÉTAPE 1: Configuration des routes (dans votre App.tsx ou router)
// ──────────────────────────────────────────────────────────────

import Admin from "@/pages/Admin";

/*
// Dans votre router config:
<Routes>
  <Route path="/admin" element={<Admin />} />
  // Ou pour tous les sous-chemins:
  <Route path="/admin/*" element={<Admin />} />
</Routes>
*/

// ────────────────────────────────────────────────────────────────

// ÉTAPE 2: Personnaliser le menu (dans AdminSidebar.tsx)
// ────────────────────────────────────────────────────────────────

/*
// Pour ajouter une nouvelle section au menu:

const MENU_ITEMS = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    badge: null,
  },
  // ... articles existants ...
  {
    label: "Nouvelle Section",  // ← Nouveau
    icon: YourIcon,              // ← Icon de lucide-react
    path: "/admin/new-section",  // ← Votre route
    badge: null,
  },
];
*/

// ────────────────────────────────────────────────────────────────

// ÉTAPE 3: Implémenter le routing complètement
// ────────────────────────────────────────────────────────────────

/*
// Voici le code à mettre en place dans Admin.tsx:

import { useLocation } from "react-router-dom";

const Admin = () => {
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  
  // Déterminer quelle page afficher
  const getPageComponent = () => {
    const pathname = location.pathname;

    // Switch sur toutes les routes
    if (pathname === "/admin/dashboard") {
      return <AdminDashboardPage />;
    } else if (pathname === "/admin/jobs") {
      return <JobsManagementPage />;
    } else if (pathname === "/admin/formations") {
      return <FormationsManagementPage />;
    } else if (pathname === "/admin/services") {
      return <ServicesManagementPage />;
    } else if (pathname === "/admin/users") {
      return <UsersManagementPage />;
    } else if (pathname === "/admin/notifications") {
      return <NotificationsManagementPage />;
    } else if (pathname === "/admin/admins") {
      return <AdminsManagementPage />;
    } else if (pathname === "/admin/login-history") {
      return <LoginHistoryPage />;
    } else if (pathname === "/admin/faq") {
      return <FAQManagementPage />;
    } else if (pathname === "/admin/documentation") {
      return <DocumentationPage />;
    } else if (pathname === "/admin/system-health") {
      return <SystemHealthPage />;
    }
    
    // Par défaut, afficher le dashboard
    return <AdminDashboardPage />;
  };

  return (
    <AdminLayout adminLevel={admin.level || 0}>
      {getPageComponent()}
    </AdminLayout>
  );
};

export default Admin;
*/

// ────────────────────────────────────────────────────────────────

// ÉTAPE 4: Connecter les données réelles (exemple pour Jobs)
// ────────────────────────────────────────────────────────────────

/*
// Dans JobsManagementPage.tsx (version complète):

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function JobsManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Récupérer les données
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => api.getAdminJobs(),
  });

  // Créer une nouvelle offre
  const createMutation = useMutation({
    mutationFn: (newJob) => api.createJob(newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Offre créée!");
    },
    onError: () => toast.error("Erreur!"),
  });

  // Supprimer une offre
  const deleteMutation = useMutation({
    mutationFn: (jobId) => api.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Offre supprimée!");
    },
    onError: () => toast.error("Erreur!"),
  });

  // Filtrer les données
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Offres d'emploi</h1>

      {/* Search bar */}
      <Input
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Jobs list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map(job => (
          <Card key={job.id} className="p-4">
            <h3 className="font-bold">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>
            <button
              onClick={() => deleteMutation.mutate(job.id)}
              className="mt-2 px-2 py-1 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
*/

// ────────────────────────────────────────────────────────────────

// ÉTAPE 5: Ajouter des formulaires CRUD
// ────────────────────────────────────────────────────────────────

/*
// Exemple: Modal pour créer une offre

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateJobModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: () => api.createJob({ title, company, description }),
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setCompany("");
      setDescription("");
      reset(); // Vider les données
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600">+ Nouvelle offre</Button>
      </DialogTrigger>

      <DialogContent>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Créer une offre</h2>

          <Input
            placeholder="Titre du poste"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            placeholder="Entreprise"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Créer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
*/

// ────────────────────────────────────────────────────────────────

// ÉTAPE 6: Tester l'interface
// ────────────────────────────────────────────────────────────────

/*
Dans votre terminal:
1. npm run dev
2. Aller à http://localhost:5173/admin
3. Vérifier:
   - Header avec user info ✅
   - Sidebar avec 11 items ✅
   - Dashboard stats ✅
   - Cliquer sur items change la page ✅
   - Menu items restent en surbrillance ✅
   - Pas d'erreurs console ✅
*/

// ────────────────────────────────────────────────────────────────

// EXEMPLE DE FLUX UTILISATEUR
// ────────────────────────────────────────────────────────────────

/*
1. Admin se connecte
   ↓ Stock admin info dans localStorage
   ↓

2. Admin accède à /admin
   ↓ Admin.tsx charge
   ↓ AdminLayout rend le layout
   ↓ Dashboard s'affiche (page par défaut)
   ↓

3. Admin clique sur "Offres d'emploi"
   ↓ URL change à /admin/jobs
   ↓ getPageComponent() retourne JobsManagementPage
   ↓ Sidebar item "Offres" devient actif
   ↓ Page change avec animation
   ↓

4. Admin clique "+ Nouvelle offre"
   ↓ Modal s'ouvre
   ↓ Admin remplit le formulaire
   ↓ Submit → API appel
   ↓ Mutation complétée
   ↓ Liste se recharge
   ↓ Toast "Offre créée!"
   ↓

5. Admin clique "Déconnexion"
   ↓ localStorage vidé
   ↓ Redirect à /admin/login
   ↓ Session terminée
   ↓
*/

// ────────────────────────────────────────────────────────────────

// PERSONNALISATIONS COMMUNES
// ────────────────────────────────────────────────────────────────

// 1. Changer les couleurs du menu
// Edit AdminSidebar.tsx, remplacez:
/*
bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
Avec votre couleur, ex:
bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900
*/

// 2. Ajouter logo personnalisé
// Edit AdminSidebar.tsx :
/*
Remplacez:
<div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
  A
</div>

Avec:
<img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-lg" />
*/

// 3. Changer les polices
// Edit Tailwind config ou AdminLayout.tsx :
/*
<h1 className="text-3xl font-bold font-[YourFont]">
*/

// 4. Ajouter des animations personnalisées
// Edit AdminSidebar.css :
/*
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.sidebar-animated {
  animation: slideIn 0.3s ease-out;
}
*/

// ────────────────────────────────────────────────────────────────

// CHECKLIST AVANT DEPLOYMENT
// ────────────────────────────────────────────────────────────────

/*
[ ] Routing implémenté (tous les 11 items naviguent)
[ ] API connectée (données réelles affichées)
[ ] Formulaires CRUD (create, edit, delete travaillent)
[ ] Erreurs gérées (message d'erreur affichés)
[ ] Pas d'erreurs console
[ ] Pas d'erreurs TypeScript
[ ] Responsive testé (mobile, tablet, desktop)
[ ] Performance acceptable
[ ] Logout fonctionne
[ ] Tests passés
[ ] Documentation mise à jour
[ ] Prêt pour production!
*/

// ────────────────────────────────────────────────────────────────

export {};
