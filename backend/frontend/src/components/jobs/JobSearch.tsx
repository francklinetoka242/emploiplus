// src/components/jobs/JobSearch.tsx
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Briefcase, X } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  image_url?: string;
  created_at: string;
}

type Filters = {
  search: string;
  location: string;
  country: string;
  company: string;
  sector: string;
  competence: string;
  type: string;
};

interface JobSearchProps {
  onFilterChange?: ((filters: Filters) => void) | Dispatch<SetStateAction<Filters>>;
}

export default function JobSearch({ onFilterChange }: JobSearchProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [company, setCompany] = useState("");
  const [sector, setSector] = useState("");
  const [competence, setCompetence] = useState("");
  const [type, setType] = useState("all");

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: api.getJobs,
    staleTime: 1000 * 60 * 5,
  });

  // Extracted values from jobs
  const locations = useMemo(() => {
    const locs = new Set(jobs.map((j) => j.location).filter(Boolean));
    return Array.from(locs).sort();
  }, [jobs]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      const loc = String(j.location || "").trim();
      if (!loc) return;
      const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length > 0) set.add(parts[parts.length - 1]);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const companies = useMemo(() => {
    const set = new Set(jobs.map((j) => j.company).filter(Boolean));
    return Array.from(set).sort();
  }, [jobs]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      const s = String((j as Record<string, unknown>).sector || "").trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const types = useMemo(() => {
    const typs = new Set(jobs.map((j) => j.type).filter(Boolean));
    return Array.from(typs).sort();
  }, [jobs]);

  // Notify parent of filter changes
  useEffect(() => {
    const payload: Filters = { search, location, country, company, sector, competence, type };
    if (!onFilterChange) return;
    // Support either a setter or a callback
    (onFilterChange as Dispatch<SetStateAction<Filters>>)(payload as SetStateAction<Filters>);
  }, [search, location, country, company, sector, competence, type, onFilterChange]);

  const reset = () => {
    setSearch("");
    setLocation("");
    setCountry("");
    setCompany("");
    setSector("");
    setCompetence("");
    setType("all");
  };

  const hasFilters = search.trim() !== "" || location !== "" || country !== "" || company !== "" || sector !== "" || competence !== "" || type !== "all";
  const isLocationEmpty = !location;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-semibold">Rechercher une offre d'emploi</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search by keyword */}
        <div>
          <label className="block text-sm font-medium mb-2">Mot-clé</label>
          <Input
            placeholder="Titre, entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium mb-2">Entreprise</label>
          <Select value={company || "none"} onValueChange={(v) => setCompany(v === "none" ? "" : v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Toutes les entreprises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Toutes les entreprises</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sector */}
        <div>
          <label className="block text-sm font-medium mb-2">Secteur</label>
          <Select value={sector || "none"} onValueChange={(v) => setSector(v === "none" ? "" : v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tous les secteurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Tous les secteurs</SelectItem>
              {sectors.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search by location */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Lieu
          </label>
          <Select value={location || "none"} onValueChange={(val) => setLocation(val === "none" ? "" : val)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tous les lieux" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Tous les lieux</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country (extracted) */}
        <div>
          <label className="block text-sm font-medium mb-2">Pays</label>
          <Select value={country || "none"} onValueChange={(v) => setCountry(v === "none" ? "" : v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tous les pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Tous les pays</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search by job type */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Type
          </label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Competence (free text) */}
        <div>
          <label className="block text-sm font-medium mb-2">Compétence</label>
          <Input
            placeholder="Ex: SQL, React..."
            value={competence}
            onChange={(e) => setCompetence(e.target.value)}
            className="h-10"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1" 
            disabled={!hasFilters} 
            onClick={reset}
          >
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
}
