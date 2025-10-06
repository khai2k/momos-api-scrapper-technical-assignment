import { Router } from 'express';
import { scrapeMedia } from '../controllers';
import { basicAuth } from '../middleware/auth';
import { validateRequest } from '../validators/validationMiddleware';
import { scrapeRequestSchema } from '../validators/schemas';

const router = Router();

// POST /scrape - Scrape media from URLs
router.post('/', basicAuth, validateRequest(scrapeRequestSchema), scrapeMedia);

export default router;
