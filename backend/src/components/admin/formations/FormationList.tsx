// src/components/admin/formations/FormationList.tsx
import { useState, useEffect } from "react";
import FormationCard from "./FormationCard";
import FormationForm from "./FormationForm";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';

export interface Formation {
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

interface FormationListProps {
  formations?: Formation[];
}

export default function FormationList({ formations: initialFormations }: FormationListProps) {
  const [formations, setFormations] = useState<Formation[]>(initialFormations || []);
  const [editing, setEditing] = useState<Formation | null>(null);
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  const fetchFormations = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch("/api/admin/formations?published=all", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Erreur API formations:', errorData);
        toast.error(errorData.message || 'Erreur lors du chargement des formations');
        return;
      }

      const data = await res.json();
      setFormations(data?.data || data);
    } catch (error) {
      console.error('Erreur réseau:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  useEffect(() => {
    if (initialFormations) {
      setFormations(initialFormations);
    } else {
      fetchFormations();
    }
  }, [initialFormations]);

  const togglePublish = async (id: string, published: boolean) => {
    const token = localStorage.getItem('adminToken');
    await fetch(`/api/admin/formations/${id}/publish`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ published: !published }),
    });
    toast.success(published ? "Formation dépubliée" : "Formation publiée");
    if (initialFormations) {
      queryClient.invalidateQueries(["admin-formations"]);
    } else {
      fetchFormations();
    }
  };

  const deleteFormation = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    await fetch(`/api/admin/formations/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    toast.success("Formation supprimée");
    if (initialFormations) {
      queryClient.invalidateQueries(["admin-formations"]);
    } else {
      fetchFormations();
    }
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