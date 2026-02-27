/**
 * Catalogues & Services Page - Clean Rebuild
 * Manage service catalogs
 */

import React from 'react';
import { Layers, Plus } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';

export default function CataloguesServicesPage() {
  return (
    <AdminPageTemplate
      title="Catalogues & Services"
      description="Gestion des catalogues et services disponibles"
      icon={<Layers size={32} className="text-indigo-600" />}
      actions={
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={20} />
          Ajouter un catalogue
        </button>
      }
    >
      <div className="p-8">
        <div className="text-center py-12">
          <Layers size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Catalogues & Services</h3>
          <p className="text-gray-600 mb-6">Interface de gestion des catalogues et services - À construire</p>
          <div className="inline-block bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm">
            Cette section sera complétée avec la gestion des catalogues, services, et catégorisation.
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
