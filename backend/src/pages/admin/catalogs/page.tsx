// src/pages/admin/catalogs/page.tsx
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { authHeaders } from '@/lib/headers';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: "redaction" | "informatique" | "digital" | "graphique";
  price?: number;
  image_url?: string;
  created_at: string;
}

type FormState = CatalogItem | null;

const CatalogsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FormState>(null);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "redaction" as "redaction" | "informatique" | "digital" | "graphique",
    price: "",
    image_url: "",
  });

  const { data: catalogs = [], refetch } = useQuery({
    queryKey: ["catalogs"],
    queryFn: async () => {
      const res = await fetch("/api/service-catalogs");
      return res.json();
    },
  });

  // Filter catalogs
  const filteredCatalogs = useMemo(() => {
    let result = catalogs;

    if (filterCategory) {
      result = result.filter((item: CatalogItem) => item.category === filterCategory);
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter((item: CatalogItem) =>
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search)
      );
    }

    return result;
  }, [catalogs, filterCategory, searchText]);

  // Helper: Convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem('adminToken');
      const res = await fetch("/api/service-catalogs", {
        method: "POST",
        headers: authHeaders('application/json', 'adminToken'),
        body: JSON.stringify({
          ...data,
          price: data.price ? parseInt(data.price) : null,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Service ajouté avec succès");
      resetForm();
      refetch();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/service-catalogs/${editingItem?.id}`, {
        method: "PATCH",
        headers: authHeaders('application/json', 'adminToken'),
        body: JSON.stringify({
          ...data,
          price: data.price ? parseInt(data.price) : null,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Service mis à jour");
      resetForm();
      refetch();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/service-catalogs/${id}`, { method: 'DELETE', headers: authHeaders(undefined, 'adminToken') });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Service supprimé avec succès');
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "redaction",
      price: "",
      image_url: "",
    });
    setImageFile(null);
    setImagePreview("");
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category as "redaction" | "informatique" | "digital" | "graphique",
      price: item.price?.toString() || "",
      image_url: item.image_url || "",
    });
    setImagePreview(item.image_url || "");
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const adminToken = localStorage.getItem('adminToken');

    let imageUrl = formData.image_url;

    // If a new image was selected, upload it to the server first
    if (imageFile) {
      try {
          imageUrl = await uploadFile(imageFile, adminToken, 'services');
      } catch (error) {
        toast.error('Erreur lors du téléchargement de l\'image');
        return;
      }
    }

    const dataToSubmit = {
      ...formData,
      image_url: imageUrl,
    };

    if (editingItem) {
      updateMutation.mutate(dataToSubmit as typeof formData);
    } else {
      addMutation.mutate(dataToSubmit as typeof formData);
    }
  };

  const categoryLabels: Record<string, string> = {
    redaction: "Rédaction",
    informatique: "Informatique",
    digital: "Digital",
    graphique: "Design Graphique",
  };

  return (
    <div className="p-10 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="h-12 w-12 text-primary" />
            Catalogue de Services
          </h1>
          <p className="text-xl text-muted-foreground mt-3">
            Gérez vos services et tarifs
          </p>
        </div>
        <Button
          size="lg"
          className="shadow-lg"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="mr-3 h-6 w-6" />
          Nouveau service
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Filtres
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Rechercher</label>
            <input
              type="text"
              placeholder="Nom ou description..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Catégorie</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              <option value="redaction">Rédaction</option>
              <option value="informatique">Informatique</option>
              <option value="digital">Digital</option>
              <option value="graphique">Design Graphique</option>
            </select>
          </div>

          {/* Count */}
          <div className="flex items-end">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredCatalogs.length} service{filteredCatalogs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">
                {editingItem ? "Modifier le service" : "Ajouter un service"}
              </h2>
              <button
                onClick={() => resetForm()}
                className="text-2xl font-bold text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Nom du service</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <select
                  value={formData.category}
                   onChange={(e) => setFormData({ ...formData, category: e.target.value as "redaction" | "informatique" | "digital" | "graphique" })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="redaction">Rédaction</option>
                  <option value="informatique">Informatique</option>
                  <option value="digital">Digital</option>
                  <option value="graphique">Design Graphique</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">Prix (FCFA)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Image du service</label>
                {imagePreview && (
                  <div className="mb-4">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu" 
                      className="w-full max-h-64 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Format: JPG, PNG, WebP. Taille max: 5 MB
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {editingItem ? "Modifier" : "Ajouter"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => resetForm()}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {filteredCatalogs.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-muted-foreground">Aucun service trouvé</p>
          </Card>
        ) : (
          filteredCatalogs.map((item: CatalogItem) => (
            <Card key={item.id} className="p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{item.name}</h3>
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {categoryLabels[item.category]}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{item.description}</p>
                  {item.price && (
                    <p className="text-lg font-bold text-primary">
                      {item.price.toLocaleString()} FCFA
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <ConfirmButton title="Supprimer ce service ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => deleteMutation.mutate(item.id)}>
                    <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                  </ConfirmButton>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CatalogsPage;
