import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Briefcase, MapPin, Globe, Phone, Mail, X, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { authHeaders } from '@/lib/headers';

export default function CompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobSort, setJobSort] = useState<'recent' | 'oldest' | 'alphabetic'>('recent');

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        if (!mounted) return;
        setCompany(data);

        // Fetch all companies for the sidebar
        const companiesRes = await fetch('/api/users');
        if (companiesRes.ok) {
          const allUsers = await companiesRes.json();
          const comps = Array.isArray(allUsers) 
            ? allUsers.filter((u: any) => String(u.user_type).toLowerCase() === 'company')
            : [];
          if (mounted) setCompanies(comps);
        }

        // Fetch job offers for this company
        setJobsLoading(true);
        const jobsRes = await fetch(`/api/jobs?company_id=${id}`);
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (mounted) setJobs(Array.isArray(jobsData) ? jobsData : []);
        }
      } catch (e) {
        setCompany(null);
      } finally { 
        setLoading(false);
        setJobsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const getCompanyInitials = (name: string) => {
    return String(name || '').split(/\s+/).slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
  };

  // Vérifier si une info est publique
  const isPublic = (field: string): boolean => {
    const publicSettings = company?.public_settings || {};
    // Logo et nom toujours publics
    if (field === 'company_logo' || field === 'company_name') return true;
    return publicSettings[field] !== false;
  };

  // Trier les offres d'emploi
  const getSortedJobs = () => {
    let sorted = [...jobs];
    if (jobSort === 'recent') {
      sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else if (jobSort === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    } else if (jobSort === 'alphabetic') {
      sorted.sort((a, b) => (a.job_title || '').localeCompare(b.job_title || ''));
    }
    return sorted;
  };

  if (loading) return <div className="container py-12">Chargement…</div>;
  if (!company) return <div className="container py-12">Entreprise introuvable.</div>;

  const sections = [
    { id: 'jobs', label: '💼 Offres d\'emploi', visible: jobs.length > 0 },
    { id: 'sector', label: '🏭 Secteur d\'activité', visible: isPublic('sector') && company.sector },
    { id: 'about', label: '📝 À propos', visible: isPublic('description') && company.description },
    { id: 'mission', label: '🎯 Mission', visible: isPublic('mission') && company.mission },
    { id: 'values', label: '⭐ Valeurs', visible: isPublic('values') && company.values },
    { id: 'benefits', label: '🎁 Avantages', visible: isPublic('benefits') && company.benefits },
    { id: 'size', label: '👥 Taille', visible: isPublic('company_size') && company.company_size },
    { id: 'location', label: '📍 Localisation', visible: isPublic('headquarters') && company.city },
    { id: 'contact', label: '📞 Contact', visible: (isPublic('phone') && company.phone) || (isPublic('email') && company.company_email) || (isPublic('website') && company.website) },
  ].filter(s => s.visible);

  const infoSections = [
  ].filter(s => s.visible);

  const sortedJobs = getSortedJobs();

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Contenu principal - 3 colonnes */}
        <div className="lg:col-span-3 space-y-6">
          {/* En-tête avec photo et infos principales */}
          <Card className="p-6">
            {/* Logo et photo alignés sur la même ligne */}
            <div className="flex gap-6 items-start mb-6">
              {/* Avatar de l'entreprise */}
              <div className="shrink-0">
                {company.profile_image_url ? (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={company.profile_image_url} />
                    <AvatarFallback className="text-xl font-bold">
                      {getCompanyInitials(company.company_name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                      {getCompanyInitials(company.company_name || '?')}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Infos principales */}
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{company.company_name}</h1>
                  {/* Statut de certification */}
                  {company.is_verified ? (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                      <CheckCircle className="h-4 w-4" />
                      Certifié
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      Non Certifié
                    </div>
                  )}
                </div>
                
                {isPublic('sector') && company.sector && (
                  <div className="text-sm text-primary font-semibold mb-2">{company.sector}</div>
                )}
                
                {isPublic('company_size') && company.company_size && (
                  <div className="text-xs text-muted-foreground mb-2">👥 {company.company_size}</div>
                )}
                
                {/* Localisation */}
                {isPublic('headquarters') && company.city && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" /> {company.city}
                  </div>
                )}

                {/* Contact & Candidature Spontanée */}
                <div className="flex gap-3 flex-wrap text-xs items-center">
                  {isPublic('website') && company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Globe className="h-3 w-3" /> Site web
                    </a>
                  )}
                  {isPublic('phone') && company.phone && (
                    <a href={`tel:${company.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Phone className="h-3 w-3" /> Appeler
                    </a>
                  )}
                  {isPublic('email') && company.company_email && (
                    <a href={`mailto:${company.company_email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Mail className="h-3 w-3" /> Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons d'action - Candidature Spontanée + Sections */}
            <div className="flex flex-wrap gap-2 mt-6 border-t pt-6">
              {/* Bouton Candidature Spontanée */}
              <Button
                onClick={() => navigate(`/spontaneous-application/${id}`)}
                className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
              >
                <Send className="h-4 w-4" />
                Candidature Spontanée
              </Button>
              
              {/* Sections */}
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'default' : 'outline'}
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className="whitespace-nowrap"
                >
                  {section.label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Carte de contenu dynamique */}
          {activeSection && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                <button
                  onClick={() => setActiveSection(null)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Offres d'emploi */}
              {activeSection === 'jobs' && (
                <div className="space-y-4">
                  {/* Filtres de tri */}
                  <div className="flex gap-2 pb-4 border-b">
                    <button
                      onClick={() => setJobSort('recent')}
                      className={`px-4 py-2 rounded text-sm font-medium transition ${
                        jobSort === 'recent'
                          ? 'bg-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      Plus récent
                    </button>
                    <button
                      onClick={() => setJobSort('oldest')}
                      className={`px-4 py-2 rounded text-sm font-medium transition ${
                        jobSort === 'oldest'
                          ? 'bg-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      Plus ancien
                    </button>
                    <button
                      onClick={() => setJobSort('alphabetic')}
                      className={`px-4 py-2 rounded text-sm font-medium transition ${
                        jobSort === 'alphabetic'
                          ? 'bg-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      Alphabétique
                    </button>
                  </div>

                  {/* Liste des offres */}
                  <div className="space-y-3">
                    {jobsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Chargement des offres...</div>
                    ) : sortedJobs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">Aucune offre d'emploi</div>
                    ) : (
                      sortedJobs.map((job) => (
                        <Link
                          key={job.id}
                          to={`/emplois/${job.id}`}
                          className="block p-4 border rounded-lg hover:shadow-md hover:bg-muted/50 transition"
                        >
                          <div className="font-semibold text-lg">{job.job_title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {job.job_type && <span className="mr-3">📋 {job.job_type}</span>}
                            {job.created_at && (
                              <span>
                                📅 {new Date(job.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                          {job.job_description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {job.job_description}
                            </p>
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* À propos */}
              {activeSection === 'about' && (
                <p className="text-gray-700 whitespace-pre-line">{company.description}</p>
              )}

              {/* Mission */}
              {activeSection === 'mission' && (
                <p className="text-gray-700 whitespace-pre-line">{company.mission}</p>
              )}

              {/* Valeurs */}
              {activeSection === 'values' && (
                <p className="text-gray-700 whitespace-pre-line">{company.values}</p>
              )}

              {/* Avantages */}
              {activeSection === 'benefits' && (
                <p className="text-gray-700 whitespace-pre-line">{company.benefits}</p>
              )}

              {/* Secteur d'activité */}
              {activeSection === 'sector' && (
                <div className="space-y-2">
                  <p className="text-gray-700">{company.sector}</p>
                </div>
              )}

              {/* Taille */}
              {activeSection === 'size' && (
                <div className="space-y-2">
                  <p className="text-gray-700">{company.company_size}</p>
                </div>
              )}

              {/* Localisation */}
              {activeSection === 'location' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-gray-700">{company.city}</p>
                  </div>
                </div>
              )}

              {/* Contact */}
              {activeSection === 'contact' && (
                <div className="space-y-3">
                  {isPublic('website') && company.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary shrink-0" />
                      <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                        {company.website}
                      </a>
                    </div>
                  )}
                  {isPublic('phone') && company.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <a href={`tel:${company.phone}`} className="text-blue-600 hover:underline">
                        {company.phone}
                      </a>
                    </div>
                  )}
                  {isPublic('email') && company.company_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary shrink-0" />
                      <a href={`mailto:${company.company_email}`} className="text-blue-600 hover:underline break-all">
                        {company.company_email}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar - Autres entreprises - 1 colonne */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-20">
            <h3 className="text-lg font-bold mb-4">Autres entreprises</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {companies.length > 0 ? companies.map((c: any) => (
                <Link 
                  key={c.id}
                  to={`/company/${c.id}`}
                  className="block border rounded-lg overflow-hidden hover:shadow-md transition hover:bg-muted/50"
                >
                  <div className="p-3">
                    {/* Avatar et nom */}
                    <div className="flex items-start gap-3 mb-2">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={c.profile_image_url} />
                        <AvatarFallback className="text-xs font-bold">
                          {getCompanyInitials(c.company_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{c.company_name}</div>
                        {c.sector && <div className="text-xs text-muted-foreground truncate">{c.sector}</div>}
                      </div>
                    </div>

                    {/* Infos supplémentaires */}
                    <div className="text-xs text-muted-foreground space-y-1 pl-15">
                      {c.city && <div>📍 {c.city}</div>}
                      {c.company_size && <div>👥 {c.company_size}</div>}
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucune autre entreprise
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
