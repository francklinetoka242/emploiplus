import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Download } from "lucide-react";
import Realizations from "@/components/Realizations";
import RedactionServices from "./services/Redaction";

export default function RedactionDocuments() {
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
              Rédaction de <span className="text-primary">Documents Stratégiques</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Donnez forme à vos idées avec des documents professionnels et persuasifs
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
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Business Plans</strong> : Plans d'affaires détaillés pour votre projet ou entreprise</span>
                </li>
                <li className="flex gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Cahiers des charges</strong> : Spécifications techniques complètes pour vos projets</span>
                </li>
                <li className="flex gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Études de marché</strong> : Analyses approfondies de vos marchés cibles</span>
                </li>
                <li className="flex gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Documents professionnels</strong> : Propositions, rapports et mémorandums</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Pourquoi nous choisir ?</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Équipe d'experts en rédaction professionnelle</li>
                <li>✓ Documents adaptés à vos spécificités</li>
                <li>✓ Respect des délais et des budgets</li>
                <li>✓ Approche stratégique et personnalisée</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Realizations */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <RedactionServices/>
        </div>
      </section>


      {/* CTA */}
      <section className="py-16 bg-gradient-primary">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Prêt à démarrer votre projet ?
          </h2>
          <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
            <a href="https://wa.me/242123456789">Contactez-nous via WhatsApp</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
