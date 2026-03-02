/**
 * Documentation Page - Clean Rebuild
 * System documentation and help
 */

import React from 'react';
import { FileText } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';

export default function DocumentationPage() {
  return (
    <AdminPageTemplate
      title="Documentation"
      description="Documentation complète du système Super Admin"
      icon={<FileText size={32} className="text-pink-600" />}
    >
      <div className="p-8">
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Documentation</h3>
          <p className="text-gray-600 mb-6">Ressources et documentation - À construire</p>
          <div className="inline-block bg-pink-50 text-pink-700 px-4 py-2 rounded-lg text-sm">
            Cette section sera complétée avec les guides, tutoriels, et documentation API.
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
