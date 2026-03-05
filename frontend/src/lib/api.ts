/**
 * API WRAPPER
 *
 * Ce fichier jadis pointait vers une implémentation entièrement statique
 * (`api-static`) pour générer un build exportable.  Pour afficher des
 * données dynamiques (offres, formations, etc.) nous devons désormais
 * rediriger les appels vers le back‑end en production.  Un simple flag
 * d'environnement (`VITE_USE_STATIC=true`) permet de revenir en mode mock
 * si besoin.
 */

import apiStatic from './api-static';
import { buildApiUrl, authHeaders } from './headers';

// ------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------
// Basic shape of a job returned by the API.  We only include the fields that
// the frontend currently relies on, but extra properties are allowed.
export interface JobData {
  id?: string | number;
  title?: string;
  company?: string;
  company_id?: number;
  location?: string;
  sector?: string;
  type?: string;
  job_type?: string;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  description?: string;
  requirements?: string;
  image_url?: string;
  application_url?: string;
  application_via_emploi?: boolean;
  deadline?: string;
  deadline_date?: string;
  experience_level?: string;
  published?: boolean;
  published_at?: string;
  is_closed?: boolean;
  created_at?: string;
  updated_at?: string;
}


// helper pour construire une chaîne de requête à partir d'un objet de
// paramètres (ignore les valeurs null/undefined).
function toQuery(params?: Record<string, any>) {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      qs.append(k, String(v));
    }
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

// certains composants utilisent encore des méthodes qui n'ont pas besoin de
// l'API distante (ex : pages statiques de démo).  On réutilise donc
// l'objet `apiStatic` comme valeur par défaut et on surcharge uniquement ce qui
// doit devenir dynamique.
const apiReal = {
  ...apiStatic,

  // ------------------------------------------------------------------------
  // AUTH / ADMIN (identique à l'ancien front-back)
  // ------------------------------------------------------------------------
  loginAdmin: async (email: string, password: string) => {
    const res = await fetch(buildApiUrl('/admin/login'), {
      method: 'POST',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  logout: async () => {
    localStorage.removeItem('adminToken');
    return { success: true };
  },

  // ------------------------------------------------------------------------
  // JOBS
  // ------------------------------------------------------------------------
  getJobs: async (params?: any) => {
    const url = buildApiUrl(`/jobs${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders() });
    return res.json();
  },

  // admin versions simply reuse the same endpoints but include the admin token
  // and are kept as separate helpers for clarity in the UI code.
  getAdminJobs: async () => {
    const url = buildApiUrl(`/jobs`);
    const res = await fetch(url, { headers: authHeaders(undefined, 'adminToken') });
    const json = await res.json();
    // server typically returns { data: [...] }
    if (Array.isArray(json)) return json;
    return json?.data || [];
  },

  getJobById: async (jobId: string) => {
    const res = await fetch(buildApiUrl(`/jobs/${jobId}`), { headers: authHeaders() });
    return res.json();
  },

  createJob: async (job: any) => {
    const res = await fetch(buildApiUrl('/jobs'), {
      method: 'POST',
      headers: authHeaders('application/json'),
      body: JSON.stringify(job),
    });
    return res.json();
  },

  updateJob: async (jobId: string, updates: any) => {
    const res = await fetch(buildApiUrl(`/jobs/${jobId}`), {
      method: 'PUT',
      headers: authHeaders('application/json'),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  deleteJob: async (jobId: string) => {
    const res = await fetch(buildApiUrl(`/jobs/${jobId}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Backwards-compatible alias used by admin UI (was calling `api.deleteAdminJob`)
  deleteAdminJob: async (jobId: string) => {
    const res = await fetch(buildApiUrl(`/jobs/${jobId}`), {
      method: 'DELETE',
      headers: authHeaders(undefined, 'adminToken'),
    });
    return res.json();
  },

  publishJob: async (jobId: string, published: boolean) => {
    const res = await fetch(buildApiUrl(`/jobs/${jobId}`), {
      method: 'PATCH',
      headers: authHeaders('application/json'),
      body: JSON.stringify({ published, published_at: published ? new Date().toISOString() : null }),
    });
    return res.json();
  },

  // ------------------------------------------------------------------------
  // FORMATIONS
  // ------------------------------------------------------------------------
  getFormations: async (params?: any) => {
    const url = buildApiUrl(`/formations${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders() });
    return res.json();
  },

  getFormationById: async (formationId: string) => {
    const res = await fetch(buildApiUrl(`/formations/${formationId}`), { headers: authHeaders() });
    return res.json();
  },

  enrollFormation: async (formationId: string) => {
    const res = await fetch(buildApiUrl(`/formations/${formationId}/enroll`), {
      method: 'POST',
      headers: authHeaders('application/json'),
    });
    return res.json();
  },

  // Admin formations management
  getAdminFormations: async () => {
    const url = buildApiUrl(`/admin/formations`);
    const res = await fetch(url, { headers: authHeaders(undefined, 'adminToken') });
    const json = await res.json();
    if (Array.isArray(json)) return json;
    return json?.data || [];
  },

  createFormation: async (formation: any) => {
    const res = await fetch(buildApiUrl('/admin/formations'), {
      method: 'POST',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify(formation),
    });
    return res.json();
  },

  updateFormation: async (formationId: string, updates: any) => {
    const res = await fetch(buildApiUrl(`/admin/formations/${formationId}`), {
      method: 'PUT',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  deleteFormation: async (formationId: string) => {
    const res = await fetch(buildApiUrl(`/admin/formations/${formationId}`), {
      method: 'DELETE',
      headers: authHeaders(undefined, 'adminToken'),
    });
    return res.json();
  },

  publishFormation: async (formationId: string, published: boolean) => {
    const res = await fetch(buildApiUrl(`/admin/formations/${formationId}/publish`), {
      method: 'PATCH',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify({ published, published_at: published ? new Date().toISOString() : null }),
    });
    return res.json();
  },

  // ------------------------------------------------------------------------
  // SERVICE CATEGORIES (Admin)
  // ------------------------------------------------------------------------
  getAdminServiceCategories: async () => {
    const url = buildApiUrl('/admin/service-categories');
    const res = await fetch(url, { headers: authHeaders(undefined, 'adminToken') });
    return res.json();
  },

  createServiceCategory: async (data: any) => {
    const res = await fetch(buildApiUrl('/admin/service-categories'), {
      method: 'POST',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  toggleServiceCategoryFeature: async (id: string, featured: boolean) => {
    const res = await fetch(buildApiUrl(`/admin/service-categories/${id}`), {
      method: 'PUT',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify({ is_featured: featured }),
    });
    return res.json();
  },

  getAdminServiceCategory: async (id: string) => {
    const url = buildApiUrl(`/admin/service-categories/${id}`);
    const res = await fetch(url, { headers: authHeaders(undefined, 'adminToken') });
    return res.json();
  },

  updateServiceCategory: async (id: string, data: any) => {
    const res = await fetch(buildApiUrl(`/admin/service-categories/${id}`), {
      method: 'PUT',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteServiceCategory: async (id: string) => {
    const res = await fetch(buildApiUrl(`/admin/service-categories/${id}`), {
      method: 'DELETE',
      headers: authHeaders('application/json', 'adminToken'),
    });
    return res.json();
  },

  // ------------------------------------------------------------------------
  // SERVICES (Admin)
  // ------------------------------------------------------------------------
  getAdminServices: async (params?: any) => {
    const url = buildApiUrl(`/admin/services${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders(undefined, 'adminToken') });
    return res.json();
  },

  createService: async (data: any) => {
    const res = await fetch(buildApiUrl('/admin/services'), {
      method: 'POST',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  toggleServiceFeature: async (id: string, featured: boolean) => {
    const res = await fetch(buildApiUrl(`/admin/services/${id}`), {
      method: 'PUT',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify({ is_featured: featured }),
    });
    return res.json();
  },

  getAdminService: async (id: string) => {
    const url = buildApiUrl(`/admin/services/${id}`);
    const res = await fetch(url, { headers: authHeaders(undefined, 'adminToken') });
    return res.json();
  },

  updateService: async (id: string, data: any) => {
    const res = await fetch(buildApiUrl(`/admin/services/${id}`), {
      method: 'PUT',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteService: async (id: string) => {
    const res = await fetch(buildApiUrl(`/admin/services/${id}`), {
      method: 'DELETE',
      headers: authHeaders('application/json', 'adminToken'),
    });
    return res.json();
  },

  // Public services endpoint (for public pages)
  getServices: async (params?: any) => {
    const url = buildApiUrl(`/services${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders(undefined, 'token') });
    return res.json();
  },

  // Public service categories endpoint (for displaying services by category)
  getServiceCategories: async () => {
    const url = buildApiUrl('/services/catalogs');
    const res = await fetch(url, { headers: authHeaders(undefined, 'token') });
    return res.json();
  },

  // ------------------------------------------------------------------------
  // UTILISATEURS
  // ------------------------------------------------------------------------
  getUsers: async (params?: any) => {
    const url = buildApiUrl(`/users${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders() });
    return res.json();
  },

  createUser: async (data: any) => {
    const res = await fetch(buildApiUrl('/admin/users'), {
      method: 'POST',
      headers: authHeaders('application/json'),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateUser: async (id: string, updates: any) => {
    const res = await fetch(buildApiUrl(`/admin/users/${id}`), {
      method: 'PUT',
      headers: authHeaders('application/json'),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  deleteUser: async (id: string) => {
    const res = await fetch(buildApiUrl(`/admin/users/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  // ------------------------------------------------------------------------
  // NOTIFICATIONS UTILISATEUR
  // ------------------------------------------------------------------------
  getNotifications: async (params?: any) => {
    const url = buildApiUrl(`/notifications${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders() });
    return res.json();
  },

  getUnreadNotificationCount: async () => {
    const res = await fetch(buildApiUrl('/notifications/unread-count'), { headers: authHeaders() });
    return res.json();
  },

  markNotificationRead: async (id: string) => {
    const res = await fetch(buildApiUrl(`/notifications/${id}/read`), {
      method: 'POST',
      headers: authHeaders(),
    });
    return res.json();
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(buildApiUrl('/notifications/read-all'), {
      method: 'POST',
      headers: authHeaders(),
    });
    return res.json();
  },

  deleteNotification: async (id: string) => {
    const res = await fetch(buildApiUrl(`/notifications/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Dashboard stats
  getStats: async () => {
    const url = buildApiUrl(`/dashboard/stats`);
    const res = await fetch(url, { headers: authHeaders(undefined, 'adminToken') });
    const json = await res.json();
    return json?.data || json;
  },

  // Dashboard history
  getDashboardHistory: async () => {
    const url = buildApiUrl(`/admin/login-history`);
    const res = await fetch(url, { headers: authHeaders(undefined, 'adminToken') });
    const json = await res.json();
    return json?.data || json;
  },

  // Login history attempts
  getLoginAttempts: async (params?: any) => {
    const url = buildApiUrl(`/admin/login-history${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders(undefined, 'adminToken') });
    const json = await res.json();
    return { attempts: json?.data || json || [] };
  },
};

// un simple flag permet de repasser en mode statique au besoin (par exemple
// pour construire un site exporté ou lors de tests hors connexion).
const useStatic = import.meta.env.VITE_USE_STATIC === 'true';

const api = useStatic ? apiStatic : apiReal;

export { api };
export default api;
