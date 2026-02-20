import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Edit } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import { toast } from "sonner";

interface FAQItem {
  id: number | string;
  question: string;
  answer: string;
  created_at?: string;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [category, setCategory] = useState('Général');
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faqs?all=true");
      const data = await res.json();
      setFaqs(data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les FAQ");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      if (editing) {
        const payload = { ...form, category, display_order: displayOrder, is_visible: isVisible };
        const res = await fetch(`/api/faqs/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success("FAQ mise à jour");
          setForm({ question: "", answer: "" });
          setCategory('Général');
          setDisplayOrder(undefined);
          setIsVisible(true);
          setEditing(null);
          fetchFaqs();
        }
      } else {
        const payload = { ...form, category, display_order: displayOrder, is_visible: isVisible };
        const res = await fetch(`/api/faqs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success("FAQ ajoutée");
          setForm({ question: "", answer: "" });
          setCategory('Général');
          setDisplayOrder(undefined);
          setIsVisible(true);
          fetchFaqs();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const edit = (item: FAQItem) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer });
    setCategory((item as any).category || 'Général');
    setDisplayOrder((item as any).display_order || undefined);
    setIsVisible((item as any).is_visible !== false);
  };

  const remove = async (id: number | string) => {
    try {
      const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("FAQ supprimée");
        fetchFaqs();
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Gestion des FAQ</h1>
        <p className="text-muted-foreground">Ajouter, modifier ou supprimer des questions fréquentes</p>
      </div>

      <Card className="p-6 mb-8">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Question</Label>
            <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
          </div>

          <div>
            <Label>Réponse</Label>
            <textarea className="w-full rounded-md border p-3" rows={6} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
          </div>

            <div>
              <Label>Catégorie</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Compte, Candidature, Général" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={displayOrder === undefined ? '' : String(displayOrder)} onChange={(e) => setDisplayOrder(e.target.value ? parseInt(e.target.value, 10) : undefined)} />
              </div>
              <div>
                <Label>Visible</Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
                  <span className="text-sm text-muted-foreground">Afficher publiquement</span>
                </div>
              </div>
            </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">{editing ? "Mettre à jour" : "Ajouter"}</Button>
            {editing && (
              <Button variant="outline" onClick={() => { setEditing(null); setForm({ question: "", answer: "" }); }}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : faqs.length === 0 ? (
          <p className="text-muted-foreground">Aucune FAQ</p>
        ) : (
          faqs.map((f) => (
            <Card key={f.id} className="p-4 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg mb-1">{f.question}</h3>
                <p className="text-sm text-muted-foreground">{f.answer}</p>
                <div className="text-xs text-muted-foreground mt-2">Catégorie: {(f as any).category || 'Général'} • Visible: {(f as any).is_visible !== false ? 'Oui' : 'Non'}</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-muted-foreground">{f.created_at ? new Date(f.created_at).toLocaleString() : ""}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => edit(f)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <ConfirmButton title="Supprimer cette FAQ ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => remove(f.id)}>
                    <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                  </ConfirmButton>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
