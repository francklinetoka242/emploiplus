/**
 * PHASE 5: User Subscription Status Component
 * Displays subscription status, details, and actions
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, RotateCcw, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/headers";
import { toast } from "sonner";

interface Subscription {
  id: number;
  userEmail: string;
  planName: string;
  status: "active" | "pending" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  amountPaid: number;
  autoRenew: boolean;
  features: string[];
  nextBillingDate?: string;
  createdAt: string;
}

interface QueueJob {
  id: number;
  jobType: string;
  status: string;
  scheduledFor: string;
  subscriptionId: number;
}

export function SubscriptionStatus() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [queueJobs, setQueueJobs] = useState<QueueJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const headers = authHeaders("application/json");
      const res = await fetch("/api/subscriptions/me", { headers });

      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
        setQueueJobs(data.queueJobs || []);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Erreur lors du chargement des abonnements");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "pending":
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case "expired":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "cancelled":
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "En cours";
      case "pending":
        return "En attente";
      case "expired":
        return "Expiré";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 border-green-200";
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "expired":
        return "bg-red-50 border-red-200";
      case "cancelled":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin">
          <Zap className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ACTIVE SUBSCRIPTIONS */}
      <div>
        <h3 className="text-xl font-bold mb-4">Mes Abonnements</h3>
        {subscriptions.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore d'abonnement actif
            </p>
            <Button className="bg-primary">
              Découvrir nos Plans
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {subscriptions.map((sub) => (
              <Card
                key={sub.id}
                className={`p-6 border-2 ${getStatusColor(sub.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(sub.status)}
                    <div>
                      <h4 className="text-lg font-bold">{sub.planName}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            sub.status === "active"
                              ? "bg-green-100 text-green-700"
                              : sub.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {getStatusLabel(sub.status)}
                        </span>
                        {sub.autoRenew && (
                          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-semibold">
                            ♻️ Renouvellement automatique
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {sub.amountPaid.toLocaleString()} XAF
                    </p>
                  </div>
                </div>

                {/* SUBSCRIPTION DETAILS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-gray-600">Date de début</p>
                    <p className="font-semibold">{sub.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Date d'expiration</p>
                    <p className="font-semibold">{sub.endDate}</p>
                  </div>
                  {sub.nextBillingDate && (
                    <div>
                      <p className="text-xs text-gray-600">Prochain paiement</p>
                      <p className="font-semibold">{sub.nextBillingDate}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600">Créé le</p>
                    <p className="font-semibold">{sub.createdAt}</p>
                  </div>
                </div>

                {/* FEATURES */}
                {sub.features && sub.features.length > 0 && (
                  <div className="my-4">
                    <p className="text-sm font-semibold mb-2">Fonctionnalités incluses :</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {sub.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STATUS-SPECIFIC MESSAGE */}
                {sub.status === "pending" && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⏳ <strong>En attente d'activation :</strong> Votre paiement a été reçu et votre abonnement sera activé dans les prochaines 24 heures.
                    </p>
                  </div>
                )}

                {sub.status === "active" && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ <strong>Actif :</strong> Vous avez accès à toutes les fonctionnalités de votre plan jusqu'au {sub.endDate}.
                    </p>
                  </div>
                )}

                {sub.status === "expired" && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-sm text-red-800 mb-3">
                      ❌ <strong>Expiré :</strong> Votre abonnement a expiré le {sub.endDate}. Renouvelez-le pour continuer à bénéficier des fonctionnalités premium.
                    </p>
                    <Button className="w-full bg-primary">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Renouveler l'abonnement
                    </Button>
                  </div>
                )}

                {sub.status === "cancelled" && (
                  <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-800">
                      ⛔ <strong>Annulé :</strong> Cet abonnement a été annulé. Vous pouvez souscrire à un nouveau plan à tout moment.
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* PENDING ACTIVATIONS */}
      {queueJobs.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Activations en attente</h3>
          <div className="grid gap-4">
            {queueJobs.map((job) => (
              <Card key={job.id} className="p-4 bg-blue-50 border-2 border-blue-200">
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-semibold">Activation programmée : {job.jobType}</p>
                    <p className="text-sm text-gray-600">
                      Prévu pour : {job.scheduledFor}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-semibold">
                    {job.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* REFRESH */}
      <Button
        variant="outline"
        className="w-full mt-6"
        onClick={fetchSubscriptions}
      >
        Rafraîchir
      </Button>
    </div>
  );
}
