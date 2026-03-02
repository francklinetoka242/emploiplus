import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronDown, TrendingUp, CheckCircle2, Zap } from "lucide-react";
import { authHeaders } from '@/lib/headers';
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const search = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const q = (search.get('q') || '').toLowerCase().trim();
  const [docsCount, setDocsCount] = useState<number | null>(null);
  const [skillsCount, setSkillsCount] = useState<number | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
  const [jobsPostedCount, setJobsPostedCount] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [showCompletenessDetails, setShowCompletenessDetails] = useState(false);

  // Compute greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    return "Bonsoir";
  };

  // Determine user role
  const userRole = user && String(user.user_type || '').toLowerCase() === 'company' ? 'company' : 'candidate';

  // Compute profile completeness
  const completeness = useMemo(() => {
    if (!profileData) return { percent: 0, missing: [] as string[] };
    const fields: string[] = [];
    const missing: string[] = [];
    
    // Common fields
    if (profileData.full_name || profileData.company_name) fields.push('nom'); else missing.push('nom complet');
    if (profileData.email) fields.push('email'); else missing.push('email');
    if (profileData.profile_image_url) fields.push('photo'); else missing.push('photo');
    if (profileData.phone) fields.push('phone'); else missing.push('téléphone');

    // Role-specific fields
    if (userRole === 'candidate') {
      // Candidate fields
      const candidateFields = [
        { key: 'profession', label: 'profession' },
        { key: 'job_title', label: 'intitulé du poste' },
        { key: 'bio', label: 'biographie' },
        { key: 'skills', label: 'compétences' },
        { key: 'diploma', label: 'diplôme' },
        { key: 'experience_years', label: 'années d\'expérience' },
        { key: 'contract_type', label: 'type de contrat' },
        { key: 'availability', label: 'disponibilité' },
      ];
      for (const f of candidateFields) {
        if (profileData[f.key]) fields.push(f.key); else missing.push(f.label);
      }
    } else if (userRole === 'company') {
      // Company fields
      const companyFields = [
        { key: 'company_name', label: 'nom de l\'entreprise' },
        { key: 'sector', label: 'secteur d\'activité' },
        { key: 'company_size', label: 'taille de l\'entreprise' },
        { key: 'company_address', label: 'adresse' },
        { key: 'website', label: 'site web' },
        { key: 'description', label: 'description' },
        { key: 'mission', label: 'mission' },
        { key: 'values', label: 'valeurs' },
      ];
      for (const f of companyFields) {
        if (profileData[f.key]) fields.push(f.key); else missing.push(f.label);
      }
    }

    // Build percent
    const totalRequired = fields.length + missing.length;
    const filled = fields.length;
    const percent = totalRequired > 0 ? Math.round((filled / totalRequired) * 100) : 0;
    return { percent, missing };
  }, [profileData, userRole]);

  useEffect(() => {
    if (loading) return;

    // fetch user profile for completeness
    (async () => {
      try {
        const headers: Record<string,string> = authHeaders('application/json');
        const res = await fetch('/api/users/me', { headers });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (e) {
        console.warn('Profile fetch error', e);
      }
    })();

    // fetch user documents
    (async () => {
      try {
        const headers: Record<string,string> = authHeaders('application/json');
        const docsRes = await fetch('/api/user-documents', { headers });
        if (docsRes.ok) {
          const docs = await docsRes.json();
          setDocsCount(Array.isArray(docs) ? docs.length : 0);
        } else {
          setDocsCount(0);
        }

        const skillsRes = await fetch('/api/user-skills', { headers });
        if (skillsRes.ok) {
          const skills = await skillsRes.json();
          setSkillsCount(Array.isArray(skills) ? skills.length : 0);
        } else {
          setSkillsCount(0);
        }

        // If candidate: job applications count
        if (userRole === 'candidate') {
          const appsRes = await fetch('/api/applications?user_id=' + user?.id, { headers });
          if (appsRes.ok) {
            const apps = await appsRes.json();
            setApplicationsCount(Array.isArray(apps) ? apps.length : 0);
          } else setApplicationsCount(0);
        }

        // If company: jobs posted count by this company
        if (userRole === 'company') {
          const jobsRes = await fetch('/api/jobs', { headers });
          if (jobsRes.ok) {
            const jobs = await jobsRes.json();
            const companyName = String(user?.company_name || '').toLowerCase();
            const posted = Array.isArray(jobs)
              ? jobs.filter((j) => (j.company || '').toLowerCase().includes(companyName)).length
              : 0;
            setJobsPostedCount(posted);
          } else setJobsPostedCount(0);
        }
      } catch (e) {
        console.warn('Dashboard fetch error', e);
        setDocsCount(0);
        setSkillsCount(0);
        setApplicationsCount(0);
        setJobsPostedCount(0);
      }
    })();
  }, [loading, user, userRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const showCard = (label: string) => {
    if (!q) return true;
    return label.toLowerCase().includes(q);
  };

  return (
    <div>
      {/* SECTION 1: Greeting card at the top */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">{getGreeting()}, {userRole === 'company' ? profileData?.company_name || user?.company_name : user?.full_name}! 👋</h2>
        <p className="text-muted-foreground">
          {userRole === 'candidate' 
            ? 'Bienvenue sur votre tableau de bord. Gérez votre profil, vos candidatures et vos documents depuis le menu à gauche.'
            : 'Bienvenue sur votre tableau de bord. Publiez des offres, gérez vos candidats et contrôlez votre entreprise depuis le menu à gauche.'}
        </p>
      </Card>

      {/* SECTION 2: Profile completeness with expandable details */}
      <Card className="p-6 mb-6 border-l-4 border-l-blue-500">
        <div className="flex flex-col gap-4">
          {/* Titre et bouton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground font-medium">Score de profil</div>
              <div className="text-2xl font-bold">Votre profil est complété à <span className="text-blue-600">{completeness.percent}%</span></div>
            </div>
            <button
              onClick={() => setShowCompletenessDetails(!showCompletenessDetails)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Voir les détails"
            >
              <ChevronDown 
                size={24} 
                className={`transition-transform ${showCompletenessDetails ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Barre de progression réduite */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${completeness.percent}%` }}
            />
          </div>

          {/* Messages d'encouragement */}
          {completeness.percent >= 50 && completeness.percent < 65 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">💡 Vous y êtes presque ! Il ne reste que quelques informations à compléter pour optimiser votre profil.</p>
            </div>
          )}

          {completeness.percent >= 75 && completeness.percent < 100 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">🚀 Vous y êtes presque ! Finalisez votre profil pour atteindre la perfection !</p>
            </div>
          )}

          {completeness.percent === 100 && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl animate-bounce">🎉</span>
                <p className="text-lg font-bold text-green-700">Félicitations !</p>
              </div>
              <p className="text-sm text-green-700">Votre profil est 100% complet. Vous êtes prêt(e) à conquérir le marché du travail !</p>
            </div>
          )}

          {/* Expandable details section */}
          {showCompletenessDetails && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3 text-lg">Détails de complétude</h4>
              
              {/* Missing fields with suggestions */}
              {completeness.missing.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-orange-700 mb-3 flex items-center gap-2">
                    <Zap size={16} /> Éléments manquants ({completeness.missing.length})
                  </h5>
                  <div className="space-y-2">
                    {completeness.missing.map((missing, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition">
                        <span className="text-sm text-gray-700 capitalize">{missing}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-orange-100 hover:bg-orange-200 border-orange-300"
                          onClick={() => {
                            // Mapping des éléments manquants aux bonnes pages/sections
                            const missingLower = missing.toLowerCase();
                            
                            if (userRole === 'candidate') {
                              // Candidat
                              if (missingLower.includes('photo') || missingLower.includes('nom') || missingLower.includes('email') || missingLower.includes('téléphone') || missingLower.includes('naissance') || missingLower.includes('genre') || missingLower.includes('ville') || missingLower.includes('linkedin')) {
                                window.location.href = '/parametres/profil';
                              } else if (missingLower.includes('profession') || missingLower.includes('titre') || missingLower.includes('biographie') || missingLower.includes('compétence')) {
                                window.location.href = '/parametres/profil';
                              } else if (missingLower.includes('diplôme') || missingLower.includes('expérience') || missingLower.includes('contrat') || missingLower.includes('disponibilité') || missingLower.includes('salaire')) {
                                window.location.href = '/parametres/informations';
                              }
                            } else if (userRole === 'company') {
                              // Entreprise
                              if (missingLower.includes('photo') || missingLower.includes('logo')) {
                                window.location.href = '/parametres/profil';
                              } else if (missingLower.includes('nom') || missingLower.includes('email') || missingLower.includes('secteur') || missingLower.includes('taille') || missingLower.includes('description') || missingLower.includes('mission') || missingLower.includes('valeur')) {
                                window.location.href = '/parametres/profil';
                              } else if (missingLower.includes('site') || missingLower.includes('adresse') || missingLower.includes('localisation')) {
                                window.location.href = '/parametres/localisation';
                              } else if (missingLower.includes('bénéfice') || missingLower.includes('avantage')) {
                                window.location.href = '/parametres/profil';
                              }
                            }
                          }}
                        >
                          Remplir
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completeness.percent === 100 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-300 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-600" />
                  <p className="text-sm text-green-700 font-medium">Votre profil est 100% complet !</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de votre profil et vos statistiques</p>
        </div>
        <div className="space-x-2">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/parametres">⚙️ Gérer mon compte</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Résumé des paramètres */}
        {showCard('Profil') && (
          <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Profil</h3>
                <p className="text-lg font-bold truncate">{userRole === 'company' ? (profileData?.company_name || user?.company_name || '—') : (user?.full_name || '—')}</p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div>Type: <span className="font-semibold text-gray-700">{userRole === 'company' ? 'Entreprise' : 'Candidat'}</span></div>
                  <div>Statut: <span className={`font-semibold ${user?.is_verified ? 'text-green-600' : 'text-orange-600'}`}>{user?.is_verified ? '✓ Certifié' : '⊘ Non certifié'}</span></div>
                </div>
              </div>
              <div className="text-2xl">{userRole === 'company' ? '🏢' : '👤'}</div>
            </div>
          </Card>
        )}

        {/* Documents */}
        {showCard('Documents') && (
          <Card className="p-6 border-l-4 border-l-green-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Documents</h3>
                <div className="text-4xl font-bold text-green-600">{docsCount ?? '—'}</div>
                <p className="text-xs text-muted-foreground mt-2">fichiers téléchargés</p>
              </div>
              <div className="text-3xl">📄</div>
            </div>
          </Card>
        )}

        {/* Compétences */}
        {showCard('Compétences') && (
          <Card className="p-6 border-l-4 border-l-purple-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Compétences</h3>
                <div className="text-4xl font-bold text-purple-600">{skillsCount ?? '—'}</div>
                <p className="text-xs text-muted-foreground mt-2">compétences listées</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </Card>
        )}

        {/* Candidatures (Candidats) */}
        {showCard('Candidatures') && userRole === 'candidate' && (
          <Card className="p-6 border-l-4 border-l-orange-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Candidatures</h3>
                <div className="text-4xl font-bold text-orange-600">{applicationsCount ?? '—'}</div>
                <p className="text-xs text-muted-foreground mt-2">offres candidates</p>
              </div>
              <div className="text-3xl">📨</div>
            </div>
          </Card>
        )}

        {/* Offres publiées (Entreprises) */}
        {showCard('Offres') && userRole === 'company' && (
          <Card className="p-6 border-l-4 border-l-red-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Offres publiées</h3>
                <div className="text-4xl font-bold text-red-600">{jobsPostedCount ?? '—'}</div>
                <p className="text-xs text-muted-foreground mt-2">offres créées</p>
              </div>
              <div className="text-3xl">📢</div>
            </div>
          </Card>
        )}
      </div>

      {/* Actions rapides et suggestions */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suggestions pour candidat */}
        {userRole === 'candidate' && (
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap size={20} /> Suggestions pour vous
            </h3>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/emplois">🔍 Découvrir les offres d'emploi</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/parametres/profil">✏️ Mettre à jour votre profil</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/documents">📁 Gérer vos documents</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Suggestions pour entreprise */}
        {userRole === 'company' && (
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} /> Actions rapides
            </h3>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/recrutement">➕ Publier une nouvelle offre</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/candidats">👥 Voir les candidats</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/parametres/profil">🏢 Mettre à jour le profil entreprise</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Dernier statut */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="text-lg font-bold mb-3">📊 Statut du compte</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complétude:</span>
              <span className="font-semibold text-blue-600">{completeness.percent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vérification:</span>
              <span className={`font-semibold ${user?.is_verified ? 'text-green-600' : 'text-orange-600'}`}>
                {user?.is_verified ? 'Certifié ✓' : 'En attente'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Création compte:</span>
              <span className="font-semibold">{new Date(user?.created_at as string).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
