// src/pages/admin/register/components/RegisterForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Props = {
  role: "super_admin" | "admin_offres" | "admin_users";
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

    // Seul le super_admin peut créer des admins
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Vous devez être connecté en tant que Super Admin");
      navigate("/admin/login");
      return;
    }

    try {
      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`${title} créé avec succès !`);
        navigate("/admin");
      } else {
        toast.error(data.message || "Erreur");
      }
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-8 shadow-xl">
      <h2 className={`text-2xl font-bold text-center ${color} mb-8`}>
        Nouveau {title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="text"
          placeholder="Nom complet"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
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
        />
        <Button type="submit" className="w-full" disabled={loading}>
          Créer {title}
        </Button>
      </form>
    </Card>
  );
}