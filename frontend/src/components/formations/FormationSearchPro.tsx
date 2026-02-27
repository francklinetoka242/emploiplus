import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

type Props = {
  onFilterChange?: (filters: Record<string, any>) => void;
};

export default function FormationSearchPro({ onFilterChange }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  
  // Local state for filter options - initialized empty, loaded asynchronously
  const [categories, setCategories] = useState<string[]>([]);

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
        (formations || []).forEach((f) => {
          if (f.category) categorySet.add(f.category);
        });
        setCategories(Array.from(categorySet).sort());
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
      level: "",
      priceRange: "",
      provider: "",
      country: "",
      recent: true,
    };
    if (onFilterChange) onFilterChange(payload);
  }, [search, category, onFilterChange]);

  const reset = () => {
    setSearch("");
    setCategory("");
  };

  const hasFilters = search.trim() !== "" || category !== "";

  return (
    <div className="w-full">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-4">
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

            {/* Category buttons - ALWAYS DISPLAYED */}
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    className="cursor-pointer px-3 py-2 text-sm"
                    onClick={() => setCategory(category === cat ? "" : cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <Badge variant="outline" className="px-3 py-2 text-sm">Toutes les catégories</Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
