/**
 * Admin Sidebar Component
 * Modern collapsible sidebar with menu items
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, LayoutDashboard, Briefcase, BookOpen, Layers, Users, Bell, Shield, History, HelpCircle, FileText, Activity } from 'lucide-react';
import { useAdminNav } from '@/context/AdminNavContext';
import { ADMIN_MENU_ITEMS } from '@/types/admin-menu';

// Icon mapping for menu items
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'LayoutDashboard': LayoutDashboard,
  'Briefcase': Briefcase,
  'BookOpen': BookOpen,
  'Layers': Layers,
  'Users': Users,
  'Bell': Bell,
  'Shield': Shield,
  'History': History,
  'HelpCircle': HelpCircle,
  'FileText': FileText,
  'Activity': Activity
};

export function AdminSidebar() {
  const { sidebarOpen, activeMenu, setActiveMenu, userSession } = useAdminNav();
  const location = useLocation();

  const getRoleLabel = () => {
    if (!userSession) return 'Admin';
    const key = userSession.role.replace(/_/g, '-');
    const labels: Record<string, string> = {
      'super-admin': 'Super Admin',
      'admin': 'Administrateur',
      'content-admin': 'Administrateur de Contenu',
      'admin-offres': 'Admin Offres',
      'admin-users': 'Admin Utilisateurs',
    };
    return labels[key] || 'Admin';
  };

  const handleMenuClick = (menuId: any) => {
    setActiveMenu(menuId);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-all duration-300 ease-in-out z-50 ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-center border-b border-slate-700">
          <div className={`flex items-center gap-3 transition-all duration-300 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">{userSession?.initials || 'SA'}</span>
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">{getRoleLabel()}</span>
                <span className="text-slate-400 text-xs">{userSession?.name || 'Dashboard'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="space-y-2 px-3">
            {ADMIN_MENU_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div className="flex-shrink-0">
                    {Icon && <Icon size={20} className="flex-shrink-0" />}
                  </div>

                  {sidebarOpen && (
                    <>
                      <span className="flex-1 font-medium text-sm">{item.label}</span>
                      {isActive && (
                        <ChevronRight size={16} className="text-blue-300" />
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed sidebar */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-slate-100 text-sm rounded whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className={`border-t border-slate-700 p-4 ${!sidebarOpen && 'flex justify-center'}`}>
          <div className={`text-xs text-slate-400 text-center ${!sidebarOpen && 'hidden'}`}>
            <p>Super Admin Panel</p>
            <p className="mt-1 text-slate-500">v1.0</p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
      )}
    </>
  );
}
