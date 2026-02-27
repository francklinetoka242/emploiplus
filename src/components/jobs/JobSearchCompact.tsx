import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Briefcase, Building, Globe, Zap, X, ChevronUp } from "lucide-react";

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
  sector?: string;
  company_id?: string;
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

interface JobSearchCompactProps {
  onFilterChange?: ((filters: Filters) => void) | Dispatch<SetStateAction<Filters>>;
}

export default function JobSearchCompact({ onFilterChange }: JobSearchCompactProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [company, setCompany] = useState("");
  const [sector, setSector] = useState("");
  const [competence, setCompetence] = useState("");
  const [type, setType] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Force visible by default so search bar is always shown independently
  const isVisible = true;

  const { data: jobsResponse = { data: [], pagination: { total: 0 } } } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.getJobs({ page: 1 }),
    staleTime: 1000 * 60 * 5,
  });

  // Extraire le tableau des offres (compatible avec ancien et nouveau format)
  const jobs = Array.isArray(jobsResponse) ? jobsResponse : (jobsResponse?.data || []);

  // Extracted values from jobs
  // Compute full locations list and cities filtered by selected country
  const locations = useMemo(() => {
    const locs = new Set((jobs || []).map((j) => j.location).filter(Boolean));
    return Array.from(locs).sort() as string[];
  }, [jobs]);

  const citiesForCountry = useMemo(() => {
    if (!country) return locations;
    // Locations are expected in format "City, Country" or similar
    const set = new Set<string>();
    (jobs || []).forEach((j) => {
      const loc = String(j.location || '').trim();
      if (!loc) return;
      const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return;
      const last = parts[parts.length - 1];
      if (last.toLowerCase() === String(country).toLowerCase()) {
        // push city or full location if no city part
        const city = parts.slice(0, parts.length - 1).join(', ') || parts[0];
        set.add(city);
      }
    });
    // If none found, fall back to full locations
    const arr = set.size > 0 ? Array.from(set) : locations;
    return arr.sort();
  }, [jobs, country, locations]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    (jobs || []).forEach((j) => {
      const loc = String(j.location || "").trim();
      if (!loc) return;
      const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length > 0) set.add(parts[parts.length - 1]);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const companies = useMemo(() => {
    const set = new Set((jobs || []).map((j) => j.company).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [jobs]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    (jobs || []).forEach((j) => {
      if (j.sector) set.add(j.sector);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const types = useMemo(() => {
    const typs = new Set((jobs || []).map((j) => j.type).filter(Boolean));
    return Array.from(typs).sort() as string[];
  }, [jobs]);

  // Notify parent of filter changes
  useEffect(() => {
    const payload: Filters = { search, location, country, company, sector, competence, type };
    if (!onFilterChange) return;
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

  return (
    <>
      {/* Sticky compact search bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-lg transition-all duration-300 z-40">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                placeholder="Mot-clé, titre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Icon Buttons for Filters */}
            <button
              title="Lieu"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg transition ${
                location || isExpanded
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MapPin className="h-5 w-5" />
            </button>

            <button
              title="Entreprise"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg transition ${
                company || isExpanded
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Building className="h-5 w-5" />
            </button>

            <button
              title="Secteur"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg transition ${
                sector || isExpanded
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Briefcase className="h-5 w-5" />
            </button>

            <button
              title="Type"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg transition ${
                type !== "all" || isExpanded
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Zap className="h-5 w-5" />
            </button>

            {/* Reset button */}
            {hasFilters && (
              <button
                onClick={reset}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                title="Réinitialiser les filtres"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Toggle expand */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              <ChevronUp
                className={`h-5 w-5 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded filters section */}
      {isExpanded && (
        <div className="bg-white border-b shadow-lg">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Lieu */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Lieu</label>
                <Select
                  value={location || "none"}
                  onValueChange={(v) => setLocation(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Tous les lieux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tous les lieux</SelectItem>
                        {(country ? citiesForCountry : locations).map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pays */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Pays</label>
                <Select
                  value={country || "none"}
                  onValueChange={(v) => setCountry(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Tous les pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tous les pays</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Entreprise */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Entreprise</label>
                <Select
                  value={company || "none"}
                  onValueChange={(v) => setCompany(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Toutes les entreprises</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Secteur */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Secteur</label>
                <Select
                  value={sector || "none"}
                  onValueChange={(v) => setSector(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tous les secteurs</SelectItem>
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Tous" />
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
            </div>

            {/* Competence field and reset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
              <div className="lg:col-span-4">
                <label className="block text-xs font-medium mb-1 text-gray-700">Compétence</label>
                <Input
                  placeholder="Ex: SQL, React..."
                  value={competence}
                  onChange={(e) => setCompetence(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              {hasFilters && (
                <div className="flex items-end">
                  <Button
                    onClick={reset}
                    variant="outline"
                    size="sm"
                    className="w-full h-8"
                  >
                    Réinitialiser
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      {isVisible && (
        <div className="h-14 sm:h-20" />
      )}
    </>
  );
}
