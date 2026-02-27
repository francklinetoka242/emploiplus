// src/pages/services/Graphique.tsx
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, ExternalLink } from "lucide-react";
import { useState } from "react";
import ServiceCatalogs from "@/components/ServiceCatalogs";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  category: "graphique";
}

const GraphiqueServices = () => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", "graphique"],
    queryFn: async () => {
      const res = await fetch("/api/service-catalogs?category=graphique");
      return res.json();
    },
  });

  return (
    <div className="container py-12 max-w-7xl mx-auto">

      <hr className="py-12"/>
      
      {/* En-tête */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Palette className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold">Nos Catalogues</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Conception créative, logos, branding et identité visuelle professionnelle pour votre marque
        </p>
      </div>

      {/* Grille des services */}
      {isLoading ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-32">
          <Palette className="h-32 w-32 mx-auto text-gray-300 mb-8" />
          <p className="text-2xl text-muted-foreground">Aucun service disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {services.map((service: ServiceItem) => (
            <Card
              key={service.id}
              className="overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col"
              onClick={() => setSelectedService(service)}
            >
              {service.image_url && (
                <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                <p className="text-sm text-muted-foreground flex-1">{service.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  {service.price && (
                    <span className="text-lg font-bold text-primary">
                      {service.price.toLocaleString()} FCFA
                    </span>
                  )}
                  <Button variant="outline" size="sm">
                    En savoir plus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de détails */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold">{selectedService.name}</h2>
              <button
                onClick={() => setSelectedService(null)}
                className="text-2xl font-bold text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            {selectedService.image_url && (
              <img
                src={selectedService.image_url}
                alt={selectedService.name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <p className="text-gray-600 mb-6 leading-relaxed">{selectedService.description}</p>
            {selectedService.price && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">Prix</p>
                <p className="text-2xl font-bold text-primary">
                  {selectedService.price.toLocaleString()} FCFA
                </p>
              </div>
            )}
            <Button className="w-full" size="lg">
              <ExternalLink className="mr-2 h-5 w-5" />
              Commander maintenant
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GraphiqueServices;

// Dynamic catalogs for Graphique services
import React from "react";
export const GraphiqueCatalogsWrapper: React.FC = () => (
  <section className="py-8 bg-background">
    <div className="container max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Offres & Tarifs</h2>
      <ServiceCatalogs category="graphique" />
    </div>
  </section>
);
