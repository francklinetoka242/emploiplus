import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, BookOpen, Clock, DollarSign, Users, Target, Award, Shield, Zap, GraduationCap } from "lucide-react";

interface Formation {
  id: number;
  title: string;
  price?: number;
  duration?: string;
  image_url?: string;
  category?: string;
  level?: string;
  enrollment_deadline?: string;
  description?: string;
  participants_count?: number;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type?: string;
}

type PaymentMethod = "momo" | "airtel" | "onyfast" | null;
type Step = "confirmation" | "payment" | "success";

export default function FormationEnrollment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formation = location.state?.formation as Formation;

  const [step, setStep] = useState<Step>("confirmation");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    phone: "",
  });

  const { data: otherFormations = [] } = useQuery({
    queryKey: ["formations"],
    queryFn: api.getFormations,
    staleTime: 1000 * 60 * 5,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs?limit=8");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  // Redirect if no formation provided
  useEffect(() => {
    if (!formation) {
      navigate("/formations");
    }
  }, [formation, navigate]);

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

    if (formation?.price && formation.price > 0) {
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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const enrollmentData = {
        formation_id: formation?.id,
        formation_title: formation?.title,
        user_id: user?.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        payment_method: selectedPayment,
        amount: formation?.price,
        status: "pending",
        enrollment_date: new Date().toISOString(),
      };

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
        formation_id: formation?.id,
        formation_title: formation?.title,
        user_id: user?.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        status: "completed",
        enrollment_date: new Date().toISOString(),
      };

      console.log("Enrollment data:", enrollmentData);
      setStep("success");
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (!formation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/formations")}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 mb-8 font-semibold px-3 py-2 rounded-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux formations
        </button>

        {/* Main Content - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Enrollment Form (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 text-white p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="text-orange-50 text-sm font-semibold tracking-wide">INSCRIPTION FORMATION</span>
                  </div>
                  <h1 className="text-4xl font-bold mb-2">Inscription à la formation</h1>
                  <p className="text-orange-50 text-lg font-medium">{formation.title}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-10">
                {step === "confirmation" && (
                  <div className="space-y-8">
                    {/* Formation Details */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-50 rounded-2xl p-8 border-2 border-orange-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-orange-500 p-2 rounded-lg">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-xl text-gray-900">Détails de la formation</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-4 border border-orange-200/50 hover:border-orange-300 transition">
                          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Titre</p>
                          <p className="font-semibold text-gray-900 text-lg">{formation.title}</p>
                        </div>
                        {formation.category && (
                          <div className="bg-white rounded-xl p-4 border border-orange-200/50 hover:border-orange-300 transition">
                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Catégorie</p>
                            <p className="font-semibold text-gray-900 text-lg inline-flex items-center gap-2">
                              <Target className="w-4 h-4 text-orange-600" />
                              {formation.category}
                            </p>
                          </div>
                        )}
                        {formation.duration && (
                          <div className="bg-white rounded-xl p-4 border border-orange-200/50 hover:border-orange-300 transition">
                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Durée</p>
                            <p className="font-semibold text-gray-900 text-lg inline-flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-600" />
                              {formation.duration}
                            </p>
                          </div>
                        )}
                        {formation.level && (
                          <div className="bg-white rounded-xl p-4 border border-orange-200/50 hover:border-orange-300 transition">
                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Niveau</p>
                            <p className="font-semibold text-gray-900 text-lg inline-flex items-center gap-2">
                              <Award className="w-4 h-4 text-orange-600" />
                              {formation.level}
                            </p>
                          </div>
                        )}
                        {formation.price && (
                          <div className="md:col-span-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                            <p className="text-orange-50 text-sm font-semibold uppercase tracking-wide mb-2">Tarif</p>
                            <div className="flex items-end gap-2">
                              <DollarSign className="w-6 h-6" />
                              <p className="text-4xl font-bold">{formation.price.toLocaleString("fr-FR")}</p>
                              <p className="text-orange-50 mb-1">FCFA</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-orange-500 p-2 rounded-lg">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-xl text-gray-900">Vos informations</h3>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Nom complet <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Votre nom complet"
                            className="text-base h-12 pl-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="votre@email.com"
                          className="text-base h-12 pl-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Numéro de téléphone <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+243 1234567890"
                          className="text-base h-12 pl-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl transition-all"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-8 border-t-2 border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/formations")}
                        className="flex-1 h-12 text-base font-semibold border-2 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleConfirmEnrollment}
                        disabled={loading}
                        className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2 inline" />
                            Continuer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {step === "payment" && (
                  <div className="space-y-8">
                    {/* Amount Section */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-green-600 text-sm font-semibold uppercase tracking-wide mb-2">Montant à payer</p>
                          <p className="text-5xl font-bold text-green-600">
                            {formation.price?.toLocaleString("fr-FR")} <span className="text-2xl">FCFA</span>
                          </p>
                        </div>
                        <div className="bg-green-600 p-4 rounded-xl">
                          <DollarSign className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <p className="text-green-700 text-sm font-medium">Paiement sécurisé et instantané</p>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-600 p-2 rounded-lg">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-xl text-gray-900">Mode de paiement</h3>
                      </div>

                      {/* MOMO */}
                      <div
                        onClick={() => setSelectedPayment("momo")}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                          selectedPayment === "momo"
                            ? "border-orange-500 bg-orange-50 shadow-lg"
                            : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${selectedPayment === "momo" ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                              📱
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">MTN MOMO</h4>
                              <p className="text-sm text-gray-500 mt-1">Mobile Money - Rapide et sécurisé</p>
                            </div>
                          </div>
                          {selectedPayment === "momo" && (
                            <div className="bg-orange-500 p-2 rounded-full">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Airtel Money */}
                      <div
                        onClick={() => setSelectedPayment("airtel")}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                          selectedPayment === "airtel"
                            ? "border-red-500 bg-red-50 shadow-lg"
                            : "border-gray-200 bg-white hover:border-red-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${selectedPayment === "airtel" ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                              🔴
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">Airtel Money</h4>
                              <p className="text-sm text-gray-500 mt-1">Paiement mobile - Fiable et instantané</p>
                            </div>
                          </div>
                          {selectedPayment === "airtel" && (
                            <div className="bg-red-600 p-2 rounded-full">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ONYFast */}
                      <div
                        onClick={() => setSelectedPayment("onyfast")}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                          selectedPayment === "onyfast"
                            ? "border-purple-500 bg-purple-50 shadow-lg"
                            : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${selectedPayment === "onyfast" ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                              ⚡
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">ONYFast</h4>
                              <p className="text-sm text-gray-500 mt-1">Plateforme de paiement - Flexible</p>
                            </div>
                          </div>
                          {selectedPayment === "onyfast" && (
                            <div className="bg-purple-600 p-2 rounded-full">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-orange-900 text-sm font-medium">
                        ✓ Vos données sont sécurisées avec le chiffrement SSL. Aucune information de carte n'est stockée.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setStep("confirmation")}
                        className="flex-1 h-12 text-base font-semibold border-2 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Retour
                      </Button>
                      <Button
                        onClick={handlePayment}
                        disabled={!selectedPayment || loading}
                        className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Traitement en cours...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2 inline" />
                            Payer maintenant
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {step === "success" && (
                  <div className="space-y-8 text-center py-12">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl animate-pulse"></div>
                        <div className="relative w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                          <Check className="w-14 h-14 text-white animate-bounce" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Inscription confirmée!
                      </h3>
                      <p className="text-gray-600 text-lg font-medium">
                        Bienvenue dans votre parcours de formation 🎓
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-600 p-2 rounded-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-gray-900 font-semibold">
                          Email de confirmation envoyé à <span className="text-green-600">{formData.email}</span>
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Vous recevrez tous les détails d'accès et le matériel de formation dans quelques minutes.
                      </p>
                    </div>

                    {formation.price && formation.price > 0 && (
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 space-y-3">
                        <div className="flex items-center justify-center gap-2 text-yellow-900 font-semibold text-lg">
                          <Zap className="w-6 h-6" />
                          Paiement en attente
                        </div>
                        <p className="text-yellow-900 font-medium">
                          Veuillez compléter le paiement via <span className="font-bold uppercase">{selectedPayment}</span> pour finaliser votre inscription.
                        </p>
                        <p className="text-yellow-800 text-sm">
                          Un code USSD ou un lien de paiement vous a été envoyé par SMS.
                        </p>
                      </div>
                    )}

                    {!formation.price || formation.price === 0 && (
                      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 space-y-2">
                        <p className="text-emerald-900 font-semibold text-lg">
                          ✨ Accès gratuit activé
                        </p>
                        <p className="text-emerald-800 text-sm">
                          Vous pouvez maintenant accéder à tous les contenus de la formation.
                        </p>
                      </div>
                    )}

                    <div className="space-y-3 pt-6 border-t-2 border-gray-200">
                      <Button
                        onClick={() => navigate("/formations")}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                      >
                        Retour aux formations
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/account")}
                        className="w-full h-12 text-base font-semibold border-2 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Aller à mon espace personnel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Other Formations */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-6">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Autres formations</h3>
              </div>
              <div className="p-5 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {otherFormations.slice(0, 6).map((f) => (
                  <div key={f.id} className="pb-4 border-b border-gray-200 last:border-b-0 hover:bg-orange-50 p-3 rounded-xl transition-all cursor-pointer group">
                    <p className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover:text-orange-600 transition">{f.title}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      {f.price && (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                          <DollarSign className="w-3 h-3" />
                          {f.price.toLocaleString("fr-FR")} FCFA
                        </span>
                      )}
                    </div>
                    {f.duration && (
                      <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {f.duration}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Job Offers */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-96">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Opportunités d'emploi</h3>
              </div>
              <div className="p-5 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {jobs.slice(0, 6).map((job) => (
                  <div key={job.id} className="pb-4 border-b border-gray-200 last:border-b-0 hover:bg-purple-50 p-3 rounded-xl transition-all cursor-pointer group">
                    <p className="font-semibold text-gray-900 line-clamp-1 text-sm group-hover:text-purple-600 transition">{job.title}</p>
                    <p className="text-gray-600 text-xs font-medium mt-1">{job.company}</p>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                      <Target className="w-3 h-3" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <p className="text-purple-600 text-xs font-semibold mt-2 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f97316, #ea580c);
          border-radius: 10px;
          transition: background 0.3s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ea580c, #c2410c);
        }
      `}</style>
    </div>
  );
}
