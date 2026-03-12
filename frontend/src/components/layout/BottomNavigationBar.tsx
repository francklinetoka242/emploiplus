import React, { useMemo } from "react";
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
  ArrowLeft,
  Zap,
  Palette,
  Code,
  Shield,
  CreditCard,
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  // lorsque le layout se trouve dans un contexte "action" (formulaire) ,
  // la page peut fournir ces props pour piloter le bouton de validation
  onActionConfirm?: () => void;
  actionConfirmLabel?: string;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  notificationCount = 0,
  messageCount = 0,
  onDrawerOpen,
  onActionConfirm,
  actionConfirmLabel,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { role } = useUserRole(user);

  const isCandidate = role === "candidate";
  const isCompany = role === "company";
  const pathname = location.pathname;

  function computeContext(path: string):
    | "main"
    | "services"
    | "parametres"
    | "action" {
    if (/^\/postuler/.test(path) || /^\/inscription/.test(path)) {
      return "action";
    }
    if (path.startsWith("/services")) return "services";
    if (path.startsWith("/parametres")) return "parametres";

    const mainPaths = isCandidate
      ? ["/connexions", "/emplois", "/newsfeed", "/messages", "/profil"]
      : isCompany
      ? ["/newsfeed", "/recrutement", "/candidats", "/messages", "/settings"]
      : ["/", "/emplois", "/connexion"];

    if (mainPaths.includes(path)) return "main";

    // fallback vers main pour ne jamais retourner undefined
    return "main";
  }

  const isChildPage = pathname.split("/").filter(Boolean).length > 1;

  const navData = useMemo(() => {
    const ctx = computeContext(pathname);
    if (ctx === "action") {
      return { type: "action" } as const;
    }

    let items: NavigationItem[] = [];

    if (ctx === "services") {
      // show the four main tabs used by the Services page instead of
      // links to the old sub‑pages (redaction, informatique, etc.)
      items = [
        {
          icon: ArrowLeft,
          label: "Retour",
          path: "/services",
          onClickOverride: () => navigate("/services"),
        },
        {
          icon: Zap,
          label: "Optimisation",
          path: "/services?tab=optimization",
          onClickOverride: () =>
            navigate({ pathname: "/services", search: "tab=optimization" }),
        },
        {
          icon: Briefcase,
          label: "Outils",
          path: "/services?tab=tools",
          onClickOverride: () =>
            navigate({ pathname: "/services", search: "tab=tools" }),
        },
        {
          icon: Palette,
          label: "Création visuelle",
          path: "/services?tab=visual",
          onClickOverride: () =>
            navigate({ pathname: "/services", search: "tab=visual" }),
        },
        {
          icon: Code,
          label: "Services numériques",
          path: "/services?tab=digital",
          onClickOverride: () =>
            navigate({ pathname: "/services", search: "tab=digital" }),
        },
      ];
    } else if (ctx === "parametres") {
      items = [
        {
          icon: ArrowLeft,
          label: "Retour",
          path: "/compte",
          onClickOverride: () => navigate("/compte"),
        },
        { icon: User, label: "Profil", path: "/parametres/profil" },
        { icon: Shield, label: "Sécurité", path: "/parametres/securite" },
        { icon: CreditCard, label: "Abonnement", path: "/parametres/abonnement" },
        { icon: HelpCircle, label: "Aide", path: "/parametres/aide" },
      ];
    } else {
      // contexte principal: retour logique historique selon rôle
      if (isCandidate) {
        items = [
          {
            icon: Users,
            label: "Connexions",
            path: "/connexions",
            testId: "nav-connections",
          },
          {
            icon: Briefcase,
            label: "Emplois",
            path: "/emplois",
            testId: "nav-jobs",
          },
          {
            icon: Home,
            label: "Fil d'actualité",
            path: "/newsfeed",
            isFab: true,
            testId: "nav-feed",
          },
          {
            icon: MessageSquare,
            label: "Messagerie",
            path: "/messages",
            badge: messageCount,
            testId: "nav-messages",
          },
          {
            icon: User,
            label: "Profil",
            path: "/profil",
            testId: "nav-profile",
            onClickOverride: onDrawerOpen,
          },
        ];
      } else if (isCompany) {
        items = [
          {
            icon: Home,
            label: "Fil d'actualité",
            path: "/newsfeed",
            isFab: true,
            testId: "nav-feed",
          },
          {
            icon: BarChart3,
            label: "Recrutement",
            path: "/recrutement",
            testId: "nav-recruitment",
          },
          {
            icon: Search,
            label: "Candidats",
            path: "/candidats",
            testId: "nav-candidates",
          },
          {
            icon: MessageSquare,
            label: "Messagerie",
            path: "/messages",
            badge: messageCount,
            testId: "nav-messages",
          },
          {
            icon: User,
            label: "Paramètres",
            path: "/settings",
            testId: "nav-settings",
            onClickOverride: onDrawerOpen,
          },
        ];
      } else {
        items = [
          {
            icon: Home,
            label: "Accueil",
            path: "/",
            testId: "nav-home",
          },
          {
            icon: Briefcase,
            label: "Emplois",
            path: "/emplois",
            testId: "nav-jobs",
          },
          {
            icon: User,
            label: "Connexion",
            path: "/connexion",
            testId: "nav-login",
          },
        ];
      }
    }

    if (isChildPage) {
      const fabIndex = items.findIndex((i) => i.isFab);
      if (fabIndex !== -1) {
        items[fabIndex] = {
          ...items[fabIndex],
          icon: ArrowLeft,
          label: "Retour",
          onClickOverride: () => navigate(-1),
        };
      }
    }

    return { type: "normal" as const, items };
  }, [
    pathname,
    role,
    messageCount,
    notificationCount,
    isCandidate,
    isCompany,
    navigate,
    onDrawerOpen,
    isChildPage,
  ]);

  const isActive = (path: string) => {
    if (path.includes("?")) {
      // compare full path including search parameters
      return `${location.pathname}${location.search}` === path;
    }
    return location.pathname === path;
  };

  const handleNavigationClick = (item: NavigationItem) => {
    if (item.onClickOverride) {
      item.onClickOverride();
    } else {
      navigate(item.path);
    }
  };

  const { isVisible } = useScrollDirection(100);

  if (navData.type === "action") {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden pb-[env(safe-area-inset-bottom)] bg-white/90 backdrop-blur-lg border-t border-gray-100">
          <div className="flex px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 mr-2 py-3 bg-gray-100 rounded-lg text-gray-700"
            >
              Annuler
            </button>
            <button
              onClick={onActionConfirm}
              className="flex-1 ml-2 py-3 bg-blue-600 text-white rounded-lg"
            >
              {actionConfirmLabel || "Continuer"}
            </button>
          </div>
        </nav>
        {user && <div className="h-20 md:h-0" />}
      </>
    );
  }

  return (
    <>
      {/* Navigation Bar - Mobile Only */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-[100] md:hidden pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Glassmorphism Background */}
        <div
          className="absolute inset-0 bg-white/80 backdrop-blur-lg border-t border-gray-100"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        />

        {/* Navigation Items */}
        <div className="relative flex justify-around items-end h-16 px-1">
          <AnimatePresence initial={false} mode="popLayout">
            {navData.items.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const isFab = item.isFab;
              const key = item.path || `idx-${index}`;

              if (isFab) {
                // FAB - Floating Action Button (Centre, Surélevé)
                return (
                  <motion.button
                    key={key}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
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
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={key}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
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
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </nav>

      {/* Spacer pour éviter que le contenu soit caché */}
      {user && <div className="h-20 md:h-0" />}
    </>
  );
};