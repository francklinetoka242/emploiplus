import React, { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/headers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CompanyValidationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [jobFilter, setJobFilter] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (jobFilter) params.set('job_id', jobFilter);
      const res = await fetch('/api/company/validations?' + params.toString(), { headers: authHeaders() });
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
      ['ID','Job','Applicant','Email','Status','Date','Docs'],
      ...rows.map(r => [r.id, r.job_title, r.applicant_name, r.applicant_email, r.status, new Date(r.created_at).toLocaleString(), (r.additional_docs ? JSON.stringify(r.additional_docs) : '')])
    ].map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'company_validations.csv'; a.click();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Historique des validations (Société)</h1>
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="ID Offre (job_id)" value={jobFilter} onChange={(e)=>setJobFilter(e.target.value)} />
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
                  <th className="p-2">Candidat</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Statut</th>
                  <th className="p-2">Documents</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.id}</td>
                    <td className="p-2">{r.job_title}</td>
                    <td className="p-2">{r.applicant_name}</td>
                    <td className="p-2">{r.applicant_email}</td>
                    <td className="p-2">{r.status}</td>
                    <td className="p-2">
                      {r.additional_docs && Array.isArray(r.additional_docs) ? (
                        <div className="flex flex-col gap-1">
                          {r.additional_docs.map((d: any, i: number) => (
                            <a key={i} href={d.url || d} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Télécharger doc {i+1}</a>
                          ))}
                        </div>
                      ) : (r.cv_url ? <a href={r.cv_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Télécharger CV</a> : <span className="text-muted-foreground">Aucun</span>)}
                    </td>
                    <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(r)); toast.success('Copié'); }}>Copier</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">Aucun résultat</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
