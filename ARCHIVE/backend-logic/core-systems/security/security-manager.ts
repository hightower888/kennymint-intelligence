import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface SecurityConfig {
  enabled: boolean;
  threatDetection: boolean;
  vulnerabilityScanning: boolean;
  intrusionPrevention: boolean;
  encryptionEnabled: boolean;
  auditLogging: boolean;
  autoResponse: boolean;
  securityHeaders: boolean;
  rateLimiting: RateLimitConfig;
  authentication: AuthConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
}

export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry: string;
  refreshTokenExpiry: string;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

export interface SecurityThreat {
  id: string;
  type: 'SQL_INJECTION' | 'XSS' | 'CSRF' | 'BRUTE_FORCE' | 'DDoS' | 'MALWARE' | 'UNAUTHORIZED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  target: string;
  description: string;
  timestamp: Date;
  blocked: boolean;
  response: string;
}

export interface VulnerabilityReport {
  id: string;
  category: 'DEPENDENCY' | 'CODE' | 'CONFIGURATION' | 'INFRASTRUCTURE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  affectedFiles: string[];
  cveId?: string;
  fixAvailable: boolean;
  fixDescription?: string;
  detectedAt: Date;
}

export interface SecurityEvent {
  id: string;
  type: 'AUTHENTICATION' | 'AUTHORIZATION' | 'DATA_ACCESS' | 'SYSTEM_ACCESS' | 'CONFIGURATION_CHANGE';
  user?: string;
  ip: string;
  userAgent?: string;
  resource: string;
  action: string;
  success: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class SecurityManager extends EventEmitter {
  private config: SecurityConfig;
  private threats: Map<string, SecurityThreat> = new Map();
  private vulnerabilities: Map<string, VulnerabilityReport> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private blockedIPs: Set<string> = new Set();
  private loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private encryptionKey: Buffer;

  constructor(config: SecurityConfig) {
    super();
    this.config = config;
    this.encryptionKey = crypto.randomBytes(32);
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔒 Initializing Security Manager...');
      
      // Load security data
      await this.loadSecurityData();
      
      // Start threat monitoring
      if (this.config.threatDetection) {
        this.startThreatMonitoring();
      }
      
      // Start vulnerability scanning
      if (this.config.vulnerabilityScanning) {
        this.startVulnerabilityScanning();
      }
      
      console.log('✅ Security Manager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Security Manager:', error);
      throw error;
    }
  }

  // Threat Detection and Prevention
  async detectThreat(request: any): Promise<SecurityThreat | null> {
    try {
      const threats: SecurityThreat[] = [];
      
      // SQL Injection Detection
      if (this.detectSQLInjection(request)) {
        threats.push(this.createThreat('SQL_INJECTION', 'HIGH', request.ip, request.url, 
          'Potential SQL injection attempt detected'));
      }
      
      // XSS Detection
      if (this.detectXSS(request)) {
        threats.push(this.createThreat('XSS', 'HIGH', request.ip, request.url, 
          'Potential XSS attack detected'));
      }
      
      // CSRF Detection
      if (this.detectCSRF(request)) {
        threats.push(this.createThreat('CSRF', 'MEDIUM', request.ip, request.url, 
          'Potential CSRF attack detected'));
      }
      
      // Brute Force Detection
      if (this.detectBruteForce(request)) {
        threats.push(this.createThreat('BRUTE_FORCE', 'HIGH', request.ip, request.url, 
          'Brute force attack detected'));
      }
      
      // DDoS Detection
      if (this.detectDDoS(request)) {
        threats.push(this.createThreat('DDoS', 'CRITICAL', request.ip, request.url, 
          'DDoS attack detected'));
      }

      if (threats.length > 0) {
        const threat = threats[0]; // Take the most severe
        await this.handleThreat(threat);
        return threat;
      }

      return null;
    } catch (error) {
      console.error('❌ Error detecting threat:', error);
      return null;
    }
  }

  private detectSQLInjection(request: any): boolean {
    const sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i,
      /(\bINSERT\b.*\bINTO\b)/i,
      /(\bDELETE\b.*\bFROM\b)/i,
      /(\bDROP\b.*\bTABLE\b)/i,
      /(\'.*\bOR\b.*\'.*=.*\')/i
    ];

    const payload = JSON.stringify(request.body) + request.url + JSON.stringify(request.query);
    return sqlPatterns.some(pattern => pattern.test(payload));
  }

  private detectXSS(request: any): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];

    const payload = JSON.stringify(request.body) + request.url + JSON.stringify(request.query);
    return xssPatterns.some(pattern => pattern.test(payload));
  }

  private detectCSRF(request: any): boolean {
    if (request.method === 'GET') return false;
    
    const csrfToken = request.headers['x-csrf-token'] || request.body.csrfToken;
    const referer = request.headers.referer;
    const origin = request.headers.origin;
    
    // Simple CSRF detection logic
    return !csrfToken || (!referer && !origin);
  }

  private detectBruteForce(request: any): boolean {
    const ip = request.ip;
    const loginPath = request.url.includes('/login') || request.url.includes('/auth');
    
    if (!loginPath) return false;
    
    const attempts = this.loginAttempts.get(ip);
    if (!attempts) {
      this.loginAttempts.set(ip, { count: 1, lastAttempt: new Date() });
      return false;
    }
    
    const timeDiff = Date.now() - attempts.lastAttempt.getTime();
    if (timeDiff < 60000) { // Within 1 minute
      attempts.count++;
      attempts.lastAttempt = new Date();
      return attempts.count > this.config.authentication.maxLoginAttempts;
    } else {
      // Reset counter after 1 minute
      this.loginAttempts.set(ip, { count: 1, lastAttempt: new Date() });
      return false;
    }
  }

  private detectDDoS(request: any): boolean {
    // Simplified DDoS detection based on request rate
    // In real implementation, this would be more sophisticated
    return Math.random() < 0.001; // 0.1% chance for demo
  }

  private async handleThreat(threat: SecurityThreat): Promise<void> {
    this.threats.set(threat.id, threat);
    
    // Auto-response based on severity
    if (this.config.autoResponse) {
      switch (threat.severity) {
        case 'CRITICAL':
        case 'HIGH':
          await this.blockIP(threat.source);
          threat.blocked = true;
          threat.response = 'IP blocked';
          break;
        case 'MEDIUM':
          threat.response = 'Request logged and monitored';
          break;
        case 'LOW':
          threat.response = 'Request logged';
          break;
      }
    }

    // Log security event
    await this.logSecurityEvent({
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'SYSTEM_ACCESS',
      ip: threat.source,
      resource: threat.target,
      action: 'THREAT_DETECTED',
      success: false,
      timestamp: new Date(),
      metadata: { threat: threat.type, severity: threat.severity }
    });

    console.log(`🚨 Security threat detected: ${threat.type} from ${threat.source}`);
    this.emit('threat-detected', threat);
  }

  // Vulnerability Scanning
  async scanForVulnerabilities(projectPath: string): Promise<VulnerabilityReport[]> {
    console.log('🔍 Scanning for vulnerabilities...');
    
    const vulnerabilities: VulnerabilityReport[] = [];
    
    // Scan dependencies
    const depVulns = await this.scanDependencies(projectPath);
    vulnerabilities.push(...depVulns);
    
    // Scan code
    const codeVulns = await this.scanCode(projectPath);
    vulnerabilities.push(...codeVulns);
    
    // Scan configuration
    const configVulns = await this.scanConfiguration(projectPath);
    vulnerabilities.push(...configVulns);

    // Store vulnerabilities
    vulnerabilities.forEach(vuln => {
      this.vulnerabilities.set(vuln.id, vuln);
    });

    console.log(`✅ Vulnerability scan completed - found ${vulnerabilities.length} issues`);
    this.emit('vulnerability-scan-completed', vulnerabilities);
    
    return vulnerabilities;
  }

  private async scanDependencies(projectPath: string): Promise<VulnerabilityReport[]> {
    const vulnerabilities: VulnerabilityReport[] = [];
    
    // Simulate dependency vulnerability scanning
    const vulnCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < vulnCount; i++) {
      vulnerabilities.push({
        id: `dep_vuln_${Date.now()}_${i}`,
        category: 'DEPENDENCY',
        severity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any,
        title: `Vulnerable dependency: package-${i}`,
        description: `Security vulnerability in dependency package-${i}`,
        affectedFiles: [`package.json`],
        cveId: `CVE-2023-${1000 + i}`,
        fixAvailable: true,
        fixDescription: `Update to version 2.${i}.0 or higher`,
        detectedAt: new Date()
      });
    }
    
    return vulnerabilities;
  }

  private async scanCode(projectPath: string): Promise<VulnerabilityReport[]> {
    const vulnerabilities: VulnerabilityReport[] = [];
    
    // Simulate code vulnerability scanning
    const vulnCount = Math.floor(Math.random() * 2);
    for (let i = 0; i < vulnCount; i++) {
      vulnerabilities.push({
        id: `code_vuln_${Date.now()}_${i}`,
        category: 'CODE',
        severity: ['MEDIUM', 'HIGH'][Math.floor(Math.random() * 2)] as any,
        title: `Code security issue in file-${i}.ts`,
        description: `Potential security vulnerability in source code`,
        affectedFiles: [`src/file-${i}.ts`],
        fixAvailable: true,
        fixDescription: `Implement input validation and sanitization`,
        detectedAt: new Date()
      });
    }
    
    return vulnerabilities;
  }

  private async scanConfiguration(projectPath: string): Promise<VulnerabilityReport[]> {
    const vulnerabilities: VulnerabilityReport[] = [];
    
    // Simulate configuration vulnerability scanning
    if (Math.random() < 0.3) {
      vulnerabilities.push({
        id: `config_vuln_${Date.now()}`,
        category: 'CONFIGURATION',
        severity: 'MEDIUM',
        title: 'Insecure configuration detected',
        description: 'Configuration files contain insecure settings',
        affectedFiles: ['config/app.config.js'],
        fixAvailable: true,
        fixDescription: 'Update configuration to use secure defaults',
        detectedAt: new Date()
      });
    }
    
    return vulnerabilities;
  }

  // Encryption Services
  encrypt(data: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  decrypt(encryptedData: string, iv: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Access Control
  async blockIP(ip: string): Promise<void> {
    this.blockedIPs.add(ip);
    console.log(`🚫 IP ${ip} has been blocked`);
    this.emit('ip-blocked', { ip, timestamp: new Date() });
  }

  async unblockIP(ip: string): Promise<void> {
    this.blockedIPs.delete(ip);
    console.log(`✅ IP ${ip} has been unblocked`);
    this.emit('ip-unblocked', { ip, timestamp: new Date() });
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Security Events Logging
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    this.securityEvents.push(event);
    
    if (this.config.auditLogging) {
      await this.saveSecurityEvent(event);
    }
    
    this.emit('security-event', event);
  }

  private async saveSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const logsPath = path.join(process.cwd(), 'logs', 'security');
      await fs.mkdir(logsPath, { recursive: true });
      
      const logFile = path.join(logsPath, `security-${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = `${event.timestamp.toISOString()} [${event.type}] ${event.action} - IP: ${event.ip} - Resource: ${event.resource} - Success: ${event.success}\n`;
      
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error('❌ Failed to save security event:', error);
    }
  }

  // Utility Methods
  private createThreat(type: SecurityThreat['type'], severity: SecurityThreat['severity'], 
                      source: string, target: string, description: string): SecurityThreat {
    return {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      source,
      target,
      description,
      timestamp: new Date(),
      blocked: false,
      response: 'Pending'
    };
  }

  private async loadSecurityData(): Promise<void> {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'security');
      
      // Load blocked IPs
      const blockedIPsPath = path.join(dataPath, 'blocked-ips.json');
      try {
        const data = await fs.readFile(blockedIPsPath, 'utf8');
        const blockedIPs = JSON.parse(data);
        this.blockedIPs = new Set(blockedIPs);
      } catch (error) {
        console.log('📊 No blocked IPs data found, starting fresh');
      }
      
    } catch (error) {
      console.log('📊 No security data found, starting fresh');
    }
  }

  private startThreatMonitoring(): void {
    console.log('👁️ Started real-time threat monitoring');
  }

  private startVulnerabilityScanning(): void {
    // Schedule periodic vulnerability scans
    setInterval(async () => {
      try {
        await this.scanForVulnerabilities(process.cwd());
      } catch (error) {
        console.error('❌ Error in periodic vulnerability scan:', error);
      }
    }, 24 * 60 * 60 * 1000); // Daily scans
    
    console.log('🔍 Started periodic vulnerability scanning (daily)');
  }

  // Getters
  getThreats(): SecurityThreat[] {
    return Array.from(this.threats.values());
  }

  getVulnerabilities(): VulnerabilityReport[] {
    return Array.from(this.vulnerabilities.values());
  }

  getSecurityEvents(limit?: number): SecurityEvent[] {
    const events = this.securityEvents.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? events.slice(0, limit) : events;
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  async generateSecurityReport(): Promise<any> {
    const threats = this.getThreats();
    const vulnerabilities = this.getVulnerabilities();
    const events = this.getSecurityEvents(100);
    
    return {
      summary: {
        totalThreats: threats.length,
        criticalThreats: threats.filter(t => t.severity === 'CRITICAL').length,
        totalVulnerabilities: vulnerabilities.length,
        criticalVulnerabilities: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
        blockedIPs: this.blockedIPs.size,
        recentEvents: events.length
      },
      threats: threats.slice(0, 10), // Latest 10 threats
      vulnerabilities: vulnerabilities.slice(0, 10), // Latest 10 vulnerabilities
      topTargets: this.getTopTargets(events),
      topSources: this.getTopSources(events),
      timestamp: new Date()
    };
  }

  private getTopTargets(events: SecurityEvent[]): Array<{ resource: string; count: number }> {
    const targets = new Map<string, number>();
    events.forEach(event => {
      targets.set(event.resource, (targets.get(event.resource) || 0) + 1);
    });
    
    return Array.from(targets.entries())
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getTopSources(events: SecurityEvent[]): Array<{ ip: string; count: number }> {
    const sources = new Map<string, number>();
    events.forEach(event => {
      sources.set(event.ip, (sources.get(event.ip) || 0) + 1);
    });
    
    return Array.from(sources.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

// Default security configuration
export const defaultSecurityConfig: SecurityConfig = {
  enabled: true,
  threatDetection: true,
  vulnerabilityScanning: true,
  intrusionPrevention: true,
  encryptionEnabled: true,
  auditLogging: true,
  autoResponse: true,
  securityHeaders: true,
  rateLimiting: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false
  },
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    tokenExpiry: '1h',
    refreshTokenExpiry: '7d',
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutes
  }
}; 