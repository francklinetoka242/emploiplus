import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { COUNTRIES, GENDERS } from '@/lib/options';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { uploadFile } from '@/lib/upload';
import { Loader2 } from "lucide-react";
import { authHeaders } from '@/lib/headers';

export default function CandidatePersonalInfo() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
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
      const fullName = data.full_name || "";
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        setFirstName(parts.slice(0, -1).join(' '));
        setLastName(parts[parts.length - 1]);
      } else {
        setFirstName(fullName);
        setLastName("");
      }
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setCity((data as any).city || "");
      setBirthdate((data as any).birthdate || "");
      setGender((data as any).gender || "");
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
      let profileImageUrl = profileData?.profile_image_url || null;

      if (imageFile) {
        const token = localStorage.getItem('token');
        profileImageUrl = await uploadFile(imageFile, token, 'profiles');
      }

      const headersPut: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({
          full_name: (firstName + (lastName ? ' ' + lastName : '')).trim(),
          email: email,
          phone: phone,
          city: city,
          birthdate: birthdate,
          gender: gender,
          profile_image_url: profileImageUrl,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Informations personnelles mises à jour");
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
        <h2 className="text-2xl font-bold">📋 Informations Personnelles</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={previewUrl || (profileData?.profile_image_url as string)} />
            <AvatarFallback>{(firstName + ' ' + lastName).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {editing && (
            <div>
              <Label htmlFor="photo">Photo professionnelle</Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2"
              />
            </div>
          )}
        </div>

        {/* Section: Prénom(s) et Nom(s) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Identité</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prénom(s) */}
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom(s) *</Label>
              <Input
                id="firstName"
                value={firstName}
                disabled={!editing}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                required
              />
            </div>

            {/* Nom(s) */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom(s) *</Label>
              <Input
                id="lastName"
                value={lastName}
                disabled={!editing}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                required
              />
            </div>
          </div>
        </div>

        {/* Section: Date de naissance et Genre */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date de naissance */}
            <div className="space-y-2">
              <Label htmlFor="birthdate">Date de naissance</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                disabled={!editing}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="gender">Genre</Label>
              <Select value={gender} onValueChange={setGender} disabled={!editing}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Sélectionner le genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section: Coordonnées */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">📞 Coordonnées</h3>
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled={!editing}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={phone}
                disabled={!editing}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +242 XX XX XX XX"
              />
            </div>

            {/* Ville / Quartier */}
            <div className="space-y-2">
              <Label htmlFor="city">Ville / Quartier *</Label>
              <Input
                id="city"
                value={city}
                disabled={!editing}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Brazzaville, Kinshasa"
              />
            </div>
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
