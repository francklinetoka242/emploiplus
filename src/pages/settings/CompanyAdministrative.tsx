import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authHeaders } from '@/lib/headers';

export default function CompanyAdministrative() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [rccm, setRccm] = useState("");
  const [managerCni, setManagerCni] = useState("");
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
      setRccm((data as any).rccm_number || "");
      setManagerCni((data as any).manager_cni || "");
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
          rccm_number: rccm,
          manager_cni: managerCni,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Informations administratives mises à jour");
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
        <h2 className="text-2xl font-bold">Informations Administratives</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* RCCM */}
        <div className="space-y-2">
          <Label htmlFor="rccm">Numéro d'immatriculation (RCCM)</Label>
          <Input
            id="rccm"
            value={rccm}
            disabled={!editing}
            onChange={(e) => setRccm(e.target.value)}
            placeholder="Ex: RC/BO/2023/A123456"
          />
          <p className="text-sm text-muted-foreground">Registre du Commerce et du Crédit Mobilier</p>
        </div>

        {/* CNI du gérant */}
        <div className="space-y-2">
          <Label htmlFor="managerCni">CNI du Gérant/Administrateur</Label>
          <Input
            id="managerCni"
            value={managerCni}
            disabled={!editing}
            onChange={(e) => setManagerCni(e.target.value)}
            placeholder="Numéro de la pièce d'identité"
          />
          <p className="text-sm text-muted-foreground">Numéro de la pièce d'identité du gérant ou administrateur du compte</p>
        </div>

        {/* Note de certification */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Certification de l'entreprise</h4>
          <p className="text-sm text-blue-800">
            Ces informations sont essentielles pour éviter les fausses entreprises et certifier votre compte auprès de notre plateforme.
          </p>
          <p className="text-xs text-blue-700 mt-2">Plan de localisation : Optionnel (sera demandé lors de la vérification si nécessaire)</p>
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
