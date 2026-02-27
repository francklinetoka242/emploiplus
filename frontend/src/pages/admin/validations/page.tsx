import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authHeaders } from '@/lib/headers';

export default function AdminValidationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (companyFilter) params.set('company_id', companyFilter);
      const res = await fetch('/api/admin/validations?' + params.toString(), { headers: adminToken ? authHeaders(undefined, 'adminToken') : authHeaders() });
      if (!res.ok) throw new Error('Erreur');
      const d = await res.json();
      setRows(d || []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const exportCSV = () => {
    const csv = [
      ['ID','Job','Company','Applicant','Email','Status','Date'],
      ...rows.map(r => [r.id, r.job_title, r.company_name || r.job_company, r.applicant_name, r.applicant_email, r.status, new Date(r.created_at).toLocaleString()])
    ].map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'validations.csv'; a.click();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Historique des validations</h1>
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="ID société" value={companyFilter} onChange={(e)=>setCompanyFilter(e.target.value)} />
          <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">Tous</option>
            <option value="validated">Validated</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
          <div className="flex gap-2">
            <Button onClick={fetchData}>Filtrer</Button>
            <Button variant="outline" onClick={exportCSV}>Exporter CSV</Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        {loading ? <div>Chargement...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Offre</th>
                  <th className="p-2">Société</th>
                  <th className="p-2">Candidat</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Statut</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.id}</td>
                    <td className="p-2">{r.job_title}</td>
                    <td className="p-2">{r.company_name || r.job_company}</td>
                    <td className="p-2">{r.applicant_name}</td>
                    <td className="p-2">{r.applicant_email}</td>
                    <td className="p-2">{r.status}</td>
                    <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">Aucun résultat</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
