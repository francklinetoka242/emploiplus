import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { sendInteraction } from "@/lib/analytics";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  is_featured: boolean;
}

interface Service {
  id: number;
  catalog_id: number;
  name: string;
  description: string;
  price?: string;
  duration?: string;
  is_featured: boolean;
}

export default function DigitalServices() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, servicesRes] = await Promise.all([
          api.getServiceCategories(),
          api.getServices?.() || Promise.resolve({ data: [] })
        ]);
        
        const categoriesData = categoriesRes?.data || categoriesRes || [];
        const servicesData = servicesRes?.data || servicesRes || [];
        
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Impossible de charger les services');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Color mapping for categories
  const colorMap: Record<number, { color: string; bgColor: string }> = {
    1: { color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
    2: { color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50' },
    3: { color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50' },
    4: { color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50' },
    5: { color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
  };

  const getColorForCategory = (categoryId: number) => {
    return colorMap[categoryId] || { color: 'from-slate-500 to-slate-600', bgColor: 'bg-slate-50' };
  };

  // Group services by category
  const groupedServices = categories.map((category) => ({
    category,
    services: services.filter((s) => s.catalog_id === category.id),
  }));

  return (
    <section id="services-digitaux" className="py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Nos services par catégorie</h2>
          <p className="text-muted-foreground text-lg">Découvrez notre gamme complète de services professionnels</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
            <p className="text-slate-600">Aucune catégorie de service disponible.</p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {groupedServices.map((group) => {
              const colors = getColorForCategory(group.category.id);
              
              return (
                <div key={group.category.id} className={`${colors.bgColor} rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow`}>
                  {/* Category Header */}
                  <div className={`bg-gradient-to-br ${colors.color} text-white p-6 flex items-center gap-4`}>
                    <div className="text-4xl">{group.category.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{group.category.name}</h3>
                      <p className="text-sm text-white/90">{group.category.description}</p>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="flex-1 p-4">
                    {group.services.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-600 text-sm">Aucun service disponible pour cette catégorie.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {group.services.map((service) => (
                          <div key={service.id} className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-300 transition-colors">
                            <h4 className="font-bold text-sm text-slate-900 mb-1">{service.name}</h4>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                              {service.description}
                            </p>
                            {service.price && (
                              <p className="text-sm font-semibold text-slate-900 mb-1">
                                {service.price} USD
                              </p>
                            )}
                            {service.duration && (
                              <p className="text-xs text-slate-600 mb-2">
                                {service.duration}
                              </p>
                            )}
                            <Button 
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs"
                              onClick={() => sendInteraction({ service: group.category.name, event_type: 'view_service', payload: { service_id: service.id } })}
                            >
                              <span className="flex items-center gap-1">
                                En savoir plus
                                <ArrowRight className="h-3 w-3" />
                              </span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
