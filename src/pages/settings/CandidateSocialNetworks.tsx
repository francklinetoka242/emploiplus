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

export default function CandidateSocialNetworks() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
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
      setLinkedin((data as any).linkedin || "");
      setFacebook((data as any).facebook || "");
      setInstagram((data as any).instagram || "");
      setTwitter((data as any).twitter || "");
      setYoutube((data as any).youtube || "");
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
          linkedin: linkedin || null,
          facebook: facebook || null,
          instagram: instagram || null,
          twitter: twitter || null,
          youtube: youtube || null,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Réseaux sociaux mis à jour");
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
        <h2 className="text-2xl font-bold">🌐 Réseaux Sociaux Professionnels</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LinkedIn */}
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={linkedin}
            disabled={!editing}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        {/* Facebook */}
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            value={facebook}
            disabled={!editing}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/..."
          />
        </div>

        {/* Instagram */}
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={instagram}
            disabled={!editing}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </div>

        {/* X / Twitter */}
        <div className="space-y-2">
          <Label htmlFor="twitter">X / Twitter</Label>
          <Input
            id="twitter"
            value={twitter}
            disabled={!editing}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://twitter.com/..."
          />
        </div>

        {/* YouTube */}
        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube (optionnel)</Label>
          <Input
            id="youtube"
            value={youtube}
            disabled={!editing}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="https://youtube.com/c/..."
          />
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
