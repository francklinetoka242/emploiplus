// src/pages/Jobs.tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, ExternalLink, ChevronDown, ChevronUp, MapPin, Calendar, Building, Building2, BookOpen, User, Loader2, Search, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PWALayout } from '@/components/layout/PWALayout';
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { BottomNavigation } from "@/components/layout/BottomNavigation";

import JobSearchCompact from "@/components/jobs/JobSearchCompact";
import { toast } from 'sonner';
import SaveJobButton from "@/components/jobs/SaveJobButton";
import { JobListItem } from "@/components/jobs/JobListItem";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authHeaders } from '@/lib/headers';
import { useJobSearch } from "@/hooks/useJobSearch";
import { JobSearchInput } from "@/components/jobs/JobSearchInput";

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
  });

  // Infinite scroll state
  const [allJobs, setAllJobs] = useState<Record<string, unknown>[]>([]);
  const [formations, setFormations] = useState<Record<string, unknown>[]>([]);
  const [candidates, setCandidates] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [expandFilters, setExpandFilters] = useState(false);
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

  // Reset pagination when filters change
  useEffect(() => {
    setAllJobs([]);
    setPage(1);
    setHasMore(true);
  }, [filters]);

  // Fetch formations and candidates for sidebar
  useEffect(() => {
    if (user) {
      fetchFormations();
      fetchCandidates();
    }
  }, [user]);

  // Ensure initial jobs are loaded on mount (show all by default)
  useEffect(() => {
    if (initialJobsLoadedRef.current) return;
    initialJobsLoadedRef.current = true;
    (async () => {
      try {
        const res = await api.getJobs({ page: 1 });
        const newJobs = Array.isArray(res) ? res : (res?.data || []);
        if (newJobs.length > 0) {
          setAllJobs(newJobs);
          const pagination = res?.pagination || {};
          setHasMore(pagination.hasNextPage || false);
        }
      } catch (e) {
        console.error('Initial jobs load failed:', e);
      }
    })();
  }, []);

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations');
      if (response.ok) {
        const data = await response.json();
        setFormations(Array.isArray(data) ? data.slice(0, 5) : []);
      }
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
        company: filters.company || '',
        sector: filters.sector || '',
        type: filters.type && filters.type !== 'all' ? filters.type : '',
        page,
      }),
    enabled: true, // Always load jobs - don't wait for initialization
  });

  // Update allJobs when new data arrives
  useEffect(() => {
    if (isLoading) return;

    // Handle both array and object responses
    const newJobs = Array.isArray(jobsData) ? jobsData : (jobsData?.data || []);

    if (page === 1) {
      setAllJobs(newJobs);
    } else {
      setAllJobs((prev) => [...prev, ...newJobs]);
    }

    // Check if there are more jobs to load
    const pagination = jobsData?.pagination || {};
    setHasMore(pagination.hasNextPage || false);
  }, [jobsData, isLoading, page]);

  // Infinite scroll handler
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setPage((p) => p + 1);
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isLoading]);

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
        {/* Compact Search Bar */}
        <JobSearchCompact onFilterChange={setFilters} />

        {/* Main Content with Two Columns */}
        <div className="container py-6 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN - INVITE NON-AUTHENTICATED USERS TO CREATE ACCOUNT (desktop only) */}
            <div className="lg:col-span-3 hidden lg:block">
              <div className="space-y-6 sticky top-24">
                <Card className="p-6 border-0 shadow-md text-center">
                  <h3 className="text-lg font-bold mb-2">Créez un compte pour voir plus d'offres</h3>
                  <p className="text-sm text-muted-foreground mb-4">Inscrivez-vous pour sauvegarder des offres, postuler et accéder à des recommandations personnalisées.</p>
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full" size="sm">
                      <Link to="/connexion">Se connecter</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" size="sm">
                      <Link to="/inscription">Créer un compte</Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* CENTER & RIGHT COLUMN - JOBS LIST (Main Content) */}
            <div className="lg:col-span-9">
              {/* Search and Filters (visible on desktop) - keep same UI as authenticated view */}
              <Card className="p-4 border-0 shadow-md mb-6">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Poste</label>
                      <input
                        type="text"
                        placeholder="Ex: Développeur..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandFilters(!expandFilters)}
                      className="whitespace-nowrap h-10"
                    >
                      {expandFilters ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Moins
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Plus
                        </>
                      )}
                    </Button>
                  </div>

                  {expandFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Lieu</label>
                        <input
                          type="text"
                          placeholder="Ville..."
                          value={filters.location}
                          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Entreprise</label>
                        <input
                          type="text"
                          placeholder="Nom..."
                          value={filters.company}
                          onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        >
                          <option value="all">Tous</option>
                          <option value="cdi">CDI</option>
                          <option value="cdd">CDD</option>
                          <option value="stage">Stage</option>
                          <option value="freelance">Freelance</option>
                          <option value="apprenticeship">Apprentissage</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Secteur</label>
                        <select
                          value={filters.sector}
                          onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        >
                          <option value="">Tous</option>
                          <option value="tech">Technologie</option>
                          <option value="finance">Finance</option>
                          <option value="healthcare">Santé</option>
                          <option value="education">Éducation</option>
                          <option value="retail">Commerce</option>
                          <option value="manufacturing">Industrie</option>
                          <option value="other">Autres</option>
                        </select>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap h-10 sm:col-span-2 lg:col-span-1"
                        onClick={() =>
                          setFilters({
                            search: "",
                            location: "",
                            country: "",
                            company: "",
                            sector: "",
                            competence: "",
                            type: "all",
                          })
                        }
                      >
                        Réinitialiser
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {isLoading && page === 1 ? (
                <div className="space-y-4 pb-24 md:pb-0">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
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
                            isExpanded={expandedJobId === String(jobItem.id)}
                            onToggle={() =>
                              setExpandedJobId(
                                expandedJobId === String(jobItem.id) ? null : String(jobItem.id)
                              )
                            }
                            onApply={() => {
                              toast.info("Connectez-vous pour postuler");
                              navigate("/connexion");
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
      {/* Compact Search Bar */}
      <JobSearchCompact onFilterChange={setFilters} />

      {/* Main Content with Three Columns */}
      <div className="container py-6 px-4 pb-24 md:pb-0">
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
            {/* Search and Filters Section */}
            <Card className="p-4 border-0 shadow-md mb-6">
              <div className="flex flex-col gap-3">
                {/* Main Filter Row - Poste visible always */}
                <div className="flex gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Poste</label>
                    <input
                      type="text"
                      placeholder="Ex: Développeur..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    />
                  </div>

                  {/* Toggle Advanced Filters */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandFilters(!expandFilters)}
                    className="whitespace-nowrap h-10"
                  >
                    {expandFilters ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Moins
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Plus
                      </>
                    )}
                  </Button>
                </div>

                {/* Advanced Filters - Collapsible */}
                {expandFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                    {/* Location filter */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Lieu</label>
                      <input
                        type="text"
                        placeholder="Ville..."
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      />
                    </div>

                    {/* Company filter */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Entreprise</label>
                      <input
                        type="text"
                        placeholder="Nom..."
                        value={filters.company}
                        onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      />
                    </div>

                    {/* Contract Type filter */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      >
                        <option value="all">Tous</option>
                        <option value="cdi">CDI</option>
                        <option value="cdd">CDD</option>
                        <option value="stage">Stage</option>
                        <option value="freelance">Freelance</option>
                        <option value="apprenticeship">Apprentissage</option>
                      </select>
                    </div>

                    {/* Sector filter */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Secteur</label>
                      <select
                        value={filters.sector}
                        onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      >
                        <option value="">Tous</option>
                        <option value="tech">Technologie</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Santé</option>
                        <option value="education">Éducation</option>
                        <option value="retail">Commerce</option>
                        <option value="manufacturing">Industrie</option>
                        <option value="other">Autres</option>
                      </select>
                    </div>

                    {/* Reset filters button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap h-10 sm:col-span-2 lg:col-span-1"
                      onClick={() =>
                        setFilters({
                          search: "",
                          location: "",
                          country: "",
                          company: "",
                          sector: "",
                          competence: "",
                          type: "all",
                        })
                      }
                    >
                      Réinitialiser
                    </Button>
                  </div>
                )}
              </div>
            </Card>
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
                            if (!expired) {
                              navigate(`/recrutement/postuler/${String(jobItem.id)}`);
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
                            if (!expired) {
                              navigate(`/recrutement/postuler/${String(jobItem.id)}`);
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