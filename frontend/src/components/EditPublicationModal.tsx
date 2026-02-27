import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { authHeaders } from '@/lib/headers';

interface Publication {
  id: number;
  content: string;
  category?: string;
  achievement?: string;
  image_url?: string;
}

interface EditPublicationModalProps {
  publication: Publication | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPublication: Publication) => void;
}

export function EditPublicationModal({ 
  publication, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditPublicationModalProps) {
  const [content, setContent] = useState(publication?.content || '');
  const [category, setCategory] = useState(publication?.category || 'conseil');
  const [achievement, setAchievement] = useState(publication?.achievement || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(publication?.image_url || '');
  const [loading, setLoading] = useState(false);

  // Update form when publication changes
  useEffect(() => {
    if (publication) {
      setContent(publication.content);
      setCategory(publication.category || 'conseil');
      setAchievement(publication.achievement || '');
      setImagePreview(publication.image_url || '');
      setSelectedImage(null);
    }
  }, [publication]);

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

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publication) return;

    if (!content.trim()) {
      toast.error('Le contenu ne peut pas être vide');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        content: content.trim(),
        category,
        achievement: achievement.trim() || null,
      };

      // Handle image upload if new image selected
      if (selectedImage) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Image = reader.result as string;
          payload.image_url = base64Image;

          // Make the API call with image
          const response = await fetch(
            `/api/publications/${publication.id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
          }

          const updated = await response.json();
          toast.success('Publication modifiée avec succès');
          onSuccess(updated);
          onClose();
        };
        reader.readAsDataURL(selectedImage);
      } else {
        // Make the API call without image
        const response = await fetch(
          `/api/publications/${publication.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders(),
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour');
        }

        const updated = await response.json();
        toast.success('Publication modifiée avec succès');
        onSuccess(updated);
        onClose();
      }
    } catch (error) {
      console.error('Edit error:', error);
      toast.error('Erreur lors de la modification de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier la publication</DialogTitle>
          <DialogDescription>
            Modifiez le contenu, la catégorie et l'image de votre publication
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="edit-content">Contenu</Label>
            <Textarea
              id="edit-content"
              placeholder="Partagez vos actualités professionnelles..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 resize-none"
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Catégorie</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger id="edit-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conseil">💡 Conseil</SelectItem>
                <SelectItem value="annonce">📢 Annonce</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Achievement */}
          <div className="space-y-2">
            <Label htmlFor="edit-achievement">Opportunité spéciale (optionnel)</Label>
            <Input
              id="edit-achievement"
              placeholder="ex: Offre d'emploi disponible, Stage offert..."
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-2">
              <Label>Aperçu de l'image</Label>
              <div className="relative w-full rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="edit-image">Changer l'image</Label>
            <label htmlFor="edit-image" className="cursor-pointer flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors">
              <div className="flex flex-col items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-sm text-gray-600">Cliquez pour changer l'image</span>
              </div>
              <input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-gradient-primary hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Mettre à jour
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
