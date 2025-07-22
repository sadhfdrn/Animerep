import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { ArrowLeft, Download, Settings, Heart, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { ISource, IEpisodeServer, StreamingServers, SubOrDub, IAnimeInfo } from '@shared/schema';
import { apiRequest, queryClient } from '../lib/queryClient';

export function Watch() {
  const [, params] = useRoute('/watch/:id/:episodeId');
  const animeId = params?.id;
  const episodeId = params?.episodeId;

  const [selectedServer, setSelectedServer] = useState<StreamingServers>(StreamingServers.MegaUp);
  const [selectedSubOrDub, setSelectedSubOrDub] = useState<SubOrDub>(SubOrDub.SUB);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch anime info
  const { data: animeInfo } = useQuery<IAnimeInfo>({
    queryKey: ['/api/anime', animeId],
    enabled: !!animeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch episode servers
  const { data: serversData } = useQuery<{ servers: IEpisodeServer[] }>({
    queryKey: ['/api/anime', animeId, 'episode', episodeId, 'servers', { subOrDub: selectedSubOrDub }],
    enabled: !!animeId && !!episodeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch episode sources
  const { data: sourcesData, isLoading: sourcesLoading, error: sourcesError } = useQuery<ISource>({
    queryKey: ['/api/anime', animeId, 'episode', episodeId, 'sources', { server: selectedServer, subOrDub: selectedSubOrDub }],
    enabled: !!animeId && !!episodeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update watch progress
  const updateProgressMutation = useMutation({
    mutationFn: ({ progress }: { progress: number }) =>
      apiRequest(`/api/user/progress/${animeId}`, {
        method: 'POST',
        body: JSON.stringify({ episodeId, progress }),
      }),
  });

  const currentEpisode = animeInfo?.episodes?.find(ep => ep.id === episodeId);
  const currentEpisodeIndex = animeInfo?.episodes?.findIndex(ep => ep.id === episodeId) ?? -1;
  const previousEpisode = currentEpisodeIndex > 0 ? animeInfo?.episodes?.[currentEpisodeIndex - 1] : null;
  const nextEpisode = currentEpisodeIndex !== -1 && animeInfo?.episodes && currentEpisodeIndex < animeInfo.episodes.length - 1 
    ? animeInfo.episodes[currentEpisodeIndex + 1] 
    : null;

  const handleVideoProgress = (progress: number) => {
    if (animeId && episodeId) {
      updateProgressMutation.mutate({ progress });
    }
  };

  if (!animeId || !episodeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Invalid episode</h2>
          <p className="text-muted-foreground mb-4">The episode you're trying to watch doesn't exist.</p>
          <Link href="/" className="bg-primary text-white px-4 py-2 rounded-lg">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative z-50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/anime/${animeId}`}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to {animeInfo?.title || 'Anime'}</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="flex items-center space-x-3">
              {/* Download button */}
              {sourcesData?.download && (
                <a
                  href={sourcesData.download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white/80 hover:text-white transition-colors"
                  title="Download Episode"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative">
        <div className="video-container bg-black">
          {sourcesLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="loading-shimmer w-16 h-16 rounded-full mx-auto mb-4" />
                <p>Loading video sources...</p>
              </div>
            </div>
          ) : sourcesError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center bg-red-600/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Failed to load video</h3>
                <p className="text-sm mb-4">Unable to fetch video sources for this episode</p>
                <button
                  onClick={() => queryClient.invalidateQueries({ 
                    queryKey: ['/api/anime', animeId, 'episode', episodeId, 'sources']
                  })}
                  className="bg-primary text-white px-4 py-2 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : sourcesData?.sources && sourcesData.sources.length > 0 ? (
            <div className="w-full h-full">
              {sourcesData.sources[0].isM3U8 ? (
                <video
                  className="w-full h-full"
                  controls
                  autoPlay
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    const progress = (video.currentTime / video.duration) * 100;
                    if (progress > 5) { // Only track meaningful progress
                      handleVideoProgress(progress);
                    }
                  }}
                >
                  <source src={sourcesData.sources[0].url} type="application/x-mpegURL" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={sourcesData.sources[0].url}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-lg font-semibold mb-2">No video sources available</h3>
                <p className="text-sm">Try selecting a different server or quality option</p>
              </div>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white min-w-64 z-40">
            <h3 className="font-semibold mb-4">Player Settings</h3>
            
            {/* Quality/Server Selection */}
            {serversData?.servers && serversData.servers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Server</label>
                <select
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value as StreamingServers)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  {serversData.servers.map((server) => (
                    <option key={server.name} value={server.name.toLowerCase()}>
                      {server.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sub/Dub Selection */}
            {animeInfo?.subOrDub === SubOrDub.BOTH && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Language</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedSubOrDub(SubOrDub.SUB)}
                    className={`flex-1 py-2 px-3 rounded transition-colors ${
                      selectedSubOrDub === SubOrDub.SUB
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    SUB
                  </button>
                  <button
                    onClick={() => setSelectedSubOrDub(SubOrDub.DUB)}
                    className={`flex-1 py-2 px-3 rounded transition-colors ${
                      selectedSubOrDub === SubOrDub.DUB
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    DUB
                  </button>
                </div>
              </div>
            )}

            {/* Download Option */}
            {sourcesData?.download && (
              <div className="pt-4 border-t border-white/20">
                <a
                  href={sourcesData.download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Episode</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Episode Info and Controls */}
      <div className="bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                {animeInfo?.title}
              </h1>
              <p className="text-muted-foreground">
                Episode {currentEpisode?.number}
                {currentEpisode?.title && ` - ${currentEpisode.title}`}
              </p>
            </div>

            {/* Episode Navigation */}
            <div className="flex items-center space-x-2">
              {previousEpisode && (
                <Link
                  href={`/watch/${animeId}/${previousEpisode.id}`}
                  className="flex items-center space-x-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Link>
              )}
              {nextEpisode && (
                <Link
                  href={`/watch/${animeId}/${nextEpisode.id}`}
                  className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <SkipForward className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Episode List */}
          {animeInfo?.episodes && animeInfo.episodes.length > 1 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4">All Episodes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {animeInfo.episodes.map((episode) => (
                  <Link
                    key={episode.id}
                    href={`/watch/${animeId}/${episode.id}`}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      episode.id === episodeId
                        ? 'bg-primary text-white'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    <div className="font-semibold">{episode.number}</div>
                    {episode.isFiller && (
                      <div className="text-xs opacity-75 mt-1">Filler</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}