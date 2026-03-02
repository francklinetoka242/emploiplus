import React, { useEffect, useState } from 'react';
// Note: this component uses `react-quill`. Install with: `npm install react-quill quill`
import dynamic from 'next/dynamic';
import { Quill } from 'react-quill';

// Dynamic import for SSR compatibility
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div>Chargement éditeur...</div>
});
import 'react-quill/dist/quill.snow.css';

type Props = {
  slug: 'politique_confidentialite' | 'mentions_legales' | 'guide_utilisateur' | 'cgu';
};

export default function AdminEditorialEditor({ slug }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  async function fetchPage() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/static-pages/${slug}`, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) { setTitle(''); setContent(''); setLoading(false); return; }
      const body = await res.json();
      setTitle(body.page?.title || '');
      setContent(body.page?.content || '');
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/static-pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error('Save failed');
      alert('Enregistré');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <h2>Gestion Éditoriale</h2>
      <div style={{ marginBottom: 8 }}>
        <label>Titre</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div>
        {ReactQuill ? (
          // @ts-ignore
          <ReactQuill theme="snow" value={content} onChange={setContent} />
        ) : (
          <textarea value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', minHeight: 300 }} />
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={save} disabled={loading}>Enregistrer</button>
      </div>
    </div>
  );
}
