import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { CVTemplateFrancklyn } from "@/components/cv-templates/CVTemplateFrancklyn";

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  year: string;
}

interface Skill {
  id: string;
  name: string;
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Expert";
}

interface Language {
  id: string;
  name: string;
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Expert";
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

interface CVFormData {
  full_name: string;
  job_title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  qualities: string[];
  interests: string[];
  certificates: Certificate[];
  profile_image_url?: string;
}

const INITIAL_CV_DATA: CVFormData = {
  full_name: "",
  job_title: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  qualities: [],
  interests: [],
  certificates: [],
  profile_image_url: "",
};

export default function CVCreator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get("template") || "francklyn";

  const [formData, setFormData] = useState<CVFormData>(INITIAL_CV_DATA);
  const [showPreview, setShowPreview] = useState(true);

  const handleInputChange = (field: keyof CVFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, newExp],
    }));
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      field: "",
      year: "",
    };
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: Date.now().toString(), name: "", level: "Intermédiaire" }],
    }));
  };

  const removeSkill = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  };

  const updateSkill = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const addLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, { id: Date.now().toString(), name: "", level: "Intermédiaire" }],
    }));
  };

  const removeLanguage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang.id !== id),
    }));
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang
      ),
    }));
  };

  const addQuality = () => {
    setFormData((prev) => ({
      ...prev,
      qualities: [...prev.qualities, ""],
    }));
  };

  const removeQuality = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualities: prev.qualities.filter((_, i) => i !== index),
    }));
  };

  const updateQuality = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      qualities: prev.qualities.map((q, i) => (i === index ? value : q)),
    }));
  };

  const addInterest = () => {
    setFormData((prev) => ({
      ...prev,
      interests: [...prev.interests, ""],
    }));
  };

  const removeInterest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const updateInterest = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.map((i, idx) => (idx === index ? value : i)),
    }));
  };

  const addCertificate = () => {
    setFormData((prev) => ({
      ...prev,
      certificates: [...prev.certificates, { id: Date.now().toString(), name: "", issuer: "", date: "" }],
    }));
  };

  const removeCertificate = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((cert) => cert.id !== id),
    }));
  };

  const updateCertificate = (id: string, field: keyof Certificate, value: string) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const handleExportPDF = () => {
    const element = document.getElementById("cv-preview");
    if (!element) {
      toast.error("Impossible de générer le PDF");
      return;
    }

    const opt = {
      margin: 0,
      filename: `${formData.full_name || "CV"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save();
    toast.success("CV exporté en PDF");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/cv-modeles")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour aux modèles
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Créateur de CV</h1>
          <Button
            onClick={handleExportPDF}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!formData.full_name}
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 gap-8">
        {/* Formulaire (Gauche) */}
        <div className="space-y-8 overflow-y-auto max-h-[calc(100vh-120px)]">
          {/* Informations personnelles */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Informations Personnelles</h2>
            <div className="space-y-4">
              <div>
                <Label>Nom et Prénom *</Label>
                <Input
                  placeholder="Jean Dupont"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                />
              </div>
              <div>
                <Label>Titre Professionnel</Label>
                <Input
                  placeholder="Développeur Full Stack"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange("job_title", e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="jean@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  placeholder="+33 6 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Localisation</Label>
                <Input
                  placeholder="Paris, France"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
              <div>
                <Label>Profil/Résumé</Label>
                <Textarea
                  placeholder="Décrivez brièvement votre profil professionnel..."
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </Card>

          {/* Expériences */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Expériences Professionnelles</h2>
              <Button size="sm" onClick={addExperience} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-6">
              {formData.experiences.map((exp) => (
                <div key={exp.id} className="pb-6 border-b last:border-b-0">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Entreprise</Label>
                      <Input
                        placeholder="Nom de l'entreprise"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Poste</Label>
                      <Input
                        placeholder="Votre titre"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Date de début</Label>
                      <Input
                        placeholder="2020"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Date de fin</Label>
                      <Input
                        placeholder="2023"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Décrivez vos responsabilités et réalisations..."
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Formation */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Formation</h2>
              <Button size="sm" onClick={addEducation} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-6">
              {formData.education.map((edu) => (
                <div key={edu.id} className="pb-6 border-b last:border-b-0">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>École/Université</Label>
                      <Input
                        placeholder="Nom de l'établissement"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Diplôme</Label>
                      <Input
                        placeholder="Master, Licence..."
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Domaine d'études</Label>
                      <Input
                        placeholder="Informatique, Gestion..."
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Année</Label>
                      <Input
                        placeholder="2020"
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeEducation(edu.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Compétences */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Compétences</h2>
              <Button size="sm" onClick={addSkill} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-4">
              {formData.skills.map((skill) => (
                <div key={skill.id} className="flex gap-4">
                  <Input
                    placeholder="Ex: React, Python, etc."
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkill(skill.id, "level", e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                    <option>Expert</option>
                  </select>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeSkill(skill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Langues */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Langues</h2>
              <Button size="sm" onClick={addLanguage} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-4">
              {formData.languages.map((lang) => (
                <div key={lang.id} className="flex gap-4">
                  <Input
                    placeholder="Langue"
                    value={lang.name}
                    onChange={(e) => updateLanguage(lang.id, "name", e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={lang.level}
                    onChange={(e) => updateLanguage(lang.id, "level", e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                    <option>Expert</option>
                  </select>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeLanguage(lang.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Qualités */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Qualités</h2>
              <Button size="sm" onClick={addQuality} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {formData.qualities.map((quality, index) => (
                <div key={index} className="flex gap-4">
                  <Input
                    placeholder="Ex: Responsable, Créatif..."
                    value={quality}
                    onChange={(e) => updateQuality(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeQuality(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Loisirs */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Loisirs</h2>
              <Button size="sm" onClick={addInterest} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {formData.interests.map((interest, index) => (
                <div key={index} className="flex gap-4">
                  <Input
                    placeholder="Ex: Photographie, Voyages..."
                    value={interest}
                    onChange={(e) => updateInterest(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeInterest(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Certificats */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Certificats</h2>
              <Button size="sm" onClick={addCertificate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-6">
              {formData.certificates.map((cert) => (
                <div key={cert.id} className="pb-6 border-b last:border-b-0">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Nom du certificat</Label>
                      <Input
                        placeholder="Ex: AWS Certified Solutions Architect"
                        value={cert.name}
                        onChange={(e) => updateCertificate(cert.id, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Organisme</Label>
                      <Input
                        placeholder="Ex: Amazon Web Services"
                        value={cert.issuer}
                        onChange={(e) => updateCertificate(cert.id, "issuer", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Date d'obtention</Label>
                      <Input
                        placeholder="2023"
                        value={cert.date}
                        onChange={(e) => updateCertificate(cert.id, "date", e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeCertificate(cert.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Aperçu du CV (Droite) */}
        <div className="sticky top-20 max-h-[calc(100vh-140px)] overflow-auto">
          <Card className="p-4 bg-gray-100">
            <div id="cv-preview" className="bg-white shadow-lg" style={{ width: "210mm", aspectRatio: "210/297" }}>
              {templateId === "francklyn" && (
                <CVTemplateFrancklyn
                  data={{
                    full_name: formData.full_name || "Nom Prénom",
                    job_title: formData.job_title,
                    phone: formData.phone,
                    email: formData.email,
                    location: formData.location,
                    summary: formData.summary,
                    experiences: formData.experiences,
                    education: formData.education,
                    skills: formData.skills.map((s) => s.name),
                    languages: formData.languages,
                    qualities: formData.qualities,
                    interests: formData.interests,
                    certificates: formData.certificates,
                    profile_image_url: formData.profile_image_url,
                  }}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
