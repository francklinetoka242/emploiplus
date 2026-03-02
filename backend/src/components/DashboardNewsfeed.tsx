import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send, Heart, Share2, MessageCircle, Briefcase, Lightbulb, Trophy, Image as ImageIcon, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { authHeaders, buildApiUrl } from '@/lib/headers';
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NewsItem {
  id: number;
  type: 'article' | 'announcement' | 'success' | 'publication';
  title: string;
  content: string;
  image?: string;
  author?: string;
  user_name?: string;
  profile_image?: string;
  created_at: string;
  likes?: number;
  liked?: boolean;
  category?: string;
}

interface CommentModalState {
  isOpen: boolean;
  publicationId: number | null;
  content: string;
}

const DashboardNewsfeed = () => {
  const { user } = useAuth();
  const { role } = useUserRole(user);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [category, setCategory] = useState("conseil");
  const [commentModal, setCommentModal] = useState<CommentModalState>({
    isOpen: false,
    publicationId: null,
    content: ""
  });

  useEffect(() => {
    fetchNewsfeed();
  }, []);

  const fetchNewsfeed = async () => {
    setLoading(true);
    try {
      try {
        const res = await fetch(buildApiUrl('/publications'));
        if (res.ok) {
          const data = await res.json();
          setNews(Array.isArray(data) ? data : []);
          return;
        }
      } catch (err) {
        console.log("API not available, using demo data");
      }

      // Demo data if API not available
      setNews([
        {
          id: 1,
          type: 'article',
          title: '5 erreurs à éviter en entretien à Brazzaville',
          content: 'Découvrez les 5 erreurs les plus courantes que font les candidats lors de leurs entretiens d\'embauche et comment les éviter. Conseils pratiques basés sur les retours des recruteurs congolais.',
          author: 'Conseil Emploi+',
          user_name: 'Équipe Emploi+',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 124,
          liked: false,
          category: 'conseil'
        },
        {
          id: 2,
          type: 'success',
          title: '🎉 Félicitations à Arsène !',
          content: 'Arsène vient de décrocher un CDI de Développeur Full-Stack chez une entreprise de tech à Brazzaville ! Grâce à Emploi+ et son profil bien optimisé, il a réussi à impressionner les recruteurs.',
          author: 'Équipe Emploi+',
          user_name: 'Arsène Mbongo',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 89,
          liked: false
        },
        {
          id: 3,
          type: 'announcement',
          title: '🤝 Nouveau partenaire : TechHub Congo',
          content: 'Nous sommes fiers d\'annoncer TechHub Congo comme nouveau partenaire. Ils proposent des formations en informatique et des débouchés directs. Décourez les offres exclusives réservées à nos utilisateurs Emploi+.',
          author: 'Annonces Emploi+',
          user_name: 'Emploi+ Admin',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          likes: 67,
          liked: false,
          category: 'annonce'
        },
      ]);
    } catch (error) {
      console.error("Erreur chargement newsfeed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', newPost);
      formData.append('visibility', 'public');
      
      if (role === 'super_admin') {
        formData.append('category', category);
      }
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await fetch(buildApiUrl('/publications'), {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error('Erreur création publication');

      toast.success("Publication créée avec succès");
      setNewPost("");
      setSelectedImage(null);
      setImagePreview("");
      setCategory("conseil");
      await fetchNewsfeed();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la création de la publication");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (itemId: number) => {
    if (!user) {
      toast.error("Vous devez être connecté pour liker");
      return;
    }
    try {
      const res = await fetch(`/api/publications/${itemId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Utiliser les données du serveur directement au lieu de calculer en local
        setNews(news.map(n => 
          n.id === itemId 
            ? { 
                ...n, 
                liked: data.liked, 
                likes: data.likes_count
              }
            : n
        ));
        toast.success(data.liked ? "Publication aimée ✓" : "Like retiré");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Erreur lors du like");
      }
    } catch (error) {
      console.error("Erreur like:", error);
      toast.error("Erreur lors du like");
    }
  };

  const handleOpenComment = (publicationId: number) => {
    if (!user) {
      toast.error("Vous devez être connecté pour commenter");
      return;
    }
    setCommentModal({
      isOpen: true,
      publicationId,
      content: ""
    });
  };

  const handleCloseComment = () => {
    setCommentModal({
      isOpen: false,
      publicationId: null,
      content: ""
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentModal.publicationId || !commentModal.content.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/publications/${commentModal.publicationId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          content: commentModal.content
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de l'ajout du commentaire");
      }

      toast.success("Commentaire ajouté");
      handleCloseComment();
      await fetchNewsfeed();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de l'ajout du commentaire");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const canCreatePost = role === 'company' || role === 'super_admin' || role === 'candidate';
  const isAdmin = role === 'super_admin';

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Bienvenue sur votre fil d'actualité</h1>
            <p className="text-muted-foreground mt-2">Restez informé des opportunités, conseils et succès de la communauté Emploi+</p>
          </div>

          {/* Create Post Card - Style LinkedIn */}
          {canCreatePost && (
            <Card className="p-6 border-0 shadow-md">
              <form onSubmit={handleCreatePost} className="space-y-4">
                {/* User info header */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profile_image_url} alt={user?.full_name} />
                    <AvatarFallback>
                      {(user?.full_name || user?.company_name || "")
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{user?.full_name || user?.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role === 'candidate' ? "Candidat" : role === 'company' ? "Entreprise" : "Administrateur"}
                    </p>
                  </div>
                </div>

                {/* Text area */}
                <Textarea
                  placeholder="Partagez une actualité, un conseil ou une annonce..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={4}
                  className="resize-none border-0 bg-muted/50 focus:bg-white"
                />

                {/* Image preview */}
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Aperçu" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Admin category selection */}
                {isAdmin && (
                  <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label htmlFor="category" className="text-sm font-semibold">Catégorie</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conseil">💡 Conseil</SelectItem>
                        <SelectItem value="annonce">📢 Annonce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Actions bar */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <label className="cursor-pointer hover:bg-muted rounded-lg p-2 transition-colors flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    Ajouter une image
                  </label>
                  <Button
                    type="submit"
                    className="bg-gradient-primary hover:opacity-90"
                    disabled={submitting || !newPost.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publier
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* News Feed */}
          <div className="space-y-4">
            {news.length === 0 ? (
              <Card className="p-12 text-center border-0 shadow-md">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune actualité pour le moment. Revenez bientôt !</p>
              </Card>
            ) : (
              news.map((item) => (
                <Card key={item.id} className="p-6 border-0 shadow-md">
                  {/* Header with user info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={item.profile_image} />
                        <AvatarFallback>
                          {(item.user_name || item.author || "")
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.user_name || item.author}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {item.type === 'article' ? '💡 Conseil' : item.type === 'announcement' ? '📢 Annonce' : item.type === 'success' ? '🎉 Succès' : 'Publication'}
                          </span>
                          •
                          <span>
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title and Content */}
                  {item.title && <h3 className="text-base font-bold mb-2">{item.title}</h3>}
                  <p className="text-foreground whitespace-pre-wrap mb-4">{item.content}</p>

                  {/* Image */}
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-96 object-cover rounded-lg mb-4"
                    />
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 py-2 border-y">
                    <span>{item.likes || 0} J'aime</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-around gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleLike(item.id)}
                      className={`flex-1 ${item.liked ? 'text-red-500 hover:text-red-600' : ''}`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${item.liked ? 'fill-red-500' : ''}`} />
                      J'aime
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleOpenComment(item.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Commenter
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* CTA Section */}
          <Card className="p-8 bg-gradient-to-r from-primary to-secondary text-white text-center rounded-lg border-0 shadow-md">
            <h3 className="text-2xl font-bold mb-3">Prêt à transformer votre carrière ?</h3>
            <p className="text-white/90 mb-6">Créez un CV percutant, postulez à des offres et connectez-vous avec les meilleures entreprises congolaises.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button className="bg-white text-primary hover:bg-gray-100">
                Créer mon CV
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Voir les offres
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modale de commentaire */}
      {commentModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 border-0">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Ajouter un commentaire</h2>
            </div>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                placeholder="Écrivez votre commentaire..."
                value={commentModal.content}
                onChange={(e) => setCommentModal({ ...commentModal, content: e.target.value })}
                rows={4}
                className="resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseComment}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !commentModal.content.trim()}
                  className="bg-gradient-primary"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Envoi..." : "Commenter"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardNewsfeed;
