/**
 * AUDIT LOGS PAGE - Login History & Audit Trail
 * Complete audit log display with filters, search, and export
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Activity,
} from 'lucide-react';
import {
  useAuditLogs,
  useDeleteAuditLog,
  useExportAuditLogs,
  useAuditStatistics,
  formatActionName,
  formatAdminLevel,
  formatAuditDate,
  formatResponseTime,
  getActionBadgeColor,
  getStatusBadgeColor,
  getStatusCodeName,
  parseIPAddress,
} from '@/hooks/useAuditLogs';

export default function LoginHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    admin_level: undefined as number | undefined,
    action: undefined as string | undefined,
    date_from: undefined as string | undefined,
    date_to: undefined as string | undefined,
    limit: 50,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  const logsQuery = useAuditLogs(filters);
  const statsQuery = useAuditStatistics(filters);
  const deleteLogMutation = useDeleteAuditLog();
  const exportMutation = useExportAuditLogs();

  const logs = logsQuery.data || [];
  const stats = statsQuery.data || {};
  const isLoading = logsQuery.isLoading || statsQuery.isLoading;

  // Filter logs by search term
  const filteredLogs = logs.filter(
    (log) =>
      log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle pagination
  const handlePrevious = () => {
    if (filters.offset > 0) {
      setFilters({ ...filters, offset: filters.offset - filters.limit });
    }
  };

  const handleNext = () => {
    setFilters({ ...filters, offset: filters.offset + filters.limit });
  };

  // Handle export
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    exportMutation.mutate({ format, filters });
  };

  // Handle delete log
  const handleDeleteLog = (logId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée?')) {
      deleteLogMutation.mutate(logId);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Historique de connexion</h1>
        <p className="text-slate-600 mt-1">Audit logs des actions d'administration</p>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total d'entrées</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">{stats.total_logs || 0}</p>
            </div>
            <Activity className="h-10 w-10 opacity-20 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Connexions</p>
              <p className="text-3xl font-bold mt-2 text-green-600">{stats.login_count || 0}</p>
            </div>
            <User className="h-10 w-10 opacity-20 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Modifications</p>
              <p className="text-3xl font-bold mt-2 text-purple-600">{stats.update_count || 0}</p>
            </div>
            <RefreshCw className="h-10 w-10 opacity-20 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Suppressions</p>
              <p className="text-3xl font-bold mt-2 text-orange-600">{stats.delete_count || 0}</p>
            </div>
            <Trash2 className="h-10 w-10 opacity-20 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* SEARCH & FILTERS SECTION */}
      <Card className="p-6 bg-white border border-slate-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par admin, action ou route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
            </Button>
            <Button
              onClick={() => {
                logsQuery.refetch();
                statsQuery.refetch();
              }}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              {/* Admin Level Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Niveau Admin
                </label>
                <select
                  value={filters.admin_level || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      admin_level: e.target.value ? parseInt(e.target.value) : undefined,
                      offset: 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les niveaux</option>
                  <option value="1">Super Admin</option>
                  <option value="2">Admin Content</option>
                  <option value="3">Admin Users</option>
                  <option value="4">Admin Stats</option>
                  <option value="5">Admin Billing</option>
                </select>
              </div>

              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Action
                </label>
                <select
                  value={filters.action || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      action: e.target.value || undefined,
                      offset: 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les actions</option>
                  <option value="create">Création</option>
                  <option value="update">Modification</option>
                  <option value="delete">Suppression</option>
                  <option value="login">Connexion</option>
                  <option value="logout">Déconnexion</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Période
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        date_from: e.target.value || undefined,
                        offset: 0,
                      })
                    }
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        date_to: e.target.value || undefined,
                        offset: 0,
                      })
                    }
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Export Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              size="sm"
              disabled={isLoading || exportMutation.isPending}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              variant="outline"
              size="sm"
              disabled={isLoading || exportMutation.isPending}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              variant="outline"
              size="sm"
              disabled={isLoading || exportMutation.isPending}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* LOGS TABLE */}
      <Card className="overflow-hidden border border-slate-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-slate-600">Chargement des logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600">Aucun log trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Date/Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Temps
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatAuditDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-900">{log.admin_name}</p>
                          <p className="text-xs text-slate-500">{formatAdminLevel(log.admin_level)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                          {formatActionName(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <p className="text-sm font-mono text-slate-900">{log.route}</p>
                          <p className="text-xs text-slate-500">{log.method}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusBadgeColor(log.status_code)}`}>
                            {log.status_code}
                          </span>
                          <p className="text-xs text-slate-500">{getStatusCodeName(log.status_code)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatResponseTime(log.response_time_ms)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          onClick={() => handleDeleteLog(log.id)}
                          variant="ghost"
                          size="sm"
                          disabled={deleteLogMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Affichage {filters.offset + 1} à {filters.offset + filteredLogs.length} sur{' '}
                {stats.total_logs || 0} entrées
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  size="sm"
                  disabled={filters.offset === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="sm"
                  disabled={filters.offset + filters.limit >= (stats.total_logs || 0)}
                  className="gap-2"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
