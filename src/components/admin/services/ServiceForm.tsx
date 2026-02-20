/**
 * Service Form Component
 * For admin management of individual services
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { toast } from '@/lib/toast';

interface Service {
  id: number;
  catalog_id: number;
  name: string;
  description?: string;
  price?: number;
  rating?: number;
  is_promo: boolean;
  promo_text?: string;
  is_visible: boolean;
  image_url?: string;
  brochure_url?: string;
  display_order: number;
}

interface ServiceCatalog {
  id: number;
  name: string;
}

interface ServiceFormProps {
  catalogId?: number;
  onServiceCreated?: (service: Service) => void;
}

export function ServiceForm({ catalogId, onServiceCreated }: ServiceFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [catalogs, setCatalogs] = useState<ServiceCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    catalog_id: catalogId || 0,
    name: '',
    description: '',
    price: '',
    rating: '',
    is_promo: false,
    promo_text: '',
    is_visible: true,
    image_url: '',
    brochure_url: '',
    display_order: 0
  });

  // Fetch services and catalogs
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || '';

      // Fetch services
      const servicesUrl = catalogId
        ? `/api/services?catalog_id=${catalogId}&visible_only=false`
        : '/api/services';

      const [servicesRes, catalogsRes] = await Promise.all([
        fetch(servicesUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/services/catalogs?all=true', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!servicesRes.ok || !catalogsRes.ok) throw new Error('Failed to fetch data');

      const servicesData = await servicesRes.json();
      const catalogsData = await catalogsRes.json();

      setServices(servicesData || []);
      setCatalogs(catalogsData || []);

      if (!catalogId && catalogsData.length > 0) {
        setFormData(prev => ({ ...prev, catalog_id: catalogsData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.catalog_id) {
      toast({
        title: 'Validation',
        description: 'Le nom et le catalogue sont obligatoires',
        variant: 'destructive'
      });
      return;
    }

    if (formData.rating && (parseFloat(formData.rating) < 1 || parseFloat(formData.rating) > 5)) {
      toast({
        title: 'Validation',
        description: 'La note doit être entre 1 et 5',
        variant: 'destructive'
      });
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/services/${editingId}` : '/api/services';

      const payload = {
        catalog_id: parseInt(String(formData.catalog_id)),
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        is_promo: formData.is_promo,
        promo_text: formData.promo_text || null,
        is_visible: formData.is_visible,
        image_url: formData.image_url || null,
        brochure_url: formData.brochure_url || null,
        display_order: formData.display_order
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save service');

      const savedService = await response.json();

      if (editingId) {
        setServices(services.map(s => s.id === editingId ? savedService : s));
      } else {
        setServices([...services, savedService]);
      }

      onServiceCreated?.(savedService);
      setIsDialogOpen(false);
      resetForm();

      toast({
        title: 'Succès',
        description: editingId ? 'Service mis à jour' : 'Service créé'
      });
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le service',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      catalog_id: service.catalog_id,
      name: service.name,
      description: service.description || '',
      price: service.price ? String(service.price) : '',
      rating: service.rating ? String(service.rating) : '',
      is_promo: service.is_promo,
      promo_text: service.promo_text || '',
      is_visible: service.is_visible,
      image_url: service.image_url || '',
      brochure_url: service.brochure_url || '',
      display_order: service.display_order
    });
    setEditingId(service.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service?')) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete service');

      setServices(services.filter(s => s.id !== id));
      toast({
        title: 'Succès',
        description: 'Service supprimé'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le service',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      catalog_id: catalogId || (catalogs.length > 0 ? catalogs[0].id : 0),
      name: '',
      description: '',
      price: '',
      rating: '',
      is_promo: false,
      promo_text: '',
      is_visible: true,
      image_url: '',
      brochure_url: '',
      display_order: 0
    });
    setEditingId(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getCatalogName = (id: number) => {
    return catalogs.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Services</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Éditer' : 'Créer'} un Service
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations du service.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Catalogue *
                </label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.catalog_id}
                  onChange={(e) => setFormData({ ...formData, catalog_id: parseInt(e.target.value) })}
                  required
                >
                  <option value="">Sélectionner un catalogue</option>
                  {catalogs.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom du Service *
                </label>
                <Input
                  type="text"
                  placeholder="ex: Consultation RH"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Description du service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prix (XAF)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Note (1-5)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    checked={formData.is_promo}
                    onChange={(e) => setFormData({ ...formData, is_promo: e.target.checked })}
                  />
                  En Promotion
                </label>
                {formData.is_promo && (
                  <Input
                    type="text"
                    placeholder="ex: -20% cette semaine!"
                    value={formData.promo_text}
                    onChange={(e) => setFormData({ ...formData, promo_text: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  URL Image
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  URL Brochure
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.brochure_url}
                  onChange={(e) => setFormData({ ...formData, brochure_url: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    />
                    Visible
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ordre d'affichage
                  </label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseDialog}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : services.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Aucun service créé. Commencez par en créer un.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.is_promo && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        En Promo
                      </span>
                    )}
                    {!service.is_visible && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getCatalogName(service.catalog_id)}
                  </p>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {service.price && (
                      <span className="font-medium">{service.price.toLocaleString('fr-CM')} XAF</span>
                    )}
                    {service.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{service.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
