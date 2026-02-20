// src/components/admin/Sidebar.tsx
import { LogOut, Shield, Users, Briefcase, BookOpen, LayoutDashboard, UserPlus, FileCheck, ShoppingBag, Bell, ShoppingCart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const role = admin.role || "admin";

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast.success("Déconnexion réussie");
    navigate("/admin/login");
  };

  const menuItems = [
    { label: "Tableau de bord", icon: LayoutDashboard, path: "/admin" },
    ...(role === "super_admin" ? [
      { label: "Notifications", icon: Bell, path: "/admin/notifications" },
    ] : []),
    ...(role === "super_admin" ? [
      
      { label: "Administrateurs", icon: Shield, path: "/admin/admins" },
    ] : []),
    ...(role === "super_admin" || role === "admin_offres" ? [
      { label: "Offres d'emploi", icon: Briefcase, path: "/admin/jobs" },
      { label: "Formations", icon: BookOpen, path: "/admin/formations" },
      { label: "Services", icon: ShoppingBag, path: "/admin/services" },
    ] : []),
    ...(role === "super_admin" || role === "admin_users" ? [
      { label: "Utilisateurs", icon: Users, path: "/admin/users" },
    ] : []),
    // FAQ management available to admin roles
    ...(role === "super_admin" || role === "admin_users" || role === "admin" ? [
      { label: "FAQ", icon: FileCheck, path: "/admin/faqs" },
    ] : []),
    // Catalogs management available to all admins
    ...(role === "super_admin" || role === "admin_offres" ? [
      { label: "Catalogue Services", icon: ShoppingBag, path: "/admin/catalogs" },
    ] : []),
    // Phase 4 - Service Catalog & Pricing (Catalogue & Codes Promos)
    ...(role === "super_admin" ? [
      { label: "Catalogue Services", icon: ShoppingCart, path: "/admin?tab=catalog" },
    ] : []),
    // Phase 4 - System Health Monitoring
    ...(role === "super_admin" ? [
      { label: "Santé du Système", icon: AlertTriangle, path: "/admin?tab=health" },
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
            <p className="text-sm opacity-90 capitalize">{role.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-3 mt-10 px-8 flex-1 overflow-y-auto pb-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // determine active by comparing pathname and search if present
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