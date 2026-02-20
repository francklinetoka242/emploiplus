/**
 * Permission Slider Component
 * Visual permission toggle for admin interface
 */

import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Permission } from '../../../types';

interface PermissionSliderProps {
  permission: Permission;
  isGranted: boolean;
  onToggle: (permissionId: number, granted: boolean) => void;
  disabled?: boolean;
}

const PermissionSlider: React.FC<PermissionSliderProps> = ({
  permission,
  isGranted,
  onToggle,
  disabled = false
}) => {
  const getPermissionLabel = (slug: string) => {
    const labels: Record<string, string> = {
      'perm_jobs': 'Gestion Offres d\'emploi',
      'perm_trainings': 'Gestion Formations',
      'perm_services': 'Gestion Services',
      'perm_faq': 'Gestion FAQ',
      'perm_users': 'Gestion Utilisateurs',
      'perm_editoriale': 'Gestion Éditoriale',
      'perm_dashboard': 'Accès Tableau de Bord',
      'perm_admin_management': 'Gestion Administrateurs',
      'perm_system_health': 'Santé du Système'
    };
    return labels[slug] || slug;
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition ${
      isGranted
        ? 'bg-green-50 border-green-200'
        : 'bg-gray-50 border-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="flex items-center gap-4 flex-1">
        {isGranted ? (
          <Unlock className="text-green-600" size={24} />
        ) : (
          <Lock className="text-gray-400" size={24} />
        )}
        <div>
          <p className="font-medium text-gray-900">{getPermissionLabel(permission.slug)}</p>
          <p className="text-xs text-gray-500">{permission.description}</p>
        </div>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={() => !disabled && onToggle(permission.id, !isGranted)}
        disabled={disabled}
        className={`relative inline-flex w-14 h-8 items-center rounded-full transition ${
          isGranted ? 'bg-green-500' : 'bg-gray-300'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
            isGranted ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default PermissionSlider;
