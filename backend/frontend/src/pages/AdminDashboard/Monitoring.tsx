import React, { useMemo } from 'react';
import { useAuditLogs, useSystemHealth } from '../../hooks/useMonitoring';
import './Monitoring.css';
import html2pdf from 'html2pdf.js';

function downloadCSV(rows: any[]) {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]);
  const csv = [header.join(',')].concat(rows.map(r => header.map(h => {
    const v = r[h] === null || r[h] === undefined ? '' : r[h];
    // Escape quotes
    if (typeof v === 'string' && v.includes(',')) return '"' + v.replace(/"/g,'""') + '"';
    return String(v);
  }).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audit_logs.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export const Monitoring: React.FC = () => {
  const { data: logsData, isLoading: logsLoading } = useAuditLogs(1, 50);
  const { data: healthData } = useSystemHealth();

  const rows = useMemo(() => logsData?.rows || [], [logsData]);

  const handleExportPDF = () => {
    const element = document.getElementById('audit-table-container');
    if (!element) return;
    html2pdf().from(element).save('audit_logs.pdf');
  };

  return (
    <div className="monitoring-page">
      <h2>Surveillance & Audit</h2>

      <section className="system-health">
        <h3>État du système (temps réel)</h3>
        <div className="health-cards">
          <div className={`health-card ${healthData?.db === 'connected' ? 'ok' : 'bad'}`}>
            <div className="health-title">PostgreSQL</div>
            <div className="health-value">{healthData?.db ?? 'unknown'}</div>
          </div>

          <div className="health-card">
            <div className="health-title">Latence API</div>
            <div className="health-value">{healthData ? healthData.latency_ms + ' ms' : '—'}</div>
          </div>

          <div className="health-card">
            <div className="health-title">Mémoire (heapUsed)</div>
            <div className="health-value">{healthData ? Math.round(healthData.memory.heapUsed/1024/1024) + ' MB' : '—'}</div>
          </div>
        </div>
      </section>

      <section className="audit-section">
        <h3>Historique de connexion</h3>
        <div className="audit-exports">
          <button onClick={() => downloadCSV(rows)}>Exporter Excel (CSV)</button>
          <button onClick={handleExportPDF}>Exporter PDF</button>
        </div>

        <div id="audit-table-container" className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Niveau</th>
                <th>Admin</th>
                <th>Horodatage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logsLoading && (
                <tr><td colSpan={4}>Chargement...</td></tr>
              )}
              {!logsLoading && rows.length === 0 && (
                <tr><td colSpan={4}>Aucun enregistrement</td></tr>
              )}
              {rows.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.access_level}</td>
                  <td>{r.admin_name}</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Monitoring;
