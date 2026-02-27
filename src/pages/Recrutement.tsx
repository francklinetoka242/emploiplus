import { useEffect, useState } from "react";
import { authHeaders } from '@/lib/headers';
import { useLocation } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import ConfirmButton from '@/components/ConfirmButton';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload";
import { Briefcase, Edit, Eye, EyeOff, Trash2, Upload, MessageSquare } from "lucide-react";
import { Loader2 } from "lucide-react";
import Icon from '@/components/Icon';
import SearchBar from '@/components/SearchBar';
import { SpontaneousApplications } from "@/components/recruitment/SpontaneousApplicationsManager";

export default function RecrutementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'offers' | 'applications' | 'spontaneous'>('offers');
  const [applications, setApplications] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewAppId, setInterviewAppId] = useState<number | null>(null);
  const [interviewDateTime, setInterviewDateTime] = useState('');
  const [interviewPlace, setInterviewPlace] = useState('');
  const [interviewMessage, setInterviewMessage] = useState('');
  const [interviewTitle, setInterviewTitle] = useState('Convocation entretien');

  // Candidate response modal
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseAppId, setResponseAppId] = useState<number | null>(null);
  const [responseType, setResponseType] = useState<'accept' | 'decline' | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  // Modal détail candidature
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const [form, setForm] = useState<any>({
    title: '',
    company: '',
    location: '',
    sector: '',
    type: 'CDI',
    salary: '',
    description: '',
    application_url: '',
    application_via_emploi: false,
    image: null,
    deadline: '',
  });
  const [search, setSearch] = useState('');
  const location = useLocation();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('search') || params.get('q') || '';
      if (q) setSearch(q);
    } catch (e) {}
  }, [location.search]);

  const displayedJobs = (profile && String(profile.user_type).toLowerCase() === 'company')
    ? // Company users see only their own jobs (published or drafts)
      jobs.filter((j) => {
        try {
          return j.company_id && profile.id && Number(j.company_id) === Number(profile.id);
        } catch (e) { return false; }
      })
    : jobs.filter(j => Boolean(j.published));

  const filteredJobs = displayedJobs.filter((j) => {
    if (!search) return true;
    const q = String(search).toLowerCase();
    return ((j.title || '') + ' ' + (j.company || '') + ' ' + (j.location || '') + ' ' + (j.sector || '')).toLowerCase().includes(q);
  });

  // Count applications for a specific job
  const getApplicationCountForJob = (jobId: number): number => {
    if (!effectiveIsCompany || !Array.isArray(applications)) return 0;
    return applications.filter((a) => Number(a.job_id) === Number(jobId)).length;
  };

  const fetchJobs = async (overrideProfile?: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const p = overrideProfile || profile || user;
      const isCompany = p && String(p.user_type).toLowerCase() === 'company';
      if (isCompany) {
        // For company users, fetch only the company's own jobs (no admin/public jobs)
        const resCompany = await fetch('/api/company/jobs', { headers: authHeaders() });
        if (!resCompany.ok) throw new Error('Erreur chargement offres entreprise');
        const companyData = await resCompany.json();
        setJobs(Array.isArray(companyData) ? companyData : []);
      } else {
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('Erreur chargement offres');
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      toast.error('Impossible de charger les offres');
    } finally {
      setLoading(false);
    }
  };

  const effectiveIsCompany = (() => {
    try {
      if (profile && profile.user_type) return String(profile.user_type).toLowerCase() === 'company';
      if (user && user.user_type) return String(user.user_type).toLowerCase() === 'company';
      return false;
    } catch (e) { return false; }
  })();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Use profile if loaded, otherwise fallback to auth hook `user` to determine role
      let p = profile || user;
      const headers: any = authHeaders();

      // If we don't know the user_type yet, try to fetch profile
      if ((!p || !p.user_type) && token) {
        try {
          const pr = await fetch('/api/users/me', { headers });
          if (pr.ok) {
            p = await pr.json();
            setProfile(p);
          }
        } catch (e) {
          // ignore
        }
      }

        if (p && String(p.user_type).toLowerCase() === 'company') {
        const res = await fetch('/api/company/applications', { headers });
        if (!res.ok) throw new Error('Erreur chargement candidatures');
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      } else {
        const res = await fetch('/api/applications', { headers });
        if (!res.ok) throw new Error('Erreur chargement candidatures');
        const data = await res.json();
        setMyApplications(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      toast.error('Impossible de charger les candidatures');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', { headers: authHeaders() });
      if (!res.ok) return;
      const p = await res.json();
      setProfile(p);
      return p;
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    (async () => {
      const p = await fetchProfile();
      await fetchJobs(p || undefined);
    })();
  }, []);

  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
    // When notifications update elsewhere in the app (notifications page/header),
    // refresh applications to stay in sync (helps when SSE isn't connected).
    const onNotificationsUpdated = () => {
      if (activeTab === 'applications') fetchApplications();
    };
    window.addEventListener('notifications-updated', onNotificationsUpdated);
    return () => { window.removeEventListener('notifications-updated', onNotificationsUpdated); };
  }, [activeTab]);

  // Poll applications periodically while on the applications tab as a fallback
  useEffect(() => {
    if (activeTab !== 'applications') return;
    const iv = setInterval(() => {
      fetchApplications();
    }, 30_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Use SSE only: load initial applications once for company users (SSE will push updates)
  useEffect(() => {
    if (effectiveIsCompany) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveIsCompany]);

  // Real-time updates via SSE (preferred) for company users
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!effectiveIsCompany || !token) return;
    const url = `/api/company/applications/stream?token=${encodeURIComponent(token)}`;
    let es: EventSource | null = null;
    let pollId: any = null;
    const startPolling = () => {
      // fallback: poll every 6s
      if (pollId) return;
      fetchApplications();
      pollId = setInterval(() => fetchApplications(), 6000);
    };

    try {
      es = new EventSource(url);
      es.addEventListener('new_application', (ev: MessageEvent) => {
        try {
          const app = JSON.parse(ev.data);
          setApplications(prev => {
            if (!Array.isArray(prev)) return [app];
            if (prev.find(p => Number(p.id) === Number(app.id))) return prev;
            return [app, ...prev];
          });
        } catch (e) { console.error('Invalid SSE application payload', e); }
      });
      es.onerror = (e) => {
        console.warn('SSE error', e);
        // switch to polling fallback if SSE errors
        startPolling();
      };
      // if connection opens, clear any polling
      es.onopen = () => {
        if (pollId) { clearInterval(pollId); pollId = null; }
      };
    } catch (e) {
      console.warn('Could not open SSE', e);
      startPolling();
    }
    return () => { try { es && es.close(); } catch (e) {} finally { if (pollId) clearInterval(pollId); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveIsCompany]);

  // Keep search in sync with URL query param (search or q)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('search') || params.get('q') || '';
      setSearch(q);
    } catch (e) {}
  }, [location.search]);

  const openCreate = () => {
    setEditingJob(null);
    setForm({
      title: '', company: profile?.company_name || '', location: '', sector: '', type: 'CDI', salary: '', description: '', application_url: '', application_via_emploi: false, image: null, deadline: ''
    });
    setPreview(null);
    setShowForm(true);
  };

  const openEdit = (job: any) => {
    setEditingJob(job);
    setForm({
      title: job.title || '',
      company: job.company || profile?.company_name || '',
      location: job.location || '',
      sector: job.sector || '',
      type: job.type || 'CDI',
      salary: job.salary || '',
      description: job.description || '',
      application_url: job.application_url || '',
      application_via_emploi: !!job.application_via_emploi,
      image: null,
      deadline: job.deadline || '',
    });
    setPreview(job.image_url || null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setForm({ ...form, image: f });
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload: any = {
        title: form.title,
        company: profile?.company_name || form.company,
        location: form.location,
        sector: form.sector,
        type: form.type,
        salary: form.salary,
        description: form.description,
        application_url: form.application_url,
        application_via_emploi: form.application_via_emploi,
        deadline: form.deadline || null,
      };

      if (form.image) {
        try {
          const uploaded = await uploadFile(form.image as File, token, 'jobs');
          payload.image_url = uploaded;
        } catch (err) {
          toast.error('Erreur upload image');
          return;
        }
      }

      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders('application/json'),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Erreur lors de l\'envoi');
      }
      toast.success(editingJob ? 'Offre mise à jour' : 'Offre publiée');
      setShowForm(false);
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || 'Erreur');
    }
  };

  const togglePublish = async (job: any) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/jobs/${job.id}/publish`, {
        method: 'PATCH',
        headers: authHeaders('application/json'),
        body: JSON.stringify({ published: !job.published }),
      });
      toast.success(job.published ? 'Offre masquée' : 'Offre publiée');
      fetchJobs();
    } catch (e) {
      toast.error('Erreur');
    }
  };

  const deleteJob = async (job: any) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/jobs/${job.id}`, { method: 'DELETE', headers: authHeaders() });
      toast.success('Offre supprimée');
      fetchJobs();
    } catch (e) {
      toast.error('Erreur suppression');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Recrutement</h1>
                  <p className="text-orange-50 text-sm">Publiez et gérez vos offres d'emploi</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{displayedJobs.length}</div>
              <div className="text-orange-50 text-sm">Offres publiées</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'offers' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`} 
            onClick={() => setActiveTab('offers')}
          >
            <span className="inline-flex items-center gap-2"><Icon name="Briefcase" size={16} />Offres d'emploi</span>
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'applications' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`} 
            onClick={() => { setSelectedJobId(null); setSearch(''); setActiveTab('applications'); fetchApplications(); }}
          >
            <span className="inline-flex items-center gap-2"><Icon name="Users" size={16} />Candidatures</span>
            {effectiveIsCompany && Array.isArray(applications) && applications.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">
                {applications.length}
              </span>
            )}
          </button>
          {effectiveIsCompany && (
            <button 
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'spontaneous' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('spontaneous')}
            >
              <span className="inline-flex items-center gap-2"><Icon name="Star" size={16} />Candidatures Spontanées</span>
            </button>
          )}
          {selectedJobId && activeTab === 'applications' && (
            <button 
              className="px-3 py-2 rounded-lg text-sm bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors border border-amber-300"
              onClick={() => setSelectedJobId(null)}
            >
              <span className="inline-flex items-center gap-2"><Icon name="X" size={14} />Réinitialiser le filtre</span>
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            {profile && String(profile.user_type).toLowerCase() === 'company' && (
              <a href="/company/validations"><Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">Historique validations</Button></a>
            )}
            {profile && (String(profile.user_type).toLowerCase() === 'admin' || String(profile.user_type).toLowerCase() === 'super_admin') && (
              <a href="/admin/validations"><Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">Historique validations</Button></a>
            )}
            <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600"><Briefcase className="mr-2 h-4 w-4"/>Nouvelle offre</Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar value={search} onChange={setSearch} placeholder={activeTab === 'offers' ? 'Rechercher offres, entreprise, lieu...' : (profile && String(profile.user_type).toLowerCase() === 'company' ? 'Rechercher candidat, email, offre...' : 'Rechercher candidatures...')} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4"/>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'offers' ? (
              <>
                {filteredJobs.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune offre disponible</h3>
                    <p className="text-gray-600 mb-6">Créez votre première offre d'emploi pour commencer à recruter</p>
                    <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600"><Briefcase className="mr-2 h-4 w-4"/>Créer une offre</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                      <div key={job.id} className="p-6 bg-white rounded-lg border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{job.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                            <p className="text-xs text-gray-500 mt-1"><span className="inline-flex items-center gap-1"><Icon name="MapPin" size={14} />{job.location}</span></p>
                          </div>
                          {job.published && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <Icon name="CheckCircle" size={14} className="mr-1"/>Publié
                            </span>
                          )}
                          {!job.published && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              <Icon name="Edit" size={14} className="mr-1"/>Brouillon
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{job.description ? (String(job.description).substring(0, 150) + (String(job.description).length > 150 ? '...' : '')) : ''}</p>
                        
                        {job.type && <p className="text-xs text-orange-600 font-semibold mb-3"><span className="inline-flex items-center gap-1"><Icon name="Briefcase" size={14} />{job.type}{job.salary ? ` • ${job.salary}` : ''}</span></p>}
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(job)}
                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            <Edit className="h-4 w-4"/>
                          </Button>
                          <Button 
                            size="sm"
                            className={`gap-2 ${selectedJobId === job.id ? 'bg-orange-500 text-white' : 'bg-white border border-orange-300 text-orange-600 hover:bg-orange-50'}`}
                            onClick={() => { setSelectedJobId(job.id); setActiveTab('applications'); fetchApplications(); }}
                          >
                            <MessageSquare className="h-4 w-4"/>
                            {getApplicationCountForJob(job.id)}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-300"
                            onClick={() => togglePublish(job)}
                          >
                            {job.published ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                          </Button>
                          <ConfirmButton title="Supprimer cette offre ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => deleteJob(job)}>
                            <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4"/></Button>
                          </ConfirmButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {effectiveIsCompany && (
                  <div className={`p-4 rounded-lg border-l-4 ${selectedJobId ? 'bg-blue-50 border-blue-500' : 'bg-green-50 border-green-500'}`}>
                    <p className={`text-sm font-semibold ${selectedJobId ? 'text-blue-900' : 'text-green-900'}`}>
                      {selectedJobId ? (
                        <>
                          📋 Candidatures pour "<span className="font-bold">{displayedJobs.find(j => j.id === selectedJobId)?.title || 'Chargement...'}</span>"
                        </>
                      ) : (
                        <>
                          📊 Toutes les candidatures ({Array.isArray(applications) ? applications.length : 0} reçues)
                        </>
                      )}
                    </p>
                  </div>
                )}
                {(() => {
                  let filtered = profile && String(profile.user_type).toLowerCase() === 'company'
                    ? (selectedJobId ? applications.filter((a) => Number(a.job_id) === Number(selectedJobId)) : applications)
                    : myApplications;
                  if (search) {
                    const q = String(search).toLowerCase();
                    filtered = (filtered || []).filter((a: any) => {
                      return ((a.applicant_name || '') + ' ' + (a.applicant_email || '') + ' ' + (a.job_title || '') + ' ' + (a.message || '')).toLowerCase().includes(q);
                    });
                  }
                  if (!filtered || filtered.length === 0) {
                    return (
                      <div className="p-12 text-center bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-gray-400 text-4xl mb-4">📪</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{effectiveIsCompany ? (selectedJobId ? 'Aucune candidature reçue pour cette offre' : 'Aucune candidature reçue') : 'Aucune candidature'}</h3>
                        <p className="text-gray-600">{effectiveIsCompany ? 'Les candidatures s\'afficheront ici' : 'Vous n\'avez postulé à aucune offre'}</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {filtered.map((app) => (
                        <div key={app.id} className="p-6 bg-white rounded-lg border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900">{app.applicant_name || 'Candidat'}</h4>
                              <div className="text-sm text-gray-600 mt-1 grid grid-cols-2 gap-2">
                                <div>📧 {app.applicant_email || '—'}</div>
                                <div>💼 {app.job_title || 'Non spécifié'}</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 text-right whitespace-nowrap">
                              {new Date(app.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          {app.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 italic border-l-2 border-orange-300">
                              "{(app.message || '').substring(0, 200)}{(app.message || '').length > 200 ? '...' : ''}"
                            </div>
                          )}
                          <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <Button 
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={() => { setSelectedApplication(app); setShowApplicationDetail(true); }}
                            >
                              👁️ Voir le dossier
                            </Button>
                            {app.cv_url && (
                              <a href={app.cv_url} className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors" target="_blank" rel="noreferrer">
                                📄 CV
                              </a>
                            )}
                            {app.cover_letter_url && (
                              <a href={app.cover_letter_url} className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors" target="_blank" rel="noreferrer">
                                📝 LM
                              </a>
                            )}
                            {app.additional_docs && (() => {
                              try {
                                const docs = typeof app.additional_docs === 'string' ? JSON.parse(app.additional_docs) : app.additional_docs;
                                return Array.isArray(docs) ? docs.map((d: any, i: number) => (
                                  <a key={i} href={d} className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors" target="_blank" rel="noreferrer">
                                    📎 Doc {i+1}
                                  </a>
                                )) : null;
                              } catch (e) { return null; }
                            })()}
                            {profile && String(profile.user_type).toLowerCase() === 'company' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                  onClick={() => { 
                                    setInterviewAppId(app.id); 
                                    setInterviewTitle(`Entretien - ${app.job_title || ''}`); 
                                    setInterviewMessage(`Félicitations, vous êtes invité(e) à un entretien pour le poste "${app.job_title || ''}".`); 
                                    setInterviewDateTime(''); 
                                    setInterviewPlace(''); 
                                    setShowInterviewModal(true); 
                                  }}
                                >
                                  📋 Invitation entretien
                                </Button>
                                <Button 
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => { 
                                    setInterviewAppId(app.id); 
                                    setInterviewTitle(`Validation - ${app.job_title || ''}`); 
                                    setInterviewMessage(`Félicitations, vous avez été sélectionné(e) pour le poste "${app.job_title || ''}".`); 
                                    setInterviewDateTime(''); 
                                    setInterviewPlace(''); 
                                    setShowInterviewModal(true); 
                                  }}
                                >
                                  ✓ Valider
                                </Button>
                              </>
                            )}
                            {profile && String(profile.user_type).toLowerCase() === 'candidate' && app.status === 'validated' && (
                              <>
                                <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => { setResponseAppId(app.id); setResponseType('accept'); setResponseMessage(''); setShowResponseModal(true); }}>✓ Accepter</Button>
                                <Button size="sm" variant="destructive" onClick={() => { setResponseAppId(app.id); setResponseType('decline'); setResponseMessage(''); setShowResponseModal(true); }}>✕ Décliner</Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
            {activeTab === 'spontaneous' && effectiveIsCompany && (
              <div>
                <SpontaneousApplications companyId={profile?.id || user?.id || ''} />
              </div>
            )}
          </>
        )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingJob ? 'Modifier l\'offre' : 'Nouvelle offre'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>×</Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Intitulé du poste *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <Label>Entreprise</Label>
                  <Input value={profile?.company_name || form.company} disabled />
                </div>
                <div>
                  <Label>Lieu *</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div>
                  <Label>Secteur</Label>
                  <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
                </div>
                <div>
                  <Label>Date limite</Label>
                  <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div>
                  <Label>Type de contrat</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Salaire</Label>
                  <Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                </div>
                <div>
                  <Label>URL de candidature</Label>
                    <Input value={form.application_url} disabled={!!form.application_via_emploi} onChange={(e) => setForm({ ...form, application_url: e.target.value, application_via_emploi: e.target.value ? false : form.application_via_emploi })} />
                </div>
                  <div className="flex items-center gap-2">
                    <input id="via-emploi" type="checkbox" disabled={!!form.application_url} checked={form.application_via_emploi} onChange={(e) => setForm({ ...form, application_via_emploi: e.target.checked, application_url: e.target.checked ? '' : form.application_url })} />
                    <Label htmlFor="via-emploi">Autoriser candidature via Emploi+ (Postuler avec Emploi+)</Label>
                  </div>
              </div>

              <div>
                <Label>Description complète *</Label>
                <Textarea rows={8} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>

              <div>
                <Label>Image (facultatif)</Label>
                <div className="border-2 border-dashed p-4 rounded">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Apercu" className="max-h-60 mx-auto" />
                      <Button variant="destructive" size="icon" onClick={() => { setPreview(null); setForm({ ...form, image: null }); }} className="absolute -top-2 -right-2">×</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input id="recruit-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <Label htmlFor="recruit-image" className="cursor-pointer"><Button variant="outline"><Upload className="mr-2"/>Choisir une image</Button></Label>
                      <span className="text-sm text-muted-foreground">JPG, PNG • max 5MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button type="submit">{editingJob ? 'Enregistrer' : 'Publier'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold mb-3">
              {interviewTitle.includes('Validation') ? '✓ Valider le candidat' : '📋 Envoyer une invitation à entretien'}
            </h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
              {interviewTitle.includes('Validation') 
                ? 'Cette action validera le candidat et lui enverra une notification avec les détails de l\'entretien.'
                : 'Envoyez une invitation à entretien au candidat. Il pourra répondre à cette invitation.'}
            </div>
            <div className="space-y-3">
              <div>
                <Label>Titre du message</Label>
                <Input value={interviewTitle} onChange={(e) => setInterviewTitle(e.target.value)} />
              </div>
              <div>
                <Label>Date et heure (optionnel)</Label>
                <Input type="datetime-local" value={interviewDateTime} onChange={(e) => setInterviewDateTime(e.target.value)} />
              </div>
              <div>
                <Label>Lieu (optionnel)</Label>
                <Input value={interviewPlace} onChange={(e) => setInterviewPlace(e.target.value)} />
              </div>
              <div>
                <Label>Message au candidat</Label>
                <Textarea rows={4} value={interviewMessage} onChange={(e) => setInterviewMessage(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowInterviewModal(false)}>Annuler</Button>
                <Button onClick={async () => {
                  try {
                    if (!interviewAppId) return;
                    const token = localStorage.getItem('token');
                    const payload = { date_time: interviewDateTime, place: interviewPlace, message: { title: interviewTitle, body: interviewMessage } };
                    
                    // Choisir l'endpoint selon le titre
                    const isValidation = interviewTitle.includes('Validation');
                    const endpoint = isValidation ? '/validate' : '/interview';
                    
                    const res = await fetch(`/api/company/applications/${interviewAppId}${endpoint}`, { 
                      method: 'POST', 
                      headers: authHeaders('application/json'), 
                      body: JSON.stringify(payload) 
                    });
                    if (!res.ok) {
                      const b = await res.json().catch(() => ({}));
                      throw new Error(b.message || 'Erreur');
                    }
                    toast.success(isValidation ? 'Candidat validé et notification envoyée' : 'Invitation à entretien envoyée');
                    setShowInterviewModal(false);
                    fetchApplications();
                  } catch (err) {
                    console.error('Send interview error', err);
                    toast.error('Erreur lors de l\'envoi');
                  }
                }}>
                  {interviewTitle.includes('Validation') ? 'Valider et envoyer' : 'Envoyer l\'invitation'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showResponseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold mb-3">{responseType === 'accept' ? 'Accepter la convocation' : 'Décliner la convocation'}</h3>
            <div className="space-y-3">
              <Label>Message (optionnel)</Label>
              <Textarea rows={4} value={responseMessage} onChange={(e) => setResponseMessage(e.target.value)} />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowResponseModal(false)}>Annuler</Button>
                <Button onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    if (!responseAppId || !responseType) return;
                    const url = `/api/applications/${responseAppId}/${responseType === 'accept' ? 'accept' : 'decline'}`;
                    const res = await fetch(url, { method: 'POST', headers: authHeaders('application/json'), body: JSON.stringify({ message: responseMessage }) });
                    if (!res.ok) {
                      const b = await res.json().catch(() => ({}));
                      throw new Error(b.message || 'Erreur');
                    }
                    toast.success('Réponse envoyée');
                    setShowResponseModal(false);
                    fetchApplications();
                  } catch (err) {
                    console.error(err);
                    toast.error('Impossible d envoyer la réponse');
                  }
                }}>{responseType === 'accept' ? 'Accepter' : 'Décliner'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApplicationDetail && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">Dossier de candidature</h2>
                <p className="text-sm text-muted-foreground mt-2">{selectedApplication.applicant_name || 'Candidat'} • {selectedApplication.job_title || 'Offre'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setShowApplicationDetail(false); setSelectedApplication(null); }}>×</Button>
            </div>

            <div className="space-y-6">
              {/* Informations du candidat */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-lg mb-3">📋 Informations du candidat</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-medium">{selectedApplication.applicant_name || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApplication.applicant_email || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Offre d'emploi</p>
                    <p className="font-medium">{selectedApplication.job_title || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className={`font-medium px-3 py-1 rounded-full inline-block ${
                      selectedApplication.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      selectedApplication.status === 'validated' ? 'bg-blue-100 text-blue-800' :
                      selectedApplication.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      selectedApplication.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedApplication.status === 'submitted' && '🟡 Soumise'}
                      {selectedApplication.status === 'validated' && '🔵 Validée'}
                      {selectedApplication.status === 'accepted' && '✅ Acceptée'}
                      {selectedApplication.status === 'declined' && '❌ Déclinée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de candidature</p>
                    <p className="font-medium">{new Date(selectedApplication.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Message de candidature */}
              {selectedApplication.message && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-3">💬 Message de candidature</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedApplication.message}</p>
                </div>
              )}

              {/* Documents soumis */}
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-lg mb-3">📄 Documents soumis</h3>
                <div className="space-y-2">
                  {selectedApplication.cv_url && (
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📄</span>
                        <span className="font-medium">Curriculum Vitae (CV)</span>
                      </div>
                      <a 
                        href={selectedApplication.cv_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-primary text-white text-sm rounded hover:opacity-90"
                      >
                        Télécharger
                      </a>
                    </div>
                  )}
                  {selectedApplication.cover_letter_url && (
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📝</span>
                        <span className="font-medium">Lettre de motivation</span>
                      </div>
                      <a 
                        href={selectedApplication.cover_letter_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-primary text-white text-sm rounded hover:opacity-90"
                      >
                        Télécharger
                      </a>
                    </div>
                  )}
                  {selectedApplication.additional_docs && (() => {
                    try {
                      const docs = typeof selectedApplication.additional_docs === 'string' 
                        ? JSON.parse(selectedApplication.additional_docs) 
                        : selectedApplication.additional_docs;
                      if (!Array.isArray(docs) || docs.length === 0) return null;
                      return (
                        <>
                          <p className="text-sm text-muted-foreground mt-3 mb-2">Documents supplémentaires :</p>
                          {docs.map((docUrl: string, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">📎</span>
                                <span className="font-medium">Document supplémentaire {i + 1}</span>
                              </div>
                              <a 
                                href={docUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-4 py-2 bg-secondary text-white text-sm rounded hover:opacity-90"
                              >
                                Télécharger
                              </a>
                            </div>
                          ))}
                        </>
                      );
                    } catch (e) { 
                      return null;
                    }
                  })()}
                  {!selectedApplication.cv_url && !selectedApplication.cover_letter_url && (!selectedApplication.additional_docs || (typeof selectedApplication.additional_docs === 'string' ? JSON.parse(selectedApplication.additional_docs).length === 0 : selectedApplication.additional_docs.length === 0)) && (
                    <p className="text-sm text-muted-foreground italic">Aucun document n'a été fourni</p>
                  )}
                </div>
              </div>

              {/* Actions pour l'entreprise */}
              {profile && String(profile.user_type).toLowerCase() === 'company' && (
                <div className="border rounded-lg p-4 bg-purple-50">
                  <h3 className="font-semibold text-lg mb-3">⚙️ Actions</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline"
                      onClick={() => { 
                        setShowApplicationDetail(false);
                        setInterviewAppId(selectedApplication.id); 
                        setInterviewTitle(`Entretien - ${selectedApplication.job_title || ''}`); 
                        setInterviewMessage(`Félicitations, vous êtes invité(e) à un entretien pour le poste "${selectedApplication.job_title || ''}".`); 
                        setInterviewDateTime(''); 
                        setInterviewPlace(''); 
                        setShowInterviewModal(true); 
                      }}
                    >
                      📋 Envoyer invitation entretien
                    </Button>
                    <Button 
                      onClick={() => { 
                        setShowApplicationDetail(false);
                        setInterviewAppId(selectedApplication.id); 
                        setInterviewTitle(`Validation - ${selectedApplication.job_title || ''}`); 
                        setInterviewMessage(`Félicitations, vous avez été sélectionné(e) pour le poste "${selectedApplication.job_title || ''}".`); 
                        setInterviewDateTime(''); 
                        setInterviewPlace(''); 
                        setShowInterviewModal(true); 
                      }}
                    >
                      ✓ Valider le candidat
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => { setShowApplicationDetail(false); setSelectedApplication(null); }}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}