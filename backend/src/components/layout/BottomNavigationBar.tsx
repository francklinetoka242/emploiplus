import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { 
  MessageSquare, 
  Home, 
  Briefcase, 
  Users, 
  User,
  MoreHorizontal,
  Bell,
  Search,
  BarChart3,
  LucideIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
  testId?: string;
  badge?: number;
  isFab?: boolean;
  onClickOverride?: () => void;
}

interface BottomNavigationBarProps {
  notificationCount?: number;
  messageCount?: number;
  onDrawerOpen?: () => void;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  notificationCount = 0,
  messageCount = 0,
  onDrawerOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { role } = useUserRole(user);

  const isCandidate = role === "candidate";
  const isCompany = role === "company";

  // Icônes et routes basées sur le type d'utilisateur
  const navigationItems = isCandidate
    ? [
        { 
          icon: Users, 
          label: "Connexions", 
          path: "/connexions",
          testId: "nav-connections"
        },
        { 
          icon: Briefcase, 
          label: "Emplois", 
          path: "/emplois",
          testId: "nav-jobs"
        },
        { 
          icon: Home, 
          label: "Fil d'actualité", 
          path: "/newsfeed",
          isFab: true,
          testId: "nav-feed"
        },
        { 
          icon: MessageSquare, 
          label: "Messagerie", 
          path: "/messages",
          badge: messageCount,
          testId: "nav-messages"
        },
        { 
          icon: User, 
          label: "Profil", 
          path: "/profil",
          testId: "nav-profile",
          onClickOverride: onDrawerOpen,
        },
      ]
    : isCompany
    ? [
        { 
          icon: Home, 
          label: "Fil d'actualité", 
          path: "/newsfeed",
          isFab: true,
          testId: "nav-feed"
        },
        { 
          icon: BarChart3, 
          label: "Recrutement", 
          path: "/recrutement",
          testId: "nav-recruitment"
        },
        { 
          icon: Search, 
          label: "Candidats", 
          path: "/candidats",
          testId: "nav-candidates"
        },
        { 
          icon: MessageSquare, 
          label: "Messagerie", 
          path: "/messages",
          badge: messageCount,
          testId: "nav-messages"
        },
        { 
          icon: User, 
          label: "Paramètres", 
          path: "/settings",
          testId: "nav-settings",
          onClickOverride: onDrawerOpen,
        },
      ]
    : [
        { 
          icon: Home, 
          label: "Accueil", 
          path: "/",
          testId: "nav-home"
        },
        { 
          icon: Briefcase, 
          label: "Emplois", 
          path: "/emplois",
          testId: "nav-jobs"
        },
        { 
          icon: User, 
          label: "Connexion", 
          path: "/connexion",
          testId: "nav-login"
        },
      ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigationClick = (item: NavigationItem) => {
    if (item.onClickOverride) {
      item.onClickOverride();
    } else {
      navigate(item.path);
    }
  };

  const { isVisible } = useScrollDirection(100);

  return (
    <>
      {/* Navigation Bar - Mobile Only */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}>
        {/* Glassmorphism Background */}
        <div
          className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-white/30"
          style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        />

        {/* Navigation Items */}
        <div className="relative flex justify-around items-end h-16 px-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isFab = item.isFab;

            if (isFab) {
              // FAB - Floating Action Button (Centre, Surélevé)
              return (
                <button
                  key={index}
                  data-testid={item.testId}
                  onClick={() => handleNavigationClick(item)}
                  className="absolute bottom-3 -translate-x-1/2 left-1/2 
                    w-12 h-12 rounded-full 
                    bg-gradient-to-br from-blue-500 to-blue-600 
                    hover:from-blue-600 hover:to-blue-700
                    active:scale-95
                    flex items-center justify-center
                    text-white shadow-lg shadow-blue-500/50
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            }

            return (
              <button
                key={index}
                data-testid={item.testId}
                onClick={() => handleNavigationClick(item)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 
                  transition-all duration-200 relative
                  ${
                    active
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      active ? "fill-current" : ""
                    }`}
                  />
                  {item.badge && item.badge > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium line-clamp-1">
                  {item.label}
                </span>
                
                {/* Indicateur actif */}
                {active && (
                  <div className="absolute bottom-0 h-0.5 w-6 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer pour éviter que le contenu soit caché */}
      {user && <div className="h-20 md:h-0" />}
    </>
  );
};
