import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../configs/app.config';
import { User } from '../models/user.model';
import { auditLogger } from '../configs/logger.config';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded: any = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid token',
            timestamp: new Date().toISOString()
          }
        });
        return;
      }
      
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      auditLogger.warn('Invalid token attempt', { ip: req.ip });
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      auditLogger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    next();
  };
};