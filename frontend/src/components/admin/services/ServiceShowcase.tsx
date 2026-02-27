/**
 * Services Showcase Component
 * For displaying service catalogs and services to visitors
 * With visibility locking (if catalog is hidden, its services are too)
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, AlertCircle } from 'lucide-react';
import { ServiceCard } from './ServiceCard';

interface Service {
  id: number;
  catalog_id: number;
  name: string;
  description?: string;
  price?: number;
  rating?: number;
  is_promo: boolean;
  promo_text?: string;
  is_visible: boolean;
  image_url?: string;
  brochure_url?: string;
}

interface ServiceCatalog {
  id: number;
  name: string;
  description?: string;
  is_visible: boolean;
  is_featured: boolean;
}

interface ServiceShowcaseProps {
  className?: string;
}

export function ServiceShowcase({ className = '' }: ServiceShowcaseProps) {
  const [catalogs, setCatalogs] = useState<ServiceCatalog[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCatalog, setActiveCatalog] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch visible catalogs and services
      const [catalogsRes, servicesRes] = await Promise.all([
        fetch('/api/services/catalogs'),
        fetch('/api/services?visible_only=true')
      ]);

      if (!catalogsRes.ok || !servicesRes.ok) {
        throw new Error('Failed to fetch services data');
      }

      const catalogsData: ServiceCatalog[] = await catalogsRes.json();
      const servicesData: Service[] = await servicesRes.json();

      setCatalogs(catalogsData);
      setServices(servicesData);

      // Set first visible catalog as active
      if (catalogsData.length > 0) {
        setActiveCatalog(catalogsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Impossible de charger les services. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-gray-600">Chargement des services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Erreur</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (catalogs.length === 0) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="p-8 text-center">
          <p className="text-gray-600">Aucun service disponible pour le moment.</p>
        </Card>
      </div>
    );
  }

  // Get services for active catalog (with visibility locking)
  const activeCatalogServices = services.filter(
    s => s.catalog_id === activeCatalog && s.is_visible
  );

  // Featured catalogs
  const featuredCatalogs = catalogs.filter(c => c.is_featured);
  const regularCatalogs = catalogs.filter(c => !c.is_featured);

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Nos Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez notre gamme complète de services conçus pour accompagner votre développement professionnel.
          </p>
        </div>

        {/* Featured Catalogs Section */}
        {featuredCatalogs.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Services en Vedette</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredCatalogs.map(catalog => {
                const catalogServices = services.filter(
                  s => s.catalog_id === catalog.id && s.is_visible
                );
                return (
                  <div
                    key={catalog.id}
                    className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200"
                  >
                    <h4 className="font-bold text-lg mb-2">{catalog.name}</h4>
                    {catalog.description && (
                      <p className="text-sm text-gray-600 mb-3">{catalog.description}</p>
                    )}
                    <p className="text-sm font-medium text-indigo-600">
                      {catalogServices.length} service{catalogServices.length > 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Catalog Tabs */}
        {catalogs.length > 1 ? (
          <Tabs
            value={activeCatalog?.toString() || ''}
            onValueChange={(value) => setActiveCatalog(parseInt(value))}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
              {catalogs.map(catalog => (
                <TabsTrigger
                  key={catalog.id}
                  value={catalog.id.toString()}
                  className="text-xs md:text-sm"
                >
                  {catalog.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {catalogs.map(catalog => (
              <TabsContent key={catalog.id} value={catalog.id.toString()}>
                {activeCatalogServices.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-gray-600">
                      Aucun service disponible dans cette catégorie.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCatalogServices.map(service => (
                      <ServiceCard
                        key={service.id}
                        id={service.id}
                        name={service.name}
                        description={service.description}
                        price={service.price}
                        rating={service.rating}
                        is_promo={service.is_promo}
                        promo_text={service.promo_text}
                        image_url={service.image_url}
                        brochure_url={service.brochure_url}
                        catalog_name={catalog.name}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          // Single catalog view
          <div>
            {catalogs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{catalogs[0].name}</h3>
                {catalogs[0].description && (
                  <p className="text-gray-600">{catalogs[0].description}</p>
                )}
              </div>
            )}

            {activeCatalogServices.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">
                  Aucun service disponible pour le moment.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCatalogServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    name={service.name}
                    description={service.description}
                    price={service.price}
                    rating={service.rating}
                    is_promo={service.is_promo}
                    promo_text={service.promo_text}
                    image_url={service.image_url}
                    brochure_url={service.brochure_url}
                    catalog_name={catalogs[0]?.name}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
