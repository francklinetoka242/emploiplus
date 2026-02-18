import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/lib/upload";
import { useAuth } from "@/hooks/useAuth";
import { authHeaders } from '@/lib/headers';
import { toast } from "sonner";
import { Loader2, Upload, FileText, AlertCircle } from "lucide-react";

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [docs, setDocs] = useState<any[]>([]); // user's saved documents

  const [selectedCv, setSelectedCv] = useState<any | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchJob();
    if (user) {
      fetchUserDocs();
      checkIfAlreadyApplied();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const location = useLocation();

  // Continue to the component regardless of authentication (auth handled at API level)
  async function fetchJob() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.message || 'Offre introuvable');
      }
      const j = await res.json();
      setJob(j || null);
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger l\'offre');
    } finally {
      setLoading(false);
    }
  }

  async function checkIfAlreadyApplied() {
    try {
      const res = await fetch(`/api/job-applications/check/${id}`, {
        headers: authHeaders('')
      });
      if (res.ok) {
        const data = await res.json();
        setAlreadyApplied(data.alreadyApplied);
      }
    } catch (e) {
      console.error('Error checking application status:', e);
    }
  }

  async function fetchUserDocs() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user-documents', { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setDocs(data || []);
    } catch (e) {
      console.error(e);
    }
  }

  const handleUploadAndSave = async (file: File, docType: string) => {
    const token = localStorage.getItem('token');
    const url = await uploadFile(file, token, 'applications');
    // save to user_documents for future reuse
    try {
      const res = await fetch('/api/user-documents', {
        method: 'POST',
        headers: authHeaders('application/json'),
        body: JSON.stringify({ doc_type: docType, title: file.name, storage_url: url }),
      });
      if (res.ok) fetchUserDocs();
    } catch (e) {}
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let cv_url = selectedCv?.storage_url || null;
      let cover_letter_url = selectedLetter?.storage_url || null;
      // if user selected to upload new files via file inputs (additionalFiles may include cv/letter uploads)
      // For simplicity, if selectedCv/Letter refer to local File objects, upload them
      if ((selectedCv && selectedCv instanceof File) || (selectedLetter && selectedLetter instanceof File)) {
        if (selectedCv && selectedCv instanceof File) {
          cv_url = await handleUploadAndSave(selectedCv, 'cv');
        }
        if (selectedLetter && selectedLetter instanceof File) {
          cover_letter_url = await handleUploadAndSave(selectedLetter, 'letter');
        }
      }

      const additional_urls: string[] = [];
      for (const f of additionalFiles) {
        const u = await uploadFile(f, token, 'applications');
        additional_urls.push(u);
        // save
        await fetch('/api/user-documents', {
          method: 'POST',
          headers: authHeaders('application/json'),
          body: JSON.stringify({ doc_type: 'other', title: f.name, storage_url: u }),
        }).catch(() => null);
      }

      const res = await fetch('/api/job-applications', {
        method: 'POST',
        headers: authHeaders('application/json'),
        body: JSON.stringify({ job_id: job.id, cv_url, cover_letter_url, additional_docs: additional_urls, message }),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.message || 'Erreur soumission');
      }

      toast.success('Candidature envoyée');
      navigate('/emplois');
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin"/></div>;

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-3">Offre introuvable</h2>
        <p className="text-sm text-muted-foreground mb-4">L'offre demandée est introuvable ou vous n'avez pas la permission d'y accéder.</p>
        <div className="flex gap-3 justify-center">
          <a href="/emplois" className="px-5 py-3 bg-primary text-white rounded-lg">Retour aux offres</a>
        </div>
      </div>
    </div>
  );

  const deadlineExpired = job?.deadline ? new Date(String(job.deadline)).getTime() < Date.now() : false;

  if (deadlineExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-3">Date limite dépassée</h2>
          <p className="text-sm text-muted-foreground mb-4">La date limite pour cette offre est passée. Vous ne pouvez plus postuler pour cette offre.</p>
          <div className="flex gap-3 justify-center">
            <a href="/emplois" className="px-5 py-3 bg-primary text-white rounded-lg">Retour aux offres</a>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-3">Déjà postulé</h2>
          <p className="text-sm text-muted-foreground mb-4">Vous avez déjà postulé pour cette offre. Vous ne pouvez poser votre candidature qu'une seule fois par offre d'emploi.</p>
          <div className="flex gap-3 justify-center">
            <a href="/emplois" className="px-5 py-3 bg-primary text-white rounded-lg">Retour aux offres</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Postuler — {job.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">Entreprise: {job.company} • Lieu: {job.location}</p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
        <div>
          <Label>CV (sélectionner un CV existant ou téléverser un nouveau)</Label>
          <div className="flex gap-2 items-center mt-2">
            <select className="flex-1" value={selectedCv?.id || ''} onChange={(e) => {
              const id = e.target.value;
              const found = docs.find(d => String(d.id) === String(id));
              setSelectedCv(found || null);
            }}>
              <option value="">-- choisir un CV existant --</option>
              {docs.filter(d => d.doc_type === 'cv').map(d => (<option key={d.id} value={d.id}>{d.title || d.storage_url}</option>))}
            </select>
            <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => {
              const f = e.target.files?.[0]; if (f) setSelectedCv(f);
            }} />
          </div>
        </div>

        <div>
          <Label>Lettre de motivation (optionnel)</Label>
          <div className="flex gap-2 items-center mt-2">
            <select className="flex-1" value={selectedLetter?.id || ''} onChange={(e) => {
              const id = e.target.value;
              const found = docs.find(d => String(d.id) === String(id));
              setSelectedLetter(found || null);
            }}>
              <option value="">-- choisir une lettre existante --</option>
              {docs.filter(d => d.doc_type === 'letter').map(d => (<option key={d.id} value={d.id}>{d.title || d.storage_url}</option>))}
            </select>
            <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => {
              const f = e.target.files?.[0]; if (f) setSelectedLetter(f);
            }} />
          </div>
        </div>

        <div>
          <Label>Autres documents (CNI, Diplôme, Certificat) — vous pouvez ajouter plusieurs fichiers</Label>
          <input type="file" multiple onChange={(e) => {
            const list = e.target.files ? Array.from(e.target.files) : [];
            setAdditionalFiles(list);
          }} className="mt-2" />
        </div>

        <div>
          <Label>Message / Présentation (facultatif)</Label>
          <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Soumettre la candidature'}</Button>
        </div>
      </form>
    </div>
  );
}
