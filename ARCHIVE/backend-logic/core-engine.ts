/**
 * 🚀 Core Backend Engine
 * 
 * Immutable rule set and logic processor that powers any project.
 * This engine never changes its fundamental operations - it reads
 * project-specific data and applies consistent rules and intelligence.
 * 
 * Architecture:
 * - Backend Engine (this): Immutable logic, rules, and AI systems
 * - Project Data: Mutable configurations, learning data, and context
 */

import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';

// Import all backend systems
import { AISystemsCoordinator } from './ai-systems/ai-coordinator';
import { SmartAssetIntegrationSystem } from './smart-asset-integration';
import { MasterSelfImprovementEngine } from './self-improving/master-self-improvement';

export interface ProjectConfig {
  projectName: string;
  projectPath: string;
  industry: string;
  targetAudience: string;
  purpose: string;
  brandMaturity: 'none' | 'emerging' | 'defined' | 'established';
  currentPhase: 'discovery' | 'development' | 'established' | 'maintenance';
}

export interface EngineConfig {
  enableAllSystems?: boolean;
  enableSelfImprovement?: boolean;
  enableAssetIntegration?: boolean;
  enableAdvancedFeatures?: boolean;
  debugMode?: boolean;
}

export class CoreBackendEngine extends EventEmitter {
  private aiCoordinator: AISystemsCoordinator;
  private assetSystem: SmartAssetIntegrationSystem;
  private selfImprovementEngine: MasterSelfImprovementEngine;
  private projectConfig: ProjectConfig | null = null;
  private isInitialized: boolean = false;
  private projectDataPath: string = '';

  constructor(engineConfig: EngineConfig = {}) {
    super();
    console.log('🚀 Initializing Core Backend Engine...');
    
    // Initialize all backend systems with default configurations
    this.aiCoordinator = new AISystemsCoordinator();
    this.assetSystem = new SmartAssetIntegrationSystem();
    this.selfImprovementEngine = new MasterSelfImprovementEngine();
    
    this.setupEngineEventHandlers();
    
    if (engineConfig.debugMode) {
      this.enableDebugMode();
    }
  }

  /**
   * 🎯 Initialize Engine with Project Data
   * Reads project-specific configurations and data stores
   */
  async initializeWithProject(projectPath: string): Promise<void> {
    this.projectDataPath = projectPath;
    
    // Load project configuration
    const projectConfigPath = path.join(projectPath, 'config', 'project-context.json');
    if (!fs.existsSync(projectConfigPath)) {
      throw new Error(`Project configuration not found at: ${projectConfigPath}`);
    }

    this.projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf-8'));
    
    // Initialize all systems with project data
    await this.initializeSystemsWithProjectData();
    
    this.isInitialized = true;
    console.log(`✅ Core Backend Engine initialized for project: ${this.projectConfig?.projectName}`);
    
    this.emit('engineInitialized', {
      projectName: this.projectConfig?.projectName,
      projectPath: this.projectDataPath,
      systemsCount: this.getSystemsCount()
    });
  }

  /**
   * 🔧 Initialize Backend Systems with Project Data
   */
  private async initializeSystemsWithProjectData(): Promise<void> {
    if (!this.projectConfig) {
      throw new Error('Project configuration not loaded');
    }

    // Initialize Asset System with project-specific paths and brand data
    const assetLibraryPath = path.join(this.projectDataPath, 'assets');
    const brandGuidelinesPath = path.join(this.projectDataPath, 'brand-guidelines');
    
    this.assetSystem = new SmartAssetIntegrationSystem({
      assetLibraryPath,
      brandGuidelinesPath,
      complianceThreshold: 0.8
    });

    await this.assetSystem.initialize({
      name: this.projectConfig.projectName,
      industry: this.projectConfig.industry,
      targetAudience: this.projectConfig.targetAudience,
      purpose: this.projectConfig.purpose,
      currentPhase: this.projectConfig.currentPhase,
      brandMaturity: this.projectConfig.brandMaturity
    });

    // Initialize Self-Improvement Engine with project learning data
    const learningDataPath = path.join(this.projectDataPath, 'learning-data');
    await this.selfImprovementEngine.initializeWithProjectData(learningDataPath);

    // Initialize AI Coordinator
    await this.aiCoordinator.initialize();
  }

  /**
   * 📊 Backend Engine Operations
   * These methods provide the core functionality that projects can use
   */

  /**
   * 🎨 Asset Operations
   */
  async requestAsset(request: {
    type: 'header' | 'icon' | 'infographic' | 'logo' | 'banner' | 'illustration' | 'background';
    purpose: string;
    context: string;
    specifications: {
      dimensions: { width: number; height: number };
      style?: string;
      text?: string;
      colorPreferences?: string[];
    };
    brandCompliance?: {
      enforceGuidelines?: boolean;
      allowEvolution?: boolean;
      requireReview?: boolean;
    };
  }) {
    this.ensureInitialized();
    return await this.assetSystem.requestAsset(request);
  }

  async searchAssets(query: {
    type?: string;
    purpose?: string;
    tags?: string[];
    brandCompliant?: boolean;
  }) {
    this.ensureInitialized();
    return await this.assetSystem.searchAssets(query);
  }

  /**
   * 🛡️ Brand Operations
   */
  async setBrandGuideline(
    category: 'colors' | 'typography' | 'logo' | 'imagery' | 'voice' | 'layout' | 'spacing' | 'iconography',
    rule: string,
    value: any,
    context?: string
  ) {
    this.ensureInitialized();
    return await this.assetSystem.setBrandGuideline(category, rule, value, context);
  }

  async correctBrand(
    correctionType: 'color' | 'typography' | 'spacing' | 'general',
    instruction: string,
    oldValue: any,
    newValue: any,
    context: string
  ) {
    this.ensureInitialized();
    return await this.assetSystem.correctBrand(correctionType, instruction, oldValue, newValue, context);
  }

  /**
   * 🧠 Self-Improvement Operations
   */
  async learnFromMistake(
    errorType: string,
    errorContext: any,
    resolution: any,
    impact: 'low' | 'medium' | 'high' | 'critical'
  ) {
    this.ensureInitialized();
    return await this.selfImprovementEngine.learnFromMistake(errorType, errorContext, resolution, impact);
  }

  async improveBasedOnOutcome(
    action: string,
    context: any,
    outcome: any,
    feedback: string
  ) {
    this.ensureInitialized();
    return await this.selfImprovementEngine.improveBasedOnOutcome(action, context, outcome, feedback);
  }

  /**
   * 🎯 AI Task Processing
   */
  async processAITask(task: {
    type: 'validation' | 'analysis' | 'prevention' | 'enforcement' | 'learning';
    priority: 'low' | 'medium' | 'high' | 'critical';
    payload: any;
    timeout?: number;
  }) {
    this.ensureInitialized();
    return await this.aiCoordinator.processTask({
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...task,
      requiredSystems: [],
      createdAt: new Date()
    });
  }

  /**
   * 📈 Analytics and Reporting
   */
  async generateProjectReport(): Promise<{
    projectInfo: {
      name: string;
      industry: string;
      phase: string;
      brandMaturity: string;
    };
    assetLibrary: {
      totalAssets: number;
      brandCompliantAssets: number;
      recentActivity: string[];
    };
    brandGuidelines: {
      totalGuidelines: number;
      lockedGuidelines: number;
      averageConfidence: number;
    };
    selfImprovement: {
      mistakesLearned: number;
      patternsIdentified: number;
      improvementsApplied: number;
    };
    systemHealth: {
      overallStatus: string;
      systemsOnline: number;
      averageResponseTime: number;
    };
  }> {
    this.ensureInitialized();

    const assetReport = await this.assetSystem.generateSystemReport();
    const selfImprovementStats = await this.selfImprovementEngine.getSystemStats();
    const systemStatus = this.aiCoordinator.getSystemStatus();

    return {
      projectInfo: {
        name: this.projectConfig!.projectName,
        industry: this.projectConfig!.industry,
        phase: this.projectConfig!.currentPhase,
        brandMaturity: this.projectConfig!.brandMaturity
      },
      assetLibrary: assetReport.assetLibrary,
      brandGuidelines: assetReport.brandGuidelines,
      selfImprovement: {
        mistakesLearned: selfImprovementStats.totalMistakesLearned || 0,
        patternsIdentified: selfImprovementStats.patternsIdentified || 0,
        improvementsApplied: selfImprovementStats.improvementsApplied || 0
      },
      systemHealth: {
        overallStatus: systemStatus.overallHealth || 'healthy',
        systemsOnline: systemStatus.systemsOnline || 0,
        averageResponseTime: systemStatus.averageResponseTime || 0
      }
    };
  }

  /**
   * 🔄 Project Data Management
   */
  async saveProjectData(): Promise<void> {
    this.ensureInitialized();
    
    // Save asset system data
    // (Asset system automatically saves its data)
    
    // Save self-improvement data
    await this.selfImprovementEngine.saveCurrentState();
    
    this.emit('projectDataSaved', {
      timestamp: new Date(),
      projectPath: this.projectDataPath
    });
  }

  async loadProjectData(): Promise<void> {
    this.ensureInitialized();
    
    // Reload all project-specific data
    await this.initializeSystemsWithProjectData();
    
    this.emit('projectDataLoaded', {
      timestamp: new Date(),
      projectPath: this.projectDataPath
    });
  }

  /**
   * 🛠️ Engine Management
   */
  private setupEngineEventHandlers(): void {
    // Forward important events from sub-systems
    this.assetSystem.on('assetGenerated', (result) => {
      this.emit('assetGenerated', result);
    });

    this.assetSystem.on('brandGuidelineLocked', (guideline) => {
      this.emit('brandGuidelineLocked', guideline);
    });

    this.selfImprovementEngine.on('mistakeLearned', (mistake) => {
      this.emit('mistakeLearned', mistake);
    });

    this.selfImprovementEngine.on('improvementApplied', (improvement) => {
      this.emit('improvementApplied', improvement);
    });

    this.aiCoordinator.on('taskCompleted', (task) => {
      this.emit('taskCompleted', task);
    });
  }

  private enableDebugMode(): void {
    this.on('*', (eventName, ...args) => {
      console.log(`🔍 [DEBUG] Engine Event: ${eventName}`, args);
    });
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Core Backend Engine not initialized. Call initializeWithProject() first.');
    }
  }

  private getSystemsCount(): number {
    return 3; // AI Coordinator, Asset System, Self-Improvement Engine
  }

  /**
   * 📊 Engine Status and Health
   */
  getEngineStatus(): {
    isInitialized: boolean;
    projectName: string | null;
    projectPath: string;
    systemsCount: number;
    uptime: number;
  } {
    return {
      isInitialized: this.isInitialized,
      projectName: this.projectConfig?.projectName || null,
      projectPath: this.projectDataPath,
      systemsCount: this.getSystemsCount(),
      uptime: process.uptime()
    };
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Core Backend Engine...');
    
    // Save all project data before shutdown
    if (this.isInitialized) {
      await this.saveProjectData();
    }
    
    // Shutdown all systems
    if (this.aiCoordinator) {
      await this.aiCoordinator.shutdown();
    }
    
    this.emit('engineShutdown', {
      timestamp: new Date(),
      projectName: this.projectConfig?.projectName
    });
    
    console.log('✅ Core Backend Engine shutdown complete');
  }
}

// Export factory function for easy instantiation
export function createBackendEngine(config: EngineConfig = {}): CoreBackendEngine {
  return new CoreBackendEngine(config);
}

// Export default instance for immediate use
export const coreEngine = new CoreBackendEngine(); 