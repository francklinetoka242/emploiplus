import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHeaders } from '@/lib/headers';

const AdminNotificationsPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all'|'candidate'|'company'>('all');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [list, setList] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [createPersonal, setCreatePersonal] = useState(false);
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const res = await fetch('/api/site-notifications', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setList(data || []);
      }
    } catch (e) {
      console.error('Fetch site notifications error', e);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    let out = [...list];
    if (search) {
      const q = search.toLowerCase();
      out = out.filter(n => (n.title||'').toLowerCase().includes(q) || (n.message||'').toLowerCase().includes(q) || (n.category||'').toLowerCase().includes(q));
    }
    if (startDate) {
      const s = new Date(startDate);
      out = out.filter(n => new Date(n.created_at) >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      out = out.filter(n => new Date(n.created_at) <= e);
    }
    setFiltered(out);
  }, [list, search, startDate, endDate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const payloadCategory = category === 'autre' ? (customCategory || 'autre') : category;
      let res;
      if (editingId) {
        res = await fetch(`/api/admin/site-notifications/${editingId}`, {
          method: 'PUT',
          headers: authHeaders('application/json'),
          body: JSON.stringify({ title, message, target, category: payloadCategory, image_url: imageUrl, link }),
        });
      } else {
        res = await fetch('/api/admin/site-notifications', {
          method: 'POST',
          headers: authHeaders('application/json'),
          body: JSON.stringify({ title, message, target, category: payloadCategory, image_url: imageUrl, link, create_personal: createPersonal }),
        });
      }
      const data = await res.json();
      if (res.ok) {
        setTitle(''); setMessage(''); setImageUrl(''); setCategory(''); setTarget('all'); setLink(''); setCustomCategory(''); setCreatePersonal(false);
        setEditingId(null);
        fetchList();
      } else {
        alert(data.message || 'Erreur');
      }
    } catch (e) {
      console.error('Create error', e);
    }
  };

  const handleDelete = async (id: number) => {
    // show modal confirmation
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      const res = await fetch(`/api/admin/site-notifications/${pendingDeleteId}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        fetchList();
      }
    } catch (e) {
      console.error('Delete error', e);
    } finally {
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  const handleEdit = (n: any) => {
    setEditingId(n.id);
    setTitle(n.title || '');
    setMessage(n.message || '');
    setTarget(n.target || 'all');
    setCategory(n.category || 'notifications');
    setImageUrl(n.image_url || '');
    setLink(n.link || '');
    setCreatePersonal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">Gérer les notifications du site</h1>
      <div className="flex items-center gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="p-2 border rounded" />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded" />
        <button onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }} className="px-3 py-2 border rounded">Réinitialiser</button>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 max-w-lg">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="w-full p-2 border rounded" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="w-full p-2 border rounded" />
        <div>
          <label className="block text-sm mb-1">Rubrique</label>
          <select value={category || 'notifications'} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
            <option value="notifications">Notifications</option>
            <option value="communique">Communiqué</option>
            <option value="annonce">Annonce</option>
            <option value="alerte">Alerte</option>
            <option value="autre">Autre</option>
          </select>
          {category === 'autre' && (
            <input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Autre rubrique" className="w-full p-2 border rounded mt-2" />
          )}
        </div>
        <select value={target} onChange={(e) => setTarget(e.target.value as any)} className="w-full p-2 border rounded">
          <option value="all">Tous</option>
          <option value="candidate">Candidats</option>
          <option value="company">Entreprises</option>
        </select>
        <div className="flex items-center space-x-2 mt-2">
          <input id="personal" type="checkbox" checked={createPersonal} onChange={(e) => setCreatePersonal(e.target.checked)} />
          <label htmlFor="personal" className="text-sm">Créer également des notifications personnelles pour les utilisateurs ciblés</label>
        </div>
        <div>
          <label className="block text-sm mb-1">Image (URL ou upload)</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optionnel)" className="w-full p-2 border rounded" />
          <input type="file" accept="image/*" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const data = await new Promise<string | null>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(file);
            });
            if (data) setImageUrl(data);
          }} className="w-full mt-2" />
        </div>
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Lien (optionnel) ex: https://..." className="w-full p-2 border rounded" />
        <div>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded">{editingId ? 'Enregistrer' : 'Créer'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setTitle(''); setMessage(''); setCategory(''); setTarget('all'); setImageUrl(''); setLink(''); }} className="ml-2 px-4 py-2 border rounded">Annuler</button>}
        </div>
      </form>

      <h2 className="text-xl font-semibold mt-8 mb-3">Notifications existantes</h2>
      <ul className="space-y-3">
        {filtered.map((n) => (
          <li key={n.id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{n.title} <span className="text-sm text-muted-foreground">({n.target})</span></div>
              <div className="text-sm">{n.category} • {new Date(n.created_at).toLocaleString()}</div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEdit(n)} className="px-3 py-1 border rounded">Modifier</button>
              <button onClick={() => handleDelete(n.id)} className="px-3 py-1 border rounded">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-muted-foreground mb-4">Voulez-vous vraiment supprimer cette notification ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteModal(false); setPendingDeleteId(null); }} className="px-4 py-2 border rounded">Annuler</button>
              <button onClick={() => confirmDelete()} className="px-4 py-2 bg-destructive text-white rounded">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
