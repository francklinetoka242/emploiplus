import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authHeaders } from '@/lib/headers';

export default function CandidatePreferences() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [contractType, setContractType] = useState("");
  const [availability, setAvailability] = useState("");
  const [salary, setSalary] = useState("");
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
      setContractType((data as any).contract_type || "");
      setAvailability((data as any).availability || "");
      setSalary((data as any).salary_expectation || "");
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
          contract_type: contractType,
          availability: availability,
          salary_expectation: salary,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Préférences de recherche mises à jour");
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
        <h2 className="text-2xl font-bold">Préférences de Recherche</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de contrat */}
        <div className="space-y-2">
          <Label htmlFor="contractType">Type de contrat recherché</Label>
          <Select value={contractType} onValueChange={setContractType} disabled={!editing}>
            <SelectTrigger id="contractType">
              <SelectValue placeholder="Sélectionner un type de contrat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CDI">CDI (Contrat à Durée Indéterminée)</SelectItem>
              <SelectItem value="CDD">CDD (Contrat à Durée Déterminée)</SelectItem>
              <SelectItem value="Stage">Stage</SelectItem>
              <SelectItem value="Prestation">Prestation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Disponibilité */}
        <div className="space-y-2">
          <Label htmlFor="availability">Disponibilité</Label>
          <Select value={availability} onValueChange={setAvailability} disabled={!editing}>
            <SelectTrigger id="availability">
              <SelectValue placeholder="Sélectionner votre disponibilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Immediate">Immédiate</SelectItem>
              <SelectItem value="WithNotice">Avec préavis</SelectItem>
              <SelectItem value="Flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prétentions salariales */}
        <div className="space-y-2">
          <Label htmlFor="salary">Prétentions salariales (optionnel)</Label>
          <Input
            id="salary"
            type="text"
            value={salary}
            disabled={!editing}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Ex: 500 000 - 1 000 000 CFA"
          />
          <p className="text-sm text-muted-foreground">Cette information vous aide à filtrer les offres correspondant à vos attentes.</p>
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
