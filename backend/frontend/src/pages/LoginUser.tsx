import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Briefcase, Mail, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { PWALayout } from "@/components/layout/PWALayout";
import { buildApiUrl } from '@/lib/headers';

const LoginUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerificationReminder, setShowVerificationReminder] = useState(false);

  // Check if we just came from registration (show generic success, not email verification)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('from') === 'register') {
      setShowVerificationReminder(true);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(buildApiUrl('/api/auth/user/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Connexion réussie !");
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.admin) {
          localStorage.setItem('user', JSON.stringify(data.admin));
        }
        
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');
        navigate(redirect || '/fil-actualite');
      } else {
        toast.error(data.message || "Erreur de connexion");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PWALayout notificationCount={0} messageCount={0} hideNavigation>
      <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
        <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 mx-auto">
            <Briefcase className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Connexion à Emploi+</h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre compte candidat ou entreprise
          </p>
        </div>

        {/* Verification Reminder Message */}
        {showVerificationReminder && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-blue-900">✅ Inscription réussie!</p>
            <p className="text-xs text-blue-800">
              Votre compte a bien été créé — vous pouvez vous connecter immédiatement.
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="font-normal cursor-pointer">
                Se souvenir de moi
              </Label>
            </div>
            <Link to="/inscription" className="text-sm text-primary hover:underline">
              Créer un compte
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">Ou</span>
            </div>
          </div>

          <GoogleLoginButton
            onSuccess={(user) => {
              toast.success("Connexion réussie avec Google !");
              const params = new URLSearchParams(location.search);
              const redirect = params.get('redirect');
              
              if (redirect) {
                navigate(redirect);
              } else {
                // Redirect all users to newsfeed
                navigate('/fil-actualite');
              }
            }}
            onError={(error) => {
              toast.error(error?.message || "Erreur lors de la connexion Google");
            }}
            className="w-full"
          />
        </form>

       
      </Card>
      </div>
      </div>
    </PWALayout>
  );
};

export default LoginUser;
