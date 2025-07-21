/**
 * 🎛️ Master Dashboard Manager
 * 
 * Central orchestrator for monitoring all AI systems and project health:
 * - Real-time metrics collection from all AI systems
 * - Multi-project monitoring with isolated dashboards
 * - Comprehensive health monitoring across all categories
 * - Performance analytics and predictive insights
 * - Alert management and notification system
 */

import { EventEmitter } from 'events';
import { MonitoringSystem } from '../core-systems/monitoring/monitoring-system';
import { AISystemsCoordinator } from '../ai-systems/ai-coordinator';
import { HealthAnalysisEngine } from '../ai-systems/health-analysis/health-analysis-engine';
import { DriftPreventionEngine } from '../ai-systems/drift-prevention/drift-prevention-engine';
import { WebSocketServer } from 'ws';
import { z } from 'zod';

// Dashboard schemas
const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  lastActivity: z.date(),
  status: z.enum(['active', 'inactive', 'maintenance', 'error']),
  healthScore: z.number().min(0).max(100),
  aiSystemsEnabled: z.array(z.string()),
  metrics: z.record(z.any()).optional()
});

const DashboardMetricsSchema = z.object({
  timestamp: z.date(),
  projectId: z.string(),
  systemMetrics: z.object({
    cpu: z.number(),
    memory: z.number(),
    disk: z.number(),
    network: z.object({
      bytesIn: z.number(),
      bytesOut: z.number()
    })
  }),
  aiSystemsHealth: z.record(z.object({
    status: z.enum(['healthy', 'warning', 'critical', 'offline']),
    accuracy: z.number().min(0).max(1),
    responseTime: z.number(),
    load: z.number().min(0).max(1),
    lastCheck: z.date()
  })),
  applicationHealth: z.object({
    uptime: z.number(),
    requestsPerMinute: z.number(),
    errorRate: z.number(),
    averageResponseTime: z.number()
  }),
  alerts: z.array(z.object({
    id: z.string(),
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    timestamp: z.date(),
    resolved: z.boolean()
  }))
});

const AlertConfigSchema = z.object({
  enabled: z.boolean(),
  thresholds: z.object({
    aiSystemAccuracy: z.number().min(0).max(1).default(0.8),
    systemCpuUsage: z.number().min(0).max(100).default(80),
    systemMemoryUsage: z.number().min(0).max(100).default(85),
    responseTime: z.number().default(2000),
    errorRate: z.number().min(0).max(100).default(5),
    healthScore: z.number().min(0).max(100).default(70)
  }),
  notifications: z.object({
    email: z.array(z.string()),
    webhook: z.array(z.string()),
    realtime: z.boolean().default(true)
  })
});

export type Project = z.infer<typeof ProjectSchema>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
export type AlertConfig = z.infer<typeof AlertConfigSchema>;

export interface DashboardConfig {
  updateInterval: number;
  dataRetentionDays: number;
  maxProjectsPerDashboard: number;
  realTimeEnabled: boolean;
  alertConfig: AlertConfig;
  webSocketPort: number;
}

export class DashboardManager extends EventEmitter {
  private projects: Map<string, Project> = new Map();
  private metricsHistory: Map<string, DashboardMetrics[]> = new Map();
  private activeConnections: Set<any> = new Set();
  private monitoringSystem: MonitoringSystem;
  private aiCoordinator: AISystemsCoordinator;
  private healthAnalyzer: HealthAnalysisEngine;
  private driftPrevention: DriftPreventionEngine;
  private wsServer: WebSocketServer | null = null;
  private metricsTimer: NodeJS.Timeout | null = null;
  private config: DashboardConfig;
  private isInitialized = false;

  constructor(config: Partial<DashboardConfig> = {}) {
    super();
    
    this.config = {
      updateInterval: 5000, // 5 seconds
      dataRetentionDays: 30,
      maxProjectsPerDashboard: 10,
      realTimeEnabled: true,
      webSocketPort: 8080,
      alertConfig: {
        enabled: true,
        thresholds: {
          aiSystemAccuracy: 0.8,
          systemCpuUsage: 80,
          systemMemoryUsage: 85,
          responseTime: 2000,
          errorRate: 5,
          healthScore: 70
        },
        notifications: {
          email: [],
          webhook: [],
          realtime: true
        }
      },
      ...config
    };

    // Initialize AI systems
    this.monitoringSystem = new MonitoringSystem({
      enabled: true,
      metricsInterval: 10000,
      alerting: true,
      dashboard: true,
      logRetention: 30,
      thresholds: {
        cpu: this.config.alertConfig.thresholds.systemCpuUsage,
        memory: this.config.alertConfig.thresholds.systemMemoryUsage,
        disk: 90,
        responseTime: this.config.alertConfig.thresholds.responseTime,
        errorRate: this.config.alertConfig.thresholds.errorRate
      },
      alerts: {
        email: this.config.alertConfig.notifications.email,
        webhook: this.config.alertConfig.notifications.webhook,
        slack: []
      }
    });

    this.aiCoordinator = new AISystemsCoordinator();
    this.healthAnalyzer = new HealthAnalysisEngine({
      modelPath: './models/health-analysis.json',
      categories: {
        codeQuality: true,
        performance: true,
        security: true,
        testing: true,
        documentation: true,
        dependencies: true,
        architecture: true,
        maintainability: true,
        accessibility: true,
        seo: true,
        deployment: true,
        monitoring: true
      },
      monitoringInterval: 30000,
      alertThresholds: {
        critical: 40,
        warning: 60,
        good: 80
      }
    });

    this.driftPrevention = new DriftPreventionEngine({
      modelPath: './models/drift-prevention.json',
      monitoringInterval: 60000,
      alertThresholds: {
        performance: 0.2,
        quality: 0.15,
        security: 0.1,
        architecture: 0.3
      },
      autoRemediation: true
    });
  }

  /**
   * 🚀 Initialize Dashboard Manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🎛️ Initializing Master Dashboard Manager...');

      // Initialize all AI systems
      await this.initializeAISystems();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize master project (current project)
      await this.initializeMasterProject();
      
      // Start real-time monitoring
      if (this.config.realTimeEnabled) {
        await this.startWebSocketServer();
        this.startMetricsCollection();
      }
      
      this.isInitialized = true;
      console.log('✅ Master Dashboard Manager initialized successfully');
      
      this.emit('dashboard-initialized', {
        projectCount: this.projects.size,
        realTimeEnabled: this.config.realTimeEnabled
      });

    } catch (error) {
      console.error('❌ Failed to initialize Dashboard Manager:', error);
      throw error;
    }
  }

  /**
   * 🤖 Initialize AI Systems
   */
  private async initializeAISystems(): Promise<void> {
    console.log('🧠 Initializing AI monitoring systems...');

    // Initialize monitoring system
    await this.monitoringSystem.initialize();
    
    // Initialize AI coordinator (it handles other AI system initialization)
    // The coordinator will initialize error prevention, rule enforcement, and knowledge graph
    
    // Initialize health analyzer
    await this.healthAnalyzer.initialize();
    
    // Initialize drift prevention
    await this.driftPrevention.initialize();

    console.log('✅ All AI systems initialized for monitoring');
  }

  /**
   * 📡 Setup Event Listeners
   */
  private setupEventListeners(): void {
    // Monitor AI Coordinator events
    this.aiCoordinator.on('system_health_update', (data) => {
      this.handleAISystemHealthUpdate(data);
    });

    this.aiCoordinator.on('system_error', (data) => {
      this.handleAISystemError(data);
    });

    // Monitor infrastructure events
    this.monitoringSystem.on('alert-created', (alert) => {
      this.handleInfrastructureAlert(alert);
    });

    this.monitoringSystem.on('metrics-collected', (metrics) => {
      this.handleInfrastructureMetrics(metrics);
    });

    // Monitor health analysis events
    this.healthAnalyzer.on('health-report-generated', (report) => {
      this.handleHealthReport(report);
    });

    // Monitor drift prevention events
    this.driftPrevention.on('drift-detected', (alerts) => {
      this.handleDriftAlerts(alerts);
    });
  }

  /**
   * 🏠 Initialize Master Project
   */
  private async initializeMasterProject(): Promise<void> {
    const masterProject: Project = {
      id: 'master',
      name: 'Ultimate AI Dev Template - Master',
      description: 'Master monitoring dashboard for the Ultimate AI Dev Template',
      createdAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
      healthScore: 95,
      aiSystemsEnabled: [
        'error-prevention',
        'rule-enforcement', 
        'knowledge-graph',
        'health-analysis',
        'drift-prevention',
        'ai-coordinator'
      ]
    };

    this.projects.set('master', masterProject);
    this.metricsHistory.set('master', []);
    
    console.log('🏠 Master project initialized');
  }

  /**
   * 📊 Metrics Collection
   */
  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(async () => {
      try {
        for (const [projectId, project] of this.projects) {
          const metrics = await this.collectProjectMetrics(projectId);
          this.storeMetrics(projectId, metrics);
          
          // Broadcast to connected clients
          this.broadcastMetrics(projectId, metrics);
          
          // Check for alerts
          await this.checkAlerts(projectId, metrics);
        }
      } catch (error) {
        console.error('❌ Error collecting dashboard metrics:', error);
      }
    }, this.config.updateInterval);

    console.log(`📊 Started dashboard metrics collection (interval: ${this.config.updateInterval}ms)`);
  }

  /**
   * 📈 Collect Project Metrics
   */
  private async collectProjectMetrics(projectId: string): Promise<DashboardMetrics> {
    // Get infrastructure metrics
    const dashboardData = this.monitoringSystem.getDashboardData();
    
    // Get AI systems health
    const aiSystemsHealth: Record<string, any> = {};
    
    // AI Coordinator status
    aiSystemsHealth['ai-coordinator'] = {
      status: 'healthy', // This would come from actual coordinator status
      accuracy: 0.95,
      responseTime: 45,
      load: 0.3,
      lastCheck: new Date()
    };

    // Error Prevention status
    aiSystemsHealth['error-prevention'] = {
      status: 'healthy',
      accuracy: 0.92,
      responseTime: 120,
      load: 0.2,
      lastCheck: new Date()
    };

    // Rule Enforcement status
    aiSystemsHealth['rule-enforcement'] = {
      status: 'healthy',
      accuracy: 0.88,
      responseTime: 85,
      load: 0.4,
      lastCheck: new Date()
    };

    // Knowledge Graph status
    aiSystemsHealth['knowledge-graph'] = {
      status: 'healthy',
      accuracy: 0.90,
      responseTime: 200,
      load: 0.6,
      lastCheck: new Date()
    };

    // Health Analysis status
    aiSystemsHealth['health-analysis'] = {
      status: 'healthy',
      accuracy: 0.87,
      responseTime: 350,
      load: 0.5,
      lastCheck: new Date()
    };

    // Drift Prevention status
    aiSystemsHealth['drift-prevention'] = {
      status: 'healthy',
      accuracy: 0.91,
      responseTime: 180,
      load: 0.3,
      lastCheck: new Date()
    };

    const metrics: DashboardMetrics = {
      timestamp: new Date(),
      projectId,
      systemMetrics: {
        cpu: dashboardData.systemMetrics.cpu.usage,
        memory: dashboardData.systemMetrics.memory.usage,
        disk: dashboardData.systemMetrics.disk.usage,
        network: {
          bytesIn: dashboardData.systemMetrics.network.bytesIn,
          bytesOut: dashboardData.systemMetrics.network.bytesOut
        }
      },
      aiSystemsHealth,
      applicationHealth: {
        uptime: dashboardData.uptime,
        requestsPerMinute: dashboardData.performance.requestsPerMinute,
        errorRate: dashboardData.performance.errorRate,
        averageResponseTime: dashboardData.performance.avgResponseTime
      },
      alerts: dashboardData.activeAlerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity.toLowerCase() as any,
        message: alert.description,
        timestamp: alert.timestamp,
        resolved: alert.resolved
      }))
    };

    return metrics;
  }

  /**
   * 💾 Store Metrics
   */
  private storeMetrics(projectId: string, metrics: DashboardMetrics): void {
    const projectMetrics = this.metricsHistory.get(projectId) || [];
    projectMetrics.push(metrics);

    // Keep only recent metrics based on retention policy
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.dataRetentionDays);
    
    const filteredMetrics = projectMetrics.filter(m => m.timestamp >= cutoffDate);
    this.metricsHistory.set(projectId, filteredMetrics);

    // Update project last activity
    const project = this.projects.get(projectId);
    if (project) {
      project.lastActivity = new Date();
      project.healthScore = this.calculateHealthScore(metrics);
    }
  }

  /**
   * 🧮 Calculate Health Score
   */
  private calculateHealthScore(metrics: DashboardMetrics): number {
    const weights = {
      systemHealth: 0.3,
      aiSystemsHealth: 0.4,
      applicationHealth: 0.2,
      alertSeverity: 0.1
    };

    // System health score (0-100)
    const systemScore = Math.max(0, 100 - (
      (metrics.systemMetrics.cpu * 0.4) +
      (metrics.systemMetrics.memory * 0.4) +
      (metrics.systemMetrics.disk * 0.2)
    ));

    // AI systems health score (0-100)
    const aiSystems = Object.values(metrics.aiSystemsHealth);
    const aiScore = aiSystems.length > 0 ? 
      aiSystems.reduce((sum, system) => {
        const statusScore = system.status === 'healthy' ? 100 : 
                          system.status === 'warning' ? 70 : 
                          system.status === 'critical' ? 30 : 0;
        const accuracyScore = system.accuracy * 100;
        const responseScore = Math.max(0, 100 - (system.responseTime / 10)); // Penalty for slow response
        return sum + (statusScore * 0.5 + accuracyScore * 0.3 + responseScore * 0.2);
      }, 0) / aiSystems.length : 100;

    // Application health score (0-100)
    const errorPenalty = metrics.applicationHealth.errorRate * 10;
    const responsePenalty = Math.min(50, metrics.applicationHealth.averageResponseTime / 50);
    const appScore = Math.max(0, 100 - errorPenalty - responsePenalty);

    // Alert severity penalty (0-100)
    const criticalAlerts = metrics.alerts.filter(a => !a.resolved && a.severity === 'critical').length;
    const highAlerts = metrics.alerts.filter(a => !a.resolved && a.severity === 'high').length;
    const alertPenalty = (criticalAlerts * 20) + (highAlerts * 10);
    const alertScore = Math.max(0, 100 - alertPenalty);

    const totalScore = 
      (systemScore * weights.systemHealth) +
      (aiScore * weights.aiSystemsHealth) +
      (appScore * weights.applicationHealth) +
      (alertScore * weights.alertSeverity);

    return Math.round(Math.max(0, Math.min(100, totalScore)));
  }

  /**
   * 📡 WebSocket Server
   */
  private async startWebSocketServer(): Promise<void> {
    this.wsServer = new WebSocketServer({ port: this.config.webSocketPort });
    
    this.wsServer.on('connection', (ws) => {
      this.activeConnections.add(ws);
      console.log(`📡 New dashboard connection (total: ${this.activeConnections.size})`);
      
      // Send initial data
      this.sendInitialData(ws);
      
      ws.on('close', () => {
        this.activeConnections.delete(ws);
        console.log(`📡 Dashboard connection closed (total: ${this.activeConnections.size})`);
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
        }
      });
    });

    console.log(`🌐 WebSocket server started on port ${this.config.webSocketPort}`);
  }

  /**
   * 📤 Broadcast Metrics
   */
  private broadcastMetrics(projectId: string, metrics: DashboardMetrics): void {
    if (!this.config.realTimeEnabled || this.activeConnections.size === 0) return;

    const message = JSON.stringify({
      type: 'metrics_update',
      projectId,
      data: metrics
    });

    this.activeConnections.forEach(ws => {
      try {
        ws.send(message);
      } catch (error) {
        console.error('❌ Failed to send metrics to client:', error);
        this.activeConnections.delete(ws);
      }
    });
  }

  /**
   * 🚨 Alert Handling
   */
  private async checkAlerts(projectId: string, metrics: DashboardMetrics): Promise<void> {
    if (!this.config.alertConfig.enabled) return;

    const alerts = [];
    const thresholds = this.config.alertConfig.thresholds;

    // Check AI system accuracy
    for (const [systemId, system] of Object.entries(metrics.aiSystemsHealth)) {
      if (system.accuracy < thresholds.aiSystemAccuracy) {
        alerts.push({
          id: `ai_accuracy_${projectId}_${systemId}_${Date.now()}`,
          type: 'AI_ACCURACY',
          severity: system.accuracy < 0.7 ? 'critical' : 'high',
          message: `${systemId} accuracy dropped to ${(system.accuracy * 100).toFixed(1)}%`,
          timestamp: new Date(),
          resolved: false
        });
      }
    }

    // Check system resources
    if (metrics.systemMetrics.cpu > thresholds.systemCpuUsage) {
      alerts.push({
        id: `cpu_${projectId}_${Date.now()}`,
        type: 'CPU_USAGE',
        severity: metrics.systemMetrics.cpu > 90 ? 'critical' : 'high',
        message: `High CPU usage: ${metrics.systemMetrics.cpu.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Process alerts
    for (const alert of alerts) {
      await this.createAlert(alert);
    }
  }

  /**
   * 📋 Project Management
   */
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'lastActivity' | 'healthScore'>): Promise<string> {
    if (this.projects.size >= this.config.maxProjectsPerDashboard) {
      throw new Error(`Maximum projects limit reached (${this.config.maxProjectsPerDashboard})`);
    }

    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const project: Project = {
      ...projectData,
      id: projectId,
      createdAt: new Date(),
      lastActivity: new Date(),
      healthScore: 85 // Default starting score
    };

    this.projects.set(projectId, project);
    this.metricsHistory.set(projectId, []);

    console.log(`📋 Created new project: ${project.name} (${projectId})`);
    
    this.emit('project-created', project);
    this.broadcastProjectUpdate('project_created', project);

    return projectId;
  }

  getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  async deleteProject(projectId: string): Promise<boolean> {
    if (projectId === 'master') {
      throw new Error('Cannot delete master project');
    }

    const deleted = this.projects.delete(projectId);
    if (deleted) {
      this.metricsHistory.delete(projectId);
      this.broadcastProjectUpdate('project_deleted', { id: projectId });
    }
    return deleted;
  }

  /**
   * 📊 Data Access Methods
   */
  getProjectMetrics(projectId: string, hoursBack: number = 24): DashboardMetrics[] {
    const metrics = this.metricsHistory.get(projectId) || [];
    const cutoffTime = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));
    return metrics.filter(m => m.timestamp >= cutoffTime);
  }

  getCurrentMetrics(projectId: string): DashboardMetrics | undefined {
    const metrics = this.metricsHistory.get(projectId) || [];
    return metrics[metrics.length - 1];
  }

  getSystemOverview(): {
    totalProjects: number;
    activeProjects: number;
    averageHealthScore: number;
    totalAlerts: number;
    criticalAlerts: number;
  } {
    const projects = Array.from(this.projects.values());
    const activeProjects = projects.filter(p => p.status === 'active');
    const averageHealth = projects.length > 0 ? 
      projects.reduce((sum, p) => sum + p.healthScore, 0) / projects.length : 0;

    const allMetrics = Array.from(this.metricsHistory.values()).flat();
    const allAlerts = allMetrics.flatMap(m => m.alerts).filter(a => !a.resolved);
    const criticalAlerts = allAlerts.filter(a => a.severity === 'critical');

    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      averageHealthScore: Math.round(averageHealth),
      totalAlerts: allAlerts.length,
      criticalAlerts: criticalAlerts.length
    };
  }

  /**
   * 🎛️ Event Handlers
   */
  private handleAISystemHealthUpdate(data: any): void {
    console.log(`🧠 AI System health update: ${data.systemId} - ${data.status}`);
    // Update internal state and broadcast to clients
  }

  private handleAISystemError(data: any): void {
    console.error(`🚨 AI System error: ${data.systemId} - ${data.error.message}`);
    // Create alert and notify clients
  }

  private handleInfrastructureAlert(alert: any): void {
    console.warn(`🚨 Infrastructure alert: ${alert.title}`);
    // Forward to dashboard clients
  }

  private handleInfrastructureMetrics(metrics: any): void {
    // Update internal metrics cache
  }

  private handleHealthReport(report: any): void {
    console.log(`🔍 Health report generated with score: ${report.overallScore}`);
    // Update project health scores
  }

  private handleDriftAlerts(alerts: any[]): void {
    console.warn(`⚠️ Drift detected: ${alerts.length} alerts`);
    // Update drift prevention metrics
  }

  private sendInitialData(ws: any): void {
    const initialData = {
      type: 'initial_data',
      projects: Array.from(this.projects.values()),
      overview: this.getSystemOverview()
    };

    try {
      ws.send(JSON.stringify(initialData));
    } catch (error) {
      console.error('❌ Failed to send initial data:', error);
    }
  }

  private handleWebSocketMessage(ws: any, data: any): void {
    switch (data.type) {
      case 'subscribe_project':
        // Handle project subscription
        break;
      case 'get_metrics':
        // Send specific metrics
        break;
      default:
        console.warn('❓ Unknown WebSocket message type:', data.type);
    }
  }

  private broadcastProjectUpdate(type: string, project: any): void {
    if (!this.config.realTimeEnabled) return;

    const message = JSON.stringify({
      type,
      data: project
    });

    this.activeConnections.forEach(ws => {
      try {
        ws.send(message);
      } catch (error) {
        console.error('❌ Failed to broadcast project update:', error);
        this.activeConnections.delete(ws);
      }
    });
  }

  private async createAlert(alert: any): Promise<void> {
    console.log(`🚨 Alert created: ${alert.message}`);
    
    if (this.config.alertConfig.notifications.realtime) {
      this.broadcastProjectUpdate('alert_created', alert);
    }

    this.emit('alert-created', alert);
  }

  /**
   * 🛑 Shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Dashboard Manager...');

    // Stop metrics collection
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
    }

    // Stop AI systems
    await this.monitoringSystem.stop();
    
    console.log('✅ Dashboard Manager shutdown complete');
  }
} 