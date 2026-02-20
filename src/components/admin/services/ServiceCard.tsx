/**
 * Service Card Component
 * For displaying services to visitors with promotions, ratings, and sharing
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Zap, Share2, Download, Facebook, MessageCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface ServiceCardProps {
  id: number;
  name: string;
  description?: string;
  price?: number;
  rating?: number;
  is_promo: boolean;
  promo_text?: string;
  image_url?: string;
  brochure_url?: string;
  catalog_name?: string;
}

export function ServiceCard({
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
}: ServiceCardProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Render star rating
  const renderStars = (rate: number | undefined) => {
    if (!rate) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.ceil(rate)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rate}/5</span>
      </div>
    );
  };

  // Share via WhatsApp
  const shareWhatsApp = () => {
    const text = `Découvrez "${name}" - ${description || ''}${price ? ` - À partir de ${price.toLocaleString('fr-CM')} XAF` : ''}\n\nPlus d'infos sur Emploi Plus`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    toast({
      title: 'Partagé',
      description: 'Redirection vers WhatsApp...'
    });
  };

  // Share via Facebook
  const shareFacebook = () => {
    const shareUrl = window.location.href;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    toast({
      title: 'Partagé',
      description: 'Redirection vers Facebook...'
    });
  };

  // Copy to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Succès',
      description: 'Lien copié dans le presse-papiers'
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center">
              <Zap className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Pas d'image</p>
            </div>
          </div>
        )}

        {/* Promotion Badge */}
        {is_promo && promo_text && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg animate-pulse">
            {promo_text}
          </div>
        )}

        {/* Category Badge */}
        {catalog_name && (
          <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
            {catalog_name}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title and Rating */}
        <div>
          <h3 className="font-bold text-lg line-clamp-2">{name}</h3>
          {rating && (
            <div className="mt-2">
              {renderStars(rating)}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        )}

        {/* Price */}
        {price && (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">
              {price.toLocaleString('fr-CM')}
            </span>
            <span className="text-sm text-gray-500">XAF</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {brochure_url && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              asChild
            >
              <a href={brochure_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Brochure
              </a>
            </Button>
          )}

          {/* Share Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 w-full"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 className="h-4 w-4" />
              Partager
            </Button>

            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 w-48">
                <button
                  onClick={shareWhatsApp}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-b"
                >
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  WhatsApp
                </button>
                <button
                  onClick={shareFacebook}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-b"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook
                </button>
                <button
                  onClick={copyLink}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4 text-gray-600" />
                  Copier le lien
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
