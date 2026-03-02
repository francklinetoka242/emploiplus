// src/pages/admin/AdminCandidates.tsx
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, Search, Download, Mail, Trash2 } from "lucide-react";
import { authHeaders } from "@/lib/headers";
import { toast } from "sonner";

interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  profession?: string;
  user_type: string;
  experience_years?: number;
  created_at?: string;
}

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/users", {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur chargement candidats");
      const data = await res.json();
      const cands = data.filter((u: any) =>
        u.user_type?.toLowerCase() === "candidate" ||
        u.user_type?.toLowerCase() === "candidat"
      );
      setCandidates(cands);
      setFilteredCandidates(cands);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      toast.error("Erreur lors du chargement des candidats");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = candidates.filter((c) =>
      c.full_name?.toLowerCase().includes(value.toLowerCase()) ||
      c.email?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCandidates(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce candidat?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur suppression");
      setCandidates(candidates.filter((c) => c.id !== id));
      setFilteredCandidates(filteredCandidates.filter((c) => c.id !== id));
      toast.success("Candidat supprimé");
    } catch (err) {
      console.error("Error deleting candidate:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const exportData = () => {
    const csv = [
      ["ID", "Nom", "Email", "Téléphone", "Profession", "Expérience", "Date inscription"],
      ...filteredCandidates.map((c) => [
        c.id,
        c.full_name || "",
        c.email || "",
        c.phone || "",
        c.profession || "",
        c.experience_years || "",
        c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidats.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <UserCheck className="h-8 w-8" />
            Supervision des candidats
          </h1>
          <p className="text-muted-foreground">
            Gérez et supervisez tous les candidats de la plateforme
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Total candidats</div>
            <div className="text-3xl font-bold mt-2">{candidates.length}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Actifs ce mois</div>
            <div className="text-3xl font-bold mt-2">-</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Avec portfolio</div>
            <div className="text-3xl font-bold mt-2">-</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Taux de candidature</div>
            <div className="text-3xl font-bold mt-2">-</div>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportData} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </Card>

        {/* Candidates List */}
        <Card className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="all" className="rounded-none">
                Tous ({filteredCandidates.length})
              </TabsTrigger>
              <TabsTrigger value="verified" className="rounded-none">
                Vérifiés
              </TabsTrigger>
              <TabsTrigger value="active" className="rounded-none">
                Actifs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Chargement des candidats...
                  </div>
                ) : filteredCandidates.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left py-3 px-6 font-semibold">Nom</th>
                        <th className="text-left py-3 px-6 font-semibold">Email</th>
                        <th className="text-left py-3 px-6 font-semibold">Profession</th>
                        <th className="text-left py-3 px-6 font-semibold">Expérience</th>
                        <th className="text-left py-3 px-6 font-semibold">Inscription</th>
                        <th className="text-left py-3 px-6 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((candidate) => (
                        <tr
                          key={candidate.id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="py-3 px-6 font-medium">
                            {candidate.full_name || "N/A"}
                          </td>
                          <td className="py-3 px-6 text-sm">{candidate.email}</td>
                          <td className="py-3 px-6 text-sm">
                            {candidate.profession || "-"}
                          </td>
                          <td className="py-3 px-6 text-sm">
                            {candidate.experience_years
                              ? `${candidate.experience_years} ans`
                              : "-"}
                          </td>
                          <td className="py-3 px-6 text-sm text-muted-foreground">
                            {candidate.created_at
                              ? new Date(candidate.created_at).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                              >
                                <Mail className="h-4 w-4" />
                                Contacter
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(candidate.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Aucun candidat trouvé
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="verified" className="p-8 text-center text-muted-foreground">
              À venir: Affichage des candidats vérifiés
            </TabsContent>

            <TabsContent value="active" className="p-8 text-center text-muted-foreground">
              À venir: Affichage des candidats actifs
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
