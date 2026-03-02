import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface Portfolio {
  id: number;
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  service_category: string;
  featured: boolean;
}

interface RealizationsProps {
  serviceCategory?: string;
}

export default function Realizations({ serviceCategory }: RealizationsProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const url = serviceCategory ? `/api/portfolios?service=${encodeURIComponent(serviceCategory)}` : "/api/portfolios";
        const res = await fetch(url);
        const data = await res.json();
        setPortfolios(data);
      } catch (err) {
        console.error("Error fetching portfolios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, [serviceCategory]);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-muted-foreground">Chargement des réalisations...</p>
          </div>
        </div>
      </section>
    );
  }

  // If there are no portfolios, render nothing (invisible component)
  if (!loading && portfolios.length === 0) return null;

  const featuredPortfolios = portfolios.filter((p) => p.featured).slice(0, 3);
  const otherPortfolios = portfolios.filter((p) => !p.featured).slice(0, 6);
  const displayedPortfolios = [...featuredPortfolios, ...otherPortfolios];

  return (
    <section className="py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nos Réalisations</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les projets que nous avons réalisés pour nos clients
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedPortfolios.map((portfolio) => (
            <Card
              key={portfolio.id}
              className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              onClick={() => portfolio.project_url && window.open(portfolio.project_url, "_blank")}
            >
              {portfolio.image_url && (
                <div className="h-48 bg-muted overflow-hidden relative">
                  <img
                    src={portfolio.image_url}
                    alt={portfolio.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {portfolio.project_url && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold line-clamp-2">{portfolio.title}</h3>
                  {portfolio.featured && (
                    <Badge variant="default" className="flex-shrink-0">
                      En vedette
                    </Badge>
                  )}
                </div>
                {portfolio.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {portfolio.description}
                  </p>
                )}
                <Badge variant="outline" className="text-xs">
                  {portfolio.service_category}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {portfolios.length > displayedPortfolios.length && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              ... et {portfolios.length - displayedPortfolios.length} autre(s) réalisation(s)
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
