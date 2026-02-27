/**
 * Login History Page
 * Displays admin login attempts with email, date, and IP address
 */

import React, { useEffect, useState } from 'react';
import { History, AlertCircle } from 'lucide-react';
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
  email: string;
  ip_address: string;
  attempt_type: 'success' | 'failed' | 'locked';
  user_agent?: string;
  created_at: string;
}

export default function LoginHistoryPage() {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchLoginAttempts();
  }, [page]);

  const fetchLoginAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (page - 1) * limit;
      const data = await api.getLoginAttempts({ limit, offset });
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
      second: '2-digit'
    });
  };

  const getAttemptTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Échoué</Badge>;
      case 'locked':
        return <Badge className="bg-yellow-100 text-yellow-800">Verrouillé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">-</Badge>;
    }
  };

  const LoadingRows = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );

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
              <p className="text-sm text-gray-500 mt-2">Les tentatives de connexion apparaîtront ici</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-gray-50">
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Date & Heure</TableHead>
                    <TableHead className="font-semibold">Adresse IP</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {attempt.email}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(attempt.created_at)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {attempt.ip_address}
                      </TableCell>
                      <TableCell>
                        {getAttemptTypeBadge(attempt.attempt_type)}
                      </TableCell>
                    </TableRow>
                  ))}
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
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
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
            <strong>ℹ️ Information:</strong> Cet historique affiche toutes les tentatives de connexion (succès, échouées, verrouillées) des administrateurs du système. Les données sont conservées pour la sécurité et l'audit.
          </p>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
