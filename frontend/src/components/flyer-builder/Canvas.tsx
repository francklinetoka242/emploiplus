import { useRef, useEffect, useState } from 'react';
import { useDesignStore } from '@/stores/designStore';

export default function Canvas() {
  const {
    document: doc,
    objects,
    selectedId,
    setSelectedId,
    updateObject,
    zoom,
    panX,
    panY,
    pushHistory,
  } = useDesignStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Convert dimensions based on unit
  const getPixelDimensions = () => {
    let multiplier = 1;
    switch (doc.unit) {
      case 'mm':
        multiplier = 3.78; // 1mm = 3.78px at 96 DPI
        break;
      case 'cm':
        multiplier = 37.8;
        break;
      case 'inch':
        multiplier = 96;
        break;
      default: // px
        multiplier = 1;
    }
    return {
      width: doc.width * multiplier,
      height: doc.height * multiplier,
    };
  };

  const dimensions = getPixelDimensions();

  return (
    <div className="flex-1 bg-gray-950 overflow-auto flex items-center justify-center p-8">
      {/* Canvas container with guides */}
      <div
        ref={canvasRef}
        className="relative bg-white shadow-2xl"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Bleed Zone (3mm) - Red transparent */}
        {doc.showBleed && (
          <div
            className="absolute inset-0 border-2 border-red-500 opacity-30 pointer-events-none"
            style={{
              margin: `${11.34}px`, // 3mm = 11.34px
            }}
          />
        )}

        {/* Safe Zone (5mm) - Gray transparent */}
        {doc.showSafeZone && (
          <div
            className="absolute inset-0 border-2 border-gray-400 opacity-20 pointer-events-none"
            style={{
              margin: `${18.9}px`, // 5mm = 18.9px
            }}
          />
        )}

        {/* Grid */}
        {doc.showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(255, 0, 0, 0.05) 25%, rgba(255, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 0, 0.05) 75%, rgba(255, 0, 0, 0.05) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(255, 0, 0, 0.05) 25%, rgba(255, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 0, 0.05) 75%, rgba(255, 0, 0, 0.05) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        )}

        {/* Objects */}
        {objects.map((obj) => (
          <div
            key={obj.id}
            onClick={() => setSelectedId(obj.id)}
            className={`absolute cursor-move select-none transition-all ${
              selectedId === obj.id ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-400'
            }`}
            style={{
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.width}px`,
              height: `${obj.height}px`,
              opacity: obj.opacity,
              transform: `rotate(${obj.rotation}deg)`,
            }}
            draggable
            onDragStart={(e) => {
              setDraggedObjectId(obj.id);
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                setDragOffset({
                  x: e.clientX - rect.left - obj.x,
                  y: e.clientY - rect.top - obj.y,
                });
              }
              e.dataTransfer!.effectAllowed = 'move';
              e.dataTransfer!.setData('objectId', obj.id);
            }}
            onDragEnd={() => {
              setDraggedObjectId(null);
              pushHistory();
            }}
          >
            {/* Text Object */}
            {obj.type === 'text' && (
              <div
                style={{
                  fontSize: `${obj.fontSize}px`,
                  fontFamily: obj.fontFamily,
                  fontWeight: obj.fontWeight === 'bold' ? 'bold' : obj.fontWeight === 'italic' ? 'italic' : 'normal',
                  color: obj.color,
                  textAlign: obj.align,
                  width: '100%',
                  height: '100%',
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                }}
              >
                {obj.text}
              </div>
            )}

            {/* Shape Object */}
            {obj.type === 'rect' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: obj.fill,
                  border: `${obj.strokeWidth}px solid ${obj.stroke}`,
                  pointerEvents: 'none',
                }}
              />
            )}

            {obj.type === 'circle' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: obj.fill,
                  border: `${obj.strokeWidth}px solid ${obj.stroke}`,
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />
            )}

            {obj.type === 'triangle' && (
              <div
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: `${obj.width / 2}px solid transparent`,
                  borderRight: `${obj.width / 2}px solid transparent`,
                  borderBottom: `${obj.height}px solid ${obj.fill}`,
                  position: 'relative',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Image Object */}
            {obj.type === 'image' && (
              <img
                src={obj.src}
                alt="canvas-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        ))}

        {/* Canvas drop zone - MUST handle drag events */}
        <div
          className="absolute inset-0"
          style={{ pointerEvents: draggedObjectId ? 'auto' : 'none' }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(e) => {
            e.preventDefault();
            const objectId = e.dataTransfer.getData('objectId') || draggedObjectId;
            
            if (objectId && canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect();
              const newX = Math.max(0, (e.clientX - rect.left) / (zoom / 100) - dragOffset.x);
              const newY = Math.max(0, (e.clientY - rect.top) / (zoom / 100) - dragOffset.y);
              
              updateObject(objectId, { x: newX, y: newY });
            }
          }}
        />
      </div>

      {/* Zoom label */}
      <div className="fixed bottom-4 right-4 bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium text-gray-300">
        {zoom}%
      </div>
    </div>
  );
}
