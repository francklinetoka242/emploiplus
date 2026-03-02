/**
 * Admin Main Content Container
 * Dynamic container for displaying selected menu content
 */

import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
      </div>
    </div>
  );
}

export function AdminMainContent() {
  return (
    <main className="flex-1 bg-gray-50 overflow-auto">
      <div className="container mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </main>
  );
}
