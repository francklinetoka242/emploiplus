/**
 * FAQ Page - Clean Rebuild
 * Manage FAQ entries
 */

import React from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';

export default function FAQPage() {
  return (
    <AdminPageTemplate
      title="FAQ"
      description="Gestion des questions fréquemment posées"
      icon={<HelpCircle size={32} className="text-teal-600" />}
      actions={
        <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
          <Plus size={20} />
          Ajouter FAQ
        </button>
      }
    >
      <div className="p-8">
        <div className="text-center py-12">
          <HelpCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">FAQ</h3>
          <p className="text-gray-600 mb-6">Interface de gestion des FAQ - À construire</p>
          <div className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-lg text-sm">
            Cette section sera complétée avec la liste FAQ, édition, et organisation par catégories.
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
