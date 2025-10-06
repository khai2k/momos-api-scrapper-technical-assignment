# Database Setup Guide

## PostgreSQL Database Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=web_scraper

# Application Configuration
PORT=3000
NODE_ENV=development

# Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD=password

# Scraping Configuration
SCRAPING_TIMEOUT=10000
MAX_URLS=10
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36

# CORS Configuration
CORS_ORIGIN=*
CORS_CREDENTIALS=false
```

### Database Tables

The application uses 2 minimal tables:

#### 1. `scraped_pages` Table
```sql
CREATE TABLE scraped_pages (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `scraped_assets` Table
```sql
CREATE TABLE scraped_assets (
    id SERIAL PRIMARY KEY,
    asset_url VARCHAR(500) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- 'image' or 'video'
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scraped_page_id INTEGER REFERENCES scraped_pages(id) ON DELETE CASCADE
);
```

### Installation Steps

1. **Install PostgreSQL** (if not already installed)
2. **Create Database**:
   ```sql
   CREATE DATABASE web_scraper;
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Set Environment Variables**:
   - Copy the environment variables above to a `.env` file
   - Update database credentials as needed
5. **Run the Application**:
   ```bash
   npm run dev
   ```

### TypeORM Features

- **Automatic Schema Sync**: In development mode, TypeORM will create/update tables automatically
- **Entity Relationships**: One-to-many relationship between pages and assets
- **Type Safety**: Full TypeScript support with entity classes
- **Repository Pattern**: Clean data access layer

### Database Service

The `DatabaseService` class provides methods for:
- Creating scraped pages and assets
- Retrieving data with relationships
- Filtering by asset type
- Deleting records

### Sample Usage

```typescript
import { databaseService } from './src/services/databaseService';

// Create a scraped page
const page = await databaseService.createScrapedPage({
  url: 'https://example.com',
  title: 'Example Page',
  success: true
});

// Add assets to the page
await databaseService.createScrapedAssets([
  {
    asset_url: 'https://example.com/image.jpg',
    asset_type: 'image',
    alt_text: 'Example image',
    scraped_page_id: page.id
  }
]);
```
