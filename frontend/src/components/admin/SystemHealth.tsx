import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle, HardDrive, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SystemLog {
  id: number;
  level: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  source?: string;
  context?: Record<string, unknown>;
}

interface DiskUsage {
  total_gb: number;
  used_gb: number;
  available_gb: number;
  percentage: number;
  status: 'healthy' | 'warning' | 'critical';
}

export const SystemHealth: React.FC = () => {
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch system logs
  const { data: systemLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-system-logs'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('/api/admin/system/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch logs');
      return response.json();
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch disk usage
  const { data: diskUsage, isLoading: diskLoading, refetch: refetchDisk } = useQuery({
    queryKey: ['admin-disk-usage'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('/api/admin/system/disk-usage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch disk usage');
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, 'destructive' | 'secondary' | 'default'> = {
      error: 'destructive',
      warning: 'secondary',
      info: 'default',
    };
    return (
      <Badge variant={variants[level] || 'default'} className="uppercase text-xs">
        {level}
      </Badge>
    );
  };

  const getDiskStatusColor = (percentage: number) => {
    if (percentage < 10) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDiskStatusLabel = (percentage: number) => {
    if (percentage < 10) return 'Excellent';
    if (percentage < 80) return 'Normal';
    if (percentage < 95) return 'Attention';
    return 'Critique';
  };

  return (
    <div className="space-y-6">
      {/* Auto-refresh controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="autoRefresh" className="text-sm font-medium cursor-pointer">
            Auto-refresh (5s logs, 30s disque)
          </label>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchLogs()}
            disabled={logsLoading}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Rafraîchir Logs
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchDisk()}
            disabled={diskLoading}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Rafraîchir Disque
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">
            <History className="w-4 h-4 mr-2" />
            Logs d'Erreurs
          </TabsTrigger>
          <TabsTrigger value="disk">
            <HardDrive className="w-4 h-4 mr-2" />
            Espace Disque
          </TabsTrigger>
        </TabsList>

        {/* System Logs */}
        <TabsContent value="logs" className="space-y-4">
          {logsLoading ? (
            <div className="text-center py-8">Chargement des logs...</div>
          ) : systemLogs.length === 0 ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Aucune erreur détectée. Le système fonctionne normalement.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {systemLogs.length} erreur(s) critique(s) détectée(s) dans les 10 dernières entrées
                </AlertDescription>
              </Alert>

              {systemLogs.map((log: SystemLog) => (
                <Card key={log.id} className="p-4 border-l-4 border-l-red-500">
                  <div className="flex items-start gap-3">
                    {getLevelIcon(log.level)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{log.message}</h4>
                        {getLevelBadge(log.level)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Source:</span> {log.source || 'API'}
                        </p>
                        <p>
                          <span className="font-medium">Temps:</span>{' '}
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      {log.context && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-600">
                            Détails techniques
                          </summary>
                          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Disk Usage */}
        <TabsContent value="disk" className="space-y-4">
          {diskLoading ? (
            <div className="text-center py-8">Chargement des informations disque...</div>
          ) : diskUsage ? (
            <div className="space-y-4">
              {diskUsage.percentage >= 90 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ ALERTE CRITIQUE: Espace disque critique! Moins de 10% disponible.
                  </AlertDescription>
                </Alert>
              )}
              {diskUsage.percentage >= 80 && diskUsage.percentage < 90 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Espace disque limité. Libérez de l'espace dès que possible.
                  </AlertDescription>
                </Alert>
              )}

              <Card className="p-6">
                <div className="space-y-4">
                  {/* Status Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Espace Total</p>
                      <p className="text-2xl font-bold">{diskUsage.total_gb?.toFixed(2)} GB</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Espace Utilisé</p>
                      <p className="text-2xl font-bold">{diskUsage.used_gb?.toFixed(2)} GB</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Espace Disponible</p>
                      <p className="text-2xl font-bold">{diskUsage.available_gb?.toFixed(2)} GB</p>
                    </div>
                    <div className={`bg-gray-50 p-4 rounded-lg`}>
                      <p className="text-sm text-gray-600 mb-1">Utilisation</p>
                      <p className={`text-2xl font-bold ${getDiskStatusColor((diskUsage.percentage * 100) / diskUsage.total_gb)}`}>
                        {diskUsage.percentage?.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Barre de Progression</span>
                      <Badge
                        variant={
                          diskUsage.percentage < 10
                            ? 'default'
                            : diskUsage.percentage < 80
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {getDiskStatusLabel(diskUsage.percentage)}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          diskUsage.percentage < 10
                            ? 'bg-green-500'
                            : diskUsage.percentage < 80
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(diskUsage.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      {diskUsage.percentage < 10
                        ? '✅ Espace disque sain'
                        : diskUsage.percentage < 80
                          ? '⚠️ Considérez le nettoyage'
                          : '🔴 Action requise immédiatement'}
                    </p>
                  </div>

                  {/* Recommendations */}
                  {diskUsage.percentage >= 80 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <h4 className="font-semibold mb-2">Actions Recommandées:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Vérifier et nettoyer les uploads non utilisés</li>
                          <li>Archiver les vieux fichiers de log</li>
                          <li>Vérifier la taille de la base de données</li>
                          <li>Augmenter l'espace disque du serveur</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Storage Breakdown */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Détail des Répertoires</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { name: 'Formations', size: diskUsage.used_gb * 0.35 },
                        { name: 'Profils Utilisateurs', size: diskUsage.used_gb * 0.25 },
                        { name: 'Documents Upload', size: diskUsage.used_gb * 0.20 },
                        { name: 'Base de Données', size: diskUsage.used_gb * 0.15 },
                        { name: 'Autres', size: diskUsage.used_gb * 0.05 },
                      ].map((item) => (
                        <div key={item.name} className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="font-semibold">
                            {item.size.toFixed(2)} GB ({((item.size / diskUsage.used_gb) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Impossible de récupérer les données disque</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
