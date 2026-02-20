import { useEffect, useState } from "react";
import { buildApiUrl } from "@/lib/headers";

interface Publication {
  id: number;
  author_id?: number;
  content: string;
  visibility?: string;
  hashtags?: string;
  image_url?: string | null;
  created_at?: string;
}

export default function Publications() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const res = await fetch(buildApiUrl('/publications'));
        if (!res.ok) {
          console.error('Failed to fetch publications', res.status);
          setItems([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(data);
        } else if (data && Array.isArray((data as any).publications)) {
          setItems((data as any).publications);
        } else {
          console.error('Unexpected publications response shape', data);
          setItems([]);
        }
      } catch (err) {
        console.error('Error fetching publications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (loading) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-background">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Actualités & Publications</h2>
          <p className="text-muted-foreground">Dernières nouvelles et annonces</p>
        </div>

        <div className="space-y-6">
          {items.map((p) => (
            <article key={p.id} className="p-6 border rounded-lg bg-white/50">
              {p.image_url && (
                <div className="mb-4">
                  <img src={p.image_url} alt="publication" className="w-full h-48 object-cover rounded-md" />
                </div>
              )}
              <div className="text-sm text-muted-foreground mb-2">{new Date(p.created_at || '').toLocaleString()}</div>
              <div className="prose max-w-none">
                <p>{p.content}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
