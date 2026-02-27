import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MapPin, Briefcase, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Candidate {
  id: number;
  full_name: string;
  profile_image_url?: string;
  profession?: string;
  location?: string;
  bio?: string;
  experience_years?: number;
}

const Candidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        if (!res.ok) return setCandidates([]);
        const all = await res.json();
        const filtered = (all || []).filter(
          (u: any) =>
            u.user_type === "candidate" || u.user_type === "candidat"
        );
        setCandidates(filtered);
        if (filtered.length > 0) {
          setSelectedCandidateId(filtered[0].id);
        }
      } catch (e) {
        console.error("Fetch candidates error", e);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const selectedCandidate = candidates.find(
    (c) => c.id === selectedCandidateId
  );
  const selectedIndex = candidates.findIndex((c) => c.id === selectedCandidateId);

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedCandidateId(candidates[selectedIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (selectedIndex < candidates.length - 1) {
      setSelectedCandidateId(candidates[selectedIndex + 1].id);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("candidates-carousel");
    if (container) {
      const scrollAmount = 300;
      const newPosition =
        scrollPosition + (direction === "left" ? -scrollAmount : scrollAmount);
      container.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des candidats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Profils candidats
          </h1>
          <p className="text-gray-600">
            {candidates.length} candidat{candidates.length > 1 ? "s" : ""} inscrits
            sur la plateforme
          </p>
        </div>

        {candidates.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun candidat
            </h3>
            <p className="text-gray-600">
              Les candidats inscrits s'afficheront ici
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detailed Profile */}
            {selectedCandidate && (
              <div className="lg:col-span-2">
                <Card className="p-8 shadow-lg">
                  {/* Profile Header */}
                  <div className="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b">
                    <Avatar className="h-32 w-32 border-4 border-orange-500">
                      <AvatarImage
                        src={selectedCandidate.profile_image_url}
                        alt={selectedCandidate.full_name}
                      />
                      <AvatarFallback className="text-2xl">
                        {(selectedCandidate.full_name || "C")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedCandidate.full_name}
                      </h2>
                      {selectedCandidate.profession && (
                        <div className="flex items-center gap-2 text-orange-600 font-semibold mb-3">
                          <Briefcase className="h-5 w-5" />
                          {selectedCandidate.profession}
                        </div>
                      )}
                      {selectedCandidate.location && (
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <MapPin className="h-5 w-5" />
                          {selectedCandidate.location}
                        </div>
                      )}
                      {selectedCandidate.experience_years && (
                        <div className="text-sm text-gray-600">
                          {selectedCandidate.experience_years} année
                          {selectedCandidate.experience_years > 1 ? "s" : ""} d'expérience
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedCandidate.bio && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        À propos
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedCandidate.bio}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() =>
                      navigate(`/candidate/${selectedCandidate.id}`)
                    }
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                  >
                    Voir le profil complet →
                  </Button>
                </Card>
              </div>
            )}

            {/* Candidates List / Carousel */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Autres candidats
              </h3>

              {/* Carousel on small screens */}
              <div className="lg:hidden">
                <div className="relative">
                  <div
                    id="candidates-carousel"
                    className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {candidates.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCandidateId(c.id)}
                        className={`flex-shrink-0 w-32 h-32 rounded-lg p-3 transition-all ${
                          selectedCandidateId === c.id
                            ? "ring-4 ring-orange-500 bg-orange-50"
                            : "bg-white border border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <Avatar className="h-16 w-16 mx-auto mb-2">
                          <AvatarImage
                            src={c.profile_image_url}
                            alt={c.full_name}
                          />
                          <AvatarFallback>
                            {(c.full_name || "C")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2">
                          {c.full_name}
                        </p>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleScroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-100 hidden"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleScroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6 bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-100 hidden"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* List on large screens */}
              <div className="hidden lg:space-y-3 lg:block max-h-[600px] overflow-y-auto">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCandidateId(c.id)}
                    className={`w-full p-4 rounded-lg transition-all text-left ${
                      selectedCandidateId === c.id
                        ? "ring-2 ring-orange-500 bg-orange-50 border border-orange-300"
                        : "bg-white border border-gray-200 hover:border-orange-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={c.profile_image_url}
                          alt={c.full_name}
                        />
                        <AvatarFallback>
                          {(c.full_name || "C")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 line-clamp-1">
                          {c.full_name}
                        </p>
                        {c.profession && (
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {c.profession}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
