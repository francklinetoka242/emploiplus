// src/pages/admin/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, LogIn } from "lucide-react";
import { buildApiUrl } from "@/lib/headers";

export default function AdminLogin() {
  const [email, setEmail] = useState("email@email.com");
  const [password, setPassword] = useState("mot de passe");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Tentative de connexion...');

    try {
      const res = await fetch(buildApiUrl("/api/auth/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("admin", JSON.stringify(data.admin));
        const name = data.admin.first_name && data.admin.last_name ? `${data.admin.first_name} ${data.admin.last_name}` : (data.admin.nom && data.admin.prenom ? `${data.admin.prenom} ${data.admin.nom}` : "Admin");
        toast.success(`Bienvenue ${name} !`);

        // Redirect based on admin role
        const role = data.admin?.role;
        switch (role) {
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
        toast.error("Identifiants incorrects");
      }
    } catch (error) {
      console.log('Erreur:', error);
      toast.error("Serveur injoignable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
      <Card className="w-full max-w-md p-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Connexion Admin</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="email"
            placeholder="exemple@site.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Connexion..." : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Se connecter
              </>
            )}
          </Button>
        </form>

        
      </Card>
    </div>
  );
}