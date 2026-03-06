import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Calendar, ArrowUpDown, DollarSign } from "lucide-react";

type Props = {
  onFilterChange?: (filters: Record<string, any>) => void;
};

export default function FormationSearchPro({ onFilterChange }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  
  // Local state for filter options - initialized empty, loaded asynchronously
  const [categories, setCategories] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  // Load filter options in background WITHOUT blocking the UI
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await api.getFormations({ limit: 1000 });
        const formations = Array.isArray(response)
          ? response
          : (response?.formations || response?.data || []);

        // Extract categories
        const categorySet = new Set<string>();
        const levelSet = new Set<string>();
        (formations || []).forEach((f) => {
          if (f.category) categorySet.add(f.category);
          if (f.level) levelSet.add(f.level);
        });
        setCategories(Array.from(categorySet).sort());
        setLevels(Array.from(levelSet).sort());
      } catch (error) {
        console.error("Error loading filter options:", error);
        // Don't show errors - just keep empty lists
      }
    };

    loadFilterOptions();
  }, []);

  // Notify parent when filters change
  useEffect(() => {
    const payload = {
      search,
      category,
      level,
      priceRange: "",
      provider: "",
      country: "",
      recent: sortBy === 'recent',
      sortBy: sortBy === 'recent' ? 'created_at' : sortBy,
      sortOrder: 'DESC',
    };
    if (onFilterChange) onFilterChange(payload);
  }, [search, category, level, sortBy, onFilterChange]);

  const reset = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setSortBy("recent");
    setShowMoreFilters(false);
  };

  const hasFilters = search.trim() !== "" || category !== "" || level !== "" || sortBy !== "recent";
  const activeFilterCount = [search.trim() !== "", category !== "", level !== "", sortBy !== "recent"].filter(Boolean).length;

  const sortOptions = [
    { value: "recent", label: "Plus récents", icon: Calendar },
    { value: "title", label: "Titre (A-Z)", icon: ArrowUpDown },
    { value: "price", label: "Prix", icon: DollarSign },
  ];

  return (
    <div className="w-full">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-4 md:p-5">
          <div className="flex flex-col gap-4">
            {/* Main search input row */}
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <Input
                placeholder="Rechercher par titre, compétence, mot-clé..."
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

            {/* Active filters display row */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2">
                {category && (
                  <Badge variant="secondary" className="gap-2">
                    {category}
                    <button onClick={() => setCategory("")} className="ml-1">✕</button>
                  </Badge>
                )}
                {level && (
                  <Badge variant="secondary" className="gap-2">
                    {level}
                    <button onClick={() => setLevel("")} className="ml-1">✕</button>
                  </Badge>
                )}
                {sortBy !== "recent" && (
                  <Badge variant="secondary" className="gap-2">
                    {sortOptions.find(o => o.value === sortBy)?.label}
                    <button onClick={() => setSortBy("recent")} className="ml-1">✕</button>
                  </Badge>
                )}
              </div>
            )}

            {/* All filters in one row */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Categories */}
              {categories.length > 0 && categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-sm"
                  onClick={() => setCategory(category === cat ? "" : cat)}
                >
                  {cat}
                </Badge>
              ))}

              {/* Levels */}
              {levels.length > 0 && levels.map((lvl) => (
                <Badge
                  key={lvl}
                  variant={level === lvl ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-sm"
                  onClick={() => setLevel(level === lvl ? "" : lvl)}
                >
                  {lvl}
                </Badge>
              ))}

              {/* Sort options */}
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Badge
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    className="cursor-pointer px-3 py-2 text-sm flex items-center gap-1"
                    onClick={() => setSortBy(option.value)}
                  >
                    <Icon className="w-3 h-3" />
                    {option.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
