import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
} from 'lucide-react';
import { authHeaders } from '@/lib/headers';
import { toast } from 'sonner';

interface MyCandidature {
  id: string;
  company_id: string;
  company_name?: string;
  application_type: 'with_profile' | 'manual' | 'job_offer';
  job_title?: string;
  status: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'archived';
  created_at: string;
  updated_at?: string;
  response_message?: string;
  message?: string;
  position?: string;
  cv_file_path?: string;
  letter_file_path?: string;
}

export const MyCandidatures = () => {
  const [candidatures, setCandidatures] = useState<MyCandidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidature, setSelectedCandidature] = useState<MyCandidature | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    fetchCandidatures();
  }, []);

  const fetchCandidatures = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/candidatures/my-candidatures', {
        headers: authHeaders(''),
      });
      if (res.ok) {
        const data = await res.json();
        setCandidatures(Array.isArray(data) ? data : data.data || []);
      } else {
        toast.error('Erreur lors du chargement des candidatures');
      }
    } catch (err) {
      console.error('Error fetching candidatures:', err);
      toast.error('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidatures = candidatures.filter((cand) => {
    const matchesStatus = filterStatus === 'all' || cand.status === filterStatus;
    const matchesType = filterType === 'all' || cand.application_type === filterType;
    const matchesSearch =
      searchText === '' ||
      (cand.company_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (cand.job_title || '').toLowerCase().includes(searchText.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusConfig = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      pending: {
        label: 'En attente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="h-4 w-4" />,
      },
      viewed: {
        label: 'Consultée',
        color: 'bg-blue-100 text-blue-800',
        icon: <Eye className="h-4 w-4" />,
      },
      accepted: {
        label: 'À contacter',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      rejected: {
        label: 'Refusée',
        color: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="h-4 w-4" />,
      },
      archived: {
        label: 'Archivée',
        color: 'bg-gray-100 text-gray-800',
        icon: <Archive className="h-4 w-4" />,
      },
    };
    return config[status] || config.pending;
  };

  const getApplicationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      with_profile: '📄 Candidature avec profil',
      manual: '📝 Formulaire manuel',
      job_offer: '💼 Réponse à une offre',
    };
    return types[type] || type;
  };

  const calculateDaysAgo = (date: string) => {
    const now = new Date();
    const createdDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  };

  if (loading) {
    return <div className="text-center py-12">Chargement de vos candidatures...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Mes Candidatures</h2>
          <span className="text-sm text-gray-600">
            {filteredCandidatures.length} candidature
            {filteredCandidatures.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {candidatures.length}
            </p>
            <p className="text-xs text-gray-600">Total</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {candidatures.filter((c) => c.status === 'pending').length}
            </p>
            <p className="text-xs text-gray-600">En attente</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {candidatures.filter((c) => c.status === 'viewed').length}
            </p>
            <p className="text-xs text-gray-600">Consultées</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {candidatures.filter((c) => c.status === 'accepted').length}
            </p>
            <p className="text-xs text-gray-600">À contacter</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {candidatures.filter((c) => c.status === 'rejected').length}
            </p>
            <p className="text-xs text-gray-600">Refusées</p>
          </Card>
        </div>

        {/* Filtres */}
        <div className="space-y-3">
          <Input
            placeholder="Rechercher par entreprise ou poste..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="viewed">Consultée</option>
              <option value="accepted">À contacter</option>
              <option value="rejected">Refusée</option>
              <option value="archived">Archivée</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les types</option>
              <option value="with_profile">Candidature avec profil</option>
              <option value="manual">Formulaire manuel</option>
              <option value="job_offer">Réponse à offre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des candidatures */}
      <div className="space-y-3">
        {filteredCandidatures.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">Aucune candidature trouvée</p>
            <Button variant="outline">Voir les offres disponibles</Button>
          </Card>
        ) : (
          filteredCandidatures.map((cand) => {
            const statusConfig = getStatusConfig(cand.status);
            return (
              <Card
                key={cand.id}
                className="p-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => {
                  setSelectedCandidature(cand);
                  setShowDetail(true);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Infos candidature */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {cand.company_name || 'Candidature'}
                      </h3>
                      <Badge className={statusConfig.color}>
                        {statusConfig.icon}
                        <span className="ml-1">{statusConfig.label}</span>
                      </Badge>
                    </div>

                    {cand.job_title && (
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        {cand.job_title}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{calculateDaysAgo(cand.created_at)}</span>
                      <span>{getApplicationTypeLabel(cand.application_type)}</span>
                      {cand.position && <span>💼 {cand.position}</span>}
                    </div>

                    {/* Progression */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            cand.status === 'rejected'
                              ? 'bg-red-500'
                              : cand.status === 'accepted'
                                ? 'bg-green-500'
                                : cand.status === 'viewed'
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                          }`}
                          style={{
                            width:
                              cand.status === 'pending'
                                ? '25%'
                                : cand.status === 'viewed'
                                  ? '50%'
                                  : cand.status === 'accepted'
                                    ? '75%'
                                    : '100%',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bouton de détail */}
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCandidature(cand);
                      setShowDetail(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de détail */}
      {showDetail && selectedCandidature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold">
                  {selectedCandidature.company_name}
                </h3>
                {selectedCandidature.job_title && (
                  <p className="text-gray-600 mt-1">
                    {selectedCandidature.job_title}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedCandidature(null);
                }}
                className="text-2xl font-bold text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Statut */}
              <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Statut actuel</p>
                <Badge className={getStatusConfig(selectedCandidature.status).color}>
                  {getStatusConfig(selectedCandidature.status).icon}
                  <span className="ml-2">
                    {getStatusConfig(selectedCandidature.status).label}
                  </span>
                </Badge>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600">Chronologie</p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-orange-500" />
                    <div>
                      <p className="font-medium">Candidature envoyée</p>
                      <p className="text-xs text-gray-600">
                        {new Date(
                          selectedCandidature.created_at
                        ).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {selectedCandidature.status !== 'pending' && (
                    <div className="flex gap-3">
                      <div
                        className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                          selectedCandidature.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-green-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium">
                          {selectedCandidature.status === 'rejected'
                            ? 'Candidature refusée'
                            : selectedCandidature.status === 'accepted'
                              ? 'Marquée à contacter'
                              : 'Candidature consultée'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {selectedCandidature.updated_at
                            ? new Date(
                                selectedCandidature.updated_at
                              ).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Récemment'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message d'introduction */}
              {selectedCandidature.message && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Votre message
                  </p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedCandidature.message}
                  </p>
                </div>
              )}

              {/* Réponse du recruteur */}
              {selectedCandidature.response_message && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Réponse de l'entreprise
                  </p>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 whitespace-pre-wrap">
                    {selectedCandidature.response_message}
                  </p>
                </div>
              )}

              {/* Documents */}
              {(selectedCandidature.cv_file_path ||
                selectedCandidature.letter_file_path) && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Documents envoyés
                  </p>
                  <div className="flex gap-2">
                    {selectedCandidature.cv_file_path && (
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        CV
                      </Button>
                    )}
                    {selectedCandidature.letter_file_path && (
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        Lettre
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Bouton fermeture */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedCandidature(null);
                  }}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
