/**
 * Dashboard Module
 * Main dashboard with system health and statistics
 */

import React, { useState, useEffect } from 'react';
import { Activity, HardDrive, Cpu, Clock, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { SystemHealth } from '../../../types';

interface DashboardModuleProps {
  token: string;
}

const DashboardModule: React.FC<DashboardModuleProps> = ({ token }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [token]);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/admin/health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch health');
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-800">Erreur de chargement: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'healthy' ? (
      <CheckCircle className="text-green-600" size={24} />
    ) : (
      <AlertCircle className="text-red-600" size={24} />
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord</h2>
          <p className="text-gray-600">État du système et statistiques globales</p>
        </div>

        {/* Status Overview */}
        <div className={`border-2 rounded-lg p-6 mb-8 ${getStatusColor(health.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(health.status)}
              <div>
                <p className="font-semibold text-lg">État du système</p>
                <p className="text-sm text-gray-600">
                  {health.status === 'healthy' && 'Tous les services fonctionnent normalement'}
                  {health.status === 'warning' && 'Attention requise sur certains services'}
                  {health.status === 'critical' && 'Services critiques en problème'}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(health.timestamp).toLocaleString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* RAM */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <HardDrive className="text-blue-500" size={24} />
              <h3 className="font-semibold text-gray-900">Mémoire RAM</h3>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">{health.system.ram.used} MB / {health.system.ram.total} MB</span>
                <span className="font-semibold text-gray-900">{health.system.ram.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    health.system.ram.percentage > 85 ? 'bg-red-500' :
                    health.system.ram.percentage > 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${health.system.ram.percentage}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500">Libre: {health.system.ram.free} MB</p>
          </div>

          {/* CPU */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-4 mb-4">
              <Cpu className="text-orange-500" size={24} />
              <h3 className="font-semibold text-gray-900">Processeur</h3>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Utilisation</span>
                <span className="font-semibold text-gray-900">{health.system.cpu.usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    health.system.cpu.usage > 80 ? 'bg-red-500' :
                    health.system.cpu.usage > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${health.system.cpu.usage}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500">Cores: {health.system.cpu.cores}</p>
          </div>

          {/* Uptime */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4 mb-4">
              <Clock className="text-green-500" size={24} />
              <h3 className="font-semibold text-gray-900">Disponibilité</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {Math.floor(health.system.uptime / 86400)} j {Math.floor((health.system.uptime % 86400) / 3600)} h
            </div>
            <p className="text-xs text-gray-500">Depuis le dernier redémarrage</p>
          </div>

          {/* Database */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4 mb-4">
              <Database className="text-purple-500" size={24} />
              <h3 className="font-semibold text-gray-900">Base de Données</h3>
            </div>
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                health.database.status === 'connected'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {health.database.status === 'connected' ? '✓ Connectée' : '✗ Déconnectée'}
              </span>
            </div>
            {health.database.poolSize !== undefined && (
              <p className="text-xs text-gray-500">Connexions: {health.database.activeConnections}/{health.database.poolSize}</p>
            )}
          </div>

          {/* Disk (if available) */}
          {health.disk && (
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-500">
              <div className="flex items-center gap-4 mb-4">
                <HardDrive className="text-cyan-500" size={24} />
                <h3 className="font-semibold text-gray-900">Stockage</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">{Math.round(health.disk.used / 1024)} GB / {Math.round(health.disk.total / 1024)} GB</span>
                  <span className="font-semibold text-gray-900">{health.disk.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-cyan-500"
                    style={{ width: `${health.disk.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
              Actualiser
            </button>
            <button className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium">
              Statistiques
            </button>
            <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition text-sm font-medium">
              Logs
            </button>
            <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium">
              Paramètres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;
