import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Waves, Grid3x3 } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { useDesignStore } from '@/stores/designStore';
import { FlyerEditorModal, FlyerData } from '@/components/flyer-builder/FlyerEditorModal';
import {
  FlyerPreviewImpactBusiness,
  FlyerPreviewBlueWave,
  FlyerPreviewGeometricTech,
} from '@/components/flyer-previews/FlyerPreviews';

interface FlyerTemplate {
  id: string;
  name: string;
  description: string;
  subtitle: string;
  icon: React.ReactNode;
  colors: string[];
  features: string[];
  prompt: string;
  previewGradient: string;
  PreviewComponent: React.ComponentType;
}

const FLYER_TEMPLATES: FlyerTemplate[] = [
  {
    id: 'impact-business',
    name: 'Impact Business',
    subtitle: 'Rouge & Noir',
    description: 'Design rigide et contrasté pour les agences créatives et entreprises audacieuses',
    icon: <Zap className="w-8 h-8" />,
    colors: ['#E74C3C', '#1A1A1A', '#FFFFFF'],
    features: [
      'Structure bicolore contrastée',
      'Blocs de services hexagonaux',
      'Zones de contact intégrées',
      'Design moderne et agressif',
    ],
    previewGradient: 'linear-gradient(135deg, #E74C3C 0%, #1A1A1A 100%)',
    PreviewComponent: FlyerPreviewImpactBusiness,
    prompt: `Génère un modèle de flyer A4 (210x297mm) avec une structure rigide et contrastée...`,
  },
  {
    id: 'blue-wave-professional',
    name: 'Blue Wave Professional',
    subtitle: 'Courbes & Masques',
    description: 'Design organique et fluide avec masques de formes et courbes élégantes',
    icon: <Waves className="w-8 h-8" />,
    colors: ['#1A237E', '#3949AB', '#FFFFFF'],
    features: [
      'Masques en forme de vague',
      'Dégradés bleus sophistiqués',
      'Formes semi-circulaires',
      'Design moderne et professionnel',
    ],
    previewGradient: 'linear-gradient(135deg, #1A237E 0%, #3949AB 100%)',
    PreviewComponent: FlyerPreviewBlueWave,
    prompt: `Génère un modèle de flyer A4 (210x297mm) utilisant des masques de forme organiques et fluides...`,
  },
  {
    id: 'geometric-tech-solution',
    name: 'Geometric Tech Solution',
    subtitle: 'Angles & QR Code',
    description: 'Style géométrique moderne et technologique avec éléments interactifs',
    icon: <Grid3x3 className="w-8 h-8" />,
    colors: ['#2980B9', '#1A1A1A', '#FFFFFF'],
    features: [
      'Design géométrique moderne',
      'Générateur de QR Code',
      'Grille de services structurée',
      'Formes trapézoïdales',
    ],
    previewGradient: 'linear-gradient(135deg, #2980B9 0%, #1A1A1A 100%)',
    PreviewComponent: FlyerPreviewGeometricTech,
    prompt: `Génère un modèle de flyer A4 (210x297mm) au style géométrique moderne et technologique...`,
  },
];

export default function FlyerGallery() {
  const navigate = useNavigate();
  const { setDocument } = useDesignStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<FlyerTemplate | null>(null);

  const handleCreateFlyer = (template: FlyerTemplate) => {
    setSelectedTemplateForEdit(template);
    setEditorOpen(true);
  };

  const handleSaveFlyerData = (data: FlyerData) => {
    // Réinitialiser le document pour un nouveau flyer A4
    setDocument({
      width: 210,
      height: 297,
      unit: 'mm',
      dpi: 300,
      orientation: 'portrait',
      showBleed: true,
      showSafeZone: true,
      showGrid: false,
    });

    // Rediriger vers le créateur avec les données
    navigate('/services/flyer-creator', {
      state: {
        template: data.templateId,
        prompt: selectedTemplateForEdit?.prompt,
        flyerData: data,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Modèles de Flyers Professionnels
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez parmi nos 3 templates premium et créez votre flyer en quelques minutes.
            Tous les modèles sont entièrement personnalisables et prêts pour l'impression professionnelle.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {FLYER_TEMPLATES.map((template) => {
            const PreviewComp = template.PreviewComponent;
            return (
              <div
                key={template.id}
                className="group cursor-pointer"
                onClick={() => setSelectedTemplate(template.id)}
              >
                {/* Preview Card - Aperçu Réel */}
                <div
                  className={`relative h-96 rounded-2xl shadow-lg overflow-hidden mb-4 transition-all duration-300 bg-gray-100 border-2 ${
                    selectedTemplate === template.id
                      ? 'ring-4 ring-blue-500 shadow-2xl border-blue-500'
                      : 'hover:shadow-2xl hover:scale-105 border-transparent hover:border-gray-300'
                  }`}
                >
                  {/* Actual Preview Component */}
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <PreviewComp />
                  </div>

                  {/* Overlay avec Icon au hover */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
                    <div className="text-white text-6xl">{template.icon}</div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{template.name}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Color Dots */}
                  <div className="flex gap-2 mb-4">
                    {template.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full shadow-sm border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 font-bold">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCreateFlyer(template)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    Créer un Flyer
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Pourquoi choisir nos modèles?
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                title: 'Entièrement Customizable',
                description: 'Tous les éléments sont modifiables: couleurs, textes, images, polices',
                icon: '🎨',
              },
              {
                title: 'Prêt pour Impression',
                description: 'Exportez directement en PDF haute définition 300 DPI avec fond perdu',
                icon: '🖨️',
              },
              {
                title: 'Design Professionnel',
                description: 'Créés par des designers experts avec des tendances actuelles',
                icon: '⭐',
              },
              {
                title: 'Support Complet',
                description: 'Undo/Redo, zooms, guides de sécurité et aperçu en temps réel',
                icon: '🚀',
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Formats Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Formats d'Exportation Supportés
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* PNG Export */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📱</span> PNG - Web & Digital
              </h3>
              <p className="text-gray-600 mb-3">72 DPI optimisé pour l'affichage numérique</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Réseaux sociaux et partage</li>
                <li>✓ Email marketing</li>
                <li>✓ Affichage web</li>
                <li>✓ Taille de fichier réduite</li>
              </ul>
            </div>

            {/* PDF Export */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🖨️</span> PDF - Impression Professionnelle
              </h3>
              <p className="text-gray-600 mb-3">300 DPI haute définition avec fond perdu 3mm</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Impression chez un professionnel</li>
                <li>✓ Qualité d'impression maximale</li>
                <li>✓ Fond perdu inclus</li>
                <li>✓ Prêt pour l'imprimerie</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-100 border-l-4 border-blue-600 rounded">
            <p className="text-gray-800">
              <strong>💡 Conseil:</strong> Testez d'abord en PNG pour voir le résultat final.
              Une fois satisfait, exportez en PDF haute définition (300 DPI) chez un imprimeur professionnel
              pour une qualité optimale d'impression.
            </p>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {selectedTemplateForEdit && (
        <FlyerEditorModal
          isOpen={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setSelectedTemplateForEdit(null);
          }}
          onSave={handleSaveFlyerData}
          templateId={selectedTemplateForEdit.id}
          templateName={selectedTemplateForEdit.name}
        />
      )}
    </div>
  );
}
