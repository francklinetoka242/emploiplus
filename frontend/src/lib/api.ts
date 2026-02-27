export interface JobData {
  title: string;
  company: string;
  location: string;
  type: string;
  sector: string;
  description: string;
  salary: string;
}

export interface FormationData {
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  price: string;
}

import { authHeaders, getApiBaseUrl, apiFetch } from '@/lib/headers';

// API URL - utilise les variables d'environnement
// Normalise `VITE_API_URL` / `VITE_API_BASE_URL` et n'ajoute `/api`
// que s'il n'est pas déjà présent pour éviter les cas `.../api/api`.
const _apiBase = getApiBaseUrl();
const API_URL = _apiBase
  ? (() => {
      const normalized = _apiBase.replace(/\/+$/g, '');
      return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
    })()
  : '/api';

export const api = {

  // Auth

  loginAdmin: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important pour CORS avec cookies
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '<unable to read response body>');
      console.error('[loginAdmin] Non-OK response', res.status, text);
      // Return a consistent JSON-shaped error to callers instead of throwing a raw SyntaxError
      return { success: false, message: `Server error ${res.status}`, _raw: text } as any;
    }

    try {
      return await res.json();
    } catch (e) {
      const raw = await res.text().catch(() => '<unable to read response body>');
      console.error('[loginAdmin] Failed to parse JSON response:', e, raw);
      return { success: false, message: 'Invalid JSON from server', _raw: raw } as any;
    }
  },

  // Jobs

  getJobs: (paramsOrCtx?: Record<string, any>) => {
    // Support being called directly with params OR as a react-query queryFn
    // (react-query calls queryFn with a context object that contains `queryKey`).
    let params: Record<string, string | number> | undefined;
    if (paramsOrCtx && typeof paramsOrCtx === 'object' && 'queryKey' in paramsOrCtx) {
      const qk = paramsOrCtx.queryKey;
      params = {};
      if (Array.isArray(qk)) {
        // convention: ['jobs', filters?, page?]
        for (let i = 1; i < qk.length; i++) {
          const v = qk[i];
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            params = { ...params, ...v };
          } else if (typeof v === 'number' || typeof v === 'string') {
            params = { ...params, page: v };
          }
        }
      }
    } else {
      params = paramsOrCtx as Record<string, string | number> | undefined;
    }

    const queryParams = params ? { ...params, limit: 10 } : { limit: 10 };
    const filtered: Record<string, string> = {};
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) filtered[k] = String(v);
    });
    const qs = `?${new URLSearchParams(filtered).toString()}`;
    return apiFetch(`${API_URL}/jobs${qs}`);
  },

  createJob: (job: JobData) =>
    apiFetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    }),

  updateJob: (id: string, job: JobData) =>
    apiFetch(`${API_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    }),

  toggleJobPublish: (id: string, published: boolean) =>
    apiFetch(`${API_URL}/jobs/${id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published }),
    }),

  deleteJob: (id: string) => apiFetch(`${API_URL}/jobs/${id}`, { method: 'DELETE' }),

  // Formations

  getFormations: (params?: Record<string, string | number>) => {
    const qp: Record<string, string | number> = params ? { ...params } : {};
    if (!qp.limit) qp.limit = 10;
    const qs = `?${new URLSearchParams(Object.entries(qp).reduce((acc, [k, v]) => { if (v !== undefined && v !== null) acc[k] = String(v); return acc; }, {} as Record<string,string>))}`;
    return fetch(`${API_URL}/formations${qs}`).then(res => res.json());
  },

  createFormation: (formation: FormationData) =>

    fetch(`${API_URL}/formations`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(formation),

    }).then(res => res.json()),

  // Admin-friendly publish helper for formations
  publishFormation: (id: string, published: boolean) => {
    const headers = authHeaders('application/json');
    return fetch(`${API_URL}/formations/${id}/publish`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ published }),
    }).then(res => res.json());
  },

  // Admins

  getAdmins: () => fetch(`${API_URL}/admins`).then(res => res.json()),

  // Site notifications (admin)
  createSiteNotification: (payload: { title: string; message?: string; target?: string; category?: string | null; image_url?: string | null; link?: string | null; }) => {
    const adminToken = localStorage.getItem('adminToken');
    const headers = adminToken ? authHeaders('application/json', 'adminToken') : authHeaders('application/json');
    return fetch(`${API_URL}/admin/site-notifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).then(res => res.json());
  },

  // List site notifications (admin)
  getSiteNotifications: () => {
    const adminToken = localStorage.getItem('adminToken');
    const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
    return fetch(`${API_URL}/site-notifications`, { headers }).then(res => res.json());
  },

  // Delete a site notification (admin)
  deleteSiteNotification: (id: string | number) => {
    const adminToken = localStorage.getItem('adminToken');
    const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
    return fetch(`${API_URL}/admin/site-notifications/${id}`, { method: 'DELETE', headers }).then(res => res.json());
  },

  // Users

  getUsers: () => fetch(`${API_URL}/users`).then(res => res.json()),

  getCandidates: (limit = 50) => 
    fetch(`${API_URL}/users/candidates?limit=${limit}`).then(res => {
      if (!res.ok) {
        console.error('Failed to fetch candidates:', res.status, res.statusText);
        return [];
      }
      return res.json().catch(() => []);
    }),

  createUser: (user: { full_name: string; email: string; user_type: string }) =>

    fetch(`${API_URL}/users`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(user),

    }).then(res => res.json()),

  updateUser: (id: string, user: { full_name?: string; email?: string; is_blocked?: boolean }) =>

    fetch(`${API_URL}/users/${id}`, {

      method: "PUT",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(user),

    }).then(res => res.json()),

  deleteUser: (id: string) => fetch(`${API_URL}/users/${id}`, { method: "DELETE" }),

  // Stats

  getStats: () => fetch(`${API_URL}/stats`).then(res => res.json()),

  getAdminStats: () => {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_URL}/admin/stats`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      }
    }).then(res => res.json());
  },

  // Dashboard Stats & History
  getDashboardStats: () => {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_URL}/admin/dashboard/stats`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      }
    }).then(res => res.json()).catch(() => null);
  },

  getDashboardHistory: () => {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_URL}/admin/dashboard/history`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      }
    }).then(res => res.json()).catch(() => null);
  },

  // Login History & Security Monitoring
  getLoginAttempts: (params?: { limit?: number; offset?: number; email?: string }) => {
    const token = localStorage.getItem('adminToken');
    const qs = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>)
    )}` : '';
    return fetch(`${API_URL}/security/login-attempts${qs}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      }
    }).then(res => res.json()).catch(() => ({ attempts: [], total: 0 }));
  },

  // Audit Logs
  getAuditLogs: (params?: { limit?: number; offset?: number; admin_id?: number; resource?: string }) => {
    const token = localStorage.getItem('adminToken');
    const qs = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>)
    )}` : '';
    return fetch(`${API_URL}/admin/audit-logs${qs}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      }
    }).then(res => res.json()).catch(() => ({ logs: [], total: 0 }));
  },

  // Match Score & Career Roadmap

  getMatchScore: (jobId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/jobs/${jobId}/match-score`, { headers })
      .then(res => res.json());
  },

  getAllMatchScores: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/jobs/match-scores/all`, { headers })
      .then(res => res.json());
  },

  generateCareerRoadmap: (targetJobId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/career/roadmap/${targetJobId}`, { headers })
      .then(res => res.json());
  },

  getTargetPositions: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/career/target-positions`, { headers })
      .then(res => res.json());
  },

  deleteTargetPosition: (positionId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/career/target-positions/${positionId}`, {
      method: 'DELETE',
      headers
    }).then(res => res.json());
  },

  addJobRequirements: (jobId: number, requirements: Array<{ skill: string; is_required: boolean; category?: string }>) => {
    const token = localStorage.getItem('adminToken');
    const headers = authHeaders(undefined, 'adminToken');
    return fetch(`${API_URL}/admin/jobs/${jobId}/requirements`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requirements })
    }).then(res => res.json());
  },

  addFormationSkills: (formationId: number, skills: string[]) => {
    const headers = authHeaders(undefined, 'adminToken');
    return fetch(`${API_URL}/admin/formations/${formationId}/skills`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ skills })
    }).then(res => res.json());
  },

  // Admin: service categories & services
  getAdminServiceCategories: () => {
    const headers = authHeaders(undefined, 'adminToken');
    return fetch(`${API_URL}/admin/service-categories`, { headers }).then(res => res.json()).catch(() => []);
  },

  toggleServiceCategoryFeature: (id: string, is_featured: boolean) => {
    const headers = authHeaders('application/json', 'adminToken');
    return fetch(`${API_URL}/admin/service-categories/${id}/feature`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_featured })
    }).then(res => res.json());
  },

  getAdminServices: (params?: Record<string, string | number>) => {
    const headers = authHeaders(undefined, 'adminToken');
    const qs = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => { if (v !== undefined && v !== null) acc[k] = String(v); return acc; }, {} as Record<string,string>))}` : '';
    return fetch(`${API_URL}/admin/services${qs}`, { headers }).then(res => res.json()).catch(() => []);
  },

  toggleServiceFeature: (id: string, is_featured: boolean) => {
    const headers = authHeaders('application/json', 'adminToken');
    return fetch(`${API_URL}/admin/services/${id}/feature`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_featured })
    }).then(res => res.json());
  },

  // CREATE SERVICE CATEGORIES
  createServiceCategory: (data: { title: string; description?: string; icon?: string; is_featured?: boolean }) => {
    const headers = authHeaders('application/json', 'adminToken');
    return fetch(`${API_URL}/admin/service-categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    }).then(res => res.json());
  },

  updateServiceCategory: (id: string | number, data: Partial<{ title: string; description: string; icon: string; is_featured: boolean }>) => {
    const headers = authHeaders('application/json', 'adminToken');
    return fetch(`${API_URL}/admin/service-categories/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    }).then(res => res.json());
  },

  deleteServiceCategory: (id: string | number) => {
    const headers = authHeaders('application/json', 'adminToken');
    return fetch(`${API_URL}/admin/service-categories/${id}`, {
      method: 'DELETE',
      headers
    }).then(res => res.json());
  },

  // CREATE SERVICES
  createService: (data: { title: string; catalog_id: string | number; details?: string; price?: string; display_order?: number }) => {
    const headers = authHeaders('application/json', 'adminToken');
    return fetch(`${API_URL}/admin/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    }).then(res => res.json());
  },

  updateService: (id: string | number, data: Partial<{ title: string; details: string; price: string; display_order: number; is_featured: boolean }>) => {
    const headers = authHeaders('application/json', 'adminToken');
    return fetch(`${API_URL}/admin/services/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    }).then(res => res.json());
  },

  deleteService: (id: string | number) => {
    const headers = authHeaders('application/json', 'adminToken');
    return fetch(`${API_URL}/admin/services/${id}`, {
      method: 'DELETE',
      headers
    }).then(res => res.json());
  },

  // FOLLOWS & CONNECTIONS
  followUser: (followingId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/${followingId}`, {
      method: 'POST',
      headers,
    }).then(res => res.json());
  },

  unfollowUser: (followingId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/${followingId}`, {
      method: 'DELETE',
      headers,
    }).then(res => res.json());
  },

  getNetworkStats: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/stats`, {
      headers,
    }).then(res => {
      if (!res.ok) {
        console.error('Failed to fetch network stats:', res.status, res.statusText);
        return { followerCount: 0, followingCount: 0 };
      }
      return res.json().then(data => ({
        followerCount: parseInt(data?.followerCount || 0, 10),
        followingCount: parseInt(data?.followingCount || 0, 10)
      })).catch(() => ({ followerCount: 0, followingCount: 0 }));
    });
  },

  getFollowSuggestions: (limit = 10) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/suggestions?limit=${limit}`, {
      headers,
    }).then(res => {
      if (!res.ok) {
        console.error('Failed to fetch follow suggestions:', res.status, res.statusText);
        return [];
      }
      return res.json().catch(() => []);
    });
  },

  getNetworkActivity: (limit = 20) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/activity?limit=${limit}`, {
      headers,
    }).then(res => {
      if (!res.ok) {
        console.error('Failed to fetch network activity:', res.status, res.statusText);
        return [];
      }
      return res.json().catch(() => []);
    });
  },

  getFollowingUsers: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/following`, {
      headers,
    }).then(res => {
      if (!res.ok) {
        console.error('Failed to fetch following users:', res.status, res.statusText);
        return [];
      }
      return res.json().catch(() => []);
    });
  },

  getFollowerUsers: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/followers`, {
      headers,
    }).then(res => res.json());
  },

  isFollowing: (userId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/${userId}/is-following`, {
      headers,
    }).then(res => res.json());
  },

  blockUser: (blockedUserId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/blocks/${blockedUserId}`, {
      method: 'POST',
      headers,
    }).then(res => res.json());
  },

  unblockUser: (blockedUserId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/blocks/${blockedUserId}`, {
      method: 'DELETE',
      headers,
    }).then(res => res.json());
  },

  // MESSAGING
  getConversations: (limit = 50) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations?limit=${limit}`, {
      headers,
    }).then(res => {
      if (!res.ok) {
        console.error('Failed to fetch conversations:', res.status, res.statusText);
        return [];
      }
      return res.json().catch(() => []);
    });
  },

  createConversation: (recipientId: number, subjectId?: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ recipientId, subjectId }),
    }).then(res => res.json());
  },

  getMessages: (conversationId: number, offset = 0, limit = 20) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations/${conversationId}/messages?offset=${offset}&limit=${limit}`, {
      headers,
    }).then(res => res.json());
  },

  sendMessage: (conversationId: number, receiverId: number, content: string) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ conversationId, receiverId, content }),
    }).then(res => res.json());
  },

  markMessageAsRead: (messageId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers,
    }).then(res => res.json());
  },

  markConversationAsRead: (conversationId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations/${conversationId}/read`, {
      method: 'PUT',
      headers,
    }).then(res => res.json());
  },

  toggleMessageImportant: (messageId: number, isImportant: boolean) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/${messageId}/important`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ isImportant }),
    }).then(res => res.json());
  },

  deleteMessage: (messageId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers,
    }).then(res => res.json());
  },

  deleteConversation: (conversationId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers,
    }).then(res => res.json());
  },

  getUnreadMessageCount: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/unread/count`, {
      headers,
    }).then(res => {
      if (!res.ok) {
        console.error('Failed to fetch unread count:', res.status, res.statusText);
        return { count: 0 };
      }
      return res.json().catch(() => ({ count: 0 }));
    });
  },

  getMessageSubjects: (companyId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/message-subjects/${companyId}`, {
      headers,
    }).then(res => res.json());
  },

  createMessageSubject: (subjectName: string, subjectDescription?: string, displayOrder?: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/message-subjects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ subjectName, subjectDescription, displayOrder }),
    }).then(res => res.json());
  },

  reportMessage: (messageId: number, reason: string, reportType = 'report') => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/${messageId}/report`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason, reportType }),
    }).then(res => res.json());
  },

  checkConversationExists: (recipientId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations/check/${recipientId}`, {
      headers,
    }).then(res => res.json());
  },

  // ============================================================================
  // ADMIN JOBS MANAGEMENT
  // ============================================================================
  
  getAdminJobs: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => { if (v !== undefined && v !== null) acc[k] = String(v); return acc; }, {} as Record<string,string>))}` : '';
    return apiFetch(`${API_URL}/admin/jobs${qs}`, {}, { admin: true, expectArray: true })
      .then(data => {
        return Array.isArray(data) ? data : (data?.data || []);
      })
      .catch(err => {
        console.error('Error fetching admin jobs:', err);
        return [];
      });
  },

  getAdminJob: (id: string | number) => apiFetch(`${API_URL}/admin/jobs/${id}`, {}, { admin: true }),

  createAdminJob: (job: any) => apiFetch(`${API_URL}/admin/jobs`, { method: 'POST', body: JSON.stringify(job) }, { admin: true }),

  updateAdminJob: (id: string | number, job: any) => apiFetch(`${API_URL}/admin/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(job) }, { admin: true }),

  deleteAdminJob: (id: string | number) => apiFetch(`${API_URL}/admin/jobs/${id}`, { method: 'DELETE' }, { admin: true }),

  publishJob: (id: string | number, published: boolean) => 
    apiFetch(`${API_URL}/admin/jobs/${id}`, 
      { 
        method: 'PATCH', 
        body: JSON.stringify({ published, published_at: published ? new Date().toISOString() : null }) 
      }, 
      { admin: true }
    ),

  // PUBLIC SERVICES & CATALOGS
  getServiceCatalogs: () => 
    fetch(`${API_URL}/services/catalogs`).then(res => res.json()).catch(() => []),

  getServices: (catalogId?: string | number, page = 1, limit = 10) => {
    const qs = new URLSearchParams();
    if (catalogId) qs.append('catalog_id', String(catalogId));
    qs.append('page', String(page));
    qs.append('limit', String(Math.min(limit, 10)));
    return fetch(`${API_URL}/services?${qs}`).then(res => res.json()).catch(() => ({ data: [], pagination: {} }));
  },

};