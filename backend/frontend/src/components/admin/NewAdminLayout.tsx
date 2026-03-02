/**
 * Admin Layout
 * Main layout component - completely rebuilt from scratch
 * Combines Header, Sidebar, and MainContent in a modern, clean interface
 */

import React from 'react';
import { AdminSidebar } from '@/components/admin/NewSidebar';
import { AdminHeader } from '@/components/admin/NewHeader';
import { AdminMainContent } from '@/components/admin/NewMainContent';
import { useAdminNav } from '@/context/AdminNavContext';

export function NewAdminLayout() {
  const { sidebarOpen } = useAdminNav();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Content Area with responsive padding */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-72' : 'ml-20'
          }`}
        >
          <AdminMainContent />
        </div>
      </div>
    </div>
  );
}

export default NewAdminLayout;
