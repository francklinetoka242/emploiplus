import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authHeaders } from '@/lib/headers';

export default function CompanyCulture() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [description, setDescription] = useState("");
  const [mission, setMission] = useState("");
  const [values, setValues] = useState("");
  const [benefits, setBenefits] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", { headers });
      if (!res.ok) throw new Error('Erreur chargement profil');
      const data = await res.json();
      setProfileData(data);
      setDescription((data as any).description || "");
      setMission((data as any).mission || "");
      setValues((data as any).values || "");
      setBenefits((data as any).benefits || "");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const headersPut: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({
          description: description,
          mission: mission,
          values: values,
          benefits: benefits,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Culture et présentation mise à jour");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Culture & Présentation</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description de l'entreprise</Label>
          <Textarea
            id="description"
            value={description}
            disabled={!editing}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Son histoire, ses débuts, sa croissance..."
            rows={4}
          />
        </div>

        {/* Mission */}
        <div className="space-y-2">
          <Label htmlFor="mission">Mission et Vision</Label>
          <Textarea
            id="mission"
            value={mission}
            disabled={!editing}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Votre mission et vision pour l'avenir"
            rows={3}
          />
        </div>

        {/* Valeurs */}
        <div className="space-y-2">
          <Label htmlFor="values">Valeurs de l'entreprise</Label>
          <Textarea
            id="values"
            value={values}
            disabled={!editing}
            onChange={(e) => setValues(e.target.value)}
            placeholder="Ex: Intégrité, Innovation, Respect du client"
            rows={3}
          />
        </div>

        {/* Avantages */}
        <div className="space-y-2">
          <Label htmlFor="benefits">Avantages offerts</Label>
          <Textarea
            id="benefits"
            value={benefits}
            disabled={!editing}
            onChange={(e) => setBenefits(e.target.value)}
            placeholder="Ex: Assurance santé, Transport, Primes, Formation continue"
            rows={3}
          />
          <p className="text-sm text-muted-foreground">Expliquez pourquoi rejoindre votre entreprise</p>
        </div>

        {editing && (
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </Button>
        )}
      </form>
    </Card>
  );
}
