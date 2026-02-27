import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Loader2, HelpCircle } from "lucide-react";

export default function Subscription() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  const userRole = user && String(user.user_type || '').toLowerCase() === 'company' ? 'company' : 'candidate';

  const handlePaymentMethod = (plan: "monthly" | "annual", method: string) => {
    toast.info(`Paiement ${plan === "monthly" ? "mensuel" : "annuel"} via ${method} - Intégration en cours`);
    // TODO: Integrate with payment provider (MOMO, Airtel, OnyFast)
  };

  const plans = [
    {
      id: "monthly",
      name: "Pack Mensuel",
      price: "1 000",
      period: "mois",
      description: "Accès à toutes les fonctionnalités pour 1 mois",
      features: [
        "Postulation illimitée aux offres",
        "Accès au profil complet",
        "Mise en avant du profil",
        "Notifications des nouvelles offres",
        "Support prioritaire"
      ]
    },
    {
      id: "annual",
      name: "Pack Annuel",
      price: "11 000",
      period: "an",
      description: "Accès à toutes les fonctionnalités pour 12 mois (meilleure valeur)",
      features: [
        "Tout ce du pack mensuel",
        "Avantages exclusifs",
        "Consultation CV prioritaire",
        "Alertes d'offres personnalisées",
        "Accès aux webinaires",
        "Économie: 1 000 FCFA d'escompte"
      ],
      badge: "POPULAIRE"
    }
  ];

  const paymentMethods = [
    { id: "momo", name: "MTN Mobile Money", icon: "📱", color: "bg-yellow-50 border-yellow-200" },
    { id: "airtel", name: "Airtel Money", icon: "📲", color: "bg-red-50 border-red-200" },
    { id: "onyfast", name: "OnyFast", icon: "💳", color: "bg-blue-50 border-blue-200" }
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Abonnement Premium</h2>
        <p className="text-muted-foreground">
          {userRole === "candidate" 
            ? "Débloquez l'accès illimité et maximisez vos opportunités d'emploi"
            : "Accédez à des fonctionnalités avancées de recrutement et de gestion"}
        </p>
      </div>

      {/* Plans de tarification */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`p-6 relative transition-all ${
              plan.badge ? "ring-2 ring-primary md:scale-105" : ""
            }`}
          >
            {plan.badge && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-xs font-semibold">
                {plan.badge}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">FCFA / {plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Méthodes de paiement */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Choisir une méthode de paiement:</p>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant="outline"
                    className={`w-full justify-start gap-2 ${method.color}`}
                    onClick={() => handlePaymentMethod(plan.id as "monthly" | "annual", method.name)}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span>{method.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Section FAQ */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">Questions fréquentes</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Puis-je annuler mon abonnement?</h4>
            <p className="text-sm text-muted-foreground">Oui, vous pouvez annuler votre abonnement à tout moment depuis le tableau de bord. Aucune charge ne sera appliquée après annulation.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Quelles sont les méthodes de paiement acceptées?</h4>
            <p className="text-sm text-muted-foreground">Nous acceptons MTN Mobile Money, Airtel Money et OnyFast pour tous les pays d'Afrique de l'Ouest.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Mon paiement est-il sécurisé?</h4>
            <p className="text-sm text-muted-foreground">Tous les paiements sont cryptés et traités via des passerelles de paiement sécurisées certifiées PCI.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Puis-je changer de plan?</h4>
            <p className="text-sm text-muted-foreground">Oui, vous pouvez basculer entre les plans mensuels et annuels à tout moment. Les changements s'appliqueront au prochain cycle de facturation.</p>
          </div>
        </div>
      </Card>

      {/* Section info supplémentaire */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Besoin d'aide?
        </h3>
        <p className="text-sm text-blue-900">
          Pour des questions concernant votre abonnement ou vos paiements, contactez notre équipe support à <span className="font-semibold">support@emploi-connect-congo.cd</span>
        </p>
      </Card>
    </div>
  );
}
