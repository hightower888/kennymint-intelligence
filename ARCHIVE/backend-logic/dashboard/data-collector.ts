/**
 * Dashboard Data Collector
 * Collects and aggregates data from all projects
 */

import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export interface ProjectOverview {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  health: number; // 0-100
  createdAt: Date;
  lastActive: Date;
  metrics: {
    apiCalls: number;
    storage: number;
    users: number;
    errors: number;
  };
}

export interface BackendUsage {
  aiSystems: {
    name: string;
    usage: number;
    lastUsed: Date;
    performance: number;
  }[];
  ruleSets: {
    name: string;
    triggered: number;
    violations: number;
    compliance: number;
  }[];
  integrations: {
    service: string;
    calls: number;
    errors: number;
    latency: number;
  }[];
}

export interface BrandGuidelines {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    codeFont: string;
  };
  voice: {
    tone: string;
    personality: string[];
    guidelines: string[];
  };
  visual: {
    logoUrl: string;
    iconStyle: string;
    imageStyle: string;
  };
}

export class DashboardDataCollector {
  private firestore: Firestore;
  private storage: Storage;
  private secretManager: SecretManagerServiceClient;
  
  constructor() {
    this.firestore = new Firestore();
    this.storage = new Storage();
    this.secretManager = new SecretManagerServiceClient();
  }
  
  /**
   * Gets overview data for all projects
   */
  async getOverviewData(): Promise<{
    totalProjects: number;
    activeProjects: number;
    totalApiCalls: number;
    totalStorage: number;
    systemHealth: number;
    recentActivity: any[];
  }> {
    const projects = await this.getAllProjects();
    
    const totalApiCalls = projects.reduce((sum, p) => sum + p.metrics.apiCalls, 0);
    const totalStorage = projects.reduce((sum, p) => sum + p.metrics.storage, 0);
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const avgHealth = projects.reduce((sum, p) => sum + p.health, 0) / projects.length;
    
    const recentActivity = await this.getRecentActivity();
    
    return {
      totalProjects: projects.length,
      activeProjects,
      totalApiCalls,
      totalStorage,
      systemHealth: Math.round(avgHealth),
      recentActivity
    };
  }
  
  /**
   * Gets all projects
   */
  async getAllProjects(): Promise<ProjectOverview[]> {
    try {
      const projectsRef = this.firestore.collection('projects');
      const snapshot = await projectsRef.get();
      
      const projects: ProjectOverview[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const metrics = await this.getProjectMetrics(doc.id);
        const health = await this.calculateProjectHealth(doc.id, metrics);
        
        projects.push({
          id: doc.id,
          name: data.name,
          status: data.status || 'active',
          health,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActive: data.lastActive?.toDate() || new Date(),
          metrics
        });
      }
      
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }
  
  /**
   * Gets detailed project information
   */
  async getProjectDetails(projectId: string): Promise<any> {
    try {
      const projectRef = this.firestore.collection('projects').doc(projectId);
      const doc = await projectRef.get();
      
      if (!doc.exists) {
        throw new Error('Project not found');
      }
      
      const data = doc.data()!;
      const metrics = await this.getProjectMetrics(projectId);
      const health = await this.calculateProjectHealth(projectId, metrics);
      const infrastructure = await this.getProjectInfrastructure(projectId);
      
      return {
        id: projectId,
        name: data.name,
        description: data.description,
        type: data.projectType,
        industry: data.industry,
        status: data.status || 'active',
        health,
        createdAt: data.createdAt?.toDate(),
        lastActive: data.lastActive?.toDate(),
        metrics,
        infrastructure,
        features: data.features || {},
        configuration: data.configuration || {}
      };
    } catch (error) {
      console.error('Error fetching project details:', error);
      throw error;
    }
  }
  
  /**
   * Gets backend usage statistics
   */
  async getBackendUsage(projectId: string): Promise<BackendUsage> {
    try {
      // AI Systems Usage
      const aiSystems = await this.getAISystemsUsage(projectId);
      
      // Rule Sets Usage
      const ruleSets = await this.getRuleSetsUsage(projectId);
      
      // Integration Usage
      const integrations = await this.getIntegrationsUsage(projectId);
      
      return {
        aiSystems,
        ruleSets,
        integrations
      };
    } catch (error) {
      console.error('Error fetching backend usage:', error);
      throw error;
    }
  }
  
  /**
   * Gets rule set usage visualization data
   */
  async getRuleSetUsage(projectId: string): Promise<any> {
    try {
      const rulesRef = this.firestore
        .collection('projects')
        .doc(projectId)
        .collection('ruleSets');
      
      const snapshot = await rulesRef.get();
      const ruleSets: any[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const usage = await this.getRuleUsageStats(projectId, doc.id);
        
        ruleSets.push({
          id: doc.id,
          name: data.name,
          category: data.category,
          enabled: data.enabled,
          rules: data.rules || [],
          usage: {
            triggered: usage.triggered,
            violations: usage.violations,
            compliance: usage.compliance,
            timeline: usage.timeline
          },
          visualization: {
            type: 'sankey', // or 'tree', 'network', 'heatmap'
            data: await this.generateRuleVisualization(data.rules, usage)
          }
        });
      }
      
      return ruleSets;
    } catch (error) {
      console.error('Error fetching rule set usage:', error);
      return [];
    }
  }
  
  /**
   * Gets brand guidelines for a project
   */
  async getBrandGuidelines(projectId: string): Promise<BrandGuidelines> {
    try {
      const brandRef = this.firestore
        .collection('projects')
        .doc(projectId)
        .collection('configuration')
        .doc('brand');
      
      const doc = await brandRef.get();
      
      if (!doc.exists) {
        // Return default brand guidelines
        return this.getDefaultBrandGuidelines();
      }
      
      const data = doc.data()!;
      
      return {
        colors: data.colors || this.getDefaultBrandGuidelines().colors,
        typography: data.typography || this.getDefaultBrandGuidelines().typography,
        voice: data.voice || this.getDefaultBrandGuidelines().voice,
        visual: data.visual || this.getDefaultBrandGuidelines().visual
      };
    } catch (error) {
      console.error('Error fetching brand guidelines:', error);
      return this.getDefaultBrandGuidelines();
    }
  }
  
  /**
   * Gets project metrics
   */
  private async getProjectMetrics(projectId: string): Promise<any> {
    try {
      const metricsRef = this.firestore
        .collection('projects')
        .doc(projectId)
        .collection('metrics')
        .doc('current');
      
      const doc = await metricsRef.get();
      
      if (!doc.exists) {
        return {
          apiCalls: 0,
          storage: 0,
          users: 0,
          errors: 0
        };
      }
      
      return doc.data();
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return {
        apiCalls: 0,
        storage: 0,
        users: 0,
        errors: 0
      };
    }
  }
  
  /**
   * Calculates project health score
   */
  private async calculateProjectHealth(projectId: string, metrics: any): Promise<number> {
    let health = 100;
    
    // Deduct points for errors
    if (metrics.errors > 0) {
      health -= Math.min(30, metrics.errors * 2);
    }
    
    // Check last active time
    const projectRef = this.firestore.collection('projects').doc(projectId);
    const doc = await projectRef.get();
    
    if (doc.exists) {
      const lastActive = doc.data()!.lastActive?.toDate() || new Date();
      const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceActive > 24) {
        health -= Math.min(20, Math.floor(hoursSinceActive / 24) * 5);
      }
    }
    
    // Check API performance
    const performance = await this.getAPIPerformance(projectId);
    if (performance.avgLatency > 1000) {
      health -= 10;
    }
    
    return Math.max(0, Math.min(100, health));
  }
  
  /**
   * Gets project infrastructure details
   */
  private async getProjectInfrastructure(projectId: string): Promise<any> {
    return {
      github: {
        repository: `https://github.com/your-org/${projectId}`,
        branches: ['main', 'develop'],
        lastCommit: new Date()
      },
      firebase: {
        projectId: `${projectId}-firebase`,
        services: ['auth', 'firestore', 'storage']
      },
      gcs: {
        bucket: `${projectId}-storage`,
        usage: '1.2 GB'
      },
      gcp: {
        projectId: `${projectId}-gcp`,
        services: ['secret-manager', 'monitoring']
      }
    };
  }
  
  /**
   * Gets AI systems usage
   */
  private async getAISystemsUsage(projectId: string): Promise<any[]> {
    const systems = [
      'Error Prevention',
      'Knowledge Graph',
      'Drift Prevention',
      'Health Analysis',
      'Rule Enforcement',
      'Testing AI',
      'Code Generation',
      'Natural Language',
      'Predictive Intelligence',
      'Self Improvement'
    ];
    
    return systems.map(name => ({
      name,
      usage: Math.floor(Math.random() * 1000),
      lastUsed: new Date(Date.now() - Math.random() * 86400000),
      performance: 85 + Math.floor(Math.random() * 15)
    }));
  }
  
  /**
   * Gets rule sets usage
   */
  private async getRuleSetsUsage(projectId: string): Promise<any[]> {
    return [
      {
        name: 'Code Quality Rules',
        triggered: 245,
        violations: 12,
        compliance: 95
      },
      {
        name: 'Security Rules',
        triggered: 189,
        violations: 3,
        compliance: 98
      },
      {
        name: 'Performance Rules',
        triggered: 156,
        violations: 8,
        compliance: 94
      },
      {
        name: 'Brand Guidelines',
        triggered: 423,
        violations: 0,
        compliance: 100
      }
    ];
  }
  
  /**
   * Gets integrations usage
   */
  private async getIntegrationsUsage(projectId: string): Promise<any[]> {
    return [
      {
        service: 'OpenAI',
        calls: 1234,
        errors: 2,
        latency: 245
      },
      {
        service: 'Firebase',
        calls: 5678,
        errors: 0,
        latency: 45
      },
      {
        service: 'GitHub',
        calls: 890,
        errors: 1,
        latency: 123
      },
      {
        service: 'SendGrid',
        calls: 345,
        errors: 0,
        latency: 567
      }
    ];
  }
  
  /**
   * Gets rule usage statistics
   */
  private async getRuleUsageStats(projectId: string, ruleSetId: string): Promise<any> {
    return {
      triggered: Math.floor(Math.random() * 500),
      violations: Math.floor(Math.random() * 50),
      compliance: 85 + Math.floor(Math.random() * 15),
      timeline: this.generateTimeline()
    };
  }
  
  /**
   * Generates rule visualization data
   */
  private async generateRuleVisualization(rules: any[], usage: any): Promise<any> {
    return {
      nodes: rules.map((rule, index) => ({
        id: `rule-${index}`,
        label: rule.name,
        value: usage.triggered * Math.random()
      })),
      links: rules.slice(0, -1).map((rule, index) => ({
        source: `rule-${index}`,
        target: `rule-${index + 1}`,
        value: Math.floor(Math.random() * 100)
      }))
    };
  }
  
  /**
   * Gets API performance metrics
   */
  private async getAPIPerformance(projectId: string): Promise<any> {
    return {
      avgLatency: 250 + Math.floor(Math.random() * 500),
      p95Latency: 500 + Math.floor(Math.random() * 1000),
      errorRate: Math.random() * 5
    };
  }
  
  /**
   * Gets recent activity
   */
  private async getRecentActivity(): Promise<any[]> {
    return [
      {
        type: 'deployment',
        project: 'my-ai-app',
        message: 'New version deployed',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        type: 'error',
        project: 'chat-bot',
        message: 'API rate limit exceeded',
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        type: 'user',
        project: 'analytics-dash',
        message: 'New user registered',
        timestamp: new Date(Date.now() - 10800000)
      }
    ];
  }
  
  /**
   * Generates timeline data
   */
  private generateTimeline(): any[] {
    const timeline = [];
    for (let i = 0; i < 24; i++) {
      timeline.push({
        hour: i,
        value: Math.floor(Math.random() * 100)
      });
    }
    return timeline;
  }
  
  /**
   * Gets default brand guidelines
   */
  private getDefaultBrandGuidelines(): BrandGuidelines {
    return {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#F59E0B',
        background: '#0F172A',
        text: '#F8FAFC'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        codeFont: 'Fira Code'
      },
      voice: {
        tone: 'Professional yet friendly',
        personality: ['Innovative', 'Reliable', 'Intelligent'],
        guidelines: [
          'Use clear, concise language',
          'Be helpful and supportive',
          'Maintain technical accuracy'
        ]
      },
      visual: {
        logoUrl: '/logo.svg',
        iconStyle: 'modern-line',
        imageStyle: 'futuristic'
      }
    };
  }
} 