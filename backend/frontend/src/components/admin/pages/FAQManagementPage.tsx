/**
 * FAQ MANAGEMENT PAGE
 * Create, read, update, delete FAQ items with drag-drop reordering
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  useFAQItems,
  useCreateFAQItem,
  useUpdateFAQItem,
  useDeleteFAQItem,
  useReorderFAQItems,
  useFAQStatistics,
  getFAQCategories,
  formatFAQCategory,
  getFAQCategoryColor,
  searchFAQItems,
  sortFAQByOrder,
  FAQItem,
  CreateFAQInput,
} from '@/hooks/useFAQ';

export default function FAQManagementPage() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>();

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    is_published: true,
  });

  // Queries
  const faqQuery = useFAQItems({ category: categoryFilter, published: publishedFilter });
  const statsQuery = useFAQStatistics();
  const createMutation = useCreateFAQItem();
  const updateMutation = useUpdateFAQItem(editingId || 0);
  const deleteMutation = useDeleteFAQItem();
  const reorderMutation = useReorderFAQItems();

  const allFAQs = faqQuery.data || [];
  const stats = (statsQuery.data as any) || {};
  const isLoading = faqQuery.isLoading || statsQuery.isLoading;

  // Filter FAQs by search
  const searchedFAQs = searchFAQItems(allFAQs, searchTerm);
  const sortedFAQs = sortFAQByOrder(searchedFAQs);

  // Handle edit
  const handleEdit = (faq: FAQItem) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_published: faq.is_published,
    });
    setShowNewForm(false);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim() || !formData.category.trim()) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    if (editingId) {
      // Update
      updateMutation.mutate({
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        is_published: formData.is_published,
      });
    } else {
      // Create
      createMutation.mutate(formData as CreateFAQInput);
    }

    resetForm();
  };

  // Handle delete
  const handleDelete = (faq: FAQItem) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la FAQ: "${faq.question}"?`)) {
      deleteMutation.mutate(faq.id);
    }
  };

  // Handle visibility toggle
  const handleToggleVisibility = (faq: FAQItem) => {
    updateMutation.mutate({
      is_published: !faq.is_published,
    });
  };

  // Handle reorder
  const handleMove = (faq: FAQItem, direction: 'up' | 'down') => {
    const currentIndex = sortedFAQs.findIndex((f) => f.id === faq.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedFAQs.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const items = sortedFAQs.map((f, idx) => ({
      id: f.id,
      order_index: idx === currentIndex ? newIndex : idx === newIndex ? currentIndex : idx,
    }));

    reorderMutation.mutate({ items });
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setShowNewForm(false);
    setFormData({
      question: '',
      answer: '',
      category: '',
      is_published: true,
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">FAQ</h1>
        <p className="text-slate-600 mt-1">
          Gérez les questions fréquemment posées par les utilisateurs
        </p>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-3xl font-bold mt-2 text-orange-600">
                {stats.total_faqs || 0}
              </p>
            </div>
            <HelpCircle className="h-10 w-10 opacity-20 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Publiées</p>
              <p className="text-3xl font-bold mt-2 text-green-600">
                {stats.published_count || 0}
              </p>
            </div>
            <Eye className="h-10 w-10 opacity-20 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-white border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Brouillons</p>
              <p className="text-3xl font-bold mt-2 text-red-600">
                {stats.draft_count || 0}
              </p>
            </div>
            <EyeOff className="h-10 w-10 opacity-20 text-red-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Catégories</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">
                {Object.keys(stats.categories || {}).length || 0}
              </p>
            </div>
            <HelpCircle className="h-10 w-10 opacity-20 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* TOOLBAR */}
      <Card className="p-6 bg-white border border-slate-200">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <Button
              onClick={() => setShowNewForm(true)}
              className="bg-orange-600 hover:bg-orange-700 gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle question
            </Button>
            <Button
              onClick={() => {
                faqQuery.refetch();
                statsQuery.refetch();
              }}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Catégorie
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Toutes les catégories</option>
                {getFAQCategories().map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Statut
              </label>
              <select
                value={
                  publishedFilter === undefined
                    ? ''
                    : publishedFilter
                    ? 'published'
                    : 'draft'
                }
                onChange={(e) => {
                  if (e.target.value === '') {
                    setPublishedFilter(undefined);
                  } else {
                    setPublishedFilter(e.target.value === 'published');
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tous</option>
                <option value="published">Publiées</option>
                <option value="draft">Brouillons</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* NEW FAQ FORM */}
      {showNewForm && (
        <Card className="p-6 bg-orange-50 border border-orange-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Ajouter une nouvelle question
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Question
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Quelle est votre question?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Réponse
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Tapez la réponse..."
                rows={5}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Sélectionnez une catégorie</option>
                {getFAQCategories().map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="publish"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="publish" className="text-sm text-slate-700">
                Publier immédiatement
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={resetForm} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={createMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* FAQ LIST */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600">Chargement des FAQs...</p>
        </Card>
      ) : sortedFAQs.length === 0 ? (
        <Card className="p-12 text-center">
          <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Aucune FAQ trouvée
          </h3>
          <p className="text-slate-600 mb-6">
            Créez une question pour aider les utilisateurs
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedFAQs.map((faq, index) => (
            <Card
              key={faq.id}
              className="p-6 border border-slate-200 hover:border-slate-300 transition"
            >
              {editingId === faq.id ? (
                // EDIT MODE
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Question
                    </label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Question"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Réponse
                    </label>
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      placeholder="Réponse"
                      rows={5}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {getFAQCategories().map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`publish-${faq.id}`}
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({ ...formData, is_published: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor={`publish-${faq.id}`} className="text-sm text-slate-700">
                      Publier
                    </label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button onClick={resetForm} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-orange-600 hover:bg-orange-700"
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
                          {faq.question}
                        </h3>
                        {faq.is_published ? (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 border border-green-300">
                            ✓ Publiée
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 border border-red-300">
                            ⊘ Brouillon
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getFAQCategoryColor(
                            faq.category
                          )}`}
                        >
                          {faq.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {index > 0 && (
                        <Button
                          onClick={() => handleMove(faq, 'up')}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={reorderMutation.isPending}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      )}
                      {index < sortedFAQs.length - 1 && (
                        <Button
                          onClick={() => handleMove(faq, 'down')}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={reorderMutation.isPending}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleToggleVisibility(faq)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={updateMutation.isPending}
                      >
                        {faq.is_published ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Masquer
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Publier
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleEdit(faq)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                      <Button
                        onClick={() => handleDelete(faq)}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700 border-red-200"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleteMutation.isPending ? '...' : 'Supprimer'}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-24 overflow-y-auto">
                    <p className="text-sm text-slate-700">
                      {faq.answer.substring(0, 300)}
                      {faq.answer.length > 300 && '...'}
                    </p>
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

