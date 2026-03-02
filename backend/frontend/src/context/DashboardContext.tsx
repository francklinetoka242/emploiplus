/**
 * STEP 6: Dashboard Context
 * Global state for dashboard (sidebar, user, auth)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminUser,
  DashboardContextType,
  UpdateProfileRequest,
  ProfileUpdateResponse
} from '../types/dashboard.types';

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load user on mount
  useEffect(() => {
    refreshUser();
  }, []);

  /**
   * Refresh current user info from server
   */
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        setCurrentUser(null);
        return;
      }

      const response = await fetch('/api/admin/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('adminToken');
        setCurrentUser(null);
        window.location.href = '/admin/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setCurrentUser(data.data);
      } else {
        setError(data.message || 'Failed to load user profile');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error refreshing user:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(
    async (updateData: UpdateProfileRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch('/api/admin/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        const data: ProfileUpdateResponse = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to update profile');
        }

        if (data.data) {
          setCurrentUser(data.data);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');

      // Optional: Notify backend of logout
      if (token) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {
          // Ignore errors on logout
        });
      }

      // Clear local state
      localStorage.removeItem('adminToken');
      setCurrentUser(null);
      setError(null);

      // Redirect to login
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('Error during logout:', err);
      // Force redirect anyway
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
  }, []);

  /**
   * Toggle sidebar collapse state
   */
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
    // Persist to localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(!sidebarCollapsed));
  }, [sidebarCollapsed]);

  const value: DashboardContextType = {
    currentUser,
    isLoading,
    error,
    sidebarCollapsed,
    toggleSidebar,
    updateUserProfile,
    logout,
    refreshUser
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// ============================================
// HOOK: USE DASHBOARD CONTEXT
// ============================================

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

// ============================================
// HOOK: USE CURRENT USER
// ============================================

export const useCurrentUser = (): AdminUser | null => {
  const { currentUser } = useDashboard();
  return currentUser;
};

// ============================================
// HOOK: USE SIDEBAR STATE
// ============================================

export const useSidebarState = () => {
  const { sidebarCollapsed, toggleSidebar } = useDashboard();
  return { sidebarCollapsed, toggleSidebar };
};
