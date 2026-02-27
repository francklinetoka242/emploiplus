import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Search } from "lucide-react";
import { authHeaders } from '@/lib/headers';
import ConfirmButton from '@/components/ConfirmButton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  user_type: string;
  full_name: string;
  email: string;
  profile_image_url?: string;
  profession?: string;
  diploma?: string;
  skills?: string[];
}

interface UserSkill {
  id: number;
  user_id: number;
  skill_name: string;
  category: string;
  created_at: string;
}

const SKILL_CATEGORIES = [
  { value: "technical", label: "Technique" },
  { value: "soft", label: "Soft skills" },
  { value: "language", label: "Langues" },
  { value: "profession", label: "Métiers" },
  { value: "other", label: "Autre" },
];

const SUGGESTIONS = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Django', 'Flask', 'Machine Learning', 'Data Analysis',
  'Gestion de projet', 'Leadership', 'Communication', 'SQL', 'NoSQL', 'Docker', 'Kubernetes', 'DevOps',
  'UI/UX', 'Photoshop', 'Illustrator', 'Marketing digital', 'SEO', 'Réseaux', 'Cybersécurité',
  'Anglais', 'Français', 'Espagnol'
];

export default function RecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillCategory, setSkillCategory] = useState("technical");
  const [candidates, setCandidates] = useState<User[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<User[]>([]);
  const [filterSkill, setFilterSkill] = useState("");
  const [filterDiploma, setFilterDiploma] = useState("");
  const [filterProfession, setFilterProfession] = useState("");
  // Company preference fields (used when user is company)
  const [prefSkill, setPrefSkill] = useState('');
  const [prefDiploma, setPrefDiploma] = useState('');
  const [prefProfession, setPrefProfession] = useState('');
  const [prefCertification, setPrefCertification] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      if (user.user_type === 'company') {
        // company will use the preference form (no candidate list)
      } else {
        fetchSkills();
      }
    }
     
  }, [user]);

  useEffect(() => {
    filterCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates, filterSkill, filterDiploma, filterProfession]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user-skills", {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur chargement compétences");
      const data: UserSkill[] = await res.json();
      setSkills(data);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // company candidates fetch removed: this page will only record company preferences

  const filterCandidates = () => {
    let filtered = candidates;
    if (filterSkill) {
      filtered = filtered.filter((c) => {
        const cSkills = (c.skills || []) as string[];
        return cSkills.some((s) => s.toLowerCase().includes(filterSkill.toLowerCase()));
      });
    }
    if (filterDiploma) {
      filtered = filtered.filter((c) =>
        (c.diploma || "").toLowerCase().includes(filterDiploma.toLowerCase())
      );
    }
    if (filterProfession) {
      filtered = filtered.filter((c) =>
        (c.profession || "").toLowerCase().includes(filterProfession.toLowerCase())
      );
    }
    setFilteredCandidates(filtered);
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skillName.trim()) {
      toast.error("Veuillez entrer une compétence");
      return;
    }

    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user-skills", {
        method: "POST",
        headers: authHeaders('application/json'),
        body: JSON.stringify({
          skill_name: skillName,
          category: skillCategory,
        }),
      });

      if (!res.ok) throw new Error("Erreur création compétence");

      toast.success("Compétence ajoutée");
      setSkillName("");
      setSkillCategory("technical");
      fetchSkills();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

    const handleQuickAdd = async (skill: string) => {
      setAdding(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/user-skills', {
          method: 'POST',
          headers: authHeaders('application/json'),
          body: JSON.stringify({ skill_name: skill, category: 'technical' })
        });
        if (!res.ok) throw new Error('Erreur création compétence');
        toast.success('Compétence ajoutée');
        fetchSkills();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur';
        toast.error(msg);
      } finally {
        setAdding(false);
      }
    };

  const handleDeleteSkill = async (skillId: number) => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/user-skills/${skillId}`, {
          method: "DELETE",
          headers: authHeaders(),
        });

      if (!res.ok) throw new Error("Erreur suppression");
      toast.success("Compétence supprimée");
      fetchSkills();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/company-recommendations', {
        method: 'POST',
        headers: authHeaders('application/json'),
        body: JSON.stringify({ skill: prefSkill, diploma: prefDiploma, profession: prefProfession, certification: prefCertification }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Erreur enregistrement');
      }
      toast.success('Préférences enregistrées');
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // For company users: show a form to save preferred profile filters (no candidates list)
  if (user?.user_type === 'company') {
    // use top-level preference state and handler

    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Recommandations de profils</h1>
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Critères recherchés</h2>
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div>
              <Label>Compétence (mots clés)</Label>
              <Input value={prefSkill} onChange={(e) => setPrefSkill(e.target.value)} placeholder="Ex: React, Node.js" />
            </div>
            <div>
              <Label>Diplôme</Label>
              <Input value={prefDiploma} onChange={(e) => setPrefDiploma(e.target.value)} placeholder="Ex: Licence, Master" />
            </div>
            <div>
              <Label>Métier</Label>
              <Input value={prefProfession} onChange={(e) => setPrefProfession(e.target.value)} placeholder="Ex: Développeur, Manager" />
            </div>
            <div>
              <Label>Certification</Label>
              <Input value={prefCertification} onChange={(e) => setPrefCertification(e.target.value)} placeholder="Ex: AWS, PMP" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </div>
          </form>
        </Card>
        <Card className="p-6 text-muted-foreground">Les critères sont enregistrés et utilisés pour générer des recommandations (les profils ne sont pas affichés ici).</Card>
      </div>
    );
  }

  // For candidate users: show skills management
  const skillsByCategory = SKILL_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.value] = skills.filter((s) => s.category === cat.value);
      return acc;
    },
    {} as Record<string, UserSkill[]>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Recommandations</h1>

      {/* Add Skill Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Ajouter une compétence</h2>

        <form onSubmit={handleAddSkill} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="skillName">Compétence</Label>
              <Input
                id="skillName"
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Ex: React, Gestion de projet, etc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="skillCategory">Catégorie</Label>
              <Select value={skillCategory} onValueChange={setSkillCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={adding}>
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ajout...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une compétence
              </>
            )}
          </Button>
            <div className="mt-4">
              <h4 className="text-sm mb-2">Suggestions</h4>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => handleQuickAdd(s)} className="px-3 py-1 bg-muted rounded text-sm">{s}</button>
                ))}
              </div>
            </div>
        </form>
      </Card>

      {/* Skills by Category */}
      <div className="space-y-6">
        {SKILL_CATEGORIES.map((cat) => (
          <Card key={cat.value} className="p-6">
            <h3 className="text-lg font-semibold mb-4">{cat.label}</h3>

            {skillsByCategory[cat.value].length === 0 ? (
              <p className="text-muted-foreground">Aucune compétence pour cette catégorie</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillsByCategory[cat.value].map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors group"
                  >
                    <span className="font-medium">{skill.skill_name}</span>
                    <ConfirmButton title="Supprimer cette compétence ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => handleDeleteSkill(skill.id)}>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </ConfirmButton>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
