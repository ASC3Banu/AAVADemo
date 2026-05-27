import { Request, Response, NextFunction } from 'express';
import { logger, auditLogger } from '../configs/logger.config';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  auditLogger.error('Application error', {
    error: err.message,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id
  });
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: message,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id']
    }
  });
};