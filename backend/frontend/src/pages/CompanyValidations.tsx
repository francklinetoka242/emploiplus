import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { authHeaders } from "@/lib/headers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Download, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

interface ValidatedApplication {
  id: number;
  job_id: number;
  job_title?: string;
  user_id?: number;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_location?: string;
  candidate_profession?: string;
  candidate_avatar?: string;
  status: string;
  validated_at?: string;
  created_at?: string;
  cv_url?: string;
}

export default function CompanyValidationsPage() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user);
  const [validatedApps, setValidatedApps] = useState<ValidatedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchValidatedApplications();
  }, []);

  const fetchValidatedApplications = async () => {
    setLoading(true);
    try {
      const headers = authHeaders();
      const res = await fetch("/api/company/applications?status=validated", { headers });
      if (!res.ok) throw new Error("Erreur chargement validations");
      const data = await res.json();
      setValidatedApps(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les candidatures validées");
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = validatedApps.filter((app) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (app.candidate_name || "").toLowerCase().includes(q) ||
      (app.candidate_email || "").toLowerCase().includes(q) ||
      (app.job_title || "").toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    if (validatedApps.length === 0) {
      toast.error("Aucune candidature à exporter");
      return;
    }

    const headers = ["Nom du candidat", "Email", "Téléphone", "Lieu", "Profession", "Offre", "Validée le"];
    const rows = validatedApps.map((app) => [
      app.candidate_name || "",
      app.candidate_email || "",
      app.candidate_phone || "",
      app.candidate_location || "",
      app.candidate_profession || "",
      app.job_title || "",
      app.validated_at ? new Date(app.validated_at).toLocaleDateString("fr-FR") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `validations_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fichier exporté avec succès");
  };

  const exportJSON = () => {
    if (validatedApps.length === 0) {
      toast.error("Aucune candidature à exporter");
      return;
    }

    const jsonContent = JSON.stringify(validatedApps, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `validations_${new Date().toISOString().split("T")[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fichier exporté avec succès");
  };

  if (!user) return null;

  if (role !== "company") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center border-0 shadow-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">Accès refusé</h2>
          <p className="text-muted-foreground mb-6">
            Cette page est réservée aux entreprises.
          </p>
          <Button asChild>
            <Link to="/fil-actualite">Retour au fil d'actualité</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Historique des validations</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Candidatures validées par votre entreprise
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/recrutement">← Retour au recrutement</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-0 shadow-md">
              <div className="text-sm text-muted-foreground">Total des validations</div>
              <div className="text-3xl font-bold mt-2">{validatedApps.length}</div>
            </Card>
            <Card className="p-4 border-0 shadow-md">
              <div className="text-sm text-muted-foreground">Résultats affichés</div>
              <div className="text-3xl font-bold mt-2">{filteredApps.length}</div>
            </Card>
            <Card className="p-4 border-0 shadow-md flex flex-col justify-between">
              <div className="text-sm text-muted-foreground">Actions</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={exportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={exportJSON}>
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Rechercher par nom, email ou offre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredApps.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-md">
            <p className="text-muted-foreground">
              {validatedApps.length === 0
                ? "Aucune candidature validée pour le moment."
                : "Aucune candidature ne correspond à votre recherche."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApps.map((app) => (
              <Card key={app.id} className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-14 w-14 flex-shrink-0">
                    <AvatarImage src={app.candidate_avatar} alt={app.candidate_name} />
                    <AvatarFallback className="font-bold">
                      {(app.candidate_name || "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Infos */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{app.candidate_name || "Candidat inconnu"}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{app.job_title}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {app.candidate_email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${app.candidate_email}`} className="hover:text-primary">
                            {app.candidate_email}
                          </a>
                        </div>
                      )}
                      {app.candidate_phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${app.candidate_phone}`} className="hover:text-primary">
                            {app.candidate_phone}
                          </a>
                        </div>
                      )}
                      {app.candidate_location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {app.candidate_location}
                        </div>
                      )}
                      {app.candidate_profession && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          {app.candidate_profession}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date de validation */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-muted-foreground">Validée le</div>
                    <div className="font-semibold text-green-600">
                      {app.validated_at
                        ? new Date(app.validated_at).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
