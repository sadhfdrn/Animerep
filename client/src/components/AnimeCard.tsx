import React from 'react';
import { Link } from 'wouter';
import { Play, Clock, Star, Download } from 'lucide-react';
import { IAnimeResult } from '@shared/schema';

interface AnimeCardProps {
  anime: IAnimeResult;
  showDownloadButton?: boolean;
}

export function AnimeCard({ anime, showDownloadButton = false }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="group bg-card rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 anime-card border border-border/50 hover:border-primary/50">
        <div className="relative aspect-[3/4] overflow-hidden">
          {anime.image ? (
            <img
              src={anime.image}
              alt={anime.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Play className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-primary/90 p-3 rounded-full backdrop-blur-sm">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
          
          {/* Quality badges */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            {anime.quality && (
              <span className="bg-accent text-white px-2 py-1 rounded text-xs font-semibold">
                {anime.quality}
              </span>
            )}
            {anime.type && (
              <span className="bg-primary/80 text-white px-2 py-1 rounded text-xs font-semibold">
                {anime.type}
              </span>
            )}
          </div>
          
          {/* Episode count badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {anime.sub && anime.sub > 0 && (
              <span className="bg-blue-500/80 text-white px-2 py-1 rounded text-xs font-semibold">
                SUB {anime.sub}
              </span>
            )}
            {anime.dub && anime.dub > 0 && (
              <span className="bg-green-500/80 text-white px-2 py-1 rounded text-xs font-semibold">
                DUB {anime.dub}
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
          
          {anime.japaneseTitle && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {anime.japaneseTitle}
            </p>
          )}
          
          {anime.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {anime.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {anime.year && (
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{anime.year}</span>
                </span>
              )}
              {anime.episodes && (
                <span className="flex items-center space-x-1">
                  <Play className="w-3 h-3" />
                  <span>{anime.episodes} eps</span>
                </span>
              )}
            </div>
            
            {showDownloadButton && (
              <button
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle download logic here
                }}
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {anime.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs"
                >
                  {genre}
                </span>
              ))}
              {anime.genres.length > 3 && (
                <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                  +{anime.genres.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}