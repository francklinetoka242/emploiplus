/**
 * Admin Dashboard Page - Clean Rebuild
 * Main dashboard displaying key metrics and quick actions
 */

import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Briefcase, BookOpen, AlertCircle } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';
import { api } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalFormations: number;
  totalAdmins: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-medium">{label}</h3>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <p className="text-sm text-gray-500 mt-2">Enregistrements existants</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalFormations: 0,
    totalAdmins: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // TODO: Replace with actual API calls
      setStats({
        totalUsers: 1250,
        totalJobs: 342,
        totalFormations: 89,
        totalAdmins: 12,
        systemHealth: 'healthy'
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageTemplate
      title="Tableau de bord"
      description="Vue d'ensemble du système et des activités principales"
      icon={<LayoutDashboard size={32} className="text-blue-600" />}
    >
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Utilisateurs"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            label="Offres d'emploi"
            value={stats.totalJobs}
            icon={Briefcase}
            color="bg-green-500"
          />
          <StatCard
            label="Formations"
            value={stats.totalFormations}
            icon={BookOpen}
            color="bg-purple-500"
          />
          <StatCard
            label="Administrateurs"
            value={stats.totalAdmins}
            icon={AlertCircle}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>5 nouveaux utilisateurs inscrits aujourd'hui</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>3 nouvelles offres d'emploi publiées</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>2 formations mises à jour</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">État du Système</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Base de données</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  En ligne
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Serveur API</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  En ligne
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stockage</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                  Avertissement
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
