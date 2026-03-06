import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit, Trash2, Download, Eye, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { CVTemplateFrancklyn } from "@/components/cv-templates/CVTemplateFrancklyn";
import { CVTemplateMinimalist } from "@/components/cv-templates/CVTemplateMinimalist";
import { CVTemplateGeometric } from "@/components/cv-templates/CVTemplateGeometric";
import { CVTemplateInfographic } from "@/components/cv-templates/CVTemplateInfographic";
import { CVTemplateClassicSober } from "@/components/cv-templates/CVTemplateClassicSober";
import { CVTemplateOrangeDynamic } from "@/components/cv-templates/CVTemplateOrangeDynamic";
import { CVTemplateModernRibbon } from "@/components/cv-templates/CVTemplateModernRibbon";
import { CVTemplatePastelJunior } from "@/components/cv-templates/CVTemplatePastelJunior";
import { CVTemplateRibbonSidebar } from "@/components/cv-templates/CVTemplateRibbonSidebar";
import { CVTemplateExecutive } from "@/components/cv-templates/CVTemplateExecutive";
import { CVTemplateNavyBlue } from "@/components/cv-templates/CVTemplateNavyBlue";
import { CVTemplateWarmMinimal } from "@/components/cv-templates/CVTemplateWarmMinimal";
import { CVTemplateTurquoiseOrange } from "@/components/cv-templates/CVTemplateTurquoiseOrange";
import { CVTemplateYellowMask } from "@/components/cv-templates/CVTemplateYellowMask";
import { CVTemplateHighEnd } from "@/components/cv-templates/CVTemplateHighEnd";
import { CVTemplateNavyWhite } from "@/components/cv-templates/CVTemplateNavyWhite";
import { CVTemplateBlackWhite } from "@/components/cv-templates/CVTemplateBlackWhite";
import { CVTemplateYellowGeometric } from "@/components/cv-templates/CVTemplateYellowGeometric";
import { CVTemplateInfographicBlueOrange } from "@/components/cv-templates/CVTemplateInfographicBlueOrange";
import { CVTemplateRibbonLayers } from "@/components/cv-templates/CVTemplateRibbonLayers";
import { CVTemplateTurquoiseOrangeV2 } from "@/components/cv-templates/CVTemplateTurquoiseOrangeV2";
import { CVTemplateExecutiveCadre } from "@/components/cv-templates/CVTemplateExecutiveCadre";
import { CVTemplateOrangeCreative } from "@/components/cv-templates/CVTemplateOrangeCreative";
import { CVTemplateStudentPastel } from "@/components/cv-templates/CVTemplateStudentPastel";
import { CVTemplateTimeline } from "@/components/cv-templates/CVTemplateTimeline";
import { CVTemplateNavyModern } from "@/components/cv-templates/CVTemplateNavyModern";
import { CVTemplateClassicMinimalist } from "@/components/cv-templates/CVTemplateClassicMinimalist";
import { CVTemplateOliviaWilson } from "@/components/cv-templates/CVTemplateOliviaWilson";
import { CVTemplateExecutiveEditorial } from "@/components/cv-templates/CVTemplateExecutiveEditorial";
import { CVTemplateResumeGrid } from "@/components/cv-templates/CVTemplateResumeGrid";
import { CVEditorModal, CVData } from "@/components/CVEditorModal";
import { useCVStorage } from "@/hooks/useCVStorage";

const CV_TEMPLATES = [
  {
    id: "francklyn",
    category: "moderne",
    name: "Modèle 1 - Francklin Sylver",
    description:
      "Design professionnel deux colonnes avec barre latérale - Idéal pour mettre en valeur vos compétences et expériences",
    features: [
      "Barre latérale avec compétences et langues",
      "Design deux colonnes moderne",
      "Éléments graphiques élégants",
      "Format A4 optimisé pour impression",
    ],
    image: "💼",
  },
  {
    id: "minimalist",
    category: "moderne",
    name: "Modèle 2 - Minimaliste",
    description:
      "Design minimaliste noir et blanc épuré avec deux colonnes distinctes - Idéal pour un CV classique et professionnel",
    features: [
      "Colonne latérale sombre avec informations de contact",
      "Design épuré et minimaliste",
      "Excellente lisibilité",
      "Format A4 optimisé pour impression",
    ],
    image: "⬛",
  },
  {
    category: "moderne",
    id: "geometric",
    name: "Modèle 3 - Géométrique",
    description:
      "Design moderne et géométrique avec couleurs jaune vif et gris - Parfait pour les candidats créatifs",
    features: [
      "Formes géométriques modernes",
      "Palette de couleurs jaune et gris",
      "Barres de progression pour les compétences",
      "Design innovant et attractif",
    ],
    image: "🟨",
  },
  {
    category: "moderne",
    id: "infographic",
    name: "Modèle 4 - Infographique",
    description:
      "Design infographique visuel avec graphiques circulaires et barres de progression colorées - Pour un impact maximal",
    features: [
      "Graphiques circulaires pour les compétences",
      "Palette bleu nuit et jaune orangé",
      "Icônes dans des cercles colorés",
      "Mise en page aérée et moderne",
    ],
    image: "📊",
  },
  {
    category: "moderne",
    id: "classicsober",
    name: "Modèle 5 - Classique Sobre",
    description:
      "Design professionnel et sobre avec contraste gris/blanc - Idéal pour une lecture rapide par les recruteurs",
    features: [
      "Header gris anthracite avec informations",
      "Deux colonnes bien définies",
      "Compétences et formation sur fond sombre",
      "Typographie élégante et professionnelle",
    ],
    image: "🎩",
  },
  {
    id: "orangedynamic",
    category: "moderne",
    name: "Modèle 6 - Orange Dynamique",
    description:
      "Design dynamique avec contraste orange/noir/blanc - Pour une présentation énergique et moderne",
    features: [
      "Bannière orange impactante",
      "Photo circulaire centrée",
      "Barres de progression orange",
      "Icônes de réseaux sociaux intégrées",
    ],
    image: "🟠",
  },
  {
    id: "modernribbon",
    category: "moderne",
    name: "Modèle 7 - Ruban Moderne",
    description:
      "Design avec rubans et timeline moderne - Idéal pour un CV créatif et structuré",
    features: [
      "Titres en forme de pilules arrondies",
      "Timeline verticale avec points orange",
      "Diagrammes circulaires pour compétences",
      "Mise en page très moderne et aérée",
    ],
    image: "🎀",
  },
  {
    id: "pasteljunior",
    category: "moderne",
    name: "Modèle 8 - Pastel Junior",
    description:
      "Design doux et aéré pour juniors/étudiants - Parfait pour les jeunes talents",
    features: [
      "Header en couleur pastel rose",
      "Colonne gauche étroite avec sections structurées",
      "Colonne droite spacieuse avec détails",
      "Très aéré avec beaucoup d'espaces blancs",
    ],
    image: "🌸",
  },
  {
    id: "ribbonsidebar",
    category: "moderne",
    name: "Modèle 9 - Ruban Latéral",
    description:
      "Design avec rubans gris qui dépassent + timeline verticale - Pour un CV structuré et moderne",
    features: [
      "Colonne latérale grise (35%) avec rubans qui dépassent",
      "Rubans gris foncé avec effet d'ombre",
      "Timeline verticale fine avec points solides",
      "Très épuré et professionnel",
    ],
    image: "🎀",
  },
  {
    id: "executive",
    category: "moderne",
    name: "Modèle 10 - Cadre Professionnel",
    description:
      "Design haute performance pour cadres - Photo carrée, barre grise avec coordonnées",
    features: [
      "Photo carrée en haut gauche",
      "Nom et titre à droite du header",
      "Barre grise avec coordonnées alignées",
      "Typographie Serif pour les titres",
    ],
    image: "🏢",
  },
  {
    id: "navyblue",
    category: "moderne",
    name: "Modèle 11 - Bleu Marine",
    description:
      "Design professionnel avec header bleu marine - Photo circulaire qui chevauche",
    features: [
      "Header bleu marine (#000080)",
      "Photo circulaire chevauchant le header",
      "Barre latérale grise clair avec sections",
      "Titres bleu marine soulignés",
    ],
    image: "🌊",
  },
  {
    id: "warmminimal",
    category: "moderne",
    name: "Modèle 12 - Minimaliste Chaleureux",
    description:
      "Design doux avec palette beige - Expériences en blocs arrondis chaleureux",
    features: [
      "Fond beige très clair (#fdf6ec)",
      "Photo circulaire en haut à gauche",
      "Blocs d'expérience arrondis en beige",
      "Couleurs brunes douces et premium",
    ],
    image: "☕",
  },
  {
    id: "turquoiseorange",
    category: "moderne",
    name: "Modèle 13 - Turquoise & Orange",
    description:
      "Design vibrant avec barre latérale turquoise et accents orange - Photo avec bordure orange",
    features: [
      "Barre latérale turquoise (#2bb0ac) 30% de largeur",
      "Photo de profil cercle avec bordure orange (#f39c12)",
      "Titres de sections avec soulignés orange",
      "Barres de progression pour compétences",
    ],
    image: "🌊",
  },
  {
    id: "yellowmask",
    category: "moderne",
    name: "Modèle 14 - Bloc Jaune & Masque",
    description:
      "Design moderne avec bloc jaune vif et photo qui dépasse - Timeline verticale jaune",
    features: [
      "Bloc jaune vif (#f1c40f) avec photo qui dépasse",
      "Effet de masque arrondi U-shape sur la photo",
      "Timeline verticale jaune pour les expériences",
      "Colonne gauche gris clair (#f8f8f8) pour infos",
    ],
    image: "⭐",
  },
  {
    id: "highend",
    category: "moderne",
    name: "Modèle 15 - High-End Minimaliste",
    description:
      "Design premium ultra épuré - Header gris avec deux colonnes et ligne discrète",
    features: [
      "Header gris (#f2f2f2) avec nom en orange (#e67e22)",
      "Deux colonnes avec ligne verticale très discrète",
      "Police légère et majuscules largement espacées",
      "Minimaliste et très professionnel",
    ],
    image: "💼",
  },
  {
    id: "navywhite",
    category: "moderne",
    name: "Modèle 16 - Bleu Marine Bicolore",
    description:
      "Design bicolore professionnel - Barre latérale bleu marine avec photo en double cercle",
    features: [
      "Barre latérale bleu marine foncé (#0a1d37) 33%",
      "Photo en double cercle blanc avec effet de profondeur",
      "Titres de sections en capsules bleues (#0a1d37)",
      "Marges étroites pour maximiser le contenu",
    ],
    image: "🎩",
  },
  {
    id: "blackwhite",
    category: "moderne",
    name: "Modèle 17 - Noir & Blanc Minimaliste",
    description:
      "Design épuré noir/blanc avec barre latérale noire et barres de progression",
    features: [
      "Barre latérale noire (#1a1a1a) avec texte blanc",
      "Photo profil arrondie en bas",
      "Barres de progression pour compétences",
      "Très minimaliste et professionnel",
    ],
    image: "⬛",
  },
  {
    id: "yellowgeometric",
    category: "moderne",
    name: "Modèle 18 - Jaune Géométrique",
    description:
      "Design moderne avec accents géométriques jaunes et ligne verticale de séparation",
    features: [
      "Bloc jaune (#f39c12) en haut à gauche derrière photo",
      "Ligne verticale grise avec points jaunes de repère",
      "Triangles jaunes dans les coins pour l'équilibre",
      "Design géométrique et très moderne",
    ],
    image: "✨",
  },
  {
    id: "infographicblueorange",
    category: "moderne",
    name: "Modèle 19 - Infographique Bleu/Orange",
    description:
      "Design infographique avec vagues fluides, diagrammes circulaires et capsules oranges",
    features: [
      "Colonne latérale bleu nuit (#101820)",
      "Vague orange cuivré (#cf8d2e) autour de la photo",
      "Diagrammes circulaires SVG pour compétences",
      "Capsules orange avec timeline",
    ],
    image: "🌀",
  },
  {
    id: "ribbonlayers",
    category: "moderne",
    name: "Modèle 20 - Rubans Superposés",
    description:
      "Design avec rubans qui se chevauchent et arche pour la photo de profil",
    features: [
      "Colonne latérale grise avec photos en cadre arche",
      "Titres en blocs rectangulaires gris qui dépassent",
      "Timeline des expériences avec rubans gris",
      "Effet de superposition très élégant",
    ],
    image: "🎀",
  },
  {
    id: "turquoiseorangev2",
    category: "moderne",
    name: "Modèle 21 - Turquoise Orange V2",
    description:
      "Design bicolore turquoise/orange avec barres fines et lignes de soulignement",
    features: [
      "Barre latérale turquoise (#2bb0ac)",
      "Photo cercle avec bordure orange (#f39c12)",
      "Barres horizontales fines pour compétences",
      "Titres soulignés par ligne orange",
    ],
    image: "💎",
  },  {
    id: "executivecadre",
    category: "moderne",
    name: "Modèle 22 - Exécutif Cadre",
    description:
      "Design professionnel pour cadre - Photo carrée, bloc gris anthracite, barre contact",
    features: [
      "Photo carrée à gauche dans le header",
      "Bloc gris anthracite (#4a4a4a) avec nom/titre en blanc",
      "Barre contact gris clair (#f2f2f2)",
      "Colonne gauche noire avec polices serif",
    ],
    image: "👔",
  },
  {
    id: "orangecreative",
    category: "moderne",
    name: "Modèle 23 - Orange Créatif",
    description:
      "Design créatif bicolore - Grand bandeau orange, colonne noire, icônes sociales",
    features: [
      "Bandeau orange vif (#f39c12) en haut",
      "Photo circulaire bordée de noir",
      "Colonne latérale droite noire avec barres orange",
      "Icônes réseaux sociaux en bas",
    ],
    image: "🎨",
  },
  {
    id: "studentpastel",
    category: "moderne",
    name: "Modèle 24 - Étudiant Pastel",
    description:
      "Design doux pour étudiants - Header rose pastel, sections noires, très aéré",
    features: [
      "Header rose pastel (#fce4ec)",
      "Photo carrée arrondie à gauche",
      "Titres sur rectangles noirs avec texte blanc",
      "Très aéré et moderne pour juniors",
    ],
    image: "🎓",
  },
  {
    id: "timeline",
    category: "moderne",
    name: "Modèle 25 - Timeline Pointillée",
    description:
      "Design avec timeline infographique - Ligne pointillée, cercles jaunes d'accent",
    features: [
      "Sidebar gris perle (#dcdde1) avec photo",
      "Timeline verticale pointillée avec points jaunes (#fbc531)",
      "Icônes de sections sur la ligne",
      "Segments rectangulaires pour langues",
    ],
    image: "⏳",
  },
  {
    id: "navymodern",
    category: "moderne",
    name: "Modèle 26 - Bleu Marine Moderne",
    description:
      "Design bicolore bleu marine - Photo circulaire qui chevauche le header",
    features: [
      "Bandeau bleu marine (#000080) en haut",
      "Photo circulaire qui chevauche header/contenu",
      "Colonne gauche et droite bien équilibrées",
      "Titres bleus avec lignes de soulignement fines",
    ],
    image: "🌀",
  },
  {
    id: "oliviawilson",
    category: "classique",
    name: "Modèle Classique 1 - Olivia Wilson",
    description:
      "Design élégant et professionnel avec photo circulaire, barre de contact horizontale et layout asymétrique - Idéal pour les profils de communication et marketing",
    features: [
      "Photo circulaire avec bordure bleu ciel",
      "Barre de contact horizontale stylisée",
      "Layout asymétrique deux colonnes",
      "Éléments graphiques modernes",
      "Typographie raffinée et aérée",
    ],
    image: "👩",
  },
  {
    id: "executiveeditorial",
    category: "classique",
    name: "Modèle Classique 2 - Executive Editorial",
    description:
      "Design haut de gamme avec élément géométrique et layout 3 colonnes - Parfait pour les cadres et directeurs, respire l'élégance et la sérénité",
    features: [
      "Éléments géométriques en vert menthe pastel",
      "Layout 3 colonnes asymétrique (25-75)",
      "Ombre portée ultra-réaliste",
      "Barres de progression minimalistes",
      "Espaces blancs maximisés",
    ],
    image: "✨",
  },
  {
    id: "resumegrid",
    category: "classique",
    name: "Modèle Classique 3 - Resume Grid",
    description:
      "Design moderne et modulaire avec grille bien définie et accents rose pastel - Idéal pour les profils créatifs et modernes",
    features: [
      "Photo carrée arrondie avec ligne de séparation",
      "Grille modulaire 60/40 bien structurée",
      "Pastilles de niveau pour les compétences",
      "Typographie mixte serif/sans-serif élégante",
      "Accents rose poudré distincts",
    ],
    image: "🎯",
  },];

// Données d'exemple pour le prévisualisation
const SAMPLE_CV_DATA = {
  full_name: "Sophie Laurent",
  job_title: "Directrice Créative",
  phone: "+33 6 78 34 56 01",
  email: "sophie.laurent@email.com",
  website: "www.sophielaurent.fr",
  location: "Paris, France",
  summary: "Directrice créative passionnée avec 10 années d'expérience dans le design graphique et la création de campagnes visuelles innovantes. Spécialisée en identité de marque et direction artistique, je crée des expériences visuelles mémorables qui connectent les audiences.",
  experiences: [
    {
      company: "Creative & Co Design Studio",
      position: "Directrice Créative",
      startDate: "2019",
      endDate: "Présent",
      description: "Pilotage de la vision créative et direction artistique de tous les projets clients. Gestion d'une équipe de 12 designers et création de campagnes visuelles pour grandes marques. Augmentation de la clientèle de 60% grâce à la qualité des réalisations et l'innovation créative.",
    },
    {
      company: "Design Forward Agency",
      position: "Designer Senior & Lead Créatif",
      startDate: "2015",
      endDate: "2019",
      description: "Conception d'identités visuelles complètes et campagnes de marketing créatives. Collaboration avec clients Fortune 500 et startups innovantes. Mentorship des designers juniors et standardisation des processus créatifs.",
    },
    {
      company: "Visual Design Studio",
      position: "Graphiste Designer",
      startDate: "2012",
      endDate: "2015",
      description: "Création de designs graphiques pour print et digital. Développement de compétences en design thinking et méthodologies créatives agiles.",
    },
  ],
  education: [
    {
      school: "École Supérieure d'Art et Design",
      degree: "Master Design Graphique & Direction Artistique",
      startDate: "2010",
      endDate: "2012",
    },
    {
      school: "Université Paris Ouest",
      degree: "Licence Arts Plastiques & Design",
      startDate: "2007",
      endDate: "2010",
    },
  ],
  skills: [
    { name: "Direction Artistique", level: 5 },
    { name: "Identité Visuelle", level: 5 },
    { name: "Design Graphique", level: 5 },
    { name: "Adobe Creative Suite", level: 5 },
    { name: "Branding Strategy", level: 4 },
    { name: "UX/UI Design", level: 4 },
  ],
  software: [
    { name: "Adobe XD", level: 5 },
    { name: "Figma", level: 5 },
    { name: "Illustrator", level: 5 },
    { name: "Photoshop", level: 5 },
  ],
  languages: [
    { name: "Français", level: "Langue maternelle" },
    { name: "Anglais", level: "Courant" },
    { name: "Allemand", level: "Intermédiaire" },
  ],
};

const getTemplateComponent = (templateId: string) => {
  switch (templateId) {
    case "francklyn":
      return CVTemplateFrancklyn;
    case "minimalist":
      return CVTemplateMinimalist;
    case "geometric":
      return CVTemplateGeometric;
    case "infographic":
      return CVTemplateInfographic;
    case "classicsober":
      return CVTemplateClassicSober;
    case "orangedynamic":
      return CVTemplateOrangeDynamic;
    case "modernribbon":
      return CVTemplateModernRibbon;
    case "pasteljunior":
      return CVTemplatePastelJunior;
    case "ribbonsidebar":
      return CVTemplateRibbonSidebar;
    case "executive":
      return CVTemplateExecutive;
    case "navyblue":
      return CVTemplateNavyBlue;
    case "warmminimal":
      return CVTemplateWarmMinimal;
    case "turquoiseorange":
      return CVTemplateTurquoiseOrange;
    case "yellowmask":
      return CVTemplateYellowMask;
    case "highend":
      return CVTemplateHighEnd;
    case "navywhite":
      return CVTemplateNavyWhite;
    case "blackwhite":
      return CVTemplateBlackWhite;
    case "yellowgeometric":
      return CVTemplateYellowGeometric;
    case "infographicblueorange":
      return CVTemplateInfographicBlueOrange;
    case "ribbonlayers":
      return CVTemplateRibbonLayers;
    case "turquoiseorangev2":
      return CVTemplateTurquoiseOrangeV2;
    case "executivecadre":
      return CVTemplateExecutiveCadre;
    case "orangecreative":
      return CVTemplateOrangeCreative;
    case "studentpastel":
      return CVTemplateStudentPastel;
    case "timeline":
      return CVTemplateTimeline;
    case "navymodern":
      return CVTemplateNavyModern;
    case "oliviawilson":
      return CVTemplateOliviaWilson;
    case "executiveeditorial":
      return CVTemplateExecutiveEditorial;
    case "resumegrid":
      return CVTemplateResumeGrid;
    default:
      return CVTemplateFrancklyn;
  }
};

export default function CVTemplates() {
  const { cvs, addCV, updateCV, deleteCV } = useCVStorage();
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templateParam ? templateParam : null);
  const [editingCV, setEditingCV] = useState<CVData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Auto-open editor si un modèle est spécifié dans l'URL
  useEffect(() => {
    if (templateParam) {
      setSelectedTemplateId(templateParam);
      setEditorOpen(true);
    }
  }, [templateParam]);

  const handleNewCV = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setEditingCV(null);
    setEditorOpen(true);
  };

  const handleUseTemplate = (template: any) => {
    toast.success(`Modèle "${template.name}" sélectionné !`);
    handleNewCV(template.id);
  };

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleEditCV = (cv: CVData) => {
    setEditingCV(cv);
    setSelectedTemplateId(cv.template);
    setEditorOpen(true);
  };

  const handleSaveCV = (cvData: CVData) => {
    if (editingCV) {
      updateCV(editingCV.id, cvData);
      toast.success("CV mis à jour!");
    } else {
      addCV(cvData);
      toast.success("CV créé avec succès!");
    }
    setEditorOpen(false);
    setEditingCV(null);
  };

  const handleDeleteCV = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce CV?")) {
      deleteCV(id);
      toast.success("CV supprimé!");
    }
  };

  const handleExportPDF = (cv: CVData) => {
    setTimeout(() => {
      window.print();
    }, 100);
    toast.success("Préparation de l'export PDF...");
  };

  const scrollLeft = (category: string) => {
    const ref = scrollRefs.current[category];
    if (ref) {
      ref.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (category: string) => {
    const ref = scrollRefs.current[category];
    if (ref) {
      ref.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const categories = ["moderne", "classique"];
  
  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = CV_TEMPLATES.filter(template => (template.category || 'moderne') === category);
    return acc;
  }, {} as { [key: string]: any[] });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Galerie de Modèles de CV
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choisissez parmi notre collection de modèles professionnels pour créer un CV qui vous ressemble
        </p>
      </div>

      {/* Editor Modal */}
      {editorOpen && selectedTemplateId && (
        <CVEditorModal
          isOpen={editorOpen}
          templateId={selectedTemplateId}
          onClose={() => setEditorOpen(false)}
          onSave={handleSaveCV}
          initialData={editingCV || undefined}
        />
      )}

      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 capitalize">
            {category === 'moderne' ? 'CV Moderne' : 'CV Classique'}
          </h2>

          <div className="relative group">
            <button
              onClick={() => scrollLeft(category)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            <div
              ref={(el) => (scrollRefs.current[category] = el)}
              className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {templatesByCategory[category].map(template => (
                <Card
                  key={template.id}
                  className="flex-shrink-0 w-80 snap-center shadow-md hover:shadow-lg transition-shadow duration-300 group/card overflow-hidden"
                >
                  <div className="relative overflow-hidden rounded-t-lg bg-gray-50 h-48">
                    {(() => {
                      const TemplateComponent = getTemplateComponent(template.id);
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <div
                            className="bg-white shadow-lg w-full h-full overflow-hidden transform scale-50 origin-top"
                            style={{ aspectRatio: "210/297" }}
                          >
                            <TemplateComponent data={SAMPLE_CV_DATA} />
                          </div>
                        </div>
                      );
                    })()}
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Utiliser
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Aperçu
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <Badge variant="outline">{category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            <button
              onClick={() => scrollRight(category)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      ))}

      {/* Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-2xl font-bold">{selectedTemplate.name}</h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedTemplate(null)}
              >
                ✕
              </Button>
            </div>

            <div className="p-6">
              {(() => {
                const TemplateComponent = getTemplateComponent(selectedTemplate.id);
                return (
                  <>
                    <div className="border rounded-lg overflow-hidden mb-6" style={{ minHeight: "600px" }}>
                      <div
                        className="mx-auto bg-white"
                        style={{ width: "210mm", aspectRatio: "210/297" }}
                      >
                        <TemplateComponent data={SAMPLE_CV_DATA} />
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-gray-600">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                        <p>{selectedTemplate.description}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Caractéristiques</h4>
                        <ul className="space-y-1">
                          {selectedTemplate.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex gap-2">
                              <span>•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                      <Button onClick={() => handleUseTemplate(selectedTemplate)}>
                        Utiliser ce modèle
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                        Fermer
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
