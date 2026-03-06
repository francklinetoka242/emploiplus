import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldX, ArrowLeft } from 'lucide-react';

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier si on vient d'une redirection d'accès refusé
  const accessDenied = location.state?.accessDenied;

  const handleGoBack = () => {
    navigate('/admin/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Accès Refusé
        </h1>

        <p className="text-gray-600 mb-8">
          {accessDenied
            ? "Vous n'avez pas les permissions nécessaires pour accéder à cette page."
            : "Vous n'êtes pas autorisé à accéder à cette ressource."
          }
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleGoBack}
            className="w-full"
            variant="default"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full"
          >
            Retour à l'accueil
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Si vous pensez que c'est une erreur, contactez l'administrateur système.
        </div>
      </Card>
    </div>
  );
};

export default AccessDeniedPage;