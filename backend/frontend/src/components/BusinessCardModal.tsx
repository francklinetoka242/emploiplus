import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BusinessCardModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  if (!open) return null;

  const handlePayAndExport = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      toast.success("Paiement simulé — carte générée. Export PDF prêt.");
      // Fallback: open print dialog to let user save as PDF
      window.print();
      onClose();
    }, 900);
  };

  const handleAuth = () => {
    onClose();
    navigate("/connexion");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Créer une carte de visite</h3>
          <button onClick={onClose} aria-label="Fermer" className="p-1">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">Choisissez une option pour obtenir votre carte de visite professionnelle.</p>

        <div className="grid gap-4">
          <div className="p-4 border rounded">
            <h4 className="font-semibold">Payer & créer / Exporter en PDF</h4>
            <p className="text-sm text-muted-foreground mb-3">Paiement unique pour générer la carte puis export PDF téléchargeable.</p>
            <Button onClick={handlePayAndExport} className="w-full" disabled={processing}>
              {processing ? "Traitement..." : "Payer & exporter"}
            </Button>
          </div>

          <div className="p-4 border rounded">
            <h4 className="font-semibold">Se connecter / Créer un compte</h4>
            <p className="text-sm text-muted-foreground mb-3">Connectez-vous ou créez un compte pour sauvegarder et gérer plusieurs cartes.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { onClose(); navigate('/connexion'); }} className="w-full">Se connecter</Button>
              <Button variant="ghost" onClick={() => { onClose(); navigate('/inscription'); }} className="w-full">Créer un compte</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModal;
