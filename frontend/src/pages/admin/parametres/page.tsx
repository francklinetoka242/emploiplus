// frontend/src/pages/admin/parametres/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Camera, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AdminProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  profile_photo: string;
  account_type: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminParametresPage() {
  const [adminData, setAdminData] = useState<AdminProfile | null>(null);
  const [formData, setFormData] = useState<Partial<AdminProfile>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  // Fetch admin profile on mount
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admins/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Erreur lors du chargement du profil");
      
      const data = await response.json();
      setAdminData(data.data);
      setFormData(data.data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des informations");
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          profile_photo: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        country: formData.country
      };

      const response = await fetch("/api/admins/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      
      toast.success("Profil mis à jour avec succès");
      fetchAdminProfile();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admins/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) throw new Error("Erreur lors du changement de mot de passe");
      
      toast.success("Mot de passe modifié avec succès");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Paramètres du compte</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et vos paramètres de sécurité</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Photo de profil */}
        <Card>
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
            <CardDescription>Mettez à jour votre photo de profil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {adminData?.profile_photo ? (
                  <img src={adminData.profile_photo} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {adminData?.first_name?.[0]}{adminData?.last_name?.[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button variant="outline" className="gap-2" asChild>
                    <span>
                      <Camera className="h-4 w-4" />
                      Changer la photo
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Vos informations de compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom(s)</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ""}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom(s)</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ""}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Non modifiable</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country || ""}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Type de compte</Label>
                <Input
                  id="account_type"
                  value={formData.account_type || ""}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Non modifiable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations de compte */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de compte</CardTitle>
            <CardDescription>Détails de votre compte administrateur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Rôle</p>
                <p className="text-lg font-semibold capitalize">{adminData?.role?.replace(/_/g, " ") || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Statut</p>
                <p className="text-lg font-semibold capitalize">{adminData?.status || "N/A"}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-600">Créé le</p>
              <p className="text-sm text-gray-500">
                {adminData?.created_at ? new Date(adminData.created_at).toLocaleDateString("fr-FR") : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>Gérez votre sécurité et vos mots de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPasswordForm ? (
              <Button 
                variant="outline" 
                className="gap-2 w-full"
                onClick={() => setShowPasswordForm(true)}
              >
                <Lock className="h-4 w-4" />
                Modifier le mot de passe
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    placeholder="Entrez votre mot de passe actuel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder="Entrez un nouveau mot de passe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Modification..." : "Modifier"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowPasswordForm(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour
          </Button>
          <Button onClick={handleSaveProfile} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </Button>
        </div>
      </div>
    </div>
  );
}