// src/lib/api.ts
// `API` choisit la base de l'API en priorité depuis la variable d'environnement
// Vite: configure `VITE_API_URL` pour l'URL publique en production.
// En développement, laisser `/api` permet d'utiliser le proxy Vite vers le backend local.
const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api"; // fallback to Vite proxy for dev

export const api = {
  loginAdmin: async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await res.json(); // { success: true, admin: { ... } } ou { success: false }
  },

  getJobs: async () => (await fetch(`${API}/jobs`)).json(),
  getFormations: async () => (await fetch(`${API}/formations`)).json(),
};