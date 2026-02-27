import { useDesignStore } from '@/stores/designStore';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';

export default function RightSidebar() {
  const { objects, selectedId, updateObject } = useDesignStore();

  const selectedObj = objects.find((o) => o.id === selectedId);

  if (!selectedObj) {
    return (
      <div className="w-72 bg-gray-800 border-l border-gray-700 p-6 flex items-center justify-center">
        <p className="text-gray-400 text-center">Sélectionnez un objet pour éditer ses propriétés</p>
      </div>
    );
  }

  return (
    <div className="w-72 bg-gray-800 border-l border-gray-700 overflow-y-auto p-6">
      <h2 className="text-lg font-bold mb-6">Propriétés</h2>

      {/* Text Properties */}
      {selectedObj.type === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Contenu</label>
            <textarea
              value={selectedObj.text}
              onChange={(e) => updateObject(selectedObj.id, { text: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Police</label>
            <select
              value={selectedObj.fontFamily}
              onChange={(e) => updateObject(selectedObj.id, { fontFamily: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
            >
              <option>Inter</option>
              <option>Montserrat</option>
              <option>Georgia</option>
              <option>Playfair Display</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Taille</label>
              <input
                type="number"
                value={selectedObj.fontSize}
                onChange={(e) => updateObject(selectedObj.id, { fontSize: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Poids</label>
              <select
                value={selectedObj.fontWeight}
                onChange={(e) => updateObject(selectedObj.id, { fontWeight: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Gras</option>
                <option value="italic">Italic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Couleur</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedObj.color}
                onChange={(e) => updateObject(selectedObj.id, { color: e.target.value })}
                className="w-12 h-10 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={selectedObj.color}
                onChange={(e) => updateObject(selectedObj.id, { color: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Alignement</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateObject(selectedObj.id, { align: 'left' })}
                className={`px-2 py-2 rounded-lg transition text-sm font-medium ${
                  selectedObj.align === 'left'
                    ? 'bg-purple-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                ⬅
              </button>
              <button
                onClick={() => updateObject(selectedObj.id, { align: 'center' })}
                className={`px-2 py-2 rounded-lg transition text-sm font-medium ${
                  selectedObj.align === 'center'
                    ? 'bg-purple-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                ⬆️
              </button>
              <button
                onClick={() => updateObject(selectedObj.id, { align: 'right' })}
                className={`px-2 py-2 rounded-lg transition text-sm font-medium ${
                  selectedObj.align === 'right'
                    ? 'bg-purple-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                ➡️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shape Properties */}
      {(selectedObj.type === 'rect' || selectedObj.type === 'circle' || selectedObj.type === 'triangle') && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Remplissage</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedObj.fill}
                onChange={(e) => updateObject(selectedObj.id, { fill: e.target.value })}
                className="w-12 h-10 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={selectedObj.fill}
                onChange={(e) => updateObject(selectedObj.id, { fill: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bordure</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedObj.stroke}
                onChange={(e) => updateObject(selectedObj.id, { stroke: e.target.value })}
                className="w-12 h-10 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                value={selectedObj.strokeWidth}
                onChange={(e) => updateObject(selectedObj.id, { strokeWidth: Number(e.target.value) })}
                placeholder="Épaisseur"
                className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Common Properties */}
      <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
        <h3 className="font-semibold text-sm">Transformations</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">X</label>
            <input
              type="number"
              value={selectedObj.x}
              onChange={(e) => updateObject(selectedObj.id, { x: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Y</label>
            <input
              type="number"
              value={selectedObj.y}
              onChange={(e) => updateObject(selectedObj.id, { y: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">Largeur</label>
            <input
              type="number"
              value={selectedObj.width}
              onChange={(e) => updateObject(selectedObj.id, { width: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hauteur</label>
            <input
              type="number"
              value={selectedObj.height}
              onChange={(e) => updateObject(selectedObj.id, { height: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rotation</label>
          <input
            type="range"
            min="0"
            max="360"
            value={selectedObj.rotation}
            onChange={(e) => updateObject(selectedObj.id, { rotation: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">{selectedObj.rotation}°</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Opacité</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedObj.opacity}
            onChange={(e) => updateObject(selectedObj.id, { opacity: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">{Math.round(selectedObj.opacity * 100)}%</div>
        </div>
      </div>
    </div>
  );
}
