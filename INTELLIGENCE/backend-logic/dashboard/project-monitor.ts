/**
 * Project Monitor
 * Real-time monitoring of project health and metrics
 */

import { EventEmitter } from 'events';
import { Firestore } from '@google-cloud/firestore';

export interface ProjectHealth {
  projectId: string;
  status: 'healthy' | 'warning' | 'critical';
  score: number; // 0-100
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  alerts: Alert[];
  lastChecked: Date;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface RealTimeData {
  timestamp: Date;
  projects: {
    [projectId: string]: {
      cpu: number;
      memory: number;
      requests: number;
      errors: number;
      latency: number;
    };
  };
  system: {
    totalCpu: number;
    totalMemory: number;
    totalRequests: number;
    activeProjects: number;
  };
}

export class ProjectMonitor extends EventEmitter {
  private firestore: Firestore;
  private monitoringInterval: NodeJS.Timer | null = null;
  private healthCheckInterval: NodeJS.Timer | null = null;
  private projectHealthCache: Map<string, ProjectHealth> = new Map();
  
  constructor() {
    super();
    this.firestore = new Firestore();
  }
  
  /**
   * Starts monitoring all projects
   */
  startMonitoring(callback: (data: any) => void): void {
    console.log('🔍 Starting project monitoring...');
    
    // Real-time metrics monitoring (every 5 seconds)
    this.monitoringInterval = setInterval(async () => {
      const data = await this.collectRealTimeMetrics();
      callback({
        type: 'metrics',
        data
      });
    }, 5000);
    
    // Health check monitoring (every 30 seconds)
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.performHealthChecks();
      callback({
        type: 'health',
        data: health
      });
    }, 30000);
    
    // Initial data collection
    this.collectRealTimeMetrics().then(data => {
      callback({
        type: 'metrics',
        data
      });
    });
    
    this.performHealthChecks().then(health => {
      callback({
        type: 'health',
        data: health
      });
    });
  }
  
  /**
   * Stops monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    console.log('🛑 Monitoring stopped');
  }
  
  /**
   * Gets project health information
   */
  async getProjectHealth(projectId: string): Promise<ProjectHealth> {
    // Check cache first
    if (this.projectHealthCache.has(projectId)) {
      const cached = this.projectHealthCache.get(projectId)!;
      const cacheAge = Date.now() - cached.lastChecked.getTime();
      
      // Return cached if less than 1 minute old
      if (cacheAge < 60000) {
        return cached;
      }
    }
    
    // Perform health check
    const health = await this.checkProjectHealth(projectId);
    this.projectHealthCache.set(projectId, health);
    
    return health;
  }
  
  /**
   * Gets real-time monitoring data
   */
  async getRealTimeData(): Promise<RealTimeData> {
    return await this.collectRealTimeMetrics();
  }
  
  /**
   * Collects real-time metrics from all projects
   */
  private async collectRealTimeMetrics(): Promise<RealTimeData> {
    const projectsRef = this.firestore.collection('projects');
    const snapshot = await projectsRef.where('status', '==', 'active').get();
    
    const projects: RealTimeData['projects'] = {};
    let totalCpu = 0;
    let totalMemory = 0;
    let totalRequests = 0;
    
    for (const doc of snapshot.docs) {
      const projectId = doc.id;
      const metrics = await this.getProjectMetrics(projectId);
      
      projects[projectId] = {
        cpu: metrics.cpu,
        memory: metrics.memory,
        requests: metrics.requests,
        errors: metrics.errors,
        latency: metrics.latency
      };
      
      totalCpu += metrics.cpu;
      totalMemory += metrics.memory;
      totalRequests += metrics.requests;
    }
    
    return {
      timestamp: new Date(),
      projects,
      system: {
        totalCpu: totalCpu / snapshot.size,
        totalMemory: totalMemory / snapshot.size,
        totalRequests,
        activeProjects: snapshot.size
      }
    };
  }
  
  /**
   * Performs health checks on all projects
   */
  private async performHealthChecks(): Promise<ProjectHealth[]> {
    const projectsRef = this.firestore.collection('projects');
    const snapshot = await projectsRef.get();
    
    const healthChecks: ProjectHealth[] = [];
    
    for (const doc of snapshot.docs) {
      const health = await this.checkProjectHealth(doc.id);
      healthChecks.push(health);
      this.projectHealthCache.set(doc.id, health);
      
      // Emit alerts if critical
      if (health.status === 'critical') {
        this.emit('alert', {
          projectId: doc.id,
          health
        });
      }
    }
    
    return healthChecks;
  }
  
  /**
   * Checks health of a specific project
   */
  private async checkProjectHealth(projectId: string): Promise<ProjectHealth> {
    const metrics = await this.getProjectHealthMetrics(projectId);
    const alerts = await this.getProjectAlerts(projectId);
    
    // Calculate health score
    let score = 100;
    
    // Deduct for high error rate
    if (metrics.errorRate > 5) {
      score -= 20;
    } else if (metrics.errorRate > 1) {
      score -= 10;
    }
    
    // Deduct for slow response time
    if (metrics.responseTime > 1000) {
      score -= 15;
    } else if (metrics.responseTime > 500) {
      score -= 5;
    }
    
    // Deduct for low uptime
    if (metrics.uptime < 95) {
      score -= 25;
    } else if (metrics.uptime < 99) {
      score -= 10;
    }
    
    // Deduct for unresolved alerts
    const unresolvedAlerts = alerts.filter(a => !a.resolved);
    score -= unresolvedAlerts.length * 5;
    
    // Determine status
    let status: ProjectHealth['status'] = 'healthy';
    if (score < 50) {
      status = 'critical';
    } else if (score < 80) {
      status = 'warning';
    }
    
    return {
      projectId,
      status,
      score: Math.max(0, Math.min(100, score)),
      metrics,
      alerts,
      lastChecked: new Date()
    };
  }
  
  /**
   * Gets project metrics for monitoring
   */
  private async getProjectMetrics(projectId: string): Promise<any> {
    // In real implementation, this would fetch from monitoring service
    return {
      cpu: 20 + Math.random() * 60,
      memory: 30 + Math.random() * 50,
      requests: Math.floor(Math.random() * 1000),
      errors: Math.floor(Math.random() * 10),
      latency: 50 + Math.random() * 450
    };
  }
  
  /**
   * Gets project health metrics
   */
  private async getProjectHealthMetrics(projectId: string): Promise<any> {
    // In real implementation, this would fetch from monitoring service
    return {
      uptime: 95 + Math.random() * 5,
      responseTime: 100 + Math.random() * 900,
      errorRate: Math.random() * 10,
      throughput: 100 + Math.random() * 900
    };
  }
  
  /**
   * Gets project alerts
   */
  private async getProjectAlerts(projectId: string): Promise<Alert[]> {
    try {
      const alertsRef = this.firestore
        .collection('projects')
        .doc(projectId)
        .collection('alerts')
        .orderBy('timestamp', 'desc')
        .limit(10);
      
      const snapshot = await alertsRef.get();
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'info',
          severity: data.severity || 'low',
          message: data.message,
          timestamp: data.timestamp?.toDate() || new Date(),
          resolved: data.resolved || false
        };
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }
  
  /**
   * Creates a new alert
   */
  async createAlert(projectId: string, alert: Omit<Alert, 'id' | 'timestamp'>): Promise<void> {
    try {
      await this.firestore
        .collection('projects')
        .doc(projectId)
        .collection('alerts')
        .add({
          ...alert,
          timestamp: new Date(),
          resolved: false
        });
      
      // Emit alert event
      this.emit('alert:new', {
        projectId,
        alert
      });
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }
  
  /**
   * Resolves an alert
   */
  async resolveAlert(projectId: string, alertId: string): Promise<void> {
    try {
      await this.firestore
        .collection('projects')
        .doc(projectId)
        .collection('alerts')
        .doc(alertId)
        .update({
          resolved: true,
          resolvedAt: new Date()
        });
      
      // Emit resolved event
      this.emit('alert:resolved', {
        projectId,
        alertId
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  }
  
  /**
   * Gets monitoring history for a project
   */
  async getMonitoringHistory(projectId: string, hours: number = 24): Promise<any> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
    
    try {
      const historyRef = this.firestore
        .collection('projects')
        .doc(projectId)
        .collection('monitoring')
        .where('timestamp', '>=', startTime)
        .where('timestamp', '<=', endTime)
        .orderBy('timestamp', 'asc');
      
      const snapshot = await historyRef.get();
      
      return snapshot.docs.map(doc => ({
        timestamp: doc.data().timestamp?.toDate(),
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching monitoring history:', error);
      return [];
    }
  }
} 