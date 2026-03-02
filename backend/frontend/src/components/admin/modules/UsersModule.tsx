/**
 * Users Management Module
 * Manage candidate and company accounts
 */

import React, { useState, useEffect } from 'react';
import { Search, Block, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface UsersModuleProps {
  token: string;
}

const UsersModule: React.FC<UsersModuleProps> = ({ token }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [userType, setUserType] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [token, userType]);

  const fetchUsers = async () => {
    try {
      const query = userType ? `?user_type=${userType}` : '';
      const response = await fetch(`/api/admin/users${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id: number) => {
    try {
      await fetch(`/api/admin/users/${id}/block`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      await fetch(`/api/admin/users/${id}/unblock`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cet utilisateur?')) return;
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.includes(filter) || u.first_name?.includes(filter)
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Gestion Utilisateurs</h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Rechercher par email ou nom..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Tous les types</option>
            <option value="candidate">Candidats</option>
            <option value="company">Entreprises</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{user.first_name} {user.last_name}</td>
                <td className="px-6 py-3">{user.email}</td>
                <td className="px-6 py-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {user.user_type || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {user.is_blocked ? (
                    <span className="flex items-center gap-2 text-red-600">
                      <XCircle size={16} /> Bloqué
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={16} /> Actif
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 flex gap-2">
                  {user.is_blocked ? (
                    <button
                      onClick={() => handleUnblock(user.id)}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm"
                    >
                      Débloquer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlock(user.id)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                    >
                      <Block size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersModule;
