import { DataSource } from 'typeorm';
import { ScrapedPage } from './entities/ScrapedPage';
import { ScrapedAsset } from './entities/ScrapedAsset';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'web_scraper',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [ScrapedPage, ScrapedAsset],
  migrations: [__dirname + '/migrations/*.js'],
  subscribers: [],
  migrationsTableName: 'migrations',
  migrationsRun: false,
});