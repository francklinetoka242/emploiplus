import { useState } from 'react';
import { useDesignStore, TextObject, ShapeObject, ImageObject } from '@/stores/designStore';
import { Plus, Type, Square, Circle, Triangle, Image, Upload } from 'lucide-react';

const TEMPLATES = [
  { id: 'event', name: 'Événement', icon: '🎉', color: 'from-purple-500 to-pink-500' },
  { id: 'promo', name: 'Promotion', icon: '🔥', color: 'from-red-500 to-orange-500' },
  { id: 'workshop', name: 'Workshop', icon: '👨‍🏫', color: 'from-blue-500 to-cyan-500' },
  { id: 'sale', name: 'Solde', icon: '🛍️', color: 'from-green-500 to-emerald-500' },
];

const FONTS = [
  { name: 'Inter', family: 'Inter' },
  { name: 'Montserrat', family: 'Montserrat' },
  { name: 'Georgia', family: 'Georgia' },
  { name: 'Playfair', family: 'Playfair Display' },
];

const SHAPES = [
  { id: 'rect', name: 'Rectangle', icon: Square },
  { id: 'circle', name: 'Cercle', icon: Circle },
  { id: 'triangle', name: 'Triangle', icon: Triangle },
];

const ICONS = [
  '⭐', '❤️', '✓', '✨', '🎯', '📱', '💼', '🔔', '🎁', '🚀', '⚡', '🌟',
];

export default function LeftSidebar() {
  const { addObject, pushHistory } = useDesignStore();
  const [activeTab, setActiveTab] = useState('templates');

  const addText = (preset: 'title' | 'subtitle' | 'body') => {
    const sizes = { title: 48, subtitle: 32, body: 16 };
    const texts = { title: 'Titre', subtitle: 'Sous-titre', body: 'Texte du corps' };

    const textObj: TextObject = {
      id: Math.random().toString(36),
      type: 'text',
      text: texts[preset],
      x: 50,
      y: 50 + (preset === 'subtitle' ? 60 : preset === 'body' ? 120 : 0),
      width: 300,
      height: sizes[preset] * 1.5,
      fontSize: sizes[preset],
      fontFamily: 'Inter',
      fontWeight: 'normal',
      color: '#ffffff',
      align: 'left',
      rotation: 0,
      opacity: 1,
    };
    addObject(textObj);
    pushHistory();
  };

  const addShape = (shapeType: 'rect' | 'circle' | 'triangle') => {
    const shape: ShapeObject = {
      id: Math.random().toString(36),
      type: shapeType,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      fill: '#3b82f6',
      stroke: '#ffffff',
      strokeWidth: 2,
      rotation: 0,
      opacity: 1,
    };
    addObject(shape);
    pushHistory();
  };

  const addIcon = (icon: string) => {
    const textObj: TextObject = {
      id: Math.random().toString(36),
      type: 'text',
      text: icon,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fontSize: 64,
      fontFamily: 'Inter',
      fontWeight: 'normal',
      color: '#ffffff',
      align: 'center',
      rotation: 0,
      opacity: 1,
    };
    addObject(textObj);
    pushHistory();
  };

  return (
    <div className="w-full h-full bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-bold text-white">Éléments</h2>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Tab Navigation */}
        <div className="flex gap-0 border-b border-gray-700 flex-shrink-0">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-gray-700 border-b-2 border-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Modèles
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'elements'
                ? 'bg-gray-700 border-b-2 border-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Éléments
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'templates' && (
            <div className="space-y-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  className={`w-full p-4 rounded-lg bg-gradient-to-r ${template.color} hover:opacity-80 transition font-medium text-white text-left`}
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  {template.name}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'elements' && (
            <div className="space-y-6">
              {/* Text Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 flex-shrink-0" /> Texte
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => addText('title')}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm font-medium text-left text-white"
                  >
                    + Titre
                  </button>
                  <button
                    onClick={() => addText('subtitle')}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm font-medium text-left text-white"
                  >
                    + Sous-titre
                  </button>
                  <button
                    onClick={() => addText('body')}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm font-medium text-left text-white"
                  >
                    + Texte du corps
                  </button>
                </div>
              </div>

              {/* Shapes Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Square className="w-4 h-4 flex-shrink-0" /> Formes
                </h3>
                <div className="space-y-2">
                  {SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => addShape(shape.id as 'rect' | 'circle' | 'triangle')}
                      className="w-full px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm font-medium text-left text-white flex items-center gap-2"
                    >
                      <shape.icon className="w-4 h-4 flex-shrink-0" />
                      + {shape.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icons Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-300 mb-3">Icônes</h3>
                <div className="grid grid-cols-4 gap-2">
                  {ICONS.map((icon, idx) => (
                    <button
                      key={idx}
                      onClick={() => addIcon(icon)}
                      className="w-full aspect-square rounded-lg bg-gray-700 hover:bg-gray-600 transition text-lg flex items-center justify-center"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Image className="w-4 h-4 flex-shrink-0" /> Images
                </h3>
                <label className="w-full px-3 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm font-medium text-center cursor-pointer flex items-center justify-center gap-2 text-white">
                  <Upload className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Importer</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const src = evt.target?.result as string;
                          const imgObj: ImageObject = {
                            id: Math.random().toString(36),
                            type: 'image',
                            src,
                            x: 100,
                            y: 100,
                            width: 300,
                            height: 300,
                            rotation: 0,
                            opacity: 1,
                            scaleX: 1,
                            scaleY: 1,
                          };
                          addObject(imgObj);
                          pushHistory();
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
