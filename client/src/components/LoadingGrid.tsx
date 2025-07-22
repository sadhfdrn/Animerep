import React from 'react';

interface LoadingGridProps {
  count?: number;
  className?: string;
}

export function LoadingGrid({ count = 8, className = '' }: LoadingGridProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg overflow-hidden border border-border/50">
          <div className="aspect-[3/4] bg-muted loading-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted loading-shimmer rounded w-3/4" />
            <div className="h-3 bg-muted loading-shimmer rounded w-1/2" />
            <div className="flex items-center space-x-2">
              <div className="h-3 bg-muted loading-shimmer rounded w-12" />
              <div className="h-3 bg-muted loading-shimmer rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}