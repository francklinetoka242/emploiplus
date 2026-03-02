/**
 * Services Management Module
 * Main component for Super Admin dashboard
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Settings } from 'lucide-react';
import ServiceCatalogForm from './ServiceCatalogForm';
import ServiceForm from './ServiceForm';
import { ServiceShowcase } from './ServiceShowcase';

export function ServicesManagement() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCatalogCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold">Gestion des Services</h1>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage" className="gap-2">
            <Settings className="h-4 w-4" />
            Gestion
          </TabsTrigger>
          <TabsTrigger value="showcase">
            Aperçu Public
          </TabsTrigger>
          <TabsTrigger value="settings">
            Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Management Tab */}
        <TabsContent value="manage" className="space-y-8 mt-6">
          <div key={refreshKey}>
            <ServiceCatalogForm onCatalogCreated={handleCatalogCreated} />
          </div>

          <hr className="my-8" />

          <ServiceForm onServiceCreated={handleCatalogCreated} />
        </TabsContent>

        {/* Showcase Tab */}
        <TabsContent value="showcase" className="mt-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Aperçu de la Vitrine Publique</h2>
            <p className="text-gray-600 mb-6">
              Voici comment les visiteurs verront votre catalogue de services.
            </p>
            <ServiceShowcase />
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Paramètres des Services</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">API Endpoints</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded border">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Catalogs</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      GET /api/services/catalogs
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Services</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      GET /api/services
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Règles de Visibilité</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Si un catalogue est masqué, tous ses services le sont aussi</li>
                  <li>Les services peuvent avoir une visibilité propre indépendante</li>
                  <li>Les promotions affichent un badge accrocheur</li>
                  <li>Les notes de 1 à 5 étoiles sont affichées graphiquement</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Boutons de Partage</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>WhatsApp - Partage direct avec les amis</li>
                  <li>Facebook - Partage sur le réseau social</li>
                  <li>Copier le lien - Pour partage personnalisé</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sécurité</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Routes protégées par middleware adminAuth</li>
                  <li>Suppression réservée au super_admin</li>
                  <li>Erreurs gérées par Global Error Handler</li>
                  <li>Module isolé dans services.routes.ts</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
