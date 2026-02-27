import { Breadcrumb } from "@/components/Breadcrumb";
import { PWALayout } from "@/components/layout/PWALayout";
import ServicesCatalogList from "@/components/services/ServicesCatalogList";

export default function Services() {
  return (
    <PWALayout notificationCount={0} messageCount={0}>
      <div className="min-h-screen bg-white pb-8">
        <div className="max-w-6xl mx-auto py-6">
          <Breadcrumb />
          <h1 className="text-3xl font-bold mb-2 px-4">Services & Catalogues</h1>
          <p className="text-gray-600 mb-8 px-4">Parcourez nos services et catalogues disponibles</p>
          <ServicesCatalogList />
        </div>
      </div>
    </PWALayout>
  );
}
