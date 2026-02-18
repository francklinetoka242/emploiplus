import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Users,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

import FAQ from "@/components/FAQ";
import TestimonialSection from "@/components/TestimonialSection";
import aboutTeamImage from "@/assets/logo-about-team.png";

const About = () => {
  return (
    <div className="flex flex-col">
      {/* Notre Histoire */}
      <section className="py-16 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Notre histoire</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Emploi+ est né de la volonté de révolutionner le marché de
                  l'emploi en République du Congo et dans la sous-région. Face
                  aux défis que rencontrent les candidats dans leur recherche
                  d'opportunités et les entreprises dans leur quête de talents
                  qualifiés, nous avons créé une solution innovante et adaptée
                  aux réalités locales.
                </p>
                <p>
                  Notre plateforme combine technologie moderne et connaissance
                  approfondie du marché du travail congolais pour offrir une
                  expérience unique tant aux chercheurs d'emploi qu'aux
                  recruteurs.
                </p>
                <p>
                  Aujourd'hui, Emploi+ est la référence pour le recrutement et la
                  formation professionnelle, avec des milliers d'utilisateurs
                  actifs et des centaines d'entreprises partenaires.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  src={aboutTeamImage}
                  alt="Équipe Emploi+"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Valeurs */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-8 space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary mx-auto">
                <Target className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Notre Mission</h3>
              <p className="text-muted-foreground">
                Faciliter l'accès à l'emploi et aux formations pour tous, tout
                en aidant les entreprises à trouver les meilleurs talents.
              </p>
            </Card>

            <Card className="p-8 space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-secondary mx-auto">
                <Eye className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Notre Vision</h3>
              <p className="text-muted-foreground">
                Devenir la plateforme de référence pour l'emploi et la formation
                en Afrique centrale, reconnue pour son innovation et son impact.
              </p>
            </Card>

            <Card className="p-8 space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary mx-auto">
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Nos Valeurs</h3>
              <p className="text-muted-foreground">
                Excellence, intégrité, innovation et engagement envers le
                développement professionnel de notre communauté.
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Témoignages dynamiques */}
      <TestimonialSection />

      {/* FAQ (si tu veux la garder sur la page À propos) */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <FAQ />
        </div>
      </section>

      {/* Communauté */}
      <section className="py-16 bg-background">
        <div className="container">
          <Card className="p-12 text-center space-y-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary mx-auto">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold">Rejoignez notre communauté</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Suivez-nous sur les réseaux sociaux pour rester informé des
              dernières opportunités, conseils carrière et actualités.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Nous contacter
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;