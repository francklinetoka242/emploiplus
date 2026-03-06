// src/components/admin/jobs/JobForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadFile } from '@/lib/upload';
import { Upload, X, Briefcase } from "lucide-react";
import { JobData } from "@/lib/api";

interface Job extends Omit<JobData, "sector"> {
  id: string;
  published: boolean;
  created_at: string;
  image_url?: string;
  sector: string;
  application_url?: string;
}

interface JobFormProps {
  job?: Job;
  onSuccess: () => void;
}

export default function JobForm({ job, onSuccess }: JobFormProps) {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    sector: "",
    type: "CDI",
    salary: "",
    description: "",
    requirements: "",
    application_url: "",
    application_email: "",
    application_via_emploi: false,
    image: null as File | null,
    deadline_date: '' as string | '',
    experience_level: "",
  });

  const [preview, setPreview] = useState<string | null>(job?.image_url || null);

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || "",
        company: job.company || (job.company_id ? "[Entreprise supprimée - veuillez en sélectionner une nouvelle]" : ""),
        location: job.location || "",
        sector: job.sector || "",
        type: job.type || "CDI",
        salary: job.salary || "",
        description: job.description || "",
        requirements: job.requirements || "",
        application_url: job.application_url || "",
        application_email: job.application_email || "",
        application_via_emploi: job.application_via_emploi || false,
        image: null,
        deadline_date: job.deadline_date ? String(job.deadline_date).split('T')[0] : '',
        experience_level: job.experience_level || "",
      });
      setPreview(job.image_url || null);
    }
  }, [job]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map form fields to admin API schema
    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      type: form.type, // CDI, CDD, Stage, Freelance
      location: form.location,
      company: form.company,
      sector: form.sector,
      requirements: form.requirements || null,
      experience_level: form.experience_level || null,
      application_url: form.application_url || null,
      application_email: form.application_email || null,
      application_via_emploi: !!form.application_via_emploi,
      deadline_date: form.deadline_date || null,
      // Parse salary range
      ...(form.salary && { 
        salary: form.salary,
        salary_min: parseInt(String(form.salary).split('-')[0].trim()) || null,
        salary_max: parseInt(String(form.salary).split('-')[1]?.trim() || form.salary) || null,
      }),
      // Status fields for admin
      // newly created offers are published immediately so they show up
      // both in the admin listing and on the public /emplois page.
      published: true,
      is_closed: false,
    };

    const adminToken = localStorage.getItem('adminToken');

    // Upload image if provided
    if (form.image) {
      try {
        const uploaded = await uploadFile(form.image, adminToken, 'jobs');
        payload.image_url = uploaded;
      } catch (err) {
        console.error('Upload error:', err);
        toast.error('Erreur lors du téléchargement de l\'image');
        return;
      }
    }

    try {
      const url = job ? `/api/admin/jobs/${job.id}` : "/api/admin/jobs";
      const method = job ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(job ? "Offre modifiée !" : "Offre créée avec succès !");
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.message || error.error || "Erreur");
      }
    } catch {
      toast.error("Serveur injoignable");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
      <div className="text-center mb-12">
        <Briefcase className="h-20 w-20 mx-auto text-primary mb-6" />
        <h2 className="text-4xl font-bold">
          {job ? "Modifier l'offre" : "Créer une nouvelle offre d'emploi"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* IMAGE UPLOAD */}
        <div className="space-y-4">
          <Label>Image de l'offre (facultatif)</Label>
          <div className="border-4 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-primary transition">
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
                  id="job-image"
                />
                <Label htmlFor="job-image" className="cursor-pointer">
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
              <Label>Intitulé du poste *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="ex: Développeur Fullstack React & Node.js"
              />
            </div>

            <div className="space-y-2">
              <Label>Entreprise *</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
                placeholder="ex: Orange Congo, MTN..."
              />
            </div>

            <div className="space-y-2">
              <Label>Lieu *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                placeholder="ex: Brazzaville, Pointe-Noire..."
              />
            </div>

            <div className="space-y-2">
              <Label>Type de contrat</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Secteur (facultatif)</Label>
              <Input
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                placeholder="ex: Informatique, Marketing, Finance..."
              />
            </div>

            <div className="space-y-2">
              <Label>Niveau d'expérience (facultatif)</Label>
              <Input
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                placeholder="ex: Junior, Senior, Expert..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Salaire (facultatif)</Label>
              <Input
                value={form.salary}
               onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="ex: 500 000 - 800 000 FCFA"
              />
            </div>

            <div className="space-y-2">
              <Label>Date limite de candidature (facultatif)</Label>
              <Input
                type="date"
                value={form.deadline_date}
                onChange={(e) => setForm({ ...form, deadline_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>URL de candidature (facultatif)</Label>
              <Input
                type="url"
                value={form.application_url}
                onChange={(e) => setForm({ ...form, application_url: e.target.value })}
                placeholder="https://example.com/apply"
              />
            </div>

            <div className="space-y-2">
              <Label>Email de candidature (facultatif)</Label>
              <Input
                type="email"
                value={form.application_email || ""}
                onChange={(e) => setForm({ ...form, application_email: e.target.value })}
                placeholder="recrutement@entreprise.com"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="application_via_emploi"
                  checked={form.application_via_emploi}
                  onChange={(e) => setForm({ ...form, application_via_emploi: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="application_via_emploi" className="m-0 cursor-pointer">
                  Activer candidature via EmploiPlus
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Compétences requises (facultatif)</Label>
          <Textarea
            rows={4}
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            placeholder="Listez les compétences requises, un par ligne..."
          />
        </div>

        <div className="space-y-2">
          <Label>Description complète (facultatif)</Label>
          <Textarea
            rows={12}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Décrivez les missions, compétences requises, avantages..."
          />
        </div>

        <div className="flex justify-center gap-6 pt-10">
          <Button type="button" variant="outline" size="lg" onClick={onSuccess}>
            Annuler
          </Button>
          <Button type="submit" size="lg" className="px-12">
            {job ? "Enregistrer" : "Publier"} l'offre
          </Button>
        </div>
      </form>
    </div>
  );
}