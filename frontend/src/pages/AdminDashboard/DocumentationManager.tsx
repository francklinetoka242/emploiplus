import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import './DocumentationManager.css';

interface Document {
  id: number;
  name: string;
  slug: string;
  type: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface DocumentStats {
  total: number;
  byType: Array<{ type: string; count: number }>;
}

const DOCUMENT_TYPES = [
  { value: 'privacy', label: 'Politique de confidentialité' },
  { value: 'terms', label: 'Conditions générales' },
  { value: 'cookies', label: 'Gestion des cookies' },
  { value: 'legal', label: 'Mentions légales' },
  { value: 'other', label: 'Autre' }
];

export const DocumentationManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      type: 'other',
      content: ''
    }
  });

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  async function fetchDocuments() {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/documentations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments(data.data || []);
      } else {
        console.error('Erreur lors de la récupération des documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/documentations/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function onSubmit(data: any) {
    try {
      const token = localStorage.getItem('adminToken');
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/admin/documentations/${selectedDoc?.id}` : '/api/admin/documentations';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        reset();
        setIsDialogOpen(false);
        setSelectedDoc(null);
        setIsEditing(false);
        fetchDocuments();
        fetchStats();
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  async function handleDelete(id: number) {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/documentations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchDocuments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }

  async function handleTogglePublish(doc: Document) {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/documentations/${doc.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_published: !doc.is_published })
      });

      if (res.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  }

  function handleEdit(doc: Document) {
    setSelectedDoc(doc);
    setIsEditing(true);
    setValue('name', doc.name);
    setValue('slug', doc.slug);
    setValue('type', doc.type);
    setValue('content', doc.content);
    setIsDialogOpen(true);
  }

  function handleCreate() {
    setSelectedDoc(null);
    setIsEditing(false);
    reset();
    setIsDialogOpen(true);
  }

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      privacy: 'bg-blue-100 text-blue-800',
      terms: 'bg-purple-100 text-purple-800',
      cookies: 'bg-green-100 text-green-800',
      legal: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="documentation-manager">
      <div className="doc-header">
        <div>
          <h1>Gestion des Documentations</h1>
          <p className="text-muted-foreground">
            Gérez les documents légaux et les politiques de la plateforme
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Modifier le document' : 'Créer un nouveau document'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom du document</label>
                <Input
                  placeholder="Ex: Politique de confidentialité"
                  {...register('name', { required: true })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Identifiant unique (slug)</label>
                <Input
                  placeholder="Ex: privacy-policy"
                  {...register('slug', { required: true })}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^\w-]/g, '');
                    setValue('slug', value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type de document</label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu</label>
                <div className="text-xs text-muted-foreground mb-2">
                  Vous pouvez utiliser HTML pour formater votre contenu
                </div>
                <Textarea
                  placeholder="Entrez le contenu du document..."
                  {...register('content', { required: true })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
                  <strong>Conseil:</strong> Utilisez les balises HTML pour former à contenu:
                  <br />• &lt;h2&gt;Titre&lt;/h2&gt; pour les sous-titres
                  <br />• &lt;p&gt;Paragraphe&lt;/p&gt; pour les paragraphes
                  <br />• &lt;ul&gt;&lt;li&gt; pour les listes
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {isEditing ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {stats && (
        <div className="doc-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          {stats.byType.map(stat => (
            <div key={stat.type} className="stat-card">
              <div className="stat-value">{stat.count}</div>
              <div className="stat-label">
                {DOCUMENT_TYPES.find(t => t.value === stat.type)?.label || stat.type}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents List */}
      <div className="doc-table-container">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Aucun document trouvé</p>
            <p className="text-sm text-muted-foreground">Créez un nouveau document pour commencer</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière mise à jour</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell className="font-mono text-xs">{doc.slug}</TableCell>
                  <TableCell>
                    <Badge className={getTypeBadgeColor(doc.type)}>
                      {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label || doc.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(doc)}
                      className="gap-1"
                    >
                      {doc.is_published ? (
                        <>
                          <Eye className="w-4 h-4" />
                          Publié
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Brouillon
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(doc.updated_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(doc)}
                      className="gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Éditer
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer ce document? Cette action est irréversible.
                        </AlertDialogDescription>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(doc.id)} className="bg-red-600">
                            Supprimer
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default DocumentationManager;
