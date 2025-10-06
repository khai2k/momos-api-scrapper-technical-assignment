import express from 'express';
import { getAllPages, getPageById, getPageByUrl, getPagesStats, deletePage } from '../controllers/pagesController';

const router = express.Router();

// GET /api/pages - Get all pages with pagination and filtering
router.get('/', getAllPages);

// GET /api/pages/stats - Get pages statistics
router.get('/stats', getPagesStats);

// GET /api/pages/url/:url - Get page by URL
router.get('/url/:url', getPageByUrl);

// GET /api/pages/:id - Get single page by ID
router.get('/:id', getPageById);

// DELETE /api/pages/:id - Delete page by ID
router.delete('/:id', deletePage);

export default router;
