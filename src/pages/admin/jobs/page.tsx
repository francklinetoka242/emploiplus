// src/pages/admin/jobs/page.tsx
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Search } from "lucide-react";
import JobList from "@/components/admin/jobs/JobList";
import JobForm from "@/components/admin/jobs/JobForm";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type FilterPeriod = "all" | "week" | "month" | "year";

export default function JobsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [filterCompany, setFilterCompany] = useState("");

  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: api.getJobs,
  });

  // Filter jobs based on criteria
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Date filtering
    if (filterPeriod !== "all") {
      const now = new Date();
      let cutoffDate: Date;

      if (filterPeriod === "week") {
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
      } else if (filterPeriod === "month") {
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (filterPeriod === "year") {
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 1);
      } else {
        cutoffDate = new Date(0);
      }

      result = result.filter((job) => {
        const jobDate = new Date(job.published_at || job.created_at);
        return jobDate >= cutoffDate;
      });
    }

    // Company filtering
    if (filterCompany) {
      result = result.filter((job) =>
        job.company?.toLowerCase().includes(filterCompany.toLowerCase())
      );
    }

    // Search text filtering (title + description)
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter((job) =>
        job.title?.toLowerCase().includes(search) ||
        job.description?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [jobs, filterPeriod, filterCompany, searchText]);

  return (
    <div className="p-10 min-h-screen">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">Gestion des offres d'emploi</h1>
          <p className="text-xl text-muted-foreground mt-3">
            Ajoutez, modifiez ou publiez des offres en toute simplicité
          </p>
        </div>
        <Button
          size="lg"
          className="shadow-lg hover:shadow-xl transition"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="mr-3 h-6 w-6" />
          Nouvelle offre
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

          {/* Period filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Période</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Toutes les offres</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>

          {/* Company filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Entreprise</label>
            <input
              type="text"
              placeholder="Nom de l'entreprise..."
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Results count */}
          <div className="flex items-end">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredJobs.length} offre{filteredJobs.length !== 1 ? "s" : ""} trouvée{filteredJobs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Modal du formulaire */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-10 py-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold flex items-center gap-4">
                <Briefcase className="h-10 w-10 text-primary" />
                Créer une nouvelle offre d'emploi
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-10">
              <JobForm onSuccess={() => setShowCreateForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Liste des offres filtrées */}
      <div className="mt-8">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border">
            <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-lg text-muted-foreground">Aucune offre ne correspond à vos filtres</p>
          </div>
        ) : (
          <JobList jobs={filteredJobs} />
        )}
      </div>
    </div>
  );
}