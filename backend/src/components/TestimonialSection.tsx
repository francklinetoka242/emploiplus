import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { authHeaders } from "@/lib/headers";

interface Testimonial {
  id: number;
  user_id: number;
  full_name: string;
  company_name?: string;
  user_type: string;
  profile_image_url?: string;
  rating: number;
  content: string;
  position?: string;
  created_at: string;
}

export default function TestimonialSection() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [userTestimonial, setUserTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [position, setPosition] = useState("");

  // Fetch testimonials
  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);

        // Find user's testimonial if logged in
        if (user) {
          const userTestim = data.find((t: Testimonial) => t.user_id === user.id);
          if (userTestim) {
            setUserTestimonial(userTestim);
            setRating(userTestim.rating);
            setContent(userTestim.content);
            setPosition(userTestim.position || "");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Le contenu de l'avis est obligatoire");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Le rating doit être entre 1 et 5");
      return;
    }

    setSubmitting(true);
    try {
      const headers = authHeaders("application/json");
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers,
        body: JSON.stringify({
          rating,
          content,
          position: position || null,
        }),
      });

      if (res.ok) {
        toast.success("Avis ajouté/mis à jour avec succès!");
        setShowForm(false);
        // Reset form
        setRating(5);
        setContent("");
        setPosition("");
        // Refresh testimonials
        await fetchTestimonials();
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur lors de l'ajout de l'avis");
      }
    } catch (err) {
      toast.error("Erreur serveur");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userTestimonial) return;

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre avis?")) return;

    setSubmitting(true);
    try {
      const headers = authHeaders();
      const res = await fetch(`/api/testimonials/${userTestimonial.id}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        toast.success("Avis supprimé");
        setUserTestimonial(null);
        setShowForm(false);
        setRating(5);
        setContent("");
        setPosition("");
        await fetchTestimonials();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (err) {
      toast.error("Erreur serveur");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">Ce que disent nos utilisateurs</h2>
          <p className="text-muted-foreground">Des milliers de personnes nous font confiance</p>
        </div>

        {/* Testimonial Form - only show if user is logged in */}
        {user && (
          <div className="max-w-3xl mx-auto mb-12">
            {!showForm && testimonials.length === 0 ? (
              <Card className="p-6 text-center space-y-4 bg-primary/5 border-primary/20">
                <h3 className="text-lg font-semibold">Partagez votre expérience</h3>
                <p className="text-muted-foreground">Votre avis aide d'autres utilisateurs à découvrir Emploi+</p>
                <Button onClick={() => setShowForm(true)} className="bg-primary text-white">
                  {userTestimonial ? "Modifier mon avis" : "Ajouter mon avis"}
                </Button>
              </Card>
            ) : !showForm && testimonials.length > 0 ? (
              <div className="text-center">
                <Button onClick={() => setShowForm(true)} variant="outline">
                  {userTestimonial ? "Modifier mon avis" : "Ajouter mon avis"}
                </Button>
              </div>
            ) : (
              <Card className="p-6 space-y-4 border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {userTestimonial ? "Modifier votre avis" : "Partager votre avis"}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* User Info Display */}
                  <div className="bg-background p-3 rounded border space-y-2">
                    <p className="text-sm font-semibold">
                      {user.user_type === "company"
                        ? `Entreprise: ${user.company_name || user.full_name}`
                        : `Utilisateur: ${user.full_name}`}
                    </p>
                    {user.user_type === "candidate" && position && (
                      <p className="text-sm text-muted-foreground">Poste actuel</p>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Note *</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRating(r)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              r <= rating
                                ? "fill-secondary text-secondary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium">
                      Poste/Fonction (optionnel)
                    </Label>
                    <Input
                      id="position"
                      placeholder="Ex: Développeuse Web, Directrice RH..."
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium">
                      Votre avis *
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Partagez votre expérience avec Emploi+... (minimum 10 caractères)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {content.length} caractères
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-primary text-white"
                    >
                      {submitting ? "Envoi..." : "Envoyer mon avis"}
                    </Button>
                    {userTestimonial && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={submitting}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* Display Testimonials */}
        {loading ? (
          <div className="text-center text-muted-foreground">Chargement des avis...</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Aucun avis pour le moment. {!user && "Connectez-vous pour ajouter le vôtre!"}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className={`p-6 space-y-4 ${
                  userTestimonial?.id === testimonial.id ? "border-primary/40 bg-primary/5" : ""
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-secondary text-secondary"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground italic">
                  "{testimonial.content}"
                </p>

                {/* Author Info */}
                <div className="pt-4 border-t space-y-1">
                  <p className="font-semibold text-sm">
                    {testimonial.user_type === "company"
                      ? testimonial.company_name || testimonial.full_name
                      : testimonial.full_name}
                  </p>
                  {testimonial.position && (
                    <p className="text-xs text-muted-foreground">
                      {testimonial.position}
                    </p>
                  )}
                  {testimonial.user_type === "company" && (
                    <p className="text-xs text-secondary font-medium">Entreprise</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
