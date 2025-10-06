# Web Scraper API

A professional Express.js API with clean architecture that scrapes images and video URLs from web pages.

## 🏗️ Architecture

This project follows senior-level best practices with:

- **Clean Architecture**: Separation of concerns with controllers, services, middleware, and utilities
- **Modular Structure**: Each component has a single responsibility
- **Configuration Management**: Environment-based configuration
- **Error Handling**: Comprehensive error handling with proper logging
- **Security**: Helmet, CORS, and authentication middleware
- **Logging**: Structured logging with request/response tracking

## 📁 Project Structure

```
├── src/
│   ├── config/
│   │   └── index.js          # Configuration management
│   ├── controllers/
│   │   ├── index.js         # Controller exports
│   │   ├── healthController.js # Health check controller
│   │   └── scrapeController.js # Scraping controller
│   ├── middleware/
│   │   ├── index.js         # Middleware exports
│   │   ├── auth.js          # Authentication middleware
│   │   └── errorHandler.js  # Error handling middleware
│   ├── routes/
│   │   ├── index.js         # Route definitions
│   │   ├── healthRoutes.js  # Health routes
│   │   └── scrapeRoutes.js  # Scraping routes
│   ├── services/
│   │   └── scrapingService.js # Business logic
│   ├── utils/
│   │   └── logger.js        # Logging utility
│   └── validators/
│       ├── schemas.js       # Zod validation schemas
│       └── validationMiddleware.js # Validation middleware
├── server.js                # Main application entry point
├── package.json
└── README.md
```

## 🚀 Features

- ✅ **Clean Architecture**: Modular, maintainable code structure
- ✅ **Type-Safe Validation**: Zod schemas for request/response validation
- ✅ **Authentication**: Basic Auth middleware with configurable credentials
- ✅ **Validation**: Comprehensive request validation with detailed error messages
- ✅ **Error Handling**: Comprehensive error handling with proper HTTP status codes
- ✅ **Logging**: Structured logging with request/response tracking
- ✅ **Security**: Helmet security headers, CORS configuration
- ✅ **Configuration**: Environment-based configuration management
- ✅ **Graceful Shutdown**: Proper server shutdown handling
- ✅ **Asset Scraping**: Images, videos, and iframe content extraction
- ✅ **Response Validation**: Ensures API responses match expected schemas

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## 📡 API Endpoints

### Root Endpoint
```
GET /
```
Returns API information and available endpoints.

### Health Check
```
GET /api/health
```
Returns detailed server status and system information.

### Scrape Asset
```
POST /api/scrape
```

**Authentication:** Basic Auth (username: `admin`, password: `password`)

**Request Body:**
```json
{
  "urls": [
    "https://example.com",
    "https://another-site.com"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "totalUrls": 2,
  "successfulScrapes": 2,
  "failedScrapes": 0,
  "results": [
    {
      "url": "https://example.com",
      "success": true,
      "data": {
        "images": [
          {
            "url": "https://example.com/image.jpg",
            "alt": "Image description",
            "title": "Image title",
            "width": "800",
            "height": "600"
          }
        ],
        "videos": [
          {
            "url": "https://example.com/video.mp4",
            "poster": "https://example.com/poster.jpg",
            "type": "video/mp4",
            "width": "1920",
            "height": "1080"
          }
        ]
      }
    }
  ]
}
```

## Usage Examples

### Using curl:
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
  -d '{"urls": ["https://example.com"]}'
```

### Using JavaScript fetch:
```javascript
const response = await fetch('http://localhost:3000/api/scrape', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('admin:password')
  },
  body: JSON.stringify({
    urls: ['https://example.com']
  })
});

const data = await response.json();
console.log(data);
```

### Using axios:
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/api/scrape', {
  urls: ['https://example.com']
}, {
  headers: {
    'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
  }
});

console.log(response.data);
```

## ⚙️ Configuration

All configuration is managed through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `AUTH_USERNAME` | admin | Basic auth username |
| `AUTH_PASSWORD` | password | Basic auth password |
| `SCRAPING_TIMEOUT` | 10000 | Request timeout in ms |
| `MAX_URLS` | 10 | Maximum URLs per request |
| `USER_AGENT` | Mozilla/5.0... | User agent for requests |
| `CORS_ORIGIN` | * | CORS origin |
| `CORS_CREDENTIALS` | false | CORS credentials |

## Validation Features

The API uses Zod for comprehensive validation:

- **Request Validation**: Validates incoming requests against schemas
- **Response Validation**: Ensures API responses match expected formats
- **Type Safety**: Runtime type checking for all data
- **Detailed Error Messages**: Clear validation error messages with field-level details
- **URL Validation**: Validates URL format and accessibility
- **Array Validation**: Ensures proper array structure and limits

### Validation Error Response Example:
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "urls.0",
      "message": "Invalid URL format",
      "code": "invalid_string"
    }
  ]
}
```

## Error Handling

The API handles various error scenarios:
- Invalid URLs
- Network timeouts
- Connection refused
- Authentication failures
- Malformed requests
- **Validation errors** with detailed field-level information

## 🔒 Security Features

- **Helmet**: Security headers protection
- **CORS**: Configurable cross-origin resource sharing
- **Authentication**: Basic Auth with configurable credentials
- **Type-Safe Validation**: Zod schemas for comprehensive input validation
- **Rate Limiting**: Maximum URLs per request
- **Error Handling**: Secure error responses (no sensitive data leakage)
- **Response Validation**: Ensures API responses are properly structured

## 📊 Logging

The application includes comprehensive logging:

- **Request Logging**: All incoming requests with metadata
- **Error Logging**: Detailed error information with stack traces
- **Performance Logging**: Scraping operation metrics
- **Validation Logging**: Request/response validation results
- **Structured Logs**: JSON format for production, readable format for development

## 🔍 Validation Features

The API uses Zod for comprehensive validation:

- **Request Validation**: Validates incoming requests against schemas
- **Response Validation**: Ensures API responses match expected formats
- **Type Safety**: Runtime type checking for all data
- **Detailed Error Messages**: Clear validation error messages with field-level details
- **Schema Reusability**: Reusable validation schemas across the application

## 🚨 Error Handling

The API handles various error scenarios with appropriate HTTP status codes:

- **400 Bad Request**: Invalid URLs, malformed requests
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: Non-existent endpoints
- **408 Request Timeout**: Scraping timeout
- **500 Internal Server Error**: Unexpected server errors

## 🏭 Production Considerations

- Change default authentication credentials
- Use environment variables for all configuration
- Consider implementing rate limiting
- Add monitoring and alerting
- Implement proper logging aggregation
- Consider using a reverse proxy (nginx)
- Add health check endpoints for load balancers
