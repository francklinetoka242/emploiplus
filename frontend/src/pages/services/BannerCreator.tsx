import { useRef, useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import html2canvas from "html2canvas";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Download, Eye, Palette, Type, Image as ImageIcon, Maximize2,
  FileText, Plus, Trash2, Copy, Lock, LockOpen, Layers
} from "lucide-react";

// Icônes prédéfinies (lucide-react)
import {
  Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Github,
  Globe, Briefcase, Award, Target, TrendingUp, Users
} from "lucide-react";

const PREDEFINED_ICONS = [
  { name: "Email", icon: Mail, key: "mail" },
  { name: "Téléphone", icon: Phone, key: "phone" },
  { name: "Localisation", icon: MapPin, key: "location" },
  { name: "LinkedIn", icon: Linkedin, key: "linkedin" },
  { name: "Twitter", icon: Twitter, key: "twitter" },
  { name: "Facebook", icon: Facebook, key: "facebook" },
  { name: "GitHub", icon: Github, key: "github" },
  { name: "Website", icon: Globe, key: "globe" },
  { name: "Briefcase", icon: Briefcase, key: "briefcase" },
  { name: "Award", icon: Award, key: "award" },
  { name: "Target", icon: Target, key: "target" },
  { name: "Trending", icon: TrendingUp, key: "trending" },
  { name: "Users", icon: Users, key: "users" },
];

// Dégradés prédéfinis
const GRADIENT_PRESETS = [
  { name: "Navy Deep", from: "#1e293b", to: "#0f172a" },
  { name: "Ocean Blue", from: "#0369a1", to: "#0284c7" },
  { name: "Emerald Tech", from: "#059669", to: "#10b981" },
  { name: "Sunset", from: "#ea580c", to: "#f97316" },
  { name: "Purple Soft", from: "#7c3aed", to: "#a855f7" },
  { name: "Red Vibrant", from: "#dc2626", to: "#ef4444" },
  { name: "Cyan Modern", from: "#06b6d4", to: "#0891b2" },
  { name: "Gray Pro", from: "#4b5563", to: "#6b7280" },
];

// Polices disponibles
const FONTS = [
  { name: "Inter", family: "font-sans" },
  { name: "Montserrat", family: "font-bold" },
  { name: "Playfair Display", family: "font-serif" },
];

interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  icon?: string;
  iconSize: number;
}

interface ImageElement {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  borderRadius: number;
}

interface BannerConfig {
  colorFrom: string;
  colorTo: string | null;
  platform: string;
}

const DEFAULT_TEXT_ELEMENT: TextElement = {
  id: "text-1",
  content: "Votre Titre",
  x: 50,
  y: 50,
  fontSize: 32,
  fontFamily: "font-sans",
  color: "#ffffff",
  iconSize: 24,
};

const DEFAULT_CONFIG: BannerConfig = {
  colorFrom: "#1e40af",
  colorTo: "#3b82f6",
  platform: "linkedin",
};

export default function BannerCreator() {
  const [config, setConfig] = useState<BannerConfig>(DEFAULT_CONFIG);
  const [textElements, setTextElements] = useState<TextElement[]>([DEFAULT_TEXT_ELEMENT]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string>("text-1");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [showLinkedInPreview, setShowLinkedInPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const bannerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Charger template depuis localStorage
  useEffect(() => {
    const templatePreload = localStorage.getItem("banner_template_preload");
    if (templatePreload) {
      try {
        const design = JSON.parse(templatePreload);
        setConfig(prev => ({
          ...prev,
          colorFrom: design.colorFrom || prev.colorFrom,
          colorTo: design.colorTo || null,
          platform: design.platform || "linkedin",
        }));
        setTextElements([{
          ...DEFAULT_TEXT_ELEMENT,
          content: design.text || "Votre Titre",
        }]);
        localStorage.removeItem("banner_template_preload");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getPlatformDimensions = () => {
    switch (config.platform) {
      case "linkedin":
        return { width: 1584, height: 396 };
      case "facebook":
        return { width: 820, height: 312 };
      case "twitter":
        return { width: 1500, height: 500 };
      default:
        return { width: 1200, height: 400 };
    }
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const updateImageElement = (id: string, updates: Partial<ImageElement>) => {
    setImageElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const addTextElement = () => {
    const newId = `text-${Date.now()}`;
    const newElement: TextElement = {
      ...DEFAULT_TEXT_ELEMENT,
      id: newId,
      y: DEFAULT_TEXT_ELEMENT.y + (textElements.length * 40),
    };
    setTextElements(prev => [...prev, newElement]);
    setSelectedTextId(newId);
  };

  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(textElements[0]?.id || "");
    }
  };

  const deleteImageElement = (id: string) => {
    setImageElements(prev => prev.filter(el => el.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const newId = `image-${Date.now()}`;
        const newImage: ImageElement = {
          id: newId,
          url: event.target?.result as string,
          x: 50,
          y: 50,
          width: 200,
          height: 200,
          opacity: 1,
          borderRadius: 0,
        };
        setImageElements(prev => [...prev, newImage]);
        setSelectedImageId(newId);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const newId = `image-${Date.now()}`;
        const newImage: ImageElement = {
          id: newId,
          url: event.target?.result as string,
          x: 50,
          y: 50,
          width: 200,
          height: 200,
          opacity: 1,
          borderRadius: 0,
        };
        setImageElements(prev => [...prev, newImage]);
        setSelectedImageId(newId);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportImage = async (format: "png" | "jpg") => {
    if (!bannerRef.current) return;

    try {
      const canvas = await html2canvas(bannerRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
      });

      const mime = format === "png" ? "image/png" : "image/jpeg";
      const data = canvas.toDataURL(mime, 0.95);
      const link = document.createElement("a");
      link.href = data;
      link.download = `banniere-emploiplus-${Date.now()}.${format}`;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const selectedText = textElements.find(el => el.id === selectedTextId);
  const selectedImage = imageElements.find(el => el.id === selectedImageId);
  const dims = getPlatformDimensions();

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: 'Accueil', to: '/' },
        { label: 'Services', to: '/services' },
        { label: 'Studio de Bannières' }
      ]} />

      <div className="flex h-[calc(100vh-120px)]">
        {/* ============ SIDEBAR GAUCHE ============ */}
        <div className="w-[35%] bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 overflow-y-auto sticky top-0">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Studio de Design</h1>

            <Tabs defaultValue="texts" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6 bg-gray-100">
                <TabsTrigger value="texts" className="flex gap-1">
                  <Type className="w-4 h-4" />
                  <span className="hidden sm:inline">Textes</span>
                </TabsTrigger>
                <TabsTrigger value="style" className="flex gap-1">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Style</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="flex gap-1">
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Images</span>
                </TabsTrigger>
              </TabsList>

              {/* ONGLET TEXTES */}
              <TabsContent value="texts" className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Éléments de Texte
                    </label>
                    <Button
                      size="sm"
                      onClick={addTextElement}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {textElements.map(el => (
                      <div
                        key={el.id}
                        onClick={() => setSelectedTextId(el.id)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTextId === el.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-gray-700 truncate flex-1">
                            {el.content || "Nouveau texte"}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTextElement(el.id);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedText && (
                  <div className="border-t border-gray-200 pt-5 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contenu du Texte
                      </label>
                      <input
                        type="text"
                        value={selectedText.content}
                        onChange={(e) => updateTextElement(selectedTextId, { content: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Positionnement XY */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700">
                          Horizontal (X): {selectedText.x}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedText.x}
                          onChange={(e) => updateTextElement(selectedTextId, { x: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">
                          Vertical (Y): {selectedText.y}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedText.y}
                          onChange={(e) => updateTextElement(selectedTextId, { y: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Taille & Police */}
                    <div>
                      <label className="text-sm font-semibold text-gray-900 mb-2 block">
                        Taille : {selectedText.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedText.fontSize}
                        onChange={(e) => updateTextElement(selectedTextId, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Police
                      </label>
                      <select
                        value={selectedText.fontFamily}
                        onChange={(e) => updateTextElement(selectedTextId, { fontFamily: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {FONTS.map(font => (
                          <option key={font.family} value={font.family}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Couleur du Texte
                      </label>
                      <input
                        type="color"
                        value={selectedText.color}
                        onChange={(e) => updateTextElement(selectedTextId, { color: e.target.value })}
                        className="w-full h-10 rounded border border-gray-300"
                      />
                    </div>

                    {/* Sélection d'Icône */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ajouter une Icône
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {PREDEFINED_ICONS.map(({ name, icon: IconComponent, key }) => (
                          <button
                            key={key}
                            onClick={() => updateTextElement(selectedTextId, { icon: key })}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              selectedText.icon === key
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            title={name}
                          >
                            <IconComponent className="w-5 h-5 mx-auto text-gray-700" />
                          </button>
                        ))}
                      </div>
                      {selectedText.icon && (
                        <button
                          onClick={() => updateTextElement(selectedTextId, { icon: undefined })}
                          className="text-xs text-red-600 hover:text-red-700 font-medium w-full py-1"
                        >
                          Supprimer l'icône
                        </button>
                      )}
                    </div>

                    {selectedText.icon && (
                      <div>
                        <label className="text-xs font-semibold text-gray-700">
                          Taille Icône: {selectedText.iconSize}px
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="48"
                          value={selectedText.iconSize}
                          onChange={(e) => updateTextElement(selectedTextId, { iconSize: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ONGLET STYLE */}
              <TabsContent value="style" className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Sélectionner un Dégradé
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADIENT_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setConfig({ ...config, colorFrom: preset.from, colorTo: preset.to })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          config.colorFrom === preset.from && config.colorTo === preset.to
                            ? "border-blue-600 ring-2 ring-blue-300"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className="w-full h-12 rounded mb-2"
                          style={{
                            background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                          }}
                        />
                        <div className="text-xs font-medium text-gray-700">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Couleur Personnalisée
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Couleur Primaire</label>
                      <input
                        type="color"
                        value={config.colorFrom}
                        onChange={(e) => setConfig({ ...config, colorFrom: e.target.value })}
                        className="w-full h-10 rounded border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Couleur Secondaire</label>
                      <input
                        type="color"
                        value={config.colorTo || "#ffffff"}
                        onChange={(e) => setConfig({ ...config, colorTo: e.target.value })}
                        className="w-full h-10 rounded border border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Plateforme
                  </label>
                  <select
                    value={config.platform}
                    onChange={(e) => setConfig({ ...config, platform: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="linkedin">LinkedIn (1584×396)</option>
                    <option value="facebook">Facebook (820×312)</option>
                    <option value="twitter">Twitter (1500×500)</option>
                  </select>
                </div>
              </TabsContent>

              {/* ONGLET IMAGES */}
              <TabsContent value="images" className="space-y-5">
                <div
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 mb-2">Glissez votre image</p>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 inline-block text-sm font-medium">
                      Choisir
                    </span>
                  </label>
                </div>

                {imageElements.length > 0 && (
                  <div className="border-t border-gray-200 pt-5">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-semibold text-gray-900">
                        Images ({imageElements.length})
                      </label>
                    </div>

                    <div className="space-y-2">
                      {imageElements.map(img => (
                        <div
                          key={img.id}
                          onClick={() => setSelectedImageId(img.id)}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedImageId === img.id
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-medium text-gray-700">Image {imageElements.indexOf(img) + 1}</div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteImageElement(img.id);
                              }}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedImage && (
                  <div className="border-t border-gray-200 pt-5 space-y-4">
                    <div className="bg-gray-100 rounded-lg p-3 max-h-24 overflow-hidden">
                      <img src={selectedImage.url} alt="Preview" className="w-full h-full object-cover rounded" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700">
                          X: {selectedImage.x}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedImage.x}
                          onChange={(e) => updateImageElement(selectedImageId, { x: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">
                          Y: {selectedImage.y}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedImage.y}
                          onChange={(e) => updateImageElement(selectedImageId, { y: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700">
                        Largeur: {selectedImage.width}px
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="400"
                        value={selectedImage.width}
                        onChange={(e) => updateImageElement(selectedImageId, { 
                          width: parseInt(e.target.value),
                          height: parseInt(e.target.value) // Garder aspect ratio carré
                        })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700">
                        Opacité: {Math.round(selectedImage.opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedImage.opacity}
                        onChange={(e) => updateImageElement(selectedImageId, { opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700">
                        Arrondis (Border Radius): {selectedImage.borderRadius}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedImage.borderRadius}
                        onChange={(e) => updateImageElement(selectedImageId, { borderRadius: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* BOUTONS D'ACTION */}
            <div className="border-t border-gray-200 mt-8 pt-6 space-y-3">
              <Button
                onClick={() => setShowLinkedInPreview(!showLinkedInPreview)}
                variant="outline"
                className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu LinkedIn
              </Button>
              <Button
                onClick={() => exportImage("png")}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PNG
              </Button>
              <Button
                onClick={() => exportImage("jpg")}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger JPG
              </Button>
            </div>
          </div>
        </div>

        {/* ============ CANVAS CENTRAL ============ */}
        <div className="w-[65%] bg-gradient-to-b from-gray-100 to-gray-50 flex items-center justify-center p-8 overflow-auto">
          <div className="relative">
            {/* Safe Zone Overlay (LinkedIn Preview) */}
            {showLinkedInPreview && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute left-8 top-1/2 transform -translate-y-1/2 w-24 h-24 border-2 border-yellow-400 rounded-full shadow-lg opacity-50 animate-pulse" />
                <div className="absolute inset-8 border-2 border-dashed border-yellow-400 rounded opacity-30" />
                <div className="absolute top-4 left-32 bg-yellow-100 border border-yellow-400 rounded px-3 py-1 text-xs font-semibold text-yellow-800">
                  Zone sûre
                </div>
              </div>
            )}

            {/* La Bannière */}
            <div
              ref={bannerRef}
              className="shadow-2xl relative"
              style={{
                width: `${dims.width}px`,
                height: `${dims.height}px`,
                background: config.colorTo
                  ? `linear-gradient(135deg, ${config.colorFrom}, ${config.colorTo})`
                  : config.colorFrom,
              }}
            >
              {/* Images */}
              {imageElements.map(img => (
                <div
                  key={img.id}
                  className="absolute"
                  style={{
                    left: `${img.x}%`,
                    top: `${img.y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                >
                  <img
                    src={img.url}
                    alt="Banner element"
                    style={{
                      width: `${img.width}px`,
                      height: `${img.height}px`,
                      opacity: img.opacity,
                      borderRadius: `${img.borderRadius}px`,
                      objectFit: "cover",
                    }}
                    className="drop-shadow-lg"
                  />
                </div>
              ))}

              {/* Textes */}
              {textElements.map(textEl => {
                const iconData = PREDEFINED_ICONS.find(i => i.key === textEl.icon);
                const IconComponent = iconData?.icon;

                return (
                  <div
                    key={textEl.id}
                    className="absolute"
                    style={{
                      left: `${textEl.x}%`,
                      top: `${textEl.y}%`,
                      transform: "translate(-50%, -50%)",
                      maxWidth: "80%",
                      zIndex: 20,
                    }}
                  >
                    <div className={`text-white ${textEl.fontFamily} flex items-center gap-2`}>
                      {IconComponent && (
                        <IconComponent
                          size={textEl.iconSize}
                          style={{ color: textEl.color }}
                          className="drop-shadow-lg flex-shrink-0"
                        />
                      )}
                      <h1
                        className="font-bold drop-shadow-lg"
                        style={{
                          fontSize: `${textEl.fontSize}px`,
                          color: textEl.color,
                          lineHeight: "1.2",
                        }}
                      >
                        {textEl.content}
                      </h1>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Indicateurs de dimensions */}
            <div className="mt-4 text-center text-gray-600 text-sm">
              <p className="font-semibold">
                {config.platform === "linkedin"
                  ? "LinkedIn: 1584×396px"
                  : config.platform === "facebook"
                  ? "Facebook: 820×312px"
                  : "Twitter: 1500×500px"}
              </p>
              <p className="text-xs text-gray-500">Résolution d'export: Retina-Ready (3x)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
