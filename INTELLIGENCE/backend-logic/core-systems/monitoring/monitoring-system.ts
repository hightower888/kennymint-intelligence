import { EventEmitter } from 'events';
import * as os from 'os';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  alerting: boolean;
  dashboard: boolean;
  logRetention: number; // days
  thresholds: {
    cpu: number;
    memory: number;
    disk: number;
    responseTime: number;
    errorRate: number;
  };
  alerts: {
    email: string[];
    webhook: string[];
    slack: string[];
  };
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
}

export interface ApplicationMetrics {
  timestamp: Date;
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    rps: number; // requests per second
  };
  database: {
    connections: number;
    queries: number;
    averageQueryTime: number;
    slowQueries: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  errors: {
    total: number;
    rate: number;
    byType: Map<string, number>;
  };
}

export interface HealthCheck {
  name: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  responseTime: number;
  message?: string;
  lastCheck: Date;
  uptime: number;
}

export interface Alert {
  id: string;
  type: 'CPU' | 'MEMORY' | 'DISK' | 'RESPONSE_TIME' | 'ERROR_RATE' | 'HEALTH_CHECK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface DashboardData {
  systemMetrics: SystemMetrics;
  applicationMetrics: ApplicationMetrics;
  healthChecks: HealthCheck[];
  activeAlerts: Alert[];
  uptime: number;
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
}

export class MonitoringSystem extends EventEmitter {
  private config: MonitoringConfig;
  private systemMetrics: SystemMetrics[] = [];
  private applicationMetrics: ApplicationMetrics[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private metricsTimer: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();
  private requestCount = 0;
  private errorCount = 0;
  private responseTimeSum = 0;

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      console.log('📊 Initializing Monitoring System...');
      
      // Initialize health checks
      await this.initializeHealthChecks();
      
      // Start metrics collection
      if (this.config.enabled) {
        this.startMetricsCollection();
      }
      
      // Setup log rotation
      this.setupLogRotation();
      
      console.log('✅ Monitoring System initialized successfully');
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Monitoring System:', error);
      throw error;
    }
  }

  // System Metrics Collection
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    // Simulate disk usage (in real implementation, would use actual disk stats)
    const totalDisk = 1000000000000; // 1TB
    const usedDisk = totalDisk * (0.3 + Math.random() * 0.4); // 30-70% usage
    const freeDisk = totalDisk - usedDisk;
    
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: {
        usage: this.getCPUUsage(),
        loadAverage: os.loadavg(),
        cores: cpus.length
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usage: (usedMem / totalMem) * 100
      },
      disk: {
        total: totalDisk,
        used: usedDisk,
        free: freeDisk,
        usage: (usedDisk / totalDisk) * 100
      },
      network: {
        bytesIn: Math.floor(Math.random() * 1000000),
        bytesOut: Math.floor(Math.random() * 1000000)
      }
    };

    return metrics;
  }

  private getCPUUsage(): number {
    // Simplified CPU usage calculation
    // In real implementation, would calculate actual CPU usage
    return Math.random() * 100;
  }

  private async collectApplicationMetrics(): Promise<ApplicationMetrics> {
    const now = Date.now();
    const minuteAgo = now - 60000;
    
    // Calculate RPS for the last minute
    const recentRequests = this.requestCount; // Simplified
    const rps = recentRequests / 60;
    
    const metrics: ApplicationMetrics = {
      timestamp: new Date(),
      requests: {
        total: this.requestCount,
        successful: this.requestCount - this.errorCount,
        failed: this.errorCount,
        averageResponseTime: this.requestCount > 0 ? this.responseTimeSum / this.requestCount : 0,
        rps
      },
      database: {
        connections: Math.floor(Math.random() * 20) + 5,
        queries: Math.floor(Math.random() * 1000) + 100,
        averageQueryTime: Math.random() * 50 + 10,
        slowQueries: Math.floor(Math.random() * 5)
      },
      cache: {
        hits: Math.floor(Math.random() * 800) + 200,
        misses: Math.floor(Math.random() * 100) + 10,
        hitRate: 0 // Will be calculated
      },
      errors: {
        total: this.errorCount,
        rate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
        byType: new Map([
          ['ValidationError', Math.floor(Math.random() * 10)],
          ['DatabaseError', Math.floor(Math.random() * 5)],
          ['NetworkError', Math.floor(Math.random() * 3)]
        ])
      }
    };

    // Calculate cache hit rate
    const totalCacheRequests = metrics.cache.hits + metrics.cache.misses;
    metrics.cache.hitRate = totalCacheRequests > 0 ? (metrics.cache.hits / totalCacheRequests) * 100 : 0;

    return metrics;
  }

  // Health Checks
  private async initializeHealthChecks(): Promise<void> {
    const healthChecks = [
      { name: 'Database', endpoint: '/health/db' },
      { name: 'Cache', endpoint: '/health/cache' },
      { name: 'External API', endpoint: '/health/external' },
      { name: 'File System', endpoint: '/health/fs' },
      { name: 'Memory', endpoint: '/health/memory' }
    ];

    for (const check of healthChecks) {
      const healthCheck: HealthCheck = {
        name: check.name,
        status: 'UNKNOWN',
        responseTime: 0,
        lastCheck: new Date(),
        uptime: 0
      };
      
      this.healthChecks.set(check.name, healthCheck);
    }

    // Start periodic health checks
    setInterval(() => this.performHealthChecks(), 30000); // Every 30 seconds
  }

  private async performHealthChecks(): Promise<void> {
    for (const [name, healthCheck] of this.healthChecks.entries()) {
      const startTime = Date.now();
      
      try {
        // Simulate health check
        await this.simulateHealthCheck(name);
        
        const responseTime = Date.now() - startTime;
        const status = this.determineHealthStatus(responseTime, name);
        
        healthCheck.status = status;
        healthCheck.responseTime = responseTime;
        healthCheck.lastCheck = new Date();
        
        if (status !== 'HEALTHY') {
          await this.createAlert('HEALTH_CHECK', 'HIGH', 
            `Health check failed: ${name}`, 
            `${name} health check is ${status}`, 
            responseTime, 1000);
        }
        
      } catch (error) {
        healthCheck.status = 'CRITICAL';
        healthCheck.responseTime = Date.now() - startTime;
        healthCheck.lastCheck = new Date();
        healthCheck.message = error.message;
        
        await this.createAlert('HEALTH_CHECK', 'CRITICAL', 
          `Health check critical: ${name}`, 
          `${name} health check failed: ${error.message}`, 
          0, 1);
      }
    }

    this.emit('health-checks-completed', Array.from(this.healthChecks.values()));
  }

  private async simulateHealthCheck(name: string): Promise<void> {
    // Simulate various health check scenarios
    const delay = Math.random() * 1000 + 100; // 100-1100ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error(`${name} service unavailable`);
    }
  }

  private determineHealthStatus(responseTime: number, name: string): HealthCheck['status'] {
    if (responseTime > 5000) return 'CRITICAL';
    if (responseTime > 2000) return 'WARNING';
    return 'HEALTHY';
  }

  // Alerting System
  private async checkThresholds(systemMetrics: SystemMetrics, appMetrics: ApplicationMetrics): Promise<void> {
    // CPU threshold
    if (systemMetrics.cpu.usage > this.config.thresholds.cpu) {
      await this.createAlert('CPU', 'HIGH', 'High CPU Usage', 
        `CPU usage is ${systemMetrics.cpu.usage.toFixed(1)}%`, 
        systemMetrics.cpu.usage, this.config.thresholds.cpu);
    }

    // Memory threshold
    if (systemMetrics.memory.usage > this.config.thresholds.memory) {
      await this.createAlert('MEMORY', 'HIGH', 'High Memory Usage', 
        `Memory usage is ${systemMetrics.memory.usage.toFixed(1)}%`, 
        systemMetrics.memory.usage, this.config.thresholds.memory);
    }

    // Disk threshold
    if (systemMetrics.disk.usage > this.config.thresholds.disk) {
      await this.createAlert('DISK', 'MEDIUM', 'High Disk Usage', 
        `Disk usage is ${systemMetrics.disk.usage.toFixed(1)}%`, 
        systemMetrics.disk.usage, this.config.thresholds.disk);
    }

    // Response time threshold
    if (appMetrics.requests.averageResponseTime > this.config.thresholds.responseTime) {
      await this.createAlert('RESPONSE_TIME', 'MEDIUM', 'High Response Time', 
        `Average response time is ${appMetrics.requests.averageResponseTime.toFixed(1)}ms`, 
        appMetrics.requests.averageResponseTime, this.config.thresholds.responseTime);
    }

    // Error rate threshold
    if (appMetrics.errors.rate > this.config.thresholds.errorRate) {
      await this.createAlert('ERROR_RATE', 'HIGH', 'High Error Rate', 
        `Error rate is ${appMetrics.errors.rate.toFixed(1)}%`, 
        appMetrics.errors.rate, this.config.thresholds.errorRate);
    }
  }

  private async createAlert(type: Alert['type'], severity: Alert['severity'], 
                           title: string, description: string, 
                           value: number, threshold: number): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: Alert = {
      id: alertId,
      type,
      severity,
      title,
      description,
      value,
      threshold,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.set(alertId, alert);
    
    if (this.config.alerting) {
      await this.sendAlert(alert);
    }

    console.log(`🚨 Alert created: ${title} - ${description}`);
    this.emit('alert-created', alert);
  }

  private async sendAlert(alert: Alert): Promise<void> {
    // Send to configured alert channels
    for (const email of this.config.alerts.email) {
      await this.sendEmailAlert(email, alert);
    }
    
    for (const webhook of this.config.alerts.webhook) {
      await this.sendWebhookAlert(webhook, alert);
    }
    
    for (const slack of this.config.alerts.slack) {
      await this.sendSlackAlert(slack, alert);
    }
  }

  private async sendEmailAlert(email: string, alert: Alert): Promise<void> {
    // Simulate email sending
    console.log(`📧 Email alert sent to ${email}: ${alert.title}`);
  }

  private async sendWebhookAlert(webhook: string, alert: Alert): Promise<void> {
    // Simulate webhook sending
    console.log(`🔗 Webhook alert sent to ${webhook}: ${alert.title}`);
  }

  private async sendSlackAlert(slack: string, alert: Alert): Promise<void> {
    // Simulate Slack notification
    console.log(`💬 Slack alert sent to ${slack}: ${alert.title}`);
  }

  // Metrics Collection
  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(async () => {
      try {
        const systemMetrics = await this.collectSystemMetrics();
        const applicationMetrics = await this.collectApplicationMetrics();
        
        this.systemMetrics.push(systemMetrics);
        this.applicationMetrics.push(applicationMetrics);
        
        // Keep only recent metrics (last 24 hours)
        const cutoff = Date.now() - (24 * 60 * 60 * 1000);
        this.systemMetrics = this.systemMetrics.filter(m => m.timestamp.getTime() > cutoff);
        this.applicationMetrics = this.applicationMetrics.filter(m => m.timestamp.getTime() > cutoff);
        
        // Check thresholds
        await this.checkThresholds(systemMetrics, applicationMetrics);
        
        this.emit('metrics-collected', { systemMetrics, applicationMetrics });
      } catch (error) {
        console.error('❌ Error collecting metrics:', error);
      }
    }, this.config.metricsInterval);

    console.log(`📊 Started metrics collection (interval: ${this.config.metricsInterval}ms)`);
  }

  // Dashboard Data
  getDashboardData(): DashboardData {
    const latestSystemMetrics = this.systemMetrics[this.systemMetrics.length - 1];
    const latestAppMetrics = this.applicationMetrics[this.applicationMetrics.length - 1];
    const activeAlerts = Array.from(this.alerts.values()).filter(a => !a.resolved);
    const uptime = Date.now() - this.startTime.getTime();

    // Calculate performance metrics for the last hour
    const hourAgo = Date.now() - (60 * 60 * 1000);
    const recentAppMetrics = this.applicationMetrics.filter(m => m.timestamp.getTime() > hourAgo);
    
    const avgResponseTime = recentAppMetrics.length > 0 ? 
      recentAppMetrics.reduce((sum, m) => sum + m.requests.averageResponseTime, 0) / recentAppMetrics.length : 0;
    
    const requestsPerMinute = recentAppMetrics.length > 0 ? 
      recentAppMetrics.reduce((sum, m) => sum + m.requests.rps, 0) * 60 / recentAppMetrics.length : 0;
    
    const errorRate = recentAppMetrics.length > 0 ? 
      recentAppMetrics.reduce((sum, m) => sum + m.errors.rate, 0) / recentAppMetrics.length : 0;

    return {
      systemMetrics: latestSystemMetrics || this.getDefaultSystemMetrics(),
      applicationMetrics: latestAppMetrics || this.getDefaultApplicationMetrics(),
      healthChecks: Array.from(this.healthChecks.values()),
      activeAlerts,
      uptime,
      performance: {
        avgResponseTime,
        requestsPerMinute,
        errorRate
      }
    };
  }

  private getDefaultSystemMetrics(): SystemMetrics {
    return {
      timestamp: new Date(),
      cpu: { usage: 0, loadAverage: [0, 0, 0], cores: os.cpus().length },
      memory: { total: os.totalmem(), used: 0, free: os.freemem(), usage: 0 },
      disk: { total: 1000000000000, used: 0, free: 1000000000000, usage: 0 },
      network: { bytesIn: 0, bytesOut: 0 }
    };
  }

  private getDefaultApplicationMetrics(): ApplicationMetrics {
    return {
      timestamp: new Date(),
      requests: { total: 0, successful: 0, failed: 0, averageResponseTime: 0, rps: 0 },
      database: { connections: 0, queries: 0, averageQueryTime: 0, slowQueries: 0 },
      cache: { hits: 0, misses: 0, hitRate: 0 },
      errors: { total: 0, rate: 0, byType: new Map() }
    };
  }

  // Request Tracking
  trackRequest(responseTime: number, success: boolean): void {
    this.requestCount++;
    this.responseTimeSum += responseTime;
    
    if (!success) {
      this.errorCount++;
    }
  }

  // Log Management
  private setupLogRotation(): void {
    // Implement log rotation logic
    setInterval(async () => {
      await this.rotateMetricsLogs();
    }, 24 * 60 * 60 * 1000); // Daily rotation

    console.log('🔄 Log rotation scheduled (daily)');
  }

  private async rotateMetricsLogs(): Promise<void> {
    try {
      const logsPath = path.join(process.cwd(), 'logs', 'metrics');
      await fs.mkdir(logsPath, { recursive: true });
      
      const today = new Date().toISOString().split('T')[0];
      const metricsFile = path.join(logsPath, `metrics-${today}.json`);
      
      const data = {
        systemMetrics: this.systemMetrics.slice(-100), // Last 100 system metrics
        applicationMetrics: this.applicationMetrics.slice(-100), // Last 100 app metrics
        healthChecks: Array.from(this.healthChecks.values()),
        alerts: Array.from(this.alerts.values()).slice(-50) // Last 50 alerts
      };
      
      await fs.writeFile(metricsFile, JSON.stringify(data, null, 2));
      console.log(`📊 Metrics saved to ${metricsFile}`);
    } catch (error) {
      console.error('❌ Failed to rotate metrics logs:', error);
    }
  }

  // Alert Management
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.emit('alert-resolved', alert);
      return true;
    }
    return false;
  }

  getAlerts(includeResolved = false): Alert[] {
    const alerts = Array.from(this.alerts.values());
    return includeResolved ? alerts : alerts.filter(a => !a.resolved);
  }

  // System Control
  async stop(): Promise<void> {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }
    
    await this.rotateMetricsLogs();
    console.log('🛑 Monitoring System stopped');
  }

  // Utility Methods
  getUptime(): number {
    return Date.now() - this.startTime.getTime();
  }

  getSystemHealth(): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
    const healthChecks = Array.from(this.healthChecks.values());
    const criticalCount = healthChecks.filter(h => h.status === 'CRITICAL').length;
    const warningCount = healthChecks.filter(h => h.status === 'WARNING').length;
    
    if (criticalCount > 0) return 'CRITICAL';
    if (warningCount > 0) return 'WARNING';
    return 'HEALTHY';
  }
}

// Default monitoring configuration
export const defaultMonitoringConfig: MonitoringConfig = {
  enabled: true,
  metricsInterval: 10000, // 10 seconds
  alerting: true,
  dashboard: true,
  logRetention: 30, // 30 days
  thresholds: {
    cpu: 80, // 80%
    memory: 85, // 85%
    disk: 90, // 90%
    responseTime: 2000, // 2 seconds
    errorRate: 5 // 5%
  },
  alerts: {
    email: [],
    webhook: [],
    slack: []
  }
}; 