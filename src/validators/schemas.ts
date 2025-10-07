import { z } from 'zod';

// Request validation schemas
export const scrapeRequestSchema = z.object({
  urls: z.array(z.string().url('Invalid URL format'))
    .min(1, 'At least one URL is required')
    .max(10, 'Maximum 10 URLs allowed per request')
});

// Response validation schemas
export const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  title: z.string().optional()
});

export const videoSchema = z.object({
  url: z.string().url(),
  poster: z.string().url().nullable().optional(),
  type: z.string().optional()
});

export const scrapeResultSchema = z.object({
  url: z.string().url(),
  success: z.boolean(),
  data: z.object({
    images: z.array(imageSchema),
    videos: z.array(videoSchema)
  }).optional(),
  error: z.string().optional()
});

export const scrapeResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(scrapeResultSchema),
  cacheStats: z.object({
    totalRequests: z.number(),
    cachedRequests: z.number(),
    freshRequests: z.number(),
    cacheHitRate: z.number()
  }).optional()
});
