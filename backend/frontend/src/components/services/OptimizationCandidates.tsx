import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, FileText, Mail, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function OptimizationCandidates() {
  const cards = [
    {
      id: 'cv',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      title: 'Créer un CV professionnel',
      description: 'Créez votre CV en ligne et générez-le en PDF ou Word avec nos modèles professionnels.',
      actions: [
        { label: '✏️ Créer mon CV', href: '/cv-generator', primary: true },
        { label: '📋 Voir les modèles', href: '/cv-modeles', primary: false },
      ]
    },
    {
      id: 'letter',
      icon: Mail,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      title: 'Lettre de motivation',
      description: 'Rédigez une lettre de motivation impactante avec nos outils et modèles personnalisables.',
      actions: [
        { label: '✍️ Créer ma lettre', href: '/letter-generator', primary: true },
        { label: '📄 Voir les modèles', href: '/letter-modeles', primary: false },
      ]
    },
    {
      id: 'assistance',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      title: 'Assistance par experts',
      description: 'Nos experts en recrutement vous accompagnent pour optimiser vos documents et vos chances.',
      actions: [
        { label: '🎯 En savoir plus', href: '/services/conseil-recrutement', primary: true },
      ]
    }
  ];

  return (
    <section id="optimisation-candidature" className="py-8">
      <div className="space-y-6">
        <div className="space-y-2">
         
          <h2 className="text-3xl font-bold">Démarquez-vous auprès des recruteurs</h2>
          <p className="text-muted-foreground text-lg">Créez des documents professionnels et impactants pour maximiser vos chances</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className={`p-6 relative overflow-hidden transition-all hover:shadow-lg ${item.bgColor}`}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-full -mr-12 -mt-12`}></div>
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${item.color} text-white mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                    {item.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {item.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        asChild
                        variant={action.primary ? "default" : "outline"}
                        size="sm"
                        className={action.primary ? `bg-gradient-to-r ${item.color} text-white hover:opacity-90` : ''}
                      >
                        <Link to={action.href} className="flex items-center gap-1">
                          {action.label}
                          {action.primary && <ArrowRight className="h-3 w-3" />}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
