import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";

interface Formation {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: string;
  price?: number;
  created_at: string;
}

type Filters = {
  search: string;
  category: string;
  level: string;
  priceRange: string;
};

interface FormationSearchCompactProps {
  onFilterChange?: ((filters: Filters) => void) | Dispatch<SetStateAction<Filters>>;
}

export default function FormationSearchCompact({ onFilterChange }: FormationSearchCompactProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Show search bar by default (independent of formation loading)
  const isVisible = true;

  const { data: formationsResponse = { formations: [], total: 0 } } = useQuery({
    queryKey: ["formations"],
    queryFn: () => api.getFormations({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const formations = Array.isArray(formationsResponse)
    ? formationsResponse
    : (formationsResponse?.formations || []);

  // Extract filter options
  const categories = useMemo(() => {
    const cats = new Set(
      (formations || [])
        .map((f: Formation) => f.category)
        .filter(Boolean)
    );
    return Array.from(cats).sort() as string[];
  }, [formations]);

  const levels = useMemo(() => {
    const lvls = new Set(
      (formations || [])
        .map((f: Formation) => f.level)
        .filter(Boolean)
    );
    return Array.from(lvls).sort() as string[];
  }, [formations]);

  const priceRanges = ["Gratuit", "0-100", "100-500", "500+"];

  // Notify parent of filter changes
  useEffect(() => {
    const newFilters: Filters = {
      search,
      category,
      level,
      priceRange,
    };
    onFilterChange?.(newFilters);
  }, [search, category, level, priceRange, onFilterChange]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setPriceRange("");
    setIsExpanded(false);
  };

  const hasActiveFilters = search || category || level || priceRange;

  return (
    <div
      className={`sticky top-0 z-40 bg-white border-b border-gray-200 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } md:relative md:translate-y-0`}
    >
      <div className="px-4 py-3">
        {/* Main Search Bar */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Formation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Toggle Filters Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-10 px-3 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            title={isExpanded ? "Masquer les filtres" : "Afficher les filtres"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">Tous</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Niveau
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">Tous</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Prix
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">Tous</option>
                {priceRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="col-span-2 sm:col-span-1 h-10 px-3 flex items-center justify-center gap-1 rounded-lg border border-gray-300 hover:bg-red-50 hover:border-red-300 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
