import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ServiceFormProps {
  categories: Array<{ id: number | string; title: string }>;
  onSuccess?: () => void;
}

export default function ServiceForm({ categories, onSuccess }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    catalog_id: '',
    details: '',
    price: '',
    display_order: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    
    if (!formData.catalog_id) {
      toast.error('Sélectionnez une catégorie');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createService({
        title: formData.title,
        catalog_id: formData.catalog_id,
        details: formData.details || undefined,
        price: formData.price || undefined,
        display_order: formData.display_order || 0,
      });

      if (res?.id || res?.success) {
        toast.success('✅ Service créé');
        setFormData({
          title: '',
          catalog_id: '',
          details: '',
          price: '',
          display_order: 0,
        });
        onSuccess?.();
      } else {
        toast.error('Erreur lors de la création');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white border rounded shadow-sm">
      <h3 className="text-lg font-semibold">Ajouter un service</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Catégorie*</label>
        <select
          name="catalog_id"
          value={formData.catalog_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          disabled={loading}
        >
          <option value="">-- Sélectionnez une catégorie --</option>
          {categories.map(cat => (
            <option key={cat.id} value={String(cat.id)} className="text-slate-900">{cat.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Titre*</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Création de logo"
          className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="details"
          value={formData.details}
          onChange={handleChange}
          placeholder="Détails du service..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prix</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Ex: 50 €"
            className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ordre</label>
          <input
            type="number"
            name="display_order"
            value={formData.display_order}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Création...' : 'Créer'}
      </button>
    </form>
  );
}
