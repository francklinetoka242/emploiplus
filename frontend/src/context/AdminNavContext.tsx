/**
 * Admin Navigation Context
 * Manages sidebar state, active menu, and user session
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MenuItemId } from '@/types/admin-menu';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin' | 'content-admin';
  photo?: string;
  initials: string;
  permissions?: string[];
}

interface AdminNavContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeMenu: MenuItemId | null;
  setActiveMenu: (menuId: MenuItemId) => void;
  userSession: UserSession | null;
  setUserSession: (session: UserSession | null) => void;
  logout: () => void;
}

export const AdminNavContext = createContext<AdminNavContextType | undefined>(undefined);

export function AdminNavProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuItemId>('dashboard');
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // on mount try to hydrate the context with whatever is left in localStorage
  // (login pages store the raw `admin` object under the key `admin`).
  // we convert it to the simplified `UserSession` shape used by the header
  // so that the role badge, name and initials render correctly.
  //
  // IMPORTANT: After hydrating from localStorage, we verify the session with the server
  // to ensure the data is still valid and up-to-date. This fixes the issue where
  // a page refresh with stale localStorage data causes "Access Denied" errors.
  React.useEffect(() => {
    const stored = localStorage.getItem('admin');
    const token = localStorage.getItem('adminToken');
    
    if (stored && token) {
      try {
        const raw = JSON.parse(stored);
        if (raw && raw.id) {
          // First, create a temporary session from localStorage
          const name =
            raw.first_name && raw.last_name
              ? `${raw.first_name} ${raw.last_name}`
              : raw.firstName && raw.lastName
              ? `${raw.firstName} ${raw.lastName}`
              : raw.prenom && raw.nom
              ? `${raw.prenom} ${raw.nom}`
              : raw.fullName || raw.name || '';

          const initials =
            raw.initials ||
            name
              .split(' ')
              .filter((w: string) => w.length > 0)
              .map((w: string) => w[0] || '')
              .join('')
              .toUpperCase() ||
            (raw.first_name && raw.last_name
              ? (raw.first_name[0] + raw.last_name[0]).toUpperCase()
              : 'AD');

          // Now verify this session with the server to ensure data is fresh and valid
          verifySessionWithServer(token, raw, name, initials);
        }
      } catch {
        // invalid JSON – ignore and leave session null
      }
    }
  }, []);

  // Verify the admin session with the server
  // This ensures that after a page refresh, the session data is still valid
  // and we get the latest admin information from the database
  const verifySessionWithServer = async (
    token: string,
    rawAdmin: any,
    name: string,
    initials: string
  ) => {
    try {
      // Call the verification endpoint with the token
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Token is invalid or expired, clear the session
        console.warn('Session verification failed:', response.status);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        setUserSession(null);
        return;
      }

      const result = await response.json();
      const admin = result.data?.admin;

      if (admin) {
        // Update session with fresh data from server
        const updatedName =
          admin.first_name && admin.last_name
            ? `${admin.first_name} ${admin.last_name}`
            : name;

        const updatedInitials =
          updatedName
            .split(' ')
            .filter((w: string) => w.length > 0)
            .map((w: string) => w[0] || '')
            .join('')
            .toUpperCase() || initials;

        const normalizedRole = (admin.role || 'admin').replace(/_/g, '-') as any;

        setUserSession({
          id: String(admin.id),
          name: updatedName,
          email: admin.email || '',
          role: normalizedRole,
          photo: admin.photo || rawAdmin.photo,
          initials: updatedInitials,
          permissions: admin.permissions || rawAdmin.permissions || [],
        });

        // Update localStorage with fresh data
        localStorage.setItem('admin', JSON.stringify({
          id: admin.id,
          email: admin.email,
          first_name: admin.first_name,
          last_name: admin.last_name,
          role: admin.role,
          permissions: admin.permissions || rawAdmin.permissions || [],
          photo: admin.photo || rawAdmin.photo
        }));
      }
    } catch (error) {
      console.error('Error verifying session with server:', error);
      // On network error during verification, we'll still set the session from localStorage
      // but this will be potentially stale. The routes will still be protected by the guard.
      const normalizedRole = (rawAdmin.role || 'admin').replace(/_/g, '-') as any;
      setUserSession({
        id: String(rawAdmin.id),
        name,
        email: rawAdmin.email || '',
        role: normalizedRole,
        photo: rawAdmin.photo,
        initials,
        permissions: rawAdmin.permissions || [],
      });
    }
  };

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const logout = useCallback(() => {
    setUserSession(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = '/admin/login';
  }, []);

  const value: AdminNavContextType = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    activeMenu,
    setActiveMenu,
    userSession,
    setUserSession,
    logout
  };

  return (
    <AdminNavContext.Provider value={value}>
      {children}
    </AdminNavContext.Provider>
  );
}

export function useAdminNav() {
  const context = useContext(AdminNavContext);
  if (context === undefined) {
    throw new Error('useAdminNav must be used within an AdminNavProvider');
  }
  return context;
}
