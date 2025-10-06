import { Router } from 'express';
import { healthCheck } from '../controllers';

const router = Router();

// GET /health - Health check endpoint
router.get('/', healthCheck);

export default router;
