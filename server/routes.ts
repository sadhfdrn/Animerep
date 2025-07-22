import express from 'express';
import { z } from 'zod';
import { animekai } from './animekai';
import { storage } from './storage';
import {
  searchFiltersSchema,
  episodeWatchSchema,
  userPreferencesSchema,
  SubOrDub,
  StreamingServers,
} from '../shared/schema';

const router = express.Router();

// Helper function to get user ID from request (in a real app, this would come from auth)
const getUserId = (req: express.Request): string => {
  return req.headers['x-user-id'] as string || 'anonymous';
};

// Search anime
router.get('/api/search', async (req, res) => {
  try {
    const filters = searchFiltersSchema.parse(req.query);
    const { query, page = 1 } = filters;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Check cache first
    const cachedResults = await storage.getCachedSearch(query, page);
    if (cachedResults) {
      return res.json(cachedResults);
    }

    // Fetch from AnimeKai
    const results = await animekai.search(query, page);
    
    // Cache results
    await storage.setCachedSearch(query, page, results);
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search anime' });
  }
});

// Get search suggestions
router.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const suggestions = await animekai.search(q, 1);
    // Return only first 8 suggestions
    const limitedResults = {
      ...suggestions,
      results: suggestions.results.slice(0, 8),
    };
    
    res.json(limitedResults);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get spotlight anime
router.get('/api/spotlight', async (req, res) => {
  try {
    const results = await animekai.fetchSpotlight();
    res.json(results);
  } catch (error) {
    console.error('Spotlight error:', error);
    res.status(500).json({ error: 'Failed to fetch spotlight anime' });
  }
});

// Get recently added anime
router.get('/api/recent', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const results = await animekai.fetchRecentlyAdded(page);
    res.json(results);
  } catch (error) {
    console.error('Recent anime error:', error);
    res.status(500).json({ error: 'Failed to fetch recent anime' });
  }
});

// Get recently updated anime
router.get('/api/recent-updates', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const results = await animekai.fetchRecentlyUpdated(page);
    res.json(results);
  } catch (error) {
    console.error('Recent updates error:', error);
    res.status(500).json({ error: 'Failed to fetch recent updates' });
  }
});

// Get completed anime
router.get('/api/completed', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const results = await animekai.fetchLatestCompleted(page);
    res.json(results);
  } catch (error) {
    console.error('Completed anime error:', error);
    res.status(500).json({ error: 'Failed to fetch completed anime' });
  }
});

// Get anime genres
router.get('/api/genres', async (req, res) => {
  try {
    const genres = await animekai.fetchGenres();
    res.json({ genres });
  } catch (error) {
    console.error('Genres error:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

// Search anime by genre
router.get('/api/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    
    const results = await animekai.genreSearch(genre, page);
    res.json(results);
  } catch (error) {
    console.error('Genre search error:', error);
    res.status(500).json({ error: 'Failed to search anime by genre' });
  }
});

// Get anime info
router.get('/api/anime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    // Check cache first
    const cachedInfo = await storage.getCachedAnimeInfo(id);
    if (cachedInfo) {
      // Add to recently viewed
      await storage.addToRecentlyViewed(userId, id);
      return res.json(cachedInfo);
    }

    // Fetch from AnimeKai
    const info = await animekai.fetchAnimeInfo(id);
    
    // Cache the info
    await storage.setCachedAnimeInfo(id, info);
    
    // Add to recently viewed
    await storage.addToRecentlyViewed(userId, id);
    
    res.json(info);
  } catch (error) {
    console.error('Anime info error:', error);
    res.status(500).json({ error: 'Failed to fetch anime information' });
  }
});

// Get episode servers
router.get('/api/anime/:id/episode/:episodeId/servers', async (req, res) => {
  try {
    const { episodeId } = req.params;
    const subOrDub = (req.query.subOrDub as SubOrDub) || SubOrDub.SUB;
    
    const servers = await animekai.fetchEpisodeServers(episodeId, subOrDub);
    res.json({ servers });
  } catch (error) {
    console.error('Episode servers error:', error);
    res.status(500).json({ error: 'Failed to fetch episode servers' });
  }
});

// Get episode sources (video links)
router.get('/api/anime/:id/episode/:episodeId/sources', async (req, res) => {
  try {
    const { episodeId } = req.params;
    const server = (req.query.server as StreamingServers) || StreamingServers.MegaUp;
    const subOrDub = (req.query.subOrDub as SubOrDub) || SubOrDub.SUB;
    
    const sources = await animekai.fetchEpisodeSources(episodeId, server, subOrDub);
    res.json(sources);
  } catch (error) {
    console.error('Episode sources error:', error);
    res.status(500).json({ error: 'Failed to fetch episode sources' });
  }
});

// User preferences endpoints
router.get('/api/user/preferences', async (req, res) => {
  try {
    const userId = getUserId(req);
    const preferences = await storage.getUserPreferences(userId);
    
    res.json(preferences || {
      preferredLanguage: 'sub',
      preferredQuality: '720p',
      theme: 'dark',
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get user preferences' });
  }
});

router.post('/api/user/preferences', async (req, res) => {
  try {
    const userId = getUserId(req);
    const preferences = userPreferencesSchema.parse(req.body);
    
    await storage.setUserPreferences(userId, preferences);
    res.json({ success: true });
  } catch (error) {
    console.error('Set preferences error:', error);
    res.status(500).json({ error: 'Failed to set user preferences' });
  }
});

// Recently viewed
router.get('/api/user/recent', async (req, res) => {
  try {
    const userId = getUserId(req);
    const recentIds = await storage.getRecentlyViewed(userId);
    res.json({ recentIds });
  } catch (error) {
    console.error('Recent viewed error:', error);
    res.status(500).json({ error: 'Failed to get recently viewed anime' });
  }
});

// Favorites
router.get('/api/user/favorites', async (req, res) => {
  try {
    const userId = getUserId(req);
    const favoriteIds = await storage.getFavorites(userId);
    res.json({ favoriteIds });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

router.post('/api/user/favorites/:animeId', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { animeId } = req.params;
    
    await storage.addToFavorites(userId, animeId);
    res.json({ success: true });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

router.delete('/api/user/favorites/:animeId', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { animeId } = req.params;
    
    await storage.removeFromFavorites(userId, animeId);
    res.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Watch progress
router.get('/api/user/progress/:animeId', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { animeId } = req.params;
    
    const progress = await storage.getWatchProgress(userId, animeId);
    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get watch progress' });
  }
});

router.post('/api/user/progress/:animeId', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { animeId } = req.params;
    const { episodeId, progress } = req.body;
    
    await storage.updateWatchProgress(userId, animeId, episodeId, progress);
    res.json({ success: true });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update watch progress' });
  }
});

export default router;