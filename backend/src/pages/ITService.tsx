import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";

const IT_SERVICES = [
  {
    id: "website",
    name: "Site Web",
    description: "Un site web professionnel pour votre présence en ligne",
    price: "À partir de 150000 CFA",
    features: [
      "Design responsive",
      "Optimisé SEO",
      "Gestion de contenu",
      "Support 6 mois",
    ],
    icon: "🌐",
    importance:
      "Un site web professionnel est votre vitrine digitale. 90% des clients vous recherchent en ligne avant de vous contacter.",
  },
  {
    id: "mobile-app",
    name: "Application Mobile",
    description: "Une application iOS et/ou Android pour votre business",
    price: "À partir de 300000 CFA",
    features: [
      "UX/UI moderne",
      "Performance optimisée",
      "Intégration API",
      "Support technique",
    ],
    icon: "📱",
    importance:
      "Les applications mobiles offrent une expérience utilisateur supérieure et fidélisent vos clients avec une présence permanente sur leurs téléphones.",
  },
  {
    id: "software-solution",
    name: "Solution Logicielle",
    description: "Un logiciel sur mesure pour vos besoins spécifiques",
    price: "À partir de 200000 CFA",
    features: [
      "Développement custom",
      "Intégration systèmes",
      "Formation utilisateurs",
      "Maintenance incluse",
    ],
    icon: "⚙️",
    importance:
      "Un logiciel personnalisé automatise vos processus métier, augmente votre productivité et réduit vos coûts opérationnels.",
  },
  {
    id: "ecommerce",
    name: "Plateforme E-Commerce",
    description: "Vendez en ligne avec une plateforme sécurisée et performante",
    price: "À partir de 250000 CFA",
    features: [
      "Panier dynamique",
      "Paiements sécurisés",
      "Gestion stocks",
      "Rapports analytiques",
    ],
    icon: "🛒",
    importance:
      "L'e-commerce ouvre un marché illimité pour vos produits. Vendez 24/7 sans limite géographique.",
  },
];

export default function ITService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Services Informatiques</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Des solutions digitales innovantes pour transformer votre business
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        <Card className="p-12 mb-12 bg-blue-50 border-l-4 border-l-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Transformez votre présence digitale</h2>
          <p className="text-gray-700 mb-6 text-lg">
            Dans un monde de plus en plus digitalisé, une forte présence en ligne est essentielle
            pour attirer et fidéliser vos clients. Nos experts créent des solutions informatiques
            sur mesure qui correspondent à vos besoins spécifiques et vos objectifs commerciaux.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Sur Mesure</h3>
              <p className="text-sm text-gray-700">Chaque solution est adaptée à votre activité</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Performance</h3>
              <p className="text-sm text-gray-700">Code optimisé et infrastructure scalable</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-gray-900 mb-2">Sécurité</h3>
              <p className="text-sm text-gray-700">Données et transactions protégées</p>
            </div>
          </div>
        </Card>

        {/* Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Nos Expertises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {IT_SERVICES.map((service) => (
              <Card key={service.id} className="p-8 hover:shadow-2xl transition flex flex-col">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-4xl mb-3">{service.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
                    <p className="text-muted-foreground mt-2">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{service.price}</p>
                  </div>
                </div>

                {/* Importance */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-l-green-600">
                  <p className="text-sm text-gray-700">
                    <strong>Pourquoi c'est important :</strong> {service.importance}
                  </p>
                </div>

                {/* Caractéristiques */}
                <div className="mb-8 flex-1">
                  <h4 className="font-semibold text-gray-900 mb-4">Inclus dans le service</h4>
                  <div className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Demander un devis
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Notre approche */}
        <Card className="p-12 mb-12 bg-white border-l-4 border-l-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Notre Approche</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { num: 1, title: "Découverte", desc: "Comprendre votre vision et vos objectifs" },
              { num: 2, title: "Conception", desc: "Dessiner la solution idéale" },
              { num: 3, title: "Développement", desc: "Coder avec les meilleures pratiques" },
              { num: 4, title: "Tests", desc: "Vérifier qualité et performance" },
              { num: 5, title: "Lancement", desc: "Mise en production et formation" },
            ].map((item) => (
              <div key={item.num}>
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-center">{item.title}</h3>
                <p className="text-sm text-muted-foreground text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Technos */}
        <Card className="p-12 mb-12 bg-gray-50 border-l-4 border-l-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Technologies Modernes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "React", icon: "⚛️" },
              { name: "Node.js", icon: "🟢" },
              { name: "Vue.js", icon: "💚" },
              { name: "Docker", icon: "🐳" },
              { name: "PostgreSQL", icon: "🗄️" },
              { name: "MongoDB", icon: "🍃" },
              { name: "AWS", icon: "☁️" },
              { name: "Git", icon: "🔀" },
            ].map((tech) => (
              <div key={tech.name} className="bg-white p-6 rounded-lg text-center">
                <div className="text-3xl mb-2">{tech.icon}</div>
                <p className="font-semibold text-gray-900">{tech.name}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Avantages */}
        <Card className="p-12 bg-blue-600 text-white mb-12 border-none">
          <h2 className="text-2xl font-bold mb-8">Pourquoi nous choisir?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-3">✨ Excellence</h3>
              <p className="text-blue-100">
                Équipe d'experts avec 10+ ans d'expérience
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">⏱️ Délai</h3>
              <p className="text-blue-100">
                Respect des délais et livrables à temps
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">🤝 Support</h3>
              <p className="text-blue-100">
                Support continu après la livraison
              </p>
            </div>
          </div>
        </Card>

        {/* CTA Final */}
        <Card className="p-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à numériser votre business?</h2>
          <p className="text-lg text-blue-50 mb-8">
            Parlons de votre projet et trouvons la meilleure solution ensemble
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/contact")}
          >
            Demander une consultation gratuite
          </Button>
        </Card>
      </div>
    </div>
  );
}
