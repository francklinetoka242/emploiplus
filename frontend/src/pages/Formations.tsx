// src/pages/Formations.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { FormationListItem } from "@/components/formations/FormationListItem";
import FormationSearchCompact from "@/components/formations/FormationSearchCompact";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar";
import { PWALayout } from '@/components/layout/PWALayout';
import { toast } from "sonner";
import { BookOpen, AlertCircle } from "lucide-react";

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
  const [isLoadingMore, setIsLoadingMore] = useState(false); // used for manual load more button
  // expansion state no longer needed
  const loaderRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<"left" | "center" | "right">("center");
  const [filters, setFilters] = useState<{
    search: string;
    category: string;
    sort?: "recent" | "az" | "price";
  }>({
    search: "",
    category: "",
    sort: "recent", // default to recent
  });

  useEffect(() => {
    const enrolled = localStorage.getItem("enrolledFormations");
    if (enrolled) {
      setEnrolledFormations(JSON.parse(enrolled));
    }
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setAllFormations([]);
    setPage(1);
    setHasMore(true);
  }, [filters]);

  // Fetch formations with pagination
  const { data: formationsData = { formations: [], total: 0 }, isLoading } = useQuery({
    queryKey: ["formations", page, filters],
    queryFn: async () => {
      const response = await api.getFormations({
        limit: 10,
        offset: (page - 1) * 10,
        search: filters.search || undefined,
        category: filters.category || undefined,
        sort: filters.sort || undefined,
        published: true, // only show published formations
      });
      // API returns { data: [formations] }
      const formations = response?.data || [];
      return { formations, total: formations.length };
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });

  // Update allFormations when new data arrives
  useEffect(() => {
    if (isLoading) return;

    let newFormations = Array.isArray(formationsData?.formations)
      ? formationsData.formations
      : [];

    // simple client sort
    if (filters.sort) {
      newFormations = [...newFormations].sort((a, b) => {
        switch (filters.sort) {
          case "az":
            return String(a.title || "").localeCompare(String(b.title || ""));
          case "price":
            return (Number(a.price) || 0) - (Number(b.price) || 0);
          case "recent":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default:
            return 0;
        }
      });
    }

    if (page === 1) {
      setAllFormations(newFormations);
    } else {
      setAllFormations((prev) => [...prev, ...newFormations]);
    }

    setHasMore(newFormations.length >= 10);
    setIsLoadingMore(false);
  }, [formationsData, isLoading, page, filters.sort]);

  // Initial load is handled by the useQuery above

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
          {/* simple grid skeleton instead of sidebar-heavy layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
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
        {/* Search bar */}
        <div className="mb-6">
          <FormationSearchCompact onFilterChange={setFilters} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allFormations.map((formation) => (
                    <FormationListItem
                      key={formation.id}
                      formation={formation}
                      onEnroll={() => handleEnrollClick(formation)}
                      isEnrolled={enrolledFormations.includes(formation.id)}
                    />
                  ))}
                </div>

                {/* Infinite scroll loader */}
                <div ref={loaderRef} className="col-span-full py-8 text-center">
                  {hasMore ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-40 rounded-lg" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-4">Chargement des formations...</p>
                    </>
                  ) : allFormations.length > 0 ? (
                    <p className="text-gray-500 py-8">Fin de la liste</p>
                  ) : null}
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