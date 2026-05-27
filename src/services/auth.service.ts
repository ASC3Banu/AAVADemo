import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { config } from '../configs/app.config';
import { getRedisClient } from '../configs/redis.config';
import { logger } from '../configs/logger.config';

export class AuthService {
  async login(email: string, password: string, mfaCode?: string): Promise<any> {
    const user = await User.findOne({ email, isActive: true }).select('+password');
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    if (user.isLocked()) {
      throw new Error('Account is locked');
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new Error('Invalid credentials');
    }
    
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();
    
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    await this.storeRefreshToken(user._id.toString(), refreshToken);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900
    };
  }
  
  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const decoded: any = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }
      
      const accessToken = this.generateAccessToken(user);
      
      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 900
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  
  async logout(userId: string): Promise<void> {
    const redis = getRedisClient();
    await redis.del(`refresh_token:${userId}`);
  }
  
  private generateAccessToken(user: IUser): string {
    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry, issuer: config.jwt.issuer, audience: config.jwt.audience }
    );
  }
  
  private generateRefreshToken(user: IUser): string {
    return jwt.sign(
      { userId: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry, issuer: config.jwt.issuer, audience: config.jwt.audience }
    );
  }
  
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const redis = getRedisClient();
    await redis.set(`refresh_token:${userId}`, token, 'EX', 7 * 24 * 60 * 60);
  }
}