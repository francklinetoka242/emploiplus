// src/pages/JobsOptimized.tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import JobSearchCompact from "@/components/jobs/JobSearchCompact";
import { toast } from "sonner";
import { JobListItem } from "@/components/jobs/JobListItem";
import { Button } from "@/components/ui/button";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar";

const JobsOptimized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    search: "",
    location: "",
    country: "",
    company: "",
    sector: "",
    competence: "",
    type: "all",
  });

  // Obtenir la page courante depuis l'URL
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Sync URL search params avec filtres
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get("q") || params.get("search") || "";
      if (q) setFilters((s) => ({ ...s, search: q }));
    } catch (e) {}
  }, [location.search]);

  // Récupérer les offres pour la page actuelle
  const { data: jobsData = { data: [], pagination: { total: 0, pages: 0, page: 1 } }, isLoading } = useQuery({
    queryKey: ["jobs", filters, currentPage],
    queryFn: () =>
      api.getJobs({
        q: filters.search || "",
        location: filters.location || "",
        company: filters.company || "",
        sector: filters.sector || "",
        type: filters.type && filters.type !== "all" ? filters.type : "",
        page: currentPage,
      }),
  });

  const profession = user?.profession || "";
  const skills: string[] = Array.isArray(user?.skills) ? user.skills : [];

  // Recommandations depuis la première page
  const recommended = jobsData.data
    .slice(0, 10)
    .filter((j: Record<string, unknown>) => {
      const hay =
        `${String(j["title"] || "")} ${String(j["description"] || "")} ${String(j["sector"] || "")}`
          .toLowerCase();
      if (profession && hay.includes(String(profession).toLowerCase())) return true;
      for (const s of skills) {
        if (hay.includes(String(s).toLowerCase())) return true;
      }
      return false;
    })
    .slice(0, 4);

  // Allow public access to job listings (no login required)

  if (isLoading && currentPage === 1) {
    return (
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-96 rounded-lg" />
          </div>
          <div className="lg:col-span-9">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pagination = jobsData.pagination || {};
  const { total = 0, pages = 1, hasNextPage = false, hasPreviousPage = false } = pagination;

  // Créer des numéros de page à afficher
  const pageNumbers = [];
  const maxPagesToShow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(pages, startPage + maxPagesToShow - 1);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (page: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Search Bar */}
      <JobSearchCompact onFilterChange={setFilters} />

      {/* Demo Banner */}
      {user && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4">
          <div className="container flex items-center justify-between">
            <div className="text-sm">
              🎯 <strong>Nouveau!</strong> Découvrez votre score de compatibilité et votre roadmap carrière
            </div>
            <Button
              onClick={() => navigate('/matching-demo')}
              variant="ghost"
              className="text-white hover:bg-white/20"
              size="sm"
            >
              Essayer →
            </Button>
          </div>
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <ProfileSidebar />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-9 max-w-3xl">
            {/* Recommended section */}
            {user && recommended.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-2">Offres recommandées pour vous</h2>
                <p className="text-gray-600 mb-6">Basées sur votre profil et vos compétences</p>
                <div className="space-y-4 mb-8">
                  {recommended.map((jobItem: Record<string, unknown>) => (
                    <JobListItem
                      key={String(jobItem.id)}
                      job={jobItem}
                      isExpanded={expandedJobId === String(jobItem.id)}
                      onToggle={() =>
                        setExpandedJobId(
                          expandedJobId === String(jobItem.id) ? null : String(jobItem.id)
                        )
                      }
                      onApply={() => {
                        const dl = jobItem.deadline
                          ? new Date(String(jobItem.deadline)).getTime()
                          : null;
                        const expired = dl ? dl < Date.now() : false;
                        if (!expired && jobItem.application_via_emploi) {
                          navigate(`/recrutement/postuler/${String(jobItem.id)}`);
                        } else {
                          toast.error("Date limite dépassée ou candidature non disponible");
                        }
                      }}
                      isSaved={false}
                      onSave={() => toast.info("Sauvegardé")}
                    />
                  ))}
                </div>
                <hr className="my-8" />
              </div>
            )}

            {/* All Jobs Section */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Offres disponibles</h2>
              <p className="text-gray-600 mb-6">{total} offre{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}</p>

              {jobsData.data.length === 0 && !isLoading ? (
                <div className="text-center py-24">
                  <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg text-gray-500">Aucune offre ne correspond à votre recherche</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobsData.data.map((jobItem: Record<string, unknown>) => (
                    <JobListItem
                      key={String(jobItem.id)}
                      job={jobItem}
                      isExpanded={expandedJobId === String(jobItem.id)}
                      onToggle={() =>
                        setExpandedJobId(
                          expandedJobId === String(jobItem.id) ? null : String(jobItem.id)
                        )
                      }
                      onApply={() => {
                        const dl = jobItem.deadline
                          ? new Date(String(jobItem.deadline)).getTime()
                          : null;
                        const expired = dl ? dl < Date.now() : false;
                        if (!expired && jobItem.application_via_emploi) {
                          navigate(`/recrutement/postuler/${String(jobItem.id)}`);
                        } else {
                          toast.error("Date limite dépassée ou candidature non disponible");
                        }
                      }}
                      isSaved={false}
                      onSave={() => toast.info("Sauvegardé")}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                {/* Previous button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {startPage > 1 && (
                    <>
                      <Button
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </Button>
                      {startPage > 2 && <span className="px-2 py-1 text-gray-500">...</span>}
                    </>
                  )}

                  {pageNumbers.map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  {endPage < pages && (
                    <>
                      {endPage < pages - 1 && <span className="px-2 py-1 text-gray-500">...</span>}
                      <Button
                        variant={currentPage === pages ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pages)}
                      >
                        {pages}
                      </Button>
                    </>
                  )}
                </div>

                {/* Next button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="gap-1"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Info Cache */}
            {jobsData.fromCache && (
              <div className="mt-8 text-center text-xs text-gray-500 bg-blue-50 p-2 rounded">
                ✓ Résultats depuis le cache (âge: {jobsData.cacheAge}s)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsOptimized;
