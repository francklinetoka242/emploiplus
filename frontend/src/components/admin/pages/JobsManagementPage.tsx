// src/components/admin/pages/JobsManagementPage.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function JobsManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Offres d'emploi</h1>
        <p className="text-slate-600 mt-1">Gérez toutes les offres d'emploi publiées</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Rechercher une offre..."
            className="pl-10"
          />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle offre
        </Button>
      </div>

      {/* JOBS LIST - PLACEHOLDER */}
      <Card className="p-8 text-center">
        <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune offre d'emploi</h3>
        <p className="text-slate-600 mb-6">Commencez par créer une nouvelle offre d'emploi</p>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="h-4 w-4" />
          Créer une offre
        </Button>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Total d'offres</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Offres actives</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Candidatures totales</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
      </div>
    </div>
  );
}
