import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, Plus, Trash2, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { CVTemplateFrancklyn } from "./cv-templates/CVTemplateFrancklyn";
import { CVTemplateMinimalist } from "./cv-templates/CVTemplateMinimalist";
import { CVTemplateGeometric } from "./cv-templates/CVTemplateGeometric";
import { CVTemplateInfographic } from "./cv-templates/CVTemplateInfographic";
import { CVTemplateClassicSober } from "./cv-templates/CVTemplateClassicSober";
import { CVTemplateOrangeDynamic } from "./cv-templates/CVTemplateOrangeDynamic";
import { CVTemplateModernRibbon } from "./cv-templates/CVTemplateModernRibbon";
import { CVTemplatePastelJunior } from "./cv-templates/CVTemplatePastelJunior";
import { CVTemplateRibbonSidebar } from "./cv-templates/CVTemplateRibbonSidebar";
import { CVTemplateExecutive } from "./cv-templates/CVTemplateExecutive";
import { CVTemplateNavyBlue } from "./cv-templates/CVTemplateNavyBlue";
import { CVTemplateWarmMinimal } from "./cv-templates/CVTemplateWarmMinimal";
import { CVTemplateTurquoiseOrange } from "./cv-templates/CVTemplateTurquoiseOrange";
import { CVTemplateYellowMask } from "./cv-templates/CVTemplateYellowMask";
import { CVTemplateHighEnd } from "./cv-templates/CVTemplateHighEnd";
import { CVTemplateNavyWhite } from "./cv-templates/CVTemplateNavyWhite";
import { CVTemplateBlackWhite } from "./cv-templates/CVTemplateBlackWhite";
import { CVTemplateYellowGeometric } from "./cv-templates/CVTemplateYellowGeometric";
import { CVTemplateInfographicBlueOrange } from "./cv-templates/CVTemplateInfographicBlueOrange";
import { CVTemplateRibbonLayers } from "./cv-templates/CVTemplateRibbonLayers";
import { CVTemplateTurquoiseOrangeV2 } from "./cv-templates/CVTemplateTurquoiseOrangeV2";
import { CVTemplateExecutiveCadre } from "./cv-templates/CVTemplateExecutiveCadre";
import { CVTemplateOrangeCreative } from "./cv-templates/CVTemplateOrangeCreative";
import { CVTemplateStudentPastel } from "./cv-templates/CVTemplateStudentPastel";
import { CVTemplateTimeline } from "./cv-templates/CVTemplateTimeline";
import { CVTemplateNavyModern } from "./cv-templates/CVTemplateNavyModern";

export interface CVData {
  id: string;
  full_name: string;
  job_title: string;
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
  languages: Array<{ name: string; level: string }>;
  qualities: string[];
  template: string;
  createdAt: string;
}

interface CVEditorModalProps {
  isOpen: boolean;
  templateId: string;
  onClose: () => void;
  onSave: (cvData: CVData) => void;
  initialData?: CVData;
}

const getTemplateComponent = (templateId: string) => {
  switch (templateId) {
    case "francklyn":
      return CVTemplateFrancklyn;
    case "minimalist":
      return CVTemplateMinimalist;
    case "geometric":
      return CVTemplateGeometric;
    case "infographic":
      return CVTemplateInfographic;
    case "classicsober":
      return CVTemplateClassicSober;
    case "orangedynamic":
      return CVTemplateOrangeDynamic;
    case "modernribbon":
      return CVTemplateModernRibbon;
    case "pasteljunior":
      return CVTemplatePastelJunior;
    case "ribbonsidebar":
      return CVTemplateRibbonSidebar;
    case "executive":
      return CVTemplateExecutive;
    case "navyblue":
      return CVTemplateNavyBlue;
    case "warmminimal":
      return CVTemplateWarmMinimal;
    case "turquoiseorange":
      return CVTemplateTurquoiseOrange;
    case "yellowmask":
      return CVTemplateYellowMask;
    case "highend":
      return CVTemplateHighEnd;
    case "navywhite":
      return CVTemplateNavyWhite;
    case "blackwhite":
      return CVTemplateBlackWhite;
    case "yellowgeometric":
      return CVTemplateYellowGeometric;
    case "infographicblueorange":
      return CVTemplateInfographicBlueOrange;
    case "ribbonlayers":
      return CVTemplateRibbonLayers;
    case "turquoiseorangev2":
      return CVTemplateTurquoiseOrangeV2;
    case "executivecadre":
      return CVTemplateExecutiveCadre;
    case "orangecreative":
      return CVTemplateOrangeCreative;
    case "studentpastel":
      return CVTemplateStudentPastel;
    case "timeline":
      return CVTemplateTimeline;
    case "navymodern":
      return CVTemplateNavyModern;
    default:
      return CVTemplateFrancklyn;
  }
};

export function CVEditorModal({
  isOpen,
  templateId,
  onClose,
  onSave,
  initialData,
}: CVEditorModalProps) {
  const [formData, setFormData] = useState<CVData>(
    initialData || {
      id: Date.now().toString(),
      full_name: "",
      job_title: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      experiences: [],
      education: [],
      skills: [],
      languages: [
        { name: "", level: "Intermédiaire" },
      ],
      qualities: [],
      template: templateId,
      createdAt: new Date().toISOString(),
    }
  );

  const [showPreview, setShowPreview] = useState(false);
  const cvPreviewRef = useRef<HTMLDivElement>(null);

  const handleBasicInfoChange = (field: keyof CVData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: Date.now().toString(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          school: "",
          degree: "",
          field: "",
          year: "",
        },
      ],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, { name: "", level: "Intermédiaire" }],
    }));
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang, i) =>
        i === index ? { ...lang, [field]: value } : lang
      ),
    }));
  };

  const removeLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const addQuality = () => {
    setFormData((prev) => ({
      ...prev,
      qualities: [...prev.qualities, ""],
    }));
  };

  const updateQuality = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      qualities: prev.qualities.map((q, i) => (i === index ? value : q)),
    }));
  };

  const removeQuality = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualities: prev.qualities.filter((_, i) => i !== index),
    }));
  };

  const handleExportPDF = () => {
    if (!cvPreviewRef.current) return;

    const element = cvPreviewRef.current;
    const opt = {
      margin: 0,
      filename: `${formData.full_name || "CV"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
    toast.success("CV exporté en PDF!");
  };

  const handleSave = () => {
    if (!formData.full_name.trim()) {
      toast.error("Veuillez entrer votre nom");
      return;
    }

    onSave(formData);
  };

  const TemplateComponent = getTemplateComponent(templateId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-hidden">
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold">Éditer votre CV</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex gap-4 p-4">
          {/* Form Section */}
          <div className="w-1/3 overflow-y-auto pr-2 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Informations de Base</h3>
              <div>
                <Label>Nom Complet</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) =>
                    handleBasicInfoChange("full_name", e.target.value)
                  }
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <Label>Titre du Poste</Label>
                <Input
                  value={formData.job_title}
                  onChange={(e) =>
                    handleBasicInfoChange("job_title", e.target.value)
                  }
                  placeholder="Développeur Full Stack"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      handleBasicInfoChange("email", e.target.value)
                    }
                    type="email"
                    placeholder="jean@example.com"
                  />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      handleBasicInfoChange("phone", e.target.value)
                    }
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <Label>Localisation</Label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    handleBasicInfoChange("location", e.target.value)
                  }
                  placeholder="Paris, France"
                />
              </div>

              <div>
                <Label>À Propos</Label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) =>
                    handleBasicInfoChange("summary", e.target.value)
                  }
                  placeholder="Décrivez-vous en quelques lignes..."
                  rows={4}
                />
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Expérience</h3>
                <Button
                  size="sm"
                  onClick={addExperience}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>

              {formData.experiences.map((exp) => (
                <Card key={exp.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, "company", e.target.value)
                      }
                      placeholder="Entreprise"
                      className="mb-2"
                    />
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  <Input
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(exp.id, "position", e.target.value)
                    }
                    placeholder="Poste"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, "startDate", e.target.value)
                      }
                      placeholder="Début (2020)"
                      type="number"
                    />
                    <Input
                      value={exp.endDate}
                      onChange={(e) =>
                        updateExperience(exp.id, "endDate", e.target.value)
                      }
                      placeholder="Fin (2024)"
                    />
                  </div>
                  <Textarea
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(exp.id, "description", e.target.value)
                    }
                    placeholder="Description du poste"
                    rows={2}
                  />
                </Card>
              ))}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Formation</h3>
                <Button
                  size="sm"
                  onClick={addEducation}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>

              {formData.education.map((edu) => (
                <Card key={edu.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Input
                      value={edu.school}
                      onChange={(e) =>
                        updateEducation(edu.id, "school", e.target.value)
                      }
                      placeholder="École/Université"
                      className="mb-2"
                    />
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  <Input
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, "degree", e.target.value)
                    }
                    placeholder="Diplôme"
                  />
                  <Input
                    value={edu.field}
                    onChange={(e) =>
                      updateEducation(edu.id, "field", e.target.value)
                    }
                    placeholder="Domaine"
                  />
                  <Input
                    value={edu.year}
                    onChange={(e) =>
                      updateEducation(edu.id, "year", e.target.value)
                    }
                    placeholder="Année (2023)"
                    type="number"
                  />
                </Card>
              ))}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Compétences</h3>
                <Button
                  size="sm"
                  onClick={addSkill}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-2">
                {formData.skills.map((skill, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={skill}
                      onChange={(e) => updateSkill(idx, e.target.value)}
                      placeholder="Ex: React, Node.js"
                    />
                    <button
                      onClick={() => removeSkill(idx)}
                      className="p-2 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Langues</h3>
                <Button
                  size="sm"
                  onClick={addLanguage}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>

              {formData.languages.map((lang, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={lang.name}
                    onChange={(e) =>
                      updateLanguage(idx, "name", e.target.value)
                    }
                    placeholder="Français, Anglais..."
                    className="flex-1"
                  />
                  <select
                    value={lang.level}
                    onChange={(e) =>
                      updateLanguage(idx, "level", e.target.value)
                    }
                    className="border rounded px-3 py-2"
                  >
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                    <option>Expert</option>
                  </select>
                  {formData.languages.length > 1 && (
                    <button
                      onClick={() => removeLanguage(idx)}
                      className="p-2 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Qualities */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Qualités</h3>
                <Button
                  size="sm"
                  onClick={addQuality}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-2">
                {formData.qualities.map((quality, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={quality}
                      onChange={(e) => updateQuality(idx, e.target.value)}
                      placeholder="Ex: Leadership, Communication"
                    />
                    <button
                      onClick={() => removeQuality(idx)}
                      className="p-2 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="w-2/3 overflow-y-auto border-l pl-4">
            <div className="sticky top-0 bg-white py-2 mb-4 flex gap-2">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant={showPreview ? "default" : "outline"}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? "Masquer l'aperçu" : "Aperçu"}
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
            </div>

            {showPreview && (
              <div ref={cvPreviewRef} className="bg-white rounded-lg shadow-lg">
                <TemplateComponent data={formData} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">
            Annuler
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <span>Enregistrer le CV</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
