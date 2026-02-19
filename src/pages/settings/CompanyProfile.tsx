import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { authHeaders, buildApiUrl } from '@/lib/headers';
import { uploadFile } from '@/lib/upload';
import CompanyDocumentsUpload from '@/components/CompanyDocumentsUpload';

export default function CompanyProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [description, setDescription] = useState("");
  const [mission, setMission] = useState("");
  const [values, setValues] = useState("");
  const [benefits, setBenefits] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const sectors = [
    "Technologie",
    "Finance",
    "Santé",
    "Education",
    "Commerce",
    "Industrie",
    "Télécommunications",
    "Énergie",
    "Transport",
    "Immobilier",
    "Services",
    "Autre"
  ];

  const sizes = [
    "1-10 employés",
    "11-50 employés",
    "51-200 employés",
    "201-500 employés",
    "501-1000 employés",
    "Plus de 1000 employés"
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch(buildApiUrl("/api/users/me"), { headers });
      if (!res.ok) throw new Error('Erreur chargement profil');
      const data = await res.json();
      setProfileData(data);
      setCompanyName(data.company_name || "");
      setSector(typeof data.sector === 'string' ? data.sector : "");
      setCompanySize(typeof data.company_size === 'string' ? data.company_size : "");
      setDescription(typeof data.description === 'string' ? data.description : "");
      setMission(typeof data.mission === 'string' ? data.mission : "");
      setValues(typeof data.values === 'string' ? data.values : "");
      setBenefits(typeof data.benefits === 'string' ? data.benefits : "");
      setCompanyEmail(typeof data.company_email === 'string' ? data.company_email : "");
      setProfileImageUrl(data.profile_image_url || "");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingLogo(true);
      try {
        const file = e.target.files[0];
        const token = localStorage.getItem('token');
        const newImageUrl = await uploadFile(file, token, 'profiles');
        setProfileImageUrl(newImageUrl);

        // Update API with new logo
        const headers: Record<string, string> = authHeaders('application/json');
        const res = await fetch(buildApiUrl("/api/users/me"), {
          method: 'PUT',
          headers,
          body: JSON.stringify({ profile_image_url: newImageUrl }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Erreur mise à jour logo (${res.status})`);
        }
        const updated = await res.json();
        setProfileData(updated);
        toast.success("Logo mis à jour");
      } catch (error) {
        const err = error as Error;
        console.error('Logo upload error:', err);
        toast.error(err.message || "Erreur lors du chargement du logo");
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!user) return;
    try {
      setUploadingLogo(true);
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch(buildApiUrl("/api/users/me"), {
        method: 'PUT',
        headers,
        body: JSON.stringify({ profile_image_url: null }),
      });

      if (!res.ok) throw new Error('Erreur suppression logo');
      const updated = await res.json();
      setProfileData(updated);
      setProfileImageUrl("");
      toast.success("Logo supprimé");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la suppression du logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch(buildApiUrl("/api/users/me"), {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          company_name: companyName,
          sector: sector,
          company_size: companySize,
          description: description,
          mission: mission,
          values: values,
          benefits: benefits,
          company_email: companyEmail,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur mise à jour (${res.status})`);
      }
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Profil entreprise mis à jour");
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
    <div className="space-y-6">
      {/* SECTION 0: Logo de l'entreprise (complètement autonome) */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Logo de l'entreprise</h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profileImageUrl} />
            <AvatarFallback className="text-lg font-bold">
              {String(companyName).split(/\s+/).slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted bg-blue-50 text-blue-700 font-medium">
                {uploadingLogo ? "Chargement..." : "Changer le logo"}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                hidden
              />
            </label>
            {profileImageUrl && (
              <Button
                variant="outline"
                onClick={handleRemoveLogo}
                disabled={uploadingLogo}
                className="text-red-600 hover:text-red-700"
              >
                Supprimer le logo
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 1: Informations entreprise (indépendant) */}
      <Card className="p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Informations entreprise</h2>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Modifier</Button>
          ) : (
            <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Nom entreprise */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input
              id="companyName"
              value={companyName}
              disabled={!editing}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nom officiel de votre entreprise"
            />
          </div>

          {/* Secteur */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="sector">Secteur d'activité</Label>
            <Select value={sector} onValueChange={setSector} disabled={!editing}>
              <SelectTrigger id="sector">
                <SelectValue placeholder="Sélectionner le secteur" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Taille entreprise */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="companySize">Taille de l'entreprise</Label>
            <Select value={companySize} onValueChange={setCompanySize} disabled={!editing}>
              <SelectTrigger id="companySize">
                <SelectValue placeholder="Sélectionner la taille" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email entreprise */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="companyEmail">Email de l'entreprise (optionnel)</Label>
            <Input
              id="companyEmail"
              type="email"
              value={companyEmail}
              disabled={!editing}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="contact@entreprise.com"
            />
            <p className="text-xs text-muted-foreground">Cet email est différent de l'email de création du compte (garant)</p>
          </div>

          <div className="border-t pt-8" />

          {/* Description */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="description">À propos de l'entreprise</Label>
            <Textarea
              id="description"
              value={description}
              disabled={!editing}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement votre entreprise, son histoire et ses activités"
              className="min-h-32"
            />
          </div>

          {/* Mission */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              value={mission}
              disabled={!editing}
              onChange={(e) => setMission(e.target.value)}
              placeholder="Quelle est la mission fondamentale de votre entreprise?"
              className="min-h-24"
            />
          </div>

          {/* Valeurs */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="values">Valeurs de l'entreprise</Label>
            <Textarea
              id="values"
              value={values}
              disabled={!editing}
              onChange={(e) => setValues(e.target.value)}
              placeholder="Énumérez les valeurs fondamentales (ex: Intégrité, Innovation, Excellence)"
              className="min-h-24"
            />
          </div>

          {/* Avantages sociaux */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="benefits">Avantages et bénéfices</Label>
            <Textarea
              id="benefits"
              value={benefits}
              disabled={!editing}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="Décrivez les avantages offerts aux employés (assurances, congés, formation, etc.)"
              className="min-h-24"
            />
          </div>

          {editing && (
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </Button>
          )}
        </form>
      </Card>

      {/* SECTION: Documents - Upload groupé */}
      {user && (
        <CompanyDocumentsUpload
          userId={String(user.id)}
          profileData={profileData}
          onDocumentUploaded={() => {
            // Recharger le profil après upload
            fetchProfile();
          }}
        />
      )}
    </div>
  );
}
