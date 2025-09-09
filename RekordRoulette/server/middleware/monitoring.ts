import { Request, Response, NextFunction } from 'express';

// Performance monitoring middleware
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    // Log slow requests (over 1 second)
    if (duration > 1000) {
      console.warn(`SLOW REQUEST: ${method} ${originalUrl} - ${statusCode} - ${duration}ms`);
    }
    
    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${method} ${originalUrl} ${statusCode} in ${duration}ms`);
    }
  });
  
  next();
};

// Health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.status(200).json(healthData);
};

// Error tracking middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: req.session?.userId || 'anonymous'
  };
  
  // Log error details
  console.error('APPLICATION ERROR:', errorData);
  
  // In production, you might want to send this to an external service
  // like Sentry, LogRocket, or similar
  
  // Don't expose internal errors to users
  const statusCode = error.name === 'ValidationError' ? 400 : 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong. Please try again.' 
    : error.message;
  
  res.status(statusCode).json({ 
    error: message,
    requestId: req.headers['x-request-id'] || 'unknown'
  });
};

// Database connection monitoring
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    // Simple query to check if database is responsive
    // You'll need to import your db connection here
    // const result = await db.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};