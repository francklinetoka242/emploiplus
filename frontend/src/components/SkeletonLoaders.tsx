import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface SkeletonLoadersProps {
  count?: number;
  type?: 'job-card' | 'service-card' | 'minimal';
}

export function SkeletonLoaders({ count = 6, type = 'job-card' }: SkeletonLoadersProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'job-card') {
    return (
      <div className="space-y-4">
        {items.map((i) => (
          <Card key={i} className="p-4 space-y-3">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Company skeleton */}
            <Skeleton className="h-4 w-1/2" />
            
            {/* Details row */}
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'service-card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <Card key={i} className="overflow-hidden">
            {/* Image skeleton */}
            <Skeleton className="h-40 w-full" />
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="pt-2 flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
  );
}
