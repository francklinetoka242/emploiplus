import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authHeaders } from '@/lib/headers';

interface VerifyRequest {
  id: number;
  user_id: number;
  requested_name: string;
  phone?: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  reason?: string;
  full_name?: string;
  email?: string;
}

export default function VerifyRequestsPage() {
  const [requests, setRequests] = useState<VerifyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify-requests', { headers: authHeaders() });
      if (!res.ok) throw new Error('Impossible de charger les demandes');
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const decide = async (id: number, action: 'approve' | 'reject') => {
    try {
      const body = action === 'reject' ? JSON.stringify({ reason: 'Rejeté par l\'admin' }) : undefined;
      const res = await fetch(`/api/admin/verify-requests/${id}/${action}`, { method: 'POST', headers: authHeaders('application/json'), body });
      if (!res.ok) throw new Error('Action échouée');
      toast.success('Action enregistrée');
      fetchRequests();
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de l\'action');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Demandes de vérification</h1>
      <Card className="mb-6">
        {loading ? (
          <div className="p-6">Chargement...</div>
        ) : requests.length === 0 ? (
          <div className="p-6">Aucune demande en attente</div>
        ) : (
          <div className="space-y-4 p-4">
            {requests.map((r) => (
              <div key={r.id} className="border p-4 rounded flex items-start justify-between">
                <div>
                  <div className="font-semibold">{r.requested_name}</div>
                  <div className="text-sm text-muted-foreground">{r.email} • {r.phone}</div>
                  <div className="text-sm text-muted-foreground mt-2">Statut: {r.status}</div>
                  {r.reason && <div className="text-sm text-red-600 mt-2">Motif: {r.reason}</div>}
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => decide(r.id, 'approve')} className="bg-green-600">Approuver</Button>
                  <Button onClick={() => decide(r.id, 'reject')} variant="destructive">Rejeter</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
