import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { LetterTemplateSidebarBlack } from "./letter-templates/LetterTemplateSidebarBlack";
import { LetterTemplateYellowLine } from "./letter-templates/LetterTemplateYellowLine";
import { LetterTemplateWaveFluid } from "./letter-templates/LetterTemplateWaveFluid";
import { LetterTemplateProfessional } from "./letter-templates/LetterTemplateProfessional";
import { LetterTemplateTurquoiseDynamic } from "./letter-templates/LetterTemplateTurquoiseDynamic";

export interface MotivationLetterData {
  id: string;
  candidateName: string;
  candidatePosition: string;
  email: string;
  phone: string;
  location: string;
  recipientName: string;
  recipientCompany: string;
  recipientAddress: string;
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  template: string;
  createdAt: string;
}

interface MotivationLetterEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  onSave: (letter: MotivationLetterData) => void;
  initialData?: MotivationLetterData;
}

const getTemplateComponent = (templateId: string) => {
  switch (templateId) {
    case "sidebarblack":
      return LetterTemplateSidebarBlack;
    case "yellowline":
      return LetterTemplateYellowLine;
    case "wavefluid":
      return LetterTemplateWaveFluid;
    case "professional":
      return LetterTemplateProfessional;
    case "turquoisedynamic":
      return LetterTemplateTurquoiseDynamic;
    default:
      return LetterTemplateSidebarBlack;
  }
};

export const MotivationLetterEditorModal: React.FC<MotivationLetterEditorModalProps> = ({
  isOpen,
  onClose,
  templateId,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<MotivationLetterData>(
    initialData || {
      id: Date.now().toString(),
      candidateName: "",
      candidatePosition: "",
      email: "",
      phone: "",
      location: "",
      recipientName: "",
      recipientCompany: "",
      recipientAddress: "",
      subject: "",
      greeting: "Madame, Monsieur,",
      body: "Je vous écris...",
      closing: "Je vous prie de recevoir...",
      template: templateId,
      createdAt: new Date().toISOString(),
    }
  );

  const [showPreview, setShowPreview] = useState(false);
  const letterPreviewRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof MotivationLetterData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExportPDF = () => {
    if (!letterPreviewRef.current) return;

    const element = letterPreviewRef.current;
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `lettre-motivation-${formData.candidateName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
    toast.success("Lettre exportée en PDF !");
  };

  const handleSave = () => {
    if (!formData.candidateName.trim()) {
      toast.error("Veuillez entrer votre nom");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const TemplateComponent = getTemplateComponent(templateId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Éditer la lettre de motivation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-4 overflow-hidden p-4">
          {/* Form - Left Side */}
          <div className="w-1/3 overflow-y-auto space-y-4">
            <div>
              <Label className="text-sm font-semibold">Nom complet *</Label>
              <Input
                value={formData.candidateName}
                onChange={(e) => handleChange("candidateName", e.target.value)}
                placeholder="Votre nom"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Poste recherché</Label>
              <Input
                value={formData.candidatePosition}
                onChange={(e) => handleChange("candidatePosition", e.target.value)}
                placeholder="ex: Développeur React"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Email</Label>
              <Input
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                type="email"
                placeholder="votre@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Localisation</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Ville, Pays"
                className="mt-1"
              />
            </div>

            <hr className="my-4" />

            <div>
              <Label className="text-sm font-semibold">Destinataire - Nom</Label>
              <Input
                value={formData.recipientName}
                onChange={(e) => handleChange("recipientName", e.target.value)}
                placeholder="Nom du recruteur"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Destinataire - Entreprise</Label>
              <Input
                value={formData.recipientCompany}
                onChange={(e) => handleChange("recipientCompany", e.target.value)}
                placeholder="Nom de l'entreprise"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Destinataire - Adresse</Label>
              <Input
                value={formData.recipientAddress}
                onChange={(e) => handleChange("recipientAddress", e.target.value)}
                placeholder="Adresse complète"
                className="mt-1"
              />
            </div>

            <hr className="my-4" />

            <div>
              <Label className="text-sm font-semibold">Objet</Label>
              <Input
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Candidature - Développeur React"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Formule de politesse</Label>
              <Input
                value={formData.greeting}
                onChange={(e) => handleChange("greeting", e.target.value)}
                placeholder="Madame, Monsieur,"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Corps de la lettre</Label>
              <Textarea
                value={formData.body}
                onChange={(e) => handleChange("body", e.target.value)}
                placeholder="Votre message..."
                className="mt-1 h-32"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Formule de fermeture</Label>
              <Input
                value={formData.closing}
                onChange={(e) => handleChange("closing", e.target.value)}
                placeholder="Je vous prie..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Preview - Right Side */}
          <div className="w-2/3 border rounded-lg overflow-hidden bg-gray-50">
            <div
              ref={letterPreviewRef}
              className="w-full h-full bg-white overflow-auto"
              style={{ aspectRatio: "8.5/11" }}
            >
              <TemplateComponent data={formData} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPreview ? "Masquer" : "Aperçu"}
          </button>

          <div className="flex gap-2">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download size={18} />
              PDF
            </Button>

            <Button onClick={onClose} variant="outline">
              Annuler
            </Button>

            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Enregistrer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
