/**
 * Composant CommentsSection
 * Section de commentaires avec filtre de profanité intégré
 * Réutilisable pour tous les posts
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ProfanityWarningModal } from "@/components/ui/ProfanityWarningModal";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { authHeaders } from "@/lib/headers";
import { Send, Trash2, MessageCircle } from "lucide-react";

interface Comment {
  id: number;
  author_id: number;
  author_name?: string;
  author_profile_image?: string;
  author_title?: string; // Titre du poste
  is_publication_author?: boolean; // Indique si c'est l'auteur de la publication
  content: string;
  created_at: string;
  publication_id: number;
}

interface CommentsComponentProps {
  publicationId: number;
  comments: Comment[];
  onCommentAdded?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: number) => void;
}

export const CommentsSection: React.FC<CommentsComponentProps> = ({
  publicationId,
  comments: initialComments,
  onCommentAdded,
  onCommentDeleted,
}) => {
  const { user } = useAuth();
  const { filterContent, warningCount, isTemporarilySuspended, getRemainingLiftTime } = useProfanityFilter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [profanityWarningOpen, setProfanityWarningOpen] = useState(false);
  const [blockedWords, setBlockedWords] = useState<string[]>([]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    // Vérifier le filtre de profanité
    const filterResult = filterContent(newComment);
    if (filterResult.isBlocked) {
      setBlockedWords(filterResult.triggeredWords);
      setProfanityWarningOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/publications/${publicationId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Erreur création commentaire");
      }

      const newCommentData = await res.json();
      setComments([...comments, newCommentData]);
      setNewComment("");
      toast.success("Commentaire ajouté");

      if (onCommentAdded) {
        onCommentAdded(newCommentData);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de l'ajout du commentaire");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire?")) {
      return;
    }

    try {
      const res = await fetch(`/api/publications/${publicationId}/comments/${commentId}`, {
        method: "DELETE",
        headers: authHeaders("application/json"),
      });

      if (!res.ok) {
        throw new Error("Erreur suppression commentaire");
      }

      setComments(comments.filter((c) => c.id !== commentId));
      toast.success("Commentaire supprimé");

      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la suppression");
    }
  };

  const handleProfanityWarningModify = () => {
    setProfanityWarningOpen(false);
    // Le contenu reste dans la textarea pour édition
  };

  const handleProfanityWarningCancel = () => {
    setProfanityWarningOpen(false);
    setNewComment("");
    setBlockedWords([]);
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Bouton pour toggle commentaires */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{comments.length} commentaire{comments.length !== 1 ? "s" : ""}</span>
      </button>

      {showComments && (
        <div className="space-y-4 pt-4 border-t">
          {/* Formulaire d'ajout de commentaire */}
          {!isTemporarilySuspended && (
            <form onSubmit={handleAddComment} className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.profile_image_url} alt={user?.full_name} />
                  <AvatarFallback className="text-xs">
                    {(user?.full_name || user?.company_name || "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={loading || !newComment.trim()}
                      className="gap-2"
                    >
                      <Send className="h-3 w-3" />
                      Commenter
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {isTemporarilySuspended && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                Votre compte est temporairement suspendu pour commentaires en raison de violations des règles de
                communauté.
              </p>
            </div>
          )}

          {/* Liste des commentaires */}
          {comments.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-3 border-0 bg-muted/30">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.author_profile_image} alt={comment.author_name} />
                      <AvatarFallback className="text-xs">
                        {(comment.author_name || "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{comment.author_name}</p>
                          {comment.author_title && (
                            <p className="text-xs text-muted-foreground italic">
                              {comment.author_title}
                            </p>
                          )}
                          {comment.is_publication_author && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              Propriétaire
                            </span>
                          )}
                        </div>
                        {user?.id === comment.author_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="Supprimer le commentaire"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : showComments ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun commentaire pour le moment</p>
          ) : null}
        </div>
      )}

      {/* Modale d'avertissement de contenu profane */}
      <ProfanityWarningModal
        isOpen={profanityWarningOpen}
        onModify={handleProfanityWarningModify}
        onCancel={handleProfanityWarningCancel}
        triggeredWords={blockedWords}
        warningCount={warningCount}
        isTemporarilySuspended={isTemporarilySuspended}
        remainingTime={getRemainingLiftTime()}
      />
    </div>
  );
};
