/**
 * Composant ReportModal
 * Interface de signalement pour les publications
 * Permet de signaler un post avec raison et validation
 */

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MoreVertical, AlertCircle } from "lucide-react";
import { authHeaders } from "@/lib/headers";

interface ReportModalProps {
  publicationId: number;
  publicationAuthorId: number;
  onReportSuccess?: () => void;
}

const REPORT_REASONS = [
  { value: "sexual", label: "Contenu sexuel" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "harassment", label: "Harcèlement" },
  { value: "hateful", label: "Discours haineux" },
  { value: "other", label: "Autre" },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  publicationId,
  publicationAuthorId,
  onReportSuccess,
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour signaler une publication");
      return;
    }

    if (!selectedReason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }

    setLoading(true);
    try {
      // Envoyer le signalement
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

      // Envoyer une notification à l'auteur du post
      await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          recipient_id: publicationAuthorId,
          type: "report_notification",
          title: "Votre publication a été signalée",
          message:
            "Votre publication a été signalée par un membre de la communauté et est en cours d'examen.",
          related_id: publicationId,
        }),
      }).catch((err) => console.error("Notification error:", err));

      toast.success("Merci ! Votre signalement a été envoyé avec succès.");
      setOpen(false);
      setSelectedReason("");
      setAdditionalDetails("");

      if (onReportSuccess) {
        onReportSuccess();
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du signalement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
          title="Signaler cette publication"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Signaler cette publication
          </DialogTitle>
          <DialogDescription>
            Aidez-nous à maintenir une communauté respectueuse en signalant les contenus problématiques.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Raison du signalement */}
          <div className="space-y-3">
            <Label className="font-semibold">Raison du signalement</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {REPORT_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label
                    htmlFor={reason.value}
                    className="font-normal cursor-pointer"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Détails supplémentaires (optionnel) */}
          {selectedReason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="details" className="font-semibold">
                Détails supplémentaires (optionnel)
              </Label>
              <Textarea
                id="details"
                placeholder="Décrivez pourquoi vous signalez cette publication..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Information importante */}
          <Card className="p-3 bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              ℹ️ Après validation, l'auteur du post recevra une notification indiquant que sa publication a été signalée et est en cours d'examen.
            </p>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReport}
            disabled={loading || !selectedReason}
          >
            {loading ? "Envoi..." : "Signaler"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
