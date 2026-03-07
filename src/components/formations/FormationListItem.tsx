import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface FormationItemProps {
  formation: Record<string, any>;
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
  // we keep a small preview description helper
  const getPreviewDescription = () => {
    const desc = String(formation.description || "");
    if (desc.length > 100) {
      return desc.substring(0, 100) + "...";
    }
    return desc;
  };

  const isDeadlinePassed = () => {
    if (!formation.enrollment_deadline) return false;
    return new Date(String(formation.enrollment_deadline)) < new Date();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 rounded-lg">
      {formation.image_url && (
        <img
          src={String(formation.image_url)}
          alt={String(formation.title) || ""}
          className="w-full h-40 object-cover"
        />
      )}
      <CardContent>
        <h3 className="text-lg font-bold line-clamp-2 text-gray-900">
          {formation.title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {formation.duration && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />{formation.duration}
            </Badge>
          )}
          {formation.level && (
            <Badge variant="outline">{formation.level}</Badge>
          )}
        </div>
        {formation.category && (
          <Badge className="mt-2" variant="secondary">
            {formation.category}
          </Badge>
        )}
        <p className="text-sm text-gray-700 mt-2 line-clamp-3">
          {getPreviewDescription()}
        </p>
        <div className="mt-4">
          <Button
            onClick={onEnroll}
            disabled={isDeadlinePassed() || isEnrolled}
            variant={isEnrolled ? "outline" : "default"}
            className="w-full hover:scale-105 transition-transform"
            size="sm"
          >
            {isEnrolled ? "✓ Inscrit" : "S'inscrire"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
