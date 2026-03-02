// src/components/career/TargetPositionsList.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export const TargetPositionsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState<number | null>(null);

  const { data: positions = [], isLoading, refetch } = useQuery({
    queryKey: ['targetPositions', user?.id],
    queryFn: () => api.getTargetPositions(),
    enabled: !!user?.id,
  });

  const handleDelete = async (positionId: number) => {
    try {
      setDeleting(positionId);
      const result = await api.deleteTargetPosition(positionId);
      if (result.success) {
        toast.success('Position cible supprimée');
        refetch();
      } else {
        toast.error(result.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  if (!user?.id) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-dashed border-purple-200 rounded-lg p-8 text-center">
        <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Aucune position cible</h3>
        <p className="text-sm text-gray-600 mb-4">
          Sélectionnez un poste comme objectif pour générer une roadmap de carrière personnalisée.
        </p>
        <Button
          onClick={() => navigate('/offres')}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Target className="w-4 h-4 mr-2" />
          Parcourir les Offres
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-600" />
        Mes Positions Cibles ({positions.length})
      </h3>
      
      <div className="space-y-2">
        {positions.map((position: any) => (
          <div
            key={position.id}
            className="bg-white border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className="flex-1 cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => navigate(`/offres/${position.target_job_id}`)}
              >
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  {position.title}
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {position.company || 'Entreprise non spécifiée'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Ajouté le {new Date(position.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/offres/${position.target_job_id}`)}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Roadmap
                </Button>
                <Button
                  onClick={() => handleDelete(position.id)}
                  disabled={deleting === position.id}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
