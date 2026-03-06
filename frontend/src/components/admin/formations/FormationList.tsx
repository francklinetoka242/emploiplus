// src/components/admin/formations/FormationList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormationCard from "./FormationCard";
import FormationForm from "./FormationForm";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, AlertCircle } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import { toast } from "sonner";
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

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

interface FormationListProps {
  formations?: Formation[];
}

export default function FormationList({ formations: initialFormations }: FormationListProps) {
  const navigate = useNavigate();
  const [formations, setFormations] = useState<Formation[]>(initialFormations || []);
  const [editing, setEditing] = useState<Formation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const fetchFormations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if admin token exists
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Authentification requise");
        toast.error("Session expirée. Veuillez vous reconnecter.");
        navigate("/admin/login");
        return;
      }

      const res = await fetch("/api/admin/formations?published=all", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      // Handle 401 Unauthorized
      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        setError("Votre session a expiré");
        toast.error("Veuillez vous reconnecter");
        navigate("/admin/login");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      // API returns { data: [...] }, extract the array
      setFormations(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch formations error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialFormations) {
      setFormations(initialFormations);
      setIsLoading(false);
      setError(null);
    } else {
      fetchFormations();
    }
  }, [navigate, initialFormations]);

  const togglePublish = async (id: string, published: boolean) => {
    try {
      await api.publishFormation(id, !published);
      toast.success(published ? "Formation dépubliée" : "Formation publiée");
      if (initialFormations) {
        queryClient.invalidateQueries(["admin-formations"]);
      } else {
        fetchFormations();
      }
    } catch (err) {
      console.error('Publish formation error:', err);
      toast.error('Échec de la mise à jour du statut');
    }
  };

  const deleteFormation = async (id: string) => {
    try {
      await api.deleteFormation(id);
      toast.success("Formation supprimée");
      if (initialFormations) {
        queryClient.invalidateQueries(["admin-formations"]);
      } else {
        fetchFormations();
      }
    } catch (err) {
      console.error('Delete formation error:', err);
      toast.error('Échec de la suppression');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Erreur de chargement</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchFormations}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

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