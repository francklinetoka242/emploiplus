import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, Zap, BookOpen, LogIn, LucideIcon } from "lucide-react";

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

/**
 * BottomNavigationGuest - Navigation bar for non-authenticated users
 * Shows: Accueil, Emplois, Services, Formations, Connexion
 */
export const BottomNavigationGuest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Briefcase, label: "Emplois", path: "/emplois" },
    { icon: Zap, label: "Services", path: "/services" },
    { icon: BookOpen, label: "Formations", path: "/formations" },
    { icon: LogIn, label: "Connexion", path: "/connexion" },
  ];

  const isActive = (path: string): boolean => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3">
      <div className="flex items-center justify-around max-w-full">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
