import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, Play } from "lucide-react";
import { toast } from "sonner";
import PortfolioMinimaliste from "./portfolio-templates/PortfolioMinimaliste";
import PortfolioMinialistePreview from "./PortfolioMinialistePreview";

interface PortfolioTemplate {
  id: string;
  name: string;
  category: string;
  previewImage?: string;
  description: string;
  component?: any;
  previewComponent?: any;
  isNew?: boolean;
}

const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  {
    id: "minimalist-premium",
    name: "Minimaliste Premium",
    category: "Minimaliste",
    description: "Grille asymétrique, espace blanc maximal, images en grayscale",
    component: PortfolioMinimaliste,
    previewComponent: PortfolioMinialistePreview,
    isNew: true
  },
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
  const navigate = useNavigate();
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
    if (template.id === "minimalist-premium") {
      navigate('/services/portfolio-minimaliste-editor');
    } else {
      toast.info("Éditeur en développement pour ce modèle");
    }
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
                    {template.previewComponent ? (
                      <div className="w-full h-48 overflow-hidden bg-gray-100">
                        <template.previewComponent />
                      </div>
                    ) : (
                      <img
                        src={template.previewImage || "/assets/placeholder-portfolio.jpg"}
                        alt={template.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/placeholder-portfolio.jpg';
                        }}
                      />
                    )}
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        {template.isNew && (
                          <Badge className="bg-emerald-500 text-white text-xs">Nouveau</Badge>
                        )}
                      </div>
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

      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
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
              {selectedTemplate.component ? (
                <div className="border rounded-lg overflow-hidden" style={{ minHeight: "600px" }}>
                  <selectedTemplate.component
                    userProfile={{
                      name: "Votre Nom",
                      bio: "Créateur d'expériences digitales minimalistes et fonctionnelles",
                      email: "contact@example.com",
                      socialLinks: [
                        { label: "LinkedIn", url: "#" },
                        { label: "GitHub", url: "#" },
                        { label: "Twitter", url: "#" },
                      ],
                    }}
                    projects={[
                      {
                        id: "1",
                        title: "Refonte E-commerce",
                        image: "/assets/placeholder-portfolio.jpg",
                        category: "Web Design",
                        year: 2024,
                        description: "Plateforme e-commerce minimaliste avec UX optimisée",
                      },
                      {
                        id: "2",
                        title: "Application Mobile",
                        image: "/assets/placeholder-portfolio.jpg",
                        category: "Mobile",
                        year: 2024,
                        description: "Application minimaliste pour gestion de tâches",
                      },
                      {
                        id: "3",
                        title: "Identité Visuelle",
                        image: "/assets/placeholder-portfolio.jpg",
                        category: "Branding",
                        year: 2023,
                        description: "Système de design complet",
                      },
                      {
                        id: "4",
                        title: "Plateforme SaaS",
                        image: "/assets/placeholder-portfolio.jpg",
                        category: "Web Design",
                        year: 2023,
                        description: "Interface d'analytique en temps réel",
                      },
                    ]}
                  />
                </div>
              ) : selectedTemplate.previewComponent ? (
                <div className="border rounded-lg overflow-hidden" style={{ minHeight: "600px" }}>
                  <selectedTemplate.previewComponent />
                </div>
              ) : (
                <>
                  <img
                    src={selectedTemplate.previewImage || "/assets/placeholder-portfolio.jpg"}
                    alt={selectedTemplate.name}
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/placeholder-portfolio.jpg';
                    }}
                  />
                  <p className="mt-4 text-gray-600">{selectedTemplate.description}</p>
                </>
              )}

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
