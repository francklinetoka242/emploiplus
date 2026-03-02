// src/pages/Login.tsx - ADMIN LOGIN
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Lock, LockKeyhole } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { buildApiUrl } from '@/lib/headers';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(buildApiUrl('/api/auth/admin/login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const token = data.token || data.accessToken || data.jwt;
        if (token) {
          localStorage.setItem("jwt", token);
        }
        // store user info if provided
        if (data.user || data.admin) {
          localStorage.setItem("user", JSON.stringify(data.user || data.admin));
        }
        toast.success("Connexion réussie !");

        // Redirect based on admin role
        const adminRole = data.admin?.role;
        switch (adminRole) {
          case "super_admin":
            navigate("/admin");
            break;
          case "content_admin":
            navigate("/admin/publications");
            break;
          case "admin_offres":
            navigate("/admin/jobs");
            break;
          case "admin_users":
            navigate("/admin/users");
            break;
          default:
            navigate("/admin");
        }
      } else {
        toast.error(data?.message || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      toast.error("Erreur serveur – vérifiez que le backend tourne");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AuthHeader />
      
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 md:hidden">
        <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <LockKeyhole className="h-14 w-14 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Connexion Admin</h1>
          <p className="text-sm text-muted-foreground">Accédez à votre espace administrateur</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="super@emploi.cg"
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
            <Link to="/connexion" className="text-sm text-primary hover:underline">
              Connexion utilisateur
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            disabled={loading}
            size="lg"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Administration
            </span>
          </div>
        </div>

        {/* Removed create-account links to keep page strictly for login */}
      </Card>
      </div>
      
      <div className="hidden md:block">
        <AuthFooter />
      </div>
    </div>
  );
};

export default Login;