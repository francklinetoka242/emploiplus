/**
 * Audit Logs - React Query Hooks & Utilities
 * Handles fetching, filtering, and exporting audit logs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

// ============================================================================
// TYPES
// ============================================================================

export interface AuditLog {
  id: number;
  admin_id: number;
  admin_name: string;
  admin_level: number;
  action: string;
  resource_type: string;
  resource_id: number;
  route: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  ip_address: string;
  user_agent: string;
  status_code: number;
  response_time_ms: number;
  created_at: string;
  details?: Record<string, any>;
}

export interface AuditFilters {
  admin_id?: number;
  admin_level?: number;
  action?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filters: AuditFilters;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook: Fetch audit logs with filters
 */
export function useAuditLogs(filters: AuditFilters = {}) {
  return useQuery<AuditLog[]>({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.admin_id) params.append('admin_id', filters.admin_id.toString());
      if (filters.admin_level) params.append('admin_level', filters.admin_level.toString());
      if (filters.action) params.append('action', filters.action);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      params.append('limit', (filters.limit || 50).toString());
      params.append('offset', (filters.offset || 0).toString());

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook: Delete audit log entry
 */
export function useDeleteAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: number) => {
      const response = await fetch(`/api/admin/audit-logs/${logId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete audit log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast({
        title: 'Succès',
        description: 'Entrée d\'audit supprimée avec succès',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'entrée d\'audit',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook: Export audit logs
 */
export function useExportAuditLogs() {
  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      const params = new URLSearchParams();
      
      if (options.filters.admin_id) params.append('admin_id', options.filters.admin_id.toString());
      if (options.filters.admin_level) params.append('admin_level', options.filters.admin_level.toString());
      if (options.filters.action) params.append('action', options.filters.action);
      if (options.filters.date_from) params.append('date_from', options.filters.date_from);
      if (options.filters.date_to) params.append('date_to', options.filters.date_to);

      const response = await fetch(
        `/api/admin/audit-logs/export/${options.format}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to export audit logs');

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${
        options.format === 'excel' ? 'xlsx' : options.format
      }`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Audit logs exportés avec succès',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter les audit logs',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook: Get audit statistics
 */
export function useAuditStatistics(filters: AuditFilters = {}) {
  return useQuery({
    queryKey: ['audit-stats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.admin_id) params.append('admin_id', filters.admin_id.toString());
      if (filters.admin_level) params.append('admin_level', filters.admin_level.toString());
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await fetch(`/api/admin/audit-stats?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch audit stats');
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format audit action for display
 */
export function formatActionName(action: string): string {
  const actionMap: Record<string, string> = {
    create: '✨ Création',
    update: '✏️ Modification',
    delete: '🗑️ Suppression',
    view: '👁️ Consultation',
    export: '📤 Export',
    login: '🔓 Connexion',
    logout: '🔒 Déconnexion',
    block: '🚫 Blocage',
    unblock: '✅ Déblocage',
  };
  return actionMap[action.toLowerCase()] || action;
}

/**
 * Format admin level for display
 */
export function formatAdminLevel(level: number): string {
  const levels: Record<number, string> = {
    1: 'Super Admin',
    2: 'Admin Content',
    3: 'Admin Users',
    4: 'Admin Stats',
    5: 'Admin Billing',
  };
  return levels[level] || `Level ${level}`;
}

/**
 * Format date for display
 */
export function formatAuditDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format response time
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Get action badge color
 */
export function getActionBadgeColor(action: string): string {
  const colors: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    view: 'bg-gray-100 text-gray-800',
    export: 'bg-purple-100 text-purple-800',
    login: 'bg-cyan-100 text-cyan-800',
    logout: 'bg-yellow-100 text-yellow-800',
    block: 'bg-red-100 text-red-800',
    unblock: 'bg-green-100 text-green-800',
  };
  return colors[action.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

/**
 * Get status code badge color
 */
export function getStatusBadgeColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return 'bg-green-100 text-green-800';
  } else if (statusCode >= 300 && statusCode < 400) {
    return 'bg-blue-100 text-blue-800';
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'bg-yellow-100 text-yellow-800';
  } else if (statusCode >= 500) {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-gray-100 text-gray-800';
}

/**
 * Get status code name
 */
export function getStatusCodeName(statusCode: number): string {
  const statusMap: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Server Error',
    503: 'Service Unavailable',
  };
  return statusMap[statusCode] || `Code ${statusCode}`;
}

/**
 * Check if response time is acceptable
 */
export function isResponseTimeAcceptable(ms: number): boolean {
  return ms < 1000; // Less than 1 second
}

/**
 * Parse IP address
 */
export function parseIPAddress(ip: string): string {
  // Hide partial IP for privacy
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.${parts[3]}`;
  }
  return ip;
}
