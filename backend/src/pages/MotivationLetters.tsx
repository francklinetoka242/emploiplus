import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Edit, Trash2, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { LetterTemplateSidebarBlack } from "@/components/letter-templates/LetterTemplateSidebarBlack";
import { LetterTemplateYellowLine } from "@/components/letter-templates/LetterTemplateYellowLine";
import { LetterTemplateWaveFluid } from "@/components/letter-templates/LetterTemplateWaveFluid";
import { LetterTemplateProfessional } from "@/components/letter-templates/LetterTemplateProfessional";
import { LetterTemplateTurquoiseDynamic } from "@/components/letter-templates/LetterTemplateTurquoiseDynamic";
import { MotivationLetterEditorModal, MotivationLetterData } from "@/components/MotivationLetterEditorModal";
import { useLetterStorage } from "@/hooks/useLetterStorage";

interface LetterTemplate {
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[];
}

const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: "sidebarblack",
    name: "Modèle 1 - Barre Latérale Noire",
    description:
      "Design épuré avec fine barre latérale noire - Format professionnel classique avec accent latéral",
    features: [
      "Barre latérale noire (#1a1a1a) 15% de largeur",
      "En-tête avec nom gras et majuscules",
      "Contact aligné à droite",
      "Texte sans-serif, corps simple et lisible",
    ],
    image: "📄",
  },
  {
    id: "yellowline",
    name: "Modèle 2 - Ligne Jaune",
    description:
      "Design moderne avec accents jaunes - Ligne verticale le long du texte et bandeau header gris",
    features: [
      "Bandeau header gris (#f2f2f2) avec nom jaune",
      "Ligne verticale jaune (#f39c12) sur toute la hauteur",
      "Icônes jaunes pour les sections",
      "Design moderne et dynamique",
    ],
    image: "✨",
  },
  {
    id: "wavefluid",
    name: "Modèle 3 - Vague Fluide",
    description:
      "Design créatif avec vague ondulée et capsules - Infographique et moderne",
    features: [
      "Vague orange cuivré (#cf8d2e) en haut de page",
      "Coordonnées en capsules orange avec texte blanc",
      "Objet souligné d'une ligne ondulée",
      "Très fluide et créatif",
    ],
    image: "🌀",
  },
  {
    id: "professional",
    name: "Modèle 4 - Professionnel",
    description:
      "Design traditionnel avec bloc initiales - Très formel et classique avec police Serif",
    features: [
      "Bloc gris anthracite (#4a4a4a) avec initiales",
      "Infos expéditeur/destinataire symétrisées",
      "Police Serif pour un style traditionnel",
      "Ligne horizontale en footer",
    ],
    image: "🎩",
  },
  {
    id: "turquoisedynamic",
    name: "Modèle 5 - Turquoise Dynamique",
    description:
      "Design dynamique bicolore turquoise/orange - Contact avec icônes oranges",
    features: [
      "Barre latérale turquoise (#2bb0ac)",
      "Icônes oranges (#f39c12) pour contact",
      "Objet encadré avec coin orange",
      "Texte justifié et très professionnel",
    ],
    image: "💎",
  },
];

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

// Sample data for template preview
const SAMPLE_LETTER: MotivationLetterData = {
  id: "sample",
  candidateName: "Jean Dupont",
  candidatePosition: "Développeur React Senior",
  email: "jean.dupont@email.com",
  phone: "+33 6 12 34 56 78",
  location: "Paris, France",
  recipientName: "Marie Martin",
  recipientCompany: "TechCorp",
  recipientAddress: "123 Rue de la République, 75000 Paris",
  subject: "Candidature Développeur React Senior",
  greeting: "Madame, Monsieur,",
  body: "Je vous écris pour vous soumettre ma candidature pour le poste de Développeur React Senior au sein de votre entreprise TechCorp.\n\nAvec plus de 8 années d'expérience en développement web, je suis convaincu que mon expertise technique et ma passion pour l'innovation pourront contribuer au succès de votre équipe.",
  closing: "Je vous prie de recevoir, Madame, Monsieur, l'expression de mes salutations distinguées.",
  template: "sidebarblack",
  createdAt: new Date().toISOString(),
};

export default function MotivationLetters() {
  const { letters, addLetter, updateLetter, deleteLetter } = useLetterStorage();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingLetter, setEditingLetter] = useState<MotivationLetterData | null>(null);
  const [previewLetterId, setPreviewLetterId] = useState<string | null>(null);

  const handleNewLetter = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setEditingLetter(null);
    setEditorOpen(true);
  };

  const handleEditLetter = (letter: MotivationLetterData) => {
    setEditingLetter(letter);
    setSelectedTemplateId(letter.template);
    setEditorOpen(true);
  };

  const handleSaveLetter = (letter: MotivationLetterData) => {
    if (editingLetter) {
      updateLetter(letter.id, letter);
      toast.success("Lettre mise à jour !");
    } else {
      addLetter(letter);
      toast.success("Lettre créée !");
    }
  };

  const handleDeleteLetter = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette lettre ?")) {
      deleteLetter(id);
      toast.success("Lettre supprimée !");
    }
  };

  const handleExportPDF = (letter: MotivationLetterData) => {
    const TemplateComponent = getTemplateComponent(letter.template);
    const element = document.createElement("div");
    element.style.width = "210mm";
    element.style.height = "297mm";

    const root = document.createElement("div");
    root.style.width = "100%";
    root.style.height = "100%";
    element.appendChild(root);

    const opt = {
      margin: [0, 0, 0, 0],
      filename: `lettre-motivation-${letter.candidateName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
    toast.success("Lettre exportée en PDF !");
  };

  const lettersByTemplate = (templateId: string) => {
    return letters.filter((letter) => letter.template === templateId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-3">Modèles de Lettre de Motivation</h1>
          <p className="text-gray-600 text-lg">
            Créez, éditez et exportez vos lettres de motivation en PDF. Sauvegardez vos brouillons localement.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-8">
          {LETTER_TEMPLATES.map((template) => (
            <div key={template.id} className="border-b pb-8 last:border-b-0">
              {/* Template Header */}
              <div className="flex items-start gap-6 mb-6">
                <div className="text-5xl">{template.image}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">{template.name}</h2>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {template.features.map((feature, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleNewLetter(template.id)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Créer une lettre
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>

              {/* Saved Letters for this Template */}
              {lettersByTemplate(template.id).length > 0 && (
                <div className="ml-24 mt-6 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Vos lettres :</p>
                  {lettersByTemplate(template.id).map((letter) => (
                    <Card key={letter.id} className="p-4 flex items-center justify-between hover:shadow-md transition">
                      <div>
                        <p className="font-semibold text-gray-800">{letter.candidateName}</p>
                        <p className="text-xs text-gray-500">
                          {letter.subject || "Sans objet"} • Créée le{" "}
                          {new Date(letter.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewLetterId(letter.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditLetter(letter)}
                          className="flex items-center gap-1"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportPDF(letter)}
                          className="flex items-center gap-1"
                        >
                          <Download size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLetter(letter.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      {selectedTemplateId && (
        <MotivationLetterEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          templateId={selectedTemplateId}
          onSave={handleSaveLetter}
          initialData={editingLetter || undefined}
        />
      )}

      {/* Preview Modal */}
      {previewLetterId && letters.find((l) => l.id === previewLetterId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Aperçu de la lettre</h2>
              <button
                onClick={() => setPreviewLetterId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-50">
              {(() => {
                const letter = letters.find((l) => l.id === previewLetterId);
                if (!letter) return null;
                const TemplateComponent = getTemplateComponent(letter.template);
                return (
                  <div className="w-full h-full overflow-auto">
                    <div style={{ width: "210mm", margin: "0 auto", background: "white" }}>
                      <TemplateComponent data={letter} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
