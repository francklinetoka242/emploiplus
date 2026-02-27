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

export default function CompanyPrivacy() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Informations entreprise (obligatoires: logo et nom)
  const [publicSettings, setPublicSettings] = useState({
    company_logo: true, // Obligatoire
    company_name: true, // Obligatoire
    sector: true,
    company_size: true,
    description: true,
    mission: true,
    values: true,
    benefits: true,
    headquarters: true,
    branches: true,
    phone: false,
    email: false,
    website: true,
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
    // Logo et nom ne peuvent pas être décochés
    if (key === 'company_logo' || key === 'company_name') {
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
          Gérez les informations de votre entreprise qui sont visibles par les autres utilisateurs
        </p>
      </div>

      {/* Informations obligatoires */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-1">ℹ️</div>
          <div>
            <h3 className="font-semibold text-blue-900">Informations obligatoires</h3>
            <p className="text-sm text-blue-800 mt-1">Le logo et le nom de votre entreprise doivent toujours être visibles pour que les autres utilisateurs puissent identifier votre entreprise.</p>
          </div>
        </div>
      </Card>

      {/* Informations entreprise */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold">Informations de l'entreprise</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Choisissez les informations à afficher dans votre profil public</p>

        <div className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Checkbox
              id="company_logo"
              checked={publicSettings.company_logo}
              disabled={true}
              className="cursor-not-allowed opacity-50"
            />
            <Label htmlFor="company_logo" className="flex-1 cursor-not-allowed font-medium">
              Logo de l'entreprise
            </Label>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Obligatoire</span>
          </div>

          {/* Nom */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Checkbox
              id="company_name"
              checked={publicSettings.company_name}
              disabled={true}
              className="cursor-not-allowed opacity-50"
            />
            <Label htmlFor="company_name" className="flex-1 cursor-not-allowed font-medium">
              Nom de l'entreprise
            </Label>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Obligatoire</span>
          </div>

          {/* Secteur */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Checkbox
              id="sector"
              checked={publicSettings.sector}
              onCheckedChange={(value) => handleCheckboxChange('sector', value as boolean)}
            />
            <Label htmlFor="sector" className="flex-1 cursor-pointer font-medium">
              Secteur d'activité
            </Label>
          </div>

          {/* Taille */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Checkbox
              id="company_size"
              checked={publicSettings.company_size}
              onCheckedChange={(value) => handleCheckboxChange('company_size', value as boolean)}
            />
            <Label htmlFor="company_size" className="flex-1 cursor-pointer font-medium">
              Taille de l'entreprise
            </Label>
          </div>

          {/* Description */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Checkbox
              id="description"
              checked={publicSettings.description}
              onCheckedChange={(value) => handleCheckboxChange('description', value as boolean)}
            />
            <Label htmlFor="description" className="flex-1 cursor-pointer font-medium">
              À propos de l'entreprise
            </Label>
          </div>

          {/* Mission */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Checkbox
              id="mission"
              checked={publicSettings.mission}
              onCheckedChange={(value) => handleCheckboxChange('mission', value as boolean)}
            />
            <Label htmlFor="mission" className="flex-1 cursor-pointer font-medium">
              Mission de l'entreprise
            </Label>
          </div>

          {/* Valeurs */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Checkbox
              id="values"
              checked={publicSettings.values}
              onCheckedChange={(value) => handleCheckboxChange('values', value as boolean)}
            />
            <Label htmlFor="values" className="flex-1 cursor-pointer font-medium">
              Valeurs de l'entreprise
            </Label>
          </div>

          {/* Avantages */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Checkbox
              id="benefits"
              checked={publicSettings.benefits}
              onCheckedChange={(value) => handleCheckboxChange('benefits', value as boolean)}
            />
            <Label htmlFor="benefits" className="flex-1 cursor-pointer font-medium">
              Avantages et bénéfices
            </Label>
          </div>
        </div>
      </Card>

      {/* Localisation & Contact */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Localisation & Contact</h2>
        <p className="text-sm text-muted-foreground mb-4">Choisissez vos coordonnées à partager publiquement</p>

        <div className="space-y-4">
          {/* Siège social */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Checkbox
              id="headquarters"
              checked={publicSettings.headquarters}
              onCheckedChange={(value) => handleCheckboxChange('headquarters', value as boolean)}
            />
            <Label htmlFor="headquarters" className="flex-1 cursor-pointer font-medium">
              Siège social
            </Label>
          </div>

          {/* Succursales */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Checkbox
              id="branches"
              checked={publicSettings.branches}
              onCheckedChange={(value) => handleCheckboxChange('branches', value as boolean)}
            />
            <Label htmlFor="branches" className="flex-1 cursor-pointer font-medium">
              Succursales
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
              Email de l'entreprise
            </Label>
          </div>

          {/* Site web */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Checkbox
              id="website"
              checked={publicSettings.website}
              onCheckedChange={(value) => handleCheckboxChange('website', value as boolean)}
            />
            <Label htmlFor="website" className="flex-1 cursor-pointer font-medium">
              Site web
            </Label>
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
