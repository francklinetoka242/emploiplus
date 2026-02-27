/**
 * Jobs Management Page - Clean Rebuild
 * Manage job offers
 */

import React from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';

export default function JobsPage() {
  return (
    <AdminPageTemplate
      title="Offres d'emploi"
      description="Gestion centralisée de toutes les offres d'emploi"
      icon={<Briefcase size={32} className="text-blue-600" />}
      actions={
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Nouvelle offre
        </button>
      }
    >
      <div className="p-8">
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Offres d'emploi</h3>
          <p className="text-gray-600 mb-6">Interface de gestion des offres d'emploi - À construire</p>
          <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
            Cette section sera complétée avec la liste des offres, filtres, et actions de gestion.
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
