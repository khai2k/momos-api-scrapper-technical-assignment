import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { ImageData, VideoData, ScrapedData, ScrapeResult } from '../types';
import { databaseService } from './databaseService';

// Scraping service for extracting asset from web pages
class ScrapingService {
  private timeout: number;
  private userAgent: string;

  constructor() {
    this.timeout = 10000;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
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

  // Scrape multiple URLs and save to database
  async scrapeMultipleUrls(urls: string[]): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];
    
    for (const url of urls) {
      try {
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
          data: validatedData
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
          error: error.message
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
}

export default new ScrapingService();