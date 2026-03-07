import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ServiceCategoryFormProps {
  onSuccess?: () => void;
}

export default function ServiceCategoryForm({ onSuccess }: ServiceCategoryFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createServiceCategory(formData);
      
      if (res?.data?.id || res?.success) {
        toast.success('✅ Catégorie créée');
        setFormData({ title: '', description: '', icon: '' });
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
      <h3 className="text-lg font-semibold">Ajouter une catégorie</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Titre*</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Design Graphique"
          className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description courte..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Icône</label>
        <input
          type="text"
          name="icon"
          value={formData.icon}
          onChange={handleChange}
          placeholder="Nom de l'icône (ex: star)"
          className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
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
