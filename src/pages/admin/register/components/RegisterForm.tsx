// src/pages/admin/register/components/RegisterForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { authHeaders, buildApiUrl } from '@/lib/headers';

type Props = {
  role: "super_admin" | "admin_offres" | "admin_users" | "admin";
  title: string;
  color: string;
};

export default function RegisterForm({ role, title, color }: Props) {
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // PREMIER SUPER ADMIN → pas besoin de token
      if (role === "super_admin") {
        const res = await fetch(buildApiUrl("/api/admin/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role: "super_admin" }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Super Admin créé ! Vous pouvez maintenant vous connecter.");
          navigate("/admin/login");
        } else {
          toast.error(data.message || "Erreur");
        }
      } 
      // AUTRES ADMINS → besoin d’être super_admin
      else {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          toast.error("Vous devez être Super Admin");
          navigate("/admin/login");
          return;
        }

        const res = await fetch(buildApiUrl("/api/admin/create"), {
          method: "POST",
          headers: authHeaders('application/json', 'adminToken'),
          body: JSON.stringify({ ...form, role }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success(`${title} créé avec succès !`);
          navigate("/admin");
        } else {
          toast.error(data.message || "Erreur");
        }
      }
    } catch {
      toast.error("Serveur injoignable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-8 shadow-xl">
      <h2 className={`text-2xl font-bold text-center ${color} mb-8`}>
        Créer un {title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="text"
          placeholder="Nom complet (facultatif)"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Mot de passe (min 6)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Création..." : `Créer ${title}`}
        </Button>
      </form>
    </Card>
  );
}