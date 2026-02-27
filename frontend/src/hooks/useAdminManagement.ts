/**
 * useAdminManagement - Custom React Hook
 * Handles all admin management API calls and state
 * 
 * Usage:
 * const {
 *   admins,
 *   loading,
 *   error,
 *   blockAdmin,
 *   deleteAdmin,
 *   changeRole,
 *   resendInvitation,
 *   verifyStatus,
 *   refetch
 * } = useAdminManagement();
 */

import { useState, useCallback, useEffect } from 'react';

export interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_level: number;
  role_name: string;
  status: 'active' | 'pending' | 'blocked';
  created_at: string;
  last_login: string | null;
  token_expires_at: string | null;
  token_expires_in_hours?: number | null;
  is_token_expired?: boolean;
}

export interface AdminVerificationStatus {
  id: number;
  status: string;
  token_expires_at: string | null;
  is_expired: boolean;
  expires_in_hours: number | null;
  requires_resend: boolean;
}

interface UseAdminManagementReturn {
  admins: Admin[];
  loading: boolean;
  error: string | null;
  blockAdmin: (adminId: number) => Promise<void>;
  unblockAdmin: (adminId: number) => Promise<void>;
  deleteAdmin: (adminId: number) => Promise<void>;
  changeRole: (adminId: number, roleLevel: number) => Promise<void>;
  resendInvitation: (adminId: number) => Promise<void>;
  verifyStatus: (adminId: number) => Promise<AdminVerificationStatus | null>;
  refetch: (filters?: {
    status?: string;
    role?: number;
    search?: string;
  }) => Promise<void>;
}

const API_BASE = process.env.REACT_APP_API_URL || 'https://emploiplus-group.com';

export const useAdminManagement = (initialFilters?: {
  status?: string;
  role?: number;
  search?: string;
}): UseAdminManagementReturn => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get JWT token from localStorage
  const getToken = (): string | null => {
    return localStorage.getItem('adminToken');
  };

  // Fetch admins list
  const refetch = useCallback(async (filters?: {
    status?: string;
    role?: number;
    search?: string;
  }) => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        setError('Authentification requise');
        return;
      }

      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.role) params.append('role', filters.role.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(
        `${API_BASE}/api/admin/management/admins?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setAdmins(data.admins || []);
        setError(null);
      } else {
        setError(data.message || 'Erreur lors de la récupération');
        setAdmins([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Block admin
  const blockAdmin = useCallback(async (adminId: number) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentification requise');

      const response = await fetch(
        `${API_BASE}/api/admin/management/admins/${adminId}/block`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setAdmins(admins.map(admin =>
          admin.id === adminId ? { ...admin, status: 'blocked' as const } : admin
        ));
      } else {
        throw new Error(data.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [admins]);

  // Unblock admin
  const unblockAdmin = useCallback(async (adminId: number) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentification requise');

      const response = await fetch(
        `${API_BASE}/api/admin/management/admins/${adminId}/unblock`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setAdmins(admins.map(admin =>
          admin.id === adminId ? { ...admin, status: 'active' as const } : admin
        ));
      } else {
        throw new Error(data.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [admins]);

  // Delete admin
  const deleteAdmin = useCallback(async (adminId: number) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentification requise');

      const response = await fetch(
        `${API_BASE}/api/admin/management/admins/${adminId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setAdmins(admins.filter(admin => admin.id !== adminId));
      } else {
        throw new Error(data.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [admins]);

  // Change admin role
  const changeRole = useCallback(async (adminId: number, roleLevel: number) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentification requise');

      const response = await fetch(
        `${API_BASE}/api/admin/management/admins/${adminId}/role`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role_level: roleLevel })
        }
      );

      const data = await response.json();

      if (data.success) {
        const roleNames: Record<number, string> = {
          1: 'Super Admin',
          2: 'Admin Content',
          3: 'Admin Users',
          4: 'Admin Stats',
          5: 'Admin Billing'
        };

        setAdmins(admins.map(admin =>
          admin.id === adminId
            ? { ...admin, role_level: roleLevel, role_name: roleNames[roleLevel] }
            : admin
        ));
      } else {
        throw new Error(data.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [admins]);

  // Resend invitation
  const resendInvitation = useCallback(async (adminId: number) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentification requise');

      const response = await fetch(
        `${API_BASE}/api/admin/management/admins/${adminId}/resend-invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Verify admin status
  const verifyStatus = useCallback(async (adminId: number): Promise<AdminVerificationStatus | null> => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentification requise');

      const response = await fetch(
        `${API_BASE}/api/admin/management/admins/${adminId}/verify-status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refetch(initialFilters);
  }, []);

  return {
    admins,
    loading,
    error,
    blockAdmin,
    unblockAdmin,
    deleteAdmin,
    changeRole,
    resendInvitation,
    verifyStatus,
    refetch
  };
};

export default useAdminManagement;
