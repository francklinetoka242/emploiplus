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
  full_name?: string;
  role: "super_admin" | "admin_offers" | "admin_users" | "content_admin";
  is_blocked?: boolean;
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
