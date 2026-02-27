/**
 * Admin Navigation Sidebar
 * Displays navigation buttons for different admin modules with permission checks
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldUser, 
  Briefcase, 
  BookOpen, 
  Package, 
  FileText, 
  HelpCircle, 
  Lock 
} from 'lucide-react';
import { Permission } from '../../../types';

interface AdminNavProps {
  isOpen: boolean;
  currentModule: string;
  onModuleChange: (module: string) => void;
  adminUser: {
    role: { name: string };
    permissions: Permission[];
  };
  hasPermission: (slug: string) => boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
  color?: string;
}

const AdminNav: React.FC<AdminNavProps> = ({
  isOpen,
  currentModule,
  onModuleChange,
  adminUser,
  hasPermission
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: <LayoutDashboard size={20} />,
      permission: 'perm_dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'admins',
      label: 'Administrateurs',
      icon: <ShieldUser size={20} />,
      permission: 'perm_admin_management',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'users',
      label: 'Gestion Utilisateurs',
      icon: <Users size={20} />,
      permission: 'perm_users',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'jobs',
      label: 'Offres & Formations',
      icon: <Briefcase size={20} />,
      permission: 'perm_jobs',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'services',
      label: 'Catalogue Services',
      icon: <Package size={20} />,
      permission: 'perm_services',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'editorial',
      label: 'Gestion Éditoriale',
      icon: <FileText size={20} />,
      permission: 'perm_editoriale',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <HelpCircle size={20} />,
      permission: 'perm_faq',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  return (
    <aside
      className={`transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      } bg-gradient-to-b from-gray-900 to-gray-950 text-white shadow-xl flex flex-col`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">EP</span>
          </div>
          {isOpen && <span className="font-bold text-lg">Emploi Plus</span>}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const canAccess = hasPermission(item.permission || 'perm_dashboard');
          const isActive = currentModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              disabled={!canAccess}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                canAccess
                  ? isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 cursor-not-allowed opacity-50'
              }`}
              title={!canAccess ? 'Permission manquante' : item.label}
            >
              {item.icon}
              {isOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {!canAccess && <Lock size={16} />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      {isOpen && (
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          <p>Rôle: <span className="font-semibold text-gray-300">{adminUser.role.name}</span></p>
          <p className="mt-2">Permissions: <span className="font-semibold text-gray-300">{adminUser.permissions.length}</span></p>
        </div>
      )}
    </aside>
  );
};

export default AdminNav;
