// src/components/admin/pages/NotificationsManagementPage.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function NotificationsManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-600 mt-1">Gérez les notifications site-wide</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Rechercher une notification..."
            className="pl-10"
          />
        </div>
        <Button className="bg-red-600 hover:bg-red-700 gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle notification
        </Button>
      </div>

      {/* NOTIFICATIONS LIST - PLACEHOLDER */}
      <Card className="p-8 text-center">
        <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune notification</h3>
        <p className="text-slate-600 mb-6">Créez une notification pour informer les utilisateurs</p>
        <Button className="bg-red-600 hover:bg-red-700 gap-2">
          <Send className="h-4 w-4" />
          Envoyer notification
        </Button>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Total envoyées</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Lectures</p>
          <p className="text-3xl font-bold mt-2">0%</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Clics</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Désinscriptions</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
      </div>
    </div>
  );
}
