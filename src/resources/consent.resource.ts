import { User } from '../models/user.model';
import { auditLogger, dataLineageLogger } from '../configs/logger.config';

export class ConsentResource {
  async recordConsent(userId: string, consentType: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      consentGiven: true,
      consentDate: new Date(),
      dataProcessingAgreement: true
    });
    
    auditLogger.info('User consent recorded', {
      userId,
      consentType,
      timestamp: new Date().toISOString()
    });
    
    dataLineageLogger.info('Consent event', {
      userId,
      action: 'consent_granted',
      consentType
    });
  }
  
  async revokeConsent(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      consentGiven: false,
      dataProcessingAgreement: false
    });
    
    auditLogger.info('User consent revoked', {
      userId,
      timestamp: new Date().toISOString()
    });
    
    dataLineageLogger.info('Consent event', {
      userId,
      action: 'consent_revoked'
    });
  }
  
  async getConsentStatus(userId: string): Promise<any> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      consentGiven: user.consentGiven,
      consentDate: user.consentDate,
      dataProcessingAgreement: user.dataProcessingAgreement
    };
  }
}