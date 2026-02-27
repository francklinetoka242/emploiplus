/**
 * Composant ReactionBar
 * Barre de réactions rapides avec emojis
 * Permet d'envoyer instantanément un commentaire avec un seul emoji
 */

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authHeaders } from "@/lib/headers";
import Icon from "@/components/Icon";

interface ReactionBarProps {
  publicationId: number;
  onReactionAdded?: () => void;
}

const REACTIONS = [
  { key: 'applaud', icon: 'Star', label: "Applaudissements" },
  { key: 'like', icon: 'ThumbsUp', label: "J'aime bien" },
  { key: 'celebrate', icon: 'Star', label: "Félicitations" },
  { key: 'agree', icon: 'Handshake', label: "Accord" },
  { key: 'rocket', icon: 'Rocket', label: "Excellent" },
  { key: 'idea', icon: 'Zap', label: "Idée" },
  { key: 'sparkle', icon: 'Sparkles', label: "Magnifique" },
  { key: 'hot', icon: 'Fire', label: "C'est chaud" },
];

export const ReactionBar: React.FC<ReactionBarProps> = ({
  publicationId,
  onReactionAdded,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const handleReactionClick = async (reactionKey: string) => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setLoading(true);
    setActiveReaction(reactionKey);

    try {
      const res = await fetch(`/api/publications/${publicationId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          content: reactionKey,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Erreur lors de l'envoi de la réaction");
      }

      toast.success("Réaction envoyée !");

      if (onReactionAdded) {
        onReactionAdded();
      }

      // Reset après 1 seconde
      setTimeout(() => {
        setActiveReaction(null);
      }, 1000);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de l'envoi");
      setActiveReaction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REACTIONS.map((reaction) => (
        <Button
          key={reaction.key}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleReactionClick(reaction.key)}
          disabled={loading}
          title={reaction.label}
          className={`px-2 py-1 text-lg transition-transform hover:scale-125 ${
            activeReaction === reaction.key ? "scale-125 opacity-100" : "opacity-70 hover:opacity-100"
          }`}
        >
          <Icon name={reaction.icon} />
        </Button>
      ))}
    </div>
  );
};
