import React, { useState, useEffect } from 'react';

// Types pour les permissions
interface Permission {
  module: string;
  label: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
  special: boolean;
  global: boolean;
}

interface AdminPermissionsTableProps {
  adminId: string;
  currentPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  isSuperAdmin?: boolean;
}

// Modules disponibles
const MODULES = [
  { key: 'jobs', label: 'Offres d\'emploi' },
  { key: 'formations', label: 'Formations' },
  { key: 'catalogues', label: 'Catalogues' },
  { key: 'users', label: 'Utilisateurs' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'admins', label: 'Administrateurs' },
  { key: 'history', label: 'Historique' },
  { key: 'faq', label: 'FAQ/Doc' },
  { key: 'system', label: 'Santé Système' },
];

const AdminPermissionsTable: React.FC<AdminPermissionsTableProps> = ({
  adminId,
  currentPermissions,
  onPermissionsChange,
  isSuperAdmin = false,
}) => {
  // État local pour les permissions
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Initialiser les permissions depuis currentPermissions
  useEffect(() => {
    const initialPermissions = MODULES.map(module => {
      // Si c'est un super admin, toutes les permissions sont activées
      if (isSuperAdmin) {
        return {
          module: module.key,
          label: module.label,
          view: true,
          edit: true,
          delete: true,
          special: true,
          global: true,
        };
      }

      const hasGlobal = currentPermissions.includes(`${module.key}:all`);
      const hasView = hasGlobal || currentPermissions.includes(`${module.key}:view`);
      const hasEdit = hasGlobal || currentPermissions.includes(`${module.key}:edit`);
      const hasDelete = hasGlobal || currentPermissions.includes(`${module.key}:delete`);
      const hasSpecial = hasGlobal || currentPermissions.includes(`${module.key}:special`);

      return {
        module: module.key,
        label: module.label,
        view: hasView,
        edit: hasEdit,
        delete: hasDelete,
        special: hasSpecial,
        global: hasGlobal,
      };
    });
    setPermissions(initialPermissions);
  }, [currentPermissions, isSuperAdmin]);

  // Fonction pour mettre à jour une permission
  const updatePermission = (moduleKey: string, type: keyof Permission, value: boolean) => {
    setPermissions(prev =>
      prev.map(perm => {
        if (perm.module === moduleKey) {
          const updated = { ...perm, [type]: value };

          // Si on coche global, cocher toutes les sous-permissions
          if (type === 'global' && value) {
            updated.view = true;
            updated.edit = true;
            updated.delete = true;
            updated.special = true;
          }

          // Si on décoche une sous-permission, décocher global
          if (type !== 'global' && !value && updated.global) {
            updated.global = false;
          }

          // Si toutes les sous-permissions sont cochées, cocher global
          if (type !== 'global' && value) {
            const { view, edit, delete: del, special } = updated;
            if (view && edit && del && special) {
              updated.global = true;
            }
          }

          return updated;
        }
        return perm;
      })
    );
  };

  // Sauvegarder les permissions
  const savePermissions = async () => {
    // Pour les super admins, toutes les permissions sont automatiquement activées
    if (isSuperAdmin) {
      const allPermissions = MODULES.flatMap(module => [
        `${module.key}:all`
      ]);
      try {
        await updateAdmin(adminId, { permissions: allPermissions });
        onPermissionsChange(allPermissions);
        alert('Permissions du Super Admin sauvegardées');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde des permissions');
      }
      return;
    }

    const permissionStrings: string[] = [];
    permissions.forEach(perm => {
      if (perm.global) {
        permissionStrings.push(`${perm.module}:all`);
      } else {
        if (perm.view) permissionStrings.push(`${perm.module}:view`);
        if (perm.edit) permissionStrings.push(`${perm.module}:edit`);
        if (perm.delete) permissionStrings.push(`${perm.module}:delete`);
        if (perm.special) permissionStrings.push(`${perm.module}:special`);
      }
    });

    try {
      // Appeler l'API pour mettre à jour
      await updateAdmin(adminId, { permissions: permissionStrings });
      onPermissionsChange(permissionStrings);
      alert('Permissions mises à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des permissions');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Gestion des Permissions Administrateur
        {isSuperAdmin && (
          <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
            Super Admin - Toutes les permissions activées
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {permissions.map(perm => (
          <div key={perm.module} className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">{perm.label}</h3>

            {/* Accès Global */}
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id={`${perm.module}-global`}
                checked={perm.global}
                onChange={(e) => updatePermission(perm.module, 'global', e.target.checked)}
                disabled={isSuperAdmin}
                className={`mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <label htmlFor={`${perm.module}-global`} className="text-sm font-medium text-gray-700">
                Accès Global
              </label>
            </div>

            {/* Permissions détaillées */}
            <div className="space-y-2 ml-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`${perm.module}-view`}
                  checked={perm.view}
                  onChange={(e) => updatePermission(perm.module, 'view', e.target.checked)}
                  disabled={isSuperAdmin}
                  className={`mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label htmlFor={`${perm.module}-view`} className="text-sm text-gray-600">Lecture</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`${perm.module}-edit`}
                  checked={perm.edit}
                  onChange={(e) => updatePermission(perm.module, 'edit', e.target.checked)}
                  disabled={isSuperAdmin}
                  className={`mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label htmlFor={`${perm.module}-edit`} className="text-sm text-gray-600">Écriture</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`${perm.module}-delete`}
                  checked={perm.delete}
                  onChange={(e) => updatePermission(perm.module, 'delete', e.target.checked)}
                  disabled={isSuperAdmin}
                  className={`mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label htmlFor={`${perm.module}-delete`} className="text-sm text-gray-600">Suppression</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`${perm.module}-special`}
                  checked={perm.special}
                  onChange={(e) => updatePermission(perm.module, 'special', e.target.checked)}
                  disabled={isSuperAdmin}
                  className={`mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label htmlFor={`${perm.module}-special`} className="text-sm text-gray-600">Spécial</label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={savePermissions}
          disabled={isSuperAdmin}
          className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isSuperAdmin 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSuperAdmin ? 'Permissions automatiques (Super Admin)' : 'Sauvegarder les Permissions'}
        </button>
      </div>
    </div>
  );
};

// Fonction pour mettre à jour l'admin (à implémenter côté backend)
const updateAdmin = async (id: string, data: { permissions: string[] }) => {
  const response = await fetch(`/api/admins/${id}/permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, // Assumer token stocké
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour');
  }

  return response.json();
};

export default AdminPermissionsTable;