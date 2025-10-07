import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import scrapingService from '../services/scrapingService';
import { scrapeResponseSchema } from '../validators/schemas';
import { ScrapeResponse } from '../types';

// Scrape asset from multiple URLs
export const scrapeAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { urls } = req.body;
    const results = await scrapingService.scrapeMultipleUrls(urls);
    
    // Calculate cache statistics
    const totalRequests = results.length;
    const cachedRequests = results.filter(r => r.cached === true).length;
    const freshRequests = results.filter(r => r.cached === false).length;
    const cacheHitRate = totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0;
    
    const response: ScrapeResponse = {
      success: true,
      results,
      cacheStats: {
        totalRequests,
        cachedRequests,
        freshRequests,
        cacheHitRate: parseFloat(cacheHitRate.toFixed(2))
      }
    };
    
    // Validate response structure
    const validatedResponse = scrapeResponseSchema.parse(response);
    res.json(validatedResponse);
    
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(500).json({
        error: 'Response Validation Error',
        message: 'Failed to validate response data',
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
      return;
    }
    next(error);
  }
};