import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { sendInteraction } from "@/lib/analytics";

interface CatalogItem {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  image_url?: string;
  is_new?: boolean;
  promotion?: string | null;
}

export default function ServiceCatalogs({ category }: { category: string }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/service-catalogs?category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((data) => setItems(data || []))
      .catch((err) => console.error("Fetch catalogs error:", err))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) return <div className="text-center py-8">Chargement des offres...</div>;

  if (!items || items.length === 0) return (
    <Card className="p-8 text-center">
      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Aucune offre pour le moment.</p>
    </Card>
  );

  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">Nos offres & tarifs</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.id} className="p-6">
              <div className="flex items-start gap-4">
                {it.image_url ? (
                  <img src={it.image_url} alt={it.name} className="h-20 w-28 object-cover rounded" />
                ) : (
                  <div className="h-20 w-28 bg-gray-100 rounded flex items-center justify-center text-sm">Image</div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{it.name}</h3>
                    {it.is_new && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Nouveau</span>}
                    {it.promotion && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Promo</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{it.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-bold">{it.price ? it.price.toLocaleString() + ' FCFA' : 'Sur devis'}</div>
                    <Button size="sm" onClick={() => { sendInteraction({ service: category, event_type: 'view_offer', payload: { id: it.id, name: it.name } }); window.location.href = categoryToRoute(category); }}>
                      En savoir plus
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function categoryToRoute(cat: string) {
  switch (cat) {
    case 'redaction': return '/services/redaction-documents';
    case 'informatique': return '/services/conception-informatique';
    case 'digital': return '/services/gestion-plateformes';
    case 'graphique': return '/services/conception-graphique';
    default: return '/services';
  }
}


