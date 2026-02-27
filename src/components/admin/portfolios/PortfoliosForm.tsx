import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadFile } from '@/lib/upload';

interface PortfoliosFormProps {
  editingId?: number | null;
  onSaved: () => void;
  onCancel: () => void;
}

const SERVICES = [
  { value: 'conception-graphique', label: 'Conception Graphique' },
  { value: 'conception-informatique', label: 'Conception Informatique' },
  { value: 'redaction-documents', label: 'Rédaction de Documents' },
  { value: 'gestion-plateformes', label: 'Gestion de Plateformes' },
  { value: 'services-numeriques', label: 'Services Numériques' },
  { value: 'web-development', label: 'Développement Web' }
];

export default function PortfoliosForm({ editingId, onSaved, onCancel }: PortfoliosFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [project_url, setProjectUrl] = useState('');
  const [service_category, setServiceCategory] = useState('conception-graphique');
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const adminToken = localStorage.getItem('adminToken');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (editingId) {
      const loadPortfolio = async () => {
        try {
          const res = await fetch(`/api/portfolios`);
          const data: Array<Record<string, unknown>> = await res.json();
          const portfolio = data.find((p: Record<string, unknown>) => Number(p.id) === Number(editingId));
          if (portfolio) {
            const p = portfolio as {
              title?: string;
              description?: string;
              image_url?: string;
              project_url?: string;
              service_category?: string;
              featured?: boolean;
            };
            setTitle(p.title || '');
            setDescription(p.description || '');
            setImageUrl(p.image_url || '');
            setImagePreview(p.image_url || '');
            setProjectUrl(p.project_url || '');
            setServiceCategory(p.service_category || 'conception-graphique');
            setFeatured(Boolean(p.featured));
          }
        } catch (err) {
          console.error('Error loading portfolio:', err);
        }
      };
      loadPortfolio();
    }
  }, [editingId]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload image if present
      let finalImageUrl = image_url;
      if (imageFile) {
        try {
          finalImageUrl = await uploadFile(imageFile, adminToken, 'portfolios');
        } catch (err) {
          console.error('Upload error:', err);
          alert("Erreur lors du téléchargement de l'image");
          setLoading(false);
          return;
        }
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/portfolios/${editingId}` : '/api/portfolios';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          image_url: finalImageUrl || null,
          project_url: project_url || null,
          service_category,
          featured,
        }),
      });

      if (res.ok) {
        onSaved();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (err) {
      console.error('Error saving portfolio:', err);
      alert('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Titre *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la réalisation" required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description du projet..." className="min-h-24" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Service *</label>
          <select value={service_category} onChange={(e) => setServiceCategory(e.target.value)} className="w-full px-3 py-2 border rounded-md" required>
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image du projet (optionnel)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-3 py-2 border rounded-md" />
          <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, WebP</p>
        </div>
      </div>

      {imagePreview && (
        <div>
          <label className="block text-sm font-medium mb-2">Aperçu de l'image</label>
          <img src={imagePreview} alt="Aperçu" className="max-h-48 object-cover rounded-md" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">URL du projet (optionnel)</label>
        <Input value={project_url} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://example.com" type="url" />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="featured" checked={featured} onCheckedChange={(checked) => setFeatured(checked as boolean)} />
        <label htmlFor="featured" className="text-sm font-medium cursor-pointer">En vedette (affiché en priorité)</label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{editingId ? 'Mettre à jour' : 'Créer'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
