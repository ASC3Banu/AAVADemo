const request = require('supertest');
const app = require('../../app');
const { sequelize } = require('../../config/database');
const jwt = require('jsonwebtoken');
const config = require('../../config/env');

describe('Shipment API Integration Tests', () => {
  let authToken;
  let shipmentId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    authToken = jwt.sign(
      {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'logistics_manager',
        permissions: ['create_shipment', 'read_shipment', 'update_shipment']
      },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/shipments', () => {
    it('should create a new shipment', async () => {
      const shipmentData = {
        trackingNumber: 'SHIP12345678',
        origin: {
          address: '123 Main St',
          city: 'New York',
          country: 'US',
          postalCode: '10001'
        },
        destination: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          country: 'US',
          postalCode: '90001'
        },
        carrier: 'FedEx',
        priority: 'high',
        estimatedDelivery: new Date('2024-12-31').toISOString()
      };

      const response = await request(app)
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(shipmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      shipmentId = response.body.data.id;
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/shipments')
        .send({})
        .expect(401);
    });
  });

  describe('GET /api/v1/shipments/:id', () => {
    it('should get shipment by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/shipments/${shipmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(shipmentId);
    });

    it('should return 404 for non-existent shipment', async () => {
      await request(app)
        .get('/api/v1/shipments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});