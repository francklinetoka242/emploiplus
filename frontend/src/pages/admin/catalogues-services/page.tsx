import { useEffect, useState } from 'react';
import { Star, Trash2, Edit, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import ServiceCategoryForm from '@/components/admin/ServiceCategoryForm';
import ServiceForm from '@/components/admin/ServiceForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CataloguesServicesPage() {
  const [tab, setTab] = useState<'categories'|'services'|'addCategory'|'addService'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'service', id: string } | null>(null);

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
    setCategories(prev.map(c => c.id === parseInt(id) ? { ...c, is_featured: !current } : c));
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

  const deleteCategory = async (id: string) => {
    try {
      const res = await api.deleteServiceCategory(id);
      if (!res || res.success === false) {
        toast.error('Échec de la suppression');
      } else {
        setCategories(categories.filter(c => c.id !== parseInt(id)));
        toast.success('Catégorie supprimée');
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Échec de la suppression');
    }
  };

  const toggleServiceFeatured = async (id: string, current: boolean) => {
    const prev = services;
    setServices(prev.map(s => s.id === parseInt(id) ? { ...s, is_featured: !current } : s));
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

  const deleteService = async (id: string) => {
    try {
      const res = await api.deleteService(id);
      if (!res || res.success === false) {
        toast.error('Échec de la suppression');
      } else {
        setServices(services.filter(s => s.id !== parseInt(id)));
        toast.success('Service supprimé');
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Échec de la suppression');
    }
  };

  const moveCategory = async (id: number, direction: 'up' | 'down') => {
    const index = categories.findIndex(c => c.id === id);
    if (direction === 'up' && index > 0) {
      const current = categories[index];
      const other = categories[index - 1];
      
      // Swap display_order
      const newCategories = [...categories];
      [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
      setCategories(newCategories);
      
      try {
        // Update both categories on backend
        await api.updateServiceCategory(String(current.id), { display_order: other.display_order });
        await api.updateServiceCategory(String(other.id), { display_order: current.display_order });
        toast.success('Position mise à jour');
      } catch (err) {
        console.error(err);
        setCategories(categories);
        toast.error('Erreur lors de la mise à jour de la position');
      }
    } else if (direction === 'down' && index < categories.length - 1) {
      const current = categories[index];
      const other = categories[index + 1];
      
      // Swap display_order
      const newCategories = [...categories];
      [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
      setCategories(newCategories);
      
      try {
        // Update both categories on backend
        await api.updateServiceCategory(String(current.id), { display_order: other.display_order });
        await api.updateServiceCategory(String(other.id), { display_order: current.display_order });
        toast.success('Position mise à jour');
      } catch (err) {
        console.error(err);
        setCategories(categories);
        toast.error('Erreur lors de la mise à jour de la position');
      }
    }
  };

  const moveService = async (id: number, direction: 'up' | 'down') => {
    // Find the service
    const serviceIndex = services.findIndex(s => s.id === id);
    if (serviceIndex === -1) return;
    
    const service = services[serviceIndex];
    
    // Get all services in the same category
    const categoryServices = services.filter(s => s.catalog_id === service.catalog_id);
    const indexInCategory = categoryServices.findIndex(s => s.id === id);
    
    if (direction === 'up' && indexInCategory > 0) {
      // Find the service to swap with
      const serviceAbove = categoryServices[indexInCategory - 1];
      const newServices = services.map(s => {
        if (s.id === id) return serviceAbove;
        if (s.id === serviceAbove.id) return service;
        return s;
      });
      setServices(newServices);
      
      try {
        // Update both services on backend
        await api.updateService(String(service.id), { display_order: serviceAbove.display_order });
        await api.updateService(String(serviceAbove.id), { display_order: service.display_order });
        toast.success('Position mise à jour');
      } catch (err) {
        console.error(err);
        setServices(services);
        toast.error('Erreur lors de la mise à jour de la position');
      }
    } else if (direction === 'down' && indexInCategory < categoryServices.length - 1) {
      // Find the service to swap with
      const serviceBelow = categoryServices[indexInCategory + 1];
      const newServices = services.map(s => {
        if (s.id === id) return serviceBelow;
        if (s.id === serviceBelow.id) return service;
        return s;
      });
      setServices(newServices);
      
      try {
        // Update both services on backend
        await api.updateService(String(service.id), { display_order: serviceBelow.display_order });
        await api.updateService(String(serviceBelow.id), { display_order: service.display_order });
        toast.success('Position mise à jour');
      } catch (err) {
        console.error(err);
        setServices(services);
        toast.error('Erreur lors de la mise à jour de la position');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Catalogues & Services</h1>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={tab === 'categories' ? 'secondary' : 'ghost'} onClick={() => setTab('categories')} className="text-sm">📚 Catégories</Button>
        <Button variant={tab === 'services' ? 'secondary' : 'ghost'} onClick={() => setTab('services')} className="text-sm">⚙️ Services</Button>
        <Button variant={tab === 'addCategory' ? 'secondary' : 'ghost'} onClick={() => setTab('addCategory')} className="text-sm">➕ Catégorie</Button>
        <Button variant={tab === 'addService' ? 'secondary' : 'ghost'} onClick={() => setTab('addService')} className="text-sm">➕ Service</Button>
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
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600">Aucune catégorie. Créez-en une pour commencer.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => (
                <div key={category.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon || '📁'}</span>
                        <div>
                          <h3 className="font-bold text-slate-900">{category.name}</h3>
                          <p className="text-xs text-slate-600">{category.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingCategory(category)}
                          className="flex-1 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          size="sm" 
                          variant={category.is_featured ? 'secondary' : 'outline'}
                          onClick={() => toggleCategoryFeatured(String(category.id), category.is_featured)}
                          className="flex-1 text-xs"
                        >
                          {category.is_featured ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Masquée
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleCategoryFeatured(String(category.id), category.is_featured)}
                          className="flex-1 text-xs"
                          title={category.is_featured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                        >
                          <Star className={`h-3 w-3 mr-1 ${category.is_featured ? 'fill-yellow-400' : ''}`} />
                          {category.is_featured ? '⭐' : 'À la une'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setDeleteConfirm({ type: 'category', id: String(category.id) })}
                          className="flex-1 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>

                    {/* Positionnement */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={index === 0}
                        onClick={() => moveCategory(category.id, 'up')}
                        className="flex-1 text-xs"
                      >
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Haut
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={index === categories.length - 1}
                        onClick={() => moveCategory(category.id, 'down')}
                        className="flex-1 text-xs"
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Bas
                      </Button>
                      <span className="text-xs text-slate-600 flex items-center px-2">
                        Position {index + 1}/{categories.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Liste Services */}
      {tab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filtrer par catégorie:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)} 
              className="px-3 py-2 border border-slate-300 rounded text-sm flex-1 max-w-xs bg-white text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Toutes les catégories —</option>
              {categories.map(c => <option key={c.id} value={String(c.id)} className="text-slate-900">{c.name}</option>)}
            </select>
          </div>

          {services.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600">Aucun service. Créez-en un pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grouper les services par catégorie */}
              {categories.map((category) => {
                const categoryServices = services.filter(s => s.catalog_id === category.id);
                if (categoryServices.length === 0) return null;
                
                return (
                  <div key={category.id} className="border rounded-lg overflow-hidden bg-white">
                    {/* En-tête de catégorie */}
                    <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b p-4 flex items-center gap-3">
                      <span className="text-2xl">{category.icon || '📋'}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{category.name}</h3>
                        <p className="text-xs text-slate-600">{category.description || ''}</p>
                      </div>
                      <span className="text-xs bg-slate-200 px-2 py-1 rounded font-medium">
                        {categoryServices.length} service{categoryServices.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Liste des services */}
                    <div className="divide-y">
                      {categoryServices.map((service, index) => (
                        <div key={service.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="mb-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900">{service.name}</h4>
                                <p className="text-xs text-slate-600 line-clamp-2">{service.description}</p>
                              </div>
                            </div>
                            {(service.price || service.duration) && (
                              <div className="flex gap-4 text-sm mt-2">
                                {service.price && (
                                  <span className="font-semibold text-slate-900">{service.price} USD</span>
                                )}
                                {service.duration && (
                                  <span className="text-slate-600">{service.duration}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingService(service)}
                                className="text-xs"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Modifier
                              </Button>
                              <Button 
                                size="sm" 
                                variant={service.is_featured ? 'secondary' : 'outline'}
                                onClick={() => toggleServiceFeatured(String(service.id), service.is_featured)}
                                className="text-xs"
                              >
                                {service.is_featured ? (
                                  <>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Visible
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Masqué
                                  </>
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toggleServiceFeatured(String(service.id), service.is_featured)}
                                className="text-xs"
                                title={service.is_featured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                              >
                                <Star className={`h-3 w-3 mr-1 ${service.is_featured ? 'fill-yellow-400' : ''}`} />
                                {service.is_featured ? '⭐' : 'À la une'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setDeleteConfirm({ type: 'service', id: String(service.id) })}
                                className="text-xs"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Supprimer
                              </Button>
                            </div>

                            {/* Positionnement */}
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={index === 0}
                                onClick={() => moveService(service.id, 'up')}
                                className="text-xs"
                              >
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Haut
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={index === categoryServices.length - 1}
                                onClick={() => moveService(service.id, 'down')}
                                className="text-xs"
                              >
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Bas
                              </Button>
                              <span className="text-xs text-slate-600 flex items-center px-2">
                                Position {index + 1}/{categoryServices.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal d'édition Catégorie */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Modifier la catégorie</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input 
                  type="text" 
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icône</label>
                <input 
                  type="text" 
                  value={editingCategory.icon || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 📁"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingCategory(null)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const res = await api.updateServiceCategory(String(editingCategory.id), {
                        name: editingCategory.name,
                        description: editingCategory.description,
                        icon: editingCategory.icon
                      });
                      if (!res || res.success === false) {
                        toast.error('Échec de la mise à jour');
                      } else {
                        setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c));
                        toast.success('Catégorie mise à jour');
                        setEditingCategory(null);
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error('Erreur lors de la mise à jour');
                    }
                  }}
                  className="flex-1"
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition Service */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Modifier le service</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input 
                  type="text" 
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix</label>
                <input 
                  type="text" 
                  value={editingService.price || ''}
                  onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durée</label>
                <input 
                  type="text" 
                  value={editingService.duration || ''}
                  onChange={(e) => setEditingService({...editingService, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingService(null)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const res = await api.updateService(String(editingService.id), {
                        name: editingService.name,
                        description: editingService.description,
                        price: editingService.price,
                        duration: editingService.duration
                      });
                      if (!res || res.success === false) {
                        toast.error('Échec de la mise à jour');
                      } else {
                        setServices(services.map(s => s.id === editingService.id ? editingService : s));
                        toast.success('Service mis à jour');
                        setEditingService(null);
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error('Erreur lors de la mise à jour');
                    }
                  }}
                  className="flex-1"
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogue de suppression */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {deleteConfirm?.type === 'category' ? 'cette catégorie' : 'ce service'}? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirm?.type === 'category') {
                  deleteCategory(deleteConfirm.id);
                } else if (deleteConfirm?.type === 'service') {
                  deleteService(deleteConfirm.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
