import request from 'supertest';
import app from '../index';
import { Shipment } from '../models/shipment.model';
import { connectDatabase, disconnectDatabase } from '../configs/database.config';

describe('Shipment API Tests', () => {
  let authToken: string;
  
  beforeAll(async () => {
    await connectDatabase();
  });
  
  afterAll(async () => {
    await disconnectDatabase();
  });
  
  describe('GET /v1/shipments', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/v1/shipments');
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /v1/shipments', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/v1/shipments')
        .send({});
      
      expect(response.status).toBe(401);
    });
  });
});