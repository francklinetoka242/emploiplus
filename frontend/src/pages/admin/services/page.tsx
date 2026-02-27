// src/pages/admin/services/page.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ServiceList from "@/components/admin/services/ServiceList";
import ServiceForm from "@/components/admin/services/ServiceForm";

export default function ServicesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">Gestion des Services</h1>
          <p className="text-xl text-muted-foreground mt-3">
            Ajoutez, modifiez ou publiez des services professionnels en toute simplicité
          </p>
        </div>

        <Button size="lg" onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-3 h-6 w-6" />
          Nouveau service
        </Button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-10 max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
            <ServiceForm onSuccess={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

      <ServiceList />
    </div>
  );
}
