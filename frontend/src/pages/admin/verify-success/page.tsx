// src/pages/admin/verify-success/page.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function VerifySuccessPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/admin/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-background to-green-50 px-4">
      <Card className="w-full max-w-md p-10 shadow-2xl text-center">
        <div className="mb-6">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold text-green-700 mb-4">Email Vérifié !</h1>
        
        <p className="text-gray-600 mb-6">
          Votre adresse email a été confirmée avec succès. 
          Vous pouvez maintenant vous connecter à votre compte administrateur.
        </p>

        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            Redirection automatique vers la page de connexion dans <span className="font-bold">{countdown}s</span>...
          </p>
        </div>

        <Button 
          onClick={() => navigate('/admin/login')} 
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Aller à la connexion
        </Button>
      </Card>
    </div>
  );
}
