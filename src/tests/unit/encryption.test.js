const encryptionUtil = require('../../utils/encryption');

describe('EncryptionUtil', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text successfully', () => {
      const plainText = 'Sensitive data that needs encryption';
      
      const encrypted = encryptionUtil.encrypt(plainText);
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('encryptedData');
      expect(encrypted).toHaveProperty('authTag');
      
      const decrypted = encryptionUtil.decrypt(encrypted);
      expect(decrypted).toBe(plainText);
    });

    it('should produce different encrypted outputs for same input', () => {
      const plainText = 'Test data';
      
      const encrypted1 = encryptionUtil.encrypt(plainText);
      const encrypted2 = encryptionUtil.encrypt(plainText);
      
      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should fail to decrypt with wrong auth tag', () => {
      const plainText = 'Test data';
      const encrypted = encryptionUtil.encrypt(plainText);
      
      encrypted.authTag = '0000000000000000000000000000000000000000000000000000000000000000';
      
      expect(() => encryptionUtil.decrypt(encrypted)).toThrow();
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash and verify password successfully', () => {
      const password = 'SecurePassword123!';
      
      const { salt, hash } = encryptionUtil.hashPassword(password);
      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
      
      const isValid = encryptionUtil.verifyPassword(password, salt, hash);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong password', () => {
      const password = 'CorrectPassword';
      const wrongPassword = 'WrongPassword';
      
      const { salt, hash } = encryptionUtil.hashPassword(password);
      const isValid = encryptionUtil.verifyPassword(wrongPassword, salt, hash);
      
      expect(isValid).toBe(false);
    });
  });
});