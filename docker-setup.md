# Docker Setup Guide

## Quick Start

### 1. Build and Start Services

```bash
docker-compose up --build
```

### 2. Run Database Migrations

```bash
# Wait for services to start, then run migrations
docker-compose exec api npm run migration:run
```

### 3. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Test scraping
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
  -d '{"urls": ["https://example.com"]}'
```

## Services

### PostgreSQL Database

- **Port**: 5432
- **Database**: web_scraper
- **Username**: postgres
- **Password**: postgres
- **Data**: Persisted in `postgres_data` volume

### Web Scraper API

- **Port**: 3000
- **Authentication**: admin:password
- **Endpoints**:
  - `GET /api/health` - Health check
  - `POST /api/scrape` - Scrape URLs
  - `GET /api/assets` - Get assets
  - `GET /api/pages` - Get pages

## Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f api
docker-compose logs -f postgres
```

### Run Commands in API Container

```bash
# Run migrations
docker-compose exec api npm run migration:run

# Generate new migration
docker-compose exec api npm run migration:generate <migration-name>

# Access API container shell
docker-compose exec api sh
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d web_scraper

# Or from host machine
psql -h localhost -p 5432 -U postgres -d web_scraper
```

## Environment Variables

All configuration is handled through environment variables in `docker-compose.yml`:

- `DB_HOST`: postgres (container name)
- `DB_PORT`: 5432
- `DB_USERNAME`: postgres
- `DB_PASSWORD`: postgres
- `DB_NAME`: web_scraper
- `NODE_ENV`: production
- `AUTH_USERNAME`: admin
- `AUTH_PASSWORD`: password

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres
```

### API Issues

```bash
# Check API logs
docker-compose logs api

# Restart API service
docker-compose restart api
```

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## Production Notes

- Database data is persisted in Docker volume
- API runs in production mode
- All services restart automatically unless stopped
- Health checks ensure proper startup order
