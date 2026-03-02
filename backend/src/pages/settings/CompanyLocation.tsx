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

export default function CompanyLocation() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [headquarters, setHeadquarters] = useState("");
  const [branches, setBranches] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
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
      setHeadquarters((data as any).headquarters || "");
      setBranches((data as any).branches || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setWebsite((data as any).website || "");
      setContactName((data as any).contact_name || "");
      setContactPhone((data as any).contact_phone || "");
      setContactEmail((data as any).contact_email || "");
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
          headquarters: headquarters,
          branches: branches,
          phone: phone,
          email: email,
          website: website,
          contact_name: contactName,
          contact_phone: contactPhone,
          contact_email: contactEmail,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Localisation et contact mis à jour");
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
        <h2 className="text-2xl font-bold">Localisation & Contact</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Siège social */}
        <div className="space-y-2">
          <Label htmlFor="headquarters">Siège social</Label>
          <Input
            id="headquarters"
            value={headquarters}
            disabled={!editing}
            onChange={(e) => setHeadquarters(e.target.value)}
            placeholder="Ex: Brazzaville"
          />
        </div>

        {/* Succursales */}
        <div className="space-y-2">
          <Label htmlFor="branches">Succursales (séparées par virgule)</Label>
          <Input
            id="branches"
            value={branches}
            disabled={!editing}
            onChange={(e) => setBranches(e.target.value)}
            placeholder="Ex: Pointe-Noire, Oyo, Dolisie"
          />
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={phone}
            disabled={!editing}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled={!editing}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Site web */}
        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            value={website}
            disabled={!editing}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.example.com"
          />
        </div>

        {/* Contact HR */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Personne de contact (RH / Gérant)</h3>
          
          <div className="space-y-2">
            <Label htmlFor="contactName">Nom et fonction</Label>
            <Input
              id="contactName"
              value={contactName}
              disabled={!editing}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ex: Jean Dupont, Directeur RH"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Téléphone</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              disabled={!editing}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              disabled={!editing}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
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
