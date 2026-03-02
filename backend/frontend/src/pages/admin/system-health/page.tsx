/**
 * System Health Page - Clean Rebuild
 * Monitor system health and performance
 */

import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';

interface HealthStatus {
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  uptime: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'healthy': 'bg-green-100 text-green-700',
    'warning': 'bg-yellow-100 text-yellow-700',
    'critical': 'bg-red-100 text-red-700'
  };

  const labels: Record<string, string> = {
    'healthy': 'En ligne',
    'warning': 'Avertissement',
    'critical': 'Critique'
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      <span className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-600' : status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'}`}></span>
      {labels[status]}
    </span>
  );
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthStatus>({
    database: 'healthy',
    api: 'healthy',
    storage: 'warning',
    cpu: 42,
    memory: 68,
    uptime: '45 jours 12h 34m'
  });

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
                <StatusBadge status={health.database} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Serveur</span>
                <StatusBadge status={health.api} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stockage</span>
                <StatusBadge status={health.storage} />
              </div>
            </div>
          </div>

          {/* CPU Usage */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">CPU</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">{health.cpu}%</div>
                <p className="text-xs text-gray-500 mt-2">Utilisation</p>
              </div>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="text-xl font-bold text-blue-600">{health.cpu}%</div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Mémoire</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">{health.memory}%</div>
                <p className="text-xs text-gray-500 mt-2">Utilisation</p>
              </div>
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="text-xl font-bold text-purple-600">{health.memory}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-6 bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations Système</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Uptime</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{health.uptime}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Version</p>
              <p className="text-lg font-medium text-gray-900 mt-1">1.0.0</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Dernière vérif.</p>
              <p className="text-lg font-medium text-gray-900 mt-1">À l'instant</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Environnement</p>
              <p className="text-lg font-medium text-gray-900 mt-1">Production</p>
            </div>
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
