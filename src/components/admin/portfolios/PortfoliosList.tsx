import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2 } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import PortfoliosForm from "./PortfoliosForm";

interface Portfolio {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  project_url?: string;
  service_category: string;
  featured?: boolean;
  created_at?: string;
}

export default function PortfoliosList() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const adminToken = localStorage.getItem('adminToken');

  const fetchPortfolios = async () => {
    try {
      const res = await fetch('/api/portfolios');
      const data = await res.json();
      setPortfolios(data || []);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/portfolios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setPortfolios(portfolios.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting portfolio:', err);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingId(null);
    fetchPortfolios();
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  // Group by service category
  const grouped = portfolios.reduce((acc, p) => {
    if (!acc[p.service_category]) acc[p.service_category] = [];
    acc[p.service_category].push(p);
    return acc;
  }, {} as Record<string, Portfolio[]>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Réalisations / Portfolios</h2>
        <Button onClick={() => { setEditingId(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle réalisation
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <PortfoliosForm editingId={editingId} onSaved={handleSaved} onCancel={() => setShowForm(false)} />
        </Card>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([service, items]) => (
          <div key={service} className="space-y-4">
            <h3 className="text-xl font-semibold capitalize">{service.replace('-', ' ')}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((portfolio) => (
                <Card key={portfolio.id} className="overflow-hidden flex flex-col">
                  {portfolio.image_url && (
                    <div className="h-40 bg-muted overflow-hidden">
                      <img src={portfolio.image_url} alt={portfolio.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold line-clamp-2">{portfolio.title}</h4>
                      {portfolio.featured && <Badge>En vedette</Badge>}
                    </div>
                    {portfolio.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{portfolio.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground mb-3">{new Date(portfolio.created_at || '').toLocaleDateString()}</div>
                    <div className="flex gap-2 mt-auto">
                      <Button size="sm" variant="outline" onClick={() => { setEditingId(portfolio.id); setShowForm(true); }} className="gap-1">
                        <Edit2 className="h-3 w-3" />
                        Éditer
                      </Button>
                      <ConfirmButton title="Supprimer cette réalisation ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => handleDelete(portfolio.id)}>
                        <Button size="sm" variant="destructive" className="gap-1">
                          <Trash2 className="h-3 w-3" />
                          Supprimer
                        </Button>
                      </ConfirmButton>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
