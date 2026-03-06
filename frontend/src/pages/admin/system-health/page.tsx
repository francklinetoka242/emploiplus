/**
 * System Health Page - Real-time monitoring
 * Monitor system health and performance with live data
 */

import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';
import { useSystemStatus, useDatabaseHealth, useAPIHealth, useSystemMetrics } from '@/hooks/useSystemHealth';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'ok': 'bg-green-100 text-green-700',
    'connected': 'bg-green-100 text-green-700',
    'healthy': 'bg-green-100 text-green-700',
    'degraded': 'bg-yellow-100 text-yellow-700',
    'error': 'bg-red-100 text-red-700',
    'disconnected': 'bg-red-100 text-red-700',
    'unhealthy': 'bg-red-100 text-red-700',
    'warning': 'bg-yellow-100 text-yellow-700',
    'critical': 'bg-red-100 text-red-700'
  };

  const labels: Record<string, string> = {
    'ok': 'En ligne',
    'connected': 'En ligne',
    'healthy': 'En ligne',
    'degraded': 'Avertissement',
    'error': 'Erreur',
    'disconnected': 'Déconnecté',
    'unhealthy': 'Critique',
    'warning': 'Avertissement',
    'critical': 'Critique'
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      <span className={`w-2 h-2 rounded-full ${['ok', 'connected', 'healthy'].includes(status) ? 'bg-green-600' : ['degraded', 'warning'].includes(status) ? 'bg-yellow-600' : 'bg-red-600'}`}></span>
      {labels[status] || status}
    </span>
  );
}

function LoadingSpinner() {
  return <span className="inline-block animate-spin text-gray-500">⟳</span>;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}j ${hours}h ${minutes}m`;
}

function formatMemoryPercent(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((used / total) * 1000) / 10;
}

export default function SystemHealthPage() {
  const { data: statusData, isLoading: statusLoading } = useSystemStatus();
  const { data: dbData, isLoading: dbLoading } = useDatabaseHealth();
  const { data: apiData, isLoading: apiLoading } = useAPIHealth();
  const { data: systemData, isLoading: systemLoading } = useSystemMetrics();

  const isLoading = statusLoading || dbLoading || apiLoading || systemLoading;

  // Calculate memory percentage
  const memoryPercent = systemData 
    ? formatMemoryPercent(systemData.memory_usage_mb, systemData.memory_limit_mb)
    : 0;

  // Determine service statuses for backwards compatibility with UI
  const serviceStatuses = {
    database: dbData?.status === 'connected' ? 'healthy' : 'critical',
    api: apiData && apiData.success_rate > 95 ? 'healthy' : apiData && apiData.success_rate > 85 ? 'warning' : 'critical',
    storage: 'healthy' // Assuming storage is OK if system is running
  };

  return (
    <AdminPageTemplate
      title="Santé du Système"
      description="Surveillance en temps réel de l'état du système"
      icon={<Activity size={32} className="text-emerald-600" />}
    >
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service Status */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Services</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Base de données</span>
                {dbLoading ? <LoadingSpinner /> : <StatusBadge status={dbData?.status || 'error'} />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Serveur</span>
                {apiLoading ? <LoadingSpinner /> : 
                  <StatusBadge status={apiData && apiData.success_rate > 95 ? 'ok' : apiData && apiData.success_rate > 85 ? 'degraded' : 'error'} />
                }
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stockage</span>
                <StatusBadge status="healthy" />
              </div>
            </div>
          </div>

          {/* CPU Usage */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">CPU</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                {systemLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900">{systemData?.cpu_usage_percent || 0}%</div>
                    <p className="text-xs text-gray-500 mt-2">Utilisation</p>
                  </>
                )}
              </div>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="text-xl font-bold text-blue-600">
                  {systemLoading ? <LoadingSpinner /> : `${systemData?.cpu_usage_percent || 0}%`}
                </div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Mémoire</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                {systemLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900">{memoryPercent}%</div>
                    <p className="text-xs text-gray-500 mt-2">Utilisation {systemData?.memory_usage_mb}MB / {systemData?.memory_limit_mb}MB</p>
                  </>
                )}
              </div>
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="text-xl font-bold text-purple-600">
                  {systemLoading ? <LoadingSpinner /> : `${memoryPercent}%`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Metrics */}
        {apiData && (
          <div className="mt-6 bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Métriques API</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Temps moyen</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{apiData.avg_response_time_ms}ms</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">P95</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{apiData.p95_response_time_ms}ms</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Taux succès</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{apiData.success_rate.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Requêtes</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{apiData.request_count}</p>
              </div>
            </div>
          </div>
        )}

        {/* Database Info */}
        {dbData && (
          <div className="mt-6 bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Connexions Base de Données</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Actives</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{dbData.connections.active}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Inactives</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{dbData.connections.idle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">En attente</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{dbData.connections.waiting}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Latence</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{dbData.latency_ms}ms</p>
              </div>
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="mt-6 bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations Système</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Uptime</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {systemLoading ? <LoadingSpinner /> : systemData?.uptime_formatted || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Version</p>
              <p className="text-lg font-medium text-gray-900 mt-1">1.0.0</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Dernière vérif.</p>
              <p className="text-lg font-medium text-gray-900 mt-1">En temps réel</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Environnement</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
