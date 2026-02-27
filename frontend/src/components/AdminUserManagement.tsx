import React, { useEffect, useState } from 'react';

type UserType = 'candidate' | 'company' | 'all';

type Props = {
  permissions: { perm_users: boolean; [k: string]: boolean };
};

export default function AdminUserManagement({ permissions }: Props) {
  const [filter, setFilter] = useState<UserType>('all');
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchList();
  }, [filter]);

  async function fetchList() {
    if (!permissions.perm_users) return;
    setLoading(true);
    const q = filter === 'all' ? '' : `?type=${filter}`;
    try {
      const res = await fetch(`/api/admin/users${q}`);
      const body = await res.json();
      setList(body.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBlock(userId: string, blocked: boolean) {
    if (!permissions.perm_users) return;
    await fetch(`/api/admin/users/${userId}/${blocked ? 'unblock' : 'block'}`, { method: 'POST' });
    fetchList();
  }

  async function resetPassword(userId: string) {
    if (!permissions.perm_users) return;
    await fetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' });
    alert('Mot de passe réinitialisé (par email ou affiché selon implémentation)');
  }

  return (
    <div>
      <h2>Gestion des utilisateurs</h2>
      {!permissions.perm_users && <div style={{ color: 'red' }}>Accès refusé</div>}
      <div style={{ marginBottom: 12 }}>
        <label>Filtrer: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value as UserType)}>
          <option value="all">Tous</option>
          <option value="candidate">Candidats</option>
          <option value="company">Entreprises</option>
        </select>
        <button onClick={fetchList} disabled={!permissions.perm_users}>Refresh</button>
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.type}</td>
                <td>{u.blocked ? 'Bloqué' : 'Actif'}</td>
                <td>
                  <button onClick={() => toggleBlock(u.id, u.blocked)} disabled={!permissions.perm_users}>
                    {u.blocked ? 'Débloquer' : 'Bloquer'}
                  </button>
                  <button onClick={() => resetPassword(u.id)} disabled={!permissions.perm_users} style={{ marginLeft: 8 }}>
                    Réinitialiser MP
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
