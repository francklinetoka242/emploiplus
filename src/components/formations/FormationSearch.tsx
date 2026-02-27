// src/components/formations/FormationSearch.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, X } from "lucide-react";

export default function FormationSearch() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("all");
    setSortBy("recent");
  };

  const hasActiveFilters = search || category || level !== "all" || sortBy !== "recent";

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-8 border border-gray-200">
      {/* Single line with search bar and filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Main search bar */}
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Rechercher une formation, compétence, domaine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm h-11"
          />
        </div>

        {/* Category filter */}
        <div className="relative min-w-[150px]">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          <Input
            placeholder="Catégorie"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="pl-10 text-sm h-11"
          />
        </div>

        {/* Level filter */}
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="h-11 text-sm min-w-[150px]">
            <SelectValue placeholder="Tous les niveaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            <SelectItem value="Débutant">Débutant</SelectItem>
            <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
            <SelectItem value="Avancé">Avancé</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort by */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-11 text-sm min-w-[150px]">
            <SelectValue placeholder="Plus récentes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récentes</SelectItem>
            <SelectItem value="price-asc">Prix croissant</SelectItem>
            <SelectItem value="price-desc">Prix décroissant</SelectItem>
            <SelectItem value="duration-short">Durée courte</SelectItem>
            <SelectItem value="duration-long">Durée longue</SelectItem>
            <SelectItem value="popular">Les plus populaires</SelectItem>
            <SelectItem value="rating">Mieux notées</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={clearFilters} 
            className="h-11 text-sm gap-1"
          >
            <X className="h-4 w-4" />
            <span>Réinitialiser</span>
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-sm mt-3">
          <span className="text-muted-foreground font-medium">Filtres actifs:</span>
          {search && <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setSearch("")}>{search} ✕</Badge>}
          {category && <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setCategory("")}>{category} ✕</Badge>}
          {level !== "all" && <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setLevel("all")}>{level} ✕</Badge>}
          {sortBy !== "recent" && (
            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setSortBy("recent")}>
              {sortBy === "price-asc" ? "Prix ↑" : 
               sortBy === "price-desc" ? "Prix ↓" :
               sortBy === "duration-short" ? "Durée courte" :
               sortBy === "duration-long" ? "Durée longue" :
               sortBy === "popular" ? "Populaire" :
               sortBy === "rating" ? "Top notées" : ""} ✕
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}