/**
 * Authentication Manager for Infrastructure Access
 * Ensures only authorized users can deploy projects and access services
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export interface AuthConfig {
  masterPassword?: string;
  jwtSecret?: string;
  sessionTimeout?: number;
  allowedEmails?: string[];
  requireMFA?: boolean;
}

export interface AuthSession {
  userId: string;
  email: string;
  authenticated: boolean;
  permissions: string[];
  expiresAt: Date;
}

export class AuthManager {
  private secretManager: SecretManagerServiceClient;
  private config: AuthConfig;
  private sessionPath: string;
  private currentSession: AuthSession | null = null;
  
  constructor(config: AuthConfig = {}) {
    this.config = {
      sessionTimeout: config.sessionTimeout || 3600000, // 1 hour default
      requireMFA: config.requireMFA || false,
      ...config
    };
    this.secretManager = new SecretManagerServiceClient();
    this.sessionPath = path.join(process.env.HOME || '', '.ai-template', 'session.json');
    
    // Ensure session directory exists
    const sessionDir = path.dirname(this.sessionPath);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
  }
  
  /**
   * Authenticates user with master credentials
   */
  async authenticate(email: string, password: string, mfaCode?: string): Promise<AuthSession> {
    console.log('🔐 Authenticating user...');
    
    try {
      // Validate email is allowed
      if (this.config.allowedEmails && !this.config.allowedEmails.includes(email)) {
        throw new Error('Email not authorized for this template');
      }
      
      // Get master credentials from Secret Manager
      const masterCredentials = await this.getMasterCredentials();
      
      // Verify email and password
      const isValidEmail = email === masterCredentials.email;
      const isValidPassword = await bcrypt.compare(password, masterCredentials.passwordHash);
      
      if (!isValidEmail || !isValidPassword) {
        throw new Error('Invalid credentials');
      }
      
      // Verify MFA if required
      if (this.config.requireMFA) {
        if (!mfaCode) {
          throw new Error('MFA code required');
        }
        
        const isValidMFA = await this.verifyMFA(email, mfaCode);
        if (!isValidMFA) {
          throw new Error('Invalid MFA code');
        }
      }
      
      // Create session
      const session: AuthSession = {
        userId: crypto.randomUUID(),
        email,
        authenticated: true,
        permissions: ['infrastructure:create', 'infrastructure:manage', 'secrets:read'],
        expiresAt: new Date(Date.now() + this.config.sessionTimeout!)
      };
      
      // Save session
      await this.saveSession(session);
      this.currentSession = session;
      
      console.log('✅ Authentication successful');
      return session;
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }
  
  /**
   * Checks if current session is valid
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.loadSession();
      
      if (!session) {
        return false;
      }
      
      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.logout();
        return false;
      }
      
      this.currentSession = session;
      return true;
      
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Requires authentication before proceeding
   */
  async requireAuth(): Promise<AuthSession> {
    const isAuth = await this.isAuthenticated();
    
    if (!isAuth) {
      throw new Error('Authentication required. Please run: npm run deploy:login');
    }
    
    return this.currentSession!;
  }
  
  /**
   * Gets master credentials from Secret Manager
   */
  private async getMasterCredentials(): Promise<any> {
    try {
      // Try to get from environment first (for initial setup)
      if (process.env.MASTER_EMAIL && process.env.MASTER_PASSWORD_HASH) {
        return {
          email: process.env.MASTER_EMAIL,
          passwordHash: process.env.MASTER_PASSWORD_HASH
        };
      }
      
      // Get from Secret Manager
      const projectId = process.env.GCP_SECRETS_PROJECT_ID;
      const [version] = await this.secretManager.accessSecretVersion({
        name: `projects/${projectId}/secrets/ai-template-master-credentials/versions/latest`
      });
      
      const credentials = JSON.parse(version.payload?.data?.toString() || '{}');
      return credentials;
      
    } catch (error) {
      console.error('Failed to get master credentials:', error);
      throw new Error('Master credentials not configured. Please run initial setup.');
    }
  }
  
  /**
   * Verifies MFA code
   */
  private async verifyMFA(email: string, code: string): Promise<boolean> {
    // Implementation would verify TOTP/SMS code
    // For now, simple verification
    return code === '123456'; // Replace with actual MFA verification
  }
  
  /**
   * Saves session to disk
   */
  private async saveSession(session: AuthSession): Promise<void> {
    const encryptedSession = this.encryptData(JSON.stringify(session));
    fs.writeFileSync(this.sessionPath, encryptedSession);
  }
  
  /**
   * Loads session from disk
   */
  private async loadSession(): Promise<AuthSession | null> {
    try {
      if (!fs.existsSync(this.sessionPath)) {
        return null;
      }
      
      const encryptedData = fs.readFileSync(this.sessionPath, 'utf8');
      const decryptedData = this.decryptData(encryptedData);
      return JSON.parse(decryptedData);
      
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Logs out current session
   */
  async logout(): Promise<void> {
    if (fs.existsSync(this.sessionPath)) {
      fs.unlinkSync(this.sessionPath);
    }
    this.currentSession = null;
    console.log('✅ Logged out successfully');
  }
  
  /**
   * Encrypts sensitive data
   */
  private encryptData(data: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }
  
  /**
   * Decrypts sensitive data
   */
  private decryptData(encryptedData: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Sets up initial master credentials
   */
  async setupMasterCredentials(email: string, password: string): Promise<void> {
    console.log('🔧 Setting up master credentials...');
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Store in Secret Manager
    const projectId = process.env.GCP_SECRETS_PROJECT_ID;
    const secretId = 'ai-template-master-credentials';
    
    try {
      // Create secret if it doesn't exist
      await this.secretManager.createSecret({
        parent: `projects/${projectId}`,
        secretId,
        secret: {
          replication: {
            automatic: {}
          }
        }
      });
    } catch (error) {
      // Secret might already exist
    }
    
    // Add secret version
    await this.secretManager.addSecretVersion({
      parent: `projects/${projectId}/secrets/${secretId}`,
      payload: {
        data: Buffer.from(JSON.stringify({
          email,
          passwordHash,
          createdAt: new Date().toISOString()
        }), 'utf8')
      }
    });
    
    console.log('✅ Master credentials configured');
  }
  
  /**
   * Generates a secure token for API access
   */
  generateAccessToken(): string {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    return jwt.sign(
      {
        userId: this.currentSession.userId,
        email: this.currentSession.email,
        permissions: this.currentSession.permissions
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );
  }
  
  /**
   * Validates access token
   */
  validateAccessToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
} 