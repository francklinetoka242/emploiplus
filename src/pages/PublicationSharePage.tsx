import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";

const SHARE_PLATFORMS = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "💬",
    action: (url: string) => {
      window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank");
    },
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    action: (url: string) => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank"
      );
    },
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: "𝕏",
    action: (url: string) => {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
        "_blank"
      );
    },
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "in",
    action: (url: string) => {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        "_blank"
      );
    },
  },
  {
    id: "email",
    name: "Email",
    icon: "✉️",
    action: (url: string) => {
      window.location.href = `mailto:?subject=Partage&body=${encodeURIComponent(url)}`;
    },
  },
];

export default function PublicationSharePage() {
  const { publicationId } = useParams<{ publicationId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/publication/${publicationId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success("Lien copié!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = (platform: (typeof SHARE_PLATFORMS)[0]) => {
    platform.action(shareUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold">Partager cette publication</h1>
          </div>

          {/* Main Card */}
          <Card className="p-8 border-0 shadow-lg space-y-8">
            {/* Info */}
            <div className="flex gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Share2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Partagez cette publication</p>
                <p className="text-sm text-blue-800 mt-1">
                  Choisissez un moyen de partager ou copiez le lien
                </p>
              </div>
            </div>

            {/* Lien Direct */}
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Lien direct</p>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Copier le lien"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Plateformes de partage */}
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Partager sur</p>
              <div className="grid grid-cols-2 gap-3">
                {SHARE_PLATFORMS.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    onClick={() => handleShare(platform)}
                    className="h-12 text-base font-semibold hover:bg-primary hover:text-white transition-colors"
                  >
                    <span className="mr-2 text-lg">{platform.icon}</span>
                    {platform.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
