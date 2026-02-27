/**
 * Admin Management Interface - React Component
 * Super Admin Dashboard for managing all admin users
 * 
 * Features:
 * - List all admins with status and role
 * - Block/Unblock admins
 * - Delete admins
 * - Change admin role (1-5)
 * - Resend invitation for expired tokens
 * - Visual alerts for token expiration
 */

import React, { useState, useEffect } from 'react';
import './AdminManagement.css';

interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_level: number;
  role_name: string;
  status: 'active' | 'pending' | 'blocked';
  created_at: string;
  last_login: string | null;
  token_expires_at: string | null;
  token_expires_in_hours?: number | null;
  is_token_expired?: boolean;
}

interface AdminVerificationStatus {
  id: number;
  status: string;
  token_expires_at: string | null;
  is_expired: boolean;
  expires_in_hours: number | null;
  requires_resend: boolean;
}

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'pending' | 'blocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<Record<number, AdminVerificationStatus>>({});
  const [actionInProgress, setActionInProgress] = useState<Record<number, string>>({});

  const roleOptions: Record<number, string> = {
    1: 'Super Admin',
    2: 'Admin Content',
    3: 'Admin Users',
    4: 'Admin Stats',
    5: 'Admin Billing'
  };

  // Fetch admins list
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const params = new URLSearchParams();
      if (selectedFilter !== 'all') params.append('status', selectedFilter);
      if (roleFilter) params.append('role', roleFilter.toString());
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(
        `https://emploiplus-group.com/api/admin/management/admins?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setAdmins(data.admins);
        setError(null);
        // Verify statuses for pending admins
        data.admins.forEach((admin: Admin) => {
          if (admin.status === 'pending' || admin.token_expires_at) {
            verifyAdminStatus(admin.id);
          }
        });
      } else {
        setError(data.message || 'Erreur lors de la récupération');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Verify if admin token expired
  const verifyAdminStatus = async (adminId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `https://emploiplus-group.com/api/admin/management/admins/${adminId}/verify-status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setVerificationStatus(prev => ({
          ...prev,
          [adminId]: data.data
        }));
      }
    } catch (err) {
      console.error('Error verifying status:', err);
    }
  };

  // Block admin
  const blockAdmin = async (adminId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir bloquer cet admin ?')) return;

    try {
      setActionInProgress(prev => ({ ...prev, [adminId]: 'blocking' }));
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `https://emploiplus-group.com/api/admin/management/admins/${adminId}/block`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state
        setAdmins(admins.map(admin =>
          admin.id === adminId ? { ...admin, status: 'blocked' } : admin
        ));
        alert('Admin bloqué avec succès');
      } else {
        alert(data.message || 'Erreur lors du blocage');
      }
    } catch (err) {
      alert('Erreur de connexion');
      console.error(err);
    } finally {
      setActionInProgress(prev => ({ ...prev, [adminId]: '' }));
    }
  };

  // Unblock admin
  const unblockAdmin = async (adminId: number) => {
    try {
      setActionInProgress(prev => ({ ...prev, [adminId]: 'unblocking' }));
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `https://emploiplus-group.com/api/admin/management/admins/${adminId}/unblock`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setAdmins(admins.map(admin =>
          admin.id === adminId ? { ...admin, status: 'active' } : admin
        ));
        alert('Admin débloqué');
      } else {
        alert(data.message || 'Erreur');
      }
    } catch (err) {
      alert('Erreur de connexion');
    } finally {
      setActionInProgress(prev => ({ ...prev, [adminId]: '' }));
    }
  };

  // Delete admin
  const deleteAdmin = async (adminId: number) => {
    if (!window.confirm('Êtes-vous SÛR ? Cette action est irreversible.')) return;

    try {
      setActionInProgress(prev => ({ ...prev, [adminId]: 'deleting' }));
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `https://emploiplus-group.com/api/admin/management/admins/${adminId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setAdmins(admins.filter(admin => admin.id !== adminId));
        alert('Admin supprimé');
      } else {
        alert(data.message || 'Erreur');
      }
    } catch (err) {
      alert('Erreur de connexion');
    } finally {
      setActionInProgress(prev => ({ ...prev, [adminId]: '' }));
    }
  };

  // Change admin role
  const changeRole = async (adminId: number, newRole: number) => {
    try {
      setActionInProgress(prev => ({ ...prev, [adminId]: 'changing-role' }));
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `https://emploiplus-group.com/api/admin/management/admins/${adminId}/role`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role_level: newRole })
        }
      );

      const data = await response.json();

      if (data.success) {
        setAdmins(admins.map(admin =>
          admin.id === adminId
            ? { ...admin, role_level: newRole, role_name: roleOptions[newRole] }
            : admin
        ));
        alert('Rôle modifié');
      } else {
        alert(data.message || 'Erreur');
      }
    } catch (err) {
      alert('Erreur de connexion');
    } finally {
      setActionInProgress(prev => ({ ...prev, [adminId]: '' }));
    }
  };

  // Resend invitation
  const resendInvitation = async (adminId: number) => {
    if (!window.confirm('Renvoyer l\'invitation à cet admin ?')) return;

    try {
      setActionInProgress(prev => ({ ...prev, [adminId]: 'resending' }));
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `https://emploiplus-group.com/api/admin/management/admins/${adminId}/resend-invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Invitation renvoyée');
        // Refresh the verification status
        setTimeout(() => verifyAdminStatus(adminId), 500);
      } else {
        alert(data.message || 'Erreur');
      }
    } catch (err) {
      alert('Erreur de connexion');
    } finally {
      setActionInProgress(prev => ({ ...prev, [adminId]: '' }));
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (admin: Admin): string => {
    if (admin.status === 'blocked') return 'status-blocked';
    if (admin.status === 'pending') {
      const status = verificationStatus[admin.id];
      if (status?.is_expired) return 'status-expired';
      return 'status-pending';
    }
    return 'status-active';
  };

  // Get status badge text
  const getStatusText = (admin: Admin): string => {
    if (admin.status === 'blocked') return 'Bloqué';
    if (admin.status === 'pending') {
      const status = verificationStatus[admin.id];
      if (status?.is_expired) return 'Expiré';
      return 'En attente';
    }
    return 'Confirmé';
  };

  // Load data on component mount
  useEffect(() => {
    fetchAdmins();
  }, [selectedFilter, roleFilter, searchQuery]);

  if (loading) {
    return <div className="admin-management-container"><div className="loading">Chargement...</div></div>;
  }

  const filteredAdmins = admins;

  return (
    <div className="admin-management-container">
      <div className="admin-management-header">
        <h1>🛡️ Gestion des Administrateurs</h1>
        <p className="subtitle">Contrôle complet sur tous les comptes admin système</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Statut</label>
          <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value as any)}>
            <option value="all">Tous</option>
            <option value="active">Confirmé</option>
            <option value="pending">En attente</option>
            <option value="blocked">Bloqué</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Rôle</label>
          <select value={roleFilter || ''} onChange={(e) => setRoleFilter(e.target.value ? parseInt(e.target.value) : null)}>
            <option value="">Tous les rôles</option>
            {Object.entries(roleOptions).map(([level, name]) => (
              <option key={level} value={level}>{name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="refresh-btn" onClick={fetchAdmins}>🔄 Actualiser</button>
      </div>

      {/* Admins Table */}
      <div className="table-wrapper">
        <table className="admins-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Créé</th>
              <th>Dernière connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">Aucun admin trouvé</td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => {
                const status = verificationStatus[admin.id];
                const isTokenExpired = status?.is_expired || admin.is_token_expired;
                const isInProgress = !!actionInProgress[admin.id];

                return (
                  <tr key={admin.id} className={isTokenExpired ? 'row-warning' : ''}>
                    <td className="name-cell">
                      <strong>{admin.first_name} {admin.last_name}</strong>
                    </td>
                    <td>{admin.email}</td>
                    <td>
                      <select
                        className="role-select"
                        value={admin.role_level}
                        onChange={(e) => changeRole(admin.id, parseInt(e.target.value))}
                        disabled={isInProgress}
                      >
                        {Object.entries(roleOptions).map(([level, name]) => (
                          <option key={level} value={level}>{name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className={`status-badge ${getStatusBadgeClass(admin)}`}>
                        {getStatusText(admin)}
                        {isTokenExpired && <span className="badge-warning">⚠️</span>}
                      </div>
                    </td>
                    <td className="small-text">
                      {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="small-text">
                      {admin.last_login
                        ? new Date(admin.last_login).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        {/* Block/Unblock */}
                        {admin.status === 'blocked' ? (
                          <button
                            className="btn btn-primary"
                            onClick={() => unblockAdmin(admin.id)}
                            disabled={isInProgress}
                            title="Débloquer cet admin"
                          >
                            🔓 Débloquer
                          </button>
                        ) : (
                          <button
                            className="btn btn-warning"
                            onClick={() => blockAdmin(admin.id)}
                            disabled={isInProgress}
                            title="Bloquer la connexion"
                          >
                            🚫 Bloquer
                          </button>
                        )}

                        {/* Resend Invitation */}
                        {(admin.status === 'pending' || isTokenExpired) && (
                          <button
                            className="btn btn-info"
                            onClick={() => resendInvitation(admin.id)}
                            disabled={isInProgress}
                            title="Renvoyer l'invitation"
                          >
                            📧 Renvoyer
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteAdmin(admin.id)}
                          disabled={isInProgress}
                          title="Supprimer définitivement"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>

                      {/* Loading indicator */}
                      {isInProgress && (
                        <div className="action-loading">
                          Traitement...
                        </div>
                      )}

                      {/* Token expiry warning */}
                      {isTokenExpired && admin.status === 'pending' && (
                        <div className="expiry-alert">
                          ⏰ Lien expiré
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="summary-section">
        <div className="summary-card">
          <h3>📊 Statistiques</h3>
          <p>Total: <strong>{filteredAdmins.length}</strong> admin(s)</p>
          <p>Confirmé: <strong>{filteredAdmins.filter(a => a.status === 'active').length}</strong></p>
          <p>En attente: <strong>{filteredAdmins.filter(a => a.status === 'pending').length}</strong></p>
          <p>Bloqué: <strong>{filteredAdmins.filter(a => a.status === 'blocked').length}</strong></p>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
