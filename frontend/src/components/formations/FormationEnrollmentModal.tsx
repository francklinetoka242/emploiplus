import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { X, Check, Loader2 } from "lucide-react";

interface Formation {
  id: number;
  title: string;
  price?: number;
  duration?: string;
  image_url?: string;
  category?: string;
  level?: string;
  enrollment_deadline?: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type?: string;
}

interface FormationEnrollmentModalProps {
  formation: Formation;
  otherFormations?: Formation[];
  jobs?: Job[];
  onClose: () => void;
  onEnrollmentComplete: () => void;
}

type PaymentMethod = "momo" | "airtel" | "onyfast" | null;

export default function FormationEnrollmentModal({
  formation,
  otherFormations = [],
  jobs = [],
  onClose,
  onEnrollmentComplete,
}: FormationEnrollmentModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"confirmation" | "payment" | "success">("confirmation");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    paymentMethod: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirmEnrollment = () => {
    if (!formData.fullName.trim()) {
      toast.error("Veuillez entrer votre nom complet");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Veuillez entrer votre email");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Veuillez entrer votre numéro de téléphone");
      return;
    }

    if (formation.price && formation.price > 0) {
      setStep("payment");
    } else {
      completeEnrollment();
    }
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast.error("Veuillez sélectionner un mode de paiement");
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Send enrollment data to admin
      const enrollmentData = {
        formation_id: formation.id,
        formation_title: formation.title,
        user_id: user?.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        payment_method: selectedPayment,
        amount: formation.price,
        status: "pending",
        enrollment_date: new Date().toISOString(),
      };

      // TODO: Send to backend API
      console.log("Enrollment data:", enrollmentData);

      toast.success("Paiement en attente de confirmation");
      setStep("success");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Erreur lors du traitement du paiement");
    } finally {
      setLoading(false);
    }
  };

  const completeEnrollment = async () => {
    setLoading(true);
    try {
      const enrollmentData = {
        formation_id: formation.id,
        formation_title: formation.title,
        user_id: user?.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        status: "completed",
        enrollment_date: new Date().toISOString(),
      };

      console.log("Enrollment data:", enrollmentData);
      onEnrollmentComplete();
      setStep("success");
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-96 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Section - Enrollment Form (60%) */}
        <div className="lg:w-3/5 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Inscription à la formation</h2>
              <p className="text-sm text-blue-100 mt-1">{formation.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 p-2 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">{step === "confirmation" && (
            <div className="space-y-4">
              {/* Formation Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Détails de la formation</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Titre:</span> {formation.title}
                  </p>
                  {formation.duration && (
                    <p className="text-gray-700">
                      <span className="font-medium">Durée:</span> {formation.duration}
                    </p>
                  )}
                  {formation.category && (
                    <p className="text-gray-700">
                      <span className="font-medium">Catégorie:</span> {formation.category}
                    </p>
                  )}
                  {formation.level && (
                    <p className="text-gray-700">
                      <span className="font-medium">Niveau:</span> {formation.level}
                    </p>
                  )}
                  {formation.price && (
                    <p className="text-gray-700">
                      <span className="font-medium">Tarif:</span>{" "}
                      <span className="text-blue-600 font-semibold">
                        {formation.price.toLocaleString("fr-FR")} FCFA
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+243 1234567890"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 text-sm h-9"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmEnrollment}
                  disabled={loading}
                  className="flex-1 text-sm h-9"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    "Continuer"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              {/* Amount */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formation.price?.toLocaleString("fr-FR")} FCFA
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900">Sélectionnez un mode de paiement:</p>

                {/* MOMO */}
                <div
                  onClick={() => setSelectedPayment("momo")}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedPayment === "momo"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">MTN MOMO</h4>
                      <p className="text-xs text-gray-500 mt-1">Mobile Money - MTN</p>
                    </div>
                    {selectedPayment === "momo" && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>

                {/* Airtel Money */}
                <div
                  onClick={() => setSelectedPayment("airtel")}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedPayment === "airtel"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Airtel Money</h4>
                      <p className="text-xs text-gray-500 mt-1">Paiement mobile - Airtel</p>
                    </div>
                    {selectedPayment === "airtel" && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>

                {/* ONYFast */}
                <div
                  onClick={() => setSelectedPayment("onyfast")}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedPayment === "onyfast"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">ONYFast</h4>
                      <p className="text-xs text-gray-500 mt-1">Plateforme de paiement</p>
                    </div>
                    {selectedPayment === "onyfast" && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep("confirmation")}
                  className="flex-1 text-sm h-9"
                >
                  Retour
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={!selectedPayment || loading}
                  className="flex-1 text-sm h-9"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Paiement...
                    </>
                  ) : (
                    "Payer maintenant"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900">Inscription confirmée!</h3>
              <p className="text-sm text-gray-600">
                Vous êtes maintenant inscrit à la formation. Vous recevrez un email de
                confirmation avec les détails de la formation.
              </p>

              {formation.price && formation.price > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                  <p className="text-yellow-800">
                    <span className="font-medium">⏳ Paiement en attente:</span> Veuillez
                    compléter le paiement via {selectedPayment?.toUpperCase()} pour
                    confirmer votre inscription.
                  </p>
                </div>
              )}

              <Button
                onClick={() => {
                  onClose();
                  onEnrollmentComplete();
                }}
                className="w-full text-sm h-9 mt-4"
              >
                Fermer
              </Button>
            </div>
          )}
          </div>
        </div>

        {/* Right Section - Other Formations & Jobs (40%) */}
        <div className="lg:w-2/5 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-6">
            {/* Other Formations */}
            {otherFormations.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Autres formations</h3>
                <div className="space-y-2">
                  {otherFormations.slice(0, 4).map((f) => (
                    <div key={f.id} className="bg-white rounded-lg p-2 border border-gray-200 text-xs">
                      <p className="font-semibold text-gray-900 line-clamp-1">{f.title}</p>
                      <p className="text-gray-500 mt-1">
                        {f.price?.toLocaleString("fr-FR")} FCFA • {f.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Offers */}
            {jobs.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm">💼 Offres d'emploi</h3>
                <div className="space-y-2">
                  {jobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="bg-white rounded-lg p-2 border border-gray-200 text-xs">
                      <p className="font-semibold text-gray-900 line-clamp-1">{job.title}</p>
                      <p className="text-gray-500">{job.company}</p>
                      <p className="text-gray-400 text-xs">📍 {job.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
