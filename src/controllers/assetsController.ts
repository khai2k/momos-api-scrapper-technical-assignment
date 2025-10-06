import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/databaseService';

// Get all assets with pagination and filtering
export const getAllAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string; // 'image' or 'video'
    const search = req.query.search as string; // search in alt_text or asset_url
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as string || 'DESC';

    const result = await databaseService.getAssetsWithPagination({
      page,
      limit,
      type,
      search,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC'
    });

    res.json({
      success: true,
      data: result.assets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalItems: result.total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(result.total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get assets by type (images or videos)
export const getAssetsByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    if (type !== 'image' && type !== 'video') {
      res.status(400).json({
        success: false,
        error: 'Invalid asset type. Must be "image" or "video"'
      });
      return;
    }

    const result = await databaseService.getAssetsByTypeWithPagination({
      type,
      page,
      limit,
      search
    });

    res.json({
      success: true,
      data: result.assets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalItems: result.total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(result.total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get asset statistics
export const getAssetStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await databaseService.getAssetStatistics();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
};

// Get single asset by ID
export const getAssetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const assetId = parseInt(id || '0');

    if (isNaN(assetId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid asset ID'
      });
      return;
    }

    const asset = await databaseService.getAssetById(assetId);

    if (!asset) {
      res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
      return;
    }

    res.json({
      success: true,
      data: asset
    });

  } catch (error) {
    next(error);
  }
};
