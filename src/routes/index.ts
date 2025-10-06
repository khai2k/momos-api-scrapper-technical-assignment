import { Router } from 'express';
import healthRoutes from './healthRoutes';
import scrapeRoutes from './scrapeRoutes';

const router = Router();

// Health routes
router.use('/health', healthRoutes);

// Scrape routes
router.use('/scrape', scrapeRoutes);

export default router;
