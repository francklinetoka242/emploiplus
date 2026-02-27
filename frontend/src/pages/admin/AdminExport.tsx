import React, { useState, useEffect } from 'react';
import './AdminExport.css';
import { getApiBaseUrl } from '@/lib/headers';

interface ExportStats {
  total_admins: number;
  active_admins: number;
  inactive_admins: number;
  by_role: {
    super_admins: number;
    content_admins: number;
    user_admins: number;
    analytics_admins: number;
    billing_admins: number;
  };
  last_activity: {
    last_created: string;
    last_login: string;
  };
}

export const AdminExport: React.FC = () => {
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | 'json' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = `${getApiBaseUrl()}/api`;

  // Load statistics on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE}/admin/management/admins/export/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
      
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting('json');
      setError(null);
      const token = localStorage.getItem('admin_token');

      const response = await fetch(`${API_BASE}/admin/management/admins/export/json`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de l\'exportation JSON');
      
      const data = await response.json();
      
      // Download JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admins_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('✅ Export JSON réussi!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      setError(null);
      const token = localStorage.getItem('admin_token');

      const response = await fetch(`${API_BASE}/admin/management/admins/export/pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur lors de l\'exportation PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admins_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('✅ Export PDF réussi!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      setError(null);
      const token = localStorage.getItem('admin_token');

      const response = await fetch(`${API_BASE}/admin/management/admins/export/excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur lors de l\'exportation Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admins_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('✅ Export Excel réussi!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="admin-export-container">
      <div className="export-header">
        <h1>📊 Exportation des Administrateurs</h1>
        <p>Exporter la liste complète des administrateurs en PDF, Excel ou JSON</p>
      </div>

      {error && <div className="export-message error">⚠️ {error}</div>}
      {success && <div className="export-message success">{success}</div>}

      {loading ? (
        <div className="export-loading">Chargement des statistiques...</div>
      ) : stats ? (
        <>
          {/* Statistics Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{stats.total_admins}</div>
              <div className="stat-label">Administrateurs Total</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.active_admins}</div>
              <div className="stat-label">Administrateurs Actifs</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-value">{stats.inactive_admins}</div>
              <div className="stat-label">Administrateurs Inactifs</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-value">{stats.by_role.super_admins}</div>
              <div className="stat-label">Super Admins</div>
            </div>
          </div>

          {/* Role Breakdown */}
          <div className="role-breakdown">
            <h3>📋 Répartition par Rôle</h3>
            <div className="role-grid">
              <div className="role-item">
                <span>Super Admin:</span>
                <strong>{stats.by_role.super_admins}</strong>
              </div>
              <div className="role-item">
                <span>Admin Contenu:</span>
                <strong>{stats.by_role.content_admins}</strong>
              </div>
              <div className="role-item">
                <span>Admin Utilisateurs:</span>
                <strong>{stats.by_role.user_admins}</strong>
              </div>
              <div className="role-item">
                <span>Admin Statistiques:</span>
                <strong>{stats.by_role.analytics_admins}</strong>
              </div>
              <div className="role-item">
                <span>Admin Facturation:</span>
                <strong>{stats.by_role.billing_admins}</strong>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="export-section">
            <h3>📥 Options d'Exportation</h3>
            <p>Choisissez le format de votre export. L'en-tête inclura votre logo, vos informations et la date/heure.</p>

            <div className="export-buttons">
              <button
                className={`export-btn btn-json ${exporting === 'json' ? 'loading' : ''}`}
                onClick={handleExportJSON}
                disabled={exporting !== null}
              >
                <span className="btn-icon">📄</span>
                <span>JSON</span>
                {exporting === 'json' && <span className="spinner">⏳</span>}
              </button>

              <button
                className={`export-btn btn-pdf ${exporting === 'pdf' ? 'loading' : ''}`}
                onClick={handleExportPDF}
                disabled={exporting !== null}
              >
                <span className="btn-icon">📕</span>
                <span>PDF</span>
                {exporting === 'pdf' && <span className="spinner">⏳</span>}
              </button>

              <button
                className={`export-btn btn-excel ${exporting === 'excel' ? 'loading' : ''}`}
                onClick={handleExportExcel}
                disabled={exporting !== null}
              >
                <span className="btn-icon">📗</span>
                <span>Excel</span>
                {exporting === 'excel' && <span className="spinner">⏳</span>}
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <h4>ℹ️ Informations sur l'Export</h4>
            <ul>
              <li>✓ Inclut tous les administrateurs (actifs et inactifs)</li>
              <li>✓ Organise les données par rôle</li>
              <li>✓ Ajoute automatiquement l'en-tête avec logo et informations</li>
              <li>✓ Inclut la date et l'heure d'exportation</li>
              <li>✓ Registre d'audit automatique pour tracer les exports</li>
              <li>✓ Les fichiers sont téléchargés avec un horodatage</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="export-empty">Erreur lors du chargement des données</div>
      )}
    </div>
  );
};

export default AdminExport;
