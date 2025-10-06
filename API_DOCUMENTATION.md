# Assets API Documentation

## Overview
This API provides endpoints for retrieving, filtering, and paginating scraped assets (images and videos) from the database.

## Base URL
```
http://localhost:3000/api/assets
```

## Authentication
All endpoints require Basic Authentication:
- Username: `admin`
- Password: `password`

## Endpoints

### 1. Get All Assets with Pagination and Filtering
```
GET /api/assets
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by asset type (`image` or `video`)
- `search` (optional): Search in alt_text, asset_url, or page URL
- `sortBy` (optional): Sort field (default: `created_at`)
- `sortOrder` (optional): Sort order `ASC` or `DESC` (default: `DESC`)

**Example Request:**
```
GET /api/assets?page=1&limit=20&type=image&search=logo&sortBy=created_at&sortOrder=DESC
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "asset_url": "https://example.com/image.jpg",
      "asset_type": "image",
      "alt_text": "Company logo",
      "created_at": "2024-01-15T10:30:00Z",
      "scraped_page_id": 1,
      "scrapedPage": {
        "id": 1,
        "url": "https://example.com",
        "title": "Example Page",
        "success": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Get Assets by Type
```
GET /api/assets/type/{type}
```

**Path Parameters:**
- `type`: Asset type (`image` or `video`)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in alt_text, asset_url, or page URL

**Example Request:**
```
GET /api/assets/type/image?page=1&limit=10&search=logo
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "asset_url": "https://example.com/image.jpg",
      "asset_type": "image",
      "alt_text": "Company logo",
      "created_at": "2024-01-15T10:30:00Z",
      "scraped_page_id": 1,
      "scrapedPage": {
        "id": 1,
        "url": "https://example.com",
        "title": "Example Page",
        "success": true
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. Get Asset Statistics
```
GET /api/assets/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAssets": 150,
    "totalImages": 120,
    "totalVideos": 30,
    "totalPages": 45,
    "recentAssets": [
      {
        "id": 1,
        "asset_url": "https://example.com/image.jpg",
        "asset_type": "image",
        "alt_text": "Recent image",
        "created_at": "2024-01-15T10:30:00Z",
        "scrapedPage": {
          "id": 1,
          "url": "https://example.com",
          "title": "Example Page"
        }
      }
    ]
  }
}
```

### 4. Get Single Asset by ID
```
GET /api/assets/{id}
```

**Path Parameters:**
- `id`: Asset ID

**Example Request:**
```
GET /api/assets/123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "asset_url": "https://example.com/image.jpg",
    "asset_type": "image",
    "alt_text": "Company logo",
    "created_at": "2024-01-15T10:30:00Z",
    "scraped_page_id": 1,
    "scrapedPage": {
      "id": 1,
      "url": "https://example.com",
      "title": "Example Page",
      "success": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid asset type. Must be \"image\" or \"video\""
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Asset not found"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Basic authentication required"
}
```

## Usage Examples

### Using curl:
```bash
# Get all images with pagination
curl -X GET "http://localhost:3000/api/assets?type=image&page=1&limit=10" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ="

# Search for assets containing "logo"
curl -X GET "http://localhost:3000/api/assets?search=logo" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ="

# Get asset statistics
curl -X GET "http://localhost:3000/api/assets/stats" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ="
```

### Using JavaScript fetch:
```javascript
// Get paginated assets
const response = await fetch('http://localhost:3000/api/assets?page=1&limit=20&type=image', {
  headers: {
    'Authorization': 'Basic ' + btoa('admin:password')
  }
});

const data = await response.json();
console.log(data);

// Search assets
const searchResponse = await fetch('http://localhost:3000/api/assets?search=logo&type=image', {
  headers: {
    'Authorization': 'Basic ' + btoa('admin:password')
  }
});

const searchData = await searchResponse.json();
console.log(searchData);
```

## Frontend Integration

These APIs are designed to work with frontend pagination and filtering components:

1. **Pagination**: Use the `pagination` object to build pagination controls
2. **Search**: Implement real-time search with the `search` parameter
3. **Filtering**: Use the `type` parameter to filter by image/video
4. **Sorting**: Use `sortBy` and `sortOrder` for custom sorting
5. **Statistics**: Use the stats endpoint for dashboard metrics

## Performance Considerations

- Default page size is 10 items
- Maximum recommended page size is 100 items
- Search is case-insensitive and uses ILIKE for PostgreSQL
- All queries include proper indexing for optimal performance
- Results are ordered by creation date (newest first) by default
