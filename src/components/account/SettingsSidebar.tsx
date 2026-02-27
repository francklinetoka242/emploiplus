import { NavLink, useLocation } from "react-router-dom";
import { LogOut, Trash2, Home, User, Lock, FileText, Zap, Briefcase, CreditCard, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export default function SettingsSidebar() {
  const { signOut, user } = useAuth();
  const { role } = useUserRole(user);

  const baseItems = [
    { label: "Tableau de bord", path: "/parametres", icon: Home },
    { label: "Profil", path: "/parametres/profil", icon: User },
  ];

  const candidateItems = [
    { label: "Mes informations", path: "/parametres/informations", icon: FileText },
    { label: "Confidentialité", path: "/parametres/confidentialite-profil", icon: Shield },
    { label: "Abonnement", path: "/parametres/abonnement", icon: CreditCard },
  ];

  const companyItems = [
    { label: "Localisation & Contact", path: "/parametres/localisation", icon: Briefcase },
    { label: "Confidentialité", path: "/parametres/confidentialite", icon: Shield },
    { label: "Abonnement", path: "/parametres/abonnement", icon: CreditCard },
  ];

  const commonItems = [
    { label: "Vérification du compte", path: "/parametres/verification", icon: FileText },
    { label: "Sécurité", path: "/parametres/securite", icon: Lock },
    { label: "Recommandations", path: "/parametres/recommandations", icon: Zap },
  ];

  const items = [
    ...baseItems,
    ...(role === 'candidate' ? candidateItems : []),
    ...(role === 'company' ? companyItems : []),
    ...commonItems,
  ];

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  const visibleItems = q
    ? items.filter((it) => it.label.toLowerCase().includes(String(q).toLowerCase()))
    : items;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="hidden lg:block w-64 fixed left-0 top-20 h-[calc(100vh-5rem)] bg-gradient-to-b from-primary to-primary/95 text-white shadow-lg">
      <nav className="space-y-1 p-4 sticky top-20">
        {visibleItems.length > 0 ? visibleItems.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.path}
              to={it.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-white ${
                  isActive ? "bg-white/20 font-semibold" : "opacity-90 hover:bg-white/10"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{it.label}</span>
            </NavLink>
          );
        }) : (
          <div className="px-4 py-3 text-white/80">Aucun paramètre correspondant.</div>
        )}

        <div className="h-px bg-border my-4" />

        <NavLink
          to="/parametres/supprimer"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-white ${
              isActive ? "bg-white/20 font-semibold" : "opacity-90 hover:bg-white/10"
            }`
          }
        >
          <Trash2 className="h-5 w-5" />
          <span>Supprimer le compte</span>
        </NavLink>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      </nav>
    </aside>
  );
}
