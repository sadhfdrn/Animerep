import React from 'react';

interface AnimeGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimeGrid({ children, className = '' }: AnimeGridProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 anime-grid ${className}`}>
      {children}
    </div>
  );
}