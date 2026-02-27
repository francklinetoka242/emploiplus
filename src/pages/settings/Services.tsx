import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Download, FileText, Briefcase, CheckCircle2 } from "lucide-react";
import { authHeaders } from '@/lib/headers';
import ConfirmButton from '@/components/ConfirmButton';
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BusinessCard {
  id: number;
  company_id: number;
  title: string;
  full_name: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  logo_url?: string;
  card_color: string;
  created_at: string;
}

const CARD_COLORS = [
  { value: "blue", label: "Bleu", bgClass: "bg-blue-600" },
  { value: "red", label: "Rouge", bgClass: "bg-red-600" },
  { value: "green", label: "Vert", bgClass: "bg-green-600" },
  { value: "purple", label: "Violet", bgClass: "bg-purple-600" },
  { value: "gray", label: "Gris", bgClass: "bg-gray-600" },
];

export default function ServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    full_name: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    card_color: "blue",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
    if (!authLoading && user?.user_type !== 'company') {
      navigate("/parametres");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.id) {
      fetchBusinessCards();
    }
  }, [user?.id]);

  const fetchBusinessCards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business-cards", {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur chargement cartes");
      const data: BusinessCard[] = await res.json();
      setBusinessCards(data);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.full_name.trim() || !formData.phone.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/business-cards", {
        method: "POST",
        headers: authHeaders('application/json'),
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur création carte");

      toast.success("Carte de visite créée avec succès");
      setFormData({
        title: "",
        full_name: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        card_color: "blue",
      });
      fetchBusinessCards();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/business-cards/${cardId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Erreur suppression");
      toast.success("Carte supprimée");
      fetchBusinessCards();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    }
  };

  const downloadCard = (card: BusinessCard) => {
    // Generate a simple HTML for printing/saving
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Carte - ${card.full_name}</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .card { 
            width: 90mm; 
            height: 50mm; 
            padding: 15px; 
            border-radius: 8px;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          h2 { margin: 0 0 10px 0; font-size: 18px; }
          p { margin: 4px 0; font-size: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="card" style="background-color: var(--card-color);">
          <div>
            <h2>${card.full_name}</h2>
            <p><strong>${card.title}</strong></p>
          </div>
          <div style="font-size: 11px;">
            <p>📱 ${card.phone}</p>
            <p>📧 ${card.email}</p>
            ${card.website ? '<p>🌐 ' + card.website + '</p>' : ''}
            ${card.address ? '<p>📍 ' + card.address + '</p>' : ''}
          </div>
        </div>
        <script>
          const colorMap = {
            'blue': '#2563eb',
            'red': '#dc2626',
            'green': '#16a34a',
            'purple': '#9333ea',
            'gray': '#4b5563'
          };
          document.documentElement.style.setProperty('--card-color', colorMap['${card.card_color}']);
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carte-visite-${card.full_name.replace(/\s+/g, "-")}.html`;
    a.click();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const cardColor = CARD_COLORS.find((c) => c.value === formData.card_color);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Services</h1>

      <Tabs defaultValue="business-cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business-cards">Cartes de visite</TabsTrigger>
          <TabsTrigger value="competence-test">Test de compétence</TabsTrigger>
          <TabsTrigger value="interview-sim">Simulateur d'entretien</TabsTrigger>
        </TabsList>

        {/* Business Cards Tab */}
        <TabsContent value="business-cards" className="space-y-6">
          {/* Create Business Card Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Créer une carte de visite (Service payant)
            </h2>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Poste/Titre *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Directeur des Ressources Humaines"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="full_name">Nom complet *</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Ex: Jean Dupont"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: +242 123 456 789"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@example.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex: 123 Rue de la Paix"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="card_color">Couleur de la carte</Label>
                <div className="flex gap-2 mt-2">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, card_color: color.value })}
                      className={`w-10 h-10 rounded ${color.bgClass} ${
                        formData.card_color === color.value ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer la carte
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Business Cards List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Mes cartes de visite ({businessCards.length})</h2>

            {businessCards.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Aucune carte de visite créée. Créez-en une pour commencer.
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {businessCards.map((card) => {
                  const color = CARD_COLORS.find((c) => c.value === card.card_color);
                  return (
                    <Card
                      key={card.id}
                      className={`p-5 text-white relative overflow-hidden ${color?.bgClass}`}
                    >
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{card.full_name}</h3>
                        <p className="text-sm font-medium opacity-90">{card.title}</p>

                        <div className="text-xs opacity-80 space-y-1 pt-3 border-t border-white/20">
                          <p>📱 {card.phone}</p>
                          {card.email && <p>📧 {card.email}</p>}
                          {card.website && <p>🌐 {card.website}</p>}
                          {card.address && <p>📍 {card.address}</p>}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-white/20">
                        <button
                          onClick={() => downloadCard(card)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
                        >
                          <ConfirmButton title="Supprimer cette carte ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => handleDeleteCard(card.id)}>
                            <button className="flex items-center justify-center px-2 py-2 bg-red-400/30 hover:bg-red-400/50 rounded text-xs transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </ConfirmButton>
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Competence Test Tab */}
        <TabsContent value="competence-test" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Test de compétence (Gratuit - 1 essai)
            </h2>
            <p className="text-muted-foreground mb-4">
              Testez vos compétences avec des questions spécialisées dans différents domaines.
            </p>
            <Button onClick={() => navigate('/test-competence')} className="w-full">
              Commencer un test
            </Button>
          </Card>
        </TabsContent>

        {/* Interview Simulator Tab */}
        <TabsContent value="interview-sim" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Simulateur d'entretien (Gratuit - 1 essai)
            </h2>
            <p className="text-muted-foreground mb-4">
              Pratiquez pour vos entretiens d'embauche avec un simulateur interactif.
            </p>
            <Button onClick={() => navigate('/simulateur-entretien')} className="w-full">
              Démarrer la simulation
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
