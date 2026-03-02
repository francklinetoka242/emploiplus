import { useRef } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { X, Download, FileJson } from 'lucide-react';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

interface ExportModalProps {
  onClose: () => void;
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const { document: doc, objects } = useDesignStore();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Helper to convert dimensions to pixels
  const getPixelDimensions = () => {
    let multiplier = 1;
    switch (doc.unit) {
      case 'mm':
        multiplier = 3.78;
        break;
      case 'cm':
        multiplier = 37.8;
        break;
      case 'inch':
        multiplier = 96;
        break;
      default:
        multiplier = 1;
    }
    return {
      width: doc.width * multiplier,
      height: doc.height * multiplier,
    };
  };

  const dimensions = getPixelDimensions();

  const exportPNG = async (dpi: number = 72) => {
    if (!canvasContainerRef.current) return;

    try {
      const scale = dpi === 300 ? 4 : dpi === 150 ? 2 : 1;
      const canvas = await html2canvas(canvasContainerRef.current, {
        scale,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `flyer-${dpi}dpi-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Erreur lors de l\'export PNG');
    }
  };

  const exportPDF = async () => {
    if (!canvasContainerRef.current) return;

    try {
      const canvas = await html2canvas(canvasContainerRef.current, {
        scale: 4,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Convert dimensions to cm for PDF
      let widthCm = doc.width;
      let heightCm = doc.height;

      if (doc.unit === 'mm') {
        widthCm = doc.width / 10;
        heightCm = doc.height / 10;
      } else if (doc.unit === 'cm') {
        // Already in cm
      } else if (doc.unit === 'inch') {
        widthCm = doc.width * 2.54;
        heightCm = doc.height * 2.54;
      } else {
        // pixels to cm (assuming 96 DPI)
        widthCm = (doc.width / 96) * 2.54;
        heightCm = (doc.height / 96) * 2.54;
      }

      const pdf = new html2pdf();
      pdf.set({
        margin: 0,
        filename: `flyer-print-${Date.now()}.pdf`,
        image: { type: 'png', quality: 0.98 },
        html2canvas: { scale: 4, logging: false },
        jsPDF: {
          orientation: doc.orientation,
          unit: 'cm',
          format: [widthCm, heightCm],
          compress: true,
        },
      });

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, widthCm, heightCm);
      pdf.save();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  const exportJSON = () => {
    const data = {
      document: doc,
      objects,
      timestamp: new Date().toISOString(),
    };

    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    link.download = `flyer-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Exporter le flyer</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-8 p-4 bg-gray-700 rounded-lg overflow-auto max-h-64">
          <div
            ref={canvasContainerRef}
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              backgroundColor: '#ffffff',
              position: 'relative',
            }}
            className="mx-auto bg-white shadow-lg"
          >
            {objects.map((obj) => (
              <div
                key={obj.id}
                style={{
                  position: 'absolute',
                  left: `${obj.x}px`,
                  top: `${obj.y}px`,
                  width: `${obj.width}px`,
                  height: `${obj.height}px`,
                  opacity: obj.opacity,
                  transform: `rotate(${obj.rotation}deg)`,
                }}
              >
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
                    }}
                  >
                    {obj.text}
                  </div>
                )}

                {obj.type === 'rect' && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: obj.fill,
                      border: `${obj.strokeWidth}px solid ${obj.stroke}`,
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
                    }}
                  />
                )}

                {obj.type === 'image' && (
                  <img src={obj.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Format PNG</h3>
            <p className="text-sm text-gray-300 mb-4">Idéal pour le web et le partage sur les réseaux sociaux</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exportPNG(72)}
                className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                PNG (72 DPI)
              </button>
              <button
                onClick={() => exportPNG(300)}
                className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                PNG (300 DPI)
              </button>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Format PDF</h3>
            <p className="text-sm text-gray-300 mb-4">
              Prêt à imprimer avec fond perdu (3mm) et résolution 300 DPI
            </p>
            <button
              onClick={exportPDF}
              className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Télécharger PDF
            </button>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Format JSON</h3>
            <p className="text-sm text-gray-300 mb-4">
              Sauvegardez votre projet pour l'éditer ultérieurement
            </p>
            <button
              onClick={exportJSON}
              className="w-full px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2"
            >
              <FileJson className="w-5 h-5" />
              Télécharger JSON
            </button>
          </div>
        </div>

        {/* Document Info */}
        <div className="mt-8 p-4 bg-gray-700 rounded-lg text-sm text-gray-300">
          <p>
            <strong>Dimensions:</strong> {doc.width} × {doc.height} {doc.unit} ({doc.orientation})
          </p>
          <p>
            <strong>Résolution:</strong> {doc.dpi} DPI
          </p>
          <p>
            <strong>Objets:</strong> {objects.length}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition font-medium"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
