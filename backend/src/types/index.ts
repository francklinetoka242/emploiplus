/**
 * Core Type Definitions - Simplified for Stable Build
 * 
 * Disabled types (temporarily commented):
 * - Job, Publisher, Formation, Message, Conversation
 * - Advanced filters and complex types
 * 
 * Active types:
 * - Admin (for authentication)
 */

/**
 * Admin/Super Admin user type
 */
export interface Admin {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "super_admin" | "admin_offers" | "admin_users" | "content_admin";
  is_blocked?: boolean;
  is_verified?: boolean;
  created_at?: string;
}

/**
 * RBAC Types for Super Admin System
 */

export interface AdminRole {
  id: number;
  name: 'super_admin' | 'admin_content' | 'admin_users';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  slug: 'perm_jobs' | 'perm_trainings' | 'perm_services' | 'perm_faq' | 
        'perm_users' | 'perm_editoriale' | 'perm_dashboard' | 
        'perm_admin_management' | 'perm_system_health';
  description: string;
  created_at: string;
}

export interface AdminUser {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
  role_id: number;
  role?: AdminRole;
  is_active: boolean;
  last_login?: string;
  login_attempts: number;
  locked_until?: string;
  permissions?: Permission[];
  customPermissions?: AdminCustomPermission[];
  created_at: string;
  updated_at: string;
}

export interface AdminCustomPermission {
  id: number;
  admin_id: number;
  permission_id: number;
  is_granted: boolean;
  created_by?: number;
  created_at: string;
}

export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  created_at: string;
}

export interface AuditLog {
  id: number;
  admin_id: number;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  table_name?: string;
  record_id?: number;
  changes?: Record<string, { old: string; new: string }>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  
  // Admin Panel Fields (new columns from migration)
  company_id?: number;
  requirements?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_level?: string;
  deadline_date?: string;
  is_closed?: boolean;
  
  // Public API Fields (existing columns, kept for compatibility)
  company?: string;
  type?: string;
  salary?: string;
  sector?: string;
  image_url?: string;
  application_url?: string;
  application_via_emploi?: boolean;
  deadline?: string;
  published?: boolean;
  published_at?: string;
}

export interface Training {
  id: number;
  title: string;
  description?: string;
  provider?: string;
  duration?: string;
  level?: string;
  category?: string;
  deadline_date?: string;
  certification?: string;
  cost?: number;
  is_closed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  published?: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StaticPage {
  id: number;
  slug: 'privacy-policy' | 'terms-of-service' | 'user-guide' | 'legal';
  title: string;
  content: string;
  meta_description?: string;
  published: boolean;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionBadge {
  id: number;
  service_catalog_id: number;
  badge_text: string;
  badge_color: 'red' | 'yellow' | 'green' | 'blue';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRating {
  id: number;
  service_id: number;
  rating: number; // 0-5
  review_count: number;
  updated_at: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  database: {
    status: 'connected' | 'disconnected';
    poolSize?: number;
    activeConnections?: number;
  };
  system: {
    ram: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    cpu: {
      cores: number;
      usage: number;
    };
    uptime: number;
  };
  disk?: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
}

/**
 * Service Catalog Type
 */
export interface ServiceCatalog {
  id: number;
  name: string;
  description?: string;
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Service Type
 */
export interface Service {
  id: number;
  catalog_id: number;
  name: string;
  description?: string;
  price?: number;
  rating?: number;
  is_promo: boolean;
  promo_text?: string;
  is_visible: boolean;
  image_url?: string;
  brochure_url?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * DISABLED TYPES (temporarily commented out)
 * These will be re-enabled after core auth is working
 */

/*
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  sector: string;
  description?: string;
  salary?: string;
  published: boolean;
  created_at: string;
}

export interface Publisher {
  id: string;
  name: string;
  logo?: string;
}

export interface Formation {
  id: string;
  title: string;
  description: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: string[];
}
*/
