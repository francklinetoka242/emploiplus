/**
 * PHASE 5: Admin User Profile Page
 * Manage user subscriptions and profile (Admin Level 1 & 5 only)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  User,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { authHeaders } from "@/lib/headers";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: "candidate" | "company";
  createdAt: string;
}

interface Subscription {
  id: number;
  planId: number;
  planName: string;
  status: "active" | "pending" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  amountPaid: number;
  autoRenew: boolean;
  features: Record<string, string>;
}

export default function AdminUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
  const [showModifyModal, setShowModifyModal] = useState<number | null>(null);
  const [modifyData, setModifyData] = useState<Record<string, string>>({});

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
    setAdmin(adminData);

    // Check authorization
    if (adminData.level !== 1 && adminData.level !== 5) {
      toast.error("Accès refusé");
      navigate("/admin");
      return;
    }

    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const headers = authHeaders("application/json");
      headers["Authorization"] = `Bearer ${localStorage.getItem("adminToken")}`;

      // Fetch user profile
      const userRes = await fetch(`/api/admin/users/${userId}`, { headers });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);

        // Fetch user subscriptions
        const subRes = await fetch(
          `/api/admin/users/${userId}/subscriptions`,
          { headers }
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscriptions(subData.subscriptions || []);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    try {
      const headers = authHeaders("application/json");
      headers["Authorization"] = `Bearer ${localStorage.getItem("adminToken")}`;

      const res = await fetch(
        `/api/admin/subscriptions/${subscriptionId}/cancel`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (res.ok) {
        toast.success("Abonnement annulé avec succès");
        setShowCancelModal(null);
        fetchUserProfile();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erreur lors de l'annulation");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Erreur lors de l'annulation");
    }
  };

  const handleModifyFeatures = async (subscriptionId: number) => {
    try {
      const headers = authHeaders("application/json");
      headers["Authorization"] = `Bearer ${localStorage.getItem("adminToken")}`;

      const res = await fetch(
        `/api/admin/subscriptions/${subscriptionId}/modify`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ features: modifyData }),
        }
      );

      if (res.ok) {
        toast.success("Fonctionnalités mises à jour avec succès");
        setShowModifyModal(null);
        setModifyData({});
        fetchUserProfile();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error modifying features:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Zap className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p>Utilisateur non trouvé</p>
        <Button onClick={() => navigate("/admin/users")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux utilisateurs
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/users")}
          className="p-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold">Profil Utilisateur</h1>
      </div>

      {/* USER INFO */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <User className="w-12 h-12 text-primary" />
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="text-xl font-bold">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4">
              <Mail className="w-12 h-12 text-primary" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-xl font-bold">{user.email}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type de compte</p>
            <p className="text-lg font-semibold">
              {user.userType === "candidate" ? "👤 Candidat" : "🏢 Entreprise"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Inscrit le</p>
            <p className="text-lg font-semibold">{user.createdAt}</p>
          </div>
        </div>
      </Card>

      {/* SUBSCRIPTIONS */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Abonnements de l'utilisateur</h2>

        {subscriptions.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun abonnement trouvé</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {subscriptions.map((sub) => (
              <Card
                key={sub.id}
                className={`p-6 border-2 ${
                  sub.status === "active"
                    ? "border-green-200 bg-green-50"
                    : sub.status === "pending"
                      ? "border-yellow-200 bg-yellow-50"
                      : sub.status === "expired"
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="grid md:grid-cols-6 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Plan</p>
                    <p className="font-bold text-lg">{sub.planName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Statut</p>
                    <div className="flex items-center gap-2 mt-1">
                      {sub.status === "active" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : sub.status === "pending" ? (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-semibold capitalize">
                        {sub.status === "active"
                          ? "En cours"
                          : sub.status === "pending"
                            ? "En attente"
                            : sub.status === "expired"
                              ? "Expiré"
                              : "Annulé"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Montant</p>
                    <p className="font-bold text-lg">
                      {sub.amountPaid.toLocaleString()} XAF
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Début</p>
                    <p className="font-semibold">{sub.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fin</p>
                    <p className="font-semibold">{sub.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Renouvellement</p>
                    <p className="font-semibold">
                      {sub.autoRenew ? "✅ Oui" : "❌ Non"}
                    </p>
                  </div>
                </div>

                {/* FEATURES */}
                {sub.features && Object.keys(sub.features).length > 0 && (
                  <div className="my-4 pb-4 border-b">
                    <p className="font-semibold mb-2">Fonctionnalités :</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(sub.features).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-semibold">{key} :</span>{" "}
                          {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ADMIN ACTIONS - Level 1 & 5 only */}
                {(admin?.level === 1 || admin?.level === 5) && (
                  <div className="flex gap-2">
                    {sub.status !== "cancelled" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowCancelModal(sub.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Annuler
                      </Button>
                    )}
                    {sub.status === "active" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setShowModifyModal(sub.id);
                          setModifyData(sub.features || {});
                        }}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier Fonctionnalités
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirmer l'annulation</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler cet abonnement ? Cette action ne
              peut pas être annulée.
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowCancelModal(null)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleCancelSubscription(showCancelModal);
                }}
                className="flex-1"
              >
                Confirmer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODIFY FEATURES MODAL */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Modifier les fonctionnalités</h3>
            <div className="space-y-4 mb-6">
              {Object.entries(modifyData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-2">{key}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setModifyData({ ...modifyData, [key]: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowModifyModal(null)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={() => handleModifyFeatures(showModifyModal)}
                className="flex-1 bg-primary"
              >
                Enregistrer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
