import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { auditLogger } from '../configs/logger.config';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, mfa_code } = req.body;
      const result = await this.authService.login(email, password, mfa_code);
      
      auditLogger.info('User login successful', { email, ip: req.ip });
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refresh_token } = req.body;
      const result = await this.authService.refreshToken(refresh_token);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      await this.authService.logout(userId);
      
      auditLogger.info('User logout', { userId, ip: req.ip });
      
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  };
}