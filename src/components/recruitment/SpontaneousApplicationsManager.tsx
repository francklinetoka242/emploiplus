import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  Trash2,
} from 'lucide-react';
import { authHeaders } from '@/lib/headers';
import { toast } from 'sonner';

interface SpontaneousApplication {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  application_type: 'with_profile' | 'manual';
  message: string;
  position?: string;
  status: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'archived';
  created_at: string;
  cv_file_path?: string;
  letter_file_path?: string;
  profile_data_json?: string;
}

interface SpontaneousApplicationsProps {
  companyId: string;
}

export const SpontaneousApplications = ({ companyId }: SpontaneousApplicationsProps) => {
  const [applications, setApplications] = useState<SpontaneousApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<SpontaneousApplication | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Filtres
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExperienceLevel, setFilterExperienceLevel] = useState<string>('all');
  const [filterApplicationType, setFilterApplicationType] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, [companyId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/spontaneous?company_id=${companyId}`, {
        headers: authHeaders(''),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const res = await fetch(
        `/api/applications/spontaneous/${applicationId}`,
        {
          method: 'PATCH',
          headers: authHeaders('application/json'),
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        toast.success('Statut mis à jour');
        setApplications(
          applications.map((app) =>
            app.id === applicationId
              ? { ...app, status: newStatus as any }
              : app
          )
        );
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Erreur serveur');
    }
  };

  const downloadFile = async (filePath: string, filename: string) => {
    try {
      window.location.href = `/api/downloads${filePath}`;
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      return;
    }

    try {
      const res = await fetch(
        `/api/applications/spontaneous/${applicationId}`,
        {
          method: 'DELETE',
          headers: authHeaders(''),
        }
      );

      if (res.ok) {
        toast.success('Candidature supprimée');
        setApplications(
          applications.filter((app) => app.id !== applicationId)
        );
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      toast.error('Erreur serveur');
    }
  };

  // Filtrer les applications
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesType =
      filterApplicationType === 'all' ||
      app.application_type === filterApplicationType;
    const matchesSearch =
      searchText === '' ||
      app.applicant_name
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      app.applicant_email.toLowerCase().includes(searchText.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      viewed: { label: 'Consultée', color: 'bg-blue-100 text-blue-800' },
      accepted: { label: 'À contacter', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Refusée', color: 'bg-red-100 text-red-800' },
      archived: { label: 'Archivée', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des candidatures...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Candidatures Spontanées</h2>
          <span className="text-sm text-gray-600">
            {filteredApplications.length} candidature
            {filteredApplications.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Barre de recherche */}
        <Input
          placeholder="Rechercher par nom ou email..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full"
        />

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="viewed">Consultée</option>
              <option value="accepted">À contacter</option>
              <option value="rejected">Refusée</option>
              <option value="archived">Archivée</option>
            </select>
          </div>

          {/* Filtre par type */}
          <div>
            <label className="block text-sm font-medium mb-1">Type de candidature</label>
            <select
              value={filterApplicationType}
              onChange={(e) => setFilterApplicationType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les types</option>
              <option value="with_profile">Avec profil</option>
              <option value="manual">Formulaire manuel</option>
            </select>
          </div>

          {/* Filtre par date */}
          <div>
            <label className="block text-sm font-medium mb-1">Période</label>
            <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">Tous les jours</option>
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="90days">90 derniers jours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des candidatures */}
      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Aucune candidature trouvée</p>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id} className="p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                {/* Infos candidat */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      {app.applicant_name}
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {app.applicant_email}
                  </p>
                  {app.applicant_phone && (
                    <p className="text-sm text-gray-600">{app.applicant_phone}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>📅 {new Date(app.created_at).toLocaleDateString('fr-FR')}</span>
                    <span>
                      {app.application_type === 'with_profile'
                        ? '📄 Avec profil'
                        : '📝 Formulaire'}
                    </span>
                    {app.position && <span>💼 {app.position}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 items-start">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedApp(app);
                      setShowDetail(true);
                    }}
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Voir
                  </Button>

                  {/* Download CV */}
                  {app.cv_file_path && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        downloadFile(app.cv_file_path || '', 'CV')
                      }
                      className="gap-1"
                    >
                      <Download className="h-4 w-4" />
                      CV
                    </Button>
                  )}

                  {/* Download Lettre */}
                  {app.letter_file_path && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        downloadFile(
                          app.letter_file_path || '',
                          'Lettre'
                        )
                      }
                      className="gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Lettre
                    </Button>
                  )}

                  {/* Status Change Menu */}
                  <select
                    value={app.status}
                    onChange={(e) =>
                      updateApplicationStatus(app.id, e.target.value)
                    }
                    className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="viewed">Consultée</option>
                    <option value="accepted">À contacter</option>
                    <option value="rejected">Refusée</option>
                    <option value="archived">Archivée</option>
                  </select>

                  {/* Delete */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteApplication(app.id)}
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de détail */}
      {showDetail && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{selectedApp.applicant_name}</h3>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedApp(null);
                }}
                className="text-2xl font-bold text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Infos personnelles */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedApp.applicant_email}</p>
                </div>
                {selectedApp.applicant_phone && (
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium">{selectedApp.applicant_phone}</p>
                  </div>
                )}
                {selectedApp.position && (
                  <div>
                    <p className="text-sm text-gray-600">Poste recherché</p>
                    <p className="font-medium">{selectedApp.position}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Date de candidature</p>
                  <p className="font-medium">
                    {new Date(selectedApp.created_at).toLocaleDateString(
                      'fr-FR'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Message d'introduction
                </p>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedApp.message}
                </p>
              </div>

              {/* Profil (si candidature avec profil) */}
              {selectedApp.profile_data_json && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Profil du candidat
                  </p>
                  <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-48">
                    {selectedApp.profile_data_json}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    updateApplicationStatus(selectedApp.id, 'accepted');
                    setShowDetail(false);
                    setSelectedApp(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  À contacter
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    updateApplicationStatus(selectedApp.id, 'viewed');
                    setShowDetail(false);
                    setSelectedApp(null);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Entretien en cours
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => {
                    updateApplicationStatus(selectedApp.id, 'rejected');
                    setShowDetail(false);
                    setSelectedApp(null);
                  }}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => {
                    updateApplicationStatus(selectedApp.id, 'archived');
                    setShowDetail(false);
                    setSelectedApp(null);
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archiver
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
