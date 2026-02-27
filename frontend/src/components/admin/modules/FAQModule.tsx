/**
 * FAQ Module
 * Manage FAQ by categories with accordion display
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react';
import { FAQ } from '../../../types';

interface FAQModuleProps {
  token: string;
}

const FAQModule: React.FC<FAQModuleProps> = ({ token }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: '',
    order_position: 0
  });

  useEffect(() => {
    fetchFAQs();
  }, [token]);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/admin/faqs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      const data = await response.json();
      setFaqs(data);
      const categories = [...new Set(data.map((f: FAQ) => f.category))];
      if (categories.length > 0) setSelectedCategory(categories[0]);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to save');
      await fetchFAQs();
      setShowForm(false);
      setFormData({ category: '', question: '', answer: '', order_position: 0 });
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette FAQ?')) return;
    try {
      await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const categories = [...new Set(faqs.map(f => f.category))];
  const filteredFaqs = faqs.filter(f => f.category === selectedCategory);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">FAQ</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-cyan-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Catégorie"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
            <input
              type="text"
              placeholder="Question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
            <textarea
              placeholder="Réponse"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Créer</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full transition ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Accordion */}
      <div className="space-y-2">
        {filteredFaqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg shadow border border-gray-200">
            <button
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <span className="font-medium text-gray-900 text-left">{faq.question}</span>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition ${expandedId === faq.id ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedId === faq.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <p className="text-gray-600 mb-4">{faq.answer}</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQModule;
