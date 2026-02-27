import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DESIGN_SERVICES = [
  {
    id: "logo-design",
    name: "Design de Logo",
    description: "Un logo mémorable qui représente votre marque",
    price: "À partir de 35000 CFA",
    features: [
      "3 concepts initiaux",
      "Révisions illimitées",
      "Format vecteur",
      "Fichiers tous formats",
    ],
    icon: "🎨",
    importance:
      "Votre logo est l'identité visuelle de votre marque. Un bon logo augmente la reconnaissance de 80% et renforce la confiance.",
  },
  {
    id: "brand-identity",
    name: "Charte Graphique",
    description: "Une identité visuelle cohérente pour tous vos supports",
    price: "À partir de 80000 CFA",
    features: [
      "Logo professionnel",
      "Palette de couleurs",
      "Typographies",
      "Guide d'utilisation",
    ],
    icon: "📋",
    importance:
      "Une charte graphique garantit une cohérence visuelle qui renforce votre image professionnelle et la reconnaissance de marque.",
  },
  {
    id: "flyer-design",
    name: "Conception de Flyers",
    description: "Des flyers accrocheurs pour promouvoir vos événements",
    price: "À partir de 15000 CFA par design",
    features: [
      "Design accrocheur",
      "Optimisé impression",
      "Formats multiples",
      "Fichiers haute résolution",
    ],
    icon: "📄",
    importance:
      "Un flyer bien conçu augmente la participation aux événements de 250%. C'est votre meilleur outil marketing en local.",
  },
  {
    id: "packaging-design",
    name: "Design de Packaging",
    description: "Un emballage qui fait la différence en magasin",
    price: "À partir de 50000 CFA",
    features: [
      "Design attractif",
      "Respect normes impression",
      "Fichiers production",
      "Concepts multiples",
    ],
    icon: "📦",
    importance:
      "Le packaging influence 73% des décisions d'achat. Un bon design augmente les ventes et la fidélité client.",
  },
];

const DIGITAL_DESIGN = [
  {
    id: "social-graphics",
    name: "Designs pour Réseaux Sociaux",
    description: "Des visuels attrayants pour vos posts et stories",
    price: "À partir de 20000 CFA/lot",
    features: [
      "Posts Instagram",
      "Stories et Reels",
      "Bannières Facebook",
      "Optimisé mobile",
    ],
    icon: "📱",
    importance:
      "Des designs attrayants augmentent l'engagement de 400%. Plus de likes = plus de visibilité = plus de clients.",
  },
  {
    id: "presentation-design",
    name: "Présentations Professionnelles",
    description: "Des présentations PowerPoint impactantes",
    price: "À partir de 40000 CFA",
    features: [
      "Design professionnel",
      "15-20 slides",
      "Animations",
      "Fichiers PowerPoint",
    ],
    icon: "📊",
    importance:
      "Une présentation bien conçue augmente votre crédibilité et aide à conclure des deals. 65% plus de succès.",
  },
  {
    id: "infography",
    name: "Infographies",
    description: "Rendre vos données visuelles et compréhensibles",
    price: "À partir de 25000 CFA",
    features: [
      "Design statistiques",
      "Schémas explicatifs",
      "Timelines",
      "Format web et print",
    ],
    icon: "📈",
    importance:
      "Les infographies sont 3x plus partagées que d'autres contenus. Elles expliquent les concepts complexes simplement.",
  },
];

export default function GraphicDesignService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Services de Design Graphique</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Créatifs, logomarque professionnelle et visuels qui captivent
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        <Card className="p-12 mb-12 bg-purple-50 border-l-4 border-l-purple-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Un design de qualité fait toute la différence</h2>
          <p className="text-gray-700 mb-6 text-lg">
            Le design n'est pas juste de l'esthétique, c'est une stratégie commerciale. Un bon design
            augmente votre crédibilité, attire plus de clients et les fidélise. Nos designers créent
            des visuels qui communiquent votre message avec impact.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">👁️</div>
              <h3 className="font-bold text-gray-900 mb-2">Attractif</h3>
              <p className="text-sm text-gray-700">Capte l'attention immédiatement</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-bold text-gray-900 mb-2">Stratégique</h3>
              <p className="text-sm text-gray-700">Aligné avec vos objectifs</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Mémorable</h3>
              <p className="text-sm text-gray-700">Vos clients vous reconnaîtront</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-bold text-gray-900 mb-2">Convertisseur</h3>
              <p className="text-sm text-gray-700">Génère des ventes et leads</p>
            </div>
          </div>
        </Card>

        {/* Services Print */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Services d'Impression</h2>
          <p className="text-muted-foreground mb-8">
            Designs impactants pour vos supports physiques
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {DESIGN_SERVICES.map((service) => (
              <Card key={service.id} className="p-8 hover:shadow-2xl transition flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-4xl mb-3">{service.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
                    <p className="text-muted-foreground mt-2">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{service.price}</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-l-yellow-600">
                  <p className="text-sm text-gray-700">
                    <strong>Impact :</strong> {service.importance}
                  </p>
                </div>

                <div className="mb-8 flex-1">
                  <h4 className="font-semibold text-gray-900 mb-4">Inclus</h4>
                  <div className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Commander
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Services Digital */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Services Design Digital</h2>
          <p className="text-muted-foreground mb-8">
            Visuels pour vos réseaux, sites web et présentations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DIGITAL_DESIGN.map((service) => (
              <Card key={service.id} className="p-8 hover:shadow-2xl transition flex flex-col">
                <div className="mb-6">
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{service.description}</p>
                </div>

                <div className="mb-6 p-3 bg-green-50 rounded border-l-4 border-l-green-600">
                  <p className="text-xs text-gray-700">
                    <strong>Avantage :</strong> {service.importance}
                  </p>
                </div>

                <div className="mb-6 flex-1">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Comprend</h4>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right mb-4">
                  <p className="text-lg font-bold text-purple-600">{service.price}</p>
                </div>

                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Devis
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Processus créatif */}
        <Card className="p-12 mb-12 bg-white border-l-4 border-l-purple-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Notre Processus Créatif</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Brief", desc: "Comprendre votre vision" },
              { step: 2, title: "Concepts", desc: "Proposer des idées créatives" },
              { step: 3, title: "Affinage", desc: "Perfectionner le design" },
              { step: 4, title: "Livraison", desc: "Fichiers prêts à l'emploi" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Portfolio virtuel */}
        <Card className="p-12 mb-12 bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-l-purple-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Nos Inspirations Récentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Logo Tech", icon: "⚡" },
              { title: "Charte Hôtel", icon: "🏨" },
              { title: "Emballage Bio", icon: "🌿" },
              { title: "Campagne Social", icon: "📱" },
            ].map((item, idx) => (
              <Card key={idx} className="p-12 bg-white border-2 text-center cursor-pointer hover:shadow-lg transition">
                <div className="text-6xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
              </Card>
            ))}
          </div>
        </Card>

        {/* CTA Final */}
        <Card className="p-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none text-center">
          <h2 className="text-3xl font-bold mb-4">Créons quelque chose de magnifique ensemble</h2>
          <p className="text-lg text-purple-50 mb-8">
            Nos designers sont prêts à transformer votre vision en réalité visuelle
          </p>
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-purple-50"
            onClick={() => navigate("/contact")}
          >
            Commencer votre projet
          </Button>
        </Card>
      </div>
    </div>
  );
}
