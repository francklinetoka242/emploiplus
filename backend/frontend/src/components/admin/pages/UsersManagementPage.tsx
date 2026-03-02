// src/components/admin/pages/UsersManagementPage.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Search, Shield, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UsersManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Utilisateurs</h1>
        <p className="text-slate-600 mt-1">Gérez tous les utilisateurs de la plateforme</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Rechercher un utilisateur..."
            className="pl-10"
          />
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 gap-2">
          <Plus className="h-4 w-4" />
          Ajouter utilisateur
        </Button>
      </div>

      {/* USERS FILTER */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline">Tous</Button>
        <Button variant="outline">Candidats</Button>
        <Button variant="outline">Entreprises</Button>
        <Button variant="outline">Actifs</Button>
        <Button variant="outline">Inactifs</Button>
      </div>

      {/* USERS LIST - PLACEHOLDER */}
      <Card className="p-8 text-center">
        <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun utilisateur</h3>
        <p className="text-slate-600 mb-6">Aucun utilisateur à afficher.</p>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Utilisateurs actifs</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Candidats</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Entreprises</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Suspendus</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Nouveaux (7j)</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
      </div>
    </div>
  );
}
