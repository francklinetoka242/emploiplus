import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Publication {
  id: number;
  title: string;
  creator_id: number;
  created_at: string;
  views?: number;
}

interface Portfolio {
  id: number;
  title: string;
  service_category: string;
  featured: boolean;
  created_at: string;
}

export const ContentManagement = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("publications");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

      // Fetch publications
      const pubResponse = await fetch("/api/publications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pubResponse.ok) {
        const pubData = await pubResponse.json();
        setPublications(Array.isArray(pubData) ? pubData : []);
      }

      // Fetch portfolios
      const portResponse = await fetch("/api/portfolios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (portResponse.ok) {
        const portData = await portResponse.json();
        setPortfolios(Array.isArray(portData) ? portData : []);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Erreur lors du chargement du contenu");
    } finally {
      setLoading(false);
    }
  };

  const deletePublication = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette publication?")) return;

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/publications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Publication supprimée");
      fetchContent();
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const deletePortfolio = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce portfolio?")) return;

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/portfolios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Portfolio supprimé");
      fetchContent();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const togglePortfolioFeatured = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const portfolio = portfolios.find(p => p.id === id);
      if (!portfolio) return;

      const response = await fetch(`/api/portfolios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...portfolio, featured: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast.success("Portfolio mis à jour");
      fetchContent();
    } catch (error) {
      console.error("Error updating portfolio:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion du contenu</h2>
        <Button onClick={fetchContent} variant="outline">
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Publications</p>
              <p className="text-3xl font-bold">{publications.length}</p>
            </div>
            <FileText className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Portfolios</p>
              <p className="text-3xl font-bold">{portfolios.length}</p>
            </div>
            <FileText className="h-12 w-12 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="publications">Publications ({publications.length})</TabsTrigger>
          <TabsTrigger value="portfolios">Portfolios ({portfolios.length})</TabsTrigger>
        </TabsList>

        {/* Publications Tab */}
        <TabsContent value="publications" className="mt-6">
          <Card className="p-6">
            {publications.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucune publication trouvée</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left py-3 px-4">Titre</th>
                      <th className="text-left py-3 px-4">Auteur</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-center py-3 px-4">Vues</th>
                      <th className="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publications.map(pub => (
                      <tr key={pub.id} className="border-b hover:bg-muted/50 transition">
                        <td className="py-3 px-4 font-medium">{pub.title}</td>
                        <td className="py-3 px-4 text-muted-foreground">ID: {pub.creator_id}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {new Date(pub.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {pub.views || 0}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePublication(pub.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Portfolios Tab */}
        <TabsContent value="portfolios" className="mt-6">
          <Card className="p-6">
            {portfolios.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun portfolio trouvé</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map(port => (
                  <div key={port.id} className="p-4 border rounded-lg hover:shadow-lg transition">
                    <div className="mb-3">
                      {port.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                          ⭐ En vedette
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold mb-2">{port.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {port.service_category}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {new Date(port.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePortfolioFeatured(port.id, port.featured)}
                        className="flex-1"
                      >
                        {port.featured ? "Retirer" : "En vedette"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePortfolio(port.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
