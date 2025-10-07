import { Router } from 'express';
import scrapeV2Controller from '../controllers/scrapeV2Controller';
import { validateRequest } from '../validators/validationMiddleware';
import { scrapeRequestSchema } from '../validators/schemas';

const router = Router();

// POST /api/scrape/v2 - Start async scraping job
router.post('/', validateRequest(scrapeRequestSchema), scrapeV2Controller.startScraping);

// GET /api/scrape/v2/status/:jobId - Get specific job status
router.get('/status/:jobId', scrapeV2Controller.getJobStatus);

// GET /api/scrape/v2/status - Get all job statuses
router.get('/status', scrapeV2Controller.getAllJobStatuses);

// GET /api/scrape/v2/stats - Get queue statistics
router.get('/stats', scrapeV2Controller.getQueueStats);

// POST /api/scrape/v2/clean - Clean old jobs
router.post('/clean', scrapeV2Controller.cleanOldJobs);

export default router;
