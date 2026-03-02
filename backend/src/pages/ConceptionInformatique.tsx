import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Code, Smartphone, Monitor } from "lucide-react";
import Realizations from "@/components/Realizations";
import InformatiqueServices from "./services/Informatique"; 


export default function ConceptionInformatique() {
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
              Conception de <span className="text-primary">Systèmes Informatiques</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Transformez votre vision en solutions numériques performantes
            </p>
          </div>
        </div>
      </section>

      {/* Services Details */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl mx-auto">
          <div className="grid gap-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Nos compétences :</h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Monitor className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Sites Web</strong> : Sites vitrines, e-commerce, portails d'information</span>
                </li>
                <li className="flex gap-3">
                  <Smartphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Applications Mobiles</strong> : Apps iOS et Android natifs et cross-platform</span>
                </li>
                <li className="flex gap-3">
                  <Code className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Solutions Logicielles</strong> : ERP, CRM, systèmes de gestion sur mesure</span>
                </li>
                <li className="flex gap-3">
                  <Code className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Intégrations</strong> : Connexion avec vos systèmes existants</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Notre approche</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Analyse des besoins et études de faisabilité</li>
                <li>✓ Conception d'architecture et d'interface</li>
                <li>✓ Développement agile et itératif</li>
                <li>✓ Tests, déploiement et support technique</li>
                <li>✓ Formation et documentation complète</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

  

 {/* Realizations */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <InformatiqueServices/>
        </div>
      </section>


      {/* CTA */}
      <section className="py-16 bg-gradient-primary">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Avez-vous un projet informatique ?
          </h2>
          <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
            <a href="https://wa.me/242123456789">Contactez-nous via WhatsApp</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
