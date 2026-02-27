import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import ServiceCategoryForm from '@/components/admin/ServiceCategoryForm';
import ServiceForm from '@/components/admin/ServiceForm';

export default function CataloguesServicesPage() {
  const [tab, setTab] = useState<'categories'|'services'|'addCategory'|'addService'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const loadCategories = async () => {
    try {
      const res = await api.getAdminServiceCategories();
      const data = res?.data || res || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les catégories');
    }
  };

  const loadServices = async () => {
    try {
      const res = await api.getAdminServices(selectedCategory ? { category_id: selectedCategory } : undefined);
      const data = res?.data || res || [];
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les services');
    }
  };

  const refreshAll = () => {
    loadCategories();
    loadServices();
  };

  useEffect(() => { loadCategories(); loadServices(); }, [selectedCategory]);

  const toggleCategoryFeatured = async (id: string, current: boolean) => {
    const prev = categories;
    setCategories(prev.map(c => c.id === id ? { ...c, is_featured: !current } : c));
    try {
      const res = await api.toggleServiceCategoryFeature(id, !current);
      if (!res || res.success === false) {
        setCategories(prev);
        toast.error('Échec de la mise à jour');
      } else {
        toast.success(!current ? 'Catégorie mise en vedette' : 'Catégorie retirée des vedettes');
      }
    } catch (err) {
      console.error(err);
      setCategories(prev);
      toast.error('Échec');
    }
  };

  const toggleServiceFeatured = async (id: string, current: boolean) => {
    const prev = services;
    setServices(prev.map(s => s.id === id ? { ...s, is_featured: !current } : s));
    try {
      const res = await api.toggleServiceFeature(id, !current);
      if (!res || res.success === false) {
        setServices(prev);
        toast.error('Échec de la mise à jour');
      } else {
        toast.success(!current ? 'Service mis en vedette' : 'Service retiré des vedettes');
      }
    } catch (err) {
      console.error(err);
      setServices(prev);
      toast.error('Échec');
    }
  };

  return (
    <div className="p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Catalogues & Services</h1>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={tab === 'categories' ? 'secondary' : 'ghost'} onClick={() => setTab('categories')} className="text-sm">Catégories (Liste)</Button>
        <Button variant={tab === 'services' ? 'secondary' : 'ghost'} onClick={() => setTab('services')} className="text-sm">Services (Liste)</Button>
        <Button variant={tab === 'addCategory' ? 'secondary' : 'ghost'} onClick={() => setTab('addCategory')} className="text-sm">+ Catégorie</Button>
        <Button variant={tab === 'addService' ? 'secondary' : 'ghost'} onClick={() => setTab('addService')} className="text-sm">+ Service</Button>
      </div>

      {/* Formulaire Catégorie */}
      {tab === 'addCategory' && (
        <div className="mb-8">
          <ServiceCategoryForm onSuccess={() => { refreshAll(); setTab('categories'); }} />
        </div>
      )}

      {/* Formulaire Service */}
      {tab === 'addService' && (
        <div className="mb-8">
          <ServiceForm categories={categories} onSuccess={() => { refreshAll(); setTab('services'); }} />
        </div>
      )}

      {/* Liste Catégories */}
      {tab === 'categories' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="p-3 font-semibold">Titre</th>
                <th className="p-3 font-semibold">Description</th>
                <th className="p-3 font-semibold">Vedette</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={3} className="p-3 text-center text-gray-500">Aucune catégorie</td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{c.title}</td>
                    <td className="p-3 text-sm text-gray-600">{c.description || '-'}</td>
                    <td className="p-3">
                      <button onClick={() => toggleCategoryFeatured(String(c.id), !!c.is_featured)} className="flex items-center gap-1">
                        <Star className={`h-4 w-4 ${c.is_featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        <span className="text-sm">{c.is_featured ? 'Oui' : 'Non'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Liste Services */}
      {tab === 'services' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Filtrer par catégorie</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="">Toutes</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="p-3 font-semibold">Titre</th>
                  <th className="p-3 font-semibold">Prix</th>
                  <th className="p-3 font-semibold">Détails</th>
                  <th className="p-3 font-semibold">Vedette</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr><td colSpan={4} className="p-3 text-center text-gray-500">Aucun service</td></tr>
                ) : (
                  services.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{s.title}</td>
                      <td className="p-3 text-sm">{s.price || '-'}</td>
                      <td className="p-3 text-sm text-gray-600">{s.details || '-'}</td>
                      <td className="p-3">
                        <button onClick={() => toggleServiceFeatured(String(s.id), !!s.is_featured)} className="flex items-center gap-1">
                          <Star className={`h-4 w-4 ${s.is_featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          <span className="text-sm">{s.is_featured ? 'Oui' : 'Non'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
