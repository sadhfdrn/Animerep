import { AxiosAdapter } from 'axios';
import { CheerioAPI, load } from 'cheerio';
import axios from 'axios';
import crypto from 'crypto-js';

import {
  ISearch,
  IAnimeInfo,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  StreamingServers,
  MediaFormat,
  SubOrDub,
  IAnimeEpisode,
  MediaStatus,
  IVideo,
} from '../shared/schema';

// Simple MegaUp extractor implementation
class MegaUpExtractor {
  generateToken(id: string): string {
    const key = crypto.enc.Utf8.parse('37911490979715163134003223491201');
    const time = Math.floor(Date.now() / 1000);
    const message = id + time;
    const hash = crypto.HmacSHA256(message, key).toString();
    return hash;
  }

  async extract(serverUrl: URL): Promise<{ sources: IVideo[] }> {
    try {
      const { data } = await axios.get(serverUrl.href);
      const $ = load(data);
      
      // Extract video sources from the page
      const sources: IVideo[] = [];
      
      // Look for video sources in script tags or data attributes
      $('script').each((_, el) => {
        const scriptContent = $(el).html();
        if (scriptContent?.includes('sources')) {
          // Try to extract video URLs from script content
          const urlMatches = scriptContent.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/g);
          if (urlMatches) {
            urlMatches.forEach(url => {
              sources.push({
                url: url,
                quality: 'auto',
                isM3U8: true,
              });
            });
          }
        }
      });
      
      // If no sources found, try alternative extraction methods
      if (sources.length === 0) {
        const videoElement = $('video source').attr('src');
        if (videoElement) {
          sources.push({
            url: videoElement,
            quality: 'auto',
            isM3U8: videoElement.includes('.m3u8'),
          });
        }
      }
      
      return { sources };
    } catch (error) {
      console.error('MegaUp extraction error:', error);
      return { sources: [] };
    }
  }
}

export class AnimeKai {
  readonly name = 'AnimeKai';
  protected baseUrl = 'https://animekai.to';
  protected logo = 'https://animekai.to/assets/uploads/37585a39fe8c8d8fafaa2c7bfbf5374ecac859ea6a0288a6da2c61f5.png';
  private megaUpExtractor = new MegaUpExtractor();

  constructor(customBaseURL?: string) {
    if (customBaseURL) {
      if (customBaseURL.startsWith('http://') || customBaseURL.startsWith('https://')) {
        this.baseUrl = customBaseURL;
      } else {
        this.baseUrl = `http://${customBaseURL}`;
      }
    }
  }

  private getHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };
  }

  private async scrapeCardPage(url: string): Promise<ISearch<IAnimeResult>> {
    try {
      const { data } = await axios.get(url, { headers: this.getHeaders() });
      const $ = load(data);
      const results: IAnimeResult[] = [];

      $('.aitem, .item, .anime-item').each((i, el) => {
        const card = $(el);
        const titleElement = card.find('.title, .name, .anime-title').first();
        const title = titleElement.text().trim();
        const japaneseTitle = titleElement.attr('data-jp');
        
        const linkElement = card.find('a').first();
        const href = linkElement.attr('href');
        const id = href?.split('/').pop()?.replace('.html', '') || href?.split('/')[2];
        
        const imageElement = card.find('img').first();
        const image = imageElement.attr('src') || imageElement.attr('data-src');
        
        const typeElement = card.find('.type, .format').first();
        const type = typeElement.text().trim().toUpperCase() as MediaFormat;
        
        const subElement = card.find('.sub, .subtitle').first();
        const sub = parseInt(subElement.text().replace(/[^0-9]/g, '')) || 0;
        
        const dubElement = card.find('.dub, .dubbed').first();
        const dub = parseInt(dubElement.text().replace(/[^0-9]/g, '')) || 0;

        if (id && title) {
          results.push({
            id,
            title,
            japaneseTitle: japaneseTitle || null,
            url: `${this.baseUrl}${href}`,
            image,
            type,
            sub,
            dub,
          });
        }
      });

      // Check for pagination
      const currentPageElement = $('.current, .active, .selected').first();
      const currentPage = parseInt(currentPageElement.text()) || 1;
      
      const nextPageElement = $('.next, [rel="next"]').first();
      const hasNextPage = nextPageElement.length > 0;

      return {
        currentPage,
        hasNextPage,
        results,
      };
    } catch (error) {
      console.error('Scraping error:', error);
      return { results: [] };
    }
  }

  async search(query: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (page < 1) page = 1;
    return this.scrapeCardPage(`${this.baseUrl}/browser?keyword=${encodeURIComponent(query)}&page=${page}`);
  }

  async fetchLatestCompleted(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (page < 1) page = 1;
    return this.scrapeCardPage(`${this.baseUrl}/completed?page=${page}`);
  }

  async fetchRecentlyAdded(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (page < 1) page = 1;
    return this.scrapeCardPage(`${this.baseUrl}/recent?page=${page}`);
  }

  async fetchRecentlyUpdated(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (page < 1) page = 1;
    return this.scrapeCardPage(`${this.baseUrl}/updates?page=${page}`);
  }

  async fetchSpotlight(): Promise<ISearch<IAnimeResult>> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/home`, { headers: this.getHeaders() });
      const $ = load(data);
      const results: IAnimeResult[] = [];

      $('.swiper-slide, .spotlight-item, .featured-item').each((i, el) => {
        const card = $(el);
        const titleElement = card.find('.title, .name').first();
        const title = titleElement.text().trim();
        const japaneseTitle = titleElement.attr('data-jp');
        
        const linkElement = card.find('a').first();
        const href = linkElement.attr('href');
        const id = href?.replace('/watch/', '') || href?.split('/')[2];
        
        const bannerStyle = card.attr('style');
        const banner = bannerStyle?.match(/background-image:\s*url\(["']?(.+?)["']?\)/)?.[1];
        
        const description = card.find('.desc, .description').text().trim();
        const genresText = card.find('.genres, .genre').text().trim();
        const genres = genresText ? genresText.split(',').map(g => g.trim()) : [];

        if (id && title) {
          results.push({
            id,
            title,
            japaneseTitle: japaneseTitle || null,
            url: `${this.baseUrl}/watch/${id}`,
            banner,
            description,
            genres,
          });
        }
      });

      return { results };
    } catch (error) {
      console.error('Spotlight fetch error:', error);
      return { results: [] };
    }
  }

  async fetchAnimeInfo(id: string): Promise<IAnimeInfo> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/watch/${id}`, { headers: this.getHeaders() });
      const $ = load(data);

      const title = $('.entity-scroll > .title, .anime-title').first().text().trim();
      const japaneseTitle = $('.entity-scroll > .title').attr('data-jp')?.trim();
      const image = $('.poster img, .anime-image img').first().attr('src');
      const description = $('.entity-scroll > .desc, .anime-description').first().text().trim();
      const type = $('.entity-scroll > .info, .anime-info').children().last().text().toUpperCase() as MediaFormat;

      const info: IAnimeInfo = {
        id,
        title,
        japaneseTitle: japaneseTitle || null,
        image,
        description,
        type,
        url: `${this.baseUrl}/watch/${id}`,
        episodes: [],
        recommendations: [],
        relations: [],
      };

      // Get episodes
      try {
        const aniId = $('.rate-box#anime-rating').attr('data-id') || id;
        const token = this.megaUpExtractor.generateToken(aniId);
        
        const episodesResponse = await axios.get(
          `${this.baseUrl}/ajax/episodes/list?ani_id=${aniId}&_=${token}`,
          {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Referer': `${this.baseUrl}/watch/${id}`,
              ...this.getHeaders(),
            },
          }
        );
        
        const $episodes = load(episodesResponse.data.result || episodesResponse.data);
        const episodes: IAnimeEpisode[] = [];

        $episodes('li a, .episode-item a').each((i, el) => {
          const episodeElement = $(el);
          const episodeNum = episodeElement.attr('num') || episodeElement.attr('data-episode');
          const episodeToken = episodeElement.attr('token') || '';
          const episodeTitle = episodeElement.find('span').text().trim() || `Episode ${episodeNum}`;
          const episodeHref = episodeElement.attr('href');

          if (episodeNum) {
            episodes.push({
              id: `${id}$ep=${episodeNum}$token=${episodeToken}`,
              number: parseInt(episodeNum),
              title: episodeTitle,
              url: `${this.baseUrl}/watch/${id}${episodeHref}`,
            });
          }
        });

        info.episodes = episodes;
        info.totalEpisodes = episodes.length;
      } catch (episodeError) {
        console.error('Episode fetch error:', episodeError);
      }

      // Check for sub/dub availability
      const subCount = parseInt($('.info span.sub').text()) || 0;
      const dubCount = parseInt($('.info span.dub').text()) || 0;
      
      info.sub = subCount;
      info.dub = dubCount;
      info.hasSub = subCount > 0;
      info.hasDub = dubCount > 0;
      
      if (info.hasSub && info.hasDub) {
        info.subOrDub = SubOrDub.BOTH;
      } else if (info.hasSub) {
        info.subOrDub = SubOrDub.SUB;
      } else if (info.hasDub) {
        info.subOrDub = SubOrDub.DUB;
      }

      return info;
    } catch (error) {
      console.error('Anime info fetch error:', error);
      throw new Error('Failed to fetch anime information');
    }
  }

  async fetchEpisodeServers(episodeId: string, subOrDub: SubOrDub = SubOrDub.SUB): Promise<IEpisodeServer[]> {
    try {
      const [animeId, episodeInfo] = episodeId.split('$ep=');
      const [episodeNum, tokenInfo] = episodeInfo.split('$token=');
      
      const response = await axios.get(
        `${this.baseUrl}/ajax/episodes/servers?ani_id=${animeId}&ep=${episodeNum}&token=${tokenInfo}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': `${this.baseUrl}/watch/${animeId}`,
            ...this.getHeaders(),
          },
        }
      );

      const $ = load(response.data.result || response.data);
      const servers: IEpisodeServer[] = [];

      $('.server-item, .server-link').each((i, el) => {
        const serverElement = $(el);
        const serverName = serverElement.find('.server-name').text().trim() || `Server ${i + 1}`;
        const serverUrl = serverElement.attr('href') || serverElement.attr('data-url');

        if (serverUrl) {
          servers.push({
            name: serverName,
            url: serverUrl.startsWith('http') ? serverUrl : `${this.baseUrl}${serverUrl}`,
          });
        }
      });

      return servers;
    } catch (error) {
      console.error('Episode servers fetch error:', error);
      return [];
    }
  }

  async fetchEpisodeSources(
    episodeId: string,
    server: StreamingServers = StreamingServers.MegaUp,
    subOrDub: SubOrDub = SubOrDub.SUB
  ): Promise<ISource> {
    try {
      if (episodeId.startsWith('http')) {
        const serverUrl = new URL(episodeId);
        const extractedData = await this.megaUpExtractor.extract(serverUrl);
        return {
          sources: extractedData.sources,
          headers: { Referer: serverUrl.href },
          download: serverUrl.href.replace(/\/e\//, '/download/'),
        };
      }

      const servers = await this.fetchEpisodeServers(episodeId, subOrDub);
      const selectedServer = servers.find(s => s.name.toLowerCase().includes(server.toLowerCase())) || servers[0];

      if (!selectedServer) {
        throw new Error(`No servers found for episode ${episodeId}`);
      }

      const serverUrl = new URL(selectedServer.url);
      const extractedData = await this.megaUpExtractor.extract(serverUrl);

      return {
        sources: extractedData.sources,
        headers: { Referer: serverUrl.href },
        download: serverUrl.href.replace(/\/e\//, '/download/'),
      };
    } catch (error) {
      console.error('Episode sources fetch error:', error);
      throw new Error('Failed to fetch episode sources');
    }
  }

  async fetchGenres(): Promise<string[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/home`, { headers: this.getHeaders() });
      const $ = load(data);
      const genres: string[] = [];

      $('#menu ul.c4 li a, .genre-list a').each((i, el) => {
        const genreText = $(el).text().trim().toLowerCase();
        if (genreText) {
          genres.push(genreText);
        }
      });

      return genres;
    } catch (error) {
      console.error('Genres fetch error:', error);
      return [];
    }
  }

  async genreSearch(genre: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (!genre) {
      throw new Error('Genre is required');
    }
    if (page < 1) page = 1;
    return this.scrapeCardPage(`${this.baseUrl}/genres/${encodeURIComponent(genre)}?page=${page}`);
  }
}

// Export singleton instance
export const animekai = new AnimeKai();