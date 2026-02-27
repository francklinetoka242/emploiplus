import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import './LegalEditor.css';

// react-quill sometimes requires dynamic import; this is plain usage assuming bundler supports it
const ReactQuill = require('react-quill');
import 'react-quill/dist/quill.snow.css';

export const LegalEditor: React.FC = () => {
  const [slug, setSlug] = useState('mentions-legales');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    // load existing
    (async () => {
      try {
        const res = await fetch(`/api/cms/documents/${slug}`);
        if (res.ok) {
          const doc = await res.json();
          setTitle(doc.title || '');
          setContent(doc.content || '');
        } else {
          setTitle(''); setContent('');
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [slug]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cms/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({ slug, title, content })
      });
      if (!res.ok) throw new Error('Save failed');
      await qc.invalidateQueries(['legal', slug]);
      alert('Document enregistré');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'enregistrement');
    } finally { setLoading(false); }
  };

  return (
    <div className="legal-editor">
      <h2>Éditeur Légal</h2>
      <div className="editor-controls">
        <label>
          Slug:
          <input value={slug} onChange={e => setSlug(e.target.value)} />
        </label>
        <label>
          Titre:
          <input value={title} onChange={e => setTitle(e.target.value)} />
        </label>
        <div className="editor-actions">
          <button onClick={handleSave} disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>

      <div className="editor-rich">
        <ReactQuill theme="snow" value={content} onChange={setContent} />
      </div>
    </div>
  );
};

export default LegalEditor;
