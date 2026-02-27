import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

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
  const [country, setCountry] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  
  // Local state for filter options - initialized empty, loaded asynchronously
  const [countries, setCountries] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  // Force visible by default so search bar is always shown independently
  const isVisible = true;

  // Load filter options in background WITHOUT blocking the UI
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await api.getJobs({ page: 1, limit: 1000 });
        const jobs = Array.isArray(response) ? response : (response?.data || []);

        // Extract countries
        const countrySet = new Set<string>();
        (jobs || []).forEach((j) => {
          const loc = String(j.location || "").trim();
          if (!loc) return;
          const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
          if (parts.length > 0) countrySet.add(parts[parts.length - 1]);
        });
        setCountries(Array.from(countrySet).sort());

        // Extract companies
        const companySet = new Set((jobs || []).map((j) => j.company).filter(Boolean));
        setCompanies(Array.from(companySet).sort() as string[]);

        // Extract positions
        const positionSet = new Set<string>();
        (jobs || []).forEach((j) => {
          if (j.title) positionSet.add(j.title);
        });
        setPositions(Array.from(positionSet).sort());
      } catch (error) {
        console.error("Error loading filter options:", error);
        // Don't show errors - just keep empty lists
      }
    };

    loadFilterOptions();
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    const payload: Filters = { 
      search, 
      location: "", 
      country, 
      company, 
      sector: position, // Use position as sector for compatibility
      competence: "",
      type: "all"
    };
    if (!onFilterChange) return;
    (onFilterChange as Dispatch<SetStateAction<Filters>>)(payload as SetStateAction<Filters>);
  }, [search, country, company, position, onFilterChange]);

  const reset = () => {
    setSearch("");
    setCountry("");
    setCompany("");
    setPosition("");
  };

  const hasFilters = search.trim() !== "" || country !== "" || company !== "" || position !== "";

  return (
    <>
      {/* Filter section - ALWAYS VISIBLE IMMEDIATELY - NO LOADING DEPENDENCY */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Main search input row */}
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <Input
                placeholder="Rechercher par mot-clé, titre, secteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 text-sm flex-1"
              />
              {hasFilters && (
                <button
                  onClick={reset}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition flex-shrink-0"
                  title="Réinitialiser les filtres"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter dropdowns row - ALWAYS DISPLAYED */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pays dropdown */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Pays</label>
                <Select
                  value={country || "none"}
                  onValueChange={(v) => setCountry(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-9 text-sm">
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

              {/* Entreprise dropdown */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Entreprise</label>
                <Select
                  value={company || "none"}
                  onValueChange={(v) => setCompany(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Toutes les entreprises" />
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

              {/* Poste dropdown */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Poste</label>
                <Select
                  value={position || "none"}
                  onValueChange={(v) => setPosition(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Tous les postes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tous les postes</SelectItem>
                    {positions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for sticky header */}
      {isVisible && (
        <div className="h-4" />
      )}
    </>
  );
}
