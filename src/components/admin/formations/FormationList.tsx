// src/components/admin/formations/FormationList.tsx
import { useState, useEffect } from "react";
import FormationCard from "./FormationCard";
import FormationForm from "./FormationForm";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import { toast } from "sonner";

interface Formation {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  price: string;
  description: string;
  image_url?: string;
  published: boolean;
  created_at: string;
}

export default function FormationList() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [editing, setEditing] = useState<Formation | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchFormations = async () => {
    const res = await fetch("/api/formations");
    const data = await res.json();
    setFormations(data);
  };

  useEffect(() => { fetchFormations(); }, []);

  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/formations/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    toast.success(published ? "Formation dépubliée" : "Formation publiée");
    fetchFormations();
  };

  const deleteFormation = async (id: string) => {
    await fetch(`/api/formations/${id}`, { method: "DELETE" });
    toast.success("Formation supprimée");
    fetchFormations();
  };

  return (
    <div>
     

      {showForm || editing ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <FormationForm 
              formation={editing} 
              onSuccess={() => {
                setShowForm(false);
                setEditing(null);
                fetchFormations();
              }} 
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        {formations.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="h-24 w-24 mx-auto mb-6 opacity-20" />
            <p className="text-2xl">Aucune formation</p>
          </div>
        ) : (
          formations.map((f: Formation) => (
            <FormationCard
              key={f.id}
              formation={f}
              onEdit={() => setEditing(f)}
              onToggle={() => togglePublish(f.id, f.published)}
              onDelete={() => deleteFormation(f.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}