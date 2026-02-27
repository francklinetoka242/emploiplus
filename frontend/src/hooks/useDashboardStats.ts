/**
 * Admin Dashboard - React Query Hooks
 * Handles fetching statistics and historical data for charts
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardStats {
  total_users: number;
  total_candidates: number;
  total_companies: number;
  total_admins: number;
  total_jobs: number;
  total_active_jobs: number;
  total_closed_jobs: number;
  total_applications: number;
  applications_pending: number;
  applications_validated: number;
  applications_rejected: number;
  total_formations: number;
  total_publications: number;
  total_portfolios: number;
  total_services: number;
  monthly_revenue: number;
  total_subscription_revenue: number;
  active_subscriptions: number;
  timestamp: string;
}

export interface HistoricalData {
  date: string;
  count?: number;
  total?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  transactions?: number;
  revenue?: number;
}

export interface DashboardHistory {
  user_registrations: HistoricalData[];
  applications: HistoricalData[];
  job_postings: HistoricalData[];
  formations: HistoricalData[];
  revenue: HistoricalData[];
}

export interface CategoryBreakdown {
  name: string;
  value: number;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook: Get all dashboard statistics
 * Used for KPI cards and overall metrics
 */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    retry: 2,
  });
}

/**
 * Hook: Get historical data for charts
 * Used for line charts showing trends over 30 days
 */
export function useDashboardHistory() {
  return useQuery<DashboardHistory>({
    queryKey: ['dashboard', 'history'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/history', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard history');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
    retry: 2,
  });
}

/**
 * Hook: Get breakdown data for pie/doughnut charts
 * Used to show distribution by category
 */
export function useDashboardBreakdown(category: 'jobs' | 'applications' | 'users' | 'formations') {
  return useQuery<CategoryBreakdown[]>({
    queryKey: ['dashboard', 'breakdown', category],
    queryFn: async () => {
      const response = await fetch(`/api/admin/dashboard/breakdown?category=${category}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch breakdown data');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
  });
}

/**
 * Hook: Combined stats and history
 * Useful for components needing both data sets
 */
export function useDashboardData() {
  const stats = useDashboardStats();
  const history = useDashboardHistory();

  return {
    stats,
    history,
    isLoading: stats.isLoading || history.isLoading,
    isError: stats.isError || history.isError,
    error: stats.error || history.error,
  };
}

/**
 * Helper: Format number for display
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Helper: Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Helper: Get color for status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#eab308',
    approved: '#22c55e',
    validated: '#22c55e',
    rejected: '#ef4444',
    active: '#22c55e',
    inactive: '#6b7280',
  };
  return colors[status.toLowerCase()] || '#3b82f6';
}
