const Validator = require('../../utils/validator-continued');

describe('Validator', () => {
  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("XSS")</script>';
      const sanitized = Validator.sanitizeInput(input);
      
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('"');
    });

    it('should trim whitespace', () => {
      const input = '  test data  ';
      const sanitized = Validator.sanitizeInput(input);
      
      expect(sanitized).toBe('test data');
    });
  });

  describe('validateShipmentCreate', () => {
    it('should validate correct shipment data', () => {
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
        estimatedDelivery: new Date('2024-12-31')
      };

      const { error } = Validator.validateShipmentCreate(shipmentData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid tracking number', () => {
      const shipmentData = {
        trackingNumber: 'SHORT',
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
        estimatedDelivery: new Date('2024-12-31')
      };

      const { error } = Validator.validateShipmentCreate(shipmentData);
      expect(error).toBeDefined();
    });
  });

  describe('isPII', () => {
    it('should identify PII fields', () => {
      expect(Validator.isPII('email')).toBe(true);
      expect(Validator.isPII('phone')).toBe(true);
      expect(Validator.isPII('ssn')).toBe(true);
      expect(Validator.isPII('trackingNumber')).toBe(false);
    });
  });

  describe('filterPII', () => {
    it('should redact PII fields', () => {
      const data = {
        trackingNumber: 'SHIP12345678',
        email: 'user@example.com',
        phone: '555-1234'
      };

      const filtered = Validator.filterPII(data);
      
      expect(filtered.trackingNumber).toBe('SHIP12345678');
      expect(filtered.email).toBe('***REDACTED***');
      expect(filtered.phone).toBe('***REDACTED***');
    });
  });
});