import React, { useEffect } from "react";
import { X, Settings, Book, Briefcase, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role } = useUserRole(user);

  useEffect(() => {
    // Empêcher le scroll du body quand le drawer est ouvert
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    signOut();
    navigate("/connexion");
    onClose();
  };

  const menuItems = [
    {
      icon: Book,
      label: "Formations",
      path: "/formations",
      color: "text-secondary",
    },
    {
      icon: Briefcase,
      label: "Services",
      path: "/services",
      color: "text-blue-600",
    },
    {
      icon: MessageSquare,
      label: "Ressources",
      path: "/documentation",
      color: "text-purple-600",
    },
    {
      icon: Settings,
      label: "Paramètres",
      path: "/parametres",
      color: "text-gray-600",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 md:hidden
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{
          animation: isOpen ? "slideInRight 0.3s ease-out" : "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {(user?.full_name || user?.company_name || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.full_name || user?.company_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {role === "candidate"
                  ? "Candidat"
                  : role === "company"
                    ? "Entreprise"
                    : "Administrateur"}
              </p>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg 
                  hover:bg-gray-100 transition-colors text-left"
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
                <span className="font-medium text-gray-700">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Logout Button */}
        {user && (
          <div className="p-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-500 text-center">
          <p>Emploi+ v1.0</p>
          <p className="mt-1">© 2026 Tous droits réservés</p>
        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
