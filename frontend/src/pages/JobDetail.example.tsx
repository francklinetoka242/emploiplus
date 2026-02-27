// EXEMPLE D'INTÉGRATION DE LA ROADMAP DANS LA PAGE DÉTAIL D'OFFRE
// À ajouter à src/pages/JobDetail.tsx ou créer ce fichier s'il n'existe pas

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MatchScoreBadge } from '@/components/jobs/MatchScoreBadge';
import { CareerRoadmap } from '@/components/career/CareerRoadmap';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api.getJob(Number(jobId)),
    enabled: !!jobId,
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!job) {
    return <div>Offre non trouvée</div>;
  }

  const handleApply = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour postuler');
      return;
    }

    try {
      const result = await api.applyJob(Number(jobId), {});
      if (result.success) {
        toast.success('Candidature envoyée avec succès!');
      }
    } catch (err) {
      toast.error('Erreur lors de la candidature');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Job Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-lg text-gray-600 mt-2">{job.company}</p>
                </div>
                {user && <MatchScoreBadge jobId={Number(jobId)} className="flex-shrink-0" />}
              </div>

              {/* Job Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                {job.location && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs text-gray-500 uppercase">Localisation</span>
                    </div>
                    <p className="font-semibold text-gray-900 mt-1">{job.location}</p>
                  </div>
                )}
                {job.type && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-xs text-gray-500 uppercase">Type</span>
                    </div>
                    <p className="font-semibold text-gray-900 mt-1">{job.type}</p>
                  </div>
                )}
                {job.salary && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs text-gray-500 uppercase">Salaire</span>
                    </div>
                    <p className="font-semibold text-gray-900 mt-1">{job.salary}</p>
                  </div>
                )}
                {job.deadline && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs text-gray-500 uppercase">Délai</span>
                    </div>
                    <p className="font-semibold text-gray-900 mt-1">
                      {new Date(job.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleApply}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                Postuler à cette offre
              </Button>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos du poste</h2>
              <div className="prose max-w-none text-gray-700">
                {job.description}
              </div>
            </div>

            {/* Career Roadmap */}
            {user && jobId && (
              <CareerRoadmap jobId={Number(jobId)} jobTitle={job.title} />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informations rapides</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Secteur</span>
                  <p className="font-medium text-gray-900">{job.sector || 'Non spécifié'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Publiée il y a</span>
                  <p className="font-medium text-gray-900">
                    {Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24))} jours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
