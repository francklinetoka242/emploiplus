// src/pages/Formations.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { FormationListItem } from "@/components/formations/FormationListItem";
import FormationSearchPro from "@/components/formations/FormationSearchPro";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar";
import { PWALayout } from '@/components/layout/PWALayout';
import { toast } from "sonner";
import { Clock, Users, DollarSign, BookOpen, Calendar, AlertCircle, CheckCircle, Briefcase, User, TrendingUp } from "lucide-react";

interface Formation {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  price?: number;
  image_url?: string;
  published?: boolean;
  published_at?: string;
  created_at: string;
  enrollment_deadline?: string;
  participants_count?: number;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type?: string;
  description?: string;
}

export default function Formations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledFormations, setEnrolledFormations] = useState<number[]>([]);
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedFormationId, setExpandedFormationId] = useState<number | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<"left" | "center" | "right">("center");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    level: "",
    priceRange: "",
    provider: "",
    country: "",
    recent: true,
  });

  useEffect(() => {
    const enrolled = localStorage.getItem("enrolledFormations");
    if (enrolled) {
      setEnrolledFormations(JSON.parse(enrolled));
    }
  }, []);

  // Reset pagination when filters change but don't clear on default state
  useEffect(() => {
    // Do not reset if user types a short search (<3 chars)
    if (filters.search && filters.search.length > 0 && filters.search.length < 3) return;

    const defaultFilters = {
      search: "",
      category: "",
      level: "",
      priceRange: "",
      provider: "",
      country: "",
      recent: true,
    };
    const isDefault = Object.keys(defaultFilters).every(
      (k) => (filters as any)[k] === (defaultFilters as any)[k]
    );
    if (isDefault) {
      return;
    }

    setAllFormations([]);
    setPage(1);
    setHasMore(true);
  }, [filters]);

  // Fetch formations with pagination
  const { data: formationsData = { formations: [], total: 0 }, isLoading } = useQuery({
    queryKey: ["formations", page, filters],
    queryFn: async () => {
      const response = await api.getFormations({
        q: filters.search || '',
        provider: filters.provider || '',
        country: filters.country || '',
        category: filters.category || '',
        level: filters.level || '',
        limit: 10,
        offset: (page - 1) * 10,
        sortBy: 'created_at',
        sortOrder: filters.recent ? 'DESC' : 'ASC',
      });
      // Handle both array and object responses
      const unwrap = (r: any) => Array.isArray(r) ? r : (r?.data?.data ?? r?.data ?? r?.formations ?? r);
      const data = unwrap(response) || [];
      const total = response?.total ?? response?.pagination?.total ?? data.length;
      return { formations: data, total };
    },
    // Block search requests when search is present but <3 chars
    enabled: !(filters.search && filters.search.length > 0 && filters.search.length < 3),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10, // Keep cached data for 10 minutes
  });

  // Update allFormations when new data arrives
  useEffect(() => {
    if (isLoading) return;

    const newFormations = Array.isArray(formationsData?.formations)
      ? formationsData.formations
      : [];

    if (page === 1) {
      setAllFormations(newFormations);
    } else {
      setAllFormations((prev) => [...prev, ...newFormations]);
    }

    // Check if there are more formations to load
    setHasMore(newFormations.length >= 10);
    setIsLoadingMore(false);
  }, [formationsData, isLoading, page]);

  // Ensure initial formations are loaded on mount (show all by default)
  useEffect(() => {
    // Only trigger the query once on mount to show initial data
    // The queryFn from useQuery will handle subsequent loads with filters
  }, []);

  // Infinite scroll handler
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoadingMore(true);
      setPage((p) => p + 1);
    }
  }, [hasMore, isLoading]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", { limit: 5 }],
    queryFn: async () => {
      const res = await api.getJobs({ limit: 5, page: 1, sortBy: 'created_at', sortOrder: 'DESC' });
      const unwrap = (r: any) => Array.isArray(r) ? r : (r?.data?.data ?? r?.data ?? r);
      return unwrap(res) || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return "À venir";
    const deadlineDate = new Date(deadline);
    const today = new Date();
    if (deadlineDate < today) return "Date limite dépassée";
    return deadlineDate.toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handleEnrollClick = (formation: Formation) => {
    if (!user) {
      toast.error("Vous devez être connecté pour vous inscrire");
      return;
    }

    if (enrolledFormations.includes(formation.id)) {
      toast.error("Vous êtes déjà inscrit à cette formation");
      return;
    }

    if (isDeadlinePassed(formation.enrollment_deadline)) {
      toast.error("La date limite d'inscription est dépassée");
      return;
    }

    navigate("/formations/inscription", { state: { formation } });
  };

  // --- RENDU DE CHARGEMENT ET ERREUR ---
  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-12 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <Skeleton className="h-96 rounded-lg" />
            </div>
            <div className="lg:col-span-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU PRINCIPAL AVEC LA RECHERCHE ---
  return (
    <PWALayout notificationCount={0} messageCount={0} hideHeader>
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-0">
        {/* New pro search bar for formations */}
        <div className="mb-6">
          <FormationSearchPro onFilterChange={setFilters} />
        </div>
        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN - SIDEBAR: profile for authenticated users, invite for guests (desktop only) */}
          <div className="lg:col-span-3 hidden lg:block">
            {user ? (
              <ProfileSidebar />
            ) : null}
          </div>

          {/* Center Content - Formations */}
          <div className={`${user ? "lg:col-span-6" : "lg:col-span-9"} lg:block`}>
            {allFormations.length > 0 ? (
              <>
                <div className="space-y-4">
                  {allFormations.map((formation) => (
                    <FormationListItem
                      key={formation.id}
                      formation={formation}
                      isExpanded={expandedFormationId === formation.id}
                      onToggle={() =>
                        setExpandedFormationId(
                          expandedFormationId === formation.id ? null : formation.id
                        )
                      }
                      onEnroll={() => handleEnrollClick(formation)}
                      isEnrolled={enrolledFormations.includes(formation.id)}
                    />
                  ))}

                  {/* Infinite scroll loader */}
                  <div ref={loaderRef} className="py-8 text-center">
                    {hasMore ? (
                      <>
                        <Skeleton className="h-20 rounded-lg" />
                        <p className="text-sm text-gray-500 mt-4">Chargement des formations...</p>
                        <div className="mt-4">
                          <Button onClick={loadMore} disabled={!hasMore || isLoading || isLoadingMore}>
                            {isLoadingMore ? 'Chargement...' : 'Charger plus'}
                          </Button>
                        </div>
                      </>
                    ) : allFormations.length > 0 ? (
                      <p className="text-gray-500 py-8">Fin de la liste</p>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-24">
                <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Aucune formation trouvée</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Sidebar (only for authenticated users) */}
          {user && (
            <div className={`${
              mobileView === "left" || mobileView === "center" ? "hidden" : ""
            } lg:col-span-3 lg:block`}>
              <div className="space-y-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
                {/* Mes formations en cours */}
                <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Mes formations
                  </h3>
                  <div className="space-y-3">
                    {enrolledFormations.length > 0 ? (
                      <p className="text-sm text-blue-700 font-semibold">
                        Vous suivez {enrolledFormations.length} formation{enrolledFormations.length > 1 ? 's' : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Inscrivez-vous à une formation pour commencer</p>
                    )}
                  </div>
                  <Button asChild variant="outline" className="w-full mt-4" size="sm">
                    <a href="#formations">Parcourir les formations</a>
                  </Button>
                </Card>

                {/* Catégories populaires */}
                <Card className="p-6 border-0 shadow-md">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Catégories populaires
                  </h3>
                  <div className="space-y-2">
                    {['Technologie', 'Business', 'Design', 'Marketing', 'Langues'].map((cat) => (
                      <button key={cat} className="block w-full text-left p-2 hover:bg-muted rounded-lg transition-colors text-sm text-gray-700 hover:text-primary">
                        • {cat}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Conseils pour bien choisir */}
                <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Conseils
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li>✓ Vérifiez le niveau requis avant de vous inscrire</li>
                    <li>✓ Consultez les avis d'autres apprenants</li>
                    <li>✓ Respectez les délais d'inscription</li>
                    <li>✓ Planifiez votre emploi du temps</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BottomNavigation moved to PWALayout - removed here */}
    </div>
    </PWALayout>
  );
}