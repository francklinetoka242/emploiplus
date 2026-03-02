import { useQuery } from '@tanstack/react-query';

export interface AuditLogRow {
  id: number;
  admin_id?: number;
  admin_name: string;
  access_level: number;
  action: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export function useAuditLogs(page = 1, limit = 25) {
  return useQuery(['monitoring','audit-logs', page, limit], async () => {
    const res = await fetch(`/api/admin/monitoring/audit-logs?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  }, { staleTime: 1000 * 60 * 2 });
}

export function useSystemHealth() {
  return useQuery(['monitoring','health'], async () => {
    const res = await fetch('/api/admin/monitoring/health', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }});
    if (!res.ok) throw new Error('Failed to load system health');
    return res.json();
  }, { refetchInterval: 5000, staleTime: 3000 });
}
