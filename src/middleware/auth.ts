import { Request, Response, NextFunction } from 'express';

// Basic Authentication Middleware
export const basicAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Basic authentication required' 
    });
    return;
  }
  
  const credentials = Buffer.from(authHeader.split(' ')[1] || '', 'base64').toString();
  const [username, password] = credentials.split(':');
  
  // Simple hardcoded credentials for demo (use environment variables in production)
  if (username === 'admin' && password === 'password') {
    next();
  } else {
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid credentials' 
    });
  }
};
