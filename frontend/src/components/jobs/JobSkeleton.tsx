import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Company skeleton */}
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Badge and action buttons skeleton */}
          <div className="flex gap-3 flex-shrink-0">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location and info chips */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Description preview */}
        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}

export function JobListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobSkeleton key={i} />
      ))}
    </div>
  );
}
