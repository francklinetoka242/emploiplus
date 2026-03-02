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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('🔐 Tentative de connexion admin...');

    try {
      // Utiliser l'endpoint isolé /api/auth/login
      const res = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include', // Important pour CORS et les cookies
        body: JSON.stringify({ email, password }),
      });

      // Lecture UNIQUE du flux de réponse en texte
      const rawBody = await res.text().catch(() => '<unable to read response body>');

      // Tenter de parser ce texte en JSON. Si le serveur a renvoyé du HTML (500),
      // JSON.parse lèvera et nous pourrons afficher le corps brut pour le debug.
      let parsed: any;
      try {
        parsed = rawBody ? JSON.parse(rawBody) : null;
      } catch (e) {
        console.error('❌ Le serveur a renvoyé du HTML (Erreur 500) au lieu de JSON:', rawBody);
        toast.error('Erreur serveur critique (500). Vérifiez les logs PM2.');
        return;
      }

      // Si la réponse HTTP est non-OK mais que le corps JSON existe, loggons le message
      if (!res.ok) {
        console.error('[login] Non-OK status', res.status, parsed);
        toast.error(parsed?.message || `Erreur serveur (${res.status})`);
        return;
      }

      // Extraire la charge utile en supportant axios-style response.data.data
      const apiPayload = parsed && parsed.data && parsed.data.data ? parsed.data.data : parsed && parsed.data ? parsed.data : parsed;

      // L'endpoint admin renvoie { token, user } sans flag "success".
      // On considère réussie toute réponse HTTP OK contenant un token.
      const hasToken = apiPayload && apiPayload.token;
      if (hasToken) {
        localStorage.setItem("adminToken", apiPayload.token ?? '');
        // la propriété peut être `user` ou `admin` selon l'appel
        localStorage.setItem("admin", JSON.stringify(apiPayload.user ?? apiPayload.admin ?? {}));

        console.log('✅ Connexion réussie:', {
          email: apiPayload.user?.email || apiPayload.admin?.email,
          role: apiPayload.user?.role || apiPayload.admin?.role,
          tokenReceived: !!apiPayload.token,
        });

        toast.success("Connecté avec succès !");

        const role = apiPayload.user?.role || apiPayload.admin?.role;
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
        console.error('❌ Erreur login:', parsed?.message ?? parsed);
        toast.error(parsed?.message || "Identifiants incorrects");
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
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
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="placeholder-gray-400"
          />
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="placeholder-gray-400"
          />
          <div className="text-right mt-2">
            <button
              type="button"
              onClick={() => alert("Veuillez contacter l'administrateur système pour réinitialiser votre accès")}
              className="text-sm text-muted-foreground hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

       
      </Card>
    </div>
  );
}