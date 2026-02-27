import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { authHeaders } from '@/lib/headers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password) {
      toast.error("Veuillez entrer votre mot de passe");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: authHeaders('application/json'),
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la suppression du compte");
      }

      toast.success("Compte supprimé avec succès");
      setPassword("");
      setDialogOpen(false);
      
      // Sign out and redirect
      await signOut();
      navigate("/");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Supprimer le compte</h1>

      <Card className="p-6 border-destructive/20 bg-destructive/5">
        <div className="flex items-start space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Zone de danger
            </h2>
            <p className="text-muted-foreground">
              La suppression de votre compte est permanente et irréversible. Tous vos
              données seront supprimées.
            </p>
          </div>
        </div>

        <div className="space-y-4 border-t border-destructive/10 pt-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Cette action ne peut pas être annulée. Veuillez être certain avant de procéder.
          </p>

          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg">
                Supprimer mon compte
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogTitle>Confirmer la suppression du compte</AlertDialogTitle>
              <AlertDialogDescription>
                Entrez votre mot de passe pour confirmer la suppression. Cette action est permanente.
              </AlertDialogDescription>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="confirm-password">Mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={loading || !password}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    "Supprimer définitivement"
                  )}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
