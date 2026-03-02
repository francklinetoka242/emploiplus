/**
 * Admin Page Template Component
 * Reusable template for all admin pages
 */

import React, { ReactNode } from 'react';

interface AdminPageTemplateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}

export function AdminPageTemplate({
  title,
  description,
  icon,
  children,
  actions
}: AdminPageTemplateProps) {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          {icon && <div className="text-gray-600">{icon}</div>}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-gray-600 mt-2">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Page Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {children}
      </div>
    </div>
  );
}
