import React, { useEffect, useState } from 'react';
import PublicServiceCard from './PublicServiceCard';

interface Service {
  id: number;
  catalog_id: number;
  name: string;
  description?: string;
  price?: number | null;
  rating?: number | null;
  is_promo?: boolean;
  promo_text?: string | null;
  image_url?: string | null;
  brochure_url?: string | null;
}

interface Catalog {
  id: number;
  name: string;
  is_visible: boolean;
}

export default function ServicesList({ catalogId }: { catalogId?: number }) {
  const [services, setServices] = useState<Service[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = catalogId ? `?catalog_id=${catalogId}` : '';

    Promise.all([
      fetch('/api/services' + q).then(r => r.json()),
      fetch('/api/services/catalogs').then(r => r.json())
    ])
      .then(([servicesData, catalogsData]) => {
        setServices(servicesData || []);
        setCatalogs(catalogsData || []);
      })
      .catch(err => console.error('Failed to load services:', err))
      .finally(() => setLoading(false));
  }, [catalogId]);

  if (loading) return <div className="text-center py-8">Chargement des services...</div>;

  // Build catalog map
  const catalogMap = new Map<number, Catalog>();
  catalogs.forEach((c) => catalogMap.set(c.id, c));

  // Filter out services whose catalog is hidden
  const visibleServices = services.filter(s => {
    const catalog = catalogMap.get(s.catalog_id);
    if (!catalog) return false;
    return catalog.is_visible && s.is_visible !== false; // service default visible
  });

  if (visibleServices.length === 0) return (
    <div className="text-center py-8">Aucun service disponible pour le moment.</div>
  );

  return (
    <section className="py-8">
      <div className="container grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleServices.map(s => (
          <PublicServiceCard
            key={s.id}
            id={s.id}
            name={s.name}
            description={s.description}
            price={s.price}
            rating={s.rating}
            is_promo={s.is_promo}
            promo_text={s.promo_text}
            image_url={s.image_url}
            brochure_url={s.brochure_url}
            catalog_name={catalogMap.get(s.catalog_id)?.name}
          />
        ))}
      </div>
    </section>
  );
}
