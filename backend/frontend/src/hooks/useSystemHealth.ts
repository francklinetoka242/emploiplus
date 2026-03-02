/**
 * SYSTEM HEALTH HOOKS
 * React Query hooks for real-time system health monitoring
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/headers';

// ============================================================================
// TYPES
// ============================================================================

export interface SystemStatusResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'ok' | 'degraded' | 'error';
    api: 'ok' | 'degraded' | 'error';
    system: 'ok' | 'degraded' | 'error';
  };
  timestamp: string;
}

export interface DatabaseHealth {
  status: 'connected' | 'disconnected';
  connections: {
    active: number;
    idle: number;
    waiting: number;
  };
  latency_ms: number;
  uptime_seconds: number;
}

export interface APIHealth {
  avg_response_time_ms: number;
  min_response_time_ms: number;
  max_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;
  request_count: number;
  error_count: number;
  success_rate: number; // 0-100
}

export interface SystemMetrics {
  uptime_seconds: number;
  memory_usage_mb: number;
  memory_limit_mb: number;
  cpu_usage_percent: number;
  loaded_modules: number;
  gc_count: number;
  timestamp: string;
}

export interface HealthCheckResult {
  status: SystemStatusResponse;
  db: DatabaseHealth;
  api: APIHealth;
  system: SystemMetrics;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch overall system health status
 */
export function useSystemStatus() {
  return useQuery<SystemStatusResponse>({
    queryKey: ['system-health', 'status'],
    queryFn: async () => {
      const response = await apiFetch('/api/admin/health', {}, { admin: true });
      return response || {};
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
    retry: 2,
  });
}

/**
 * Fetch database health metrics
 */
export function useDatabaseHealth() {
  return useQuery<DatabaseHealth>({
    queryKey: ['system-health', 'database'],
    queryFn: async () => {
      const response = await apiFetch('/api/admin/health/db', {}, { admin: true });
      return response || {};
    },
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 10000,
    retry: 2,
  });
}

/**
 * Fetch API health metrics
 */
export function useAPIHealth() {
  return useQuery<APIHealth>({
    queryKey: ['system-health', 'api'],
    queryFn: async () => {
      const response = await apiFetch('/api/admin/health/api', {}, { admin: true });
      return response || {};
    },
    refetchInterval: 12000, // Refresh every 12 seconds
    staleTime: 8000,
    retry: 2,
  });
}

/**
 * Fetch system process metrics
 */
export function useSystemMetrics() {
  return useQuery<SystemMetrics>({
    queryKey: ['system-health', 'metrics'],
    queryFn: async () => {
      const response = await apiFetch('/api/admin/health/system', {}, { admin: true });
      return response || {};
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
    retry: 2,
  });
}

/**
 * Fetch all health metrics at once
 */
export function useSystemHealth() {
  return useQuery<HealthCheckResult>({
    queryKey: ['system-health', 'all'],
    queryFn: async (): Promise<HealthCheckResult> => {
      const status = (await apiFetch('/api/admin/health', {}, { admin: true })) as SystemStatusResponse;
      const db = (await apiFetch('/api/admin/health/db', {}, { admin: true })) as DatabaseHealth;
      const api = (await apiFetch('/api/admin/health/api', {}, { admin: true })) as APIHealth;
      const system = (await apiFetch('/api/admin/health/system', {}, { admin: true })) as SystemMetrics;

      return {
        status: status || ({} as SystemStatusResponse),
        db: db || ({} as DatabaseHealth),
        api: api || ({} as APIHealth),
        system: system || ({} as SystemMetrics),
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
    retry: 2,
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status indicator color based on service status
 */
export function getStatusColor(status: 'ok' | 'degraded' | 'error'): string {
  switch (status) {
    case 'ok':
      return 'text-green-600';
    case 'degraded':
      return 'text-orange-600';
    case 'error':
      return 'text-red-600';
  }
}

/**
 * Get status indicator background color based on service status
 */
export function getStatusBgColor(status: 'ok' | 'degraded' | 'error'): string {
  switch (status) {
    case 'ok':
      return 'bg-green-50 border-green-200';
    case 'degraded':
      return 'bg-orange-50 border-orange-200';
    case 'error':
      return 'bg-red-50 border-red-200';
  }
}

/**
 * Get status badge color for overall system status
 */
export function getOverallStatusColor(status: 'healthy' | 'degraded' | 'unhealthy'): string {
  switch (status) {
    case 'healthy':
      return 'from-green-50 to-white border-2 border-green-200';
    case 'degraded':
      return 'from-orange-50 to-white border-2 border-orange-200';
    case 'unhealthy':
      return 'from-red-50 to-white border-2 border-red-200';
  }
}

/**
 * Get status icon color based on status
 */
export function getStatusIconColor(status: 'ok' | 'degraded' | 'error'): string {
  switch (status) {
    case 'ok':
      return 'text-green-600';
    case 'degraded':
      return 'text-orange-600';
    case 'error':
      return 'text-red-600';
  }
}

/**
 * Get status text in French
 */
export function getStatusTextFr(status: 'ok' | 'degraded' | 'error' | 'connected' | 'disconnected'): string {
  const statusMap: Record<string, string> = {
    ok: 'OK',
    degraded: 'Dégradé',
    error: 'Erreur',
    connected: 'Connectée',
    disconnected: 'Déconnectée',
  };
  return statusMap[status] || status;
}

/**
 * Get health status description in French
 */
export function getHealthStatusDescriptionFr(status: 'healthy' | 'degraded' | 'unhealthy'): string {
  switch (status) {
    case 'healthy':
      return 'Système sain - Tous les services fonctionnent normalement';
    case 'degraded':
      return 'Système dégradé - Certains services rencontrent des problèmes';
    case 'unhealthy':
      return 'Système non sain - Un ou plusieurs services sont indisponibles';
  }
}

/**
 * Format bytes as human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format uptime in human-readable format
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}j ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format response time with appropriate unit
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Get CPU usage color indicator
 */
export function getCPUColor(percentage: number): string {
  if (percentage < 50) return 'text-green-600';
  if (percentage < 75) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get memory usage color indicator
 */
export function getMemoryColor(used: number, total: number): string {
  const percentage = (used / total) * 100;
  if (percentage < 50) return 'text-green-600';
  if (percentage < 75) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get success rate color indicator
 */
export function getSuccessRateColor(percentage: number): string {
  if (percentage > 99) return 'text-green-600';
  if (percentage > 95) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get database connection status
 */
export function getConnectionStatus(connections: {
  active: number;
  idle: number;
  waiting: number;
}): 'ok' | 'degraded' | 'error' {
  if (connections.waiting > 5) return 'error';
  if (connections.waiting > 2) return 'degraded';
  return 'ok';
}
