import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const HIDE_REASONS = [
  { value: "not_interested", label: "Je ne suis pas intéressé(e) par ce contenu" },
  { value: "already_seen", label: "J'ai déjà vu ce contenu" },
  { value: "too_much_content", label: "Trop de contenu de ce type" },
  { value: "author", label: "Du contenu de cet auteur" },
  { value: "topic", label: "Je ne veux pas voir ce sujet" },
];

export default function PublicationHidePage() {
  const { publicationId } = useParams<{ publicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [dontShowAuthor, setDontShowAuthor] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    toast.error("Vous devez être connecté");
    navigate(-1);
    return null;
  }

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleHide = async () => {
    setLoading(true);
    try {
      // Stocker le masquage en local ou en base de données
      const hiddenPublications = JSON.parse(localStorage.getItem("hiddenPublications") || "[]");
      if (!hiddenPublications.includes(publicationId)) {
        hiddenPublications.push(publicationId);
        localStorage.setItem("hiddenPublications", JSON.stringify(hiddenPublications));
      }

      // Optionnel: envoyer au serveur
      if (selectedReasons.length > 0 || dontShowAuthor) {
        try {
          await fetch(`/api/publications/${publicationId}/hide`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reasons: selectedReasons,
              dont_show_author: dontShowAuthor,
            }),
          }).catch(() => {
            // Silently fail - les données locales suffisent
          });
        } catch (error) {
          // Ignorer les erreurs serveur
        }
      }

      toast.success("Publication masquée");
      navigate(-1);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold">Masquer cette publication</h1>
          </div>

          {/* Main Card */}
          <Card className="p-8 border-0 shadow-lg space-y-8">
            {/* Info */}
            <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <EyeOff className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Cette publication sera masquée</p>
                <p className="text-sm text-amber-800 mt-1">
                  Vous ne verrez plus cette publication dans votre fil d'actualité.
                </p>
              </div>
            </div>

            {/* Raisons */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Pourquoi masquer? (optionnel)</Label>
              <div className="space-y-3">
                {HIDE_REASONS.map((reason) => (
                  <div
                    key={reason.value}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => toggleReason(reason.value)}
                  >
                    <Checkbox
                      checked={selectedReasons.includes(reason.value)}
                      onCheckedChange={() => toggleReason(reason.value)}
                      id={reason.value}
                    />
                    <Label
                      htmlFor={reason.value}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Don't show author */}
            <div className="space-y-3 pt-4 border-t">
              <div
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setDontShowAuthor(!dontShowAuthor)}
              >
                <Checkbox
                  checked={dontShowAuthor}
                  onCheckedChange={() => setDontShowAuthor(!dontShowAuthor)}
                  id="author"
                />
                <Label
                  htmlFor="author"
                  className="font-normal cursor-pointer flex-1"
                >
                  Ne plus voir le contenu de cet auteur
                </Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                onClick={handleHide}
                disabled={loading}
              >
                {loading ? "Masquage..." : "Masquer"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
