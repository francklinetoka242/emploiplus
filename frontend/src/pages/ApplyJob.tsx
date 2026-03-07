import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadFile } from "@/lib/upload";
import { useAuth } from "@/hooks/useAuth";
import { authHeaders } from '@/lib/headers';
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  File,
  Briefcase,
  MapPin,
  Building,
  Calendar,
  Sparkles,
  Edit3,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PWALayout } from '@/components/layout/PWALayout';

// PDF Preview Component
const PDFPreview = ({ file, url, title, onRemove }: {
  file?: File;
  url?: string;
  title: string;
  onRemove?: () => void;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      setPreviewUrl(url);
    } else if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file, url]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <FileText className="w-8 h-8 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-500">PDF • Prêt à soumettre</p>
        </div>
        <div className="flex gap-2">
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.open(previewUrl, '_blank')}
              className="p-1 h-8 w-8"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Drag & Drop Upload Zone
const DragDropZone = ({
  onFileSelect,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB
  placeholder,
  error,
  disabled = false
}: {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSize?: number;
  placeholder: string;
  error?: string;
  disabled?: boolean;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      validateAndSelectFile(file);
    }
  }, [disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  }, []);

  const validateAndSelectFile = (file: File) => {
    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    if (!allowedTypes.some(type => file.type === type || file.name.toLowerCase().endsWith(type.replace('*', '')))) {
      toast.error(`Type de fichier non accepté. Formats acceptés: ${accept}`);
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      toast.error(`Fichier trop volumineux. Taille maximale: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <Upload className={`w-8 h-8 mx-auto mb-2 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>
          {placeholder}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF, DOCX • Max {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Form state
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasRecipientEmail, setHasRecipientEmail] = useState(false);

  // Form data
  const [applicantEmail, setApplicantEmail] = useState('');
  const [message, setMessage] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

  // Documents from localStorage (for return from editors)
  const [storedCv, setStoredCv] = useState<any>(null);
  const [storedLetter, setStoredLetter] = useState<any>(null);

  // User documents (for logged-in users)
  const [userDocs, setUserDocs] = useState<any[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load data on mount
  useEffect(() => {
    if (!id) return;
    fetchJob();
    if (user) {
      fetchUserDocs();
      checkIfAlreadyApplied();
    }

    // Load from localStorage for persistence
    const savedEmail = localStorage.getItem(`apply_${id}_email`);
    const savedMessage = localStorage.getItem(`apply_${id}_message`);
    if (savedEmail) setApplicantEmail(savedEmail);
    if (savedMessage) setMessage(savedMessage);

    // Check for redirect from editors
    const redirect = searchParams.get('redirect');
    if (redirect) {
      checkForStoredDocuments();
    }
  }, [id, user, searchParams]);

  // fetch single job detail
  async function fetchJob() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.message || 'Offre introuvable');
      }
      const payload = await res.json();
      const jobData = payload?.data || payload;
      setJob(jobData || null);
      setHasRecipientEmail(!!(jobData?.application_email || jobData?.company_email));
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger l\'offre');
    } finally {
      setLoading(false);
    }
  }

  // Real-time save to localStorage
  useEffect(() => {
    if (applicantEmail) {
      localStorage.setItem(`apply_${id}_email`, applicantEmail);
    }
  }, [applicantEmail, id]);

  useEffect(() => {
    if (message) {
      localStorage.setItem(`apply_${id}_message`, message);
    }
  }, [message, id]);


  const checkIfAlreadyApplied = async () => {
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
  };

  const fetchUserDocs = async () => {
    try {
      const res = await fetch('/api/user-documents', { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setUserDocs(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const checkForStoredDocuments = () => {
    const cvData = localStorage.getItem('cv_created');
    const letterData = localStorage.getItem('letter_created');

    if (cvData) {
      try {
        const cv = JSON.parse(cvData);
        setStoredCv(cv);
        // Clear the stored data
        localStorage.removeItem('cv_created');
      } catch (e) {
        console.error('Error parsing stored CV:', e);
      }
    }

    if (letterData) {
      try {
        const letter = JSON.parse(letterData);
        setStoredLetter(letter);
        // Clear the stored data
        localStorage.removeItem('letter_created');
      } catch (e) {
        console.error('Error parsing stored letter:', e);
      }
    }
  };

  const handleCvSelect = (file: File) => {
    setCvFile(file);
    setStoredCv(null); // Clear stored CV if user uploads new one
    setErrors(prev => ({ ...prev, cv: '' }));
  };

  const handleLetterSelect = (file: File) => {
    setLetterFile(file);
    setStoredLetter(null); // Clear stored letter if user uploads new one
    setErrors(prev => ({ ...prev, letter: '' }));
  };

  const handleAdditionalFilesSelect = (files: File[]) => {
    setAdditionalFiles(files);
    setErrors(prev => ({ ...prev, additional: '' }));
  };

  const removeCv = () => {
    setCvFile(null);
    setStoredCv(null);
  };

  const removeLetter = () => {
    setLetterFile(null);
    setStoredLetter(null);
  };

  const createCv = () => {
    const redirectUrl = `/recrutement/postuler/${id}?redirect=true`;
    navigate(`/cv-generator?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  const createLetter = () => {
    const redirectUrl = `/recrutement/postuler/${id}?redirect=true`;
    navigate(`/letter-generator?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!applicantEmail) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(applicantEmail)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!cvFile && !storedCv) {
      newErrors.cv = 'Un CV est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !validateForm() || !hasRecipientEmail) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      let cv_url = storedCv?.storage_url || null;
      let cover_letter_url = storedLetter?.storage_url || null;

      // Upload new files if selected
      if (cvFile) {
        cv_url = await uploadFile(cvFile, token, 'applications');
        if (user) {
          await saveToUserDocs(cvFile, cv_url, 'cv');
        }
      }

      if (letterFile) {
        cover_letter_url = await uploadFile(letterFile, token, 'applications');
        if (user) {
          await saveToUserDocs(letterFile, cover_letter_url, 'letter');
        }
      }

      const additional_urls: string[] = [];
      for (const f of additionalFiles) {
        const u = await uploadFile(f, token, 'applications');
        additional_urls.push(u);
        if (user) {
          await saveToUserDocs(f, u, 'other');
        }
      }

      const res = await fetch('/api/job-applications', {
        method: 'POST',
        headers: authHeaders('application/json'),
        body: JSON.stringify({
          job_id: job.id,
          cv_url,
          cover_letter_url,
          additional_docs: additional_urls,
          message,
          applicant_email: applicantEmail
        }),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.message || 'Erreur soumission');
      }

      // Clear localStorage on success
      localStorage.removeItem(`apply_${id}_email`);
      localStorage.removeItem(`apply_${id}_message`);

      setSuccess(true);
      setTimeout(() => {
        navigate('/merci');
      }, 2000);

    } catch (err) {
      const e = err as Error;
      toast.error(e.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const saveToUserDocs = async (file: File, url: string, docType: string) => {
    try {
      await fetch('/api/user-documents', {
        method: 'POST',
        headers: authHeaders('application/json'),
        body: JSON.stringify({
          doc_type: docType,
          title: file.name,
          storage_url: url
        }),
      });
    } catch (e) {
      console.error('Error saving to user docs:', e);
    }
  };

  if (loading) {
    return (
      <PWALayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PWALayout>
    );
  }

  if (!job) {
    return (
      <PWALayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold mb-3">Offre introuvable</h2>
              <p className="text-sm text-muted-foreground mb-4">
                L'offre demandée est introuvable ou vous n'avez pas la permission d'y accéder.
              </p>
              <Button onClick={() => navigate('/emplois')}>
                Retour aux offres
              </Button>
            </CardContent>
          </Card>
        </div>
      </PWALayout>
    );
  }

  const deadlineExpired = job?.deadline ? new Date(String(job.deadline)).getTime() < Date.now() : false;

  if (deadlineExpired) {
    return (
      <PWALayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardContent className="p-8">
              <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-3">Date limite dépassée</h2>
              <p className="text-sm text-muted-foreground mb-4">
                La date limite pour cette offre est passée.
              </p>
              <Button onClick={() => navigate('/emplois')}>
                Retour aux offres
              </Button>
            </CardContent>
          </Card>
        </div>
      </PWALayout>
    );
  }

  if (alreadyApplied) {
    return (
      <PWALayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardContent className="p-8">
              <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-3">Déjà postulé</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Vous avez déjà postulé pour cette offre.
              </p>
              <Button onClick={() => navigate('/emplois')}>
                Retour aux offres
              </Button>
            </CardContent>
          </Card>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout>
      <div className="min-h-screen bg-gray-50">
        {/* Success Animation */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white rounded-lg p-8 text-center max-w-sm mx-4"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Candidature envoyée !</h3>
                <p className="text-gray-600 mb-4">
                  Votre candidature a été transmise avec succès.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate('/merci')}
                    className="w-full"
                  >
                    Voir le récapitulatif
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/emplois')}
                    className="w-full"
                  >
                    Voir d'autres offres
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Job Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-lg p-6"
            >
              <div className="sticky top-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h1>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  {job.contract_type && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>Contrat: {job.contract_type}</span>
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">💰</span>
                      <span>Salaire: {job.salary}</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Date limite: {new Date(job.deadline).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {job.sector && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">🏢</span>
                      <span>Secteur: {job.sector}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Description de l'offre</h3>
                  <div
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: job.description || '<p class="text-gray-500 italic">Aucune description détaillée disponible pour cette offre.</p>'
                    }}
                  />
                </div>

                {/* Requirements/Competences */}
                {job.requirements && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Exigences</h3>
                    <div
                      className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: job.requirements
                      }}
                    />
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Avantages</h3>
                    <div
                      className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: job.benefits
                      }}
                    />
                  </div>
                )}

                {/* Skills */}
                {job.skills && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Compétences requises</h3>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(job.skills) ? job.skills : []).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {job.contact_email && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-blue-900">Informations de contact</h3>
                    <p className="text-blue-800">
                      Pour toute question concernant cette offre, contactez: <strong>{job.contact_email}</strong>
                    </p>
                  </div>
                )}

                {/* application email: where candidates should send their CV */}
                {job.application_email && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-green-900">Email de candidature</h3>
                    <p className="text-green-800">
                      Pour postuler, envoyez votre CV / lettre de motivation à : <strong>{job.application_email}</strong>
                    </p>
                  </div>
                )}

                {/* Application Instructions */}
                {job.application_instructions && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Modalités de candidature</h3>
                    <div
                      className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: job.application_instructions
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Application Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Postuler à cette offre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email de contact *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="votre.email@exemple.com"
                        className={`mt-1 ${errors.email ? 'border-red-300' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* CV Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">Curriculum Vitae *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={createCv}
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Créer mon CV
                        </Button>
                      </div>

                      {storedCv ? (
                        <PDFPreview
                          url={storedCv.storage_url}
                          title={storedCv.title || "CV créé"}
                          onRemove={removeCv}
                        />
                      ) : cvFile ? (
                        <PDFPreview
                          file={cvFile}
                          title={cvFile.name}
                          onRemove={removeCv}
                        />
                      ) : (
                        <DragDropZone
                          onFileSelect={handleCvSelect}
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          placeholder="Glissez votre CV ici ou cliquez pour sélectionner"
                          error={errors.cv}
                        />
                      )}
                    </div>

                    {/* Letter Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">Lettre de motivation</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={createLetter}
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Rédiger ma lettre
                        </Button>
                      </div>

                      {storedLetter ? (
                        <PDFPreview
                          url={storedLetter.storage_url}
                          title={storedLetter.title || "Lettre créée"}
                          onRemove={removeLetter}
                        />
                      ) : letterFile ? (
                        <PDFPreview
                          file={letterFile}
                          title={letterFile.name}
                          onRemove={removeLetter}
                        />
                      ) : (
                        <DragDropZone
                          onFileSelect={handleLetterSelect}
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          placeholder="Glissez votre lettre ici ou cliquez pour sélectionner (optionnel)"
                          error={errors.letter}
                        />
                      )}
                    </div>

                    {/* Additional Documents */}
                    <div>
                      <Label className="text-sm font-medium">Documents supplémentaires</Label>
                      <p className="text-xs text-gray-500 mb-3">
                        CNI, diplômes, certificats... (optionnel)
                      </p>
                      <DragDropZone
                        onFileSelect={(file) => handleAdditionalFilesSelect([...additionalFiles, file])}
                        accept=".pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                        placeholder="Ajoutez vos documents supplémentaires"
                        error={errors.additional}
                      />
                      {additionalFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {additionalFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                              <File className="w-4 h-4 text-gray-500" />
                              <span className="text-sm flex-1">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newFiles = additionalFiles.filter((_, i) => i !== index);
                                  setAdditionalFiles(newFiles);
                                }}
                                className="p-1 h-6 w-6 text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <Label htmlFor="message" className="text-sm font-medium">
                        Message d'accompagnement
                      </Label>
                      <Textarea
                        id="message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Présentez-vous brièvement et expliquez votre motivation..."
                        className="mt-1 resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {message.length}/500 caractères
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={submitting || !hasRecipientEmail}
                        className="w-full py-3 text-lg font-medium"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : !hasRecipientEmail ? (
                          <>
                            <X className="w-5 h-5 mr-2" />
                            Aucun email de contact disponible
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Envoyer ma candidature
                          </>
                        )}
                      </Button>
                      {!hasRecipientEmail && (
                        <p className="text-sm text-red-600 mt-2 text-center">
                          Cette offre n'a pas d'adresse email configurée pour recevoir les candidatures.
                        </p>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PWALayout>
  );
}
