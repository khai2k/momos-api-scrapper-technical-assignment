import { Config } from '../types';

// Application configuration
const config: Config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Authentication
  auth: {
    username: process.env.AUTH_USERNAME || 'admin',
    password: process.env.AUTH_PASSWORD || 'password'
  },
  
  // Scraping configuration
  scraping: {
    timeout: parseInt(process.env.SCRAPING_TIMEOUT || '10000'),
    maxUrls: parseInt(process.env.MAX_URLS || '10'),
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    cacheValidityDays: parseInt(process.env.CACHE_VALIDITY_DAYS || '7')
  },
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined
  },
  
  // Queue configuration
  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5'),
    removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE || '100'),
    removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50')
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true'
  }
};

export default config;