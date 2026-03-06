// src/pages/admin/formations/page.tsx

import { useState, useMemo } from "react";

// use the same type as the FormationList component so we don't have mismatched definitions
import { Formation as AdminFormation } from "@/components/admin/formations/FormationList";

// the imported type already includes `published` and other fields

import { Button } from "@/components/ui/button";

import { Plus, Search } from "lucide-react";

import FormationList from "@/components/admin/formations/FormationList";

import FormationForm from "@/components/admin/formations/FormationForm";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function FormationsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [publishedOnly, setPublishedOnly] = useState(false);

  const { data: formations = [] } = useQuery<AdminFormation[]>({
    queryKey: ["admin-formations"],
    queryFn: async () => {
      const res = await api.getFormations({ published: "all" });
      if (Array.isArray(res)) {
        return res as AdminFormation[];
      }
      if (res?.data && Array.isArray(res.data)) {
        return res.data as AdminFormation[];
      }
      return [];
    },
  });

  const filteredFormations: AdminFormation[] = useMemo(() => {
    let result: AdminFormation[] = formations;
    if (searchText) {
      const s = searchText.toLowerCase();
      result = result.filter((f: any) =>
        f.title?.toLowerCase().includes(s) || f.description?.toLowerCase().includes(s)
      );
    }
    if (filterCategory) {
      result = result.filter((f: any) =>
        f.category?.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }
    if (filterLevel) {
      result = result.filter((f: any) =>
        f.level?.toLowerCase().includes(filterLevel.toLowerCase())
      );
    }
    if (publishedOnly) {
      result = result.filter((f: any) => f.published);
    }
    return result;
  }, [formations, searchText, filterCategory, filterLevel, publishedOnly]);

  return (

    <div className="p-10">

      <div className="flex justify-between items-center mb-12">

 <div>
          <h1 className="text-5xl font-bold text-gray-900">Gestion des Formations</h1>
          <p className="text-xl text-muted-foreground mt-3">
            Ajoutez, modifiez ou publiez des offres de Formations en toute simplicité
          </p>
        </div>
      

        <Button size="lg" onClick={() => setShowCreateForm(true)}>

          <Plus className="mr-3 h-6 w-6" />

          Nouvelle formation

        </Button>

      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Filtres
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium mb-2">Rechercher</label>
            <input
              type="text"
              placeholder="Titre ou description..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Catégorie</label>
            <input
              type="text"
              placeholder="Catégorie..."
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Level filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Niveau</label>
            <input
              type="text"
              placeholder="Débutant, Intermédiaire..."
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Published only checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="filter-published"
              checked={publishedOnly}
              onChange={(e) => setPublishedOnly(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <label htmlFor="filter-published" className="text-sm font-medium">
              Publiées seulement
            </label>
          </div>

          {/* Results count */}
          <div className="flex items-end">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredFormations.length} formation{filteredFormations.length !== 1 ? "s" : ""} trouvée{filteredFormations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {showCreateForm && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl p-10 max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">

            <FormationForm onSuccess={() => setShowCreateForm(false)} />

          </div>

        </div>

      )}

      

      <FormationList
        formations={filteredFormations.map((f: any) => ({
          id: String(f.id),
          title: f.title || "",
          description: f.description || "",
          category: f.category || "",
          level: f.level || "",
          duration: f.duration || "",
          price: f.price !== undefined ? String(f.price) : "",
          published: f.published ?? false,
          created_at: f.created_at || new Date().toISOString(),
          image_url: f.image_url,
        }))}
      />

    </div>

  );

}
