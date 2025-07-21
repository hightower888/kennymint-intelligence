// Backend Logic Connector for DemoTechApp
// This file ensures proper connection to RepoClone backend logic

import { AISystem } from '../backend-logic/ai-systems/ai-coordinator';
import { SecurityManager } from '../backend-logic/core-systems/security/security-manager';
import { StorageManager } from '../backend-logic/storage-management/storage-manager';

export class BackendConnector {
  private aiSystem: AISystem;
  private securityManager: SecurityManager;
  private storageManager: StorageManager;

  constructor() {
    this.initializeBackendLogic();
  }

  private async initializeBackendLogic() {
    try {
      // Initialize backend logic systems
      this.aiSystem = new AISystem();
      this.securityManager = new SecurityManager({
        enabled: true,
        threatDetection: true,
        vulnerabilityScanning: true,
        intrusionPrevention: true,
        encryptionEnabled: true,
        auditLogging: true,
        autoResponse: true,
        securityHeaders: true,
        rateLimiting: { enabled: true, windowMs: 900000, maxRequests: 100 },
        authentication: {
          jwtSecret: process.env.JWT_SECRET || 'default-secret',
          tokenExpiry: '24h',
          refreshTokenExpiry: '7d',
          maxLoginAttempts: 5,
          lockoutDuration: 300000
        }
      });
      this.storageManager = new StorageManager();

      console.log('✅ Backend logic connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to backend logic:', error);
    }
  }

  // Expose backend logic functionality
  getAISystem() {
    return this.aiSystem;
  }

  getSecurityManager() {
    return this.securityManager;
  }

  getStorageManager() {
    return this.storageManager;
  }
}

export default BackendConnector; 