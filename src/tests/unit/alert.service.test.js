const alertService = require('../../services/alert.service-complete');
const alertRepository = require('../../repositories/alert.repository');
const { publishEvent } = require('../../config/kafka');

jest.mock('../../repositories/alert.repository');
jest.mock('../../config/kafka');

describe('AlertService', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockAlertData = {
    shipmentId: '123e4567-e89b-12d3-a456-426614174001',
    type: 'delay',
    severity: 'high',
    title: 'Shipment Delay',
    description: 'Shipment delayed due to weather conditions'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAlert', () => {
    it('should create an alert successfully', async () => {
      const mockAlert = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        ...mockAlertData,
        status: 'active'
      };

      alertRepository.create.mockResolvedValue(mockAlert);
      publishEvent.mockResolvedValue();

      const result = await alertService.createAlert(mockAlertData, mockUserId);

      expect(alertRepository.create).toHaveBeenCalledWith(mockAlertData);
      expect(publishEvent).toHaveBeenCalled();
      expect(result).toEqual(mockAlert);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an alert successfully', async () => {
      const mockAlert = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        status: 'acknowledged'
      };

      alertRepository.acknowledge.mockResolvedValue(mockAlert);

      const result = await alertService.acknowledgeAlert(
        '123e4567-e89b-12d3-a456-426614174002',
        mockUserId,
        'Acknowledged and investigating'
      );

      expect(alertRepository.acknowledge).toHaveBeenCalled();
      expect(result).toEqual(mockAlert);
    });
  });
});