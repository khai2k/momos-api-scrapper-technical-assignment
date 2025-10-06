import express from 'express';
import { getAllAssets, getAssetsByType, getAssetStats, getAssetById } from '../controllers/assetsController';

const router = express.Router();

// GET /api/assets - Get all assets with pagination and filtering
router.get('/', getAllAssets);

// GET /api/assets/stats - Get asset statistics
router.get('/stats', getAssetStats);

// GET /api/assets/type/:type - Get assets by type (image or video)
router.get('/type/:type', getAssetsByType);

// GET /api/assets/:id - Get single asset by ID
router.get('/:id', getAssetById);

export default router;
