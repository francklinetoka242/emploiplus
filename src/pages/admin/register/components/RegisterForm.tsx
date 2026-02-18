// src/pages/admin/register/components/RegisterForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { authHeaders, buildApiUrl } from '@/lib/headers';
import { ShieldAlert } from "lucide-react";

type Props = {
  role: "super_admin" | "content_admin" | "admin_offres" | "admin_users" | "admin";
  title: string;
  color: string;
};

export default function RegisterForm({ role, title, color }: Props) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nom: "",
    prenom: "",
    telephone: "",
    pays: "",
    ville: "",
    date_naissance: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // PREMIER SUPER ADMIN → pas besoin de token
      if (role === "super_admin") {
        // Only required fields for Super Admin
        if (form.password !== form.confirmPassword) {
          toast.error("Les mots de passe ne correspondent pas.");
          return;
        }

        const body = {
          firstName: form.prenom,
          lastName: form.nom,
          email: form.email,
          password: form.password,
        };

        console.log('📤 Frontend envoie au serveur:', JSON.stringify(body, null, 2));
        console.log('   form.nom:', form.nom);
        console.log('   form.prenom:', form.prenom);
        console.log('   form.email:', form.email);

        const res = await fetch("http://localhost:5000/api/auth/super-admin/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          toast.success("Super Admin créé ! Un email de validation a été envoyé.");
          navigate("/admin/login");
        } else {
          toast.error(data.message || "Erreur lors de la création du Super Admin");
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
          body: JSON.stringify({
            firstName: form.prenom,
            lastName: form.nom,
            email: form.email,
            password: form.password,
            telephone: form.telephone || undefined,
            pays: form.pays || undefined,
            ville: form.ville || undefined,
            date_naissance: form.date_naissance || undefined,
            avatar_url: form.avatar_url || undefined,
          }),
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
      {role === "super_admin" && (
        <ShieldAlert className="h-14 w-14 text-destructive mx-auto mb-4" />
      )}
      <h2 className={`text-2xl font-bold text-center ${color} mb-8`}>
        Créer un {title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {role === "super_admin" ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                placeholder="Prénom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                required
              />
              <Input
                type="text"
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>

            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <Input
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />

            <Input
              type="password"
              placeholder="Confirmation"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />

            <Button type="submit" className="w-full bg-gradient-primary text-white" disabled={loading}>
              {loading ? "Création..." : "Créer Super Admin"}
            </Button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Prénom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </div>
            <Input
              type="text"
              placeholder="Téléphone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                placeholder="Pays"
                value={form.pays}
                onChange={(e) => setForm({ ...form, pays: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Ville"
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
              />
            </div>
            <Input
              type="date"
              placeholder="Date de naissance"
              value={form.date_naissance}
              onChange={(e) => setForm({ ...form, date_naissance: e.target.value })}
            />
            <Input
              type="url"
              placeholder="URL avatar (facultatif)"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
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
          </>
        )}
      </form>
    </Card>
  );
}