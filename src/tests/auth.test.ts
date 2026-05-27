import request from 'supertest';
import app from '../index';
import { User } from '../models/user.model';
import { connectDatabase, disconnectDatabase } from '../configs/database.config';

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  });
  
  afterAll(async () => {
    await disconnectDatabase();
  });
  
  describe('POST /v1/auth/login', () => {
    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({ email: 'invalid-email', password: 'password123' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
    
    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /v1/auth/refresh', () => {
    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/v1/auth/refresh')
        .send({ refresh_token: 'invalid-token' });
      
      expect(response.status).toBe(401);
    });
  });
});