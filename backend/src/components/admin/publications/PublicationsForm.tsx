import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface PublicationsFormProps {
  editingId?: number | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function PublicationsForm({ editingId, onSaved, onCancel }: PublicationsFormProps) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [hashtags, setHashtags] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (editingId) {
      const loadPublication = async () => {
        try {
          const res = await fetch(`/api/publications`);
          const data = await res.json();
          const pub = data.find((p: any) => p.id === editingId);
          if (pub) {
            setContent(pub.content || '');
            setVisibility(pub.visibility || 'public');
            setHashtags(pub.hashtags || '');
            setImageUrl(pub.image_url || '');
          }
        } catch (err) {
          console.error('Error loading publication:', err);
        }
      };
      loadPublication();
    }
  }, [editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/publications/${editingId}` : '/api/publications';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          content,
          visibility,
          hashtags: hashtags || null,
          image_url: image_url || null
        })
      });

      if (res.ok) {
        onSaved();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (err) {
      console.error('Error saving publication:', err);
      alert('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Contenu *</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez votre publication..."
          className="min-h-24"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Visibilité</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="public">Publique</option>
            <option value="private">Privée</option>
            <option value="members_only">Membres uniquement</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL Image (optionnel)</label>
          <Input
            value={image_url}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            type="url"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hashtags (optionnel)</label>
        <Input
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="#emploi #congo"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{editingId ? 'Mettre à jour' : 'Créer'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
