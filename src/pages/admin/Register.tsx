// src/pages/admin/Register.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { buildApiUrl } from "@/lib/headers";

export default function AdminRegister() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(buildApiUrl("/api/admin/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.fullName || "",
          lastName: "",
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Compte administrateur créé avec succès !", {
          icon: <CheckCircle className="h-5 w-5" />,
          duration: 5000,
        });
        navigate("/admin/login");
      } else {
        toast.error(data.message || "Erreur lors de la création");
      }
    } catch (err) {
      toast.error("Impossible de contacter le serveur");
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
          <h1 className="text-3xl font-bold">Créer un compte Admin</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Réservé aux super administrateurs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom complet (facultatif)</label>
            <Input
              type="text"
              placeholder="Francklin Etoka"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              placeholder="admin@emploi.cg"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mot de passe *</label>
            <Input
              type="password"
              placeholder="Minimum 6 caractères"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmer le mot de passe *</label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-lg"
            disabled={loading}
          >
            {loading ? "Création..." : "Créer le compte"}
          </Button>
        </form>

        <div className="mt-10 text-center">
          <Link
            to="/admin/login"
            className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </Card>
    </div>
  );
}