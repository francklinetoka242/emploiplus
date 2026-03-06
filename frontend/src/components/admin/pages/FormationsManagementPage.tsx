// src/components/admin/pages/FormationsManagementPage.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Search, Eye, EyeOff, Trash2, Edit2, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Formation {
  id: number;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: string;
  price?: number | string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export default function FormationsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Fetch formations
  const { data: formations = [], isLoading } = useQuery({
    queryKey: ["adminFormations"],
    queryFn: async () => {
      try {
        const res = await api.getAdminFormations();
        return Array.isArray(res) ? res : res?.data || [];
      } catch (err) {
        console.error('Error fetching formations:', err);
        toast.error("Erreur lors du chargement des formations");
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Publish/unpublish mutation
  const publishMutation = useMutation({
    mutationFn: async ({ formationId, published }: { formationId: number; published: boolean }) => {
      const res = await fetch(`http://localhost:3000/api/admin/formations/${formationId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error('Failed to update publication status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFormations'] });
      toast.success("Statut de publication mis à jour");
    },
    onError: (err: any) => {
      console.error('Publish error:', err);
      toast.error("Erreur lors de la mise à jour");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (formationId: number) => {
      const res = await fetch(`http://localhost:3000/api/admin/formations/${formationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFormations'] });
      toast.success("Formation supprimée");
    },
    onError: (err: any) => {
      console.error('Delete error:', err);
      toast.error("Erreur lors de la suppression");
    },
  });

  // Filter formations
  const filteredFormations = formations.filter((f: Formation) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    total: formations.length,
    published: formations.filter((f: Formation) => f.published).length,
    unpublished: formations.filter((f: Formation) => !f.published).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Formations</h1>
        <p className="text-slate-600 mt-1">Gérez tous les programmes de formation</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Rechercher une formation..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle formation
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Total</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Publiées</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{stats.published}</p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm">Non publiées</p>
          <p className="text-3xl font-bold mt-2 text-amber-600">{stats.unpublished}</p>
        </Card>
      </div>

      {/* FORMATIONS LIST */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <Loader className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Chargement des formations...</p>
        </Card>
      ) : filteredFormations.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune formation</h3>
          <p className="text-slate-600 mb-6">
            {formations.length === 0 ? "Créez votre première formation" : "Aucun résultat ne correspond à votre recherche"}
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
            <Plus className="h-4 w-4" />
            Créer une formation
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFormations.map((formation: Formation) => (
            <Card key={formation.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{formation.title}</h3>
                    <Badge variant={formation.published ? "default" : "secondary"}>
                      {formation.published ? "Publiée" : "Non publiée"}
                    </Badge>
                  </div>
                  {formation.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{formation.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    {formation.category && <span>{formation.category}</span>}
                    {formation.level && <span>•</span>} {formation.level && <span>{formation.level}</span>}
                    {formation.duration && <span>•</span>} {formation.duration && <span>{formation.duration}</span>}
                    {formation.price && <span>•</span>} {formation.price && <span>{formation.price}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      publishMutation.mutate({
                        formationId: formation.id,
                        published: !formation.published,
                      })
                    }
                    disabled={publishMutation.isPending}
                  >
                    {formation.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
                        deleteMutation.mutate(formation.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
