/**
 * Formations Management Page - Clean Rebuild
 * Manage training programs
 */

import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';

export default function FormationsPage() {
  return (
    <AdminPageTemplate
      title="Formations"
      description="Gestion centralisée de tous les programmes de formation"
      icon={<BookOpen size={32} className="text-purple-600" />}
      actions={
        <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <Plus size={20} />
          Nouvelle formation
        </button>
      }
    >
      <div className="p-8">
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Formations</h3>
          <p className="text-gray-600 mb-6">Interface de gestion des formations - À construire</p>
          <div className="inline-block bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm">
            Cette section sera complétée avec la liste des formations, modules, et gestion des participants.
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
