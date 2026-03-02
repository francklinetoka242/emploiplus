/**
 * SYSTEM HEALTH PAGE
 * Real-time monitoring of system health metrics
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Gauge,
  Server,
  Database,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  useSystemHealth,
  useSystemMetrics,
  useAPIHealth,
  useDatabaseHealth,
  getStatusColor,
  getStatusBgColor,
  getOverallStatusColor,
  getStatusTextFr,
  getHealthStatusDescriptionFr,
  formatBytes,
  formatUptime,
  formatResponseTime,
  getCPUColor,
  getMemoryColor,
  getSuccessRateColor,
} from '@/hooks/useSystemHealth';
import type {
  HealthCheckResult,
  SystemMetrics,
  APIHealth,
  DatabaseHealth,
  SystemStatusResponse,
} from '@/hooks/useSystemHealth';

export default function SystemHealthPage() {
  const [now, setNow] = useState(new Date());

  // Fetch health data
  const systemQuery = useSystemHealth();
  const metricsQuery = useSystemMetrics();
  const apiQuery = useAPIHealth();
  const dbQuery = useDatabaseHealth();

  const isLoading =
    systemQuery.isLoading || metricsQuery.isLoading || apiQuery.isLoading || dbQuery.isLoading;

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Extract and type check data
  const systemData = (systemQuery.data as HealthCheckResult | undefined)?.status as SystemStatusResponse | undefined;
  const metricsData = (metricsQuery.data as SystemMetrics | undefined);
  const apiData = (apiQuery.data as APIHealth | undefined);
  const dbData = (dbQuery.data as DatabaseHealth | undefined);

  // Calculate memory usage percentage
  const memoryUsagePercent =
    metricsData && metricsData.memory_limit_mb > 0
      ? (metricsData.memory_usage_mb / metricsData.memory_limit_mb) * 100
      : 0;

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Santé du Système</h1>
          <p className="text-slate-600 mt-1">Surveillez l'état de la plateforme</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-slate-600">Chargement des données...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Santé du Système</h1>
          <p className="text-slate-600 mt-1">Surveillez l'état de la plateforme en temps réel</p>
        </div>
        <Button
          onClick={() => {
            systemQuery.refetch();
            metricsQuery.refetch();
            apiQuery.refetch();
            dbQuery.refetch();
          }}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* OVERALL HEALTH STATUS */}
      {systemData && (
        <Card
          className={`p-8 bg-gradient-to-br ${getOverallStatusColor(systemData.status)}`}
        >
          <div className="flex items-center gap-4">
            {systemData.status === 'healthy' && (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            )}
            {systemData.status === 'degraded' && (
              <AlertTriangle className="h-16 w-16 text-orange-600" />
            )}
            {systemData.status === 'unhealthy' && (
              <AlertCircle className="h-16 w-16 text-red-600" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {systemData.status === 'healthy'
                  ? 'Système sain'
                  : systemData.status === 'degraded'
                    ? 'Système dégradé'
                    : 'Système non sain'}
              </h2>
              <p className="text-slate-600 mt-1">
                {getHealthStatusDescriptionFr(systemData.status)}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Dernière vérification: {now.toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* SERVICE STATUS */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">État des services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* API Status */}
          {systemData && (
            <Card className={`p-6 border-l-4 ${getStatusBgColor(systemData.services.api)}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-slate-900">API Backend</span>
                <Activity className={`h-6 w-6 ${getStatusColor(systemData.services.api)}`} />
              </div>
              <p className="text-sm text-slate-600">
                Status: {getStatusTextFr(systemData.services.api)}
              </p>
              {apiData && (
                <p className="text-xs text-slate-500 mt-2">
                  Avg: {formatResponseTime(apiData.avg_response_time_ms)} | Success:{' '}
                  {apiData.success_rate.toFixed(2)}%
                </p>
              )}
            </Card>
          )}

          {/* Database Status */}
          {systemData && (
            <Card className={`p-6 border-l-4 ${getStatusBgColor(systemData.services.database)}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-slate-900">Base de données</span>
                <Database className={`h-6 w-6 ${getStatusColor(systemData.services.database)}`} />
              </div>
              <p className="text-sm text-slate-600">
                Status: {getStatusTextFr(systemData.services.database)}
              </p>
              {dbData && (
                <p className="text-xs text-slate-500 mt-2">
                  Ping: {dbData.latency_ms}ms | Active: {dbData.connections.active}
                </p>
              )}
            </Card>
          )}

          {/* System Status */}
          {systemData && (
            <Card className={`p-6 border-l-4 ${getStatusBgColor(systemData.services.system)}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-slate-900">Système</span>
                <Server className={`h-6 w-6 ${getStatusColor(systemData.services.system)}`} />
              </div>
              <p className="text-sm text-slate-600">
                Status: {getStatusTextFr(systemData.services.system)}
              </p>
              {metricsData && (
                <p className="text-xs text-slate-500 mt-2">
                  Uptime: {formatUptime(metricsData.uptime_seconds)}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* SYSTEM METRICS */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Métriques du système</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* API Latency */}
          {apiData && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-600">Latence moyenne API</span>
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <p className={`text-3xl font-bold ${getCPUColor(apiData.avg_response_time_ms / 10)}`}>
                {formatResponseTime(apiData.avg_response_time_ms)}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                P95: {formatResponseTime(apiData.p95_response_time_ms)} | P99:{' '}
                {formatResponseTime(apiData.p99_response_time_ms)}
              </p>
            </Card>
          )}

          {/* Success Rate */}
          {apiData && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-600">Taux de succès</span>
                <CheckCircle2 className={`h-5 w-5 ${getSuccessRateColor(apiData.success_rate)}`} />
              </div>
              <p className={`text-3xl font-bold ${getSuccessRateColor(apiData.success_rate)}`}>
                {apiData.success_rate.toFixed(2)}%
              </p>
              <p className="text-xs text-slate-600 mt-2">
                {apiData.request_count} requêtes | {apiData.error_count} erreurs
              </p>
            </Card>
          )}

          {/* Memory Usage */}
          {metricsData && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-600">Mémoire</span>
                <Server className={`h-5 w-5 ${getMemoryColor(metricsData.memory_usage_mb, metricsData.memory_limit_mb)}`} />
              </div>
              <p className={`text-3xl font-bold ${getMemoryColor(metricsData.memory_usage_mb, metricsData.memory_limit_mb)}`}>
                {formatBytes(metricsData.memory_usage_mb * 1024 * 1024)}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                de {formatBytes(metricsData.memory_limit_mb * 1024 * 1024)} | {memoryUsagePercent.toFixed(1)}%
              </p>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full ${
                    memoryUsagePercent < 50
                      ? 'bg-green-600'
                      : memoryUsagePercent < 75
                        ? 'bg-orange-600'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${memoryUsagePercent}%` }}
                />
              </div>
            </Card>
          )}

          {/* Database Latency */}
          {dbData && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-600">Base de données</span>
                <Database className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {dbData.latency_ms}
                <span className="text-sm">ms</span>
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Active: {dbData.connections.active} | Idle: {dbData.connections.idle}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* DATABASE CONNECTION POOL */}
      {dbData && (
        <Card className="p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Pool de connexions - Base de données</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Connexions actives</p>
              <p className="text-4xl font-bold text-blue-600">{dbData.connections.active}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Inactives</p>
              <p className="text-4xl font-bold text-green-600">{dbData.connections.idle}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">En attente</p>
              <p className="text-4xl font-bold text-orange-600">{dbData.connections.waiting}</p>
            </div>
          </div>
        </Card>
      )}

      {/* SYSTEM INFO */}
      {metricsData && (
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-white border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informations système
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Uptime</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {formatUptime(metricsData.uptime_seconds)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Modules</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{metricsData.loaded_modules}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Garbage Collections</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{metricsData.gc_count}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Dernière mise à jour</p>
              <p className="text-xs text-slate-900 mt-1">
                {new Date(metricsData.timestamp).toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ALERTS */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-white border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Alertes active</h3>
        <div className="text-center py-8">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <p className="text-slate-600">Aucune alerte - Tous les systèmes fonctionnent normalement</p>
        </div>
      </Card>
    </div>
  );
}
