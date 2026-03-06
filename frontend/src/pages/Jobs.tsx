// src/pages/Jobs.tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, ExternalLink, ChevronDown, ChevronUp, MapPin, Calendar, Building, Building2, BookOpen, User, Loader2, Search, X, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PWALayout } from '@/components/layout/PWALayout';
import { useState, useMemo, useEffect, useRef, useCallback, useRef as useRef2 } from "react";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { BottomNavigation } from "@/components/layout/BottomNavigation";

import JobFilters from "@/components/jobs/JobFilters";
import { toast } from 'sonner';
import SaveJobButton from "@/components/jobs/SaveJobButton";
import { JobListItem } from "@/components/jobs/JobListItem";
import { JobListSkeleton } from "@/components/jobs/JobSkeleton";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authHeaders } from '@/lib/headers';
import { useJobSearch } from "@/hooks/useJobSearch";

const Jobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use optimized search hook for debouncing
  const { localInput, debouncedSearch, handleInputChange, showMinCharsWarning } = useJobSearch({
    debounceMs: 500,
    minChars: 3,
  });

  const [filters, setFilters] = useState({
    search: "",
    location: "",
    country: "",
    company: "",
    sector: "",
    competence: "",
    type: "all",
    recent: true,
  });

  // Ensure page resets to 1 when ANY filter changes
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const filterChanged =
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters) &&
      (filters.search !== prevFiltersRef.current.search ||
        filters.company !== prevFiltersRef.current.company ||
        filters.country !== prevFiltersRef.current.country ||
        filters.sector !== prevFiltersRef.current.sector ||
        filters.location !== prevFiltersRef.current.location);
    if (filterChanged) {
      setPage(1);
      setAllJobs([]);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  // Infinite scroll state
  const [allJobs, setAllJobs] = useState<Record<string, unknown>[]>([]);
  const [formations, setFormations] = useState<Record<string, unknown>[]>([]);
  const [candidates, setCandidates] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandFilters, setExpandFilters] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const initialJobsLoadedRef = useRef(false);
  const [mobileView, setMobileView] = useState<"left" | "center" | "right">("center");

  // Extract search query from URL parameters on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || params.get('search') || '';
      if (q) {
        setFilters((s) => ({ ...s, search: q }));
      }
    } catch (e) {
      console.error('Error parsing location search:', e);
    }
  }, [location.search]);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Removed: filter-change reset is now handled above with a ref-based comparison

  // Fetch formations and candidates for sidebar
  useEffect(() => {
    if (user) {
      fetchFormations();
      fetchCandidates();
    }
  }, [user]);

  // NOTE: we removed the manual initial-fetch hook since the
  // react-query call below already loads jobs on mount.  Keeping a
  // separate effect previously could race with the query and leave the
  // list blank until the user interacted.  The query results are now the
  // single source of truth.

  const fetchFormations = async () => {
    try {
      const res = await api.getFormations({ limit: 5 });
      const unwrap = (r: any) => Array.isArray(r) ? r : (r?.data?.data ?? r?.data ?? r);
      const data = unwrap(res) || [];
      setFormations(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/users?limit=5');
      if (response.ok) {
        const data = await response.json();
        setCandidates(Array.isArray(data) ? data.slice(0, 5) : []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des candidats:', error);
    }
  };

  // Fetch jobs with pagination
  const { data: jobsData = { data: [], pagination: { total: 0, pages: 0, page: 1, hasNextPage: false, hasPreviousPage: false } }, isLoading } = useQuery({
    queryKey: ["jobs", filters, page],
    queryFn: () =>
      api.getJobs({
        q: filters.search || '',
        location: filters.location || '',
        country: filters.country || '',
        company: filters.company || '',
        sector: filters.sector || '',
        type: filters.type && filters.type !== 'all' ? filters.type : '',
        published: true,
        page,
        sortBy: 'created_at',
        sortOrder: filters.recent ? 'DESC' : 'ASC',
        limit: 10,
      }),
    // Block search requests when search string is present but shorter than 3 chars
    enabled: !(filters.search && filters.search.length > 0 && filters.search.length < 3),
    staleTime: 0, // Always fetch fresh data when filters change
    refetchOnWindowFocus: true, // Refetch when user returns to window
  });

  // Update allJobs when new data arrives
  useEffect(() => {
    if (isLoading) return;

    // Handle both array and object responses
    const unwrap = (r: any) => Array.isArray(r) ? r : (r?.data?.data ?? r?.data ?? r);
    const newJobs = Array.isArray(unwrap(jobsData)) ? unwrap(jobsData) : [];

    if (page === 1) {
      setAllJobs(newJobs);
    } else {
      setAllJobs((prev) => [...prev, ...newJobs]);
    }

    // Check if there are more jobs to load
    const pagination = jobsData?.pagination || {};
    setHasMore(pagination.hasNextPage || false);
    setIsLoadingMore(false);
  }, [jobsData, isLoading, page]);

  // Infinite scroll handler
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setIsLoadingMore(true);
      setPage((p) => p + 1);
    }
  }, [isLoading, hasMore]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const profession = user?.profession || '';
  const skills: string[] = Array.isArray(user?.skills) ? user.skills : [];

  // Personalized recommendations from first page
  const recommended = allJobs.slice(0, 10).filter((j: Record<string, unknown>) => {
    const hay = `${String(j['title'] || '')} ${String(j['description'] || '')} ${String(j['sector'] || '')}`.toLowerCase();
    if (profession && hay.includes(String(profession).toLowerCase())) return true;
    for (const s of skills) {
      if (hay.includes(String(s).toLowerCase())) return true;
    }
    return false;
  }).slice(0, 4);

  if (isLoading && page === 1) {
    return (
      <div className="container py-20">
        <div className="space-y-4">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // For non-authenticated users, show a different layout
  if (!user) {
    return (
      <PWALayout notificationCount={0} messageCount={0}>
      <div className="min-h-screen bg-gray-50">
        {/* Search Bar */}
        <JobFilters onFilterChange={setFilters} />

        {/* Main Content with Two Columns */}
        <div className="container py-6 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN - REMOVED (was login prompt) */}

            {/* CENTER & RIGHT COLUMN - JOBS LIST (Main Content) */}
            <div className="lg:col-span-9">

              {isLoading && page === 1 ? (
                <JobListSkeleton count={6} />
              ) : (
                <>
                  <div>
                    {allJobs.length === 0 && !isLoading ? (
                      <div className="text-center py-24">
                        <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg text-gray-500">Aucune offre ne correspond à votre recherche</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allJobs.map((jobItem: Record<string, unknown>) => (
                          <JobListItem
                            key={String(jobItem.id)}
                            job={jobItem}
                            isExpanded={true}
                            onToggle={() => {}}
                            onApply={() => {
                              toast.info("Connectez-vous pour postuler");
                              navigate("/connexion");
                            }}
                            onSmartApply={() => {
                              const dl = jobItem.deadline
                                ? new Date(String(jobItem.deadline)).getTime()
                                : null;
                              const expired = dl ? dl < Date.now() : false;
                              if (!expired) {
                                navigate(`/candidature-intelligente/${String(jobItem.id)}`);
                              } else {
                                toast.error("Date limite dépassée");
                              }
                            }}
                            isSaved={false}
                            onSave={() => toast.info("Connectez-vous pour sauvegarder")}
                          />
                        ))}

                        {/* Infinite scroll loader */}
                        <div ref={loaderRef} className="py-8 text-center">
                          {hasMore ? (
                            <>
                              <Skeleton className="h-20 rounded-lg" />
                              <p className="text-sm text-gray-500 mt-4">Chargement des offres...</p>
                              <div className="mt-4">
                                <Button onClick={loadMore} disabled={!hasMore || isLoading || isLoadingMore}>
                                  {isLoadingMore ? 'Chargement...' : 'Charger plus'}
                                </Button>
                              </div>
                            </>
                          ) : allJobs.length > 0 ? (
                            <p className="text-gray-500 py-8">Fin de la liste</p>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout notificationCount={0} messageCount={0}>
    <div className="min-h-screen bg-gray-50">

      {/* Main Content with Three Columns */}
      <div className="container py-6 px-4 pb-24 md:pb-0">
          <div className="mb-6">
          <JobFilters onFilterChange={setFilters} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN - PROFILE ONLY */}
          <div className={`${
            mobileView === "center" || mobileView === "right" ? "hidden" : ""
          } lg:col-span-2 lg:block`}>
            <div className="space-y-6 sticky top-24">
              {/* Profile Card */}
              <Card className="p-6 border-0 shadow-md">
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={user?.profile_image_url} alt={user?.full_name} />
                    <AvatarFallback className="text-2xl font-bold">
                      {(user?.full_name || user?.company_name || "")
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{user?.full_name || user?.company_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Candidat
                  </p>
                </div>

                {/* Link to My Publications */}
                <Button asChild variant="outline" className="w-full mb-3" size="sm">
                  <Link to="/mes-publications">
                    📝 Mes Publications
                  </Link>
                </Button>

                {/* Link to CV Creator */}
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 mb-6" size="sm">
                  <Link to="/cv-generator">
                    📄 Créer mon CV
                  </Link>
                </Button>

                {/* Link to Profile Settings */}
                <Button asChild variant="ghost" className="w-full" size="sm">
                  <Link to="/parametres">
                    ⚙️ Mon Profil
                  </Link>
                </Button>
              </Card>
            </div>
          </div>

          {/* MIDDLE COLUMN - JOBS LIST & FILTERS */}
          <div className={`${
            mobileView === "left" || mobileView === "right" ? "hidden" : ""
          } lg:col-span-7 lg:block`}>
            {isLoading && page === 1 ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : (
              <>
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
                          isExpanded={true}
                          onToggle={() => {}}
                          onApply={() => {
                            const dl = jobItem.deadline
                              ? new Date(String(jobItem.deadline)).getTime()
                              : null;
                            const expired = dl ? dl < Date.now() : false;
                            if (!expired) {
                              navigate(`/recrutement/postuler/${String(jobItem.id)}`);
                            } else {
                              toast.error("Date limite dépassée");
                            }
                          }}
                          onSmartApply={() => {
                            const dl = jobItem.deadline
                              ? new Date(String(jobItem.deadline)).getTime()
                              : null;
                            const expired = dl ? dl < Date.now() : false;
                            if (!expired) {
                              navigate(`/candidature-intelligente/${String(jobItem.id)}`);
                            } else {
                              toast.error("Date limite dépassée");
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
                 

                  {allJobs.length === 0 && !isLoading ? (
                    <div className="text-center py-24">
                      <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg text-gray-500">Aucune offre ne correspond à votre recherche</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allJobs.map((jobItem: Record<string, unknown>) => (
                        <JobListItem
                          key={String(jobItem.id)}
                          job={jobItem}
                          isExpanded={true}
                          onToggle={() => {}}
                          onApply={() => {
                            const dl = jobItem.deadline
                              ? new Date(String(jobItem.deadline)).getTime()
                              : null;
                            const expired = dl ? dl < Date.now() : false;
                            if (!expired) {
                              navigate(`/recrutement/postuler/${String(jobItem.id)}`);
                            } else {
                              toast.error("Date limite dépassée");
                            }
                          }}
                          onSmartApply={() => {
                            const dl = jobItem.deadline
                              ? new Date(String(jobItem.deadline)).getTime()
                              : null;
                            const expired = dl ? dl < Date.now() : false;
                            if (!expired) {
                              navigate(`/candidature-intelligente/${String(jobItem.id)}`);
                            } else {
                              toast.error("Date limite dépassée");
                            }
                          }}
                          isSaved={false}
                          onSave={() => toast.info("Sauvegardé")}
                        />
                      ))}

                      {/* Infinite scroll loader */}
                      <div ref={loaderRef} className="py-8 text-center">
                        {hasMore ? (
                          <>
                            <Skeleton className="h-20 rounded-lg" />
                            <p className="text-sm text-gray-500 mt-4">Chargement des offres...</p>
                            <div className="mt-4">
                              <Button onClick={loadMore} disabled={!hasMore || isLoading || isLoadingMore}>
                                {isLoadingMore ? 'Chargement...' : 'Charger plus'}
                              </Button>
                            </div>
                          </>
                        ) : allJobs.length > 0 ? (
                          <p className="text-gray-500 py-8">Fin de la liste</p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN - RECOMMENDATIONS */}
          <div className={`${
            mobileView === "left" || mobileView === "center" ? "hidden" : ""
          } lg:col-span-3 lg:block`}>
            <div className="space-y-6 sticky top-24">
              {/* Formations recommandées */}
              <Card className="p-6 border-0 shadow-md">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  Formations recommandées
                </h3>
                <div className="space-y-3">
                  {formations.length > 0 ? (
                    formations.map((formation: Record<string, unknown>) => (
                      <Link key={String(formation.id)} to={`/formations`} className="block p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-secondary">
                        <p className="font-semibold text-sm line-clamp-1">{String(formation.title || formation.name || "Formation")}</p>
                        <p className="text-xs text-muted-foreground">{String(formation.provider || "Formation")}</p>
                        <p className="text-xs text-secondary mt-1">⏱️ Découvrez le contenu</p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Aucune formation disponible</p>
                  )}
                </div>
                <Button asChild variant="outline" className="w-full mt-4" size="sm">
                  <Link to="/formations">
                    Découvrir toutes les formations
                  </Link>
                </Button>
              </Card>

              {/* Entreprises à découvrir */}
              <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Entreprises à découvrir
                </h3>
                <div className="space-y-3">
                  {candidates.filter((c: Record<string, unknown>) => c.user_type === 'company').slice(0, 5).length > 0 ? (
                    candidates
                      .filter((c: Record<string, unknown>) => c.user_type === 'company')
                      .slice(0, 5)
                      .map((company: Record<string, unknown>) => (
                        <Link key={String(company.id)} to={`/utilisateur/${String(company.id)}`} className="block p-3 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer border-l-4 border-purple-500 hover:border-purple-600">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0 border border-purple-200">
                              <AvatarImage src={String(company.profile_image_url)} alt={String(company.company_name)} />
                              <AvatarFallback className="text-xs bg-purple-500 text-white">
                                {(String(company.company_name) || "")
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm line-clamp-1 text-gray-900">{String(company.company_name)}</p>
                              <p className="text-xs text-gray-600 line-clamp-1">Entreprise</p>
                              <p className="text-xs text-purple-600 mt-1 font-semibold">⭐ Offres disponibles</p>
                            </div>
                          </div>
                        </Link>
                      ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Aucune entreprise disponible</p>
                  )}
                </div>
                <Button asChild variant="outline" className="w-full mt-4 border-purple-500 text-purple-600 hover:bg-purple-50" size="sm">
                  <Link to="/entreprises">
                    Consulter toutes les entreprises
                  </Link>
                </Button>
              </Card>

              {/* Conseils de candidature - Hidden for non-authenticated users */}
            </div>
          </div>
        </div>
      </div>

      {/* BottomNavigation moved to PWALayout - removed here */}
    </div>
    </PWALayout>
  );
};

export default Jobs;