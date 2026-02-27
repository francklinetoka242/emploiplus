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

export default function CandidateExperienceEducation() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [diploma, setDiploma] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
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
      setDiploma(data.diploma || "");
      setExperienceYears(data.experience_years || "");
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
          diploma: diploma,
          experience_years: parseInt(experienceYears) || 0,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Parcours et documents mis à jour");
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
        <h2 className="text-2xl font-bold">Parcours & Documents</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Diplôme */}
        <div className="space-y-2">
          <Label htmlFor="diploma">Diplôme / Qualification</Label>
          <Input
            id="diploma"
            value={diploma}
            disabled={!editing}
            onChange={(e) => setDiploma(e.target.value)}
            placeholder="Ex: Bac+5 Informatique, Master en Gestion"
          />
        </div>

        {/* Années d'expérience */}
        <div className="space-y-2">
          <Label htmlFor="experienceYears">Années d'expérience</Label>
          <Input
            id="experienceYears"
            type="number"
            min="0"
            max="70"
            value={experienceYears}
            disabled={!editing}
            onChange={(e) => setExperienceYears(e.target.value)}
          />
        </div>

        {/* Note sur les documents */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Documents requis (PDF uniquement)</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• CV</li>
            <li>• Lettres de recommandation</li>
            <li>• Diplômes</li>
            <li>• Certificats</li>
            <li>• Pièce d'identité (CNI)</li>
            <li>• NUI (Numéro d'identification unique) - si République du Congo</li>
            <li>• Passeport</li>
          </ul>
          <p className="text-xs text-yellow-700 mt-3">Gérez vos documents via la section "Documents" du tableau de bord.</p>
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
