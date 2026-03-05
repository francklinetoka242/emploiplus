import React, { useState } from "react";
import { buildApiUrl } from '@/lib/headers';

interface RegisterFormProps {
  role: "super_admin" | "content_admin" | "admin_users";
  title: string;
  color: string;
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm({ role, title, color }: RegisterFormProps): JSX.Element {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      let endpoint = '/api/auth/register';
      
      // Route spécifique selon le rôle
      if (role === "content_admin") {
        endpoint = '/api/auth/admin/register/content-admin';
      } else if (role === "admin_users") {
        endpoint = '/api/auth/admin/register/user-admin';
      }

      const resp = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          password: form.password,
          role: role,
        }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(data?.message || "Erreur lors de l'enregistrement.");
      } else {
        setMessage(`${title} créé avec succès!`);
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className={`text-center text-xl font-semibold mb-4 ${color}`}>
          {title}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Prénom</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Nom</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="Nom"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="email@example.com"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1">Confirmation</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Confirmez le mot de passe"
            />
          </div>

          {error && <p className="text-destructive text-sm mt-3">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-3">{message}</p>}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded bg-gradient-primary disabled:opacity-60"
            >
              {loading ? "Envoi..." : `Créer ${title}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
