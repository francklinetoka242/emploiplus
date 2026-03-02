import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function PublicationSkeleton() {
  return (
    <Card className="p-4 mb-6 border-0 shadow-md animate-pulse">
      {/* Header */}
      <div className="flex gap-3 mb-4">
        <Avatar className="h-10 w-10 flex-shrink-0 bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="h-3 bg-muted rounded w-24"></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-4 bg-muted rounded w-4/6"></div>
      </div>

      {/* Image placeholder */}
      <div className="h-64 bg-muted rounded-lg mb-4"></div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t">
        <div className="h-8 bg-muted rounded w-16"></div>
        <div className="h-8 bg-muted rounded w-16"></div>
        <div className="h-8 bg-muted rounded w-16"></div>
      </div>
    </Card>
  );
}
