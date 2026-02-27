import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Share2 } from 'lucide-react';

interface ServiceProps {
  id: number;
  name: string;
  description?: string;
  price?: number | null;
  rating?: number | null;
  is_promo?: boolean;
  promo_text?: string | null;
  image_url?: string | null;
  brochure_url?: string | null;
  catalog_name?: string;
}

export default function PublicServiceCard(props: ServiceProps) {
  const {
    id,
    name,
    description,
    price,
    rating,
    is_promo,
    promo_text,
    image_url,
    brochure_url,
    catalog_name
  } = props;

  const shareWhatsApp = () => {
    const url = encodeURIComponent(window.location.href.replace(/#.*$/, '') + `#service-${id}`);
    const text = encodeURIComponent(`${name} — ${promo_text ? promo_text + ' — ' : ''}${catalog_name || ''} \n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href.replace(/#.*$/, '') + `#service-${id}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="w-28 h-20 overflow-hidden rounded bg-gray-100 flex-shrink-0">
          {image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image_url} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Image</div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              {catalog_name && <p className="text-xs text-muted-foreground">{catalog_name}</p>}
            </div>
            <div className="text-right">
              {is_promo && promo_text && (
                <div className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">{promo_text}</div>
              )}
            </div>
          </div>

          {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="font-semibold">{price ? `${Number(price).toLocaleString()} XAF` : 'Sur devis'}</div>
              {rating != null && (
                <div className="flex items-center gap-1 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={shareWhatsApp} aria-label="Partager sur WhatsApp">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={shareFacebook} aria-label="Partager sur Facebook">
                <img src="/icons/facebook.svg" alt="FB" className="h-4 w-4" />
              </Button>
              {brochure_url && (
                <a href={brochure_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                  Brochure
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
