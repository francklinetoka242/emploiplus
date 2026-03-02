import { useDesignStore } from '@/stores/designStore';
import { ZoomIn, ZoomOut, Undo2, Redo2, Copy, Trash2, AlignLeft, AlignCenter, AlignRight, PanelLeft, PanelRight } from 'lucide-react';

interface TopToolbarProps {
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

export default function TopToolbar({ onToggleLeft, onToggleRight }: TopToolbarProps) {
  const { zoom, setZoom, selectedId, deleteObject, undo, redo, objects } = useDesignStore();

  const selectedObj = objects.find((o) => o.id === selectedId);

  const handleZoom = (newZoom: number) => {
    setZoom(newZoom);
  };

  return (
    <div className="h-14 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between gap-4 overflow-x-auto">
      {/* Left section - Zoom */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => handleZoom(zoom - 10)}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition hidden sm:flex"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <select
          value={zoom}
          onChange={(e) => handleZoom(Number(e.target.value))}
          className="px-3 py-1 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm font-medium"
        >
          {[50, 75, 100, 125, 150, 200, 300, 400].map((z) => (
            <option key={z} value={z}>
              {z}%
            </option>
          ))}
        </select>
        <button
          onClick={() => handleZoom(zoom + 10)}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition hidden sm:flex"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Center section - Undo/Redo */}
      <div className="flex items-center gap-2 border-l border-r border-gray-700 px-4 flex-shrink-0">
        <button
          onClick={undo}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={redo}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section - Object tools + Toggle Sidebars */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {selectedObj && (
          <>
            {selectedObj.type === 'text' && (
              <div className="flex items-center gap-2 border-l border-gray-700 pl-4 hidden sm:flex">
                <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                  <AlignLeft className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                  <AlignCenter className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                  <AlignRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                // Implement duplicate
              }}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
              title="Duplicate"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={() => deleteObject(selectedId!)}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Sidebar Toggle Buttons - Mobile Only */}
        <button
          onClick={onToggleLeft}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition lg:hidden"
          title="Éléments"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleRight}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition lg:hidden"
          title="Propriétés"
        >
          <PanelRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
