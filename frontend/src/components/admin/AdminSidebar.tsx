// src/components/admin/AdminSidebar.tsx
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  ShoppingBag,
  Users,
  Bell,
  Shield,
  LogIn,
  HelpCircle,
  BookMarked,
  AlertTriangle,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./AdminSidebar.css";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  adminLevel?: number;
}

/**
 * NEW ADMIN SIDEBAR - SUPER ADMIN LEVEL 1
 * 
 * Menu Items (11 sections):
 * 1. Tableau de bord
 * 2. Offres d'emploi
 * 3. Formations
 * 4. Catalogues & Services
 * 5. Utilisateurs
 * 6. Notifications
 * 7. Administrateurs
 * 8. Historique de connexion
 * 9. FAQ
 * 10. Documentations
 * 11. Santé du Système
 */

const MENU_ITEMS = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    badge: null,
  },
  {
    label: "Offres d'emploi",
    icon: Briefcase,
    path: "/admin/jobs",
    badge: null,
  },
  {
    label: "Formations",
    icon: BookOpen,
    path: "/admin/formations",
    badge: null,
  },
  {
    label: "Catalogues & Services",
    icon: ShoppingBag,
    path: "/admin/services",
    badge: null,
  },
  {
    label: "Utilisateurs",
    icon: Users,
    path: "/admin/users",
    badge: null,
  },
  {
    label: "Notifications",
    icon: Bell,
    path: "/admin/notifications",
    badge: "NEW",
  },
  {
    label: "Administrateurs",
    icon: Shield,
    path: "/admin/admins",
    badge: null,
  },
  {
    label: "Historique de connexion",
    icon: LogIn,
    path: "/admin/login-history",
    badge: null,
  },
  {
    label: "FAQ",
    icon: HelpCircle,
    path: "/admin/faq",
    badge: null,
  },
  {
    label: "Paramètres",
    icon: Settings,
    path: "/admin/profile",
    badge: null,
  },
  {
    label: "Documentations",
    icon: BookMarked,
    path: "/admin/documentation",
    badge: null,
  },
  {
    label: "Santé du Système",
    icon: AlertTriangle,
    path: "/admin/system-health",
    badge: null,
  },
];

export default function AdminSidebar({ isOpen, onClose, adminLevel = 1 }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* OVERLAY FOR MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl flex flex-col transition-all duration-300 z-50 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:w-20"
        )}
      >
        {/* HEADER SIDEBAR */}
        <div className="p-6 flex-shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
              A
            </div>
            {isOpen && (
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-xs text-blue-300">Super Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2 custom-scrollbar">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold badge-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* TOOLTIP FOR COLLAPSED SIDEBAR */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("admin");
              navigate("/admin/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
