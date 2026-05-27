import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { auditLogger } from '../configs/logger.config';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error: any) {
      auditLogger.warn('Validation error', {
        path: req.path,
        errors: error.errors
      });
      
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
          timestamp: new Date().toISOString()
        }
      });
    }
  };
};

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    mfa_code: z.string().optional()
  })
});

export const createShipmentSchema = z.object({
  body: z.object({
    origin: z.object({
      address: z.string(),
      city: z.string(),
      country: z.string(),
      postalCode: z.string()
    }),
    destination: z.object({
      address: z.string(),
      city: z.string(),
      country: z.string(),
      postalCode: z.string()
    }),
    carrier: z.object({
      id: z.string(),
      name: z.string(),
      serviceType: z.string()
    })
  })
});