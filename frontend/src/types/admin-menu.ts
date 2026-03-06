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
    description: 'Gestion des offres d\'emploi'
  },
  {
    id: 'formations',
    label: 'Formations',
    icon: 'BookOpen',
    path: '/admin/formations',
    description: 'Gestion des formations'
  },
  {
    id: 'catalogs',
    label: 'Catalogues & Services',
    icon: 'Layers',
    path: '/admin/catalogues-services',
    description: 'Catalogues et services'
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: 'Users',
    path: '/admin/users',
    description: 'Gestion des utilisateurs'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'Bell',
    path: '/admin/notifications',
    description: 'Gestion des notifications'
  },
  {
    id: 'admins',
    label: 'Administrateurs',
    icon: 'Shield',
    path: '/admin/admins',
    description: 'Gestion des administrateurs'
  },
  {
    id: 'login-history',
    label: 'Historique de connexion',
    icon: 'History',
    path: '/admin/login-history',
    description: 'Historique des connexions'
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: 'HelpCircle',
    path: '/admin/faqs',
    description: 'Questions fréquemment posées'
  },
  {
    id: 'documentation',
    label: 'Documentation',
    icon: 'FileText',
    path: '/admin/documents',
    description: 'Documentation du système'
  },
  {
    id: 'documentations',
    label: 'Documentations',
    icon: 'Shield',
    path: '/admin/documentations',
    description: 'Politiques et documents légaux'
  },
  {
    id: 'system-health',
    label: 'Santé du Système',
    icon: 'Activity',
    path: '/admin/system-health',
    description: 'État de la santé du système'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: 'Settings',
    path: '/admin/parametres',
    description: 'Configuration générale du système'
  }
];
