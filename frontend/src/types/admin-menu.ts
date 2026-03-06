/**
 * Super Admin Menu Configuration Types
 * Clean menu structure for the rebuilt admin interface
 */

export type MenuItemId = 
  | 'dashboard'
  | 'jobs'
  | 'formations'
  | 'catalogs'
  | 'users'
  | 'notifications'
  | 'admins'
  | 'audit-logs'
  | 'login-history'
  | 'faq'
  | 'documentation'
  | 'documentations'
  | 'system-health'
  | 'settings';

export interface MenuItem {
  id: MenuItemId;
  label: string;
  icon: string;
  path: string;
  description?: string;
  requiredPermission?: string;
  module?: string;
  action?: 'view' | 'edit' | 'delete' | 'special' | 'all';
}

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: 'LayoutDashboard',
    path: '/admin/dashboard',
    description: 'Vue d\'ensemble du système'
  },
  {
    id: 'jobs',
    label: 'Offres d\'emploi',
    icon: 'Briefcase',
    path: '/admin/jobs',
    description: 'Gestion des offres d\'emploi',
    module: 'jobs',
    action: 'view'
  },
  {
    id: 'formations',
    label: 'Formations',
    icon: 'BookOpen',
    path: '/admin/formations',
    description: 'Gestion des formations',
    module: 'formations',
    action: 'view'
  },
  {
    id: 'catalogs',
    label: 'Catalogues & Services',
    icon: 'Layers',
    path: '/admin/catalogues-services',
    description: 'Catalogues et services',
    module: 'catalogues',
    action: 'view'
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: 'Users',
    path: '/admin/users',
    description: 'Gestion des utilisateurs',
    module: 'users',
    action: 'view'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'Bell',
    path: '/admin/notifications',
    description: 'Gestion des notifications',
    module: 'notifications',
    action: 'view'
  },
  {
    id: 'admins',
    label: 'Administrateurs',
    icon: 'Shield',
    path: '/admin/admins',
    description: 'Gestion des administrateurs',
    module: 'admins',
    action: 'view'
  },
  {
    id: 'audit-logs',
    label: 'Historique d\'Audit',
    icon: 'FileText',
    path: '/admin/audit-logs',
    description: 'Journalisation complète des actions administrateur',
    module: 'audit',
    action: 'view'
  },
  {
    id: 'login-history',
    label: 'Historique de connexion',
    icon: 'History',
    path: '/admin/login-history',
    description: 'Historique des connexions',
    module: 'history',
    action: 'view'
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: 'HelpCircle',
    path: '/admin/faqs',
    description: 'Questions fréquemment posées',
    module: 'faq',
    action: 'view'
  },
  {
    id: 'documentation',
    label: 'Documentation',
    icon: 'FileText',
    path: '/admin/documents',
    description: 'Documentation du système',
    module: 'faq',
    action: 'view'
  },
  {
    id: 'documentations',
    label: 'Documentations',
    icon: 'Shield',
    path: '/admin/documentations',
    description: 'Politiques et documents légaux',
    module: 'faq',
    action: 'view'
  },
  {
    id: 'system-health',
    label: 'Santé du Système',
    icon: 'Activity',
    path: '/admin/system-health',
    description: 'État de la santé du système',
    module: 'system',
    action: 'view'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: 'Settings',
    path: '/admin/parametres',
    description: 'Configuration générale du système'
  }
];
