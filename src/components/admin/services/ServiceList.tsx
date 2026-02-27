// src/components/admin/services/ServiceList.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  is_visible: boolean;
  image_url?: string;
  created_at: string;
}

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data || []);
      } else {
        toast.error("Erreur lors du chargement des services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const toggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !isVisible }),
      });
      if (res.ok) {
        toast.success(isVisible ? "Service masqué" : "Service visible");
        fetchServices();
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Service supprimé");
        fetchServices();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Chargement...</div>;
  }

  return (
    <div>
      {services.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Aucun service créé pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition">
              {service.image_url && (
                <img src={service.image_url} alt={service.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                {service.category && (
                  <p className="text-sm text-muted-foreground mb-2 capitalize">{service.category}</p>
                )}
                {service.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                )}
                {service.price && (
                  <p className="text-lg font-semibold mb-4 text-primary">{service.price}€</p>
                )}
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleVisibility(service.id, service.is_visible)}
                  >
                    {service.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <ConfirmButton
                    onConfirm={() => deleteService(service.id)}
                    message="Êtes-vous sûr de vouloir supprimer ce service ?"
                    trigger={
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
