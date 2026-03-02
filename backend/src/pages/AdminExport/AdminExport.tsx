import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import styles from './AdminExport.module.css';

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

interface ExportResponse {
  success: boolean;
  message?: string;
}

export const AdminExport: React.FC = () => {
  const { currentUser } = useDashboard();
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | 'json' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://195.110.35.133:5000/api';

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

  // Only Super Admin (role_level = 1) can see this page
  if (!currentUser || currentUser.role_level !== 1) {
    return (
      <div className={styles.container}>
        <div className={styles.accessDenied}>
          <h2>❌ Accès Refusé</h2>
          <p>Seul le Super Admin peut accéder aux exports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Exportation des Administrateurs</h1>
        <p>Exporter la liste complète des administrateurs en PDF, Excel ou JSON</p>
      </div>

      {error && <div className={styles.error}>⚠️ {error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {loading ? (
        <div className={styles.loading}>Chargement des statistiques...</div>
      ) : stats ? (
        <>
          {/* Statistics Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.total_admins}</div>
                <div className={styles.statLabel}>Administrateurs Total</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.active_admins}</div>
                <div className={styles.statLabel}>Administrateurs Actifs</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>❌</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.inactive_admins}</div>
                <div className={styles.statLabel}>Administrateurs Inactifs</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>👑</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.by_role.super_admins}</div>
                <div className={styles.statLabel}>Super Admins</div>
              </div>
            </div>
          </div>

          {/* Role Breakdown */}
          <div className={styles.roleBreakdown}>
            <h3>📋 Répartition par Rôle</h3>
            <div className={styles.roleGrid}>
              <div className={styles.roleItem}>
                <span>Super Admin:</span>
                <strong>{stats.by_role.super_admins}</strong>
              </div>
              <div className={styles.roleItem}>
                <span>Admin Contenu:</span>
                <strong>{stats.by_role.content_admins}</strong>
              </div>
              <div className={styles.roleItem}>
                <span>Admin Utilisateurs:</span>
                <strong>{stats.by_role.user_admins}</strong>
              </div>
              <div className={styles.roleItem}>
                <span>Admin Statistiques:</span>
                <strong>{stats.by_role.analytics_admins}</strong>
              </div>
              <div className={styles.roleItem}>
                <span>Admin Facturation:</span>
                <strong>{stats.by_role.billing_admins}</strong>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className={styles.exportSection}>
            <h3>📥 Options d'Exportation</h3>
            <p>Choisissez le format de votre export. L'en-tête inclura votre logo, vos informations et la date/heure.</p>

            <div className={styles.exportButtons}>
              <button
                className={`${styles.exportBtn} ${styles.btnJSON} ${exporting === 'json' ? styles.loading : ''}`}
                onClick={handleExportJSON}
                disabled={exporting !== null}
              >
                <span className={styles.icon}>📄</span>
                <span>JSON</span>
                {exporting === 'json' && <span className={styles.spinner}>⏳</span>}
              </button>

              <button
                className={`${styles.exportBtn} ${styles.btnPDF} ${exporting === 'pdf' ? styles.loading : ''}`}
                onClick={handleExportPDF}
                disabled={exporting !== null}
              >
                <span className={styles.icon}>📕</span>
                <span>PDF</span>
                {exporting === 'pdf' && <span className={styles.spinner}>⏳</span>}
              </button>

              <button
                className={`${styles.exportBtn} ${styles.btnExcel} ${exporting === 'excel' ? styles.loading : ''}`}
                onClick={handleExportExcel}
                disabled={exporting !== null}
              >
                <span className={styles.icon}>📗</span>
                <span>Excel</span>
                {exporting === 'excel' && <span className={styles.spinner}>⏳</span>}
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className={styles.infoSection}>
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
        <div className={styles.empty}>Erreur lors du chargement des données</div>
      )}
    </div>
  );
};

export default AdminExport;
