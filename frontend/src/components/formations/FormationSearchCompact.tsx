import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Search, Clock, SortAsc, Tag } from "lucide-react";

interface Formation {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: string;
  price?: number;
  created_at: string;
}

// only the filters we actually display now (search + category + sort)
type Filters = {
  search: string;
  category: string;
  sort?: "recent" | "az" | "price";
};

interface FormationSearchCompactProps {
  onFilterChange?: ((filters: Filters) => void) | Dispatch<SetStateAction<Filters>>;
}

export default function FormationSearchCompact({ onFilterChange }: FormationSearchCompactProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"recent" | "az" | "price" | undefined>("recent");

  // Show search bar by default (independent of formation loading)
  const isVisible = true; // always shown sticky

  const { data: formationsResponse = { formations: [], total: 0 } } = useQuery({
    queryKey: ["formations"],
    queryFn: () => api.getFormations({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const formations = formationsResponse?.data || [];

  // Extract filter options for categories only (we dropped level/price selects)
  const categories = useMemo(() => {
    const cats = new Set(
      (formations || [])
        .map((f: Formation) => f.category)
        .filter(Boolean)
    );
    return Array.from(cats).sort() as string[];
  }, [formations]);

  // Notify parent of filter changes with debounce on search
  useEffect(() => {
    const handler = setTimeout(() => {
      const newFilters: Filters = {
        search,
        category,
        sort,
      };
      onFilterChange?.(newFilters);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, category, sort, onFilterChange]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSort("recent");
  };

  const hasActiveFilters = search || category || sort !== "recent";

  return (
    <div
      className={`sticky top-0 z-40 bg-white shadow-lg border-b border-gray-200 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } md:relative md:translate-y-0`}
    >
      <div className="px-4 py-3">
        {/* Main Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end gap-2">
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

          {/* pill-based sort filters */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                sort === "recent" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setSort(sort === "recent" ? undefined : "recent")}
            >
              <Clock className="w-4 h-4" />
              Récents
            </span>
            <span
              className={`cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                sort === "az" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setSort(sort === "az" ? undefined : "az")}
            >
              <SortAsc className="w-4 h-4" />
              A‑Z
            </span>
            <span
              className={`cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                sort === "price" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setSort(sort === "price" ? undefined : "price")}
            >
              <Tag className="w-4 h-4" />
              Prix
            </span>
          </div>
        </div>

        {/* Categories row */}
        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors ${
                  category === cat ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setCategory(category === cat ? "" : cat)}
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* clear button */}
        {hasActiveFilters && (
          <div className="mt-2">
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:underline"
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
