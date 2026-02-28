/**
 * API STATIQUE - Mock data pour site statique pur
 * Remplace tous les appels API par des retours de données en dur
 */

import {
  MOCK_JOBS,
  MOCK_FORMATIONS,
  MOCK_PUBLICATIONS,
  MOCK_FAQ,
  MOCK_NOTIFICATIONS,
  MOCK_CURRENT_USER,
  MOCK_DASHBOARD_STATS,
  MOCK_SERVICES,
  MOCK_COMPANIES,
  MOCK_USERS,
  simulateNetworkDelay,
  findById,
} from './mockData';

// ============================================================================
// API OBJECT - Remplace l'ancien api.ts
// ============================================================================
export const api = {
  // ========================================================================
  // AUTH
  // ========================================================================
  loginAdmin: async (email: string, password: string) => {
    await simulateNetworkDelay();
    // Simuler une connexion réussie
    if (email && password) {
      return { success: true, token: 'mock-admin-token-' + Date.now() };
    }
    return { success: false, message: 'Credentials invalid' };
  },

  logout: async () => {
    await simulateNetworkDelay();
    return { success: true };
  },

  getCurrentUser: async () => {
    await simulateNetworkDelay();
    return { data: MOCK_CURRENT_USER };
  },

  // ========================================================================
  // JOBS
  // ========================================================================
  getJobs: async (params?: any) => {
    await simulateNetworkDelay();
    return { data: MOCK_JOBS };
  },

  getJobById: async (jobId: string) => {
    await simulateNetworkDelay();
    const job = findById(MOCK_JOBS, jobId);
    return { data: job };
  },

  createJob: async (job: any) => {
    await simulateNetworkDelay();
    const newJob = {
      ...job,
      id: 'job-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      view_count: 0,
      applicants_count: 0,
    };
    return { data: newJob };
  },

  updateJob: async (jobId: string, updates: any) => {
    await simulateNetworkDelay();
    const job = findById(MOCK_JOBS, jobId);
    if (job) return { data: { ...job, ...updates } };
    return { data: null };
  },

  deleteJob: async (jobId: string) => {
    await simulateNetworkDelay();
    return { success: true };
  },

  // ========================================================================
  // FORMATIONS
  // ========================================================================
  getFormations: async (params?: any) => {
    await simulateNetworkDelay();
    return { data: MOCK_FORMATIONS };
  },

  getFormationById: async (formationId: string) => {
    await simulateNetworkDelay();
    const formation = findById(MOCK_FORMATIONS, formationId);
    return { data: formation };
  },

  enrollFormation: async (formationId: string) => {
    await simulateNetworkDelay();
    return { success: true, message: 'Enrollment successful' };
  },

  // ========================================================================
  // PUBLICATIONS / NEWSFEED
  // ========================================================================
  getPublications: async (params?: any) => {
    await simulateNetworkDelay();
    return { data: MOCK_PUBLICATIONS };
  },

  getPublicationById: async (pubId: string) => {
    await simulateNetworkDelay();
    const pub = findById(MOCK_PUBLICATIONS, pubId);
    return { data: pub };
  },

  createPublication: async (content: any) => {
    await simulateNetworkDelay();
    const newPub = {
      ...content,
      id: 'pub-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      author: MOCK_CURRENT_USER,
    };
    return { data: newPub };
  },

  deletePublication: async (pubId: string) => {
    await simulateNetworkDelay();
    return { success: true };
  },

  // ========================================================================
  // FAQ
  // ========================================================================
  getFAQ: async () => {
    await simulateNetworkDelay();
    return { data: MOCK_FAQ };
  },

  // ========================================================================
  // NOTIFICATIONS
  // ========================================================================
  getNotifications: async () => {
    await simulateNetworkDelay();
    return { data: MOCK_NOTIFICATIONS };
  },

  markNotificationAsRead: async (notifId: string) => {
    await simulateNetworkDelay();
    return { success: true };
  },

  // ========================================================================
  // DASHBOARD
  // ========================================================================
  getDashboardStats: async () => {
    await simulateNetworkDelay();
    return { data: MOCK_DASHBOARD_STATS };
  },

  // ========================================================================
  // SERVICES
  // ========================================================================
  getServices: async () => {
    await simulateNetworkDelay();
    return { data: MOCK_SERVICES };
  },

  // ========================================================================
  // COMPANIES
  // ========================================================================
  getCompanies: async () => {
    await simulateNetworkDelay();
    return { data: MOCK_COMPANIES };
  },

  getCompanyById: async (companyId: string) => {
    await simulateNetworkDelay();
    const company = findById(MOCK_COMPANIES, companyId);
    return { data: company };
  },

  // ========================================================================
  // USERS
  // ========================================================================
  getUsers: async () => {
    await simulateNetworkDelay();
    return { data: MOCK_USERS };
  },

  getUserById: async (userId: string) => {
    await simulateNetworkDelay();
    const user = findById(MOCK_USERS, userId);
    return { data: user };
  },

  // ========================================================================
  // GENERIC FALLBACKS
  // ========================================================================
  get: async (url: string) => {
    await simulateNetworkDelay();
    console.warn('[API STATIC] GET request to:', url, '-> returning empty data');
    return { data: null };
  },

  post: async (url: string, data: any) => {
    await simulateNetworkDelay();
    console.warn('[API STATIC] POST request to:', url, '-> returning success stub');
    return { success: true, data };
  },

  put: async (url: string, data: any) => {
    await simulateNetworkDelay();
    console.warn('[API STATIC] PUT request to:', url, '-> returning success stub');
    return { success: true, data };
  },

  delete: async (url: string) => {
    await simulateNetworkDelay();
    console.warn('[API STATIC] DELETE request to:', url, '-> returning success stub');
    return { success: true };
  },
};

export default api;
