// Type definitions for the web scraper API

export interface ImageData {
  url: string;
  alt: string;
  title: string;
}

export interface VideoData {
  url: string;
  poster: string | null;
  type: string;
}

export interface ScrapedData {
  images: ImageData[];
  videos: VideoData[];
}

export interface ScrapeResult {
  url: string;
  success: boolean;
  data?: ScrapedData;
  error?: string;
  cached?: boolean; // Flag to indicate if data was served from cache
}

export interface ScrapeResponse {
  success: boolean;
  results: ScrapeResult[];
  cacheStats?: {
    totalRequests: number;
    cachedRequests: number;
    freshRequests: number;
    cacheHitRate: number;
  };
}

export interface ScrapeRequest {
  urls: string[];
}

export interface Config {
  port: number;
  nodeEnv: string;
  auth: {
    username: string;
    password: string;
  };
  scraping: {
    timeout: number;
    maxUrls: number;
    userAgent: string;
    cacheValidityDays: number;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
}

export interface Logger {
  info: (message: string, meta?: Record<string, any>) => void;
  error: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
}