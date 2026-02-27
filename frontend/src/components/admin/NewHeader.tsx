/**
 * Admin Header Component
 * Displays account type, user info, and logout button
 */

import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAdminNav } from '@/context/AdminNavContext';

export function AdminHeader() {
  const { toggleSidebar, userSession, logout } = useAdminNav();

  const getRoleLabel = () => {
    if (!userSession) return 'Admin';
    const labels: Record<string, string> = {
      'super-admin': 'Super Administrateur',
      'admin': 'Administrateur',
      'content-admin': 'Administrateur de Contenu'
    };
    return labels[userSession.role] || 'Admin';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side - Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Right Side - User Info & Logout */}
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {getRoleLabel()}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {userSession?.name || 'Admin Utilisateur'}
            </span>
          </div>

          {/* User Avatar */}
          <div className="relative">
            {userSession?.photo ? (
              <img
                src={userSession.photo}
                alt={userSession.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm border-2 border-gray-200">
                {userSession?.initials || 'AD'}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            title="Déconnexion"
          >
            <LogOut
              size={20}
              className="text-gray-600 group-hover:text-red-600 transition-colors"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
