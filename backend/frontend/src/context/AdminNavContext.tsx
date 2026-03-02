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

const AdminNavContext = createContext<AdminNavContextType | undefined>(undefined);

export function AdminNavProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuItemId>('dashboard');

  // Initialize user session from localStorage if available.  The stored
  // `admin` object may come from different endpoints and use different
  // field names (first_name/last_name or prenom/nom).  We normalise it here
  // so `AdminHeader` can display a proper name and initials even before an
  // explicit login through the AdminNavProvider.
  const parseStoredAdmin = (): UserSession | null => {
    try {
      const raw = localStorage.getItem('admin');
      if (!raw) return null;
      const a = JSON.parse(raw);
      // normalise name fields
      const first = a.first_name || a.prenom || a.prenom_admin || a.firstName || '';
      const last = a.last_name || a.nom || a.nom_admin || a.lastName || '';
      const name = (first || last) ? `${first} ${last}`.trim() : (a.name || a.full_name || a.displayName || '');
      const email = a.email || a.mail || '';
      const roleMap: Record<string,string> = {
        super_admin: 'super-admin',
        admin_offres: 'admin',
        admin_users: 'admin',
        content_admin: 'content-admin',
        admin: 'admin',
      };
      const rawRole = a.role || a.level || a.type || 'admin';
      const role = (roleMap[String(rawRole)] || String(rawRole)).toLowerCase() as UserSession['role'];
      const photo = a.avatar_url || a.photo || a.picture || undefined;
      const initials = (first && last) ? (first[0] || '') + (last[0] || '') : (name.split(' ').map((s:string)=>s[0]||'').slice(0,2).join('') || 'AD');
      return {
        id: a.id || a.adminId || a._id || 'admin-unknown',
        name,
        email,
        role,
        photo,
        initials: initials.toUpperCase(),
      };
    } catch (e) {
      return null;
    }
  };

  const [userSession, setUserSession] = useState<UserSession | null>(parseStoredAdmin());

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const logout = useCallback(() => {
    setUserSession(null);
    localStorage.removeItem('auth_token');
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
