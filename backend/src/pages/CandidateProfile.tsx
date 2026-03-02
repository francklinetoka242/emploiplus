import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authHeaders, buildApiUrl } from '@/lib/headers';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Briefcase, Download, MessageSquare, Star, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Skill {
  id: number;
  skill_name: string;
  category?: string;
}

interface Document {
  id: number;
  doc_type: string;
  storage_url: string;
}

interface CandidateData {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  profession?: string;
  job_title?: string;
  company?: string;
  company_id?: number;
  profile_image_url?: string;
  bio?: string;
  description?: string;
  experience_years?: number;
  diploma?: string;
  skills: Skill[];
  documents: Document[];
}

export default function CandidateProfilePage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [suggestedCandidates, setSuggestedCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    fetchCandidateProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const fetchCandidateProfile = async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      // Fetch candidate profile
      const res = await fetch(buildApiUrl(`/users/${candidateId}`), { headers: authHeaders() });
      if (!res.ok) throw new Error('Candidat non trouvé');
      const data: CandidateData = await res.json();
      setCandidate(data);

      // Record profile visit
      try {
        await fetch(buildApiUrl(`/users/${candidateId}/visit`), {
          method: 'POST',
          headers: authHeaders('application/json'),
        });
      } catch (visitError) {
        console.warn('Could not record visit:', visitError);
      }

      // Fetch suggested candidates
      const suggestedRes = await fetch(buildApiUrl(`/candidates/suggested?limit=5&excludeId=${candidateId}`), { headers: authHeaders() });
      if (suggestedRes.ok) {
        const suggestedData = await suggestedRes.json();
        setSuggestedCandidates(Array.isArray(suggestedData) ? suggestedData : []);
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
      toast.error('Impossible de charger le profil du candidat');
    } finally {
      setLoading(false);
    }
  };

  const handleContactCandidate = async () => {
    try {
      // Navigate to messaging/contact
      navigate(`/messages/${candidate.id}`);
    } catch (error) {
      toast.error('Erreur lors du contact');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const res = await fetch(`/api/favorites/candidates/${candidate.id}`, {
        method,
        headers: authHeaders('application/json'),
      });
      if (res.ok) {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleViewCandidate = (id: number) => {
    navigate(`/candidate/${id}`);
  };

  const handleViewCompany = (companyId?: number) => {
    if (companyId) {
      navigate(`/company/${companyId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Candidat non trouvé</h2>
          <p className="text-gray-600 mb-6">Ce candidat n'existe pas ou a supprimé son profil.</p>
          <Button onClick={() => navigate('/emplois')} className="w-full">
            Retour aux offres
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profil principal */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {/* Header background */}
              <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>

              {/* Profil content */}
              <div className="px-6 pb-6">
                {/* Avatar et info de base */}
                <div className="flex flex-col sm:flex-row gap-6 -mt-16 mb-6">
                  <Avatar className="h-32 w-32 border-4 border-white flex-shrink-0">
                    <AvatarImage src={candidate.profile_image_url} />
                    <AvatarFallback className="text-xl">
                      {(candidate.full_name || "C").split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{candidate.full_name}</h1>
                        {candidate.job_title && (
                          <p className="text-lg text-orange-600 font-semibold mt-1">{candidate.job_title}</p>
                        )}
                        {candidate.company && (
                          <p className="text-gray-600 mt-1 cursor-pointer hover:text-orange-600 font-medium" onClick={() => handleViewCompany(candidate.company_id)}>
                            @ {candidate.company}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleToggleFavorite}
                          variant={isFavorite ? "default" : "outline"}
                          size="sm"
                          className={isFavorite ? "bg-orange-500 hover:bg-orange-600" : ""}
                        >
                          <Star className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                          Favori
                        </Button>
                        <Button
                          onClick={handleContactCandidate}
                          className="bg-orange-500 hover:bg-orange-600"
                          size="sm"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contacter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 py-6 border-y">
                  {candidate.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="text-gray-900 font-medium">{candidate.phone}</p>
                      </div>
                    </div>
                  )}
                  {candidate.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-gray-900 font-medium">{candidate.email}</p>
                      </div>
                    </div>
                  )}
                  {candidate.profession && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600">Profession</p>
                        <p className="text-gray-900 font-medium">{candidate.profession}</p>
                      </div>
                    </div>
                  )}
                  {candidate.experience_years !== undefined && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600">Expérience</p>
                        <p className="text-gray-900 font-medium">{candidate.experience_years} ans</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Poste et Entreprise */}
                {(candidate.job_title || candidate.company) && (
                  <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="space-y-3">
                      {candidate.job_title && (
                        <div className="flex items-start gap-3">
                          <Briefcase className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Poste</p>
                            <p className="text-gray-900 font-semibold">{candidate.job_title}</p>
                          </div>
                        </div>
                      )}
                      {candidate.company && (
                        <div className="flex items-start gap-3">
                          <Briefcase className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Entreprise</p>
                            <p
                              className="text-orange-600 font-semibold cursor-pointer hover:underline"
                              onClick={() => handleViewCompany(candidate.company_id)}
                            >
                              {candidate.company}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Résumé professionnel */}
                {candidate.bio && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">💼 Résumé professionnel</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{candidate.bio}</p>
                  </div>
                )}

                {/* Compétences */}
                {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Compétences</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill: Skill, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                          {skill.skill_name || skill.id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {candidate.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">À propos</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{candidate.description}</p>
                  </div>
                )}

                {/* Diplôme */}
                {candidate.diploma && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Formation</h3>
                    <Badge variant="outline" className="border-orange-300 text-orange-900">
                      {candidate.diploma}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Candidats suggérés */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Autres candidats</h3>

              {suggestedCandidates.length > 0 ? (
                <div className="space-y-4">
                  {suggestedCandidates.map((sugg) => (
                    <div
                      key={sugg.id}
                      className="p-4 border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer"
                      onClick={() => handleViewCandidate(sugg.id)}
                    >
                      <div className="flex gap-3 mb-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={sugg.profile_image_url} />
                          <AvatarFallback>
                            {(sugg.full_name || "C").split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{sugg.full_name}</p>
                          <p className="text-sm text-orange-600 truncate">{sugg.profession || sugg.job_title}</p>
                        </div>
                      </div>
                      {sugg.skills && Array.isArray(sugg.skills) && sugg.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sugg.skills.slice(0, 2).map((skill: Skill, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                              {skill.skill_name || skill.id}
                            </Badge>
                          ))}
                          {sugg.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                              +{sugg.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun autre candidat disponible</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
