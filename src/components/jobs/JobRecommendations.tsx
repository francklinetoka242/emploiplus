import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Star, ExternalLink } from "lucide-react";
import { authHeaders } from '@/lib/headers';

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  sector: string;
  type: string;
  description: string;
  application_url?: string;
  recommendation_score?: number;
}

export default function JobRecommendations() {
  const { user, token } = useAuth();
  
  // Only fetch recommendations if user is authenticated
  const { data: recommendations = [], isLoading } = useQuery<JobRecommendation[]>({
    queryKey: ["job-recommendations"],
    queryFn: async () => {
      const response = await fetch("/api/jobs/recommendations/for-me", {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      return response.json();
    },
    enabled: !!user && !!token,
    staleTime: 1000 * 60 * 5,
  });

  if (!user || !token) {
    return null; // Don't show recommendations if user is not logged in
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-muted-foreground">
          Aucune recommandation pour le moment. Complétez votre profil pour voir des suggestions personnalisées.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.map((job) => {
        const scorePercentage = Math.min(100, ((job.recommendation_score || 0) / 100) * 100);
        
        return (
          <Card key={String(job.id)} className="hover:shadow-lg transition border-l-4 border-l-primary">
            <CardContent className="p-6">
              {/* Header with score */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold">{String(job.title)}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {String(job.company)} • {String(job.location)}
                  </p>
                </div>
                
                {/* Recommendation score */}
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center">
                      <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{Math.round(scorePercentage)}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Match</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {String(job.description)}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.sector && <Badge variant="secondary">{String(job.sector)}</Badge>}
                {job.type && <Badge variant="outline">{String(job.type)}</Badge>}
              </div>

              {/* Footer with action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {String(job.location)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    Recommandé pour vous
                  </div>
                </div>
                
                {job.application_url && (
                  <Button
                    size="sm"
                    asChild
                    className="ml-auto"
                  >
                    <a
                      href={String(job.application_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Postuler
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
