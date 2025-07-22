import {
  IAnimeResult,
  IAnimeInfo,
  ISearch,
  UserPreferences,
  SearchFilters,
  ISource,
  IEpisodeServer,
  StreamingServers,
  SubOrDub,
} from '../shared/schema';

export interface IStorage {
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | null>;
  setUserPreferences(userId: string, preferences: UserPreferences): Promise<void>;
  
  // Search cache for better performance
  getCachedSearch(query: string, page: number): Promise<ISearch<IAnimeResult> | null>;
  setCachedSearch(query: string, page: number, results: ISearch<IAnimeResult>): Promise<void>;
  
  // Anime info cache
  getCachedAnimeInfo(id: string): Promise<IAnimeInfo | null>;
  setCachedAnimeInfo(id: string, info: IAnimeInfo): Promise<void>;
  
  // Recently viewed anime
  addToRecentlyViewed(userId: string, animeId: string): Promise<void>;
  getRecentlyViewed(userId: string): Promise<string[]>;
  
  // Favorites
  addToFavorites(userId: string, animeId: string): Promise<void>;
  removeFromFavorites(userId: string, animeId: string): Promise<void>;
  getFavorites(userId: string): Promise<string[]>;
  
  // Watch history
  updateWatchProgress(userId: string, animeId: string, episodeId: string, progress: number): Promise<void>;
  getWatchProgress(userId: string, animeId: string): Promise<{ episodeId: string; progress: number } | null>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private userPreferences = new Map<string, UserPreferences>();
  private searchCache = new Map<string, { results: ISearch<IAnimeResult>; timestamp: number }>();
  private animeInfoCache = new Map<string, { info: IAnimeInfo; timestamp: number }>();
  private recentlyViewed = new Map<string, string[]>();
  private favorites = new Map<string, string[]>();
  private watchProgress = new Map<string, Map<string, { episodeId: string; progress: number }>>();
  
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return this.userPreferences.get(userId) || null;
  }

  async setUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    this.userPreferences.set(userId, preferences);
  }

  async getCachedSearch(query: string, page: number): Promise<ISearch<IAnimeResult> | null> {
    const key = `${query}_${page}`;
    const cached = this.searchCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.results;
    }
    
    // Clean expired cache
    if (cached) {
      this.searchCache.delete(key);
    }
    
    return null;
  }

  async setCachedSearch(query: string, page: number, results: ISearch<IAnimeResult>): Promise<void> {
    const key = `${query}_${page}`;
    this.searchCache.set(key, {
      results,
      timestamp: Date.now(),
    });
  }

  async getCachedAnimeInfo(id: string): Promise<IAnimeInfo | null> {
    const cached = this.animeInfoCache.get(id);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.info;
    }
    
    // Clean expired cache
    if (cached) {
      this.animeInfoCache.delete(id);
    }
    
    return null;
  }

  async setCachedAnimeInfo(id: string, info: IAnimeInfo): Promise<void> {
    this.animeInfoCache.set(id, {
      info,
      timestamp: Date.now(),
    });
  }

  async addToRecentlyViewed(userId: string, animeId: string): Promise<void> {
    const recent = this.recentlyViewed.get(userId) || [];
    
    // Remove if already exists
    const filtered = recent.filter(id => id !== animeId);
    
    // Add to front
    filtered.unshift(animeId);
    
    // Keep only last 20 items
    const limited = filtered.slice(0, 20);
    
    this.recentlyViewed.set(userId, limited);
  }

  async getRecentlyViewed(userId: string): Promise<string[]> {
    return this.recentlyViewed.get(userId) || [];
  }

  async addToFavorites(userId: string, animeId: string): Promise<void> {
    const favs = this.favorites.get(userId) || [];
    
    if (!favs.includes(animeId)) {
      favs.push(animeId);
      this.favorites.set(userId, favs);
    }
  }

  async removeFromFavorites(userId: string, animeId: string): Promise<void> {
    const favs = this.favorites.get(userId) || [];
    const filtered = favs.filter(id => id !== animeId);
    this.favorites.set(userId, filtered);
  }

  async getFavorites(userId: string): Promise<string[]> {
    return this.favorites.get(userId) || [];
  }

  async updateWatchProgress(userId: string, animeId: string, episodeId: string, progress: number): Promise<void> {
    if (!this.watchProgress.has(userId)) {
      this.watchProgress.set(userId, new Map());
    }
    
    const userProgress = this.watchProgress.get(userId)!;
    userProgress.set(animeId, { episodeId, progress });
  }

  async getWatchProgress(userId: string, animeId: string): Promise<{ episodeId: string; progress: number } | null> {
    const userProgress = this.watchProgress.get(userId);
    return userProgress?.get(animeId) || null;
  }
}

// Export storage instance
export const storage = new MemStorage();