/**
 * Notifications Management Page - Clean Rebuild
 * Manage system notifications
 */

import React from 'react';
import { Bell, Plus } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';

export default function NotificationsPage() {
  return (
    <AdminPageTemplate
      title="Notifications"
      description="Gestion des notifications système et des alertes"
      icon={<Bell size={32} className="text-orange-600" />}
      actions={
        <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus size={20} />
          Envoyer notification
        </button>
      }
    >
      <div className="p-8">
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications</h3>
          <p className="text-gray-600 mb-6">Interface de gestion des notifications - À construire</p>
          <div className="inline-block bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm">
            Cette section sera complétée avec la gestion des notifications, modèles, et historique.
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
