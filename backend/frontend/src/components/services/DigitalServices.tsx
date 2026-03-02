import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Code, BarChart2, Palette, ArrowRight, Mail, Loader } from "lucide-react";
import { sendInteraction } from "@/lib/analytics";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface ServiceItem {
  id: string | number;
  title?: string;
  name?: string;
  icon?: string;
  color?: string;
  bgColor?: string;
  description?: string;
  details?: string;
  price?: number;
  href?: string;
  event?: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'redaction',
    icon: 'FileText',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    title: 'Rédaction de documents',
    description: 'Business plan, cahiers des charges, études de marché et documents professionnels.',
    href: '/services/redaction-documents',
    event: 'redaction'
  },
  {
    id: 'informatique',
    icon: 'Code',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    title: 'Conception informatique',
    description: 'Sites web, applications mobiles et solutions logicielles sur mesure.',
    href: '/services/conception-informatique',
    event: 'informatique'
  },
  {
    id: 'plateformes',
    icon: 'BarChart2',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    title: 'Gestion de plateformes',
    description: 'Administration et animation de vos réseaux sociaux et sites web.',
    href: '/services/gestion-plateformes',
    event: 'digital'
  },
  {
    id: 'graphique',
    icon: 'Palette',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    title: 'Conception graphique',
    description: 'Logos, chartes graphiques, flyers et supports de communication visuelle.',
    href: '/services/conception-graphique',
    event: 'graphique'
  }
];

const ICON_MAP: Record<string, any> = {
  FileText,
  Code,
  BarChart2,
  Palette,
};

export default function DigitalServices() {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Try to fetch published services from API
        const response = await api.getServices({ category: 'Services Numériques', published: true });
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          // Map API services to display format
          const apiServices = response.data.map((service: any, index: number) => {
            const defaultService = DEFAULT_SERVICES[index] || {};
            return {
              id: service.id || index,
              title: service.title || service.name || defaultService.title,
              description: service.description || service.details || defaultService.description,
              color: defaultService.color,
              bgColor: defaultService.bgColor,
              icon: defaultService.icon,
              href: defaultService.href,
              event: defaultService.event,
              price: service.price,
            };
          });
          setServices(apiServices);
        }
      } catch (error) {
        console.warn('Failed to fetch services from API, using defaults:', error);
        // Keep default services on error
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section id="services-digitaux" className="py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Nos solutions digitales</h2>
          <p className="text-muted-foreground text-lg">Accéléruz votre transformation numérique avec nos services spécialisés</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const IconComponent = ICON_MAP[service.icon || 'FileText'] || FileText;
              return (
                <Card key={service.id} className={`p-5 relative overflow-hidden transition-all hover:shadow-lg ${service.bgColor}`}>
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${service.color} opacity-10 rounded-full -mr-10 -mt-10`}></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${service.color} text-white mb-3 w-fit`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-base mb-2 flex-1">{service.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    {service.href ? (
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
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
