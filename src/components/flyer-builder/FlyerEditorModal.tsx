import { useState } from 'react';
import { X } from 'lucide-react';

export interface FlyerData {
  id?: string;
  templateId: string;
  businessName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  services: string[];
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface FlyerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FlyerData) => void;
  templateId: string;
  templateName: string;
  initialData?: FlyerData;
}

export function FlyerEditorModal({
  isOpen,
  onClose,
  onSave,
  templateId,
  templateName,
  initialData,
}: FlyerEditorModalProps) {
  const [formData, setFormData] = useState<FlyerData>(
    initialData || {
      templateId,
      businessName: '',
      tagline: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      description: '',
      services: ['', '', ''],
    }
  );

  const handleChange = (field: keyof FlyerData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData((prev) => ({
      ...prev,
      services: newServices,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      alert('Veuillez entrer le nom de votre entreprise');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-white">
          <h2 className="text-2xl font-bold">Personnaliser: {templateName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section: Informations Entreprise */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Informations de votre entreprise
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Tech Solutions"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slogan/Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Innovation & Excellence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="contact@entreprise.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="123 Rue de la Paix, 75000 Paris"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="www.entreprise.com"
                />
              </div>
            </div>
          </div>

          {/* Section: Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte descriptif
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="Décrivez votre entreprise, vos services et votre proposition de valeur..."
            />
          </div>

          {/* Section: Services */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Services/Produits (3)</h3>
            <div className="space-y-3">
              {formData.services.map((service, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service {idx + 1}
                  </label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => handleServiceChange(idx, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={`Ex: Service ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Créer le Flyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
