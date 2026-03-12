import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Briefcase,
  Zap,
  BookOpen,
  LogIn,
  ArrowLeft,
  Palette,
  Code,
  User,
  Shield,
  CreditCard,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
  isFab?: boolean;
  onClickOverride?: () => void;
}

interface BottomNavigationGuestProps {
  onActionConfirm?: () => void;
  actionConfirmLabel?: string;
}

/**
 * BottomNavigationGuest - Navigation bar for non-authenticated users
 * behaviour becomes context-sensitive (services / parametres / action)
 */
export const BottomNavigationGuest: React.FC<BottomNavigationGuestProps> = ({
  onActionConfirm,
  actionConfirmLabel,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
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
    const mainPaths = ["/", "/emplois", "/connexion"];
    if (mainPaths.includes(path)) return "main";
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
      items = [
        { icon: Home, label: "Accueil", path: "/" },
        { icon: Briefcase, label: "Emplois", path: "/emplois" },
        { icon: Zap, label: "Services", path: "/services" },
        { icon: BookOpen, label: "Formations", path: "/formations" },
        { icon: LogIn, label: "Connexion", path: "/connexion" },
      ];
    }

    if (isChildPage) {
      const fabIdx = items.findIndex((i) => i.isFab);
      if (fabIdx !== -1) {
        items[fabIdx] = {
          ...items[fabIdx],
          icon: ArrowLeft,
          label: "Retour",
          onClickOverride: () => navigate(-1),
        };
      }
    }

    return { type: "normal" as const, items };
  }, [pathname, navigate, isChildPage]);

  const isActive = (path: string): boolean => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  if (navData.type === "action") {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom)] bg-white/90 backdrop-blur-lg border-t border-gray-100">
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
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom)] bg-white/80 backdrop-blur-lg border-t border-gray-100 px-2 py-3">
      <div className="flex items-center justify-around max-w-full">
        <AnimatePresence initial={false} mode="popLayout">
          {navData.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const key = item.path;

            return (
              <motion.button
                key={key}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={() => (item.onClickOverride ? item.onClickOverride() : navigate(item.path))}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </nav>
  );
};