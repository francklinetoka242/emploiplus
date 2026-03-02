/**
 * Service Catalog Form Component
 * For admin management of service catalog categories
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
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceCatalog {
  id: number;
  name: string;
  description?: string;
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;
}

interface ServiceCatalogFormProps {
  onCatalogCreated?: (catalog: ServiceCatalog) => void;
}

export default function ServiceCatalogForm({ onCatalogCreated }: ServiceCatalogFormProps) {
  const [catalogs, setCatalogs] = useState<ServiceCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_visible: true,
    is_featured: false,
    display_order: 0
  });

  // Fetch catalogs
  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services/catalogs?all=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch catalogs');
      
      const data = await response.json();
      setCatalogs(data || []);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les catalogues',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation',
        description: 'Le nom du catalogue est obligatoire',
        variant: 'destructive'
      });
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/services/catalogs/${editingId}` : '/api/services/catalogs';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save catalog');

      const savedCatalog = await response.json();
      
      if (editingId) {
        setCatalogs(catalogs.map(c => c.id === editingId ? savedCatalog : c));
      } else {
        setCatalogs([...catalogs, savedCatalog]);
      }

      onCatalogCreated?.(savedCatalog);
      setIsDialogOpen(false);
      resetForm();

      toast({
        title: 'Succès',
        description: editingId ? 'Catalogue mis à jour' : 'Catalogue créé'
      });
    } catch (error) {
      console.error('Error saving catalog:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le catalogue',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (catalog: ServiceCatalog) => {
    setFormData({
      name: catalog.name,
      description: catalog.description || '',
      is_visible: catalog.is_visible,
      is_featured: catalog.is_featured,
      display_order: catalog.display_order
    });
    setEditingId(catalog.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce catalogue? (Les services seront aussi supprimés)')) {
      return;
    }

    try {
      const response = await fetch(`/api/services/catalogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete catalog');

      setCatalogs(catalogs.filter(c => c.id !== id));
      toast({
        title: 'Succès',
        description: 'Catalogue supprimé'
      });
    } catch (error) {
      console.error('Error deleting catalog:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le catalogue',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_visible: true,
      is_featured: false,
      display_order: 0
    });
    setEditingId(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Catalogues de Services</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Catalogue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Éditer' : 'Créer'} un Catalogue
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations du catalogue de services.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom du Catalogue *
                </label>
                <Input
                  type="text"
                  placeholder="ex: Conseil en Ressources Humaines"
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
                  placeholder="Description du catalogue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    />
                    Mis en avant
                  </label>
                </div>
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
      ) : catalogs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Aucun catalogue créé. Commencez par en créer un.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {catalogs.map((catalog) => (
            <Card key={catalog.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{catalog.name}</h3>
                    {catalog.is_featured && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        Mis en avant
                      </span>
                    )}
                    {!catalog.is_visible && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Masqué
                      </span>
                    )}
                  </div>
                  {catalog.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {catalog.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Ordre: {catalog.display_order}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(catalog)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(catalog.id)}
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
