import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit, Trash2, Download, Eye, ChevronLeft, ChevronRight, Play } from "lucide-react";
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
    category: "classique",
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
    category: "moderne",
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
    category: "moderne",
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
    category: "classique",
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
    category: "moderne",
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

const categories = ["moderne", "classique"];

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
  candidateName: "Jean Marc",
  candidatePosition: "Développeur React Senior",
  email: "jean.dupont@email.com",
  phone: "+242 06 731 10 33",
  location: "Brazzaville, Congo",
  recipientName: "Marie Martin",
  recipientCompany: "TechCorp",
  recipientAddress: "123 Rue de la République, 75000 Brazzaville",
  subject: "Candidature Développeur React Senior",
  greeting: "Madame, Monsieur,",
  body: "Je vous écris pour vous soumettre ma candidature pour le poste de Développeur React Senior au sein de votre entreprise TechCorp.\n\nAvec plus de 8 années d'expérience en développement web, je suis convaincu que mon expertise technique et ma passion pour l'innovation pourront contribuer au succès de votre équipe.",
  closing: "Je vous prie de recevoir, Madame, Monsieur, l'expression de mes salutations distinguées.",
  template: "sidebarblack",
  createdAt: new Date().toISOString(),
};

export default function MotivationLetters() {
  const [searchParams] = useSearchParams();
  const { letters, addLetter, updateLetter, deleteLetter } = useLetterStorage();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingLetter, setEditingLetter] = useState<MotivationLetterData | null>(null);
  const [previewLetterId, setPreviewLetterId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Auto-open editor with template from URL parameter
  useEffect(() => {
    const templateParam = searchParams.get("template");
    if (templateParam) {
      setSelectedTemplateId(templateParam);
      setEditingLetter(null);
      setEditorOpen(true);
      // Clean up the URL parameter
      window.history.replaceState({}, "", "/letter-modeles");
    }
  }, [searchParams]);

  const scrollLeft = (category: string) => {
    const ref = scrollRefs.current[category];
    if (ref) {
      ref.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (category: string) => {
    const ref = scrollRefs.current[category];
    if (ref) {
      ref.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleUseTemplate = (template: LetterTemplate) => {
    toast.success(`Modèle "${template.name}" sélectionné !`);
    handleNewLetter(template.id);
  };

  const handlePreview = (template: LetterTemplate) => {
    setSelectedTemplate(template);
  };

  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = LETTER_TEMPLATES.filter(template => template.category === category);
    return acc;
  }, {} as { [key: string]: LetterTemplate[] });

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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Modèles de Lettres de Motivation
        </h1>
        <p className="text-lg text-muted-foreground">
          Créez une lettre de motivation percutante avec nos modèles professionnels
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 capitalize">
            {category === 'moderne' ? 'Lettres Modernes' : 'Lettres Classiques'}
          </h2>

          <div className="relative group">
            <button
              onClick={() => scrollLeft(category)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            <div
              ref={(el) => (scrollRefs.current[category] = el)}
              className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {templatesByCategory[category].map(template => (
                <Card
                  key={template.id}
                  className="flex-shrink-0 w-80 snap-center shadow-md hover:shadow-lg transition-shadow duration-300 group/card"
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b">
                      <span className="text-6xl">{template.image}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Utiliser
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Aperçu
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            <button
              onClick={() => scrollRight(category)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      ))}

      {/* Modal Preview */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-2xl font-bold">{selectedTemplate.name}</h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedTemplate(null)}
              >
                ✕
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-lg border mb-4">
                    <span className="text-8xl">{selectedTemplate.image}</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-3">Avantages</h4>
                  <ul className="space-y-2">
                    {selectedTemplate.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="h-2 w-2 rounded-full bg-green-600"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">Description</h4>
                  <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>

                  <div className="bg-green-50 border-l-4 border-l-green-600 p-4 rounded">
                    <h5 className="font-semibold text-green-800 mb-2">Rédigez la lettre parfaite</h5>
                    <p className="text-sm text-green-700">
                      Une bonne lettre de motivation peut faire la différence. Nos modèles vous aident
                      à structurer votre message et à présenter vos motivations de manière convaincante.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Button onClick={() => handleUseTemplate(selectedTemplate)}>
                  Utiliser ce modèle
                </Button>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Preview Modal for Saved Letters */}
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
