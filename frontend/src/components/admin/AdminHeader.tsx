// src/components/admin/AdminHeader.tsx
import { LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  admin: Record<string, any>;
  onLogout: () => void;
}

export default function AdminHeader({ admin, onLogout }: AdminHeaderProps) {
  const navigate = useNavigate();
  const adminName = admin?.firstName || admin?.name || "Administrateur";
  const adminEmail = admin?.email || "admin@emploiplus.com";
  const adminInitial = adminName?.charAt(0).toUpperCase() || "A";

  const adminLevelNames: Record<number, string> = {
    1: "Super Admin",
    2: "Admin Contenu",
    3: "Admin Utilisateurs",
    4: "Admin Stats",
    5: "Admin Facturation",
  };

  const adminLevel = admin?.level || 1;
  const levelName = adminLevelNames[adminLevel] || "Administrateur";

  return (
    <div className="flex items-center gap-6">
      {/* ACCOUNT INFO */}
      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{adminName}</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {levelName}
          </span>
        </div>
        <p className="text-xs text-slate-500">{adminEmail}</p>
      </div>

      {/* AVATAR */}
      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
        {adminInitial}
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/profile")}
          className="hover:bg-slate-100"
          title="Paramètres du compte"
        >
          <Settings className="h-5 w-5 text-slate-600" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="hover:bg-red-50 text-red-600 hover:text-red-700"
          title="Déconnexion"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
