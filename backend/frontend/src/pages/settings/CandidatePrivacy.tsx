import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Lock, Globe } from "lucide-react";
import { authHeaders } from '@/lib/headers';

export default function CandidatePrivacy() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Paramètres de confidentialité pour candidats
  const [publicSettings, setPublicSettings] = useState({
    // Profil - Informations Personnelles
    full_name: true,
    profile_image: true,
    birthdate: false,
    gender: false,
    phone: false,
    email: false,
    city: true,
    linkedin: false,
    // Profil - Profil Professionnel
    job_title: true,
    bio: true,
    skills: true,
    profession: true,
    // Mes informations - Parcours & Documents
    experiences: false,
    formations: false,
    documents: false,
    // Mes informations - Préférences de recherche
    contract_type: false,
    availability: false,
    salary: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  const fetchPublicSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", { headers });
      if (!res.ok) throw new Error('Erreur chargement paramètres');
      const data = await res.json();
      
      if (data.public_settings) {
        setPublicSettings(data.public_settings);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPublicSettings();
    }
  }, [user, fetchPublicSettings]);

  const handleCheckboxChange = (key: string, value: boolean) => {
    // Nom complet et photo sont obligatoires
    if (key === 'full_name' || key === 'profile_image') {
      return;
    }
    setPublicSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers,
        body: JSON.stringify({ public_settings: publicSettings }),
      });

      if (!res.ok) throw new Error('Erreur sauvegarde');
      toast.success("Paramètres de confidentialité mis à jour");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la sauvegarde");
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
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Lock className="h-8 w-8 text-blue-600" />
          Paramètres de confidentialité
        </h1>
        <p className="text-muted-foreground">
          Gérez les informations de votre profil qui sont visibles par les entreprises et autres utilisateurs
        </p>
      </div>

      {/* Informations obligatoires */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-1">ℹ️</div>
          <div>
            <h3 className="font-semibold text-blue-900">Informations obligatoires</h3>
            <p className="text-sm text-blue-800 mt-1">Votre nom complet et votre photo de profil doivent toujours être visibles pour que les entreprises puissent vous identifier.</p>
          </div>
        </div>
      </Card>

      {/* Profil - Informations Personnelles */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold">Profil</h2>
        </div>
        
        <div className="space-y-6">
          {/* Section Informations Personnelles */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">📋 Informations Personnelles</h3>
            
            <div className="space-y-4">
              {/* Nom complet */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="full_name"
                  checked={publicSettings.full_name}
                  disabled={true}
                  className="cursor-not-allowed opacity-50"
                />
                <Label htmlFor="full_name" className="flex-1 cursor-not-allowed font-medium">
                  Nom complet
                </Label>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Obligatoire</span>
              </div>

              {/* Photo */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="profile_image"
                  checked={publicSettings.profile_image}
                  disabled={true}
                  className="cursor-not-allowed opacity-50"
                />
                <Label htmlFor="profile_image" className="flex-1 cursor-not-allowed font-medium">
                  Photo de profil professionnelle
                </Label>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Obligatoire</span>
              </div>

              {/* Date de naissance */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="birthdate"
                  checked={publicSettings.birthdate}
                  onCheckedChange={(value) => handleCheckboxChange('birthdate', value as boolean)}
                />
                <Label htmlFor="birthdate" className="flex-1 cursor-pointer font-medium">
                  Date de naissance
                </Label>
              </div>

              {/* Genre */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="gender"
                  checked={publicSettings.gender}
                  onCheckedChange={(value) => handleCheckboxChange('gender', value as boolean)}
                />
                <Label htmlFor="gender" className="flex-1 cursor-pointer font-medium">
                  Genre
                </Label>
              </div>

              {/* Téléphone */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="phone"
                  checked={publicSettings.phone}
                  onCheckedChange={(value) => handleCheckboxChange('phone', value as boolean)}
                />
                <Label htmlFor="phone" className="flex-1 cursor-pointer font-medium">
                  Téléphone
                </Label>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="email"
                  checked={publicSettings.email}
                  onCheckedChange={(value) => handleCheckboxChange('email', value as boolean)}
                />
                <Label htmlFor="email" className="flex-1 cursor-pointer font-medium">
                  Adresse email
                </Label>
              </div>

              {/* Ville / Quartier */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="city"
                  checked={publicSettings.city}
                  onCheckedChange={(value) => handleCheckboxChange('city', value as boolean)}
                />
                <Label htmlFor="city" className="flex-1 cursor-pointer font-medium">
                  Ville / Quartier
                </Label>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="linkedin"
                  checked={publicSettings.linkedin}
                  onCheckedChange={(value) => handleCheckboxChange('linkedin', value as boolean)}
                />
                <Label htmlFor="linkedin" className="flex-1 cursor-pointer font-medium">
                  Profil LinkedIn
                </Label>
              </div>
            </div>
          </div>

          {/* Section Profil Professionnel */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">💼 Profil Professionnel</h3>
            
            <div className="space-y-4">
              {/* Profession */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="profession"
                  checked={publicSettings.profession}
                  onCheckedChange={(value) => handleCheckboxChange('profession', value as boolean)}
                />
                <Label htmlFor="profession" className="flex-1 cursor-pointer font-medium">
                  Profession
                </Label>
              </div>

              {/* Titre du profil */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="job_title"
                  checked={publicSettings.job_title}
                  onCheckedChange={(value) => handleCheckboxChange('job_title', value as boolean)}
                />
                <Label htmlFor="job_title" className="flex-1 cursor-pointer font-medium">
                  Titre professionnel
                </Label>
              </div>

              {/* Résumé / Bio */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="bio"
                  checked={publicSettings.bio}
                  onCheckedChange={(value) => handleCheckboxChange('bio', value as boolean)}
                />
                <Label htmlFor="bio" className="flex-1 cursor-pointer font-medium">
                  Résumé professionnel
                </Label>
              </div>

              {/* Compétences */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="skills"
                  checked={publicSettings.skills}
                  onCheckedChange={(value) => handleCheckboxChange('skills', value as boolean)}
                />
                <Label htmlFor="skills" className="flex-1 cursor-pointer font-medium">
                  Compétences (Hard & Soft skills)
                </Label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Mes informations - Parcours & Documents */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Mes informations</h2>
        
        <div className="space-y-6">
          {/* Section Parcours & Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">📚 Parcours & Documents</h3>
            
            <div className="space-y-4">
              {/* Expériences */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="experiences"
                  checked={publicSettings.experiences}
                  onCheckedChange={(value) => handleCheckboxChange('experiences', value as boolean)}
                />
                <Label htmlFor="experiences" className="flex-1 cursor-pointer font-medium">
                  Expériences professionnelles
                  <p className="text-sm text-muted-foreground font-normal">Entreprise, poste, dates, réalisations clés</p>
                </Label>
              </div>

              {/* Formations */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="formations"
                  checked={publicSettings.formations}
                  onCheckedChange={(value) => handleCheckboxChange('formations', value as boolean)}
                />
                <Label htmlFor="formations" className="flex-1 cursor-pointer font-medium">
                  Formations et diplômes
                  <p className="text-sm text-muted-foreground font-normal">Diplômes, établissements, années</p>
                </Label>
              </div>

              {/* Documents */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="documents"
                  checked={publicSettings.documents}
                  onCheckedChange={(value) => handleCheckboxChange('documents', value as boolean)}
                />
                <Label htmlFor="documents" className="flex-1 cursor-pointer font-medium">
                  Documents
                  <p className="text-sm text-muted-foreground font-normal">CV, lettres de recommandation, certificats, pièce d'identité, passeport</p>
                </Label>
              </div>
            </div>
          </div>

          {/* Section Préférences de Recherche */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">🎯 Préférences de Recherche</h3>
            
            <div className="space-y-4">
              {/* Type de contrat */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="contract_type"
                  checked={publicSettings.contract_type}
                  onCheckedChange={(value) => handleCheckboxChange('contract_type', value as boolean)}
                />
                <Label htmlFor="contract_type" className="flex-1 cursor-pointer font-medium">
                  Type de contrat recherché
                  <p className="text-sm text-muted-foreground font-normal">CDI, CDD, Stage, Freelance, Intérim</p>
                </Label>
              </div>

              {/* Disponibilité */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="availability"
                  checked={publicSettings.availability}
                  onCheckedChange={(value) => handleCheckboxChange('availability', value as boolean)}
                />
                <Label htmlFor="availability" className="flex-1 cursor-pointer font-medium">
                  Disponibilité
                  <p className="text-sm text-muted-foreground font-normal">Immédiate, avec préavis, etc.</p>
                </Label>
              </div>

              {/* Prétentions salariales */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Checkbox
                  id="salary"
                  checked={publicSettings.salary}
                  onCheckedChange={(value) => handleCheckboxChange('salary', value as boolean)}
                />
                <Label htmlFor="salary" className="flex-1 cursor-pointer font-medium">
                  Prétentions salariales
                  <p className="text-sm text-muted-foreground font-normal">Optionnel, pour filtrer les offres correspondantes</p>
                </Label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          onClick={handleSave} 
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? '⏳ Enregistrement...' : '✓ Enregistrer les paramètres'}
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/parametres')}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
