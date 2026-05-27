const shipmentService = require('../../services/shipment.service');
const shipmentRepository = require('../../repositories/shipment.repository-complete');
const eventRepository = require('../../repositories/event.repository-complete');
const { publishEvent } = require('../../config/kafka');

jest.mock('../../repositories/shipment.repository-complete');
jest.mock('../../repositories/event.repository-complete');
jest.mock('../../config/kafka');

describe('ShipmentService', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockShipmentData = {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createShipment', () => {
    it('should create a shipment successfully', async () => {
      const mockShipment = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...mockShipmentData,
        status: 'pending',
        toSafeObject: jest.fn().mockReturnValue({ id: '123e4567-e89b-12d3-a456-426614174001' })
      };

      shipmentRepository.create.mockResolvedValue(mockShipment);
      eventRepository.create.mockResolvedValue({});
      publishEvent.mockResolvedValue();

      const result = await shipmentService.createShipment(mockShipmentData, mockUserId);

      expect(shipmentRepository.create).toHaveBeenCalledWith({
        ...mockShipmentData,
        createdBy: mockUserId
      });
      expect(eventRepository.create).toHaveBeenCalled();
      expect(publishEvent).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when shipment creation fails', async () => {
      shipmentRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(
        shipmentService.createShipment(mockShipmentData, mockUserId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getShipmentById', () => {
    it('should return shipment when found', async () => {
      const mockShipment = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        toSafeObject: jest.fn().mockReturnValue({ id: '123e4567-e89b-12d3-a456-426614174001' })
      };

      shipmentRepository.findById.mockResolvedValue(mockShipment);

      const result = await shipmentService.getShipmentById(
        '123e4567-e89b-12d3-a456-426614174001',
        mockUserId
      );

      expect(result).toBeDefined();
      expect(shipmentRepository.findById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174001');
    });

    it('should throw 404 error when shipment not found', async () => {
      shipmentRepository.findById.mockResolvedValue(null);

      await expect(
        shipmentService.getShipmentById('non-existent-id', mockUserId)
      ).rejects.toThrow('Shipment not found');
    });
  });
});