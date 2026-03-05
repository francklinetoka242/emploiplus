/**
 * Login History Page
 * Displays admin login attempts with filters for date, role, and status
 */

import React, { useEffect, useState } from 'react';
import { History, AlertCircle, Filter, X } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';

interface LoginAttempt {
  id: number;
  admin_email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  ip_address: string;
  success: boolean;
  user_agent?: string;
  created_at: string;
}

type DateRange = 'all' | 'today' | 'week' | 'month' | 'year';

export default function LoginHistoryPage() {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Filter states
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState<string>('');

  useEffect(() => {
    fetchLoginAttempts();
  }, [page, dateRange, statusFilter, roleFilter, searchEmail]);

  const getDateRange = () => {
    const now = new Date();
    const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    switch (dateRange) {
      case 'today':
        return {
          date_from: startOfDay(now).toISOString(),
          date_to: endOfDay(now).toISOString(),
        };
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return {
          date_from: startOfDay(weekStart).toISOString(),
          date_to: endOfDay(now).toISOString(),
        };
      case 'month':
        return {
          date_from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          date_to: endOfDay(now).toISOString(),
        };
      case 'year':
        return {
          date_from: new Date(now.getFullYear(), 0, 1).toISOString(),
          date_to: endOfDay(now).toISOString(),
        };
      default:
        return {};
    }
  };

  const fetchLoginAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (page - 1) * limit;
      const params: any = { limit, offset };

      // Add date range
      const dateFilters = getDateRange();
      if (dateFilters.date_from) params.date_from = dateFilters.date_from;
      if (dateFilters.date_to) params.date_to = dateFilters.date_to;

      // Add status filter
      if (statusFilter !== 'all') {
        params.success = statusFilter === 'success';
      }

      // Add role filter
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      // Add email search
      if (searchEmail.trim()) {
        params.email = searchEmail.trim();
      }

      const data = await api.getLoginAttempts(params);
      setAttempts(data.attempts || []);
    } catch (err) {
      console.error('Error fetching login attempts:', err);
      setError('Erreur lors de la récupération de l\'historique des connexions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusBadge = (success: boolean) => {
    if (success) {
      return <Badge className="bg-green-100 text-green-800">Succès</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Échoué</Badge>;
    }
  };

  const getRoleColor = (role?: string) => {
    if (!role) return 'bg-gray-100 text-gray-800';
    if (role.toLowerCase().includes('super')) return 'bg-purple-100 text-purple-800';
    if (role.toLowerCase().includes('admin')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminPageTemplate
      title="Historique de connexion"
      description="Suivi des tentatives de connexion des administrateurs"
      icon={<History size={32} className="text-cyan-600" />}
    >
      <div className="p-8">
        {/* Error Alert */}
        {error && (
          <Card className="mb-6 p-4 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Filters Section */}
        <Card className="mb-6 p-6 bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filtres</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Période
              </label>
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value as DateRange);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tous</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tous</option>
                <option value="success">Succès</option>
                <option value="failed">Échoué</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Type de compte
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tous</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Modérateur</option>
              </select>
            </div>

            {/* Email Search */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateRange('all');
                  setStatusFilter('all');
                  setRoleFilter('all');
                  setSearchEmail('');
                  setPage(1);
                }}
                className="w-full"
              >
                <X size={16} className="mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </Card>

        {/* Login Attempts Table */}
        <Card className="border">
          {loading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-8 text-center">
              <History size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">Aucun historique de connexion disponible</p>
              <p className="text-sm text-gray-500 mt-2">Essayez de modifier les filtres</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-gray-50">
                    <TableHead className="font-semibold">Nom & Prénom</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Type de compte</TableHead>
                    <TableHead className="font-semibold">Date & Heure</TableHead>
                    <TableHead className="font-semibold">Adresse IP</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => {
                    // Build full name from components or use fallbacks
                    const displayName = (attempt.first_name && attempt.last_name)
                      ? `${attempt.first_name} ${attempt.last_name}`
                      : (attempt.first_name || attempt.last_name || attempt.full_name || attempt.admin_email);
                    
                    return (
                    <TableRow key={attempt.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {displayName}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {attempt.admin_email}
                      </TableCell>
                      <TableCell>
                        {attempt.role ? (
                          <Badge className={getRoleColor(attempt.role)}>
                            {attempt.role === 'super_admin' ? 'Super Admin' : attempt.role.replace(/_/g, ' ')}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(attempt.created_at)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {attempt.ip_address}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(attempt.success)}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Affichage de {attempts.length} tentatives
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loading || attempts.length < limit}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Information:</strong> Cet historique affiche toutes les tentatives de connexion 
            (succès, échouées) des administrateurs du système. Les données sont conservées pour la 
            sécurité et l'audit.
          </p>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
