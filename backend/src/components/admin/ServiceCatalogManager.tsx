import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, Plus, Trash2, Copy, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: number;
  name: string;
  category: string;
  description?: string;
  price?: number;
  created_at?: string;
}

interface PromoCode {
  id: number;
  code: string;
  discount: number;
  description: string;
  usage_count?: number;
  created_at?: string;
}

export const ServiceCatalogManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoDescription, setPromoDescription] = useState('');

  // Fetch services
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('/api/admin/services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
  });

  // Fetch promo codes
  const { data: promos = [] } = useQuery<PromoCode[]>({
    queryKey: ['admin-promos'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('/api/admin/promo-codes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch promos');
      return response.json();
    },
  });

  // Update service price
  const updatePriceMutation = useMutation({
    mutationFn: async (data: { id: number; price: number }) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`/api/admin/services/${data.id}/price`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: data.price }),
      });
      if (!response.ok) throw new Error('Failed to update price');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Prix mis à jour avec succès');
      setEditingId(null);
      setNewPrice('');
    },
    onError: () => toast.error('Erreur lors de la mise à jour du prix'),
  });

  // Create promo code
  const createPromoMutation = useMutation({
    mutationFn: async (data: { code: string; discount: number; description: string }) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create promo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      toast.success('Code promo créé avec succès');
      setPromoCode('');
      setPromoDiscount('');
      setPromoDescription('');
    },
    onError: () => toast.error('Erreur lors de la création du code promo'),
  });

  // Delete promo code
  const deletePromoMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete promo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      toast.success('Code promo supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const handleUpdatePrice = (id: number) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      toast.error('Prix invalide');
      return;
    }
    updatePriceMutation.mutate({ id, price });
  };

  const handleCreatePromo = () => {
    if (!promoCode.trim() || !promoDiscount || !promoDescription.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    const discount = parseFloat(promoDiscount);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      toast.error('La réduction doit être entre 1 et 100%');
      return;
    }
    createPromoMutation.mutate({
      code: promoCode.toUpperCase(),
      discount,
      description: promoDescription,
    });
  };

  const filteredServices = services.filter((s: Service) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">
            <Zap className="w-4 h-4 mr-2" />
            Services & Tarifs
          </TabsTrigger>
          <TabsTrigger value="promos">
            <Copy className="w-4 h-4 mr-2" />
            Codes Promos
          </TabsTrigger>
        </TabsList>

        {/* Services & Pricing */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Chercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucun service trouvé</div>
          ) : (
            <div className="space-y-3">
              {filteredServices.map((service: Service) => (
                <Card key={service.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-600">
                        Catégorie: {service.category}
                      </p>
                      <p className="text-lg font-bold mt-1">
                        ${service.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>

                    {editingId === service.id ? (
                      <div className="flex gap-2 ml-4">
                        <Input
                          type="number"
                          placeholder="Nouveau prix"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-32"
                          step="0.01"
                          min="0"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdatePrice(service.id)}
                          disabled={updatePriceMutation.isPending}
                        >
                          {updatePriceMutation.isPending ? 'Mise à jour...' : 'Valider'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setNewPrice('');
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(service.id);
                          setNewPrice(service.price?.toString() || '');
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Promo Codes */}
        <TabsContent value="promos" className="space-y-4">
          <Card className="p-4 bg-blue-50">
            <h3 className="font-semibold mb-4">Créer un nouveau code promo</h3>
            <div className="space-y-3">
              <Input
                placeholder="Code promo (ex: SUMMER2024)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Réduction (%)"
                  value={promoDiscount}
                  onChange={(e) => setPromoDiscount(e.target.value)}
                  min="1"
                  max="100"
                  className="w-32"
                />
                <span className="flex items-center">%</span>
              </div>
              <Input
                placeholder="Description (ex: Offre d'été)"
                value={promoDescription}
                onChange={(e) => setPromoDescription(e.target.value)}
              />
              <Button
                onClick={handleCreatePromo}
                disabled={createPromoMutation.isPending}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createPromoMutation.isPending ? 'Création...' : 'Créer Code Promo'}
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold">Codes Promos Actifs ({promos.length})</h3>
            {promos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucun code promo créé</div>
            ) : (
              promos.map((promo: PromoCode) => (
                <Card key={promo.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-3 py-1 rounded font-mono font-bold">
                          {promo.code}
                        </code>
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          -{promo.discount}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{promo.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Utilisations: {promo.usage_count || 0}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePromoMutation.mutate(promo.id)}
                      disabled={deletePromoMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
