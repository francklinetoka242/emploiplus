// src/components/admin/Sidebar.tsx
// PHASE 5: Admin Sidebar with 5-level authorization
import { LogOut, Shield, Users, Briefcase, BookOpen, LayoutDashboard, Bell, ShoppingBag, AlertTriangle, BarChart3, DollarSign, Zap, HelpCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

/**
 * ADMIN LEVELS:
 * 1 - Super Admin (All access)
 * 2 - Admin Content (Content management: jobs, formations, services)
 * 3 - Admin Users (User management)
 * 4 - Admin Stats (Analytics only)
 * 5 - Admin Billing (Subscriptions & payments)
 */

const ADMIN_LEVELS = {
  1: { name: "Super Admin", color: "from-red-600 to-red-500", description: "Accès complet" },
  2: { name: "Admin Contenu", color: "from-blue-600 to-blue-500", description: "Gestion contenu" },
  3: { name: "Admin Utilisateurs", color: "from-green-600 to-green-500", description: "Gestion utilisateurs" },
  4: { name: "Admin Stats", color: "from-yellow-600 to-yellow-500", description: "Analytiques" },
  5: { name: "Admin Facturation", color: "from-purple-600 to-purple-500", description: "Abonnements" },
};

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const adminLevel = admin.level || 0;
  const adminEmail = admin.email || "Admin";
  const adminName = admin.firstName || "Administrateur";

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast.success("Déconnexion réussie");
    navigate("/admin/login");
  };

  /**
   * MENU AUTHORIZATION BY LEVEL:
   * - Level 1 (Super Admin): All sections
   * - Level 2 (Content): Jobs, Formations, Services, Dashboard
   * - Level 3 (Users): Users, Dashboard
   * - Level 4 (Stats): Analytics, Dashboard
   * - Level 5 (Billing): Subscriptions, Financial, Dashboard
   */
  const menuItems = [
    // Dashboard - All levels
    { label: "Tableau de bord", icon: LayoutDashboard, path: "/admin", levels: [1, 2, 3, 4, 5] },
    
    // ═══════════════════════════════════════════════════════════════════════
    // LEVEL 1: SUPER ADMIN
    // ═══════════════════════════════════════════════════════════════════════
    ...(adminLevel === 1 ? [
      { label: "Administrateurs", icon: Shield, path: "/admin/admins", levels: [1] },
      { label: "Notifications", icon: Bell, path: "/admin/notifications", levels: [1] },
      { label: "Documents", icon: FileText, path: "/admin/documents", levels: [1] },
      { label: "FAQ", icon: HelpCircle, path: "/admin/faqs", levels: [1] },
    ] : []),
    
    // ═══════════════════════════════════════════════════════════════════════
    // LEVEL 1 & 2: CONTENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    ...(adminLevel === 1 || adminLevel === 2 ? [
      { label: "Offres d'emploi", icon: Briefcase, path: "/admin/jobs", levels: [1, 2] },
      { label: "Formations", icon: BookOpen, path: "/admin/formations", levels: [1, 2] },
      { label: "Services", icon: ShoppingBag, path: "/admin/services", levels: [1, 2] },
    ] : []),
    
    // ═══════════════════════════════════════════════════════════════════════
    // LEVEL 1 & 3: USER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    ...(adminLevel === 1 || adminLevel === 3 ? [
      { label: "Utilisateurs", icon: Users, path: "/admin/users", levels: [1, 3] },
    ] : []),
    
    // ═══════════════════════════════════════════════════════════════════════
    // LEVEL 1 & 4: ANALYTICS & STATISTICS
    // ═══════════════════════════════════════════════════════════════════════
    ...(adminLevel === 1 || adminLevel === 4 ? [
      { label: "Statistiques", icon: BarChart3, path: "/admin?tab=analytics", levels: [1, 4] },
    ] : []),

    // ═══════════════════════════════════════════════════════════════════════
    // LEVEL 1 & 5: BILLING & SUBSCRIPTIONS
    // ═══════════════════════════════════════════════════════════════════════
    ...(adminLevel === 1 || adminLevel === 5 ? [
      { label: "Paiements", icon: DollarSign, path: "/admin?tab=financial", levels: [1, 5] },
      { label: "Abonnements", icon: Zap, path: "/admin/subscriptions", levels: [1, 5] },
    ] : []),

    // ═══════════════════════════════════════════════════════════════════════
    // LEVEL 1 ONLY: SYSTEM HEALTH
    // ═══════════════════════════════════════════════════════════════════════
    ...(adminLevel === 1 ? [
      { label: "Santé du Système", icon: AlertTriangle, path: "/admin?tab=health", levels: [1] },
    ] : []),
  ];

  const currentPath = location.pathname;

  const navigateTo = (path: string) => {
    if (path.includes('?')) {
      const [p, q] = path.split('?');
      navigate(`${p}?${q}`);
    } else {
      navigate(path);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-50 w-72 h-screen bg-gradient-to-b from-primary to-primary/95 text-white shadow-2xl flex flex-col">
      <div className="p-8 flex-shrink-0">
        <div className="flex items-center gap-4 mb-12">
          <Shield className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm opacity-90 font-semibold">
              {ADMIN_LEVELS[adminLevel as keyof typeof ADMIN_LEVELS]?.name || "Inconnu"}
            </p>
            <p className="text-xs opacity-75">
              {ADMIN_LEVELS[adminLevel as keyof typeof ADMIN_LEVELS]?.description || ""}
            </p>
            <p className="text-xs opacity-75 truncate mt-2">{adminName}</p>
            <p className="text-xs opacity-75 truncate">{adminEmail}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-3 mt-10 px-8 flex-1 overflow-y-auto pb-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          let isActive = false;
          if (item.path.includes('?')) {
            const [p, q] = item.path.split('?');
            isActive = currentPath === p && location.search === `?${q}`;
          } else {
            isActive = currentPath === item.path;
          }

          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start h-14 text-lg rounded-xl ${
                isActive ? "bg-white/25 shadow-lg" : "hover:bg-white/15"
              }`}
              onClick={() => navigateTo(item.path)}
            >
              <Icon className="mr-4 h-6 w-6" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-8 border-t border-white/20 flex-shrink-0">
        <Button variant="ghost" className="w-full h-14 text-lg hover:bg-white/20" onClick={logout}>
          <LogOut className="mr-4 h-6 w-6" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}