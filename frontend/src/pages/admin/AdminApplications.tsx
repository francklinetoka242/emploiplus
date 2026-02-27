// src/pages/admin/AdminApplications.tsx
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, Download, Search, Eye } from "lucide-react";
import { authHeaders } from "@/lib/headers";
import { toast } from "sonner";

interface Application {
  id: number;
  job_id: number;
  applicant_id: number;
  applicant_name: string;
  applicant_email: string;
  job_title: string;
  job_company: string;
  status: string;
  created_at: string;
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, applications]);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/job-applications", {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur chargement candidatures");
      const data = await res.json();
      setApplications(data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast.error("Erreur lors du chargement des candidatures");
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job_company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApps(filtered);
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/job-applications/${id}`, {
        method: "PATCH",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
      toast.success("Statut mis à jour");
    } catch (err) {
      console.error("Error updating application:", err);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const exportData = () => {
    const csv = [
      ["ID", "Candidat", "Email", "Poste", "Entreprise", "Statut", "Date"],
      ...filteredApps.map((app) => [
        app.id,
        app.applicant_name || "",
        app.applicant_email || "",
        app.job_title || "",
        app.job_company || "",
        app.status || "pending",
        new Date(app.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidatures.csv";
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const pendingCount = applications.filter((a) => a.status === "pending" || !a.status).length;
  const validatedCount = applications.filter((a) => a.status === "validated").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <CheckCircle className="h-8 w-8" />
            Supervision des candidatures
          </h1>
          <p className="text-muted-foreground">
            Gérez et suivez toutes les candidatures des utilisateurs
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Total candidatures</div>
            <div className="text-3xl font-bold mt-2">{applications.length}</div>
          </Card>
          <Card className="p-6 border-l-4 border-l-yellow-500">
            <div className="text-sm text-muted-foreground">En attente</div>
            <div className="text-3xl font-bold mt-2 text-yellow-600">{pendingCount}</div>
          </Card>
          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="text-sm text-muted-foreground">Acceptées</div>
            <div className="text-3xl font-bold mt-2 text-green-600">{validatedCount}</div>
          </Card>
          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="text-sm text-muted-foreground">Rejetées</div>
            <div className="text-3xl font-bold mt-2 text-red-600">{rejectedCount}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher candidat, poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Acceptées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportData} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </Card>

        {/* Applications Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Chargement des candidatures...
              </div>
            ) : filteredApps.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold">Candidat</th>
                    <th className="text-left py-3 px-6 font-semibold">Poste</th>
                    <th className="text-left py-3 px-6 font-semibold">Entreprise</th>
                    <th className="text-left py-3 px-6 font-semibold">Statut</th>
                    <th className="text-left py-3 px-6 font-semibold">Date candidature</th>
                    <th className="text-left py-3 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-6">
                        <div>
                          <p className="font-medium">
                            {app.applicant_name || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {app.applicant_email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-6 font-medium">{app.job_title || "N/A"}</td>
                      <td className="py-3 px-6">{app.job_company || "N/A"}</td>
                      <td className="py-3 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status === "validated"
                            ? "Acceptée"
                            : app.status === "rejected"
                            ? "Rejetée"
                            : "En attente"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <Select
                            value={app.status || "pending"}
                            onValueChange={(val) => updateStatus(app.id, val)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="validated">Accepter</SelectItem>
                              <SelectItem value="rejected">Rejeter</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Aucune candidature trouvée
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
