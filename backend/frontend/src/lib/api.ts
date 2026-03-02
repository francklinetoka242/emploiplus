/**
 * API WRAPPER
 *
 * Le site était auparavant livré en mode purement statique, avec toutes les
 * données durcies dans `api-static`.  Pour rendre les pages `/emplois` et
 * `/formations` pleinement dynamiques nous redirigeons désormais les appels
 * vers l'API REST du back‑end.  Un flag d'environnement permet de repasser en
 * mode statique si nécessaire (`VITE_USE_STATIC=true`).
 */

import apiStatic from './api-static';
import { buildApiUrl, authHeaders } from './headers';

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
  // AUTH / ADMIN (identique à l'ancien front back)
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
    // côté client il suffit de supprimer le token local
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

  // Admin endpoints for jobs management (all jobs including unpublished)
  getAdminJobs: async (params?: any) => {
    const url = buildApiUrl(`/admin/jobs${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders('application/json', 'adminToken') });
    return res.json();
  },

  publishJob: async (jobId: string, published: boolean) => {
    const res = await fetch(buildApiUrl(`/admin/jobs/${jobId}/publish`), {
      method: 'PATCH',
      headers: authHeaders('application/json', 'adminToken'),
      body: JSON.stringify({ published }),
    });
    return res.json();
  },

  deleteAdminJob: async (jobId: string) => {
    const res = await fetch(buildApiUrl(`/admin/jobs/${jobId}`), {
      method: 'DELETE',
      headers: authHeaders('application/json', 'adminToken'),
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

  // admin helpers (use `/admin` prefix)
  createFormation: async (data: any) => {
    const res = await fetch(buildApiUrl('/admin/formations'), {
      method: 'POST',
      headers: authHeaders('application/json'),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateFormation: async (id: string, data: any) => {
    const res = await fetch(buildApiUrl(`/admin/formations/${id}`), {
      method: 'PUT',
      headers: authHeaders('application/json'),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteFormation: async (id: string) => {
    const res = await fetch(buildApiUrl(`/admin/formations/${id}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  publishFormation: async (id: string, published: boolean) => {
    const res = await fetch(buildApiUrl(`/admin/formations/${id}/publish`), {
      method: 'PATCH',
      headers: authHeaders('application/json'),
      body: JSON.stringify({ published }),
    });
    return res.json();
  },

  // ------------------------------------------------------------------------
  // SERVICE CATEGORIES (Admin)
  // ------------------------------------------------------------------------
  getAdminServiceCategories: async () => {
    const url = buildApiUrl('/admin/service-categories');
    const res = await fetch(url, { headers: authHeaders() });
    return res.json();
  },

  createServiceCategory: async (data: any) => {
    const res = await fetch(buildApiUrl('/admin/service-categories'), {
      method: 'POST',
      headers: authHeaders('application/json'),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  toggleServiceCategoryFeature: async (id: string, featured: boolean) => {
    const res = await fetch(buildApiUrl(`/admin/service-categories/${id}/feature`), {
      method: 'PATCH',
      headers: authHeaders('application/json'),
      body: JSON.stringify({ is_featured: featured }),
    });
    return res.json();
  },

  // ------------------------------------------------------------------------
  // SERVICES (Admin)
  // ------------------------------------------------------------------------
  getAdminServices: async (params?: any) => {
    const url = buildApiUrl(`/admin/services${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders() });
    return res.json();
  },

  createService: async (data: any) => {
    const res = await fetch(buildApiUrl('/admin/services'), {
      method: 'POST',
      headers: authHeaders('application/json'),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  toggleServiceFeature: async (id: string, featured: boolean) => {
    const res = await fetch(buildApiUrl(`/admin/services/${id}/feature`), {
      method: 'PATCH',
      headers: authHeaders('application/json'),
      body: JSON.stringify({ is_featured: featured }),
    });
    return res.json();
  },

  // Public services endpoint (for public pages)
  getServices: async (params?: any) => {
    const url = buildApiUrl(`/services${toQuery(params)}`);
    const res = await fetch(url, { headers: authHeaders() });
    return res.json();
  },
};

// un simple flag permet de repasser en mode statique au besoin (par exemple
// pour construire un site exporté ou lors de tests hors connexion).
const useStatic = import.meta.env.VITE_USE_STATIC === 'true';

const api = useStatic ? apiStatic : apiReal;
export { api };
export default api;
