import React, { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageEditorProps {
  imageUrl: string;
  onImageUpdate: (imagUrl: string) => void;
  onClose: () => void;
  shape?: "circle" | "square" | "rectangle";
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl,
  onImageUpdate,
  onClose,
  shape = "circle",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerSize = 300;

  // Charger l'image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = imageUrl;
      }
      // Centrer l'image au chargement
      const scale = containerSize / Math.max(img.width, img.height);
      setZoom(scale);
      setPosX(0);
      setPosY(0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Gérer le zoom avec la molette
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(prev + delta, 3)));
  };

  // Gérer le pan (drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - posX, y: e.clientY - posY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosX(e.clientX - dragStart.x);
    setPosY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - posX, y: touch.clientY - posY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosX(touch.clientX - dragStart.x);
    setPosY(touch.clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Exporter l'image
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = containerSize;
    canvas.height = containerSize;

    // Fond blanc
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, containerSize, containerSize);

    // Dessiner l'image transformée
    ctx.save();
    ctx.translate(containerSize / 2, containerSize / 2);

    if (shape === "circle") {
      // Créer un masque circulaire
      ctx.beginPath();
      ctx.arc(0, 0, containerSize / 2, 0, Math.PI * 2);
      ctx.clip();
    } else if (shape === "square") {
      ctx.fillRect(-containerSize / 2, -containerSize / 2, containerSize, containerSize);
    }

    ctx.drawImage(
      imageRef.current,
      posX - (imageRef.current.width * zoom) / 2,
      posY - (imageRef.current.height * zoom) / 2,
      imageRef.current.width * zoom,
      imageRef.current.height * zoom
    );

    ctx.restore();

    // Convertir en data URL
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    onImageUpdate(dataUrl);
  };

  const handleReset = () => {
    if (imageRef.current) {
      const scale = containerSize / Math.max(imageRef.current.width, imageRef.current.height);
      setZoom(scale);
      setPosX(0);
      setPosY(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
        <h2 className="text-2xl font-bold">Éditer la photo</h2>

        {/* Canvas de prévisualisation */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative mx-auto cursor-move overflow-hidden ${
            shape === "circle" ? "rounded-full" : "rounded-lg"
          } bg-gray-100 border-2 border-dashed border-gray-300 select-none`}
          style={{
            width: `${containerSize}px`,
            height: `${containerSize}px`,
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Preview"
            className="absolute pointer-events-none"
            style={{
              left: `${containerSize / 2 + posX}px`,
              top: `${containerSize / 2 + posY}px`,
              transform: `translate(-50%, -50%) scale(${zoom})`,
              maxWidth: "none",
            }}
            onLoad={(e) => {
              // Redimensionner l'image pour qu'elle rentre dans le conteneur
              const img = e.currentTarget;
              const scale = containerSize / Math.max(img.width, img.height) * 1.2;
              setZoom(scale);
            }}
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
          <p>💡 <strong>Contrôles:</strong></p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• <strong>Déplacer:</strong> Glissez l'image avec la souris</li>
            <li>• <strong>Zoom:</strong> Utilisez la molette ou les boutons</li>
            <li>• <strong>Réinitialiser:</strong> Cliquez sur le bouton réinitialiser</li>
          </ul>
        </div>

        {/* Contrôles de zoom */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.2))}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ZoomOut className="w-4 h-4" />
            Dézoomer
          </Button>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-sm text-gray-600 min-w-12">
              {Math.round(zoom * 100)}%
            </span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <Button
            onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ZoomIn className="w-4 h-4" />
            Zoomer
          </Button>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleReset}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </Button>
          <Button onClick={onClose} variant="outline">
            Annuler
          </Button>
          <Button onClick={handleExport} className="gap-2">
            ✓ Appliquer
          </Button>
        </div>
      </div>

      {/* Canvas caché pour l'export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageEditor;
