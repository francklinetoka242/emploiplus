import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Trash2,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  MessageCircle,
  User,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

// ============ TYPES & INTERFACES ============

interface Publication {
  id: number;
  title: string;
  content: string;
  creator_id: number;
  creator_name?: string;
  creator_avatar?: string;
  created_at: string;
  updated_at?: string;
  is_pinned: boolean;
  is_visible: boolean;
  likes_count?: number;
  comments_count?: number;
  image_url?: string;
  type?: string; // 'post', 'achievement', 'testimonial'
}

interface ModerationStats {
  total_publications: number;
  pinned_count: number;
  hidden_count: number;
  recent_count: number;
}

// ============ COMPONENT ============

const ModerateContent = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const queryClient = useQueryClient();

  // Fetch publications
  const { data: publications = [], isLoading } = useQuery({
    queryKey: ["moderatePublications", activeTab, filterBy],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/publications?status=${activeTab}&filter=${filterBy}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch publications");
      return response.json() as Promise<Publication[]>;
    },
    refetchInterval: 30000,
  });

  // Fetch moderation stats
  const { data: stats } = useQuery({
    queryKey: ["moderationStats"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch("/api/admin/publications/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json() as Promise<ModerationStats>;
    },
  });

  // Delete publication
  const deletePublicationMutation = useMutation({
    mutationFn: async (publicationId: number) => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/admin/publications/${publicationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete publication");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderatePublications"] });
      queryClient.invalidateQueries({ queryKey: ["moderationStats"] });
      toast.success("Publication supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  // Toggle pin publication
  const togglePinMutation = useMutation({
    mutationFn: async ({
      publicationId,
      isPinned,
    }: {
      publicationId: number;
      isPinned: boolean;
    }) => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/admin/publications/${publicationId}/pin`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_pinned: !isPinned }),
      });
      if (!response.ok) throw new Error("Failed to pin publication");
      return response.json();
    },
    onSuccess: (_, { isPinned }) => {
      queryClient.invalidateQueries({ queryKey: ["moderatePublications"] });
      queryClient.invalidateQueries({ queryKey: ["moderationStats"] });
      toast.success(isPinned ? "Publication dépinglée" : "Publication épinglée en haut");
    },
    onError: () => toast.error("Erreur lors de l'épinglage"),
  });

  // Toggle publication visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({
      publicationId,
      isVisible,
    }: {
      publicationId: number;
      isVisible: boolean;
    }) => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/admin/publications/${publicationId}/visibility`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_visible: !isVisible }),
      });
      if (!response.ok) throw new Error("Failed to toggle visibility");
      return response.json();
    },
    onSuccess: (_, { isVisible }) => {
      queryClient.invalidateQueries({ queryKey: ["moderatePublications"] });
      toast.success(isVisible ? "Publication cachée" : "Publication visible");
    },
    onError: () => toast.error("Erreur lors du changement de visibilité"),
  });

  // Filter publications
  const filteredPublications = publications.filter((pub) =>
    pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pub.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== PUBLICATION CARD COMPONENT =====
  const PublicationCard = ({ pub }: { pub: Publication }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {pub.type || "Post"}
              </span>
              {pub.is_pinned && (
                <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                  <Pin className="h-3 w-3" /> Épinglé
                </span>
              )}
              {!pub.is_visible && (
                <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1">
                  <EyeOff className="h-3 w-3" /> Caché
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold">{pub.title}</h3>
          </div>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="font-medium">{pub.creator_name || "Utilisateur inconnu"}</span>
          <Calendar className="h-4 w-4 ml-2" />
          <span>{new Date(pub.created_at).toLocaleDateString("fr-FR")}</span>
        </div>

        {/* Content */}
        <div className="text-sm text-foreground line-clamp-3">
          {pub.content}
        </div>

        {/* Image */}
        {pub.image_url && (
          <img
            src={pub.image_url}
            alt={pub.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {pub.likes_count !== undefined && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-200"></div>
              <span>{pub.likes_count} likes</span>
            </div>
          )}
          {pub.comments_count !== undefined && (
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>{pub.comments_count} commentaires</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap pt-4 border-t">
          {/* Pin/Unpin Button */}
          <Button
            variant={pub.is_pinned ? "destructive" : "outline"}
            size="sm"
            onClick={() =>
              togglePinMutation.mutate({
                publicationId: pub.id,
                isPinned: pub.is_pinned,
              })
            }
            disabled={togglePinMutation.isPending}
            className="flex items-center gap-2"
          >
            {pub.is_pinned ? (
              <>
                <PinOff className="h-4 w-4" /> Dépingler
              </>
            ) : (
              <>
                <Pin className="h-4 w-4" /> Épingler
              </>
            )}
          </Button>

          {/* Toggle Visibility Button */}
          <Button
            variant={pub.is_visible ? "outline" : "default"}
            size="sm"
            onClick={() =>
              toggleVisibilityMutation.mutate({
                publicationId: pub.id,
                isVisible: pub.is_visible,
              })
            }
            disabled={toggleVisibilityMutation.isPending}
            className="flex items-center gap-2"
          >
            {pub.is_visible ? (
              <>
                <EyeOff className="h-4 w-4" /> Cacher
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Afficher
              </>
            )}
          </Button>

          {/* Delete Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
                deletePublicationMutation.mutate(pub.id);
              }
            }}
            disabled={deletePublicationMutation.isPending}
            className="flex items-center gap-2 ml-auto"
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Chargement du fil d'actualité...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Modération du Fil d'Actualité</h2>
        <p className="text-muted-foreground mt-1">
          Gérez tous les posts, commentaires et contenu utilisateur en temps réel
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total publications</p>
            <p className="text-3xl font-bold mt-2">{stats.total_publications}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Épinglées</p>
            <p className="text-3xl font-bold mt-2 text-orange-600">{stats.pinned_count}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Cachées</p>
            <p className="text-3xl font-bold mt-2 text-red-600">{stats.hidden_count}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">24 dernières heures</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.recent_count}</p>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou contenu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">Tous les types</option>
            <option value="post">Posts</option>
            <option value="achievement">Réalisations</option>
            <option value="testimonial">Témoignages</option>
          </select>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous ({filteredPublications.length})</TabsTrigger>
          <TabsTrigger value="pinned">
            <Pin className="h-4 w-4 mr-2" /> Épinglés
          </TabsTrigger>
          <TabsTrigger value="hidden">
            <EyeOff className="h-4 w-4 mr-2" /> Cachés
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Calendar className="h-4 w-4 mr-2" /> Récents
          </TabsTrigger>
        </TabsList>

        {/* All Publications Tab */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredPublications.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune publication trouvée</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPublications.map((pub) => (
                <PublicationCard key={pub.id} pub={pub} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pinned Tab */}
        <TabsContent value="pinned" className="space-y-4 mt-6">
          {filteredPublications.filter((p) => p.is_pinned).length === 0 ? (
            <Card className="p-12 text-center">
              <Pin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune publication épinglée</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPublications
                .filter((p) => p.is_pinned)
                .map((pub) => (
                  <PublicationCard key={pub.id} pub={pub} />
                ))}
            </div>
          )}
        </TabsContent>

        {/* Hidden Tab */}
        <TabsContent value="hidden" className="space-y-4 mt-6">
          {filteredPublications.filter((p) => !p.is_visible).length === 0 ? (
            <Card className="p-12 text-center">
              <EyeOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune publication cachée</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPublications
                .filter((p) => !p.is_visible)
                .map((pub) => (
                  <PublicationCard key={pub.id} pub={pub} />
                ))}
            </div>
          )}
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="recent" className="space-y-4 mt-6">
          {filteredPublications.slice(0, 10).length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune publication récente</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPublications.slice(0, 10).map((pub) => (
                <PublicationCard key={pub.id} pub={pub} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Conseil :</strong> Utilisez les filtres pour trouver rapidement les
            publications à modérer. Les posts épinglés apparaissent en haut du fil. Les posts
            cachés ne sont visibles que pour l'admin.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModerateContent;
