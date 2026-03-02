import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Code, BarChart2, Palette, ArrowRight, Mail } from "lucide-react";
import { sendInteraction } from "@/lib/analytics";

export default function DigitalServices() {
  const services = [
    {
      id: 'redaction',
      icon: FileText,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      title: 'Rédaction de documents',
      description: 'Business plan, cahiers des charges, études de marché et documents professionnels.',
      href: '/services/redaction-documents',
      event: 'redaction'
    },
    {
      id: 'informatique',
      icon: Code,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      title: 'Conception informatique',
      description: 'Sites web, applications mobiles et solutions logicielles sur mesure.',
      href: '/services/conception-informatique',
      event: 'informatique'
    },
    {
      id: 'plateformes',
      icon: BarChart2,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      title: 'Gestion de plateformes',
      description: 'Administration et animation de vos réseaux sociaux et sites web.',
      href: '/services/gestion-plateformes',
      event: 'digital'
    },
    {
      id: 'graphique',
      icon: Palette,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      title: 'Conception graphique',
      description: 'Logos, chartes graphiques, flyers et supports de communication visuelle.',
      href: '/services/conception-graphique',
      event: 'graphique'
    }
  ];

  return (
    <section id="services-digitaux" className="py-8">
      <div className="space-y-6">
        <div className="space-y-2">
        
          <h2 className="text-3xl font-bold">Nos solutions digitales</h2>
          <p className="text-muted-foreground text-lg">Accéléruz votre transformation numérique avec nos services spécialisés</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id} className={`p-5 relative overflow-hidden transition-all hover:shadow-lg ${service.bgColor}`}>
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${service.color} opacity-10 rounded-full -mr-10 -mt-10`}></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${service.color} text-white mb-3 w-fit`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-base mb-2 flex-1">{service.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  <Button 
                    variant="ghost"
                    size="sm"
                    asChild
                    className="justify-start p-0 h-auto text-primary hover:text-primary hover:bg-transparent"
                    onClick={() => sendInteraction({ service: service.event, event_type: 'view_more', payload: { from: 'digital_services' } })}
                  >
                    <Link to={service.href} className="flex items-center gap-1">
                      En savoir plus
                      <ArrowRight className="h-3 w-3" />
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
