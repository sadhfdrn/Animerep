import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Play, Heart, Download, Star, Calendar, Clock, Info, ArrowLeft } from 'lucide-react';
import { IAnimeInfo, SubOrDub } from '@shared/schema';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeGrid } from '../components/AnimeGrid';
import { LoadingGrid } from '../components/LoadingGrid';
import { apiRequest, queryClient } from '../lib/queryClient';

export function AnimeDetail() {
  const [, params] = useRoute('/anime/:id');
  const animeId = params?.id;
  
  const [selectedSubOrDub, setSelectedSubOrDub] = useState<SubOrDub>(SubOrDub.SUB);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch anime details
  const { data: animeInfo, isLoading, error } = useQuery<IAnimeInfo>({
    queryKey: ['/api/anime', animeId],
    enabled: !!animeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/user/favorites/${id}`, { method: 'POST' }),
    onSuccess: () => {
      setIsFavorited(true);
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/user/favorites/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      setIsFavorited(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    },
  });

  const toggleFavorite = () => {
    if (!animeId) return;
    
    if (isFavorited) {
      removeFromFavoritesMutation.mutate(animeId);
    } else {
      addToFavoritesMutation.mutate(animeId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* Loading skeleton */}
          <div className="mb-6">
            <div className="h-8 bg-muted loading-shimmer rounded w-32 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="aspect-[3/4] bg-muted loading-shimmer rounded-lg" />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-muted loading-shimmer rounded w-3/4" />
                <div className="h-4 bg-muted loading-shimmer rounded w-1/2" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted loading-shimmer rounded" />
                  <div className="h-4 bg-muted loading-shimmer rounded" />
                  <div className="h-4 bg-muted loading-shimmer rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !animeInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Anime not found</h2>
            <p className="mb-4">The anime you're looking for doesn't exist or couldn't be loaded.</p>
            <Link href="/" className="bg-primary text-white px-4 py-2 rounded-lg">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back button */}
      <div className="container mx-auto px-4 pt-6">
        <Link href="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Hero section with anime details */}
      <div className="relative">
        {animeInfo.banner && (
          <div className="absolute inset-0 h-96">
            <img
              src={animeInfo.banner}
              alt={animeInfo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-card shadow-xl">
                  {animeInfo.image ? (
                    <img
                      src={animeInfo.image}
                      alt={animeInfo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Play className="w-16 h-16 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-6 space-y-3">
                  {animeInfo.episodes && animeInfo.episodes.length > 0 && (
                    <Link
                      href={`/watch/${animeId}/${animeInfo.episodes[0].id}`}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      <span>Watch Now</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={toggleFavorite}
                    disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                    className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
                      isFavorited
                        ? 'bg-accent/10 text-accent border border-accent'
                        : 'bg-card hover:bg-muted text-foreground border border-border'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    <span>{isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                  </button>
                </div>

                {/* Anime stats */}
                <div className="mt-6 bg-card rounded-lg p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Information</h3>
                  <div className="space-y-2 text-sm">
                    {animeInfo.type && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="text-foreground font-medium">{animeInfo.type}</span>
                      </div>
                    )}
                    {animeInfo.status && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-foreground font-medium">{animeInfo.status}</span>
                      </div>
                    )}
                    {animeInfo.totalEpisodes && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Episodes:</span>
                        <span className="text-foreground font-medium">{animeInfo.totalEpisodes}</span>
                      </div>
                    )}
                    {animeInfo.season && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Season:</span>
                        <span className="text-foreground font-medium">{animeInfo.season}</span>
                      </div>
                    )}
                    {animeInfo.subOrDub && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="text-foreground font-medium">
                          {animeInfo.subOrDub === SubOrDub.BOTH ? 'SUB & DUB' : animeInfo.subOrDub.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Title and basic info */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {animeInfo.title}
                  </h1>
                  {animeInfo.japaneseTitle && (
                    <p className="text-lg text-muted-foreground mb-4">
                      {animeInfo.japaneseTitle}
                    </p>
                  )}

                  {/* Genre tags */}
                  {animeInfo.genres && animeInfo.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {animeInfo.genres.map((genre) => (
                        <span
                          key={genre}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                {animeInfo.description && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center space-x-2">
                      <Info className="w-5 h-5" />
                      <span>Synopsis</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {animeInfo.description}
                    </p>
                  </div>
                )}

                {/* Episodes */}
                {animeInfo.episodes && animeInfo.episodes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <Play className="w-5 h-5" />
                        <span>Episodes</span>
                      </h2>
                      
                      {/* Sub/Dub toggle */}
                      {animeInfo.subOrDub === SubOrDub.BOTH && (
                        <div className="flex bg-card rounded-lg p-1 border border-border">
                          <button
                            onClick={() => setSelectedSubOrDub(SubOrDub.SUB)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              selectedSubOrDub === SubOrDub.SUB
                                ? 'bg-primary text-white'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            SUB
                          </button>
                          <button
                            onClick={() => setSelectedSubOrDub(SubOrDub.DUB)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              selectedSubOrDub === SubOrDub.DUB
                                ? 'bg-primary text-white'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            DUB
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {animeInfo.episodes.map((episode) => (
                        <Link
                          key={episode.id}
                          href={`/watch/${animeId}/${episode.id}`}
                          className="bg-card hover:bg-muted rounded-lg p-4 transition-colors border border-border hover:border-primary/50 group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              Episode {episode.number}
                            </span>
                            <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          {episode.title && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {episode.title}
                            </p>
                          )}
                          {episode.isFiller && (
                            <span className="inline-block bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs font-medium mt-2">
                              Filler
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related anime */}
      {animeInfo.recommendations && animeInfo.recommendations.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">You might also like</h2>
          <AnimeGrid>
            {animeInfo.recommendations.slice(0, 6).map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </AnimeGrid>
        </div>
      )}
    </div>
  );
}