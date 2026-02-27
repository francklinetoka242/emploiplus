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
  const [userSession, setUserSession] = useState<UserSession | null>(null);

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
