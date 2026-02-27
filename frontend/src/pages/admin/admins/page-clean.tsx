/**
 * Admins Management Page - Clean Rebuild
 * Manage administrator accounts
 */

import React from 'react';
import { Shield, Plus } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';

export default function AdminsPage() {
  return (
    <AdminPageTemplate
      title="Administrateurs"
      description="Gestion des comptes administrateur et attribution des rôles"
      icon={<Shield size={32} className="text-red-600" />}
      actions={
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          <Plus size={20} />
          Ajouter admin
        </button>
      }
    >
      <div className="p-8">
        <div className="text-center py-12">
          <Shield size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des Administrateurs</h3>
          <p className="text-gray-600 mb-6">Interface de gestion des administrateurs - À construire</p>
          <div className="inline-block bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
            Cette section sera complétée avec la liste des admins, attribution de rôles, et permissions.
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
