import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { ImageData, VideoData, ScrapedData, ScrapeResult } from '../types';
import { databaseService } from './databaseService';
import config from '../config';

// Scraping service for extracting asset from web pages
class ScrapingService {
  private timeout: number;
  private userAgent: string;
  private cacheValidityDays: number;

  constructor() {
    this.timeout = config.scraping.timeout;
    this.userAgent = config.scraping.userAgent;
    this.cacheValidityDays = config.scraping.cacheValidityDays;
  }

  // Check if page was scraped recently and return cached data
  private async getCachedData(url: string): Promise<ScrapedData | null> {
    try {
      const existingPage = await databaseService.getScrapedPageByUrl(url);
      
      if (!existingPage || !existingPage.success) {
        return null;
      }
      
      // Check if the page was scraped within the configured cache validity period
      const cacheValidityDate = new Date();
      cacheValidityDate.setDate(cacheValidityDate.getDate() - this.cacheValidityDays);
      
      if (existingPage.created_at < cacheValidityDate) {
        return null; // Data is too old, need to re-scrape
      }
      
      // Return cached data
      const cachedData: ScrapedData = {
        images: existingPage.assets
          .filter(asset => asset.asset_type === 'image')
          .map(asset => ({
            url: asset.asset_url,
            alt: asset.alt_text || '',
            title: '' // We don't store title for assets in current schema
          })),
        videos: existingPage.assets
          .filter(asset => asset.asset_type === 'video')
          .map(asset => ({
            url: asset.asset_url,
            poster: asset.alt_text?.startsWith('Video poster: ') 
              ? asset.alt_text.replace('Video poster: ', '') 
              : null,
            type: 'video/mp4' // Default type
          }))
      };
      
      return cachedData;
    } catch (error) {
      console.error('Error checking cached data:', error);
      return null;
    }
  }

  // Scrape asset (images and videos) from a URL
  async scrapeAsset(url: string): Promise<ScrapedData> {
    try {
      const response: AxiosResponse<string> = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      const $ = cheerio.load(response.data);
      const baseUrl = new URL(url);
      
      const images = this.extractImages($, baseUrl);
      const videos = this.extractVideos($, baseUrl);
      
      return { images, videos };
    } catch (error) {
      throw error;
    }
  }

  // Extract images from the page
  private extractImages($: cheerio.Root, baseUrl: URL): ImageData[] {
    const images: ImageData[] = [];
    
    $('img').each((index: number, element: cheerio.Element) => {
      const $element = $(element);
      const src = $element.attr('src');
      const dataSrc = $element.attr('data-src');
      const imageUrl = src || dataSrc;
      
      if (imageUrl) {
        try {
          const fullUrl = new URL(imageUrl, baseUrl).href;
          images.push({
            url: fullUrl,
            alt: $element.attr('alt') || '',
            title: $element.attr('title') || ''
          });
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    return images;
  }

  // Extract videos from the page
  private extractVideos($: cheerio.Root, baseUrl: URL): VideoData[] {
    const videos: VideoData[] = [];
    
    // Extract video elements
    $('video').each((index: number, element: cheerio.Element) => {
      const $element = $(element);
      const src = $element.attr('src');
      const poster = $element.attr('poster');
      
      if (src) {
        try {
          const fullUrl = new URL(src, baseUrl).href;
          videos.push({
            url: fullUrl,
            poster: poster ? new URL(poster, baseUrl).href : null,
            type: $element.attr('type') || 'video/mp4'
          });
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    // Extract video sources
    $('video source').each((index: number, element: cheerio.Element) => {
      const $element = $(element);
      const src = $element.attr('src');
      if (src) {
        try {
          const fullUrl = new URL(src, baseUrl).href;
          videos.push({
            url: fullUrl,
            type: $element.attr('type') || 'video/mp4',
            poster: null
          });
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    return videos;
  }

  // Scrape multiple URLs and save to database (with caching)
  async scrapeMultipleUrls(urls: string[]): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];
    
    for (const url of urls) {
      try {
        // Check for cached data first
        const cachedData = await this.getCachedData(url);
        
        if (cachedData) {
          // Return cached data without re-scraping
          console.log(`📦 Using cached data for: ${url} (valid for ${this.cacheValidityDays} days)`);
          results.push({
            url,
            success: true,
            data: cachedData,
            cached: true // Flag to indicate this is cached data
          });
          continue;
        }
        
        // No cached data or data is too old, proceed with scraping
        console.log(`🔄 Scraping fresh data for: ${url} (cache expired after ${this.cacheValidityDays} days)`);
        const assetData = await this.scrapeAsset(url);
        
        // Extract page title and description
        const pageTitle = await this.extractPageTitle(url);
        const pageDescription = await this.extractPageDescription(url);
        
        // Save scraped page to database
        const scrapedPage = await databaseService.createScrapedPage({
          url,
          title: pageTitle || '',
          description: pageDescription || '',
          success: true
        });
        
        // Prepare assets for database
        const assetsToSave = [];
        
        // Add images
        for (const image of assetData.images) {
          assetsToSave.push({
            asset_url: image.url,
            asset_type: 'image',
            alt_text: image.alt,
            scraped_page_id: scrapedPage.id
          });
        }
        
        // Add videos
        for (const video of assetData.videos) {
          assetsToSave.push({
            asset_url: video.url,
            asset_type: 'video',
            alt_text: video.poster ? `Video poster: ${video.poster}` : null,
            scraped_page_id: scrapedPage.id
          });
        }
        
        // Save assets to database
        if (assetsToSave.length > 0) {
          await databaseService.createScrapedAssets(assetsToSave as { asset_url: string; asset_type: string; alt_text?: string; scraped_page_id: number }[]);
        }
        
        // Validate and structure the data for response
        const validatedData: ScrapedData = {
          images: assetData.images.map((img: ImageData) => ({
            url: img.url,
            alt: img.alt || '',
            title: img.title || ''
          })),
          videos: assetData.videos.map((vid: VideoData) => ({
            url: vid.url,
            poster: vid.poster || null,
            type: vid.type || 'video/mp4'
          }))
        };
        
        results.push({
          url,
          success: true,
          data: validatedData,
          cached: false // Flag to indicate this is fresh data
        });
        
      } catch (error: any) {
        // Save failed scraping attempt to database
        try {
          await databaseService.createScrapedPage({
            url,
            success: false,
            error_message: error.message
          });
        } catch (dbError) {
          console.error('Failed to save failed scraping to database:', dbError);
        }
        
        results.push({
          url,
          success: false,
          error: error.message,
          cached: false
        });
      }
    }
    
    return results;
  }

  // Extract page title
  private async extractPageTitle(url: string): Promise<string | undefined> {
    try {
      const response: AxiosResponse<string> = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      const $ = cheerio.load(response.data);
      return $('title').text() || undefined;
    } catch (error) {
      return undefined;
    }
  }

  // Extract page description
  private async extractPageDescription(url: string): Promise<string | undefined> {
    try {
      const response: AxiosResponse<string> = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Try meta description first
      let description = $('meta[name="description"]').attr('content');
      
      // If no meta description, try to get first paragraph
      if (!description) {
        description = $('p').first().text().substring(0, 200);
      }
      
      return description || undefined;
    } catch (error) {
      return undefined;
    }
  }

  // Method to clear cache for a specific URL (useful for testing)
  async clearCacheForUrl(url: string): Promise<boolean> {
    try {
      const existingPage = await databaseService.getScrapedPageByUrl(url);
      if (existingPage) {
        await databaseService.deleteScrapedPage(existingPage.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Method to get cache statistics
  async getCacheStats(): Promise<{
    totalPages: number;
    cachedPages: number;
    freshPages: number;
    cacheHitRate: number;
    cacheValidityDays: number;
  }> {
    try {
      const cacheValidityDate = new Date();
      cacheValidityDate.setDate(cacheValidityDate.getDate() - this.cacheValidityDays);
      
      const allPages = await databaseService.getAllScrapedPages();
      const cachedPages = allPages.filter(page => 
        page.success && page.created_at >= cacheValidityDate
      );
      
      return {
        totalPages: allPages.length,
        cachedPages: cachedPages.length,
        freshPages: allPages.length - cachedPages.length,
        cacheHitRate: allPages.length > 0 ? (cachedPages.length / allPages.length) * 100 : 0,
        cacheValidityDays: this.cacheValidityDays
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalPages: 0,
        cachedPages: 0,
        freshPages: 0,
        cacheHitRate: 0,
        cacheValidityDays: this.cacheValidityDays
      };
    }
  }
}

export default new ScrapingService();