/**
 * Editorial Management Module
 * Manage static pages: Privacy Policy, Terms, User Guide, Legal
 */

import React, { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { StaticPage } from '../../../types';

interface EditorialModuleProps {
  token: string;
}

const EditorialModule: React.FC<EditorialModuleProps> = ({ token }) => {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchPages();
  }, [token]);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch pages');
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: StaticPage) => {
    setEditing(page.slug);
    setFormData({ title: page.title, content: page.content });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/pages/${editing}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to save');
      await fetchPages();
      setEditing(null);
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Gestion Éditoriale</h2>

      {/* Pages List */}
      <div className="space-y-6">
        {pages.map((page) => (
          <div key={page.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            {editing === page.slug ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg font-semibold"
                />
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Save size={18} /> Enregistrer
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="flex items-center gap-2 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    <X size={18} /> Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{page.title}</h3>
                  <button
                    onClick={() => handleEdit(page)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={20} />
                  </button>
                </div>
                <div className="bg-gray-50 rounded p-4 max-h-32 overflow-hidden">
                  <p className="text-gray-600 text-sm line-clamp-3">{page.content}</p>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>Slug: {page.slug}</span>
                  <span>{page.published ? '✓ Publié' : '✗ Brouillon'}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorialModule;
