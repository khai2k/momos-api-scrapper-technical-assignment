import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/databaseService';

// Get all scraped pages with pagination and filtering
export const getAllPages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string; // search in url, title, or description
    const success = req.query.success as string; // filter by success status
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as string || 'DESC';

    const result = await databaseService.getPagesWithPagination({
      page,
      limit,
      search,
      ...(success === 'true' ? { success: true } : success === 'false' ? { success: false } : {}),
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC'
    });

    res.json({
      success: true,
      data: result.pages,
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

// Get single page by ID
export const getPageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const pageId = parseInt(id || '0');

    if (isNaN(pageId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid page ID'
      });
      return;
    }

    const page = await databaseService.getScrapedPageById(pageId);

    if (!page) {
      res.status(404).json({
        success: false,
        error: 'Page not found'
      });
      return;
    }

    res.json({
      success: true,
      data: page
    });

  } catch (error) {
    next(error);
  }
};

// Get page by URL
export const getPageByUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { url } = req.params;
    
    if (!url) {
      res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
      return;
    }

    const page = await databaseService.getScrapedPageByUrl(decodeURIComponent(url));

    if (!page) {
      res.status(404).json({
        success: false,
        error: 'Page not found'
      });
      return;
    }

    res.json({
      success: true,
      data: page
    });

  } catch (error) {
    next(error);
  }
};

// Get pages statistics
export const getPagesStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await databaseService.getPagesStatistics();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
};

// Delete page by ID
export const deletePage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const pageId = parseInt(id || '0');

    if (isNaN(pageId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid page ID'
      });
      return;
    }

    const deleted = await databaseService.deleteScrapedPage(pageId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Page not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Page deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};
