import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import configuration and utilities
import config from './src/config';
import logger from './src/utils/logger';

// Import database
import { initializeDatabase, closeDatabase } from './src/database';

// Import middleware
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler';

// Import routes
import routes from './src/routes';

/**
 * Express Application Setup
 * Clean, modular architecture with proper separation of concerns
 */
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Web Scraper API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      scrape: 'POST /api/scrape',
      assets: 'GET /api/assets'
    },
    documentation: 'See README.md for usage instructions'
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Start server
    const server = app.listen(config.port, () => {
      logger.info('Server started successfully', {
        port: config.port,
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
          health: `http://localhost:${config.port}/api/health`,
          scrape: `http://localhost:${config.port}/api/scrape`,
          assets: `http://localhost:${config.port}/api/assets`
        }
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        try {
          await closeDatabase();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error closing database connection:', error as Record<string, any>);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error as Record<string, any>);
    process.exit(1);
  }
};

// Start the application
startServer();

export default app;