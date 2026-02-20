import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfanityFilter } from '@/hooks/useProfanityFilter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ProfanityWarningModal } from '@/components/ui/ProfanityWarningModal';
import { Trash2, Edit2, X, Check } from 'lucide-react';
import Icon from '@/components/Icon';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authHeaders, buildApiUrl } from '@/lib/headers';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Publication {
  id: number;
  author_id: number;
  content: string;
  image_url?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

const MyPublications = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { filterContent, warningCount, isTemporarilySuspended, getRemainingLiftTime } = useProfanityFilter();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [profanityWarningOpen, setProfanityWarningOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<number | null>(null);
  const [blockedWords, setBlockedWords] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMyPublications();
    }
  }, [user]);

  const fetchMyPublications = async () => {
    try {
      setLoading(true);
      const apiUrl = buildApiUrl('/publications');
      const res = await fetch(apiUrl, {
        headers: authHeaders(),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}: Erreur serveur`);
      }
      
      const data = await res.json();
      // Handle both direct array and wrapped response
      const publicationsArray = Array.isArray(data) ? data : data.publications || [];
      // Filter to show only current user's publications
      const userPublications = publicationsArray.filter((p: Publication) => p.author_id === user?.id);
      setPublications(userPublications);
    } catch (error) {
      const err = error as Error;
      console.error("Erreur chargement publications:", err);
      toast.error(err.message || "Erreur lors du chargement des publications");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingId(publication.id);
    setEditContent(publication.content);
  };

  const handleSaveEdit = async (publicationId: number) => {
    // Vérifier le filtre de profanité avant sauvegarde
    const filterResult = filterContent(editContent);
    if (filterResult.isBlocked) {
      setPendingEditId(publicationId);
      setBlockedWords(filterResult.triggeredWords);
      setProfanityWarningOpen(true);
      return;
    }

    try {
      const apiUrl = buildApiUrl(`/publications/${publicationId}`);
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          content: editContent,
          visibility: 'public',
        }),
      });

      if (!res.ok) throw new Error('Erreur modification publication');

      setEditingId(null);
      setEditContent("");
      toast.success("Publication modifiée avec succès");
      await fetchMyPublications();
    } catch (error) {
      console.error("Erreur modification:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async (publicationId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publication?")) {
      return;
    }

    try {
      const apiUrl = buildApiUrl(`/publications/${publicationId}`);
      const res = await fetch(apiUrl, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error('Erreur suppression publication');

      toast.success("Publication supprimée avec succès");
      await fetchMyPublications();
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleProfanityWarningModify = () => {
    setProfanityWarningOpen(false);
    // Le contenu reste dans la textarea pour édition
  };

  const handleProfanityWarningCancel = () => {
    setProfanityWarningOpen(false);
    setEditContent("");
    setPendingEditId(null);
    setBlockedWords([]);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-8">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mes Publications</h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/fil-actualite')}
          >
            Retour au fil
          </Button>
        </div>

        {publications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Vous n'avez pas encore de publications</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/fil-actualite')}
            >
              Créer une publication
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {publications.map((pub) => (
              <Card key={pub.id} className="p-6">
                {editingId === pub.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Modifiez votre publication..."
                      className="min-h-24"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(pub.id)}
                        className="gap-2"
                      >
                        <Check size={16} />
                        Enregistrer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm mb-3">
                      {formatDistanceToNow(new Date(pub.created_at), { 
                        addSuffix: true,
                        locale: fr 
                      })}
                    </p>
                    <p className="text-gray-800 mb-4">{pub.content}</p>
                    
                    {pub.image_url && (
                      <img 
                        src={pub.image_url} 
                        alt="Publication"
                        className="w-full max-h-96 object-cover rounded mb-4"
                      />
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <span className="inline-flex items-center gap-1"><Icon name="Heart" size={16} /> {pub.likes_count || 0}</span>
                      <span className="inline-flex items-center gap-1"><Icon name="MessageCircle" size={16} /> {pub.comments_count || 0}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(pub)}
                        className="gap-2"
                      >
                        <Edit2 size={16} />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(pub.id)}
                        className="gap-2"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modale d'avertissement de contenu profane */}
      <ProfanityWarningModal
        isOpen={profanityWarningOpen}
        onModify={handleProfanityWarningModify}
        onCancel={handleProfanityWarningCancel}
        triggeredWords={blockedWords}
        warningCount={warningCount}
        isTemporarilySuspended={isTemporarilySuspended}
        remainingTime={getRemainingLiftTime()}
      />
    </div>
  );
};

export default MyPublications;
