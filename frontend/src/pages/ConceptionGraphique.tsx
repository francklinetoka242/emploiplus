import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Palette, Pencil, Layout } from "lucide-react";
import Realizations from "@/components/Realizations";
import GraphiqueServices from "./services/Graphique";
export default function ConceptionGraphique() {
  return (
    <div className="flex flex-col">
      {/* Back Button */}
      <section className="py-4 bg-background border-b">
        <div className="container">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/services">
              <ArrowLeft className="h-4 w-4" />
              Retour aux services
            </Link>
          </Button>
        </div>
      </section>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">
              Conception <span className="text-primary">Graphique & Design</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Donnez une identité visuelle unique et mémorable à votre marque
            </p>
          </div>
        </div>
      </section>

      {/* Services Details */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl mx-auto">
          <div className="grid gap-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Nos créations incluent :</h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Palette className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Logos et identités visuelles</strong> : Conception professionnelle de votre marque</span>
                </li>
                <li className="flex gap-3">
                  <Layout className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Chartes graphiques</strong> : Guides complets pour une cohérence visuelle</span>
                </li>
                <li className="flex gap-3">
                  <Pencil className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Flyers et brochures</strong> : Designs impactants pour vos campagnes</span>
                </li>
                <li className="flex gap-3">
                  <Palette className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Supports de communication</strong> : Cartes de visite, affiches, bannières</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Pourquoi investir dans le design ?</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Première impression professionnelle et impactante</li>
                <li>✓ Différenciation face à la concurrence</li>
                <li>✓ Renforcement de la reconnaissance de marque</li>
                <li>✓ Augmentation de la crédibilité et confiance</li>
                <li>✓ Meilleur ROI sur vos investissements marketing</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Realizations */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          
          <GraphiqueServices/>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-primary">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Créons ensemble votre identité visuelle
          </h2>
          <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
            <a href="https://wa.me/242123456789">Contactez-nous via WhatsApp</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
