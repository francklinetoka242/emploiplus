/**
 * Users Management Page - Clean Rebuild
 * Manage system users
 */

import React from 'react';
import { Users, Plus } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';

export default function UsersPage() {
  return (
    <AdminPageTemplate
      title="Utilisateurs"
      description="Gestion centralisée de tous les utilisateurs du système"
      icon={<Users size={32} className="text-green-600" />}
      actions={
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <Plus size={20} />
          Nouvel utilisateur
        </button>
      }
    >
      <div className="p-8">
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des Utilisateurs</h3>
          <p className="text-gray-600 mb-6">Interface de gestion des utilisateurs - À construire</p>
          <div className="inline-block bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">
            Cette section sera complétée avec la liste des utilisateurs, filtrage, et gestion des rôles.
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
