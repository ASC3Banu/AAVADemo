import request from 'supertest';
import app from '../../index';
import { connectDatabase, disconnectDatabase } from '../../configs/database.config';
import { initializeRedis, closeRedis } from '../../configs/redis.config';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
    await initializeRedis();
  });
  
  afterAll(async () => {
    await disconnectDatabase();
    await closeRedis();
  });
  
  describe('Health Checks', () => {
    it('should return 200 for /health endpoint', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
    
    it('should return 200 for /health/ready endpoint', async () => {
      const response = await request(app).get('/health/ready');
      expect(response.status).toBe(200);
    });
  });
  
  describe('API Versioning', () => {
    it('should handle v1 API routes', async () => {
      const response = await request(app).get('/v1/shipments');
      expect(response.status).toBe(401);
    });
  });
  
  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});