import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, FileText, Code, Palette, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function OptimizationCompanies() {
  return (
    <section id="services-entreprise" className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-bold">Services <span className="text-secondary">Numériques</span></h2>
          <p className="text-muted-foreground">Optimisez votre présence et développez votre activité</p>
        </div>

        <div className="space-y-12">
          {/* Section 1: Gestion Services Numériques */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Gestion des Services Numériques & Documents Stratégiques
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <h4 className="text-xl font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Business Plan Professionnel
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Structurez votre projet avec un business plan solide. Analysez votre marché, définissez vos stratégies et présentez vos prévisions financières pour convaincre les investisseurs.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild className="bg-gradient-primary">
                    <Link to="/services/redaction-documents">En savoir plus</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Cahiers des Charges
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Créez des cahiers des charges détaillés et professionnels pour vos projets. Définissez précisément les exigences, les livrables et les délais avec vos prestataires.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild className="bg-gradient-primary">
                    <Link to="/services/redaction-documents">En savoir plus</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents Professionnels
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Tous les documents nécessaires pour votre entreprise : statuts juridiques, contrats types, politiques internes, procédures documentées et plus.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild className="bg-gradient-primary">
                    <Link to="/services/redaction-documents">En savoir plus</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Section 2: Solutions Informatiques */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              Solutions Informatiques & Numériques
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <h4 className="text-xl font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Sites Web Professionnels
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Développement de sites web modernes, responsifs et optimisés pour les moteurs de recherche. Transformez votre présence en ligne avec une plateforme adaptée à vos objectifs.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild className="bg-gradient-primary">
                    <Link to="/services/conception-informatique">En savoir plus</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-xl font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Applications Mobiles
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Créez des applications mobiles innovantes et performantes. Atteignez vos clients sur iOS et Android avec des solutions sur mesure et fiables.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild className="bg-gradient-primary">
                    <Link to="/services/conception-informatique">En savoir plus</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-xl font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Solutions Logicielles
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Implémentez des systèmes informatiques sur mesure, des plateformes intégrées et des solutions logicielles personnalisées pour optimiser vos opérations.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild className="bg-gradient-primary">
                    <Link to="/services/conception-informatique">En savoir plus</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Section 3: Services Graphiques & Communication */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              Design Graphique & Communication
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <h4 className="text-xl font-semibold flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Logos & Identité Visuelle
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Créez une identité visuelle forte et mémorable. Nos designers conçoivent des logos professionnels et des systèmes visuels cohérents pour votre marque.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild className="bg-gradient-secondary">
                    <Link to="/services/conception-graphique">Créer</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-xl font-semibold flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Flyers & Supports Imprimés
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Conception de flyers, brochures, cartes de visite et supports de communication professionnels. Impressionnez vos clients avec un design soigné et impactant.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild className="bg-gradient-secondary">
                    <Link to="/services/conception-graphique">Créer</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-xl font-semibold flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Graphiques & Illustrations
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Création de graphiques professionnels, infographies et illustrations personnalisées pour enrichir vos contenus et communications visuelles.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild className="bg-gradient-secondary">
                    <Link to="/services/conception-graphique">Créer</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
