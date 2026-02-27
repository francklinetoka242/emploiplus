import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import SettingsSidebar from "@/components/account/SettingsSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authHeaders } from '@/lib/headers';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [companyOffersCount, setCompanyOffersCount] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string,string> = {};
      Object.assign(headers, authHeaders());
      const res = await fetch('/api/users/me', { headers });
      if (!res.ok) {
        // try to parse JSON error, fallback to text
        let msg = `Erreur chargement profil (HTTP ${res.status})`;
        try {
          const errBody = await res.json();
          if (errBody && errBody.message) msg = `Erreur ${res.status}: ${errBody.message}`;
          else msg = `Erreur ${res.status}: ${JSON.stringify(errBody)}`;
        } catch (e) {
          try { const t = await res.text(); if (t) msg = `Erreur ${res.status}: ${t}`; } catch (e2) {}
        }
        console.error('fetchProfile non-ok response', res.status);
        throw new Error(msg);
      }
      const data = await res.json();
      setProfileData(data);
      setProfileImageUrl((data as any).profile_image_url || null);
    } catch (error) {
      const err = error as Error;
      console.error('fetchProfile error:', err);
      toast.error(err.message || "Erreur lors du chargement du profil");
      // If token expired or invalid, sign out locally to force re-login
      if (String(err.message).toLowerCase().includes('token') || String(err.message).toLowerCase().includes('identifiant')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && role) {
      fetchProfile();
      if (role === 'company') {
        (async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/jobs');
            if (!res.ok) return;
            const all = await res.json();
            const companyName = (user && (user as any).company_name) || '';
            const filtered = companyName ? (all || []).filter((j: any) => String(j.company || '').toLowerCase() === String(companyName).toLowerCase()) : [];
            setCompanyOffersCount(filtered.length);
          } catch (e) { /* ignore */ }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profileData) return;
    setLoading(true);
    
    const payload: Record<string, unknown> = {
      full_name: profileData.full_name || null,
      phone: profileData.phone || null,
      profile_image_url: profileImageUrl || (profileData.profile_image_url as string) || null,
    };

    // Candidate-specific fields
    if (role === 'candidate') {
      payload.profession = profileData.profession || null;
      payload.job_title = profileData.job_title || null;
      payload.diploma = profileData.diploma || null;
      payload.experience_years = profileData.experience_years || 0;
    }

    // Company-specific fields
    if (role === 'company') {
      payload.company_name = profileData.company_name || null;
      payload.company_address = profileData.company_address || null;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string,string> = authHeaders('application/json');
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Compute profile completeness
  const completeness = useMemo(() => {
    if (!profileData) return { percent: 0, missing: [] as string[] };
    const fields: string[] = [];
    const missing: string[] = [];
    // Common fields
    if (profileData.full_name) fields.push('full_name'); else missing.push('nom complet');
    if (profileData.email) fields.push('email'); else missing.push('email');
    if (profileData.profile_image_url || profileImageUrl) fields.push('profile_image_url'); else missing.push('photo');
    if (profileData.phone) fields.push('phone'); else missing.push('téléphone');

    // role-specific
    const userType = String(profileData.user_type || '').toLowerCase();
    if (userType === 'company') {
      const req = ['company_name', 'company_address'];
      for (const f of req) {
        if (profileData[f]) fields.push(f); else missing.push(f === 'company_address' ? 'adresse de l\'entreprise' : 'nom de l\'entreprise');
      }
    } else {
      const req = ['profession', 'job_title', 'diploma', 'experience_years'];
      for (const f of req) {
        if (profileData[f]) fields.push(f);
        else {
          if (f === 'experience_years') missing.push('années d\'expérience');
          else if (f === 'job_title') missing.push('intitulé du poste');
          else if (f === 'diploma') missing.push('diplôme');
          else missing.push('profession');
        }
      }
    }

    // Build percent: count of filled fields over total required
    const totalRequired = fields.length + missing.length;
    const filled = fields.length;
    const percent = totalRequired > 0 ? Math.round((filled / totalRequired) * 100) : 0;
    return { percent, missing };
  }, [profileData, profileImageUrl]);

  const handleDeleteProfileImage = async () => {
    if (!user || !profileData) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: authHeaders('application/json'),
        body: JSON.stringify({ ...profileData, profile_image_url: null }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || 'Erreur suppression image');
      }
      const updated = await res.json();
      setProfileData(updated);
      setProfileImageUrl(null);
      toast.success('Photo supprimée');
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const requestSoftDelete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string,string> = {};
      Object.assign(headers, authHeaders());
      const res = await fetch('/api/users/me/soft-delete', { method: 'POST', headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Erreur lors de la demande');
      }
      toast.success('Demande de suppression enregistrée');
      // optionally sign out locally
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profileData) return null;
  return (
    <div className="container mx-auto px-4 py-8">
      
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>
      {/* Profile completeness / gamification */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Score de profil</div>
                    <div className="text-lg font-semibold">Votre profil est complété à {completeness.percent}%</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{completeness.percent === 100 ? 'Profil complet ✅' : 'Complétez votre profil'}</div>
                </div>
                <div className="mt-3">
                  <Progress value={completeness.percent} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            {completeness.percent < 100 && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Suggest up to two missing actions */}
                {completeness.missing.slice(0,2).map((m, idx) => (
                  <Button key={idx} onClick={() => navigate(idx === 0 ? '/parametres/profil' : '/parametres/informations')}>{`Ajouter ${m}`}</Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <SettingsSidebar />

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-muted">
                {profileImageUrl || (profileData.profile_image_url as string) ? (
                  <img src={profileImageUrl || (profileData.profile_image_url as string)} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-xl font-semibold">{((profileData.full_name as string)||'').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profileData.full_name}</h2>
                <div className="text-sm text-muted-foreground">{profileData.email}</div>
              </div>
            </div>
            <div>
              {!editing ? (
                <div className="flex flex-col items-end gap-2">
                  <Button onClick={() => setEditing(true)}>Modifier</Button>
                  {role === 'company' && (
                    <Button variant="outline" onClick={() => navigate('/recrutement')}>Recrutement ({companyOffersCount ?? '—'})</Button>
                  )}
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
              )}
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Common fields */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                value={(profileData?.full_name as string) || ''}
                disabled={!editing}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                disabled
                value={(profileData?.email as string) || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  value={(profileData?.phone as string) || ''}
                  disabled={!editing}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
                {editing && (
                  <Button variant="destructive" onClick={async () => {
                    // remove phone
                    setLoading(true);
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch('/api/users/me', {
                        method: 'PUT',
                        headers: authHeaders('application/json'),
                        body: JSON.stringify({ ...profileData, phone: null }),
                      });
                      if (!res.ok) {
                        const b = await res.json().catch(() => ({}));
                        throw new Error(b.message || 'Erreur suppression numéro');
                      }
                      const updated = await res.json();
                      setProfileData(updated);
                      toast.success('Numéro supprimé');
                    } catch (err) {
                      const e = err as Error;
                      toast.error(e.message || 'Erreur');
                    } finally { setLoading(false); }
                  }}>Supprimer</Button>
                )}
              </div>
            </div>

            {/* Profil image change (editing only) */}
            {editing && (
              <div className="space-y-2">
                <Label>Photo de profil</Label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = async () => {
                    const dataUrl = String(reader.result);
                    setProfileImageUrl(dataUrl);
                    // Try upload via existing upload endpoint if available
                    try {
                      const token = localStorage.getItem('token');
                      const resUpload = await fetch('/api/upload', { method: 'POST', body: f, headers: authHeaders() }).catch(()=>null as any);
                      if (resUpload && resUpload.ok) {
                        const j = await resUpload.json();
                        if (j && j.url) setProfileImageUrl(j.url);
                      }
                    } catch (e) { /* ignore */ }
                  };
                  reader.readAsDataURL(f);
                }} />
                {(profileImageUrl || (profileData.profile_image_url as string)) && (
                  <div className="mt-2">
                    <Button variant="destructive" onClick={handleDeleteProfileImage}>Supprimer la photo</Button>
                  </div>
                )}
              </div>
            )}

            {/* Candidat-specific fields */}
            {role === 'candidate' && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Informations Professionnelles</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    placeholder="Ex: Développeur, Infirmière, Mécanicien"
                    value={(profileData?.profession as string) || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title">Intitulé du Poste</Label>
                  <Input
                    id="job_title"
                    placeholder="Ex: Senior Developer, Chef de Projet"
                    value={(profileData?.job_title as string) || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diploma">Diplôme / Qualification</Label>
                  <Input
                    id="diploma"
                    placeholder="Ex: Bac+5 Informatique, Master en Gestion"
                    value={(profileData?.diploma as string) || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData({ ...profileData, diploma: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_years">Années d'Expérience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    max="70"
                    value={(profileData?.experience_years as number) || 0}
                    disabled={!editing}
                    onChange={(e) => setProfileData({ ...profileData, experience_years: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            )}

            {/* Company-specific fields */}
            {role === 'company' && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Informations de l'Entreprise</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de l'Entreprise</Label>
                  <Input
                    id="company_name"
                    value={String(profileData?.company_name || '')}
                    disabled={!editing}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_address">Adresse</Label>
                  <Textarea
                    id="company_address"
                    value={String(profileData?.company_address || '')}
                    disabled={!editing}
                    onChange={(e) => setProfileData({ ...profileData, company_address: e.target.value })}
                    rows={3}
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90" 
              disabled={loading}
            >
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mise à jour...</>) : "Mettre à jour le profil"}
            </Button>
          </form>
        </Card>
        <div className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Supprimer mon compte</h3>
            <p className="text-sm text-muted-foreground mb-4">
              La suppression est progressive : d'abord une désactivation (14 jours de rétractation), puis suppression définitive.
            </p>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>Supprimer mon compte</Button>
            </div>
          </Card>
        </div>

      {/* Soft delete modal for current user */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Suppression du compte — Informations</h3>
            <div className="prose mb-4">
              <p>La suppression de votre compte est effectuée en deux étapes :</p>
              <ol>
                <li>Demande de suppression (soft delete) : votre compte est désactivé immédiatement et vos données sont conservées pendant 14 jours au cas où vous changeriez d'avis.</li>
                <li>Suppression définitive : après 14 jours, vos données seront purgées définitivement. Certaines données dans les sauvegardes peuvent encore subsister jusqu'à leur rotation.</li>
              </ol>
              <p>Souhaitez-vous continuer ?</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
              <Button variant="destructive" onClick={() => { setShowDeleteModal(false); requestSoftDelete(); }}>Confirmer</Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Profile;