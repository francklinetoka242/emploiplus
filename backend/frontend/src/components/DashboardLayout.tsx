/**
 * STEP 6: Dashboard Layout Component
 * Main layout wrapper with Sidebar + Header
 */

import React, { useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser, isLoading, sidebarCollapsed, toggleSidebar } = useDashboard();

  /**
   * Restore sidebar state from localStorage on mount
   */
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null && saved !== sidebarCollapsed.toString()) {
      toggleSidebar();
    }
  }, []);

  /**
   * Show loading state if still fetching user
   */
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  /**
   * Show error if no user
   */
  if (!currentUser) {
    return (
      <div className="dashboard-error">
        <div className="error-container">
          <h1>⚠️ Authentication Error</h1>
          <p>Unable to load user profile. Please try logging in again.</p>
          <a href="/admin/login" className="error-link">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Header */}
        <AdminHeader sidebarCollapsed={sidebarCollapsed} onSidebarToggle={toggleSidebar} />

        {/* Page Content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
