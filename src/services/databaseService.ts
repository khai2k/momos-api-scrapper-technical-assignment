import { Repository, Like, FindManyOptions } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { ScrapedPage } from '../database/entities/ScrapedPage';
import { ScrapedAsset } from '../database/entities/ScrapedAsset';

export class DatabaseService {
  private scrapedPageRepository: Repository<ScrapedPage>;
  private scrapedAssetRepository: Repository<ScrapedAsset>;

  constructor() {
    this.scrapedPageRepository = AppDataSource.getRepository(ScrapedPage);
    this.scrapedAssetRepository = AppDataSource.getRepository(ScrapedAsset);
  }

  // Create a new scraped page
  async createScrapedPage(data: {
    url: string;
    title?: string;
    description?: string;
    success: boolean;
    error_message?: string;
  }): Promise<ScrapedPage> {
    const scrapedPage = this.scrapedPageRepository.create(data);
    return await this.scrapedPageRepository.save(scrapedPage);
  }

  // Create scraped assets for a page
  async createScrapedAssets(assets: {
    asset_url: string;
    asset_type: string;
    alt_text?: string;
    scraped_page_id: number;
  }[]): Promise<ScrapedAsset[]> {
    const scrapedAssets = this.scrapedAssetRepository.create(assets);
    return await this.scrapedAssetRepository.save(scrapedAssets);
  }

  // Get all scraped pages with their assets
  async getAllScrapedPages(): Promise<ScrapedPage[]> {
    return await this.scrapedPageRepository.find({
      relations: ['assets'],
      order: { created_at: 'DESC' }
    });
  }

  // Get scraped page by ID
  async getScrapedPageById(id: number): Promise<ScrapedPage | null> {
    return await this.scrapedPageRepository.findOne({
      where: { id },
      relations: ['assets']
    });
  }

  // Get scraped page by URL
  async getScrapedPageByUrl(url: string): Promise<ScrapedPage | null> {
    return await this.scrapedPageRepository.findOne({
      where: { url },
      relations: ['assets']
    });
  }

  // Get all assets by type
  async getAssetsByType(assetType: string): Promise<ScrapedAsset[]> {
    return await this.scrapedAssetRepository.find({
      where: { asset_type: assetType },
      relations: ['scrapedPage'],
      order: { created_at: 'DESC' }
    });
  }

  // Delete scraped page and its assets
  async deleteScrapedPage(id: number): Promise<boolean> {
    const result = await this.scrapedPageRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  // Get assets with pagination and filtering
  async getAssetsWithPagination(options: {
    page: number;
    limit: number;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ assets: ScrapedAsset[]; total: number }> {
    const { page, limit, type, search, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.scrapedAssetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.scrapedPage', 'page')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (type) {
      queryBuilder.andWhere('asset.asset_type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(asset.alt_text ILIKE :search OR asset.asset_url ILIKE :search OR page.url ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`asset.${sortBy}`, sortOrder);

    const [assets, total] = await queryBuilder.getManyAndCount();

    return { assets, total };
  }

  // Get assets by type with pagination
  async getAssetsByTypeWithPagination(options: {
    type: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ assets: ScrapedAsset[]; total: number }> {
    const { type, page, limit, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.scrapedAssetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.scrapedPage', 'page')
      .where('asset.asset_type = :type', { type })
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(asset.alt_text ILIKE :search OR asset.asset_url ILIKE :search OR page.url ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder.orderBy('asset.created_at', 'DESC');

    const [assets, total] = await queryBuilder.getManyAndCount();

    return { assets, total };
  }

  // Get asset by ID
  async getAssetById(id: number): Promise<ScrapedAsset | null> {
    return await this.scrapedAssetRepository.findOne({
      where: { id },
      relations: ['scrapedPage']
    });
  }

  // Get asset statistics
  async getAssetStatistics(): Promise<{
    totalAssets: number;
    totalImages: number;
    totalVideos: number;
    totalPages: number;
    recentAssets: ScrapedAsset[];
  }> {
    const [totalAssets, totalImages, totalVideos, totalPages] = await Promise.all([
      this.scrapedAssetRepository.count(),
      this.scrapedAssetRepository.count({ where: { asset_type: 'image' } }),
      this.scrapedAssetRepository.count({ where: { asset_type: 'video' } }),
      this.scrapedPageRepository.count()
    ]);

    const recentAssets = await this.scrapedAssetRepository.find({
      relations: ['scrapedPage'],
      order: { created_at: 'DESC' },
      take: 5
    });

    return {
      totalAssets,
      totalImages,
      totalVideos,
      totalPages,
      recentAssets
    };
  }

  // Search assets with advanced filtering
  async searchAssets(options: {
    query?: string;
    type?: string;
    page?: number;
    limit?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{ assets: ScrapedAsset[]; total: number }> {
    const { query, type, page = 1, limit = 10, dateFrom, dateTo } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.scrapedAssetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.scrapedPage', 'page')
      .skip(skip)
      .take(limit);

    if (type) {
      queryBuilder.andWhere('asset.asset_type = :type', { type });
    }

    if (query) {
      queryBuilder.andWhere(
        '(asset.alt_text ILIKE :query OR asset.asset_url ILIKE :query OR page.url ILIKE :query OR page.title ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (dateFrom) {
      queryBuilder.andWhere('asset.created_at >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('asset.created_at <= :dateTo', { dateTo });
    }

    queryBuilder.orderBy('asset.created_at', 'DESC');

    const [assets, total] = await queryBuilder.getManyAndCount();

    return { assets, total };
  }
}

export const databaseService = new DatabaseService();