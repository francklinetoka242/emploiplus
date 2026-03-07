// src/pages/admin/login/page.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";        // ← LE "F" EST MAJUSCULE !
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { buildApiUrl } from "@/lib/headers";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("exemple@site.com");
  const [password, setPassword] = useState("Mot de passe");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(buildApiUrl("/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("admin", JSON.stringify(data.admin));
        toast.success("Connecté avec succès !");

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
    } catch (err) {
      toast.error("Serveur injoignable – vérifiez le backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md p-10 shadow-2xl">
        <div className="text-center mb-10">
          <Shield className="h-16 w-16 mx-auto text-primary mb-6" />
          <h1 className="text-3xl font-bold">Connexion Administrateur</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="email"
            placeholder="exemple@site.cg"
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

       
      </Card>
    </div>
  );
}