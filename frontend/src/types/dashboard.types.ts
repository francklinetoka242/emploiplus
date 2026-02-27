/**
 * STEP 6: Dashboard Types & Interfaces
 * Types for layout, sidebar, header, and user profile
 */

// ============================================
// ADMIN USER INTERFACE
// ============================================

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_level: 1 | 2 | 3 | 4 | 5;
  role_name: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  status: 'active' | 'pending' | 'blocked';
  created_at: string;
  last_login?: string;
  token_expires_at?: string;
}

// ============================================
// SIDEBAR MENU ITEMS
// ============================================

export type SidebarItemType =
  | 'dashboard'
  | 'admins'
  | 'content'
  | 'users'
  | 'analytics'
  | 'billing'
  | 'settings'
  | 'audit'
  | 'reports';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string; // Icon name (e.g., 'dashboard', 'users')
  path: string; // Route path
  type: SidebarItemType;
  roles: (1 | 2 | 3 | 4 | 5)[]; // Visible for these roles
  children?: SidebarMenuItem[]; // Submenu items
  badge?: number; // Notification badge count
  isActive?: boolean; // Current route
}

export interface SidebarState {
  isCollapsed: boolean;
  activeItem: string | null;
  toggleSidebar: () => void;
  setActiveItem: (itemId: string) => void;
}

// ============================================
// HEADER/USER INFO
// ============================================

export interface UserHeaderInfo {
  name: string; // "Jean Dupont"
  initials: string; // "JD"
  avatar?: string; // URL or null
  role: string; // "Super Admin"
  roleLevel: 1 | 2 | 3 | 4 | 5;
  email: string;
  lastLogin?: string;
}

// ============================================
// PROFILE UPDATE
// ============================================

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string; // URL to uploaded image
}

export interface UploadAvatarResponse {
  success: boolean;
  url?: string;
  message?: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  data?: AdminUser;
  message?: string;
  errors?: Record<string, string[]>;
}

// ============================================
// DASHBOARD LAYOUT
// ============================================

export interface DashboardLayoutProps {
  children: React.ReactNode;
  currentUser: AdminUser;
}

export interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  menuItems: SidebarMenuItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

export interface HeaderProps {
  currentUser: AdminUser;
  onLogout: () => void;
  sidebarCollapsed: boolean;
}

// ============================================
// THEMES & STYLING
// ============================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  light: string;
  dark: string;
}

// ============================================
// DASHBOARD CONTEXT
// ============================================

export interface DashboardContextType {
  currentUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  updateUserProfile: (data: UpdateProfileRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================
// ROLE DEFINITIONS
// ============================================

export const ROLE_DEFINITIONS = {
  1: {
    name: 'Super Admin',
    color: 'purple',
    description: 'All access, system administration',
    permissions: ['all']
  },
  2: {
    name: 'Admin Content',
    color: 'blue',
    description: 'Manage jobs, trainings, services',
    permissions: ['content']
  },
  3: {
    name: 'Admin Users',
    color: 'green',
    description: 'Manage user accounts',
    permissions: ['users']
  },
  4: {
    name: 'Admin Stats',
    color: 'orange',
    description: 'View analytics only',
    permissions: ['analytics']
  },
  5: {
    name: 'Admin Billing',
    color: 'red',
    description: 'Manage subscriptions',
    permissions: ['billing']
  }
} as const;

// ============================================
// SIDEBAR MENU TEMPLATE
// ============================================

export const SIDEBAR_MENU_TEMPLATE: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    path: '/admin/dashboard',
    type: 'dashboard',
    roles: [1, 2, 3, 4, 5]
  },
  {
    id: 'admins',
    label: 'Gérer Admins',
    icon: 'users',
    path: '/admin/admins',
    type: 'admins',
    roles: [1],
    badge: 3 // Example: 3 pending admins
  },
  {
    id: 'content',
    label: 'Contenu',
    icon: 'file-text',
    path: '/admin/content',
    type: 'content',
    roles: [1, 2]
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: 'users',
    path: '/admin/users',
    type: 'users',
    roles: [1, 3]
  },
  {
    id: 'analytics',
    label: 'Analytiques',
    icon: 'bar-chart',
    path: '/admin/analytics',
    type: 'analytics',
    roles: [1, 4]
  },
  {
    id: 'billing',
    label: 'Facturation',
    icon: 'credit-card',
    path: '/admin/billing',
    type: 'billing',
    roles: [1, 5]
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: 'list',
    path: '/admin/audit',
    type: 'audit',
    roles: [1]
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: 'settings',
    path: '/admin/settings',
    type: 'settings',
    roles: [1, 2, 3, 4, 5]
  }
];

// ============================================
// ICON MAPPING
// ============================================

export const ICON_MAP = {
  home: '🏠',
  users: '👥',
  'file-text': '📄',
  'bar-chart': '📊',
  'credit-card': '💳',
  list: '📋',
  settings: '⚙️',
  'arrow-left': '←',
  'arrow-right': '→',
  logout: '🚪',
  profile: '👤',
  edit: '✏️',
  camera: '📷',
  check: '✓',
  close: '✕',
  loading: '⏳'
} as const;

// ============================================
// PROFILE PAGE STATE
// ============================================

export interface ProfileEditFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
}

export interface ProfileEditState {
  isEditing: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  error: string | null;
  uploadingAvatar: boolean;
  previewAvatar?: string;
}
