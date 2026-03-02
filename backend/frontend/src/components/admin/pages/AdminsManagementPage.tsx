// src/components/admin/pages/AdminsManagementPage.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminsManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Administrateurs</h1>
        <p className="text-slate-600 mt-1">Gérez les accès et permissions des administrateurs</p>
      </div>

      {/* ADMIN LEVELS INFO */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-red-500 bg-gradient-to-br from-red-50 to-white">
          <p className="text-sm font-semibold text-slate-900">Level 1</p>
          <p className="text-xs text-slate-600 mt-1">Super Admin</p>
          <p className="text-2xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-4 border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-white">
          <p className="text-sm font-semibold text-slate-900">Level 2</p>
          <p className="text-xs text-slate-600 mt-1">Admin Contenu</p>
          <p className="text-2xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-4 border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-white">
          <p className="text-sm font-semibold text-slate-900">Level 3</p>
          <p className="text-xs text-slate-600 mt-1">Admin Utilisateurs</p>
          <p className="text-2xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-4 border-l-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-white">
          <p className="text-sm font-semibold text-slate-900">Level 4</p>
          <p className="text-xs text-slate-600 mt-1">Admin Stats</p>
          <p className="text-2xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-4 border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-white">
          <p className="text-sm font-semibold text-slate-900">Level 5</p>
          <p className="text-xs text-slate-600 mt-1">Admin Facturation</p>
          <p className="text-2xl font-bold mt-2">0</p>
        </Card>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Rechercher un administrateur..."
            className="pl-10"
          />
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
          <Plus className="h-4 w-4" />
          Ajouter administrateur
        </Button>
      </div>

      {/* ADMINS LIST - PLACEHOLDER */}
      <Card className="p-8 text-center">
        <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun administrateur</h3>
        <p className="text-slate-600 mb-6">Aucun administrateur à afficher.</p>
      </Card>
    </div>
  );
}
