import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import BusinessCardModelBlackOrange from './business-card-templates/BusinessCardModelBlackOrange';
import BusinessCardModelOrangeDynamic from './business-card-templates/BusinessCardModelOrangeDynamic';
import BusinessCardModelTechTurquoise from './business-card-templates/BusinessCardModelTechTurquoise';
import BusinessCardModelGeometricYellow from './business-card-templates/BusinessCardModelGeometricYellow';
import BusinessCardModelBlackWhiteClassic from './business-card-templates/BusinessCardModelBlackWhiteClassic';
import BusinessCardModelWaveNightBlue from './business-card-templates/BusinessCardModelWaveNightBlue';
import BusinessCardModelInstitutionalGrey from './business-card-templates/BusinessCardModelInstitutionalGrey';
import BusinessCardModelTurquoiseOrangeDynamic from './business-card-templates/BusinessCardModelTurquoiseOrangeDynamic';
import BusinessCardModelYellowTriangle from './business-card-templates/BusinessCardModelYellowTriangle';
import BusinessCardModelTechStartupBicolor from './business-card-templates/BusinessCardModelTechStartupBicolor';
import BusinessCardModelCurvedWaveNightBlue from './business-card-templates/BusinessCardModelCurvedWaveNightBlue';
import BusinessCardModelProfessionalSeparationLine from './business-card-templates/BusinessCardModelProfessionalSeparationLine';
import BusinessCardModelAnthraciteWhiteDivided from './business-card-templates/BusinessCardModelAnthraciteWhiteDivided';
import BusinessCardModelOrangeVibrantUrban from './business-card-templates/BusinessCardModelOrangeVibrantUrban';
import BusinessCardModelPinkPastelStudent from './business-card-templates/BusinessCardModelPinkPastelStudent';
import BusinessCardModelNavyWhiteProfessional from './business-card-templates/BusinessCardModelNavyWhiteProfessional';
import BusinessCardModelHighEndMinimalist from './business-card-templates/BusinessCardModelHighEndMinimalist';
import BusinessCardModelNavyGeometricIcon from './business-card-templates/BusinessCardModelNavyGeometricIcon';
import BusinessCardModelTurquoiseOrangeAccent from './business-card-templates/BusinessCardModelTurquoiseOrangeAccent';
import BusinessCardModelYellowWhiteUShape from './business-card-templates/BusinessCardModelYellowWhiteUShape';
import BusinessCardModelNavyCopperWave from './business-card-templates/BusinessCardModelNavyCopperWave';
import BusinessCardModelPearlSeparationLine from './business-card-templates/BusinessCardModelPearlSeparationLine';
import BusinessCardModelAnthraciteVerticalDivide from './business-card-templates/BusinessCardModelAnthraciteVerticalDivide';
import BusinessCardModelOrangeBlackDynamic from './business-card-templates/BusinessCardModelOrangeBlackDynamic';
import BusinessCardModelBeigeHighEnd from './business-card-templates/BusinessCardModelBeigeHighEnd';
import BusinessCardModelNavyWhiteBicolor from './business-card-templates/BusinessCardModelNavyWhiteBicolor';

export interface BusinessCardData {
  id?: string;
  candidateName: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  template: string;
  createdAt?: string;
}

interface BusinessCardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: BusinessCardData) => void;
  initialData?: BusinessCardData;
  templateId: string;
}

const TEMPLATES = {
  'black-orange': {
    name: 'Black & Orange',
    component: BusinessCardModelBlackOrange,
  },
  'orange-dynamic': {
    name: 'Orange Dynamic',
    component: BusinessCardModelOrangeDynamic,
  },
  'tech-turquoise': {
    name: 'Tech Turquoise',
    component: BusinessCardModelTechTurquoise,
  },
  'geometric-yellow': {
    name: 'Geometric Yellow',
    component: BusinessCardModelGeometricYellow,
  },
  'black-white-classic': {
    name: 'Black & White Classic',
    component: BusinessCardModelBlackWhiteClassic,
  },
  'wave-night-blue': {
    name: 'Wave Night Blue',
    component: BusinessCardModelWaveNightBlue,
  },
  'institutional-grey': {
    name: 'Institutional Grey',
    component: BusinessCardModelInstitutionalGrey,
  },
  'turquoise-orange-dynamic': {
    name: 'Turquoise & Orange Dynamic',
    component: BusinessCardModelTurquoiseOrangeDynamic,
  },
  'yellow-triangle': {
    name: 'Yellow Triangle',
    component: BusinessCardModelYellowTriangle,
  },
  'tech-startup-bicolor': {
    name: 'Tech Startup Bicolor',
    component: BusinessCardModelTechStartupBicolor,
  },
  'curved-wave-night-blue': {
    name: 'Curved Wave Night Blue',
    component: BusinessCardModelCurvedWaveNightBlue,
  },
  'professional-separation-line': {
    name: 'Professional Separation Line',
    component: BusinessCardModelProfessionalSeparationLine,
  },
  'anthracite-white-divided': {
    name: 'Anthracite & White Divided',
    component: BusinessCardModelAnthraciteWhiteDivided,
  },
  'orange-vibrant-urban': {
    name: 'Orange Vibrant Urban',
    component: BusinessCardModelOrangeVibrantUrban,
  },
  'pink-pastel-student': {
    name: 'Pink Pastel Student',
    component: BusinessCardModelPinkPastelStudent,
  },
  'navy-white-professional': {
    name: 'Navy & White Professional',
    component: BusinessCardModelNavyWhiteProfessional,
  },
  'high-end-minimalist': {
    name: 'High-End Minimalist',
    component: BusinessCardModelHighEndMinimalist,
  },
  'navy-geometric-icon': {
    name: 'Navy Geometric Icon',
    component: BusinessCardModelNavyGeometricIcon,
  },
  'turquoise-orange-accent': {
    name: 'Turquoise & Orange Accent',
    component: BusinessCardModelTurquoiseOrangeAccent,
  },
  'yellow-white-u-shape': {
    name: 'Yellow White U-Shape',
    component: BusinessCardModelYellowWhiteUShape,
  },
  'navy-copper-wave': {
    name: 'Navy Copper Wave',
    component: BusinessCardModelNavyCopperWave,
  },
  'pearl-separation-line': {
    name: 'Pearl Separation Line',
    component: BusinessCardModelPearlSeparationLine,
  },
  'anthracite-vertical-divide': {
    name: 'Anthracite Vertical Divide',
    component: BusinessCardModelAnthraciteVerticalDivide,
  },
  'orange-black-dynamic': {
    name: 'Orange Black Dynamic',
    component: BusinessCardModelOrangeBlackDynamic,
  },
  'beige-high-end': {
    name: 'Beige High-End',
    component: BusinessCardModelBeigeHighEnd,
  },
  'navy-white-bicolor': {
    name: 'Navy White Bicolor',
    component: BusinessCardModelNavyWhiteBicolor,
  },
};

const BusinessCardEditorModal: React.FC<BusinessCardEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  templateId,
}) => {
  const [formData, setFormData] = useState<BusinessCardData>(
    initialData || {
      candidateName: '',
      position: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      template: templateId,
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof BusinessCardData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.candidateName.trim()) {
      alert('Le nom du candidat est requis');
      return;
    }
    onSave({
      ...formData,
      template: templateId,
    });
  };

  const handleExportPDF = () => {
    const element = document.querySelector('.business-card-preview') as HTMLElement;
    if (!element) return;

    const html2pdf = require('html2pdf.js');
    const options = {
      margin: 5,
      filename: `${formData.candidateName}-business-card.pdf`,
      image: { type: 'image/png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: [215, 110] },
    };

    html2pdf().set(options).from(element).save();
  };

  if (!isOpen) return null;

  const TemplateComponent = TEMPLATES[templateId as keyof typeof TEMPLATES]?.component;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Éditer Carte de Visite</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nom du Candidat *</label>
              <input
                type="text"
                value={formData.candidateName}
                onChange={e => handleChange('candidateName', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Position / Titre</label>
              <input
                type="text"
                value={formData.position}
                onChange={e => handleChange('position', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Développeur Full Stack"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jean@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Localisation</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paris, France"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Site Web (optionnel)</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={e => handleChange('website', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="www.example.com"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Enregistrer
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Export PDF
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded-lg transition"
              >
                Fermer
              </button>
            </div>
          </div>

          {/* Aperçu */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Aperçu</h3>
            <div className="business-card-preview bg-gray-50 p-4 rounded-lg flex-1 overflow-y-auto">
              {TemplateComponent ? (
                <TemplateComponent data={formData} />
              ) : (
                <div className="text-center text-gray-500 py-8">Modèle non disponible</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardEditorModal;
