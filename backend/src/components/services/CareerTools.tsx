import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mic, BarChart3, ArrowRight, Zap } from "lucide-react";

export default function CareerTools() {
  const tools = [
    {
      id: 'interview',
      icon: Mic,
      title: 'Simulateur d\'entretien',
      description: 'Pratiquez vos entretiens avec un simulateur interactif et recevez des retours personnalisés.',
      cta: 'Démarrer la simulation',
      href: '/simulateur-entretien'
    },
    {
      id: 'skills',
      icon: BarChart3,
      title: 'Tests de compétence',
      description: 'Évaluez vos compétences avec nos tests spécialisés et obtenez des certifications reconnues.',
      cta: 'Commencer un test',
      href: '/test-competence'
    }
  ];

  return (
    <section id="outils-carriere" className="py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          
          <h2 className="text-3xl font-bold">Préparez-vous aux entretiens</h2>
          <p className="text-muted-foreground text-lg">Entraînez-vous et évaluez vos compétences avec nos outils interactifs</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.id} className="p-6 transition-all hover:shadow-lg border border-gray-200">
                <div className="relative z-10">
                  <div className="inline-flex p-3 rounded-lg bg-gray-100 text-gray-700 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {tool.description}
                  </p>
                  <Button 
                    asChild 
                    className="bg-primary text-white hover:bg-primary/90 w-full"
                  >
                    <Link to={tool.href} className="flex items-center justify-center gap-2">
                      {tool.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
