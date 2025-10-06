import { Router } from 'express';
import { scrapeAsset } from '../controllers';
import { basicAuth } from '../middleware/auth';
import { validateRequest } from '../validators/validationMiddleware';
import { scrapeRequestSchema } from '../validators/schemas';

const router = Router();

// POST /scrape - Scrape asset from URLs
router.post('/', validateRequest(scrapeRequestSchema), scrapeAsset);

export default router;
