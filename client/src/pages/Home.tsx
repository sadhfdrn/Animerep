import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Play, Star, Calendar, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { IAnimeResult, ISearch } from '@shared/schema';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeGrid } from '../components/AnimeGrid';
import { LoadingGrid } from '../components/LoadingGrid';

export function Home() {
  // Fetch spotlight anime
  const { data: spotlightData, isLoading: spotlightLoading } = useQuery<ISearch<IAnimeResult>>({
    queryKey: ['/api/spotlight'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch recently updated anime
  const { data: recentUpdatesData, isLoading: recentUpdatesLoading } = useQuery<ISearch<IAnimeResult>>({
    queryKey: ['/api/recent-updates'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recently added anime
  const { data: recentAddedData, isLoading: recentAddedLoading } = useQuery<ISearch<IAnimeResult>>({
    queryKey: ['/api/recent'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch completed anime
  const { data: completedData, isLoading: completedLoading } = useQuery<ISearch<IAnimeResult>>({
    queryKey: ['/api/completed'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section - Spotlight Anime */}
      <section className="relative mb-8 md:mb-12">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Today</h2>
          </div>
          
          {spotlightLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-video bg-muted rounded-lg loading-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {spotlightData?.results.slice(0, 6).map((anime) => (
                <Link key={anime.id} href={`/anime/${anime.id}`}>
                  <div className="group relative aspect-video bg-card rounded-lg overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    {anime.banner && (
                      <img
                        src={anime.banner}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <h3 className="text-white font-semibold text-lg md:text-xl mb-2 group-hover:text-primary transition-colors">
                        {anime.title}
                      </h3>
                      {anime.description && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                          {anime.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {anime.type && (
                          <span className="bg-primary/20 text-primary px-2 py-1 rounded">
                            {anime.type}
                          </span>
                        )}
                        {anime.sub && anime.sub > 0 && (
                          <span className="flex items-center space-x-1">
                            <span>SUB {anime.sub}</span>
                          </span>
                        )}
                        {anime.dub && anime.dub > 0 && (
                          <span className="flex items-center space-x-1">
                            <span>DUB {anime.dub}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-black/50 p-2 rounded-full group-hover:bg-primary/80 transition-colors">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently Updated Section */}
      <section className="mb-8 md:mb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-secondary" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Recently Updated</h2>
            </div>
            <Link href="/browse?filter=recent-updates" className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              View All
            </Link>
          </div>
          
          {recentUpdatesLoading ? (
            <LoadingGrid count={8} />
          ) : (
            <AnimeGrid>
              {recentUpdatesData?.results.slice(0, 8).map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </AnimeGrid>
          )}
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="mb-8 md:mb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Recently Added</h2>
            </div>
            <Link href="/browse?filter=recent" className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              View All
            </Link>
          </div>
          
          {recentAddedLoading ? (
            <LoadingGrid count={8} />
          ) : (
            <AnimeGrid>
              {recentAddedData?.results.slice(0, 8).map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </AnimeGrid>
          )}
        </div>
      </section>

      {/* Completed Series Section */}
      <section className="mb-8 md:mb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-accent" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Completed Series</h2>
            </div>
            <Link href="/browse?filter=completed" className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              View All
            </Link>
          </div>
          
          {completedLoading ? (
            <LoadingGrid count={8} />
          ) : (
            <AnimeGrid>
              {completedData?.results.slice(0, 8).map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </AnimeGrid>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/search" className="group">
              <div className="bg-card hover:bg-card/80 rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 border border-border hover:border-primary/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Search Anime</h3>
                <p className="text-sm text-muted-foreground">Find your favorite series</p>
              </div>
            </Link>
            
            <Link href="/browse" className="group">
              <div className="bg-card hover:bg-card/80 rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 border border-border hover:border-secondary/50">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary/20 transition-colors">
                  <Compass className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Browse Genres</h3>
                <p className="text-sm text-muted-foreground">Explore by category</p>
              </div>
            </Link>
            
            <Link href="/favorites" className="group">
              <div className="bg-card hover:bg-card/80 rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 border border-border hover:border-accent/50">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">My Favorites</h3>
                <p className="text-sm text-muted-foreground">Your saved anime</p>
              </div>
            </Link>
            
            <Link href="/browse?filter=random" className="group">
              <div className="bg-card hover:bg-card/80 rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 border border-border hover:border-primary/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Random Anime</h3>
                <p className="text-sm text-muted-foreground">Discover something new</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}