import { useState, useEffect, useRef } from 'react';
import { useDesignStore, TextObject } from '@/stores/designStore';
import DocumentSetup from '@/components/flyer-builder/DocumentSetup';
import LeftSidebar from '@/components/flyer-builder/LeftSidebar';
import Canvas from '@/components/flyer-builder/Canvas';
import TopToolbar from '@/components/flyer-builder/TopToolbar';
import RightSidebar from '@/components/flyer-builder/RightSidebar';
import ExportModal from '@/components/flyer-builder/ExportModal';
import { RotateCcw, FileJson, Menu, X } from 'lucide-react';


export default function FlyerBuilder() {
  const [showDocSetup, setShowDocSetup] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const { undo, redo, pushHistory } = useDesignStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
      // Ctrl/Cmd + S: Save (placeholder)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        alert('Sauvegarde implémentée bientôt');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const resetDocument = () => {
    if (confirm('Êtes-vous sûr? Cela supprimera tous les objets actuels.')) {
      useDesignStore.setState({ objects: [] });
      pushHistory();
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">FB</span>
            </div>
            <h1 className="text-xl font-bold">Flyer Builder Pro</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDocSetup(true)}
            className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm font-medium"
          >
            Document
          </button>
          <button
            onClick={resetDocument}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            title="Réinitialiser le document"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            title="À propos"
          >
            <FileJson className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition font-semibold"
          >
            Exporter
          </button>
        </div>
      </header>

      {/* Main editor area */}
      <div className="flex flex-1 gap-0 overflow-hidden bg-gray-950">
        {/* Left Sidebar - Hidden on mobile, shown on desktop */}
        <div className={`hidden lg:flex flex-col ${showLeftSidebar ? 'w-72' : 'w-0'} transition-all duration-300`}>
          <LeftSidebar />
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col bg-gray-950 min-w-0">
          <TopToolbar onToggleLeft={() => setShowLeftSidebar(!showLeftSidebar)} onToggleRight={() => setShowRightSidebar(!showRightSidebar)} />
          <Canvas />
        </div>

        {/* Right Sidebar - Hidden on mobile, shown on desktop */}
        <div className={`hidden lg:flex flex-col ${showRightSidebar ? 'w-72' : 'w-0'} transition-all duration-300`}>
          <RightSidebar />
        </div>

        {/* Mobile Left Sidebar Overlay */}
        {showLeftSidebar && (
          <>
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowLeftSidebar(false)} />
            <div className="lg:hidden fixed left-0 top-16 bottom-0 w-72 bg-gray-800 border-r border-gray-700 z-50 overflow-y-auto">
              <button
                onClick={() => setShowLeftSidebar(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="pt-12">
                <LeftSidebar />
              </div>
            </div>
          </>
        )}

        {/* Mobile Right Sidebar Overlay */}
        {showRightSidebar && (
          <>
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowRightSidebar(false)} />
            <div className="lg:hidden fixed right-0 top-16 bottom-0 w-72 bg-gray-800 border-l border-gray-700 z-50 overflow-y-auto">
              <button
                onClick={() => setShowRightSidebar(false)}
                className="absolute top-4 left-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="pt-12">
                <RightSidebar />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showDocSetup && <DocumentSetup onClose={() => setShowDocSetup(false)} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}

      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">À propos de Flyer Builder Pro</h2>
            <p className="text-gray-300 mb-4">
              Un éditeur de flyers professionnel avec support complet du drag & drop, de l'undo/redo et
              de l'exportation multi-format.
            </p>
            <div className="text-sm text-gray-400 mb-4">
              <p>• Zustand pour l'état</p>
              <p>• Tailwind CSS pour le design</p>
              <p>• html2canvas et html2pdf pour l'export</p>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
