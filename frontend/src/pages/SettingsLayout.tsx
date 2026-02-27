import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SettingsSidebar from "@/components/account/SettingsSidebar";
import { Outlet } from "react-router-dom";

export default function SettingsLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate("/connexion");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 lg:pl-72">
        {/* Mobile settings nav */}
        <div className="block lg:hidden mb-4">
          <div className="flex gap-2 overflow-x-auto">
            {(() => {
              const params = new URLSearchParams(window.location.search);
              const q = params.get('q') || '';
              const mobile = [
                { label: 'Tableau de bord', path: '/parametres' },
                { label: 'Profil', path: '/parametres/profil' },
                { label: 'Vérification du compte', path: '/parametres/verification' },
                { label: 'Sécurité', path: '/parametres/securite' },
                { label: 'Mes informations', path: '/parametres/informations' },
                { label: 'Recommandations', path: '/parametres/recommandations' },
              ];
              const visible = q ? mobile.filter(m => m.label.toLowerCase().includes(String(q).toLowerCase())) : mobile;
              if (visible.length === 0) return <div className="px-3 py-2 bg-white rounded-full text-sm">Aucun paramètre correspondant</div>;
              return visible.map((m) => (
                <a key={m.path} href={m.path} className="px-3 py-2 bg-white rounded-full text-sm">{m.label}</a>
              ));
            })()}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar (desktop) */}
          <SettingsSidebar />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
