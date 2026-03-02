// src/pages/admin/AdminCompanies.tsx
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Search, Download, Mail, Trash2, Eye } from "lucide-react";
import { authHeaders } from "@/lib/headers";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Company {
  id: number;
  company_name: string;
  email: string;
  phone?: string;
  company_address?: string;
  user_type: string;
  created_at?: string;
}

export default function AdminCompanies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/users", {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur chargement entreprises");
      const data = await res.json();
      const comps = data.filter((u: any) =>
        u.user_type?.toLowerCase() === "company" ||
        u.user_type?.toLowerCase() === "entreprise"
      );
      setCompanies(comps);
      setFilteredCompanies(comps);
    } catch (err) {
      console.error("Error fetching companies:", err);
      toast.error("Erreur lors du chargement des entreprises");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = companies.filter((c) =>
      c.company_name?.toLowerCase().includes(value.toLowerCase()) ||
      c.email?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur suppression");
      setCompanies(companies.filter((c) => c.id !== id));
      setFilteredCompanies(filteredCompanies.filter((c) => c.id !== id));
      toast.success("Entreprise supprimée");
    } catch (err) {
      console.error("Error deleting company:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const exportData = () => {
    const csv = [
      ["ID", "Nom Entreprise", "Email", "Téléphone", "Adresse", "Date inscription"],
      ...filteredCompanies.map((c) => [
        c.id,
        c.company_name || "",
        c.email || "",
        c.phone || "",
        c.company_address || "",
        c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "entreprises.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            Supervision des entreprises
          </h1>
          <p className="text-muted-foreground">
            Gérez et supervisez toutes les entreprises de la plateforme
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Total entreprises</div>
            <div className="text-3xl font-bold mt-2">{companies.length}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Offres publiées</div>
            <div className="text-3xl font-bold mt-2">-</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Candidatures reçues</div>
            <div className="text-3xl font-bold mt-2">-</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Actives ce mois</div>
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

        {/* Companies List */}
        <Card className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="all" className="rounded-none">
                Toutes ({filteredCompanies.length})
              </TabsTrigger>
              <TabsTrigger value="verified" className="rounded-none">
                Vérifiées
              </TabsTrigger>
              <TabsTrigger value="active" className="rounded-none">
                Actives
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Chargement des entreprises...
                  </div>
                ) : filteredCompanies.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left py-3 px-6 font-semibold">
                          Nom Entreprise
                        </th>
                        <th className="text-left py-3 px-6 font-semibold">Email</th>
                        <th className="text-left py-3 px-6 font-semibold">Téléphone</th>
                        <th className="text-left py-3 px-6 font-semibold">Adresse</th>
                        <th className="text-left py-3 px-6 font-semibold">
                          Inscription
                        </th>
                        <th className="text-left py-3 px-6 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => (
                        <tr
                          key={company.id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="py-3 px-6 font-medium">
                            {company.company_name || "N/A"}
                          </td>
                          <td className="py-3 px-6 text-sm">{company.email}</td>
                          <td className="py-3 px-6 text-sm">
                            {company.phone || "-"}
                          </td>
                          <td className="py-3 px-6 text-sm">
                            {company.company_address || "-"}
                          </td>
                          <td className="py-3 px-6 text-sm text-muted-foreground">
                            {company.created_at
                              ? new Date(company.created_at).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() =>
                                  navigate(`/admin/companies/${company.id}`)
                                }
                              >
                                <Eye className="h-4 w-4" />
                                Voir
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                              >
                                <Mail className="h-4 w-4" />
                                Email
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(company.id)}
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
                    Aucune entreprise trouvée
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="verified" className="p-8 text-center text-muted-foreground">
              À venir: Affichage des entreprises vérifiées
            </TabsContent>

            <TabsContent value="active" className="p-8 text-center text-muted-foreground">
              À venir: Affichage des entreprises actives
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
