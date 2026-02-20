// src/pages/admin/verify-email/page.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildApiUrl } from "@/lib/headers";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setError("Token manquant");
          setLoading(false);
          return;
        }

        const response = await fetch(buildApiUrl(`/admin/verify-email?token=${token}`), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (data.success) {
          setVerified(true);
          toast.success("Email confirmé avec succès!");
          setTimeout(() => navigate("/admin/login"), 2000);
        } else {
          setError(data.message || "Erreur lors de la vérification");
          toast.error(data.message || "Erreur lors de la vérification");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Erreur serveur");
        toast.error("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        {loading ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Vérification en cours...</h2>
            <div className="animate-spin">
              <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            </div>
          </div>
        ) : verified ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">✓ Email confirmé!</h2>
            <p className="text-gray-600 mb-6">Redirection vers la page de connexion...</p>
            <Button onClick={() => navigate("/admin/login")} className="w-full">
              Aller à la connexion
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">✗ Erreur de vérification</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/admin/login")} className="w-full">
                Retour à la connexion
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/register/super-admin")}
                className="w-full"
              >
                Nouvelle inscription
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
