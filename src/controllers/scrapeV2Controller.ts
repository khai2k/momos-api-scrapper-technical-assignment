import { Request, Response } from 'express';
import { ScrapeRequest, AsyncScrapeResult } from '../types';
import queueService from '../services/queueService';
import config from '../config';

// Async scraping controller for v2 API
class ScrapeV2Controller {
  // Start async scraping job
  async startScraping(req: Request, res: Response): Promise<void> {
    try {
      const { urls }: ScrapeRequest = req.body;

      // Validate input
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        res.status(400).json({
          success: false,
          error: 'URLs array is required and must not be empty'
        });
        return;
      }

      // Check URL limit
      if (urls.length > config.scraping.maxUrls) {
        res.status(400).json({
          success: false,
          error: `Maximum ${config.scraping.maxUrls} URLs allowed per request`
        });
        return;
      }

      // Validate URLs
      const invalidUrls = urls.filter(url => {
        try {
          new URL(url);
          return false;
        } catch {
          return true;
        }
      });

      if (invalidUrls.length > 0) {
        res.status(400).json({
          success: false,
          error: `Invalid URLs: ${invalidUrls.join(', ')}`
        });
        return;
      }

      // Add job to queue
      const jobResult = await queueService.addScrapingJob(urls);

      res.status(202).json({
        success: true,
        message: 'Scraping job queued successfully',
        data: jobResult
      });

    } catch (error: any) {
      console.error('Error starting scraping job:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start scraping job'
      });
    }
  }

  // Get job status
  async getJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        res.status(400).json({
          success: false,
          error: 'Job ID is required'
        });
        return;
      }

      const jobStatus = await queueService.getJobStatus(jobId);

      if (!jobStatus) {
        res.status(404).json({
          success: false,
          error: 'Job not found'
        });
        return;
      }

      res.json({
        success: true,
        data: jobStatus
      });

    } catch (error: any) {
      console.error('Error getting job status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get job status'
      });
    }
  }

  // Get all job statuses
  async getAllJobStatuses(req: Request, res: Response): Promise<void> {
    try {
      const allJobs = await queueService.getAllJobStatuses();

      res.json({
        success: true,
        data: allJobs
      });

    } catch (error: any) {
      console.error('Error getting all job statuses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get job statuses'
      });
    }
  }

  // Get queue statistics
  async getQueueStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await queueService.getQueueStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error: any) {
      console.error('Error getting queue stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get queue statistics'
      });
    }
  }

  // Clean old jobs
  async cleanOldJobs(req: Request, res: Response): Promise<void> {
    try {
      await queueService.cleanOldJobs();

      res.json({
        success: true,
        message: 'Old jobs cleaned successfully'
      });

    } catch (error: any) {
      console.error('Error cleaning old jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clean old jobs'
      });
    }
  }
}

export default new ScrapeV2Controller();
