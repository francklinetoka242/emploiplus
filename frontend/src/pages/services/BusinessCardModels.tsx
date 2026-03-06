import React, { useCallback, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Download, Eye, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BusinessCardEditorModal, {
  BusinessCardData,
} from '@/components/BusinessCardEditorModal';
import { useCardStorage } from '@/hooks/useCardStorage';
import BusinessCardModelBlackOrange from '@/components/business-card-templates/BusinessCardModelBlackOrange';
import BusinessCardModelOrangeDynamic from '@/components/business-card-templates/BusinessCardModelOrangeDynamic';
import BusinessCardModelTechTurquoise from '@/components/business-card-templates/BusinessCardModelTechTurquoise';
import BusinessCardModelGeometricYellow from '@/components/business-card-templates/BusinessCardModelGeometricYellow';
import BusinessCardModelBlackWhiteClassic from '@/components/business-card-templates/BusinessCardModelBlackWhiteClassic';
import BusinessCardModelWaveNightBlue from '@/components/business-card-templates/BusinessCardModelWaveNightBlue';
import BusinessCardModelInstitutionalGrey from '@/components/business-card-templates/BusinessCardModelInstitutionalGrey';
import BusinessCardModelTurquoiseOrangeDynamic from '@/components/business-card-templates/BusinessCardModelTurquoiseOrangeDynamic';
import BusinessCardModelYellowTriangle from '@/components/business-card-templates/BusinessCardModelYellowTriangle';
import BusinessCardModelTechStartupBicolor from '@/components/business-card-templates/BusinessCardModelTechStartupBicolor';
import BusinessCardModelCurvedWaveNightBlue from '@/components/business-card-templates/BusinessCardModelCurvedWaveNightBlue';
import BusinessCardModelProfessionalSeparationLine from '@/components/business-card-templates/BusinessCardModelProfessionalSeparationLine';
import BusinessCardModelAnthraciteWhiteDivided from '@/components/business-card-templates/BusinessCardModelAnthraciteWhiteDivided';
import BusinessCardModelOrangeVibrantUrban from '@/components/business-card-templates/BusinessCardModelOrangeVibrantUrban';
import BusinessCardModelPinkPastelStudent from '@/components/business-card-templates/BusinessCardModelPinkPastelStudent';
import BusinessCardModelNavyWhiteProfessional from '@/components/business-card-templates/BusinessCardModelNavyWhiteProfessional';
import BusinessCardModelHighEndMinimalist from '@/components/business-card-templates/BusinessCardModelHighEndMinimalist';
import BusinessCardModelNavyGeometricIcon from '@/components/business-card-templates/BusinessCardModelNavyGeometricIcon';
import BusinessCardModelTurquoiseOrangeAccent from '@/components/business-card-templates/BusinessCardModelTurquoiseOrangeAccent';
import BusinessCardModelYellowWhiteUShape from '@/components/business-card-templates/BusinessCardModelYellowWhiteUShape';
import BusinessCardModelNavyCopperWave from '@/components/business-card-templates/BusinessCardModelNavyCopperWave';
import BusinessCardModelPearlSeparationLine from '@/components/business-card-templates/BusinessCardModelPearlSeparationLine';
import BusinessCardModelAnthraciteVerticalDivide from '@/components/business-card-templates/BusinessCardModelAnthraciteVerticalDivide';
import BusinessCardModelOrangeBlackDynamic from '@/components/business-card-templates/BusinessCardModelOrangeBlackDynamic';
import BusinessCardModelBeigeHighEnd from '@/components/business-card-templates/BusinessCardModelBeigeHighEnd';
import BusinessCardModelNavyWhiteBicolor from '@/components/business-card-templates/BusinessCardModelNavyWhiteBicolor';

const TEMPLATES = [
  {
    id: 'black-orange',
    name: 'Black & Orange',
    category: 'moderne',
    description: 'Design professionnel avec initiales',
    component: BusinessCardModelBlackOrange,
  },
  {
    id: 'orange-dynamic',
    name: 'Orange Dynamic',
    category: 'moderne',
    description: 'Style moderne avec division recto-verso',
    component: BusinessCardModelOrangeDynamic,
  },
  {
    id: 'tech-turquoise',
    name: 'Tech Turquoise',
    category: 'moderne',
    description: 'Moderne tech avec QR code',
    component: BusinessCardModelTechTurquoise,
  },
  {
    id: 'geometric-yellow',
    name: 'Geometric Yellow',
    category: 'moderne',
    description: 'Design géométrique avec triangle',
    component: BusinessCardModelGeometricYellow,
  },
  {
    id: 'black-white-classic',
    name: 'Black & White Classic',
    category: 'classique',
    description: 'Minimaliste noir et blanc',
    component: BusinessCardModelBlackWhiteClassic,
  },
  {
    id: 'wave-night-blue',
    name: 'Wave Night Blue',
    category: 'moderne',
    description: 'Design moderne avec vague',
    component: BusinessCardModelWaveNightBlue,
  },
  {
    id: 'institutional-grey',
    name: 'Institutional Grey',
    category: 'classique',
    description: 'Style institutionnel professionnel',
    component: BusinessCardModelInstitutionalGrey,
  },
  {
    id: 'turquoise-orange-dynamic',
    name: 'Turquoise & Orange Dynamic',
    category: 'moderne',
    description: 'Bicolore moderne et dynamique',
    component: BusinessCardModelTurquoiseOrangeDynamic,
  },
  {
    id: 'yellow-triangle',
    name: 'Yellow Triangle',
    category: 'moderne',
    description: 'Géométrique avec triangle jaune',
    component: BusinessCardModelYellowTriangle,
  },
  {
    id: 'tech-startup-bicolor',
    name: 'Tech Startup Bicolor',
    category: 'moderne',
    description: 'Bicolore turquoise et orange moderne',
    component: BusinessCardModelTechStartupBicolor,
  },
  {
    id: 'curved-wave-night-blue',
    name: 'Curved Wave Night Blue',
    category: 'moderne',
    description: 'Formes courbes bleu nuit et orange',
    component: BusinessCardModelCurvedWaveNightBlue,
  },
  {
    id: 'professional-separation-line',
    name: 'Professional Separation Line',
    category: 'classique',
    description: 'Ligne de séparation professionnelle',
    component: BusinessCardModelProfessionalSeparationLine,
  },
  {
    id: 'anthracite-white-divided',
    name: 'Anthracite & White Divided',
    category: 'classique',
    description: 'Fond divisé noir et blanc',
    component: BusinessCardModelAnthraciteWhiteDivided,
  },
  {
    id: 'orange-vibrant-urban',
    name: 'Orange Vibrant Urban',
    category: 'moderne',
    description: 'Orange vif urbain et moderne',
    component: BusinessCardModelOrangeVibrantUrban,
  },
  {
    id: 'pink-pastel-student',
    name: 'Pink Pastel Student',
    category: 'moderne',
    description: 'Rose pastel pour étudiants',
    component: BusinessCardModelPinkPastelStudent,
  },
  {
    id: 'navy-white-professional',
    name: 'Navy & White Professional',
    category: 'classique',
    description: 'Bleu marine et blanc professionnel',
    component: BusinessCardModelNavyWhiteProfessional,
  },
  {
    id: 'high-end-minimalist',
    name: 'High-End Minimalist',
    category: 'moderne',
    description: 'Minimaliste haut de gamme avec accent orange',
    component: BusinessCardModelHighEndMinimalist,
  },
  {
    id: 'navy-geometric-icon',
    name: 'Navy Geometric Icon',
    category: 'moderne',
    description: 'Bleu marine avec icône géométrique élégante',
    component: BusinessCardModelNavyGeometricIcon,
  },
  {
    id: 'turquoise-orange-accent',
    name: 'Turquoise & Orange Accent',
    category: 'moderne',
    description: 'Turquoise moderne avec accent orange vif',
    component: BusinessCardModelTurquoiseOrangeAccent,
  },
  {
    id: 'yellow-white-u-shape',
    name: 'Yellow White U-Shape',
    category: 'moderne',
    description: 'Jaune dynamique avec design U-shape blanc',
    component: BusinessCardModelYellowWhiteUShape,
  },
  {
    id: 'navy-copper-wave',
    name: 'Navy Copper Wave',
    category: 'moderne',
    description: 'Bleu nuit avec vague cuivrée fluide',
    component: BusinessCardModelNavyCopperWave,
  },
  {
    id: 'pearl-separation-line',
    name: 'Pearl Separation Line',
    category: 'classique',
    description: 'Gris perle avec ligne de séparation classique',
    component: BusinessCardModelPearlSeparationLine,
  },
  {
    id: 'anthracite-vertical-divide',
    name: 'Anthracite Vertical Divide',
    category: 'classique',
    description: 'Division verticale anthracite et blanc',
    component: BusinessCardModelAnthraciteVerticalDivide,
  },
  {
    id: 'orange-black-dynamic',
    name: 'Orange Black Dynamic',
    category: 'moderne',
    description: 'Orange vif avec design urbain dynamique',
    component: BusinessCardModelOrangeBlackDynamic,
  },
  {
    id: 'beige-high-end',
    name: 'Beige High-End',
    category: 'classique',
    description: 'Beige crème élégant et minimaliste',
    component: BusinessCardModelBeigeHighEnd,
  },
  {
    id: 'navy-white-bicolor',
    name: 'Navy White Bicolor',
    category: 'classique',
    description: 'Bleu marine et blanc bicolore professionnel',
    component: BusinessCardModelNavyWhiteBicolor,
  },
];

const categories = ["moderne", "classique"];

const SAMPLE_CARD: BusinessCardData = {
  candidateName: 'Jean Marc',
  position: 'Développeur Full Stack',
  email: 'jean.dupont@example.com',
  phone: '+242 06 731 10 33',
  location: 'Brazzaville, Congo',
  template: 'black-orange',
};

interface PreviewCard extends BusinessCardData {
  id: string;
  createdAt: string;
}

export default function BusinessCardModels() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { getCards, addCard, updateCard, deleteCard, getCardsByTemplate } = useCardStorage(
    () => setRefreshKey(k => k + 1)
  );

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PreviewCard | null>(null);
  const [previewCard, setPreviewCard] = useState<PreviewCard | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<any>(null);
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

  const handleUseTemplate = (template: any) => {
    toast.success(`Modèle "${template.name}" sélectionné !`);
    handleCreateCard(template.id);
  };

  const handlePreview = (template: any) => {
    setSelectedTemplateForPreview(template);
  };

  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = TEMPLATES.filter(template => template.category === category);
    return acc;
  }, {} as { [key: string]: any[] });

  const savedCards = getCards();

  const handleCreateCard = (templateId: string) => {
    setSelectedTemplate(templateId);
    setEditingCard(null);
    setIsEditorOpen(true);
  };

  const handleEditCard = (card: PreviewCard) => {
    setEditingCard(card);
    setSelectedTemplate(card.template);
    setIsEditorOpen(true);
  };

  const handleDeleteCard = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la carte de visite de ${name} ?`)) {
      deleteCard(id);
      toast.success('Carte de visite supprimée');
    }
  };

  const handleSaveCard = useCallback(
    (card: BusinessCardData) => {
      if (editingCard && editingCard.id) {
        updateCard(editingCard.id, card);
        toast.success('Carte de visite mise à jour');
      } else {
        addCard(card);
        toast.success('Carte de visite créée');
      }
      setIsEditorOpen(false);
      setEditingCard(null);
    },
    [editingCard, updateCard, addCard]
  );

  const handleExportPDF = async (card: PreviewCard) => {
    const element = document.querySelector(
      `.card-preview-${card.id}`
    ) as HTMLElement;
    if (!element) return;
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;
    const options = {
      margin: 5,
      filename: `${card.candidateName}-business-card.pdf`,
      image: { type: 'image/png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: [215, 110] },
    };

    html2pdf().set(options).from(element).save();
  };

  const getTemplateComponent = (templateId: string) => {
    return TEMPLATES.find(t => t.id === templateId)?.component;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Cartes de Visite Professionnelles
        </h1>
        <p className="text-lg text-muted-foreground">
          Créez des cartes de visite percutantes avec nos modèles professionnels
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 capitalize">
            {category === 'moderne' ? 'Cartes Modernes' : 'Cartes Classiques'}
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
                      <div className="transform scale-75">
                        <template.component data={SAMPLE_CARD} />
                      </div>
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
      {selectedTemplateForPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-2xl font-bold">{selectedTemplateForPreview.name}</h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedTemplateForPreview(null)}
              >
                ✕
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-lg border mb-4">
                    <selectedTemplateForPreview.component data={SAMPLE_CARD} />
                  </div>
                  <h4 className="font-semibold text-lg mb-3">Description</h4>
                  <p className="text-gray-600 mb-6">{selectedTemplateForPreview.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">Aperçu</h4>
                  <div className="bg-white border rounded-lg p-4 mb-6">
                    <selectedTemplateForPreview.component data={SAMPLE_CARD} />
                  </div>

                  <div className="bg-blue-50 border-l-4 border-l-blue-600 p-4 rounded">
                    <h5 className="font-semibold text-blue-800 mb-2">Créez votre carte de visite</h5>
                    <p className="text-sm text-blue-700">
                      Personnalisez ce modèle avec vos informations et exportez-le en PDF haute qualité.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Button onClick={() => handleUseTemplate(selectedTemplateForPreview)}>
                  Utiliser ce modèle
                </Button>
                <Button variant="outline" onClick={() => setSelectedTemplateForPreview(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Cards Section */}
      {savedCards.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Mes Cartes de Visite Sauvegardées</h2>

          <div className="space-y-6">
            {TEMPLATES.map(template => {
              const templateCards = savedCards.filter(c => c.template === template.id);
              if (templateCards.length === 0) return null;

              return (
                <div key={template.id} className="border rounded-lg p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">{template.name}</h3>

                  <div className="space-y-4">
                    {(templateCards as PreviewCard[]).map(card => {
                      const CardComponent = getTemplateComponent(card.template);
                      return (
                        <div
                          key={card.id}
                          className="bg-white rounded-lg p-4 border flex items-start justify-between hover:shadow-md transition"
                        >
                          {/* Card Preview */}
                          <div className="flex-1">
                            <div className={`card-preview-${card.id}`}>
                              {CardComponent ? (
                                <div className="w-96">
                                  <CardComponent data={card} />
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                setPreviewCard(card);
                                setShowPreview(true);
                              }}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
                              title="Voir"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditCard(card)}
                              className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-lg transition"
                              title="Éditer"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleExportPDF(card)}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition"
                              title="Exporter PDF"
                            >
                              <Download size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card.id, card.candidateName)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {savedCards.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center mt-12">
          <p className="text-gray-500 text-lg">Aucune carte de visite sauvegardée pour le moment.</p>
          <p className="text-gray-400 mt-2">
            Créez votre première carte de visite en sélectionnant un modèle ci-dessus.
          </p>
        </div>
      )}

      {/* Editor Modal */}
      {selectedTemplate && (
        <BusinessCardEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingCard(null);
            setSelectedTemplate(null);
          }}
          onSave={handleSaveCard}
          initialData={editingCard || undefined}
          templateId={selectedTemplate}
        />
      )}

      {/* Preview Modal for Saved Cards */}
      {showPreview && previewCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Aperçu - {previewCard.candidateName}
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center mb-6">
              {getTemplateComponent(previewCard.template) &&
                React.createElement(
                  getTemplateComponent(previewCard.template)!,
                  { data: previewCard }
                )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleExportPDF(previewCard)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <Download size={18} />
                Export PDF
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded-lg transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
