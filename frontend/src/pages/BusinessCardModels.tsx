import React, { useCallback, useState } from 'react';
import { Plus, Edit2, Trash2, Download, Eye, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import BusinessCardEditorModal, {
  BusinessCardData,
} from '@/components/BusinessCardEditorModal';
import { useCardStorage } from '@/hooks/useCardStorage';
import BusinessCardModelBlackOrange from '@/components/business-card-templates/BusinessCardModelBlackOrange';
import BusinessCardModelOrangeDynamic from '@/components/business-card-templates/BusinessCardModelOrangeDynamic';
import BusinessCardModelTechTurquoise from '@/components/business-card-templates/BusinessCardModelTechTurquoise';
import BusinessCardModelGeometricYellow from '@/components/business-card-templates/BusinessCardModelGeometricYellow';
import BusinessCardModelLuxeMinimalist from '@/components/business-card-templates/BusinessCardModelLuxeMinimalist';
import BusinessCardModelGeometricTriangle from '@/components/business-card-templates/BusinessCardModelGeometricTriangle';
import BusinessCardModelWaveNightBlueOrange from '@/components/business-card-templates/BusinessCardModelWaveNightBlueOrange';
import BusinessCardModelProfessionalRibbon from '@/components/business-card-templates/BusinessCardModelProfessionalRibbon';
import BusinessCardModelBicolorPhotoMask from '@/components/business-card-templates/BusinessCardModelBicolorPhotoMask';
import BusinessCardModelHighEndInstitutional from '@/components/business-card-templates/BusinessCardModelHighEndInstitutional';
import BusinessCardModelDigitalStartup from '@/components/business-card-templates/BusinessCardModelDigitalStartup';
import BusinessCardModelSoftMinimalist from '@/components/business-card-templates/BusinessCardModelSoftMinimalist';
import BusinessCardModelExecutiveGrey from '@/components/business-card-templates/BusinessCardModelExecutiveGrey';
import BusinessCardModelDynamicOrangeDiagonal from '@/components/business-card-templates/BusinessCardModelDynamicOrangeDiagonal';
import BusinessCardModelStudentPastel from '@/components/business-card-templates/BusinessCardModelStudentPastel';
import BusinessCardModelTechnicalNavy from '@/components/business-card-templates/BusinessCardModelTechnicalNavy';
import BusinessCardModelHighEndPearl from '@/components/business-card-templates/BusinessCardModelHighEndPearl';
import BusinessCardModelCreativeTurquoise from '@/components/business-card-templates/BusinessCardModelCreativeTurquoise';
import BusinessCardModelEarthTone from '@/components/business-card-templates/BusinessCardModelEarthTone';
import BusinessCardModelDarkTechNeon from '@/components/business-card-templates/BusinessCardModelDarkTechNeon';
import BusinessCardModelExecutiveFrame from '@/components/business-card-templates/BusinessCardModelExecutiveFrame';
import BusinessCardModelCreativeOrange from '@/components/business-card-templates/BusinessCardModelCreativeOrange';
import BusinessCardModelStudentPastelCentral from '@/components/business-card-templates/BusinessCardModelStudentPastelCentral';
import BusinessCardModelTechnicianMarine from '@/components/business-card-templates/BusinessCardModelTechnicianMarine';
import BusinessCardModelExpertAdele from '@/components/business-card-templates/BusinessCardModelExpertAdele';

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
    id: 'luxe-minimalist',
    name: 'Luxe Minimalist',
    description: 'Noir profond et blanc avec lettrage espacé',
    component: BusinessCardModelLuxeMinimalist,
  },
  {
    id: 'geometric-triangle',
    name: 'Geometric Triangle',
    description: 'Jaune vif et anthracite avec timeline',
    component: BusinessCardModelGeometricTriangle,
  },
  {
    id: 'wave-night-blue',
    name: 'Wave Night Blue',
    description: 'Design fluide avec vague orange cuivré',
    component: BusinessCardModelWaveNightBlueOrange,
  },
  {
    id: 'professional-ribbon',
    name: 'Professional Ribbon',
    description: 'Ruban structuré idéal pour comptabilité',
    component: BusinessCardModelProfessionalRibbon,
  },
  {
    id: 'bicolor-photo',
    name: 'Bicolor Photo Mask',
    description: 'Jaune et noir avec cercle pour photo',
    component: BusinessCardModelBicolorPhotoMask,
  },
  {
    id: 'high-end-institutional',
    name: 'High-End Institutional',
    description: 'Bleu marine et or pour style classique',
    component: BusinessCardModelHighEndInstitutional,
  },
  {
    id: 'digital-startup',
    name: 'Digital Startup',
    description: 'Turquoise futuriste avec QR code',
    component: BusinessCardModelDigitalStartup,
  },
  {
    id: 'soft-minimalist',
    name: 'Soft Minimalist',
    description: 'Beige et terracotta chaleureux',
    component: BusinessCardModelSoftMinimalist,
  },
  {
    id: 'executive-grey',
    name: 'Executive Grey',
    description: 'Gris anthracite avec initiales en carré blanc',
    component: BusinessCardModelExecutiveGrey,
  },
  {
    id: 'dynamic-orange-diagonal',
    name: 'Dynamic Orange Diagonal',
    description: 'Orange et noir divisés diagonalement',
    component: BusinessCardModelDynamicOrangeDiagonal,
  },
  {
    id: 'student-pastel',
    name: 'Student Pastel',
    description: 'Rose pastel minimaliste pour étudiants',
    component: BusinessCardModelStudentPastel,
  },
  {
    id: 'technical-navy',
    name: 'Technical Navy',
    description: 'Bleu marine avec motif de points technique',
    component: BusinessCardModelTechnicalNavy,
  },
  {
    id: 'high-end-pearl',
    name: 'High-End Pearl',
    description: 'Gris perle et jaune orangé institutionnel',
    component: BusinessCardModelHighEndPearl,
  },
  {
    id: 'creative-turquoise',
    name: 'Creative Turquoise',
    description: 'Turquoise et noir avec cursive artistique',
    component: BusinessCardModelCreativeTurquoise,
  },
  {
    id: 'earth-tone',
    name: 'Earth Tone',
    description: 'Beige, brun et terracotta naturel premium',
    component: BusinessCardModelEarthTone,
  },
  {
    id: 'dark-tech-neon',
    name: 'Dark Tech Neon',
    description: 'Noir carbone et bleu néon futuriste',
    component: BusinessCardModelDarkTechNeon,
  },
  {
    id: 'executive-frame',
    name: 'Executive Frame',
    description: 'Noir et blanc avec cadre exécutif',
    component: BusinessCardModelExecutiveFrame,
  },
  {
    id: 'creative-orange',
    name: 'Créatif Orange',
    description: 'Orange vif avec bloc blanc de coordonnées',
    component: BusinessCardModelCreativeOrange,
  },
  {
    id: 'student-pastel-central',
    name: 'Étudiant Pastel Central',
    description: 'Rose pastel avec rectangle noir central',
    component: BusinessCardModelStudentPastelCentral,
  },
  {
    id: 'technician-marine',
    name: 'Technique Marine',
    description: 'Bleu marine avec labels courts',
    component: BusinessCardModelTechnicianMarine,
  },
  {
    id: 'expert-adele',
    name: 'Expert Adèle',
    description: 'Gris perle avec timeline pointillée',
    component: BusinessCardModelExpertAdele,
  },
  {
    id: 'expert-adele',
    name: 'Expert Adèle',
    description: 'Gris perle avec timeline pointillée',
    component: BusinessCardModelExpertAdele,
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

const BusinessCardModelsPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [flippedTemplates, setFlippedTemplates] = useState<Set<string>>(new Set());
  const { getCards, addCard, updateCard, deleteCard, getCardsByTemplate } = useCardStorage(
    () => setRefreshKey(k => k + 1)
  );

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PreviewCard | null>(null);
  const [previewCard, setPreviewCard] = useState<PreviewCard | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const savedCards = getCards();

  const toggleFlip = (templateId: string) => {
    const newFlipped = new Set(flippedTemplates);
    if (newFlipped.has(templateId)) {
      newFlipped.delete(templateId);
    } else {
      newFlipped.add(templateId);
    }
    setFlippedTemplates(newFlipped);
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 mb-12">
          {TEMPLATES.map(template => {
            const isFlipped = flippedTemplates.has(template.id);
            return (
              <div key={template.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden flex flex-col border border-gray-200">
                {/* Presentation Card Container */}
                <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                  {/* Business Card Preview - Shows recto and verso */}
                  <div className="flex gap-6 justify-center items-center mb-6">
                    {/* Recto (Front) - always visible */}
                    {!isFlipped && (
                      <div 
                        className="bg-white shadow-lg rounded border border-gray-300"
                        style={{
                          width: '340px',
                          height: '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%', height: '250%' }}>
                          <template.component data={SAMPLE_CARD} />
                        </div>
                      </div>
                    )}

                    {/* Verso (Back) - shown when flipped */}
                    {isFlipped && (
                      <div 
                        className="bg-white shadow-lg rounded border border-gray-300 flex items-center justify-center"
                        style={{
                          width: '340px',
                          height: '220px',
                          backgroundColor: '#f9f9f9',
                        }}
                      >
                        <div style={{ textAlign: 'center', color: '#666' }}>
                          <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Verso</p>
                          <p style={{ fontSize: '11px', color: '#999' }}>Affichage du recto par défaut</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Label */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-semibold tracking-wide">Format: 85 × 55 mm (ISO/IEC 7810)</p>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6 flex-grow flex flex-col bg-white border-t border-gray-100">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-grow">{template.description}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-col">
                    <button
                      onClick={() => toggleFlip(template.id)}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                    >
                      <RotateCw size={16} />
                      {isFlipped ? 'Voir le recto' : 'Voir le verso'}
                    </button>
                    
                    <button
                      onClick={() => handleCreateCard(template.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus size={16} />
                      Créer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
};

export default BusinessCardModelsPage;
