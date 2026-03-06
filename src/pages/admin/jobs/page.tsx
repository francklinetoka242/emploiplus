// src/pages/admin/jobs/page.tsx
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Search } from "lucide-react";
import JobList from "@/components/admin/jobs/JobList";
import JobForm from "@/components/admin/jobs/JobForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type FilterPeriod = "all" | "week" | "month" | "year";

export default function JobsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterTraining, setFilterTraining] = useState(false);
  const [filterExpired, setFilterExpired] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: api.getJobs,
  });

  // Filter jobs based on criteria
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // compute expiry flag on each job by deadline
    const isExpired = (job: any) => {
      if (!job.deadline) return false;
      const dl = new Date(String(job.deadline)).getTime();
      return dl < Date.now();
    };

    // expired toggle: show only expired or only non-expired
    if (!filterExpired) {
      // hide expired by default
      result = result.filter((job) => !isExpired(job));
    }

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

    // Training offers filter (sector contains "formation")
    if (filterTraining) {
      result = result.filter((job) =>
        job.sector?.toLowerCase().includes("formation")
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
  }, [jobs, filterPeriod, filterCompany, filterTraining, filterExpired, searchText]);

  // keep selection limited to currently visible jobs
  useEffect(() => {
    setSelectedJobs((s) => s.filter((id) => filteredJobs.some((j) => j.id === id)));
  }, [filteredJobs]);

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

          {/* Training filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="filter-training"
              checked={filterTraining}
              onChange={(e) => setFilterTraining(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <label htmlFor="filter-training" className="text-sm font-medium">
              Offres de formation
            </label>
          </div>

          {/* Expired filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="filter-expired"
              checked={filterExpired}
              onChange={(e) => setFilterExpired(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <label htmlFor="filter-expired" className="text-sm font-medium">
              Voir offres expirées
            </label>
          </div>

          {/* Results count + bulk actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredJobs.length} offre{filteredJobs.length !== 1 ? "s" : ""} trouvée{filteredJobs.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center space-x-2">
              {selectedJobs.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (!window.confirm(`Supprimer ${selectedJobs.length} offre(s) ?`)) return;
                    for (const id of selectedJobs) {
                      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
                    }
                    setSelectedJobs([]);
                    queryClient.invalidateQueries(["admin-jobs"]);
                  }}
                >
                  Supprimer sélection
                </Button>
              )}

              {/* delete all expired offers */}
              {jobs.some((j) => {
                const dl = j.deadline ? new Date(String(j.deadline)).getTime() : null;
                return dl !== null && dl < Date.now();
              }) && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (!window.confirm("Supprimer toutes les offres expirées ?")) return;
                    for (const j of jobs) {
                      const dl = j.deadline ? new Date(String(j.deadline)).getTime() : null;
                      if (dl !== null && dl < Date.now()) {
                        await fetch(`/api/jobs/${j.id}`, { method: "DELETE" });
                      }
                    }
                    setSelectedJobs([]);
                    queryClient.invalidateQueries(["admin-jobs"]);
                  }}
                >
                  Supprimer expirées
                </Button>
              )}
            </div>
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
          <JobList jobs={filteredJobs} selectedIds={selectedJobs} onToggleSelect={(id) => {
            setSelectedJobs((s) =>
              s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
            );
          }} />
        )}
      </div>
    </div>
  );
}