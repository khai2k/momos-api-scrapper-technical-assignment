import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Error Handling Middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    });
    return;
  }
  
  // Handle URL validation errors
  if (err.name === 'TypeError' && err.message.includes('Invalid URL')) {
    res.status(400).json({
      error: 'Invalid URL',
      message: 'The provided URL format is invalid'
    });
    return;
  }
  
  // Handle network errors
  if (err.code === 'ENOTFOUND') {
    res.status(400).json({
      error: 'Invalid URL',
      message: 'The provided URL could not be reached'
    });
    return;
  }
  
  if (err.code === 'ECONNREFUSED') {
    res.status(400).json({
      error: 'Connection Refused',
      message: 'Unable to connect to the provided URL'
    });
    return;
  }
  
  if (err.code === 'ETIMEDOUT') {
    res.status(408).json({
      error: 'Request Timeout',
      message: 'The request timed out while scraping the URL'
    });
    return;
  }
  
  // Handle axios errors
  if (err.response) {
    res.status(400).json({
      error: 'HTTP Error',
      message: `Failed to fetch URL: ${err.response.status} ${err.response.statusText}`
    });
    return;
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong while processing your request'
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
};
