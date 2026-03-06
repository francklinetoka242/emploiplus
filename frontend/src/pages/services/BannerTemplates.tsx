import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, Zap, Filter, X } from "lucide-react";
import { toast } from "sonner";

interface BannerTemplate {
  id: string;
  name: string;
  category: string;
  previewUrl: string;
  defaultColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  networks: string[];
  description: string;
  text?: string;
  align?: string;
  imageUrl?: string;
}

const bannerTemplates: BannerTemplate[] = [
  // Professionnel (LinkedIn)
  {
    id: "minimal-blue",
    name: "Minimal Blue",
    category: "Professionnel",
    previewUrl: "/assets/banner-previews/minimal-blue.jpg",
    defaultColors: {
      primary: "#1e40af",
      secondary: "#3b82f6",
      accent: "#ffffff"
    },
    networks: ["linkedin"],
    description: "Design épuré bleu professionnel pour LinkedIn",
    text: "Consultant Senior en Transformation Digitale",
    align: "center"
  },
  {
    id: "corporate-grey",
    name: "Corporate Grey",
    category: "Professionnel",
    previewUrl: "/assets/banner-previews/corporate-grey.jpg",
    defaultColors: {
      primary: "#374151",
      secondary: "#6b7280",
      accent: "#ffffff"
    },
    networks: ["linkedin"],
    description: "Style corporate gris élégant",
    text: "Directeur des Ressources Humaines",
    align: "left"
  },
  {
    id: "executive-navy",
    name: "Executive Navy",
    category: "Professionnel",
    previewUrl: "/assets/banner-previews/executive-navy.jpg",
    defaultColors: {
      primary: "#1e293b",
      secondary: "#334155",
      accent: "#f8fafc"
    },
    networks: ["linkedin"],
    description: "Bleu marine pour cadres dirigeants",
    text: "CEO & Fondateur",
    align: "center"
  },

  // Créatif
  {
    id: "gradient-orange",
    name: "Gradient Orange",
    category: "Créatif",
    previewUrl: "/assets/banner-previews/gradient-orange.jpg",
    defaultColors: {
      primary: "#ea580c",
      secondary: "#f97316",
      accent: "#ffffff"
    },
    networks: ["linkedin", "facebook"],
    description: "Dégradé orange créatif et dynamique",
    text: "Designer UX/UI Créatif",
    align: "center"
  },
  {
    id: "abstract-geometric",
    name: "Abstract Geometric",
    category: "Créatif",
    previewUrl: "/assets/banner-previews/abstract-geometric.jpg",
    defaultColors: {
      primary: "#7c3aed",
      secondary: "#a855f7",
      accent: "#ffffff"
    },
    networks: ["linkedin", "facebook", "twitter"],
    description: "Formes géométriques abstraites",
    text: "Artiste Numérique",
    align: "right"
  },
  {
    id: "colorful-dots",
    name: "Colorful Dots",
    category: "Créatif",
    previewUrl: "/assets/banner-previews/colorful-dots.jpg",
    defaultColors: {
      primary: "#ec4899",
      secondary: "#8b5cf6",
      accent: "#ffffff"
    },
    networks: ["linkedin", "facebook", "instagram"],
    description: "Points colorés et ludiques"
  },

  // Tech / Startup
  {
    id: "tech-dots",
    name: "Tech Dots",
    category: "Tech",
    previewUrl: "/assets/banner-previews/tech-dots.jpg",
    defaultColors: {
      primary: "#06b6d4",
      secondary: "#0891b2",
      accent: "#ffffff"
    },
    networks: ["linkedin", "twitter"],
    description: "Points technologiques modernes",
    text: "Développeur Full-Stack",
    align: "left"
  },
  {
    id: "circuit-board",
    name: "Circuit Board",
    category: "Tech",
    previewUrl: "/assets/banner-previews/circuit-board.jpg",
    defaultColors: {
      primary: "#10b981",
      secondary: "#059669",
      accent: "#ffffff"
    },
    networks: ["linkedin", "twitter"],
    description: "Motif circuit imprimé high-tech"
  },
  {
    id: "neon-grid",
    name: "Neon Grid",
    category: "Tech",
    previewUrl: "/assets/banner-previews/neon-grid.jpg",
    defaultColors: {
      primary: "#8b5cf6",
      secondary: "#7c3aed",
      accent: "#ffffff"
    },
    networks: ["linkedin", "twitter", "youtube"],
    description: "Grille néon futuriste"
  },

  // Événementiel
  {
    id: "celebration",
    name: "Celebration",
    category: "Événementiel",
    previewUrl: "/assets/banner-previews/celebration.jpg",
    defaultColors: {
      primary: "#f59e0b",
      secondary: "#d97706",
      accent: "#ffffff"
    },
    networks: ["facebook", "instagram"],
    description: "Design festif pour événements"
  },
  {
    id: "conference",
    name: "Conference",
    category: "Événementiel",
    previewUrl: "/assets/banner-previews/conference.jpg",
    defaultColors: {
      primary: "#3b82f6",
      secondary: "#1d4ed8",
      accent: "#ffffff"
    },
    networks: ["linkedin", "facebook"],
    description: "Pour conférences et séminaires"
  },
  {
    id: "launch",
    name: "Product Launch",
    category: "Événementiel",
    previewUrl: "/assets/banner-previews/launch.jpg",
    defaultColors: {
      primary: "#ef4444",
      secondary: "#dc2626",
      accent: "#ffffff"
    },
    networks: ["linkedin", "twitter", "facebook"],
    description: "Lancement de produit innovant"
  }
];

const categories = ["Professionnel", "Créatif", "Tech", "Événementiel"];

const colorFilters = [
  { name: "Bleu", color: "#3b82f6" },
  { name: "Rouge", color: "#ef4444" },
  { name: "Vert", color: "#10b981" },
  { name: "Violet", color: "#8b5cf6" },
  { name: "Orange", color: "#f97316" },
  { name: "Gris", color: "#6b7280" }
];

// Composant générateur de miniatures de bannière stylisées
const BannerPreviewComponent = ({ template }: { template: BannerTemplate }) => {
  const { id, name, defaultColors } = template;

  // Designs spécifiques pour chaque bannière
  const renderPreview = () => {
    // Gradient Orange
    if (id === "gradient-orange") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold text-lg opacity-80">🎨</div>
          </div>
        </div>
      );
    }

    // Abstract Geometric (Violet)
    if (id === "abstract-geometric") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-400 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 100">
            <circle cx="50" cy="30" r="15" fill="white" opacity="0.6" />
            <rect x="100" y="20" width="30" height="30" fill="white" opacity="0.5" />
            <polygon points="200,10 230,40 200,50 170,40" fill="white" opacity="0.6" />
            <circle cx="300" cy="50" r="20" fill="white" opacity="0.4" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold opacity-70">✨</div>
          </div>
        </div>
      );
    }

    // Tech Dots (Cyan)
    if (id === "tech-dots") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 100">
            <circle cx="30" cy="20" r="4" fill="white" />
            <circle cx="60" cy="35" r="4" fill="white" />
            <circle cx="90" cy="25" r="4" fill="white" />
            <circle cx="120" cy="40" r="4" fill="white" />
            <circle cx="150" cy="30" r="4" fill="white" />
            <circle cx="180" cy="45" r="4" fill="white" />
            <circle cx="210" cy="25" r="4" fill="white" />
            <circle cx="240" cy="40" r="4" fill="white" />
            <circle cx="270" cy="30" r="4" fill="white" />
            <circle cx="300" cy="45" r="4" fill="white" />
            <circle cx="330" cy="25" r="4" fill="white" />
            <circle cx="360" cy="40" r="4" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold opacity-70">⚙️</div>
          </div>
        </div>
      );
    }

    // Circuit Board (Vert)
    if (id === "circuit-board") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-400 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 100">
            <line x1="20" y1="50" x2="100" y2="50" stroke="white" strokeWidth="1" />
            <circle cx="20" cy="50" r="3" fill="white" />
            <circle cx="100" cy="50" r="3" fill="white" />
            <line x1="100" y1="50" x2="100" y2="20" stroke="white" strokeWidth="1" />
            <circle cx="100" cy="20" r="3" fill="white" />
            <line x1="100" y1="20" x2="200" y2="20" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="20" r="3" fill="white" />
            <line x1="200" y1="20" x2="200" y2="80" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="80" r="3" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold opacity-70">🔌</div>
          </div>
        </div>
      );
    }

    // Neon Grid (Violet)
    if (id === "neon-grid") {
      return (
        <div className="w-full h-full bg-gray-900 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 100">
            <line x1="0" y1="20" x2="400" y2="20" stroke="#a855f7" strokeWidth="0.5" />
            <line x1="0" y1="40" x2="400" y2="40" stroke="#a855f7" strokeWidth="0.5" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="#a855f7" strokeWidth="0.5" />
            <line x1="0" y1="80" x2="400" y2="80" stroke="#a855f7" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#ec4899" strokeWidth="0.5" />
            <line x1="100" y1="0" x2="100" y2="100" stroke="#a855f7" strokeWidth="0.5" />
            <line x1="150" y1="0" x2="150" y2="100" stroke="#ec4899" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="200" y2="100" stroke="#a855f7" strokeWidth="0.5" />
            <line x1="250" y1="0" x2="250" y2="100" stroke="#ec4899" strokeWidth="0.5" />
            <line x1="300" y1="0" x2="300" y2="100" stroke="#a855f7" strokeWidth="0.5" />
            <line x1="350" y1="0" x2="350" y2="100" stroke="#ec4899" strokeWidth="0.5" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-purple-400 font-bold opacity-70 text-lg">⚡</div>
          </div>
        </div>
      );
    }

    // Colorful Dots (Multi)
    if (id === "colorful-dots") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-1 p-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white opacity-70"
                style={{ animation: `pulse ${1 + (i * 0.1)}s infinite` }}
              />
            ))}
          </div>
        </div>
      );
    }

    // Minimal Blue (Professionnel)
    if (id === "minimal-blue") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-blue-900 to-blue-500 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-xs font-semibold opacity-80">CONSULTANT</div>
            </div>
          </div>
        </div>
      );
    }

    // Corporate Grey
    if (id === "corporate-grey") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-400 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-4 w-8 h-0.5 bg-white" />
            <div className="absolute top-5 left-4 w-12 h-0.5 bg-white opacity-70" />
            <div className="absolute top-8 left-4 w-6 h-0.5 bg-white opacity-50" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold opacity-80">━━━</div>
          </div>
        </div>
      );
    }

    // Executive Navy
    if (id === "executive-navy") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold opacity-80">👔</div>
          </div>
        </div>
      );
    }

    // Celebration
    if (id === "celebration") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
            🎉
          </div>
        </div>
      );
    }

    // Conference
    if (id === "conference") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-400 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 100">
            <rect x="30" y="30" width="40" height="40" fill="white" />
            <rect x="90" y="30" width="40" height="40" fill="white" />
            <rect x="150" y="30" width="40" height="40" fill="white" />
            <rect x="210" y="30" width="40" height="40" fill="white" />
            <rect x="270" y="30" width="40" height="40" fill="white" />
            <rect x="330" y="30" width="40" height="40" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold opacity-80">🎤</div>
          </div>
        </div>
      );
    }

    // Launch
    if (id === "launch") {
      return (
        <div className="w-full h-full bg-gradient-to-r from-red-600 to-red-400 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold text-2xl opacity-80">🚀</div>
          </div>
        </div>
      );
    }

    // Default gradient
    return (
      <div
        className="w-full h-full relative overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${defaultColors.primary}, ${defaultColors.secondary})`
        }}
      >
        <div className="text-white font-bold opacity-75">{name}</div>
      </div>
    );
  };

  return renderPreview();
};

export default function BannerTemplates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<BannerTemplate | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollLeft = (category: string) => {
    const ref = scrollRefs.current[category];
    if (ref) {
      ref.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = (category: string) => {
    const ref = scrollRefs.current[category];
    if (ref) {
      ref.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  const handleUseTemplate = (template: BannerTemplate) => {
    toast.success(`Modèle "${template.name}" sélectionné !`);

    // Précharger le template dans le BannerCreator via localStorage
    const design = {
      text: template.text || template.name,
      colorFrom: template.defaultColors.primary,
      colorTo: template.defaultColors.secondary || null,
      align: template.align || "center",
      imageUrl: template.imageUrl || "",
      platform: template.networks[0] || "linkedin"
    };

    localStorage.setItem("banner_template_preload", JSON.stringify(design));
    navigate('/services/banner-creator');
  };

  const handlePreview = (template: BannerTemplate) => {
    setSelectedTemplate(template);
  };

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case 'linkedin': return '💼';
      case 'facebook': return '📘';
      case 'twitter': return '🐦';
      case 'instagram': return '📷';
      case 'youtube': return '📺';
      default: return '🌐';
    }
  };

  const filteredTemplates = selectedColor
    ? bannerTemplates.filter(template =>
        template.defaultColors.primary.toLowerCase().includes(selectedColor.toLowerCase()) ||
        template.defaultColors.secondary.toLowerCase().includes(selectedColor.toLowerCase())
      )
    : bannerTemplates;

  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredTemplates.filter(template => template.category === category);
    return acc;
  }, {} as { [key: string]: BannerTemplate[] });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Galerie de Modèles de Bannières
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choisissez parmi notre collection de bannières professionnelles pour réseaux sociaux
        </p>
      </div>

      {/* Color Filter */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtrer par couleur dominante:</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant={selectedColor === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedColor("")}
            className="flex items-center gap-2"
          >
            <span>🔍</span>
            Tous
          </Button>
          {colorFilters.map(color => (
            <Button
              key={color.name}
              variant={selectedColor === color.color ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedColor(color.color)}
              className="flex items-center gap-2"
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color.color }}
              />
              {color.name}
            </Button>
          ))}
        </div>
      </div>

      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">{category}</h2>

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
                  className="flex-shrink-0 w-96 snap-center shadow-md hover:shadow-2xl transition-all duration-300 group/card hover:scale-105 overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    {/* Banner Preview - Wide ratio 4:1 */}
                    <div className="w-full aspect-[4/1] bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center border-b relative group/preview">
                      <BannerPreviewComponent template={template} />
                      
                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-black/30 group-hover/preview:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/preview:opacity-100">
                        <div className="flex gap-3 flex-col sm:flex-row">
                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Utiliser ce design
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(template)}
                            className="bg-white/90 text-gray-800 hover:bg-white border-white shadow-lg"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Aperçu réel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{template.name}</h3>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{template.category}</Badge>
                    </div>

                    {/* Networks with emojis */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500 font-medium">Réseaux:</span>
                      <div className="flex gap-1">
                        {template.networks.map(network => (
                          <Badge
                            key={network}
                            variant="secondary"
                            className="text-xs gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <span>{getNetworkIcon(network)}</span>
                            <span className="hidden sm:inline capitalize">{network}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>

                    {/* Color dots */}
                    <div className="flex gap-2 mt-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: template.defaultColors.primary }}
                        title={template.defaultColors.primary}
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: template.defaultColors.secondary }}
                        title={template.defaultColors.secondary}
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: template.defaultColors.accent }}
                        title={template.defaultColors.accent}
                      />
                    </div>
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

      {/* Modal Preview - Aperçu Réel */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header Modal */}
            <div className="sticky top-0 flex justify-between items-center p-8 border-b bg-white rounded-t-2xl">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-8">
              {/* LinkedIn Profile Simulation */}
              <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl border border-gray-200 mb-8">
                <div className="max-w-3xl">
                  {/* LinkedIn Profile Header */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Banner Area */}
                    <div className="relative aspect-[4/1] overflow-hidden">
                      <BannerPreviewComponent template={selectedTemplate} />
                      
                      {/* Profile Photo Overlay */}
                      <div className="absolute left-8 bottom-0 transform translate-y-1/2 w-28 h-28 bg-white rounded-full border-4 border-white shadow-lg ring-2 ring-gray-200 flex items-center justify-center text-4xl">
                        👤
                      </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-16 px-8 pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-2xl text-gray-900">Jean Dupont</h4>
                          <p className="text-gray-700 font-medium">Expert en Transformation Digitale</p>
                          <p className="text-gray-600">Région de Paris, France • Consultant Indépendant</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                            Se connecter
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-400">
                            ...
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-4">
                        Cet aperçu vous montre comment votre bannière apparaîtra sur votre profil LinkedIn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Couleurs */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></span>
                    Palette de Couleurs
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: selectedTemplate.defaultColors.primary }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Couleur Primaire</p>
                        <p className="text-sm text-gray-500 font-mono">{selectedTemplate.defaultColors.primary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: selectedTemplate.defaultColors.secondary }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Couleur Secondaire</p>
                        <p className="text-sm text-gray-500 font-mono">{selectedTemplate.defaultColors.secondary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: selectedTemplate.defaultColors.accent }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Accent</p>
                        <p className="text-sm text-gray-500 font-mono">{selectedTemplate.defaultColors.accent}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Réseaux & Specs */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <span>🌐</span>
                    Réseaux Compatibles
                  </h5>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedTemplate.networks.map(network => (
                      <Badge
                        key={network}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-2 rounded-full font-medium"
                      >
                        <span className="mr-2">{getNetworkIcon(network)}</span>
                        {network.charAt(0).toUpperCase() + network.slice(1)}
                      </Badge>
                    ))}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">Dimensions:</span> 1584×396px (ratio 4:1)
                    </p>
                    <p className="text-sm text-amber-900 mt-2">
                      <span className="font-semibold">Format:</span> PNG, JPG, GIF
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-l-blue-600 rounded-lg p-6 mb-8">
                <h5 className="font-semibold text-blue-900 mb-2">💡 Conseil Professionnel</h5>
                <p className="text-sm text-blue-800">
                  Personnalisez cette bannière dans l'éditeur pour ajouter votre texte, logo ou d'autres éléments. 
                  Les dimensions optimales pour LinkedIn sont 1584×396 pixels.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg h-12"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Utiliser ce modèle
                </Button>
                <Button
                  onClick={() => setSelectedTemplate(null)}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-gray-300"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}