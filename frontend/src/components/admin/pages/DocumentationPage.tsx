/**
 * LEGAL DOCUMENTS MANAGEMENT PAGE
 * Manage Privacy Policy, Terms of Service, Cookies Policy, etc
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import {
  useDocuments,
  useDocument,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useDocumentStatistics,
  getDocumentTypeLabel,
  getDocumentTypeColor,
  formatDocumentDate,
  getWordCount,
  Document,
  CreateDocumentInput,
} from '@/hooks/useDocuments';

export default function DocumentationPage() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState<{
    slug: string;
    name: string;
    content: string;
    type: 'privacy' | 'terms' | 'cookies' | 'other';
  }>({
    slug: '',
    name: '',
    content: '',
    type: 'other',
  });

  // Queries
  const docsQuery = useDocuments();
  const statsQuery = useDocumentStatistics();
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument(editingId || 0);
  const deleteMutation = useDeleteDocument();

  const documents = docsQuery.data || [];
  const stats = (statsQuery.data as any) || {};
  const isLoading = docsQuery.isLoading || statsQuery.isLoading;

  // Default documents (can't delete)
  const defaultDocSlugs = ['privacy-policy', 'terms-of-service', 'cookies-policy'];

  // Filter documents by search
  const filteredDocs = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle edit
  const handleEdit = (doc: Document) => {
    setEditingId(doc.id);
    setFormData({
      slug: doc.slug,
      name: doc.name,
      content: doc.content,
      type: doc.type,
    });
    setShowNewForm(false);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Le titre et le contenu sont obligatoires');
      return;
    }

    if (editingId) {
      // Update
      updateMutation.mutate({
        slug: formData.slug,
        name: formData.name,
        content: formData.content,
        type: formData.type,
      });
    } else {
      // Create
      createMutation.mutate(formData as CreateDocumentInput);
    }

    resetForm();
  };

  // Handle delete
  const handleDelete = (doc: Document) => {
    if (defaultDocSlugs.includes(doc.slug)) {
      alert('Vous ne pouvez pas supprimer les documents par défaut');
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${doc.name}"?`)) {
      deleteMutation.mutate(doc.id);
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setShowNewForm(false);
    setFormData({
      slug: '',
      name: '',
      content: '',
      type: 'other',
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Documentations</h1>
        <p className="text-slate-600 mt-1">
          Gérez les documents légaux et les politiques de la plateforme
        </p>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">
                {stats.total_documents || 0}
              </p>
            </div>
            <FileText className="h-10 w-10 opacity-20 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Privacy</p>
              <p className="text-3xl font-bold mt-2 text-purple-600">
                {stats.privacy_count || 0}
              </p>
            </div>
            <Lock className="h-10 w-10 opacity-20 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Termes</p>
              <p className="text-3xl font-bold mt-2 text-green-600">
                {stats.terms_count || 0}
              </p>
            </div>
            <FileText className="h-10 w-10 opacity-20 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Cookies</p>
              <p className="text-3xl font-bold mt-2 text-orange-600">
                {stats.cookies_count || 0}
              </p>
            </div>
            <FileText className="h-10 w-10 opacity-20 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* TOOLBAR */}
      <Card className="p-6 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button
            onClick={() => setShowNewForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau document
          </Button>
          <Button
            onClick={() => {
              docsQuery.refetch();
              statsQuery.refetch();
            }}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* NEW DOCUMENT FORM */}
      {showNewForm && (
        <Card className="p-6 bg-indigo-50 border border-indigo-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Créer un nouveau document
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Slug (URL identifier)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
                placeholder="ex: mon-document"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Titre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Titre du document"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="other">Autre</option>
                <option value="privacy">Politique de confidentialité</option>
                <option value="terms">Mentions légales</option>
                <option value="cookies">Politique des cookies</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contenu
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Contenu du document..."
                rows={8}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                {getWordCount(formData.content)} mots
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={resetForm} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={createMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* DOCUMENTS LIST */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600">Chargement des documents...</p>
        </Card>
      ) : filteredDocs.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Aucun document trouvé
          </h3>
          <p className="text-slate-600 mb-6">
            Créez un nouveau document pour commencer
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="p-6 border border-slate-200 hover:border-slate-300 transition">
              {editingId === doc.id ? (
                // EDIT MODE
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Titre du document"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="other">Autre</option>
                      <option value="privacy">Politique de confidentialité</option>
                      <option value="terms">Mentions légales</option>
                      <option value="cookies">Politique des cookies</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contenu
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Contenu du document..."
                      rows={10}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {getWordCount(formData.content)} mots
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button onClick={resetForm} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? 'Mise à jour...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {doc.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getDocumentTypeColor(
                            doc.type
                          )}`}
                        >
                          {getDocumentTypeLabel(doc.type)}
                        </span>
                        {defaultDocSlugs.includes(doc.slug) && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 border border-gray-300">
                            🔒 Par défaut
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">Slug: {doc.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(doc)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                      {!defaultDocSlugs.includes(doc.slug) && (
                        <Button
                          onClick={() => handleDelete(doc)}
                          variant="outline"
                          size="sm"
                          className="gap-2 text-red-600 hover:text-red-700 border-red-200"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deleteMutation.isPending ? '...' : 'Supprimer'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-40 overflow-y-auto">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {doc.content.substring(0, 500)}
                      {doc.content.length > 500 && '...'}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-4 text-xs text-slate-500">
                    <span>📝 {getWordCount(doc.content)} mots</span>
                    <span>📅 {formatDocumentDate(doc.updated_at)}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
