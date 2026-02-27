import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { uploadFile } from '@/lib/upload';
import { Loader2 } from "lucide-react";
import { authHeaders } from '@/lib/headers';

const SECTORS = [
  'Agriculture',
  'Télécoms',
  'Services',
  'Informatique',
  'Finance',
  'Santé',
  'Education',
  'Transport',
  'Énergie',
  'Immobilier',
  'Commerce',
  'Industrie',
  'Autre'
];

const COMPANY_SIZES = [
  'PME (1-50 employés)',
  'Petite entreprise (51-250 employés)',
  'Moyenne entreprise (251-1000 employés)',
  'Grande entreprise (>1000 employés)',
  'Institution publique'
];

export default function CompanyIdentity() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("");
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
      setCompanyName(data.company_name || "");
      setSector((data as any).sector || "");
      setSize((data as any).company_size || "");
      if (data.profile_image_url) {
        setPreviewUrl(data.profile_image_url);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let logoUrl = profileData?.profile_image_url || null;

      if (imageFile) {
        const token = localStorage.getItem('token');
        logoUrl = await uploadFile(imageFile, token, 'logos');
      }

      const headersPut: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({
          company_name: companyName,
          sector: sector,
          company_size: size,
          profile_image_url: logoUrl,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Identité de l'entreprise mise à jour");
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
        <h2 className="text-2xl font-bold">Identité de l'Entreprise</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={previewUrl || (profileData?.profile_image_url as string)} />
            <AvatarFallback>{String(companyName).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {editing && (
            <div>
              <Label htmlFor="logo">Logo de l'entreprise</Label>
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2"
              />
            </div>
          )}
        </div>

        {/* Nom */}
        <div className="space-y-2">
          <Label htmlFor="companyName">Nom de l'entreprise</Label>
          <Input
            id="companyName"
            value={companyName}
            disabled={!editing}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>

        {/* Secteur */}
        <div className="space-y-2">
          <Label htmlFor="sector">Secteur d'activité</Label>
          <Select value={sector} onValueChange={setSector} disabled={!editing}>
            <SelectTrigger id="sector">
              <SelectValue placeholder="Sélectionner un secteur" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Taille */}
        <div className="space-y-2">
          <Label htmlFor="size">Taille de l'entreprise</Label>
          <Select value={size} onValueChange={setSize} disabled={!editing}>
            <SelectTrigger id="size">
              <SelectValue placeholder="Sélectionner une taille" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
