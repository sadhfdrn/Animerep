import { z } from 'zod';

// Anime-related enums and types
export enum MediaFormat {
  TV = 'TV',
  MOVIE = 'MOVIE',
  OVA = 'OVA',
  ONA = 'ONA',
  SPECIAL = 'SPECIAL',
  MUSIC = 'MUSIC',
}

export enum MediaStatus {
  COMPLETED = 'COMPLETED',
  ONGOING = 'ONGOING',
  NOT_YET_AIRED = 'NOT_YET_AIRED',
  UNKNOWN = 'UNKNOWN',
}

export enum SubOrDub {
  SUB = 'sub',
  DUB = 'dub',
  BOTH = 'both',
}

export enum StreamingServers {
  MegaUp = 'megaup',
  VidCloud = 'vidcloud',
  StreamSB = 'streamsb',
}

// Base interfaces for anime data
export interface IAnimeResult {
  id: string;
  title: string;
  url?: string;
  image?: string;
  japaneseTitle?: string | null;
  type?: MediaFormat;
  year?: string;
  sub?: number;
  dub?: number;
  episodes?: number;
  genres?: string[];
  releaseDate?: string;
  quality?: string;
  banner?: string | null;
  description?: string;
  airingTime?: string;
  airingEpisode?: string;
}

export interface IAnimeEpisode {
  id: string;
  number: number;
  title?: string;
  isFiller?: boolean;
  isSubbed?: boolean;
  isDubbed?: boolean;
  url?: string;
}

export interface IAnimeInfo extends Omit<IAnimeResult, 'episodes'> {
  totalEpisodes?: number;
  episodes?: IAnimeEpisode[];
  season?: string;
  status?: MediaStatus;
  subOrDub?: SubOrDub;
  hasSub?: boolean;
  hasDub?: boolean;
  recommendations?: IAnimeResult[];
  relations?: (IAnimeResult & { relationType?: string })[];
}

export interface IEpisodeServer {
  name: string;
  url: string;
}

export interface IVideo {
  url: string;
  quality?: string;
  isM3U8?: boolean;
}

export interface ISubtitle {
  url: string;
  lang: string;
}

export interface ISource {
  sources: IVideo[];
  subtitles?: ISubtitle[];
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
  headers?: Record<string, string>;
  download?: string;
}

export interface ISearch<T> {
  currentPage?: number;
  hasNextPage?: boolean;
  totalPages?: number;
  totalResults?: number;
  results: T[];
}

// User preferences schema
export const userPreferencesSchema = z.object({
  preferredLanguage: z.enum(['sub', 'dub']).default('sub'),
  preferredQuality: z.enum(['480p', '720p', '1080p']).default('720p'),
  theme: z.enum(['light', 'dark']).default('dark'),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Search filters schema
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  genre: z.string().optional(),
  type: z.nativeEnum(MediaFormat).optional(),
  status: z.nativeEnum(MediaStatus).optional(),
  year: z.string().optional(),
  page: z.number().min(1).default(1),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

// Episode watch request schema
export const episodeWatchSchema = z.object({
  animeId: z.string(),
  episodeId: z.string(),
  server: z.nativeEnum(StreamingServers).default(StreamingServers.MegaUp),
  subOrDub: z.nativeEnum(SubOrDub).default(SubOrDub.SUB),
});

export type EpisodeWatchRequest = z.infer<typeof episodeWatchSchema>;