import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authHeaders } from '@/lib/headers';
import ConfirmButton from '@/components/ConfirmButton';

const AdminWelcomeTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [userType, setUserType] = useState<'candidate' | 'company'>('candidate');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/welcome-templates', { headers: authHeaders(undefined, 'adminToken') });
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Fetch templates error', e);
      toast.error('Impossible de charger les templates');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const resetForm = () => { setEditingId(null); setUserType('candidate'); setTitle(''); setMessage(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!title || !message) return toast.error('Titre et message requis');
      const payload = { user_type: userType, title, message };
      let res;
      if (editingId) {
        res = await fetch(`/api/admin/welcome-templates/${editingId}`, { method: 'PUT', headers: authHeaders('application/json', 'adminToken'), body: JSON.stringify(payload) });
      } else {
        res = await fetch('/api/admin/welcome-templates', { method: 'POST', headers: authHeaders('application/json', 'adminToken'), body: JSON.stringify(payload) });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Erreur');
      }
      toast.success(editingId ? 'Template mis à jour' : 'Template créé');
      resetForm();
      fetchTemplates();
    } catch (err) {
      console.error('Submit template error', err);
      toast.error('Erreur lors de l enregistrement');
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setUserType(String(t.user_type).toLowerCase() === 'company' ? 'company' : 'candidate');
    setTitle(t.title || '');
    setMessage(t.message || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/welcome-templates/${id}`, { method: 'DELETE', headers: authHeaders(undefined, 'adminToken') });
      if (!res.ok) throw new Error('Erreur');
      toast.success('Template supprimé');
      fetchTemplates();
    } catch (e) {
      console.error('Delete template error', e);
      toast.error('Impossible de supprimer');
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">Templates de message de bienvenue</h1>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-2xl mb-6">
        <div>
          <label className="block text-sm mb-1">Utilisateur ciblé</label>
          <select value={userType} onChange={(e) => setUserType(e.target.value as any)} className="w-full p-2 border rounded">
            <option value="candidate">Candidat</option>
            <option value="company">Entreprise</option>
          </select>
        </div>
        <div>
          <Label>Titre</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du message" />
        </div>
        <div>
          <Label>Message (vous pouvez utiliser {{full_name}} et {{company_name}})</Label>
          <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <Button type="submit">{editingId ? 'Enregistrer' : 'Créer'}</Button>
          {editingId && <Button variant="outline" onClick={resetForm}>Annuler</Button>}
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-3">Templates existants</h2>
      {loading ? <p>Chargement...</p> : (
        <ul className="space-y-3">
          {templates.map((t) => (
            <li key={t.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{t.title} <span className="text-sm text-muted-foreground">({t.user_type})</span></div>
                <div className="text-sm text-muted-foreground">{t.message}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(t)}>Modifier</Button>
                <ConfirmButton title="Supprimer ce template ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => handleDelete(t.id)}>
                  <Button size="sm" variant="destructive">Supprimer</Button>
                </ConfirmButton>
              </div>
            </li>
          ))}
          {templates.length === 0 && <li className="p-4 text-sm text-muted-foreground">Aucun template enregistré.</li>}
        </ul>
      )}
    </div>
  );
};

export default AdminWelcomeTemplates;
