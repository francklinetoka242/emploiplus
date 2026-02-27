// src/components/admin/formations/FormationForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadFile } from '@/lib/upload';
import { Upload, X } from "lucide-react";

interface FormationFormProps {
  formation?: {
    id: string;
    title: string;
    category: string;
    level: string;
    duration: string;
    price: string;
    description: string;
    image_url?: string;
  };
  onSuccess: () => void;
}

export default function FormationForm({ formation, onSuccess }: FormationFormProps) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    level: "Débutant",
    duration: "",
    price: "",
    description: "",
    image: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(formation?.image_url || null);

  useEffect(() => {
    if (formation) {
      setForm({
        title: formation.title || "",
        category: formation.category || "",
        level: formation.level || "Débutant",
        duration: formation.duration || "",
        price: formation.price || "",
        description: formation.description || "",
        image: null,
      });
      setPreview(formation.image_url || null);
    }
  }, [formation]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Record<string, unknown> = {
      title: form.title,
      category: form.category,
      level: form.level,
      duration: form.duration,
      price: form.price,
      description: form.description,
    };

    const adminToken = localStorage.getItem('adminToken');

    // If an image file was provided, upload it first
    if (form.image) {
      try {
        const uploadedUrl = await uploadFile(form.image, adminToken, 'formations');
        payload.image_url = uploadedUrl;
      } catch (err) {
        console.error('Image upload failed', err);
        toast.error('Échec du téléchargement de l\'image');
        return;
      }
    }

    try {
      const url = formation ? `/api/formations/${formation.id}` : "/api/formations";
      const method = formation ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(formation ? "Formation modifiée !" : "Formation créée avec succès !");
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur");
      }
    } catch {
      toast.error("Serveur injoignable");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
      <h2 className="text-4xl font-bold text-center mb-10">
        {formation ? "Modifier la formation" : "Créer une nouvelle formation"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* IMAGE UPLOAD */}
        <div className="space-y-4">
          <Label>Image de la formation (facultatif)</Label>
          <div className="border-4 border-dashed rounded-2xl p-12 text-center hover:border-primary transition">
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Aperçu" className="mx-auto max-h-96 rounded-xl shadow-lg" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute -top-3 -right-3 rounded-full"
                  onClick={() => {
                    setPreview(null);
                    setForm({ ...form, image: null });
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="formation-image"
                />
                <Label htmlFor="formation-image" className="cursor-pointer">
                  <Button type="button" size="lg" variant="outline">
                    Choisir une image
                  </Button>
                </Label>
                <p className="text-sm text-muted-foreground mt-4">
                  JPG, PNG, WebP • Max 5 Mo • Recommandé : 1200x800px
                </p>
              </>
            )}
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Titre de la formation *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="ex: Développeur Fullstack React & Node.js"
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                placeholder="ex: Informatique, Marketing..."
              />
            </div>

            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Débutant">Débutant</SelectItem>
                  <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                  <SelectItem value="Avancé">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Durée *</Label>
              <Input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                required
                placeholder="ex: 3 mois, 6 semaines..."
              />
            </div>

            <div className="space-y-2">
              <Label>Prix (FCFA) - facultatif</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="150 000"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description complète *</Label>
          <Textarea
            rows={12}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            placeholder="Décrivez le programme, les objectifs, les prérequis..."
          />
        </div>

        <div className="flex justify-center gap-6 pt-10">
          <Button type="button" variant="outline" size="lg" onClick={onSuccess}>
            Annuler
          </Button>
          <Button type="submit" size="lg" className="px-12">
            {formation ? "Enregistrer" : "Publier"} la formation
          </Button>
        </div>
      </form>
    </div>
  );
}