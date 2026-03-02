import { useState } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { X, Copy } from 'lucide-react';

const PRESETS = [
  { name: 'A4', width: 210, height: 297, unit: 'mm', category: 'print' },
  { name: 'A5', width: 148, height: 210, unit: 'mm', category: 'print' },
  { name: 'A6', width: 105, height: 148, unit: 'mm', category: 'print' },
  { name: 'DL', width: 99, height: 210, unit: 'mm', category: 'print' },
  { name: 'Square', width: 1080, height: 1080, unit: 'px', category: 'social' },
  { name: 'Story', width: 1080, height: 1920, unit: 'px', category: 'social' },
  { name: 'LinkedIn Banner', width: 1584, height: 396, unit: 'px', category: 'social' },
];

interface DocumentSetupProps {
  onClose: () => void;
}

export default function DocumentSetup({ onClose }: DocumentSetupProps) {
  const { document: doc, setDocument } = useDesignStore();
  const [customWidth, setCustomWidth] = useState(doc.width);
  const [customHeight, setCustomHeight] = useState(doc.height);
  const [unit, setUnit] = useState<'px' | 'mm' | 'cm' | 'inch'>(doc.unit);

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setDocument({
      width: preset.width,
      height: preset.height,
      unit: preset.unit as 'px' | 'mm' | 'cm' | 'inch',
      orientation: preset.height > preset.width ? 'portrait' : 'landscape',
    });
  };

  const handleCustom = () => {
    setDocument({
      width: customWidth,
      height: customHeight,
      unit: unit,
    });
  };

  const toggleOrientation = () => {
    setDocument({
      orientation: doc.orientation === 'portrait' ? 'landscape' : 'portrait',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Configuration du document</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Presets d'impression</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {PRESETS.filter(p => p.category === 'print').map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                className="p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition border border-gray-600 text-left"
              >
                <div className="font-semibold">{preset.name}</div>
                <div className="text-sm text-gray-400">
                  {preset.width} × {preset.height} {preset.unit}
                </div>
              </button>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-4">Presets réseaux sociaux</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PRESETS.filter(p => p.category === 'social').map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                className="p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition border border-gray-600 text-left"
              >
                <div className="font-semibold">{preset.name}</div>
                <div className="text-sm text-gray-400">
                  {preset.width} × {preset.height} {preset.unit}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom dimensions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Dimensions personnalisées</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Largeur</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hauteur</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Unité</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'px' | 'mm' | 'cm' | 'inch')}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              >
                <option value="px">Pixels (px)</option>
                <option value="mm">Millimètres (mm)</option>
                <option value="cm">Centimètres (cm)</option>
                <option value="inch">Pouces (inch)</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCustom}
            className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-medium"
          >
            Appliquer les dimensions
          </button>
        </div>

        {/* Orientation */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Orientation</h3>
          <div className="flex gap-4">
            <button
              onClick={toggleOrientation}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition border border-gray-600"
            >
              <div className="font-semibold mb-1">
                {doc.orientation === 'portrait' ? 'Portrait (actuel)' : 'Landscape'}
              </div>
              <div className="text-sm text-gray-400">{doc.width} × {doc.height} {doc.unit}</div>
            </button>
            <button
              onClick={toggleOrientation}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition border border-gray-600"
            >
              <div className="font-semibold mb-1">
                {doc.orientation === 'landscape' ? 'Landscape (actuel)' : 'Portrait'}
              </div>
              <div className="text-sm text-gray-400">{doc.height} × {doc.width} {doc.unit}</div>
            </button>
          </div>
        </div>

        {/* DPI */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Résolution (DPI)</h3>
          <div className="grid grid-cols-3 gap-3">
            {[72, 150, 300].map((dpi) => (
              <button
                key={dpi}
                onClick={() => setDocument({ dpi: dpi as 72 | 150 | 300 })}
                className={`px-4 py-3 rounded-lg border transition font-medium ${
                  doc.dpi === dpi
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                }`}
              >
                {dpi} DPI
                {dpi === 72 && <div className="text-xs text-gray-300">Web</div>}
                {dpi === 300 && <div className="text-xs text-gray-300">Impression</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Safety options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Affichage</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition cursor-pointer">
              <input
                type="checkbox"
                checked={doc.showBleed}
                onChange={(e) => setDocument({ showBleed: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Afficher le fond perdu (3mm)</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition cursor-pointer">
              <input
                type="checkbox"
                checked={doc.showSafeZone}
                onChange={(e) => setDocument({ showSafeZone: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Afficher la zone de sécurité (5mm)</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition cursor-pointer">
              <input
                type="checkbox"
                checked={doc.showGrid}
                onChange={(e) => setDocument({ showGrid: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Afficher la grille</span>
            </label>
          </div>
        </div>

        {/* Current state */}
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <div className="text-sm text-gray-300">
            <p>
              <strong>Document actuel:</strong> {doc.width} × {doc.height} {doc.unit} ({doc.orientation})
            </p>
            <p>
              <strong>Résolution:</strong> {doc.dpi} DPI
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition font-semibold"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
