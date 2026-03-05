// src/pages/admin/profile/page.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { User, Mail, Phone, MapPin, Shield, Key, Camera, Save, Loader2 } from "lucide-react";

const profileSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  country: z.string().optional(),
  profile_photo: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Mot de passe actuel requis"),
  new_password: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
  confirm_password: z.string().min(1, "Confirmation requise"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get("/api/admins/profile/me");
      const adminData = response.data.data;
      setAdmin(adminData);

      // Pré-remplir le formulaire
      profileForm.reset({
        first_name: adminData.first_name || "",
        last_name: adminData.last_name || "",
        phone: adminData.phone || "",
        country: adminData.country || "",
        profile_photo: adminData.profile_photo || "",
      });
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setUpdating(true);
    try {
      await api.put("/api/admins/profile/me", data);
      toast.success("Profil mis à jour avec succès");
      await loadProfile(); // Recharger les données
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setChangingPassword(true);
    try {
      await api.put("/api/admins/profile/me", {
        password: data.new_password,
      });
      toast.success("Mot de passe changé avec succès");
      passwordForm.reset();
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast.error("Erreur lors du changement de mot de passe");
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "admin_offres":
        return "bg-blue-100 text-blue-800";
      case "admin_users":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin_offres":
        return "Admin Offres";
      case "admin_users":
        return "Admin Utilisateurs";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres du compte</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et paramètres de sécurité
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations du profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Mettez à jour vos informations de profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar et informations de base */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={admin?.profile_photo} />
                <AvatarFallback className="text-lg">
                  {admin?.first_name?.[0]}{admin?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold">
                  {admin?.first_name} {admin?.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{admin?.email}</p>
                <Badge className={getRoleBadgeColor(admin?.role)}>
                  {getRoleLabel(admin?.role)}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Formulaire de profil */}
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    {...profileForm.register("first_name")}
                    placeholder="Votre prénom"
                  />
                  {profileForm.formState.errors.first_name && (
                    <p className="text-sm text-red-600">
                      {profileForm.formState.errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    {...profileForm.register("last_name")}
                    placeholder="Votre nom"
                  />
                  {profileForm.formState.errors.last_name && (
                    <p className="text-sm text-red-600">
                      {profileForm.formState.errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  {...profileForm.register("phone")}
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pays
                </Label>
                <Input
                  id="country"
                  {...profileForm.register("country")}
                  placeholder="Votre pays"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_photo" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photo de profil (URL)
                </Label>
                <Input
                  id="profile_photo"
                  {...profileForm.register("profile_photo")}
                  placeholder="URL de votre photo de profil"
                />
              </div>

              <Button type="submit" disabled={updating} className="w-full">
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Mettre à jour le profil
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Changez votre mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Mot de passe actuel</Label>
                <Input
                  id="current_password"
                  type="password"
                  {...passwordForm.register("current_password")}
                  placeholder="Votre mot de passe actuel"
                />
                {passwordForm.formState.errors.current_password && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.current_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <Input
                  id="new_password"
                  type="password"
                  {...passwordForm.register("new_password")}
                  placeholder="Votre nouveau mot de passe"
                />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...passwordForm.register("confirm_password")}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={changingPassword} variant="outline" className="w-full">
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changement...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Changer le mot de passe
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Informations supplémentaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informations du compte
          </CardTitle>
          <CardDescription>
            Détails de votre compte administrateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{admin?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Type de compte</Label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge className={getRoleBadgeColor(admin?.role)}>
                  {getRoleLabel(admin?.role)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Niveau d'accès</Label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Niveau {admin?.role_level || 1}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
              <div className="flex items-center gap-2">
                <Badge variant={admin?.status === 'active' ? 'default' : 'secondary'}>
                  {admin?.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-sm text-muted-foreground">
            <p>Compte créé le {new Date(admin?.created_at).toLocaleDateString('fr-FR')}</p>
            {admin?.updated_at && (
              <p>Dernière modification le {new Date(admin?.updated_at).toLocaleDateString('fr-FR')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}