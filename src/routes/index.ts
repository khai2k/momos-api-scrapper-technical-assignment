import { Router } from 'express';
import healthRoutes from './healthRoutes';
import scrapeRoutes from './scrapeRoutes';
import scrapeV2Routes from './scrapeV2Routes';
import assetsRoutes from './assetsRoutes';
import pagesRoutes from './pagesRoutes';

const router = Router();

// Health routes
router.use('/health', healthRoutes);

// Scrape routes
router.use('/scrape', scrapeRoutes);

// Scrape v2 routes (async with queue)
router.use('/scrape/v2', scrapeV2Routes);

// Assets routes
router.use('/assets', assetsRoutes);

// Pages routes
router.use('/pages', pagesRoutes);

export default router;