import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { authHeaders } from '@/lib/headers';
import { uploadFile } from '@/lib/upload';
import { Plus, Trash2, Download, Eye } from "lucide-react";
import html2pdf from "html2pdf.js";
import { CVTemplateExecutive } from "@/components/cv-templates/CVTemplateExecutive";

// Helper: export HTML content as a Word (.doc) file
const exportHtmlAsWord = (filename: string, element: HTMLElement) => {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${element.innerHTML}</body></html>`;
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".doc") ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

interface CVData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    year: string;
  }>;
  skills: string[];
  template: "white" | "blue" | "orange" | "red" | "yellow" | "executive";
  language?: "fr" | "en";
  job_title?: string;
  languages?: Array<{ name: string; level: string }>;
}

const DEMO_TEMPLATES = [
  { id: "white", name: "Classique Blanc", color: "from-gray-50 to-white", icon: "📄", desc: "Simplicité et professionnel" },
  { id: "blue", name: "Bleu Professionnel", color: "from-blue-500 to-blue-700", icon: "💼", desc: "Modern et confiant" },
  { id: "orange", name: "Orange Dynamique", color: "from-orange-500 to-orange-700", icon: "⚡", desc: "Énergique et créatif" },
  { id: "red", name: "Rouge Impactant", color: "from-red-500 to-red-700", icon: "❤️", desc: "Affirmer votre passion" },
  { id: "yellow", name: "Jaune Optimiste", color: "from-yellow-500 to-yellow-600", icon: "✨", desc: "Chaleureux et optimiste" },
  { id: "executive", name: "Cadre Professionnel", color: "from-gray-700 to-gray-900", icon: "🏢", desc: "Design haute performance pour cadres" },
];

export default function CVGenerator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cvs, setCVs] = useState<CVData[]>([]);
  const [isLoggedIn] = useState(!!localStorage.getItem("token"));
  const [selectedCV, setSelectedCV] = useState<CVData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Check for redirect parameter
  const redirectUrl = searchParams.get('redirect');

  useEffect(() => {
    // Charger les CVs depuis localStorage
    const saved = localStorage.getItem("userCVs");
    if (saved) {
      setCVs(JSON.parse(saved));
    }
  }, []);

  // Persist CVs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userCVs", JSON.stringify(cvs));
  }, [cvs]);

  const createNewCV = (template: "white" | "blue" | "orange" | "red" | "yellow" | "executive" = "white") => {
    const maxCVs = isLoggedIn ? Infinity : 2;
    if (cvs.length >= maxCVs) {
      toast.error(`Limite atteinte: ${maxCVs} CV maximum`);
      return;
    }

    const newCV: CVData = {
      id: Date.now().toString(),
      fullName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      experiences: [],
      education: [],
      skills: [],
      template,
      language: "fr",
      job_title: "",
      languages: [],
    };

    setCVs([...cvs, newCV]);
    setSelectedCV(newCV);
  };

  const updateCV = (updates: Partial<CVData>) => {
    if (!selectedCV) return;
    const updated = { ...selectedCV, ...updates };
    setSelectedCV(updated);
    setCVs(cvs.map((cv) => (cv.id === selectedCV.id ? updated : cv)));
  };

  const addExperience = () => {
    if (!selectedCV) return;
    const newExp = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    updateCV({
      experiences: [...selectedCV.experiences, newExp],
    });
  };

  const addEducation = () => {
    if (!selectedCV) return;
    const newEdu = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      field: "",
      year: "",
    };
    updateCV({
      education: [...selectedCV.education, newEdu],
    });
  };

  const deleteCV = (id: string) => {
    setCVs(cvs.filter((cv) => cv.id !== id));
    if (selectedCV?.id === id) {
      setSelectedCV(null);
    }
    toast.success("CV supprimé");
  };

  const exportPDF = () => {
    if (!selectedCV) return;
    const element = document.getElementById("cv-preview");
    if (!element) return;

    const options = {
      margin: 10,
      filename: `${selectedCV.fullName || "CV"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(options).from(element).save();
    toast.success("PDF généré avec succès");
  };

  const exportWord = () => {
    if (!selectedCV) return;
    const element = document.getElementById("cv-preview");
    if (!element) return;
    exportHtmlAsWord(`${selectedCV.fullName || "CV"}.doc`, element);
    toast.success("Document Word généré");
  };

  const saveToAccount = async () => {
    if (!selectedCV) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Veuillez vous connecter pour enregistrer le CV");
      return;
    }

    try {
      const element = document.getElementById("cv-preview");
      if (!element) throw new Error("Aperçu introuvable");

      // Generate PDF blob using html2pdf (returns jsPDF instance via .get('pdf'))
      const options = {
        margin: 10,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      } as Record<string, unknown>;

      type JsPdfLike = { output: (mode: string) => Blob };

      const pdfPromise: Promise<JsPdfLike> = new Promise((resolve, reject) => {
        try {
          html2pdf()
            .set(options)
            .from(element)
            .toPdf()
            .get("pdf")
            .then((pdf: unknown) => resolve(pdf as JsPdfLike))
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      });

      const pdf = await pdfPromise;
      // Get blob from jsPDF
      const blob: Blob = pdf.output("blob");

      const blobToBase64 = (b: Blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1] || "";
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(b);
      });

      // Create a File from the PDF blob and use the centralized upload helper
      const file = new File([blob], `${selectedCV.fullName || 'cv'}.pdf`, { type: 'application/pdf' });
      const storage_url = await uploadFile(file, token, 'documents');

      // Create user document referencing the stored file
      const res = await fetch("/api/user-documents", {
        method: "POST",
        headers: authHeaders('application/json'),
        body: JSON.stringify({
          doc_type: "cv",
          title: selectedCV.fullName || `CV - ${new Date().toLocaleDateString()}`,
          metadata: selectedCV,
          storage_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur serveur");
      toast.success("CV enregistré dans votre compte");

      // Store created CV in localStorage for redirect back to application
      const createdDoc = {
        id: data.id,
        title: selectedCV.fullName || `CV - ${new Date().toLocaleDateString()}`,
        storage_url,
        doc_type: 'cv',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('cv_created', JSON.stringify(createdDoc));

      // notify other parts of the app (Settings) to refresh documents
      window.dispatchEvent(new Event('user-documents-updated'));

      // Redirect back if redirect URL is provided
      if (redirectUrl) {
        toast.success("CV créé ! Retour à la candidature...");
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      const message = typeof err === "object" && err !== null && "message" in err
        ? String((err as Record<string, unknown>).message)
        : String(err);
      toast.error(message || "Impossible d'enregistrer le CV");
    }
  };

  const CVPreview = ({ cv }: { cv: CVData }) => {
    // If template is executive, use CVTemplateExecutive
    if (cv.template === "executive") {
      return (
        <CVTemplateExecutive 
          data={{
            full_name: cv.fullName || "Votre Nom",
            job_title: cv.job_title || "Votre Poste",
            email: cv.email || "",
            phone: cv.phone || "",
            location: cv.location || "",
            summary: cv.summary,
            experiences: cv.experiences.map(exp => ({
              company: exp.company,
              position: exp.position,
              startDate: exp.startDate,
              endDate: exp.endDate,
              description: exp.description,
            })),
            education: cv.education.map(edu => ({
              school: edu.school,
              degree: edu.degree,
              field: edu.field,
              year: edu.year,
            })),
            skills: cv.skills,
            languages: cv.languages || [],
          }}
        />
      );
    }

    // Otherwise show inline preview
    return (
    <div
      id="cv-preview"
      className={`bg-white p-6 sm:p-12 max-w-4xl mx-auto ${
        cv.template === "white"
          ? "shadow-lg border"
          : cv.template === "blue"
            ? "shadow-2xl bg-gradient-to-br from-blue-50 to-white"
            : cv.template === "orange"
              ? "shadow-2xl bg-gradient-to-br from-orange-50 to-white"
              : cv.template === "red"
                ? "shadow-2xl bg-gradient-to-br from-red-50 to-white border-l-8 border-red-500"
                : "shadow-2xl bg-gradient-to-br from-yellow-50 to-white border-t-4 border-yellow-500"
      }`}
    >
      {/* En-tête */}
      <div className="mb-8 pb-8 border-b-2">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">{cv.fullName || "Votre Nom"}</h1>
        <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
          {cv.email && <span>✉️ {cv.email}</span>}
          {cv.phone && <span>📱 {cv.phone}</span>}
          {cv.location && <span>📍 {cv.location}</span>}
        </div>
      </div>

      {(() => {
        const lang = cv.language || "fr";
        const labels: Record<string, Record<string, string>> = {
          fr: {
            profile: "Profil",
            experience: "Expérience professionnelle",
            education: "Formation",
            skills: "Compétences",
          },
          en: {
            profile: "Profile",
            experience: "Work Experience",
            education: "Education",
            skills: "Skills",
          },
        };
        const L = labels[lang];

        return (
          <>
            {/* Résumé */}
            {cv.summary && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{L.profile}</h2>
                <p className="text-gray-700 leading-relaxed">{cv.summary}</p>
              </div>
            )}

            {/* Expériences */}
            {cv.experiences.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{L.experience}</h2>
                {cv.experiences.map((exp) => (
                  <div key={exp.id} className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{exp.position}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {exp.startDate} - {exp.endDate}
                      </p>
                    </div>
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Formation */}
            {cv.education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{L.education}</h2>
                {cv.education.map((edu) => (
                  <div key={edu.id} className="mb-3">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.school}</p>
                        <p className="text-sm text-gray-500">{edu.field}</p>
                      </div>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compétences */}
            {cv.skills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{L.skills}</h2>
                <div className="flex flex-wrap gap-2">
                  {cv.skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b py-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Créateur de CV</h1>
          <p className="text-muted-foreground mt-1">
            {isLoggedIn ? (
              "Créez vos CVs illimités — vous pouvez les enregistrer et exporter."
            ) : (
              <>
                {`Créez jusqu'à 2 CVs (${cvs.length}/2)`}
                <span className="block mt-1">Pour créer plus de CVs et lettres, créez un compte.</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          <Button asChild className="mr-2">
            <a href="/letter-generator">Aller à la lettre de motivation</a>
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Liste des CVs et formulaire */}
          <div className="lg:col-span-1">
            {/* Créer nouveau CV */}
            <Card className="p-6 mb-6">
              <h3 className="font-bold mb-4">Créer un nouveau CV</h3>
              <div className="space-y-3">
                {DEMO_TEMPLATES.filter((t) => {
                  // Show first 3 (white, blue, orange) for guests, all 5 for logged-in users
                  if (isLoggedIn) return true;
                  return ["white", "blue", "orange"].includes(t.id);
                }).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      createNewCV(template.id as "white" | "blue" | "orange" | "red" | "yellow")
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Mes CVs */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Mes CVs</h3>
              {cvs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun CV créé</p>
              ) : (
                <div className="space-y-3">
                  {cvs.map((cv) => (
                    <Card
                      key={cv.id}
                      className={`p-4 cursor-pointer transition ${
                        selectedCV?.id === cv.id
                          ? "border-blue-500 border-2 bg-blue-50"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedCV(cv)}
                    >
                      <p className="font-medium text-sm truncate">
                        {cv.fullName || "Sans titre"}
                      </p>
                      <p className="text-xs text-muted-foreground">{cv.template}</p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          {selectedCV ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Formulaire d'édition */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Éditer le CV</h2>

                {/* Infos personnelles */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nom complet</Label>
                      <Input
                        value={selectedCV.fullName}
                        onChange={(e) => updateCV({ fullName: e.target.value })}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={selectedCV.email}
                        onChange={(e) => updateCV({ email: e.target.value })}
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div>
                      <Label>Téléphone</Label>
                      <Input
                        value={selectedCV.phone}
                        onChange={(e) => updateCV({ phone: e.target.value })}
                        placeholder="+242 06 000 00 00"
                      />
                    </div>
                    <div>
                      <Label>Lieu</Label>
                      <Input
                        value={selectedCV.location}
                        onChange={(e) => updateCV({ location: e.target.value })}
                        placeholder="Brazzaville"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Profil / Résumé</Label>
                    <Textarea
                      value={selectedCV.summary}
                      onChange={(e) => updateCV({ summary: e.target.value })}
                      placeholder="Décrivez brièvement votre profil..."
                      rows={3}
                    />
                  </div>
                </div>

                  {/* Template & Language */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Thème (couleur)</Label>
                        <select
                          value={selectedCV.template}
                          onChange={(e) => updateCV({ template: e.target.value as "white" | "blue" | "orange" | "red" | "yellow" })}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          {DEMO_TEMPLATES.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Langue</Label>
                        <select
                          value={selectedCV.language || "fr"}
                          onChange={(e) => updateCV({ language: e.target.value as "fr" | "en" })}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                  </div>

                {/* Expériences */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Expérience professionnelle</h3>
                    <Button size="sm" onClick={addExperience}>
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  {selectedCV.experiences.map((exp) => (
                    <Card key={exp.id} className="p-4 mb-4 border-l-4 border-l-blue-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Entreprise"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = selectedCV.experiences.map((expItem) =>
                              expItem.id === exp.id ? { ...expItem, company: e.target.value } : expItem
                            );
                            updateCV({ experiences: updated });
                          }}
                        />
                        <Input
                          placeholder="Poste"
                          value={exp.position}
                          onChange={(e) => {
                            const updated = selectedCV.experiences.map((x) =>
                              x.id === exp.id ? { ...x, position: e.target.value } : x
                            );
                            updateCV({ experiences: updated });
                          }}
                        />
                        <Input
                          placeholder="Date début"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = selectedCV.experiences.map((x) =>
                              x.id === exp.id ? { ...x, startDate: e.target.value } : x
                            );
                            updateCV({ experiences: updated });
                          }}
                        />
                        <Input
                          placeholder="Date fin"
                          value={exp.endDate}
                          onChange={(e) => {
                            const updated = selectedCV.experiences.map((x) =>
                              x.id === exp.id ? { ...x, endDate: e.target.value } : x
                            );
                            updateCV({ experiences: updated });
                          }}
                        />
                        <Textarea
                          placeholder="Description"
                          value={exp.description}
                          onChange={(e) => {
                            const updated = selectedCV.experiences.map((x) =>
                              x.id === exp.id ? { ...x, description: e.target.value } : x
                            );
                            updateCV({ experiences: updated });
                          }}
                          className="md:col-span-2"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-2"
                        onClick={() => {
                          updateCV({
                            experiences: selectedCV.experiences.filter((x) => x.id !== exp.id),
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>

                {/* Formation */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Formation</h3>
                    <Button size="sm" onClick={addEducation}>
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  {selectedCV.education.map((edu) => (
                    <Card key={edu.id} className="p-4 mb-4 border-l-4 border-l-green-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="École/Université"
                          value={edu.school}
                          onChange={(e) => {
                            const updated = selectedCV.education.map((x) =>
                              x.id === edu.id ? { ...x, school: e.target.value } : x
                            );
                            updateCV({ education: updated });
                          }}
                        />
                        <Input
                          placeholder="Diplôme"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = selectedCV.education.map((x) =>
                              x.id === edu.id ? { ...x, degree: e.target.value } : x
                            );
                            updateCV({ education: updated });
                          }}
                        />
                        <Input
                          placeholder="Domaine d'étude"
                          value={edu.field}
                          onChange={(e) => {
                            const updated = selectedCV.education.map((x) =>
                              x.id === edu.id ? { ...x, field: e.target.value } : x
                            );
                            updateCV({ education: updated });
                          }}
                        />
                        <Input
                          placeholder="Année"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = selectedCV.education.map((x) =>
                              x.id === edu.id ? { ...x, year: e.target.value } : x
                            );
                            updateCV({ education: updated });
                          }}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-2"
                        onClick={() => {
                          updateCV({
                            education: selectedCV.education.filter((x) => x.id !== edu.id),
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto py-3"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? "Masquer" : "Afficher"} l'aperçu
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto py-3" onClick={exportPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto py-3" onClick={exportWord}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger Word
                  </Button>
                  {isLoggedIn && (
                    <Button className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto py-3" onClick={saveToAccount}>
                      Enregistrer dans mon compte
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteCV(selectedCV.id);
                      setShowPreview(false);
                    }}
                    className="w-full sm:w-auto py-3"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center min-h-[400px]">
              <Card className="p-12 text-center w-full">
                <p className="text-muted-foreground text-lg mb-4">
                  Sélectionnez un CV ou créez-en un nouveau
                </p>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => createNewCV("white")}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Créer mon premier CV
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Aperçu */}
        {showPreview && selectedCV && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Aperçu de votre CV</h2>
            <CVPreview cv={selectedCV} />
          </div>
        )}
      </div>
    </div>
  );
}
