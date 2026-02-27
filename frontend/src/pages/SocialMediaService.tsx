import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SOCIAL_SERVICES = [
  {
    id: "social-management",
    name: "Gestion des Réseaux Sociaux",
    description: "Animez vos réseaux sociaux et développez votre communauté",
    price: "À partir de 50000 CFA/mois",
    features: [
      "Création de contenu",
      "Modération et engagement",
      "Calendrier éditorial",
      "Rapport analytique mensuel",
    ],
    icon: "📱",
    importance:
      "Les réseaux sociaux sont essentiels pour la visibilité. Une gestion professionnelle augmente votre engagement et vos ventes de 300%.",
  },
  {
    id: "content-creation",
    name: "Création de Contenu",
    description: "Des contenus attrayants et professionnels pour vos réseaux",
    price: "À partir de 30000 CFA/mois",
    features: [
      "Posts photos et vidéos",
      "Stories quotidiens",
      "Infographies",
      "Hashtags optimisés",
    ],
    icon: "🎨",
    importance:
      "Le contenu de qualité est le roi des réseaux sociaux. Il génère de l'engagement et des conversions.",
  },
  {
    id: "community-management",
    name: "Community Management",
    description: "Gérez votre communauté et fidélisez vos clients",
    price: "À partir de 25000 CFA/mois",
    features: [
      "Répondre aux commentaires",
      "Gestion des messages",
      "Modération du forum",
      "Rapports d'engagement",
    ],
    icon: "👥",
    importance:
      "Une communauté engagée est votre meilleur ambassadeur. Chaque interaction renforcit la fidélité client.",
  },
  {
    id: "paid-advertising",
    name: "Publicité Ciblée",
    description: "Campagnes publicitaires optimisées pour maximiser les ventes",
    price: "À partir de 100000 CFA/mois",
    features: [
      "Campagnes Facebook/Instagram",
      "Ciblage audience",
      "A/B testing",
      "ROI tracking",
    ],
    icon: "💰",
    importance:
      "Les publicités ciblées ont un ROI 5x supérieur. Chaque franc investi génère un retour mesurable.",
  },
];

const WEBSITE_SERVICES = [
  {
    id: "maintenance",
    name: "Maintenance Web",
    description: "Mises à jour, sauvegardes et support technique continu",
    price: "À partir de 15000 CFA/mois",
    features: [
      "Mises à jour mensuelles",
      "Sauvegardes automatiques",
      "Support 24/7",
      "Monitoring performances",
    ],
    icon: "🔧",
    importance:
      "Un site sans maintenance devient lent et vulnérable. La maintenance préventive évite les problèmes coûteux.",
  },
  {
    id: "web-optimization",
    name: "Optimisation Web",
    description: "Améliorer la vitesse et le SEO de votre site",
    price: "À partir de 40000 CFA",
    features: [
      "Optimisation images",
      "Compression code",
      "SEO on-page",
      "Rapport des améliorations",
    ],
    icon: "⚡",
    importance:
      "Un site optimisé charge 2x plus vite et se classera mieux en SEO. +50% de visiteurs en moyenne.",
  },
  {
    id: "seo-service",
    name: "Référencement SEO",
    description: "Apparaître en première page de Google pour vos mots-clés",
    price: "À partir de 60000 CFA/mois",
    features: [
      "Audit SEO complet",
      "Optimisation technique",
      "Création de backlinks",
      "Rapport mensuel",
    ],
    icon: "🔍",
    importance:
      "80% des visiteurs viennent de la recherche organique. Un bon SEO est un investissement à long terme.",
  },
];

export default function SocialMediaService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Share2 className="h-10 w-10 text-pink-600" />
            <h1 className="text-4xl font-bold text-gray-900">Gestion Digitale</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Réseaux sociaux, site web et présence digitale gérés par des experts
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        <Card className="p-12 mb-12 bg-pink-50 border-l-4 border-l-pink-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dominez votre marché digitalement</h2>
          <p className="text-gray-700 mb-6 text-lg">
            La présence digitale n'est plus optionnelle, c'est obligatoire. Nous gérons vos réseaux
            sociaux, optimisons votre site web et créons des campagnes qui convertissent en clients.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Résultats</h3>
              <p className="text-sm text-gray-700">Objectifs mesurables et ROI clair</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Ciblage</h3>
              <p className="text-sm text-gray-700">Atteindre vos clients idéaux</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-bold text-gray-900 mb-2">Temps</h3>
              <p className="text-sm text-gray-700">Vous vous concentrez sur votre core business</p>
            </div>
          </div>
        </Card>

        {/* Réseaux Sociaux */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Services Réseaux Sociaux</h2>
          <p className="text-muted-foreground mb-8">
            De la création de contenu à la gestion complète de vos réseaux
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SOCIAL_SERVICES.map((service) => (
              <Card key={service.id} className="p-8 hover:shadow-2xl transition flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-4xl mb-3">{service.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
                    <p className="text-muted-foreground mt-2">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-pink-600">{service.price}</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-l-purple-600">
                  <p className="text-sm text-gray-700">
                    <strong>Impact :</strong> {service.importance}
                  </p>
                </div>

                <div className="mb-8 flex-1">
                  <h4 className="font-semibold text-gray-900 mb-4">Inclus</h4>
                  <div className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-pink-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-pink-600 hover:bg-pink-700">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Demander un devis
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Services Web */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Services Site Web</h2>
          <p className="text-muted-foreground mb-8">
            Maintenance, optimisation et référencement pour votre site
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WEBSITE_SERVICES.map((service) => (
              <Card key={service.id} className="p-8 hover:shadow-2xl transition flex flex-col">
                <div className="mb-6">
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{service.description}</p>
                </div>

                <div className="mb-6 p-3 bg-blue-50 rounded border-l-4 border-l-blue-600">
                  <p className="text-xs text-gray-700">
                    <strong>Avantage :</strong> {service.importance}
                  </p>
                </div>

                <div className="mb-6 flex-1">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Comprend</h4>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right mb-4">
                  <p className="text-lg font-bold text-pink-600">{service.price}</p>
                </div>

                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Devis
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Packages */}
        <Card className="p-12 mb-12 bg-white border-l-4 border-l-pink-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Packages Recommandés</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "75000 CFA",
                desc: "Pour démarrer",
                items: [
                  "Gestion 2 réseaux",
                  "5 posts/semaine",
                  "Modération basique",
                  "Rapport mensuel",
                ],
              },
              {
                name: "Growth",
                price: "150000 CFA",
                desc: "Pour se développer",
                items: [
                  "Gestion tous réseaux",
                  "15 posts/semaine",
                  "Community management",
                  "Campagne pub 50000 CFA",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "250000 CFA",
                desc: "Pour dominer",
                items: [
                  "Gestion complète",
                  "Contenu illimité",
                  "Campagne pub 100000 CFA",
                  "Réunions hebdo + SEO",
                ],
              },
            ].map((pkg, idx) => (
              <Card
                key={idx}
                className={`p-8 text-center transition ${
                  pkg.highlighted ? "border-pink-600 border-2 shadow-lg relative" : ""
                }`}
              >
                {pkg.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    POPULAIRE
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-muted-foreground mb-4">{pkg.desc}</p>
                <p className="text-3xl font-bold text-pink-600 mb-6">{pkg.price}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-pink-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className={pkg.highlighted ? "w-full bg-pink-600 hover:bg-pink-700" : "w-full"}
                  variant={pkg.highlighted ? "default" : "outline"}
                >
                  Commencer
                </Button>
              </Card>
            ))}
          </div>
        </Card>

        {/* CTA Final */}
        <Card className="p-12 bg-gradient-to-r from-pink-600 to-pink-700 text-white border-none text-center">
          <h2 className="text-3xl font-bold mb-4">Lancez votre stratégie digitale</h2>
          <p className="text-lg text-pink-50 mb-8">
            Nos experts créent et gèrent votre présence digitale pour attirer plus de clients
          </p>
          <Button
            size="lg"
            className="bg-white text-pink-600 hover:bg-pink-50"
            onClick={() => navigate("/contact")}
          >
            Réserver une consultation gratuite
          </Button>
        </Card>
      </div>
    </div>
  );
}
