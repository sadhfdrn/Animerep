import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { IAnimeResult, ISearch } from '@shared/schema';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeGrid } from '../components/AnimeGrid';
import { LoadingGrid } from '../components/LoadingGrid';
import { useLocation } from 'wouter';

export function Search() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Search results
  const { data: searchResults, isLoading: searchLoading, error } = useQuery<ISearch<IAnimeResult>>({
    queryKey: ['/api/search', { q: debouncedQuery, page }],
    enabled: debouncedQuery.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Search suggestions (for autocomplete)
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery<ISearch<IAnimeResult>>({
    queryKey: ['/api/search/suggestions', { q: query }],
    enabled: query.length > 2 && query !== debouncedQuery,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setDebouncedQuery(query.trim());
      setPage(1);
    }
  };

  const handleSuggestionClick = (suggestion: IAnimeResult) => {
    setLocation(`/anime/${suggestion.id}`);
  };

  const loadMore = () => {
    if (searchResults?.hasNextPage) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Search Anime</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search for anime titles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setDebouncedQuery('');
                  }}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Search Suggestions */}
            {suggestions && suggestions.results.length > 0 && query !== debouncedQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                {suggestions.results.map((anime) => (
                  <button
                    key={anime.id}
                    onClick={() => handleSuggestionClick(anime)}
                    className="w-full text-left p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      {anime.image && (
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{anime.title}</h3>
                        {anime.japaneseTitle && (
                          <p className="text-sm text-muted-foreground truncate">{anime.japaneseTitle}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          {anime.type && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                              {anime.type}
                            </span>
                          )}
                          {anime.year && (
                            <span className="text-xs text-muted-foreground">{anime.year}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-card rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Type
                  </label>
                  <select className="w-full p-2 bg-background border border-border rounded-md text-foreground">
                    <option value="">All Types</option>
                    <option value="TV">TV Series</option>
                    <option value="MOVIE">Movies</option>
                    <option value="OVA">OVA</option>
                    <option value="ONA">ONA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Status
                  </label>
                  <select className="w-full p-2 bg-background border border-border rounded-md text-foreground">
                    <option value="">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ONGOING">Ongoing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Year
                  </label>
                  <select className="w-full p-2 bg-background border border-border rounded-md text-foreground">
                    <option value="">All Years</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {debouncedQuery && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Search Results for "{debouncedQuery}"
                {searchResults?.totalResults && (
                  <span className="text-muted-foreground font-normal ml-2">
                    ({searchResults.totalResults} results)
                  </span>
                )}
              </h2>
            </div>

            {searchLoading && page === 1 ? (
              <LoadingGrid count={12} />
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block">
                  <p className="font-medium">Search failed</p>
                  <p className="text-sm mt-1">Please try again with different keywords</p>
                </div>
              </div>
            ) : searchResults?.results.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground">Try different search terms or browse by genre instead</p>
              </div>
            ) : (
              <>
                <AnimeGrid>
                  {searchResults?.results.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} />
                  ))}
                </AnimeGrid>

                {/* Load More Button */}
                {searchResults?.hasNextPage && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={searchLoading}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {searchLoading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!debouncedQuery && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Search for anime</h3>
            <p className="text-muted-foreground">Enter a title above to find your favorite anime series</p>
          </div>
        )}
      </div>
    </div>
  );
}