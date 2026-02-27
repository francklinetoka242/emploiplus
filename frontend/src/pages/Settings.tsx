import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import CandidateApplications from '@/components/account/CandidateApplications';
import CandidatePersonalInfo from './settings/CandidatePersonalInfo';
import CandidateSocialNetworks from './settings/CandidateSocialNetworks';
import CandidateProfessionalProfile from './settings/CandidateProfessionalProfile';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { authHeaders } from "@/lib/headers";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, EyeOff, Download, Trash2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  user_type: string;
  profession?: string;
  job_title?: string;
  diploma?: string;
  experience_years?: number;
  company_name?: string;
  company_address?: string;
}

interface UserDocument {
  id: number;
  doc_type: string;
  title?: string;
  storage_url?: string;
  created_at?: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState<'dashboard'|'security'|'profile'|'personal'|'social'|'professional'|'documents'|'recommendation'|'account'|'applications'>('profile');

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [diploma, setDiploma] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileRes = await fetch('/api/users/me', {
          headers: authHeaders()
        });
        const profileData = await profileRes.json();
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setPhone(profileData.phone || '');
        setProfession(profileData.profession || '');
        setJobTitle(profileData.job_title || '');
        setDiploma(profileData.diploma || '');
        setExperienceYears(profileData.experience_years || 0);
        setCompanyName(profileData.company_name || '');
        setCompanyAddress(profileData.company_address || '');

        // Fetch user documents
        const docsRes = await fetch('/api/user-documents', {
          headers: authHeaders()
        });
        const docsData = await docsRes.json();
        setDocuments(docsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  // Refresh documents when other parts of the app signal updates
  useEffect(() => {
    const handler = async () => {
      if (!token) return;
      try {
        const docsRes = await fetch('/api/user-documents', {
          headers: authHeaders()
        });
        const docsData = await docsRes.json();
        setDocuments(docsData || []);
      } catch (err) {
        console.error('Error refreshing documents:', err);
      }
    };

    window.addEventListener('user-documents-updated', handler);
    return () => window.removeEventListener('user-documents-updated', handler);
  }, [token]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: authHeaders('application/json'),
        body: JSON.stringify({
          full_name: fullName,
          phone,
          profession,
          job_title: jobTitle,
          diploma,
          experience_years: experienceYears,
          company_name: companyName,
          company_address: companyAddress
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        alert('Profil mis à jour avec succès');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    setSaving(true);
    try {
      alert('Fonctionnalité à implémenter (changement de mot de passe)');
    } catch (err) {
      console.error('Error changing password:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    try {
      const res = await fetch(`/api/user-documents/${docId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== docId));
        alert('Document supprimé');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-background border-b py-6 px-4">
        <div className="container max-w-7xl">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre compte et vos informations</p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="flex flex-col h-full bg-white border rounded-lg p-4">
              <nav className="space-y-1 flex-1">
                <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='dashboard'?'bg-primary/10':''}`} onClick={()=>setActiveTab('dashboard')}>Tableau de bord</button>
                <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='security'?'bg-primary/10':''}`} onClick={()=>setActiveTab('security')}>Sécurité</button>
                
                {/* For candidates, show separate sections for profile */}
                {profile?.user_type === 'candidate' ? (
                  <>
                    <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='personal'?'bg-primary/10':''}`} onClick={()=>setActiveTab('personal')}>📋 Informations Personnelles</button>
                    <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='social'?'bg-primary/10':''}`} onClick={()=>setActiveTab('social')}>🌐 Réseaux Sociaux</button>
                    <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='professional'?'bg-primary/10':''}`} onClick={()=>setActiveTab('professional')}>💼 Profil Professionnel</button>
                  </>
                ) : (
                  <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='profile'?'bg-primary/10':''}`} onClick={()=>setActiveTab('profile')}>Profil</button>
                )}
                
                <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='documents'?'bg-primary/10':''}`} onClick={()=>setActiveTab('documents')}>Documents</button>
                {profile?.user_type === 'candidate' && (
                  <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='applications'?'bg-primary/10':''}`} onClick={()=>setActiveTab('applications')}>Candidatures</button>
                )}
                <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='recommendation'?'bg-primary/10':''}`} onClick={()=>setActiveTab('recommendation')}>Recommandation</button>
                <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='account'?'bg-primary/10':''}`} onClick={()=>setActiveTab('account')}>Supprimer le compte</button>
              </nav>

              <div className="mt-4">
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded bg-red-600 text-white">Déconnexion</button>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="md:col-span-3">
            {/* Personal Info for Candidates */}
            {activeTab === 'personal' && profile?.user_type === 'candidate' && (
              <CandidatePersonalInfo />
            )}

            {/* Social Networks for Candidates */}
            {activeTab === 'social' && profile?.user_type === 'candidate' && (
              <CandidateSocialNetworks />
            )}

            {/* Professional Profile for Candidates */}
            {activeTab === 'professional' && profile?.user_type === 'candidate' && (
              <CandidateProfessionalProfile />
            )}

            {/* Profile for non-candidates */}
            {activeTab === 'profile' && profile?.user_type !== 'candidate' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Informations Personnelles</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom complet</label>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input value={profile?.email} disabled className="bg-muted" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Téléphone</label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
                    </div>

                    {profile?.user_type === 'candidate' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Profession</label>
                          <Input value={profession} onChange={(e) => setProfession(e.target.value)} />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Titre du poste</label>
                          <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Diplôme</label>
                          <Input value={diploma} onChange={(e) => setDiploma(e.target.value)} />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Années d'expérience</label>
                          <Input value={experienceYears} onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)} type="number" min="0" />
                        </div>
                      </>
                    )}

                    {profile?.user_type === 'company' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Nom de l'entreprise</label>
                          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Adresse</label>
                          <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
                        </div>
                      </>
                    )}

                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Changer le mot de passe</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Ancien mot de passe</label>
                    <div className="relative">
                      <Input
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                    <Input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type="password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                    <Input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type="password"
                    />
                  </div>

                  <Button onClick={handleChangePassword} disabled={saving}>
                    {saving ? 'Mise à jour...' : 'Changer le mot de passe'}
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'myinfo' && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Mes informations / Importer des documents</h2>
                <p className="text-sm text-muted-foreground mb-4">Téléversez vos CV, diplômes, certificats ou lettres. Les CV et lettres créés sur le site peuvent être sauvegardés (max 2 chacun).</p>
                <MyInfoUpload token={token} onUploaded={(doc)=> setDocuments(prev=>[doc, ...prev])} />
              </Card>
            )}

            {activeTab === 'documents' && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Mes Documents</h2>
                <p className="text-sm text-muted-foreground mb-6">Documents générés sur Emploi+</p>

                {documents.length === 0 ? (
                  <p className="text-muted-foreground">Aucun document sauvegardé pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{doc.title || `Document ${doc.id}`}</p>
                          <p className="text-xs text-muted-foreground capitalize">{doc.doc_type} • {new Date(doc.created_at || '').toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          {doc.storage_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={doc.storage_url} download className="gap-2">
                                <Download className="h-4 w-4" />
                                Télécharger
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(doc.id)} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'recommendation' && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Recommandation & Compétences</h2>
                <p className="text-muted-foreground mb-4">Ajoutez vos compétences, métiers et professions pour améliorer les recommandations.</p>
                <RecommendationEditor skillsInitial={profile?.skills || []} onSave={async (skillsArr) => {
                  // Save via PUT /api/users/me
                  try {
                    setSaving(true);
                    const res = await fetch('/api/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ skills: skillsArr }) });
                    if (res.ok) {
                      const updated = await res.json();
                      setProfile(updated);
                      toast.success('Compétences mises à jour');
                    } else {
                      const d = await res.json();
                      throw new Error(d?.message || 'Erreur');
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error('Impossible de sauvegarder');
                  } finally { setSaving(false); }
                }} />
              </Card>
            )}

            {activeTab === 'account' && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Gestion du Compte</h2>
                <div className="space-y-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Supprimer mon compte</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Tous vos documents et informations seront supprimés.
                      </AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction variant="destructive">Supprimer</AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button variant="outline" onClick={handleLogout} className="w-full gap-2">
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'applications' && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Mes candidatures</h2>
                <CandidateApplications token={token} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------
// MyInfoUpload component
// -----------------------
function MyInfoUpload({ token, onUploaded }: { token: string | null, onUploaded?: (doc: Record<string, unknown>)=>void }){
  const [docType, setDocType] = useLocalState<'cv'|'letter'|'diploma'|'certificate'>('cv');
  const [title, setTitle] = useLocalState('');
  const [file, setFile] = useLocalState<File | null>(null);
  const [loading, setLoading] = useLocalState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Veuillez choisir un fichier');
    if (!token) return toast.error('Connectez-vous pour téléverser');
    try{
      setLoading(true);
      // Use centralized upload helper
      const storage_url = await uploadFile(file as File, token, 'documents');

      const createRes = await fetch('/api/user-documents', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ doc_type: docType, title: title || file.name, storage_url }) });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData?.message || 'Erreur création document');
      toast.success('Document sauvegardé');
      onUploaded?.(createData.document);
      setTitle(''); setFile(null);
    }catch(err) {
      console.error(err);
      const message = typeof err === 'object' && err !== null && 'message' in err ? String((err as Record<string, unknown>).message) : String(err);
      toast.error(message || 'Erreur');
    }finally{ setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <select value={docType} onChange={(e)=>setDocType(e.target.value as 'cv'|'letter'|'diploma'|'certificate')} className="border px-3 py-2 rounded">
          <option value="cv">CV</option>
          <option value="letter">Lettre de motivation</option>
          <option value="diploma">Diplôme / Certificat</option>
          <option value="certificate">Autre certificat</option>
        </select>
        <Input placeholder="Titre (optionnel)" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/html" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Téléversement...' : 'Téléverser et sauvegarder'}</Button>
      </div>
    </form>
  );
}

// -----------------------
// RecommendationEditor component
// -----------------------
function RecommendationEditor({ skillsInitial, onSave }: { skillsInitial?: string[] | unknown, onSave: (skills: string[])=>void | Promise<void> }){
  const [items, setItems] = useLocalState<string[]>(Array.isArray(skillsInitial)?(skillsInitial as string[]).map(String):[]);
  const [input, setInput] = useLocalState('');

  const suggestions = [
    'JavaScript','TypeScript','React','Node.js','Python','Django','SQL','PostgreSQL','DevOps','Docker','AWS','UX Design','Graphic Design','Marketing','Communication','Gestion de projet'
  ];

  const add = (v: string) => {
    if (!v) return;
    if (items.includes(v)) return;
    setItems([...items, v]);
    setInput('');
  };

  return (
    <div>
      <div className="mb-2">
        <div className="flex gap-2 flex-wrap">
          {items.map((s, idx) => (
            <button key={s} type="button" className="px-3 py-1 bg-gray-100 rounded" onClick={()=>setItems(items.filter(x=>x!==s))}>{s} ✕</button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <Input placeholder="Ajouter une compétence" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); add(input); } }} />
        <Button onClick={()=>add(input)}>Ajouter</Button>
      </div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Suggestions:</p>
        <div className="flex gap-2 flex-wrap mt-2">
          {suggestions.map(s=> <button key={s} type="button" className="px-3 py-1 bg-gray-50 border rounded" onClick={()=>add(s)}>{s}</button>)}
        </div>
      </div>
      <div>
        <Button onClick={async ()=>{ await onSave(items); }} >Enregistrer les compétences</Button>
      </div>
    </div>
  );
}
