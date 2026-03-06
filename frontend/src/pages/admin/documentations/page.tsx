/**
 * Documentations Manager Page - Clean Rebuild
 * Gestion des documents légaux et politiques
 */

import React from 'react';
import { Shield } from 'lucide-react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';
import DocumentationManager from '@/pages/AdminDashboard/DocumentationManager';

export default function DocumentationsPage() {
  return (
    <AdminPageTemplate
      title="Documentations"
      description="Gérez les documents légaux et les politiques de la plateforme"
      icon={<Shield size={32} className="text-blue-600" />}
    >
      <DocumentationManager />
    </AdminPageTemplate>
  );
}
