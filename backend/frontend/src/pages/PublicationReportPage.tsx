import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { authHeaders } from "@/lib/headers";

const REPORT_REASONS = [
  { value: "sexual", label: "Contenu sexuel" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "harassment", label: "Harcèlement" },
  { value: "hateful", label: "Discours haineux" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Autre" },
];

export default function PublicationReportPage() {
  const { publicationId } = useParams<{ publicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    toast.error("Vous devez être connecté");
    navigate(-1);
    return null;
  }

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }

    setLoading(true);
    try {
      const reportRes = await fetch(`/api/publications/${publicationId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          reason: selectedReason,
          details: additionalDetails || null,
          reported_by: user.id,
        }),
      });

      if (!reportRes.ok) {
        const errorData = await reportRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors du signalement");
      }

      toast.success("Merci ! Votre signalement a été envoyé avec succès.");
      navigate(-1);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du signalement");
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
            <h1 className="text-3xl font-bold">Signaler cette publication</h1>
          </div>

          {/* Form Card */}
          <Card className="p-8 border-0 shadow-lg">
            <form onSubmit={handleReport} className="space-y-8">
              {/* Info */}
              <div className="flex gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Aidez-nous à maintenir une communauté respectueuse</p>
                  <p className="text-sm text-red-800 mt-1">
                    Les signalements infondés peuvent affecter votre compte. Signalez uniquement les contenus violant nos conditions.
                  </p>
                </div>
              </div>

              {/* Raison */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Raison du signalement *</Label>
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                  <div className="space-y-3">
                    {REPORT_REASONS.map((reason) => (
                      <div key={reason.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                        <RadioGroupItem value={reason.value} id={reason.value} />
                        <Label
                          htmlFor={reason.value}
                          className="font-normal cursor-pointer flex-1"
                        >
                          {reason.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Détails supplémentaires */}
              {selectedReason && (
                <div className="space-y-2">
                  <Label htmlFor="details" className="text-base font-semibold">
                    Détails supplémentaires (optionnel)
                  </Label>
                  <Textarea
                    id="details"
                    placeholder="Décrivez pourquoi vous signalez cette publication..."
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Maximum 500 caractères</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={loading || !selectedReason}
                >
                  {loading ? "Envoi..." : "Signaler"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Info footer */}
          <Card className="mt-8 p-4 bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              ℹ️ Après validation, l'auteur du post recevra une notification indiquant que sa publication a été signalée et est en cours d'examen.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
