import { Card } from "@/components/ui/card";
import React from "react";
const FAQ = React.lazy(() => import("@/components/FAQ"));
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";
import { CheckCircle, ArrowRight, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SERVICES = [
  {
    id: "business-plan",
    name: "Business Plan",
    description: "Structurez votre projet avec un business plan professionnel",
    price: "50000 CFA",
    features: [
      "Analyse de marché",
      "Stratégie commerciale",
      "Prévisions financières",
      "Plan opérationnel",
    ],
    icon: "📊",
    importance:
      "Un business plan solide est essentiel pour convaincre les investisseurs et structurer votre entreprise. Il montre votre sérieux et votre vision à long terme.",
  },
  {
    id: "cahier-charges",
    name: "Cahier des Charges",
    description:
      "Définissez précisément les spécifications de votre projet informatique",
    price: "35000 CFA",
    features: [
      "Analyse des besoins",
      "Description détaillée",
      "Critères d'acceptation",
      "Planning détaillé",
    ],
    icon: "📋",
    importance:
      "Un cahier des charges clair évite les malentendus et les dépassements budgétaires. Il est la base d'un projet informatique réussi.",
  },
  {
    id: "etude-marche",
    name: "Étude de Marché",
    description: "Analysez votre marché pour prendre les bonnes décisions",
    price: "45000 CFA",
    features: [
      "Analyse concurrentielle",
      "Étude des tendances",
      "Segmentation client",
      "Recommandations stratégiques",
    ],
    icon: "📈",
    importance:
      "L'étude de marché vous permet de comprendre vos clients, vos concurrents et les opportunités. Elle réduit les risques d'échec.",
  },
  {
    id: "documents-professionnels",
    name: "Documents Professionnels",
    description: "Tous les documents nécessaires pour votre entreprise",
    price: "20000 CFA",
    features: [
      "Statuts juridiques",
      "Contrats types",
      "Politiques internes",
      "Procédures documentées",
    ],
    icon: "📄",
    importance:
      "Les documents professionnels vous protègent légalement et structurent votre organisation. Ils sont obligatoires pour fonctionner légalement.",
  },
];

export default function DocumentService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-10 w-10 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Rédaction de Documents Stratégiques</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Des documents professionnels pour structurer et développer votre entreprise
          </p>
        </div>
      </div>
      <div className="container mt-6">
        <Breadcrumb items={[{ label: 'Accueil', to: '/' }, { label: 'Services', to: '/services' }, { label: 'Rédaction de Documents' }]} />
      </div>

        {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pourquoi ces services */}
        <Card className="p-12 mb-12 bg-orange-50 border-l-4 border-l-orange-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pourquoi ces services sont cruciaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Clarté</h3>
              <p className="text-sm text-gray-700">
                Définissez vos objectifs et vos stratégies de manière précise
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-bold text-gray-900 mb-2">Protection</h3>
              <p className="text-sm text-gray-700">
                Protégez-vous légalement et administrativement
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">Financement</h3>
              <p className="text-sm text-gray-700">
                Convaincez les investisseurs et les bailleurs de fonds
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Suivi</h3>
              <p className="text-sm text-gray-700">
                Mesurez vos progrès et ajustez votre stratégie
              </p>
            </div>
          </div>
        </Card>

        {/* Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Nos Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((service) => (
              <Card key={service.id} className="p-8 hover:shadow-2xl transition flex flex-col">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-4xl mb-3">{service.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
                    <p className="text-muted-foreground mt-2">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600">{service.price}</p>
                  </div>
                </div>

                {/* Importance */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-600">
                  <p className="text-sm text-gray-700">
                    <strong>Pourquoi c'est important :</strong> {service.importance}
                  </p>
                </div>

                {/* Caractéristiques */}
                <div className="mb-8 flex-1">
                  <h4 className="font-semibold text-gray-900 mb-4">Ce que vous recevez</h4>
                  <div className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => navigate(`/contact?service=${service.id}`)}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Demander ce service
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Process */}
        <Card className="p-12 mb-12 bg-white border-l-4 border-l-orange-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Notre processus</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Consultation", desc: "Nous comprenons vos besoins" },
              { step: 2, title: "Analyse", desc: "Étude approfondie de votre projet" },
              { step: 3, title: "Rédaction", desc: "Création du document" },
              { step: 4, title: "Livraison", desc: "Document finalisé et approuvé" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ component (managed via admin) */}
        <Card className="p-12 bg-gray-50 border-l-4 border-l-orange-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Questions fréquentes</h2>
          <div>
            {/* Lazy load FAQ component to keep bundle small */}
            <React.Suspense fallback={<p className="text-muted-foreground">Chargement...</p>}>
              <FAQ />
            </React.Suspense>
          </div>
        </Card>

        {/* CTA Final */}
        <Card className="p-12 mt-12 bg-gradient-to-r from-orange-600 to-orange-700 text-white border-none text-center">
          <h2 className="text-3xl font-bold mb-4">Structurez votre entreprise dès aujourd'hui</h2>
          <p className="text-lg text-orange-50 mb-8">
            Nos experts vous aideront à créer les documents clés pour réussir
          </p>
          <Button
            size="lg"
            className="bg-white text-orange-600 hover:bg-orange-50"
            onClick={() => navigate("/contact")}
          >
            Demander un devis gratuit
          </Button>
        </Card>
      </div>
    </div>
  );
}
