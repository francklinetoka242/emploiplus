import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, MapPin, Calendar, ChevronDown, ChevronUp, Award, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormationItemProps {
  formation: Record<string, unknown>;
  isExpanded: boolean;
  onToggle: () => void;
  onEnroll: () => void;
  isEnrolled?: boolean;
}

export function FormationListItem({
  formation,
  isExpanded,
  onToggle,
  onEnroll,
  isEnrolled,
}: FormationItemProps) {
  const [fullDescription, setFullDescription] = useState<string>("");
  const [loadingDescription, setLoadingDescription] = useState(false);

  // Truncate description to preview (first 150 characters)
  const getPreviewDescription = () => {
    const desc = String(formation.description || "");
    if (desc.length > 150) {
      return desc.substring(0, 150) + "...";
    }
    return desc;
  };

  // Check if deadline has passed
  const isDeadlinePassed = () => {
    if (!formation.enrollment_deadline) return false;
    return new Date(String(formation.enrollment_deadline)) < new Date();
  };

  // Load full description when expanded
  useEffect(() => {
    if (isExpanded && !fullDescription && formation.description) {
      setLoadingDescription(true);
      // Simulate lazy loading delay
      setTimeout(() => {
        setFullDescription(String(formation.description || ""));
        setLoadingDescription(false);
      }, 300);
    }
  }, [isExpanded, fullDescription, formation.description]);

  const getDeadlineText = () => {
    if (!formation.enrollment_deadline) return null;
    const deadline = new Date(String(formation.enrollment_deadline));
    const today = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return <span className="text-red-600 font-medium">Inscriptions fermées</span>;
    }
    if (daysLeft === 0) {
      return <span className="text-orange-600 font-medium">Dernier jour</span>;
    }
    return <span className="text-green-600">{daysLeft} jours restants</span>;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Formation Title */}
            <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">
              {formation.title}
            </h3>

            {/* Provider */}
            {formation.provider && (
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {formation.provider}
              </p>
            )}
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="w-10 h-10 p-0 flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Formation Details Row */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {formation.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {formation.location}
            </span>
          )}
          {formation.duration && (
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              {formation.duration}
            </span>
          )}
          {formation.level && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formation.level}
            </span>
          )}
        </div>

        {/* Deadline Status */}
        {formation.enrollment_deadline && (
          <div className="text-sm">
            {getDeadlineText()}
          </div>
        )}

        {/* Tags */}
        {formation.category && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{formation.category}</Badge>
            {formation.specialization && (
              <Badge variant="outline">{String(formation.specialization)}</Badge>
            )}
          </div>
        )}

        {/* Description Preview / Full */}
        <div>
          <p className="text-sm text-gray-700">
            {isExpanded ? fullDescription : getPreviewDescription()}
          </p>
          {isExpanded && loadingDescription && (
            <p className="text-xs text-gray-400 mt-2">Chargement...</p>
          )}
        </div>

        {/* Action Buttons */}
        {isExpanded && (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button
                onClick={onEnroll}
                disabled={isDeadlinePassed() || isEnrolled}
                className="flex-1"
                size="sm"
                variant={isEnrolled ? "outline" : "default"}
              >
                {isEnrolled ? "✓ Inscrit" : "S'inscrire"}
              </Button>
              <Button
                variant="outline"
                onClick={onToggle}
                size="sm"
                className="flex-1"
              >
                Fermer
              </Button>
            </div>

            <div className="flex gap-2">
              {(() => {
                const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/formations/${formation.id}` : `/formations/${formation.id}`;
                const title = String(formation.title || 'Formation');
                const text = `${title} - ${String(formation.provider || '')}`;
                return (
                  <>
                    <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank')}>
                      <Share2 className="w-4 h-4 mr-2" /> WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}>
                      Facebook
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                      LinkedIn
                    </Button>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
