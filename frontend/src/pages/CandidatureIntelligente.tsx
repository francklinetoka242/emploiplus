// src/pages/CandidatureIntelligente.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { buildApiUrl } from '@/lib/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PWALayout } from '@/components/layout/PWALayout';
import { ArrowLeft, Sparkles, Briefcase, Building, Upload, CheckCircle, AlertCircle, Loader2, Download, Send, Mail } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface ExtractedCvData {
  name: string;
  education: string[];
  experience_years: number;
  skills: string[];
}

interface AnalysisResult {
  success: boolean;
  data: {
    jobId: string;
    jobTitle: string;
    company: string;
    score_matching: number;
    matched_elements: string[];
    missing_requirements: string[];
    points_forts: string[];
    competences_manquantes: string[];
    lettre_motivation: string;
  };
}

const CandidatureIntelligente = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lettreRef = useRef<HTMLDivElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCvData | null>(null);
  const [editedData, setEditedData] = useState<ExtractedCvData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [editedLetter, setEditedLetter] = useState<string>('');
  const [isEditingLetter, setIsEditingLetter] = useState(false);

  // Form submission states
  const [candidateEmail, setCandidateEmail] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');

  // Fetch job details
  const { data: job, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await api.getJobById(jobId!);
      return response.data;
    },
    enabled: !!jobId,
  });

  // Mutation for extracting CV data
  const extractMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('[Frontend] extractMutation starting with jobId:', jobId);
      
      if (!jobId) {
        throw new Error('ID de l\'offre d\'emploi manquant');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      console.log('[Frontend] Envoi vers /api/ai/extract-cv...');

      const apiUrl = buildApiUrl('/ai/extract-cv');
      console.log('[Frontend] URL construite:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'extraction';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = text.substring(0, 200) || `Erreur HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('[Frontend] ✅ CV data extracted:', data);
      setExtractedData(data.data);
      setEditedData(data.data);
      toast.success('Données du CV extraites avec succès !');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'extraction');
    },
  });

  // Mutation for CV analysis with extracted data
  const analyzeMutation = useMutation({
    mutationFn: async (cvData: ExtractedCvData) => {
      console.log('[Frontend] analyzeMutation starting with CV data:', cvData);
      
      if (!jobId) {
        throw new Error('ID de l\'offre d\'emploi manquant');
      }

      const response = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          cvData: cvData
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'analyse';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = text.substring(0, 200) || `Erreur HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setEditedLetter(data.data.lettre_motivation);
      toast.success('Analyse complétée avec succès !');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'analyse');
    },
  });

  // Mutation for final submission
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!candidateEmail || !companyEmail) {
        throw new Error('Veuillez remplir les adresses email');
      }

      const response = await fetch('/api/ai/send-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          candidateEmail,
          companyEmail,
          letter: editedLetter,
          matchingScore: analysisResult?.data.score_matching,
          strengths: analysisResult?.data.points_forts,
          message: submissionMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'envoi');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Candidature envoyée avec succès !');
      setTimeout(() => navigate('/emplois'), 2000);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Veuillez sélectionner un fichier PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier doit être inférieur à 10 MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleExtractData = () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }
    extractMutation.mutate(selectedFile);
  };

  const handleValidateAndAnalyze = () => {
    if (!editedData) {
      toast.error('Données du CV manquantes');
      return;
    }
    analyzeMutation.mutate(editedData);
  };

  const handleResetExtraction = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setEditedData(null);
    setAnalysisResult(null);
  };

  const handleExportPDF = () => {
    if (!analysisResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204);
    doc.text('Lettre de Motivation', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Poste: ${analysisResult.data.jobTitle}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Entreprise: ${analysisResult.data.company}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Score de correspondance: ${analysisResult.data.score_matching}%`, 20, yPosition);

    yPosition += 15;
    doc.setTextColor(0);
    doc.setFontSize(11);

    // Letter text with wrapping
    const letterLines = doc.splitTextToSize(editedLetter, pageWidth - 40);
    letterLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });

    doc.save(`lettre-motivation-${analysisResult.data.jobTitle}.pdf`);
    toast.success('PDF téléchargé avec succès !');
  };

  if (jobLoading) {
    return (
      <PWALayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </PWALayout>
    );
  }

  if (jobError || !job) {
    return (
      <PWALayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Erreur</h1>
            <p className="text-gray-600 mb-6">Impossible de charger les détails de l'offre.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Candidature Intelligente</h1>
            </div>
          </div>

          {/* Job Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Détails de l'offre d'emploi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Titre et Entreprise */}
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {job.title || 'Titre non disponible'}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Building className="w-4 h-4" />
                  <span className="font-medium">{job.company || 'Entreprise non spécifiée'}</span>
                  {job.website && (
                    <a
                      href={job.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      (Site web)
                    </a>
                  )}
                </div>
                {job.logo && (
                  <img
                    src={job.logo}
                    alt={`Logo ${job.company}`}
                    className="h-12 w-auto object-contain"
                  />
                )}
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Localisation:</span>
                    <p className="text-gray-900">{job.location || 'Non spécifiée'}</p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Type de contrat:</span>
                    <p className="text-gray-900">{job.type || job.job_type || 'Non spécifié'}</p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Secteur:</span>
                    <p className="text-gray-900">{job.sector || 'Non spécifié'}</p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Niveau d'expérience:</span>
                    <p className="text-gray-900">{job.experience_level || 'Non spécifié'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Salaire:</span>
                    <p className="text-gray-900">{job.salary || 'Non spécifié'}</p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Statut:</span>
                    <p className="text-gray-900">
                      {job.published ? 'Publiée' : 'Non publiée'}
                      {job.is_closed && ' (Fermée)'}
                    </p>
                  </div>

                  {job.published_at && (
                    <div>
                      <span className="font-medium text-gray-700">Date de publication:</span>
                      <p className="text-gray-900">
                        {new Date(job.published_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}

                  {job.deadline_date && (
                    <div>
                      <span className="font-medium text-gray-700">Date limite:</span>
                      <p className="text-gray-900">
                        {new Date(job.deadline_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {job.description && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Description du poste:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-line">{job.description}</p>
                  </div>
                </div>
              )}

              {/* Compétences requises */}
              {job.requirements && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Compétences requises:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-line">{job.requirements}</p>
                  </div>
                </div>
              )}

              {/* Informations système */}
              <div className="text-xs text-gray-500 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>ID de l'offre: {job.id}</div>
                  <div>Créée le: {new Date(job.created_at).toLocaleDateString('fr-FR')}</div>
                  {job.updated_at !== job.created_at && (
                    <div>Modifiée le: {new Date(job.updated_at).toLocaleDateString('fr-FR')}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Confirmation Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Confirmation de l'offre sélectionnée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {job.title || 'Titre non disponible'}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{job.company || 'Entreprise non spécifiée'}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Candidature Intelligente activée :</strong> Notre système va analyser votre CV,
                  évaluer votre adéquation avec le poste et générer une lettre de motivation personnalisée.
                </p>
              </div>
            </CardContent>
          </Card>

          {!analysisResult ? (
            /* CV Upload and Validation Section */
            <>
              {!extractedData ? (
                /* Step 1: File Upload */
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Étape 1 : Téléchargez votre CV (PDF)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {selectedFile ? (
                        <div className="space-y-3">
                          <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                            <p className="text-sm text-gray-600">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Changer le fichier
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 mb-2">
                            Cliquez pour sélectionner un fichier PDF ou glissez-le ici
                          </p>
                          <p className="text-xs text-gray-500">
                            Taille maximale : 10 MB
                          </p>
                          <Button
                            className="mt-4"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Sélectionner un fichier
                          </Button>
                        </div>
                      )}
                    </div>

                    {selectedFile && (
                      <Button
                        onClick={handleExtractData}
                        disabled={extractMutation.isPending}
                        className="w-full"
                        size="lg"
                      >
                        {extractMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Extraction des données...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Extraire les données
                          </>
                        )}
                      </Button>
                    )}

                    {extractMutation.isPending && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3 items-start">
                          <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                          <div>
                            <p className="font-semibold text-blue-900">Extraction en cours...</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Analyse de votre CV pour extraire les données factuelles.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {extractMutation.isError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800">Erreur lors de l'extraction</p>
                          <p className="text-sm text-red-700">
                            {extractMutation.error instanceof Error ? extractMutation.error.message : 'Erreur inconnue'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* Step 2: Validate and Modify Extracted Data */
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Étape 2 : Vérifiez et modifiez vos données</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Vérification des données extraites :</strong> Assurez-vous que les informations sont correctes. 
                        Vous pouvez les modifier avant de procéder à l'analyse comparative.
                      </p>
                    </div>

                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom
                      </label>
                      <Input
                        value={editedData?.name || ''}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full"
                      />
                    </div>

                    {/* Diplômes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Diplômes et formations
                      </label>
                      <div className="space-y-2">
                        {editedData?.education.map((edu, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={edu}
                              onChange={(e) => {
                                setEditedData(prev => {
                                  if (!prev) return null;
                                  const newEducation = [...prev.education];
                                  newEducation[index] = e.target.value;
                                  return { ...prev, education: newEducation };
                                });
                              }}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditedData(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    education: prev.education.filter((_, i) => i !== index)
                                  };
                                });
                              }}
                            >
                              Supprimer
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedData(prev => 
                              prev ? { ...prev, education: [...prev.education, ''] } : null
                            );
                          }}
                          className="w-full"
                        >
                          + Ajouter un diplôme
                        </Button>
                      </div>
                    </div>

                    {/* Années d'expérience */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Années d'expérience
                      </label>
                      <Input
                        type="number"
                        value={editedData?.experience_years || 0}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, experience_years: parseInt(e.target.value) || 0 } : null)}
                        className="w-full"
                        min="0"
                      />
                    </div>

                    {/* Compétences */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Compétences techniques
                      </label>
                      <div className="space-y-2">
                        {editedData?.skills.map((skill, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={skill}
                              onChange={(e) => {
                                setEditedData(prev => {
                                  if (!prev) return null;
                                  const newSkills = [...prev.skills];
                                  newSkills[index] = e.target.value;
                                  return { ...prev, skills: newSkills };
                                });
                              }}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditedData(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    skills: prev.skills.filter((_, i) => i !== index)
                                  };
                                });
                              }}
                            >
                              Supprimer
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedData(prev => 
                              prev ? { ...prev, skills: [...prev.skills, ''] } : null
                            );
                          }}
                          className="w-full"
                        >
                          + Ajouter une compétence
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleResetExtraction}
                        className="flex-1"
                      >
                        Télécharger un autre CV
                      </Button>
                      <Button
                        onClick={handleValidateAndAnalyze}
                        disabled={analyzeMutation.isPending}
                        className="flex-1"
                        size="lg"
                      >
                        {analyzeMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Valider et Analyser
                          </>
                        )}
                      </Button>
                    </div>

                    {analyzeMutation.isPending && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3 items-start">
                          <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                          <div>
                            <p className="font-semibold text-blue-900">Analyse en cours...</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Comparaison de vos données avec l'offre d'emploi.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {analyzeMutation.isError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800">Erreur lors de l'analyse</p>
                          <p className="text-sm text-red-700">
                            {analyzeMutation.error instanceof Error ? analyzeMutation.error.message : 'Erreur inconnue'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Analysis Results Section */
            <div className="space-y-6">
              {/* Score Card */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">Score de correspondance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-5xl font-bold text-green-600">
                        {analysisResult.data.score_matching}%
                      </p>
                      <p className="text-sm text-green-700 mt-2">
                        Alignement avec l'offre d'emploi
                      </p>
                    </div>
                    <div className="w-32 h-32 rounded-full border-4 border-green-600 flex items-center justify-center">
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-green-600 font-semibold">Analysé</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Matched Elements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Éléments de votre CV qui correspondent</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.data.matched_elements && analysisResult.data.matched_elements.length > 0 ? (
                    <ul className="space-y-3">
                      {analysisResult.data.matched_elements.map((element, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{element}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucun élément correspondant identifié</p>
                  )}
                </CardContent>
              </Card>

              {/* Missing Requirements */}
              {analysisResult.data.missing_requirements && analysisResult.data.missing_requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-amber-700">Exigences de l'offre absentes de votre CV</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResult.data.missing_requirements.map((requirement, index) => (
                        <li key={index} className="flex gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Points Forts (Original Strengths) */}
              {analysisResult.data.points_forts && analysisResult.data.points_forts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-700">Points forts identifiés par l'IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResult.data.points_forts.map((point, index) => (
                        <li key={index} className="flex gap-3">
                          <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Lettre de Motivation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Votre lettre de motivation</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingLetter(!isEditingLetter)}
                    >
                      {isEditingLetter ? 'Aperçu' : 'Modifier'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingLetter ? (
                    <textarea
                      value={editedLetter}
                      onChange={(e) => setEditedLetter(e.target.value)}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Modifiez votre lettre ici..."
                    />
                  ) : (
                    <div
                      ref={lettreRef}
                      className="bg-gray-50 p-6 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-800 text-sm leading-relaxed max-h-96 overflow-y-auto"
                    >
                      {editedLetter}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleExportPDF}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter en PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(editedLetter);
                        toast.success('Lettre copiée dans le presse-papiers');
                      }}
                      className="flex-1"
                    >
                      Copier la lettre
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Formulaire d'envoi */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Send className="w-5 h-5" />
                    Envoyez votre candidature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Votre adresse email
                      </label>
                      <Input
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="votre.email@exemple.com"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email de l'entreprise
                      </label>
                      <Input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        placeholder="recrutement@entreprise.com"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Message additionnel (optionnel)
                      </label>
                      <textarea
                        value={submissionMessage}
                        onChange={(e) => setSubmissionMessage(e.target.value)}
                        placeholder="Ajoutez un message personnalisé..."
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                      />
                    </div>

                    <Button
                      onClick={() => submitMutation.mutate()}
                      disabled={submitMutation.isPending || !candidateEmail || !companyEmail}
                      className="w-full"
                      size="lg"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer ma candidature
                        </>
                      )}
                    </Button>

                    {submitMutation.isError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                          {submitMutation.error instanceof Error
                            ? submitMutation.error.message
                            : 'Erreur lors de l\'envoi'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setExtractedData(null);
                    setEditedData(null);
                    setAnalysisResult(null);
                    setEditedLetter('');
                    setCandidateEmail('');
                    setCompanyEmail('');
                  }}
                  className="flex-1"
                >
                  Analyser un autre CV
                </Button>
                <Button
                  onClick={() => navigate('/emplois')}
                  variant="outline"
                  className="flex-1"
                >
                  Voir d'autres offres
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PWALayout>
  );
};

export default CandidatureIntelligente;