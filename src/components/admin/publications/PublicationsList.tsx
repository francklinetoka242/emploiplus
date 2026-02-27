import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Eye } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import PublicationsForm from "./PublicationsForm";

interface Publication {
  id: number;
  author_id?: number;
  content: string;
  visibility?: string;
  hashtags?: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
}

export default function PublicationsList() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const adminToken = localStorage.getItem('adminToken');

  const fetchPublications = async () => {
    try {
      const res = await fetch('/api/publications');
      const data = await res.json();
      setPublications(data || []);
    } catch (err) {
      console.error('Error fetching publications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/publications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setPublications(publications.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting publication:', err);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingId(null);
    fetchPublications();
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Publications / Newsfeed</h2>
        <Button onClick={() => { setEditingId(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle publication
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <PublicationsForm editingId={editingId} onSaved={handleSaved} onCancel={() => setShowForm(false)} />
        </Card>
      )}

      <div className="space-y-4">
        {publications.map((pub) => (
          <Card key={pub.id} className="p-6 space-y-4">
            {pub.image_url && (
              <img src={pub.image_url} alt="publication" className="w-full h-48 object-cover rounded" />
            )}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Badge variant="outline" className="mr-2">{pub.visibility || 'public'}</Badge>
                  {pub.is_active === false && <Badge variant="secondary">Inactif</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(pub.created_at || '').toLocaleString()}</div>
              </div>
              <p className="text-foreground line-clamp-3">{pub.content}</p>
              {pub.hashtags && <p className="text-sm text-secondary mt-2">{pub.hashtags}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditingId(pub.id); setShowForm(true); }} className="gap-2">
                <Edit2 className="h-4 w-4" />
                Éditer
              </Button>
              <ConfirmButton title="Supprimer cette publication ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => handleDelete(pub.id)}>
                <Button size="sm" variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </ConfirmButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
