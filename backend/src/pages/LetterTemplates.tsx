import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";

const LETTER_TEMPLATES = [
  {
    id: "modern",
    name: "Lettre Moderne",
    description:
      "Un style contemporain qui montre votre dynamisme et votre confiance",
    features: [
      "Design épuré",
      "Mise en page moderne",
      "Facilement personnalisable",
    ],
    image: "✨",
  },
  {
    id: "classic",
    name: "Lettre Classique",
    description:
      "Le format traditionnel qui convient à tous les secteurs et les recruteurs",
    features: [
      "Format officiel",
      "Très professionnel",
      "Compatible partout",
    ],
    image: "📋",
  },
  {
    id: "minimal",
    name: "Lettre Minimaliste",
    description: "Un design épuré qui se concentre sur votre message",
    features: [
      "Très lisible",
      "Pas de distractions",
      "Direct et efficace",
    ],
    image: "📄",
  },
];

export default function LetterTemplates() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Modèles de Lettres de Motivation
          </h1>
          <p className="text-xl text-muted-foreground">
            Créez une lettre de motivation percutante avec nos modèles professionnels
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info */}
        <Card className="p-8 mb-12 bg-green-50 border-l-4 border-l-green-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rédigez la lettre parfaite</h2>
          <p className="text-gray-700 mb-4">
            Une bonne lettre de motivation peut faire la différence. Nos modèles vous aident
            à structurer votre message et à présenter vos motivations de manière convaincante.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-gray-900">Complètement gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <span className="text-gray-900">Totalement personnalisable</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💾</span>
              <span className="text-gray-900">Export PDF instantané</span>
            </div>
          </div>
        </Card>

        {/* Modèles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LETTER_TEMPLATES.map((template) => (
            <Card key={template.id} className="hover:shadow-2xl transition overflow-hidden flex flex-col">
              {/* Aperçu visuel */}
              <div className="p-12 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b">
                <span className="text-6xl">{template.image}</span>
              </div>

              {/* Contenu */}
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-muted-foreground mb-6 flex-1">{template.description}</p>

                {/* Caractéristiques */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">Avantages</h4>
                  <ul className="space-y-2">
                    {template.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="h-2 w-2 rounded-full bg-green-600"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => navigate("/letter-generator")}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Créer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Conseils */}
        <Card className="p-12 mt-16 bg-white border-l-4 border-l-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Conseils pour une lettre efficace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">✍️ Structure</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Commencez par votre motivation</li>
                <li>• Mettez en avant vos forces</li>
                <li>• Mentionnez vos réalisations</li>
                <li>• Concluez avec conviction</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">💡 Conseils</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Adaptez à chaque entreprise</li>
                <li>• Soyez authentique</li>
                <li>• Évitez les clichés</li>
                <li>• Relisez-vous attentivement</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="p-12 mt-16 bg-gradient-to-r from-green-600 to-green-700 text-white border-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Créez votre lettre dès maintenant</h2>
            <p className="text-lg text-green-50 mb-8">
              Avec nos modèles, votre lettre de motivation sera professionnelle et percutante
            </p>
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50"
              onClick={() => navigate("/letter-generator")}
            >
              Commencer à rédiger
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
