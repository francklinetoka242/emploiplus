import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Catalog {
  id: number;
  name: string;
  description?: string;
}

interface Service {
  id: number;
  catalog_id: number;
  name: string;
  description?: string;
  price?: string;
  is_promo?: boolean;
  promo_text?: string;
}

export default function ServicesCatalogList() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await api.getServiceCatalogs();
        setCatalogs(Array.isArray(cats) ? cats : []);
        
        const servs = await api.getServices();
        const servsList = servs?.data || [];
        setServices(Array.isArray(servsList) ? servsList : []);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredServices = selectedCatalogId 
    ? services.filter(s => s.catalog_id === selectedCatalogId)
    : services;

  if (loading) return <div className="p-4 text-center">Chargement...</div>;

  return (
    <div className="py-6">
      {/* Filtres par catégorie */}
      <div className="mb-6 flex flex-wrap gap-2 px-4">
        <button
          onClick={() => setSelectedCatalogId(null)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            selectedCatalogId === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Tous ({services.length})
        </button>
        {catalogs.map(cat => {
          const count = services.filter(s => s.catalog_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatalogId(cat.id)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                selectedCatalogId === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Grille de services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {filteredServices.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Aucun service disponible
          </div>
        ) : (
          filteredServices.map(service => (
            <div
              key={service.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-sm flex-1">
                  {service.name}
                </h3>
                {service.is_promo && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                    Promo
                  </span>
                )}
              </div>

              {service.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {service.description}
                </p>
              )}

              <div className="flex justify-between items-center">
                {service.price && (
                  <span className="text-sm font-medium text-gray-900">
                    {service.price}
                  </span>
                )}
                {service.promo_text && (
                  <span className="text-xs text-red-600 font-medium">
                    {service.promo_text}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
