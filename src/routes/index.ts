import { Router } from 'express';
import healthRoutes from './healthRoutes';
import scrapeRoutes from './scrapeRoutes';
import assetsRoutes from './assetsRoutes';

const router = Router();

// Health routes
router.use('/health', healthRoutes);

// Scrape routes
router.use('/scrape', scrapeRoutes);

// Assets routes
router.use('/assets', assetsRoutes);

export default router;