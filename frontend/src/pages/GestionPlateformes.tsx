import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Share2, Users, MessageSquare } from "lucide-react";
import Realizations from "@/components/Realizations";
import DigitalServices from "./services/Digital";
export default function GestionPlateformes() {
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
              Gestion de vos <span className="text-primary">Plateformes Digitales</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Professionnalisez votre présence sur les réseaux sociaux et votre site web
            </p>
          </div>
        </div>
      </section>

      {/* Services Details */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl mx-auto">
          <div className="grid gap-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Nos services incluent :</h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Share2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Gestion des réseaux sociaux</strong> : Animation, modération, stratégie de contenu</span>
                </li>
                <li className="flex gap-3">
                  <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Création de contenu</strong> : Posts, stories, vidéos engageantes</span>
                </li>
                <li className="flex gap-3">
                  <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Community Management</strong> : Interaction avec votre audience</span>
                </li>
                <li className="flex gap-3">
                  <Share2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Administration de site web</strong> : Mise à jour et maintenance régulière</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Avantages de nos services</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Présence en ligne professionnelle et cohérente</li>
                <li>✓ Augmentation de votre visibilité et engagement</li>
                <li>✓ Gestion déléguée et sans stress</li>
                <li>✓ Rapports d'analyse et statistiques réguliers</li>
                <li>✓ Équipe réactive et disponible</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Realizations */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          
          <DigitalServices/>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-primary">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Boostez votre présence digitale
          </h2>
          <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
            <a href="https://wa.me/242123456789">Contactez-nous via WhatsApp</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
