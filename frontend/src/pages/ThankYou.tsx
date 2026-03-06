import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Briefcase } from "lucide-react";
import { PWALayout } from '@/components/layout/PWALayout';

export default function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/emplois');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <PWALayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Candidature envoyée avec succès !
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Merci d'avoir postulé à cette offre. Votre candidature a été transmise à l'employeur.
            Vous recevrez un email de confirmation dans quelques instants.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Délai de réponse :</strong> L'employeur examinera votre candidature
              dans les 2-3 jours ouvrés. Vous serez notifié par email du statut de votre demande.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/emplois')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Voir d'autres offres d'emploi
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>

          {/* Auto-redirect notice */}
          <p className="text-xs text-gray-500 mt-4">
            Redirection automatique dans 5 secondes...
          </p>
        </div>
      </div>
    </PWALayout>
  );
}