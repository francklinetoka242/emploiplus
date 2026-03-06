import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, Play } from "lucide-react";
import { toast } from "sonner";

interface PortfolioTemplate {
  id: string;
  name: string;
  category: string;
  previewImage: string;
  description: string;
}

const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  // Minimaliste
  {
    id: "minimalist-clean",
    name: "Minimaliste Épuré",
    category: "Minimaliste",
    previewImage: "/assets/portfolio-previews/minimalist-clean.jpg",
    description: "Design épuré avec focus sur le contenu"
  },
  {
    id: "minimalist-white",
    name: "Blanc Minimal",
    category: "Minimaliste",
    previewImage: "/assets/portfolio-previews/minimalist-white.jpg",
    description: "Palette blanche avec accents subtils"
  },
  {
    id: "minimalist-grid",
    name: "Grille Minimaliste",
    category: "Minimaliste",
    previewImage: "/assets/portfolio-previews/minimalist-grid.jpg",
    description: "Layout en grille pour une organisation claire"
  },

  // Créatif
  {
    id: "creative-bold",
    name: "Créatif Audacieux",
    category: "Créatif",
    previewImage: "/assets/portfolio-previews/creative-bold.jpg",
    description: "Couleurs vives et typographie expressive"
  },
  {
    id: "creative-abstract",
    name: "Abstrait Créatif",
    category: "Créatif",
    previewImage: "/assets/portfolio-previews/creative-abstract.jpg",
    description: "Éléments graphiques abstraits et modernes"
  },
  {
    id: "creative-illustration",
    name: "Illustré Créatif",
    category: "Créatif",
    previewImage: "/assets/portfolio-previews/creative-illustration.jpg",
    description: "Illustrations personnalisées et originales"
  },

  // Corporate
  {
    id: "corporate-professional",
    name: "Corporate Professionnel",
    category: "Corporate",
    previewImage: "/assets/portfolio-previews/corporate-professional.jpg",
    description: "Design sérieux et professionnel"
  },
  {
    id: "corporate-elegant",
    name: "Élégant Corporate",
    category: "Corporate",
    previewImage: "/assets/portfolio-previews/corporate-elegant.jpg",
    description: "Élégance et sophistication pour entreprises"
  },
  {
    id: "corporate-modern",
    name: "Moderne Corporate",
    category: "Corporate",
    previewImage: "/assets/portfolio-previews/corporate-modern.jpg",
    description: "Corporate avec une touche moderne"
  },

  // Tech
  {
    id: "tech-dark",
    name: "Tech Sombre",
    category: "Tech",
    previewImage: "/assets/portfolio-previews/tech-dark.jpg",
    description: "Thème sombre pour développeurs"
  },
  {
    id: "tech-neon",
    name: "Néon Tech",
    category: "Tech",
    previewImage: "/assets/portfolio-previews/tech-neon.jpg",
    description: "Effets néon et high-tech"
  },
  {
    id: "tech-clean",
    name: "Propre Tech",
    category: "Tech",
    previewImage: "/assets/portfolio-previews/tech-clean.jpg",
    description: "Design propre et fonctionnel"
  }
];

const categories = ["Minimaliste", "Créatif", "Corporate", "Tech"];

export default function PortfolioTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioTemplate | null>(null);
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  const handleUseTemplate = (template: PortfolioTemplate) => {
    toast.success(`Modèle "${template.name}" sélectionné !`);
    // Ici, vous pouvez rediriger vers le PortfolioBuilder avec le template sélectionné
    // window.location.href = `/services/portfolio-builder?template=${template.id}`;
  };

  const handlePreview = (template: PortfolioTemplate) => {
    setSelectedTemplate(template);
  };

  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = PORTFOLIO_TEMPLATES.filter(template => template.category === category);
    return acc;
  }, {} as { [key: string]: PortfolioTemplate[] });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Galerie de Modèles de Portfolio
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choisissez parmi notre collection de modèles professionnels pour créer un portfolio qui vous ressemble
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">{category}</h2>

          <div className="relative group">
            {/* Bouton gauche */}
            <button
              onClick={() => scrollLeft(category)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            {/* Conteneur scrollable */}
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
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/placeholder-portfolio.jpg';
                      }}
                    />
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

            {/* Bouton droite */}
            <button
              onClick={() => scrollRight(category)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      ))}

      {/* Modal d'aperçu (optionnel) */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{selectedTemplate.name}</h3>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ✕
                </Button>
              </div>
              <img
                src={selectedTemplate.previewImage}
                alt={selectedTemplate.name}
                className="w-full h-auto rounded-lg"
              />
              <p className="mt-4 text-gray-600">{selectedTemplate.description}</p>
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
    </div>
  );
}