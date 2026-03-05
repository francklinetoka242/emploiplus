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
  React.useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      try {
        const raw = JSON.parse(stored);
        if (raw && raw.id) {
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

          setUserSession({
            id: String(raw.id),
            name,
            email: raw.email || '',
            role: raw.role || 'admin',
            photo: raw.photo,
            initials,
          });
        }
      } catch {
        // invalid JSON – ignore and leave session null
      }
    }
  }, []);

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
