import React, { useCallback, useState } from 'react';
import { Plus, Edit2, Trash2, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
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
    description: 'Design professionnel avec initiales',
    component: BusinessCardModelBlackOrange,
  },
  {
    id: 'orange-dynamic',
    name: 'Orange Dynamic',
    description: 'Style moderne avec division recto-verso',
    component: BusinessCardModelOrangeDynamic,
  },
  {
    id: 'tech-turquoise',
    name: 'Tech Turquoise',
    description: 'Moderne tech avec QR code',
    component: BusinessCardModelTechTurquoise,
  },
  {
    id: 'geometric-yellow',
    name: 'Geometric Yellow',
    description: 'Design géométrique avec triangle',
    component: BusinessCardModelGeometricYellow,
  },
  {
    id: 'black-white-classic',
    name: 'Black & White Classic',
    description: 'Minimaliste noir et blanc',
    component: BusinessCardModelBlackWhiteClassic,
  },
  {
    id: 'wave-night-blue',
    name: 'Wave Night Blue',
    description: 'Design moderne avec vague',
    component: BusinessCardModelWaveNightBlue,
  },
  {
    id: 'institutional-grey',
    name: 'Institutional Grey',
    description: 'Style institutionnel professionnel',
    component: BusinessCardModelInstitutionalGrey,
  },
  {
    id: 'turquoise-orange-dynamic',
    name: 'Turquoise & Orange Dynamic',
    description: 'Bicolore moderne et dynamique',
    component: BusinessCardModelTurquoiseOrangeDynamic,
  },
  {
    id: 'yellow-triangle',
    name: 'Yellow Triangle',
    description: 'Géométrique avec triangle jaune',
    component: BusinessCardModelYellowTriangle,
  },
  {
    id: 'tech-startup-bicolor',
    name: 'Tech Startup Bicolor',
    description: 'Bicolore turquoise et orange moderne',
    component: BusinessCardModelTechStartupBicolor,
  },
  {
    id: 'curved-wave-night-blue',
    name: 'Curved Wave Night Blue',
    description: 'Formes courbes bleu nuit et orange',
    component: BusinessCardModelCurvedWaveNightBlue,
  },
  {
    id: 'professional-separation-line',
    name: 'Professional Separation Line',
    description: 'Ligne de séparation professionnelle',
    component: BusinessCardModelProfessionalSeparationLine,
  },
  {
    id: 'anthracite-white-divided',
    name: 'Anthracite & White Divided',
    description: 'Fond divisé noir et blanc',
    component: BusinessCardModelAnthraciteWhiteDivided,
  },
  {
    id: 'orange-vibrant-urban',
    name: 'Orange Vibrant Urban',
    description: 'Orange vif urbain et moderne',
    component: BusinessCardModelOrangeVibrantUrban,
  },
  {
    id: 'pink-pastel-student',
    name: 'Pink Pastel Student',
    description: 'Rose pastel pour étudiants',
    component: BusinessCardModelPinkPastelStudent,
  },
  {
    id: 'navy-white-professional',
    name: 'Navy & White Professional',
    description: 'Bleu marine et blanc professionnel',
    component: BusinessCardModelNavyWhiteProfessional,
  },
  {
    id: 'high-end-minimalist',
    name: 'High-End Minimalist',
    description: 'Minimaliste haut de gamme avec accent orange',
    component: BusinessCardModelHighEndMinimalist,
  },
  {
    id: 'navy-geometric-icon',
    name: 'Navy Geometric Icon',
    description: 'Bleu marine avec icône géométrique élégante',
    component: BusinessCardModelNavyGeometricIcon,
  },
  {
    id: 'turquoise-orange-accent',
    name: 'Turquoise & Orange Accent',
    description: 'Turquoise moderne avec accent orange vif',
    component: BusinessCardModelTurquoiseOrangeAccent,
  },
  {
    id: 'yellow-white-u-shape',
    name: 'Yellow White U-Shape',
    description: 'Jaune dynamique avec design U-shape blanc',
    component: BusinessCardModelYellowWhiteUShape,
  },
  {
    id: 'navy-copper-wave',
    name: 'Navy Copper Wave',
    description: 'Bleu nuit avec vague cuivrée fluide',
    component: BusinessCardModelNavyCopperWave,
  },
  {
    id: 'pearl-separation-line',
    name: 'Pearl Separation Line',
    description: 'Gris perle avec ligne de séparation classique',
    component: BusinessCardModelPearlSeparationLine,
  },
  {
    id: 'anthracite-vertical-divide',
    name: 'Anthracite Vertical Divide',
    description: 'Division verticale anthracite et blanc',
    component: BusinessCardModelAnthraciteVerticalDivide,
  },
  {
    id: 'orange-black-dynamic',
    name: 'Orange Black Dynamic',
    description: 'Orange vif avec design urbain dynamique',
    component: BusinessCardModelOrangeBlackDynamic,
  },
  {
    id: 'beige-high-end',
    name: 'Beige High-End',
    description: 'Beige crème élégant et minimaliste',
    component: BusinessCardModelBeigeHighEnd,
  },
  {
    id: 'navy-white-bicolor',
    name: 'Navy White Bicolor',
    description: 'Bleu marine et blanc bicolore professionnel',
    component: BusinessCardModelNavyWhiteBicolor,
  },
];

const SAMPLE_CARD: BusinessCardData = {
  candidateName: 'Jean Dupont',
  position: 'Développeur Full Stack',
  email: 'jean.dupont@example.com',
  phone: '+33 6 12 34 56 78',
  location: 'Paris, France',
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

  const handleExportPDF = (card: PreviewCard) => {
    const element = document.querySelector(
      `.card-preview-${card.id}`
    ) as HTMLElement;
    if (!element) return;

    const html2pdf = require('html2pdf.js');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cartes de Visite Professionnelles</h1>
          <p className="text-lg text-gray-600">
            Créez et personnalisez vos cartes de visite recto-verso. Exportez en PDF et sauvegardez pour plus tard.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {TEMPLATES.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
              {/* Preview */}
              <div className="p-4 bg-gray-50 border-b h-64 flex items-center justify-center">
                <template.component data={SAMPLE_CARD} />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                <button
                  onClick={() => handleCreateCard(template.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Créer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Saved Cards Section */}
        {savedCards.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
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
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Aucune carte de visite sauvegardée pour le moment.</p>
            <p className="text-gray-400 mt-2">
              Créez votre première carte de visite en sélectionnant un modèle ci-dessus.
            </p>
          </div>
        )}
      </div>

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

      {/* Preview Modal */}
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
