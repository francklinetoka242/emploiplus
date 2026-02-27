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

interface CompanyOption {
  id: number;
  company_name: string;
}

export default function CandidateProfessionalProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchingCompanies, setSearchingCompanies] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [editing, setEditing] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

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

  useEffect(() => {
    if (companySearch && editing) {
      searchCompanies(companySearch);
    } else {
      setCompanies([]);
    }
  }, [companySearch, editing]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", { headers });
      if (!res.ok) throw new Error('Erreur chargement profil');
      const data = await res.json();
      setProfileData(data);
      setJobTitle(data.job_title || "");
      setCompany((data as any).company || "");
      setCompanyId((data as any).company_id || null);
      setBio((data as any).bio || "");
      setSkills((data as any).skills ? (Array.isArray(data.skills) ? data.skills.join(', ') : data.skills) : "");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (query: string) => {
    if (!query) {
      setCompanies([]);
      return;
    }
    setSearchingCompanies(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCompanies(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur recherche entreprises:', error);
    } finally {
      setSearchingCompanies(false);
    }
  };

  const handleSelectCompany = (comp: CompanyOption) => {
    setCompany(comp.company_name);
    setCompanyId(comp.id);
    setCompanySearch("");
    setShowCompanyDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!jobTitle || !company) {
      toast.error("Le poste et l'entreprise sont obligatoires");
      return;
    }

    setLoading(true);
    try {
      const headersPut: Record<string, string> = authHeaders('application/json');
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({
          job_title: jobTitle,
          company: company,
          company_id: companyId,
          bio: bio,
          skills: skillsArray,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Profil professionnel mis à jour");
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
        <h2 className="text-2xl font-bold">💼 Profil Professionnel</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Poste */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Poste * <span className="text-xs text-gray-500">(Comptable Senior, Électricien industriel, Stage en Informatique)</span></Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            disabled={!editing}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Ex: Comptable Senior, Électricien industriel, Stage en Informatique"
            required
          />
          <p className="text-sm text-muted-foreground">Votre position actuelle ou celle que vous recherchez</p>
        </div>

        {/* Entreprise */}
        <div className="space-y-2">
          <Label htmlFor="company">Entreprise *</Label>
          {editing ? (
            <div className="relative">
              <Input
                id="company"
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setShowCompanyDropdown(true);
                }}
                onFocus={() => setShowCompanyDropdown(true)}
                placeholder="Rechercher une entreprise..."
              />
              {showCompanyDropdown && (companySearch || companies.length > 0) && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchingCompanies ? (
                    <div className="p-3 text-center text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Recherche...
                    </div>
                  ) : companies.length > 0 ? (
                    companies.map((comp) => (
                      <div
                        key={comp.id}
                        className="p-3 hover:bg-orange-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleSelectCompany(comp)}
                      >
                        {comp.company_name}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      Aucune entreprise trouvée
                    </div>
                  )}
                </div>
              )}
              {company && !companySearch && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                  ✓ Entreprise sélectionnée: <strong>{company}</strong>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0 text-xs"
                    onClick={() => {
                      setCompany("");
                      setCompanyId(null);
                    }}
                  >
                    Modifier
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-gray-100 rounded-md text-gray-900">
              {company || "Non renseigné"}
            </div>
          )}
          <p className="text-sm text-muted-foreground">Sélectionnez une entreprise enregistrée sur le site. Cette information sera visible sur votre profil public.</p>
        </div>

        {/* Résumé professionnel */}
        <div className="space-y-2">
          <Label htmlFor="bio">Résumé professionnel</Label>
          <Textarea
            id="bio"
            value={bio}
            disabled={!editing}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Présentez-vous en quelques lignes : expérience, forces, objectifs professionnels..."
            rows={4}
          />
          <p className="text-sm text-muted-foreground">Utile pour les algorithmes IA qui vous matching avec les offres</p>
        </div>

        {/* Compétences */}
        <div className="space-y-2">
          <Label htmlFor="skills">Compétences (Tags)</Label>
          <Textarea
            id="skills"
            value={skills}
            disabled={!editing}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Ex: Excel, PHP, Leadership, Gestion de projet, Communication, Rigueur"
            rows={3}
          />
          <p className="text-sm text-muted-foreground">Séparez par virgule. Incluez Hard skills (techniques) et Soft skills (qualités personnelles)</p>
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

