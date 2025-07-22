import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, Calendar, Filter } from 'lucide-react';
import { IAnimeResult, ISearch } from '@shared/schema';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeGrid } from '../components/AnimeGrid';
import { LoadingGrid } from '../components/LoadingGrid';

export function Browse() {
  const [selectedFilter, setSelectedFilter] = useState<string>('recent-updates');
  const [page, setPage] = useState(1);

  // Fetch browse data based on selected filter
  const { data: browseData, isLoading, error } = useQuery<ISearch<IAnimeResult>>({
    queryKey: ['/api', selectedFilter, { page }],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch genres
  const { data: genresData } = useQuery<{ genres: string[] }>({
    queryKey: ['/api/genres'],
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const filterOptions = [
    { value: 'recent-updates', label: 'Recently Updated', icon: Calendar },
    { value: 'recent', label: 'Recently Added', icon: Calendar },
    { value: 'completed', label: 'Completed', icon: Filter },
  ];

  const loadMore = () => {
    if (browseData?.hasNextPage) {
      setPage(prev => prev + 1);
    }
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Compass className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Browse Anime</h1>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === option.value
                      ? 'bg-primary text-white'
                      : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Genre Filter */}
          {genresData?.genres && genresData.genres.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Browse by Genre</h3>
              <div className="flex flex-wrap gap-2">
                {genresData.genres.slice(0, 20).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleFilterChange(`genre/${genre}`)}
                    className="px-3 py-1.5 bg-card text-muted-foreground hover:text-foreground hover:bg-muted rounded-full text-sm font-medium transition-colors border border-border hover:border-primary/50"
                  >
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {filterOptions.find(f => f.value === selectedFilter)?.label || 'Browse Results'}
              {browseData?.totalResults && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({browseData.totalResults} results)
                </span>
              )}
            </h2>
            
            {browseData?.currentPage && browseData.currentPage > 1 && (
              <span className="text-sm text-muted-foreground">
                Page {browseData.currentPage}
              </span>
            )}
          </div>

          {/* Results Grid */}
          {isLoading && page === 1 ? (
            <LoadingGrid count={12} />
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block">
                <p className="font-medium">Failed to load anime</p>
                <p className="text-sm mt-1">Please try again later</p>
              </div>
            </div>
          ) : browseData?.results.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No anime found</h3>
              <p className="text-muted-foreground">Try selecting a different filter or genre</p>
            </div>
          ) : (
            <>
              <AnimeGrid>
                {browseData?.results.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </AnimeGrid>

              {/* Load More Button */}
              {browseData?.hasNextPage && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Popular Genres Section */}
        {genresData?.genres && genresData.genres.length > 20 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">All Genres</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {genresData.genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleFilterChange(`genre/${genre}`)}
                  className="p-3 bg-card hover:bg-muted rounded-lg text-left transition-colors border border-border hover:border-primary/50 group"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}