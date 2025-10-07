import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import config from '../config';
import scrapingService from './scrapingService';
import { ScrapeResult, AsyncScrapeResult } from '../types';

// Redis connection
const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password ?? '',
  maxRetriesPerRequest: null,
  lazyConnect: true
});

// Job data interface
interface ScrapeJobData {
  urls: string[];
  jobId: string;
}

// Queue service for async scraping
class QueueService {
  private queue: Queue<ScrapeJobData>;
  private worker: Worker<ScrapeJobData>;
  private jobStatuses: Map<string, AsyncScrapeResult> = new Map();

  constructor() {
    // Create queue
    this.queue = new Queue<ScrapeJobData>('scraping-queue', {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: config.queue.removeOnComplete,
        removeOnFail: config.queue.removeOnFail,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    // Create worker
    this.worker = new Worker<ScrapeJobData>(
      'scraping-queue',
      this.processScrapingJob.bind(this),
      {
        connection: redisConnection,
        concurrency: config.queue.concurrency
      }
    );

    // Set up event listeners
    this.setupEventListeners();
  }

  // Add scraping job to queue
  async addScrapingJob(urls: string[]): Promise<AsyncScrapeResult> {
    const jobId = `scrape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const job = await this.queue.add('scrape-urls', {
      urls,
      jobId
    }, {
      jobId
    });

    const result: AsyncScrapeResult = {
      jobId,
      status: 'queued',
      urls,
      message: 'Job queued for processing',
      createdAt: new Date()
    };

    this.jobStatuses.set(jobId, result);
    return result;
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<AsyncScrapeResult | null> {
    return this.jobStatuses.get(jobId) || null;
  }

  // Get all job statuses
  async getAllJobStatuses(): Promise<AsyncScrapeResult[]> {
    return Array.from(this.jobStatuses.values());
  }

  // Process scraping job
  private async processScrapingJob(job: Job<ScrapeJobData>): Promise<ScrapeResult[]> {
    const { urls, jobId } = job.data;
    
    try {
      // Update job status to processing
      const jobStatus = this.jobStatuses.get(jobId);
      if (jobStatus) {
        jobStatus.status = 'processing';
        jobStatus.message = 'Processing URLs...';
        this.jobStatuses.set(jobId, jobStatus);
      }

      console.log(`🔄 Processing scraping job ${jobId} with ${urls.length} URLs`);

      // Process scraping
      const results = await scrapingService.scrapeMultipleUrls(urls);

      // Update job status to completed
      if (jobStatus) {
        jobStatus.status = 'completed';
        jobStatus.message = 'Scraping completed successfully';
        jobStatus.results = results;
        jobStatus.completedAt = new Date();
        this.jobStatuses.set(jobId, jobStatus);
      }

      console.log(`✅ Completed scraping job ${jobId}`);
      return results;

    } catch (error: any) {
      console.error(`❌ Failed scraping job ${jobId}:`, error);

      // Update job status to failed
      const jobStatus = this.jobStatuses.get(jobId);
      if (jobStatus) {
        jobStatus.status = 'failed';
        jobStatus.message = 'Scraping failed';
        jobStatus.error = error.message;
        jobStatus.completedAt = new Date();
        this.jobStatuses.set(jobId, jobStatus);
      }

      throw error;
    }
  }

  // Set up event listeners
  private setupEventListeners(): void {
    // Worker events
    this.worker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    this.worker.on('error', (err) => {
      console.error('❌ Worker error:', err);
    });

    // Queue events
    this.queue.on('error', (err) => {
      console.error('❌ Queue error:', err);
    });
  }

  // Get queue statistics
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();
    const delayed = await this.queue.getDelayed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length
    };
  }

  // Clean up old completed jobs
  async cleanOldJobs(): Promise<void> {
    try {
      await this.queue.clean(24 * 60 * 60 * 1000, 100, 'completed'); // Clean jobs older than 24 hours
      await this.queue.clean(7 * 24 * 60 * 60 * 1000, 50, 'failed'); // Clean failed jobs older than 7 days
      console.log('🧹 Cleaned up old jobs');
    } catch (error) {
      console.error('❌ Error cleaning old jobs:', error);
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    try {
      await this.worker.close();
      await this.queue.close();
      await redisConnection.quit();
      console.log('🔌 Queue service shutdown complete');
    } catch (error) {
      console.error('❌ Error during queue shutdown:', error);
    }
  }
}

export default new QueueService();
