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
import { Loader2, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [sent, setSent] = useState(false); // indicate success animation

  const [docs, setDocs] = useState<any[]>([]); // user's saved documents

  const [selectedCv, setSelectedCv] = useState<any | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantEmail, setApplicantEmail] = useState(''); // for non-logged visitors

  // validation errors for each upload zone
  const [cvError, setCvError] = useState('');
  const [letterError, setLetterError] = useState('');
  const [receiptError, setReceiptError] = useState('');

  // load/save draft for non-authenticated visitors
  useEffect(() => {
    if (job && !user) {
      const key = `apply_${job.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const obj = JSON.parse(stored);
          if (obj.message) setMessage(obj.message);
          if (obj.email) setApplicantEmail(obj.email);
        } catch {}
      }
    }
  }, [job, user]);

  useEffect(() => {
    if (job && !user) {
      const key = `apply_${job.id}`;
      const data = { message, email: applicantEmail };
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [message, applicantEmail, job, user]);

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

  // auto‑attach newly created document when the user returns from editor
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const docType = params.get('docType'); // expected 'cv' | 'letter' | 'receipt'
    if (docType && docs.length > 0) {
      const filtered = docs.filter(d => d.doc_type === docType);
      if (filtered.length > 0) {
        const latest = filtered[filtered.length - 1];
        if (docType === 'cv') setSelectedCv(latest);
        else if (docType === 'letter') setSelectedLetter(latest);
        else if (docType === 'receipt') setSelectedReceipt(latest);
      }
      navigate(location.pathname, { replace: true });
    }
  }, [docs, location.search, navigate, location.pathname]);

  // Continue to the component regardless of authentication (auth handled at API level)
  async function fetchJob() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.message || 'Offre introuvable');
      }
      const payload = await res.json();
      // API returns { data: job } in many endpoints
      const jobData = payload?.data || payload;
      setJob(jobData || null);
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

  // simple helper to validate an uploaded file; returns error message or empty string
  const validateDocument = (file: File) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      return 'Format non supporté, veuillez utiliser un PDF ou DOCX';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Fichier trop volumineux (max 5 Mo)';
    }
    return '';
  };

  const handleApplyRedirect = (path: string, docType: string) => {
    // save draft before leaving
    if (id) {
      localStorage.setItem(`apply_${id}`, JSON.stringify({ message, email: applicantEmail }));
    }
    const dest = `${path}?redirect=${encodeURIComponent(`${location.pathname}?docType=${docType}`)}`;
    navigate(dest);
  };

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

  // listen for any external pages saving a new document so we can refresh
  useEffect(() => {
    const handler = () => fetchUserDocs();
    window.addEventListener('user-documents-updated', handler);
    return () => window.removeEventListener('user-documents-updated', handler);
  }, []);

  // local persistence for unauthenticated users
  useEffect(() => {
    if (!user && id) {
      const stored = localStorage.getItem(`apply_${id}`);
      if (stored) {
        try {
          const obj = JSON.parse(stored);
          setMessage(obj.message || '');
          setApplicantEmail(obj.email || '');
        } catch {}
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (!user && id) {
      localStorage.setItem(`apply_${id}`, JSON.stringify({ message, email: applicantEmail }));
    }
  }, [message, applicantEmail, id, user]);

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
      let receipt_url = selectedReceipt?.storage_url || null;
      // if user selected to upload new files via file inputs (additionalFiles may include cv/letter/receipt uploads)
      if (selectedCv && selectedCv instanceof File) {
        cv_url = await handleUploadAndSave(selectedCv, 'cv');
      }
      if (selectedLetter && selectedLetter instanceof File) {
        cover_letter_url = await handleUploadAndSave(selectedLetter, 'letter');
      }
      if (selectedReceipt && selectedReceipt instanceof File) {
        receipt_url = await handleUploadAndSave(selectedReceipt, 'receipt');
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

      const bodyData: any = { job_id: job.id, cv_url, cover_letter_url, additional_docs: additional_urls, message };
      if (receipt_url) bodyData.receipt_url = receipt_url;
      if (!user && applicantEmail) bodyData.applicant_email = applicantEmail;

      const res = await fetch('/api/job-applications', {
        method: 'POST',
        headers: authHeaders('application/json'),
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.message || 'Erreur soumission');
      }

      toast.success('Candidature envoyée');
      // cleanup stored draft
      if (id) localStorage.removeItem(`apply_${id}`);
      // show success animation then redirect
      setSent(true);
      setTimeout(() => {
        navigate('/merci');
      }, 1800);
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin"/></div>;

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle className="h-20 w-20 text-green-500 animate-bounce mx-auto" />
          <p className="mt-4 text-xl font-semibold">Candidature envoyée avec succès !</p>
        </div>
      </div>
    );
  }

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
      <h1 className="text-3xl font-bold mb-2">Postuler — {job.title}</h1>
      <p className="text-sm text-muted-foreground mb-2">Entreprise : {job.company} • Lieu : {job.location}</p>
      {job.description && (
        <div className="mb-6 prose prose-sm prose-indigo">
          <p className="whitespace-pre-line text-gray-700">{job.description}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
        {!user && (
          <div>
            <Label>Email de contact</Label>
            <Input
              type="email"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <div className="flex items-center justify-between">
            <Label>CV (sélectionner un CV existant ou téléverser un nouveau)</Label>
            <button
              type="button"
              className="text-primary text-sm hover:underline"
              onClick={() => handleApplyRedirect('/cv-modeles', 'cv')}
            >
              Créer mon CV
            </button>
          </div>
          <div className="flex gap-2 items-center mt-2">
            <select className="flex-1" value={selectedCv?.id || ''} onChange={(e) => {
              const id = e.target.value;
              const found = docs.find(d => String(d.id) === String(id));
              setSelectedCv(found || null);
            }}>
              <option value="">-- choisir un CV existant --</option>
              {docs.filter(d => d.doc_type === 'cv').map(d => (<option key={d.id} value={d.id}>{d.title || d.storage_url}</option>))}
            </select>
            <input
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                setCvError('');
                const f = e.target.files?.[0];
                if (f) {
                  const err = validateDocument(f);
                  if (err) {
                    setCvError(err);
                  } else {
                    setSelectedCv(f);
                  }
                }
              }}
            />
          </div>
          {cvError && <p className="text-red-600 text-sm mt-1">{cvError}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Lettre de motivation (optionnel)</Label>
            <button
              type="button"
              className="text-primary text-sm hover:underline"
              onClick={() => handleApplyRedirect('/letter-modeles', 'letter')}
            >
              Rédiger ma lettre
            </button>
          </div>
          <div className="flex gap-2 items-center mt-2">
            <select className="flex-1" value={selectedLetter?.id || ''} onChange={(e) => {
              const id = e.target.value;
              const found = docs.find(d => String(d.id) === String(id));
              setSelectedLetter(found || null);
            }}>
              <option value="">-- choisir une lettre existante --</option>
              {docs.filter(d => d.doc_type === 'letter').map(d => (<option key={d.id} value={d.id}>{d.title || d.storage_url}</option>))}
            </select>
            <input
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                setLetterError('');
                const f = e.target.files?.[0];
                if (f) {
                  const err = validateDocument(f);
                  if (err) {
                    setLetterError(err);
                  } else {
                    setSelectedLetter(f);
                  }
                }
              }}
            />
          </div>
          {letterError && <p className="text-red-600 text-sm mt-1">{letterError}</p>}
        </div>

        <div>
          <Label>Récépissé (kilométrage, notes, etc.)</Label>
          <div className="flex gap-2 items-center mt-2">
            <input
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                setReceiptError('');
                const f = e.target.files?.[0];
                if (f) {
                  const err = validateDocument(f);
                  if (err) {
                    setReceiptError(err);
                  } else {
                    setSelectedReceipt(f);
                  }
                }
              }}
            />
          </div>
          {receiptError && <p className="text-red-600 text-sm mt-1">{receiptError}</p>}
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
