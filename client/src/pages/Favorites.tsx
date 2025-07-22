import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Trash2 } from 'lucide-react';
import { IAnimeResult } from '@shared/schema';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeGrid } from '../components/AnimeGrid';
import { LoadingGrid } from '../components/LoadingGrid';
import { apiRequest } from '../lib/queryClient';

export function Favorites() {
  // Fetch user favorites
  const { data: favoritesData, isLoading } = useQuery<{ favoriteIds: string[] }>({
    queryKey: ['/api/user/favorites'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch anime details for favorited anime (simplified - in real app would batch fetch)
  const favoriteAnime: IAnimeResult[] = []; // This would be populated from favoriteIds

  const removeFavorite = async (animeId: string) => {
    try {
      await apiRequest(`/api/user/favorites/${animeId}`, {
        method: 'DELETE',
      });
      // Invalidate favorites query to refetch
      // queryClient.invalidateQueries(['/api/user/favorites']);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="w-6 h-6 text-accent" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Favorites</h1>
          </div>
          <p className="text-muted-foreground">
            Keep track of your favorite anime series and movies
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingGrid count={8} />
        ) : !favoritesData?.favoriteIds || favoritesData.favoriteIds.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start adding anime to your favorites by clicking the heart icon on any anime
            </p>
            <a
              href="/search"
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <span>Find Anime</span>
            </a>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Your Collection
                <span className="text-muted-foreground font-normal ml-2">
                  ({favoritesData.favoriteIds.length} anime)
                </span>
              </h2>
              {favoritesData.favoriteIds.length > 0 && (
                <button className="text-muted-foreground hover:text-destructive transition-colors text-sm font-medium flex items-center space-x-1">
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <AnimeGrid>
              {favoriteAnime.map((anime) => (
                <div key={anime.id} className="relative">
                  <AnimeCard anime={anime} />
                  <button
                    onClick={() => removeFavorite(anime.id)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-destructive/80 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </AnimeGrid>

            {/* Statistics */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Total Favorites</h3>
                <p className="text-2xl font-bold text-primary">
                  {favoritesData.favoriteIds.length}
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Recently Added</h3>
                <p className="text-2xl font-bold text-secondary">
                  {favoritesData.favoriteIds.slice(0, 5).length}
                </p>
                <p className="text-sm text-muted-foreground">Last 5 favorites</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Collection Score</h3>
                <p className="text-2xl font-bold text-accent">
                  {favoritesData.favoriteIds.length > 0 ? 'Great!' : '-'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {favoritesData.favoriteIds.length > 10
                    ? 'Amazing collection!'
                    : favoritesData.favoriteIds.length > 5
                    ? 'Growing nicely!'
                    : 'Just getting started'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}