import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { COUNTRIES, CONGO_CITIES, GENDERS } from '@/lib/options';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { uploadFile } from '@/lib/upload';
import { Loader2, Upload } from "lucide-react";
import { authHeaders } from '@/lib/headers';

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  profile_image_url?: string;
  user_type: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [editing, setEditing] = useState(false);
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const q = (search.get('q') || '').toLowerCase().trim();

  const matches = (label: string, value?: string) => {
    if (!q) return true;
    const hay = `${label} ${value || ''}`.toLowerCase();
    return hay.includes(q);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  // Redirect companies to CompanyProfile page
  useEffect(() => {
    if (profileData && profileData.user_type === 'company') {
      navigate('/parametres/profil-entreprise');
    }
  }, [profileData, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string,string> = {};
      Object.assign(headers, authHeaders());
      const res = await fetch("/api/users/me", { headers });
      if (!res.ok) {
        let msg = `Erreur chargement profil (HTTP ${res.status})`;
        try {
          const body = await res.json();
          if (body && body.message) msg = `Erreur ${res.status}: ${body.message}`;
          else msg = `Erreur ${res.status}: ${JSON.stringify(body)}`;
        } catch (e) {
          try { const t = await res.text(); if (t) msg = `Erreur ${res.status}: ${t}`; } catch (_) {}
        }
        console.error('fetchProfile (settings) non-ok', res.status);
        throw new Error(msg);
      }
      const data: UserProfile = await res.json();
      setProfileData(data);
      setFullName(data.full_name);
      setEmail(data.email);
      setPhone(data.phone || "");
      setCountry((data as any).country || '');
      setCity((data as any).city || '');
      setAddress((data as any).address || '');
      setBirthdate((data as any).birthdate || '');
      setGender((data as any).gender || '');
      setNationality((data as any).nationality || (data as any).country || '');
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

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Extract base64 part
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
      const token = localStorage.getItem("token");
      let profileImageUrl = profileData?.profile_image_url || null;

      // Upload image if changed
      if (imageFile) {
        profileImageUrl = await uploadFile(imageFile, token, 'profiles');
      }

      // Update profile
      const headersPut: Record<string,string> = authHeaders('application/json');

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: headersPut,
        body: JSON.stringify({
            full_name: fullName,
            phone: phone || null,
            profile_image_url: profileImageUrl,
            country: country || null,
            city: city || null,
            address: address || null,
            birthdate: birthdate || null,
            gender: gender || null,
            nationality: nationality || null,
          }),
      });

      if (!res.ok) {
        let msg = "Erreur mise à jour profil";
        try {
          const body = await res.json();
          if (body && body.message) msg = body.message;
        } catch (e) {}
        throw new Error(msg);
      }
      const updated: UserProfile = await res.json();
      setProfileData(updated);
      setImageFile(null);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profileData) return null;

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profil</h1>

      {/* Verification status and request */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          {profileData.is_verified ? (
            <div className="text-sm text-green-600 font-semibold">Compte certifié</div>
          ) : (
            <div className="text-sm text-muted-foreground">Compte non certifié</div>
          )}
        </div>
        {!profileData.is_verified && (
          <div>
            <Button
              onClick={async () => {
                try {
                  setLoading(true);
                  const token = localStorage.getItem('token');
                  const requested_name = profileData.user_type === 'company' ? profileData.company_name || profileData.full_name : profileData.full_name;
                  const headersVr: Record<string,string> = authHeaders('application/json');
                  const res = await fetch('/api/verify-request', {
                    method: 'POST',
                    headers: headersVr,
                    body: JSON.stringify({ requested_name }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.message || 'Erreur lors de la demande');
                  toast.success('Demande de vérification déposée. Un administrateur la traitera bientôt.');
                } catch (err) {
                  const msg = err instanceof Error ? err.message : 'Erreur lors de la demande';
                  toast.error(msg);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Demander la vérification
            </Button>
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="flex justify-end mb-4">
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Modifier</Button>
          ) : (
            <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center space-y-4 pb-6 border-b">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image-input"
              />
              <Label
                htmlFor="profile-image-input"
                className="flex items-center space-x-2 cursor-pointer px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Changer la photo</span>
              </Label>
            </div>
          </div>

          {/* Informations de base (filtrées si recherche) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches('Email', email) && (
                <div>
                  <Label htmlFor="email">Email (non modifiable)</Label>
                  <Input id="email" type="email" value={email} disabled className="mt-1" />
                </div>
              )}

              {matches('Nom complet', fullName) && (
                <div>
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input id="fullName" type="text" value={fullName} disabled={!editing} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
                </div>
              )}

              {matches('Téléphone', phone) && (
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" value={phone} disabled={!editing} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                </div>
              )}

              {matches('Pays', country) && (
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Select value={country} onValueChange={(v) => { setCountry(v); setNationality(v); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner un pays" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {matches('Ville', city) && (
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner une ville" /></SelectTrigger>
                    <SelectContent>
                      {CONGO_CITIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {matches('Adresse', address) && (
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" type="text" value={address} disabled={!editing} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
                </div>
              )}

              {matches('Date de naissance', birthdate) && (
                <div>
                  <Label htmlFor="birthdate">Date de naissance</Label>
                  <Input id="birthdate" type="date" value={birthdate} disabled={!editing} onChange={(e) => setBirthdate(e.target.value)} className="mt-1" />
                </div>
              )}

              {matches('Genre', gender) && (
                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (<SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {matches('Nationalité', nationality) && (
                <div>
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Input id="nationality" type="text" value={nationality} disabled className="mt-1" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/parametres")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
