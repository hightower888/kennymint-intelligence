import { SmartAssetManager, Asset, AssetGenerationRequest, AssetSearchQuery } from './asset-manager';
import { BrandGuidelinesEngine, BrandGuideline, BrandAnalysis, ProjectContext, BrandPersonality } from '../brand-guidelines/brand-engine';
import { BrandAssetCoordinator, BrandCompliantAssetRequest, AssetBrandingResult, BrandAssetRecommendation } from './brand-asset-coordinator';
import { EventEmitter } from 'events';

export interface SmartAssetSystemConfig {
  assetLibraryPath?: string;
  brandGuidelinesPath?: string;
  complianceThreshold?: number;
  enableStrictCompliance?: boolean;
}

export interface AssetRequest {
  type: Asset['type'];
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
}

export interface AssetResult {
  asset: Asset;
  wasGenerated: boolean;
  brandCompliant: boolean;
  complianceScore: number;
  brandAnalysis?: BrandAnalysis;
  recommendations?: string[];
}

export class SmartAssetIntegrationSystem extends EventEmitter {
  private assetManager: SmartAssetManager;
  private brandEngine: BrandGuidelinesEngine;
  private coordinator: BrandAssetCoordinator;
  private isInitialized: boolean = false;

  constructor(config: SmartAssetSystemConfig = {}) {
    super();
    
    this.assetManager = new SmartAssetManager(config.assetLibraryPath);
    this.brandEngine = new BrandGuidelinesEngine(config.brandGuidelinesPath);
    this.coordinator = new BrandAssetCoordinator(this.assetManager, this.brandEngine);

    if (config.complianceThreshold) {
      this.coordinator.setComplianceThreshold(config.complianceThreshold);
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Forward important events
    this.coordinator.on('brandCompliantAssetGenerated', (result) => {
      this.emit('assetGenerated', result);
    });

    this.coordinator.on('assetReused', (result) => {
      this.emit('assetReused', result);
    });

    this.coordinator.on('assetsNeedUpdate', (data) => {
      this.emit('assetsNeedUpdate', data);
    });

    this.brandEngine.on('guidelineLocked', (guideline) => {
      this.emit('brandGuidelineLocked', guideline);
    });

    this.brandEngine.on('brandLearned', (event) => {
      this.emit('brandLearned', event);
    });

    this.brandEngine.on('projectInitialized', (context) => {
      this.emit('projectInitialized', context);
    });
  }

  async initialize(projectContext: ProjectContext): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Smart Asset Integration System is already initialized');
    }

    await this.brandEngine.initializeProject(projectContext);
    this.isInitialized = true;

    this.emit('systemInitialized', {
      projectContext,
      assetLibraryStats: this.assetManager.getLibraryStats(),
      brandStats: this.brandEngine.getBrandStats()
    });
  }

  async requestAsset(request: AssetRequest): Promise<AssetResult> {
    if (!this.isInitialized) {
      throw new Error('System not initialized. Call initialize() first.');
    }

    // Convert to brand-compliant asset request
    const brandRequest: BrandCompliantAssetRequest = {
      type: request.type,
      purpose: request.purpose,
      context: request.context,
      specifications: {
        dimensions: request.specifications.dimensions,
        style: request.specifications.style || 'modern',
        text: request.specifications.text,
        colorScheme: request.specifications.colorPreferences
      },
      brandRequirements: {
        enforceGuidelines: request.brandCompliance?.enforceGuidelines ?? true,
        specificRequirements: []
      },
      enforceStrictCompliance: request.brandCompliance?.enforceGuidelines ?? false,
      allowBrandEvolution: request.brandCompliance?.allowEvolution ?? true,
      reviewRequired: request.brandCompliance?.requireReview ?? false
    };

    // Get or create brand-compliant asset
    const result = await this.coordinator.findOrCreateBrandCompliantAsset(brandRequest);

    // Convert to simplified result format
    const assetResult: AssetResult = {
      asset: result.asset,
      wasGenerated: result.asset.usageCount === 0,
      brandCompliant: result.asset.brandCompliant,
      complianceScore: result.complianceScore,
      brandAnalysis: result.brandAnalysis,
      recommendations: result.brandAnalysis.suggestions
    };

    this.emit('assetRequested', {
      request,
      result: assetResult,
      processingTime: Date.now()
    });

    return assetResult;
  }

  async searchAssets(query: {
    type?: Asset['type'];
    purpose?: string;
    tags?: string[];
    brandCompliant?: boolean;
    dimensions?: { width?: number; height?: number; ratio?: string };
  }): Promise<Asset[]> {
    const searchQuery: AssetSearchQuery = {
      type: query.type,
      purpose: query.purpose,
      tags: query.tags,
      dimensions: query.dimensions,
      mustBeBrandCompliant: query.brandCompliant
    };

    return await this.assetManager.searchAssets(searchQuery);
  }

  async getAssetRecommendations(query: {
    type?: Asset['type'];
    purpose?: string;
    context?: string;
  }): Promise<BrandAssetRecommendation> {
    const searchQuery: AssetSearchQuery = {
      type: query.type,
      purpose: query.purpose,
      context: query.context
    };

    return await this.coordinator.getBrandAssetRecommendations(searchQuery);
  }

  async setBrandGuideline(
    category: BrandGuideline['category'],
    rule: string,
    value: any,
    context?: string
  ): Promise<BrandGuideline> {
    return await this.brandEngine.setGuideline(category, rule, value, true, context);
  }

  async correctBrand(
    correctionType: 'color' | 'typography' | 'spacing' | 'general',
    instruction: string,
    oldValue: any,
    newValue: any,
    context: string
  ): Promise<void> {
    await this.brandEngine.learnFromCorrection(
      correctionType,
      oldValue,
      newValue,
      instruction,
      context
    );

    this.emit('brandCorrected', {
      type: correctionType,
      instruction,
      oldValue,
      newValue,
      context
    });
  }

  async analyzeBrandCompliance(content: {
    type: 'text' | 'visual' | 'layout' | 'component';
    content: any;
    context: string;
  }): Promise<BrandAnalysis> {
    return await this.brandEngine.analyzeContent({
      type: content.type,
      content: content.content,
      context: content.context
    });
  }

  generateBrandDocument(): string {
    return this.brandEngine.generateBrandDocument();
  }

  async generateSystemReport(): Promise<{
    assetLibrary: {
      totalAssets: number;
      brandCompliantAssets: number;
      recentActivity: string[];
    };
    brandGuidelines: {
      totalGuidelines: number;
      lockedGuidelines: number;
      averageConfidence: number;
      recentChanges: string[];
    };
    compliance: {
      overallScore: number;
      recentViolations: number;
      recommendations: string[];
    };
    performance: {
      searchPerformance: string;
      generationSuccess: string;
      cacheHitRate: string;
    };
  }> {
    const assetStats = this.assetManager.getLibraryStats();
    const brandStats = this.brandEngine.getBrandStats();
    const brandReport = await this.coordinator.generateBrandReport();

    return {
      assetLibrary: {
        totalAssets: assetStats.totalAssets,
        brandCompliantAssets: assetStats.brandCompliantAssets,
        recentActivity: [
          `${assetStats.totalUsage} total asset uses`,
          `${Object.keys(assetStats.assetsByType).length} asset types in library`,
          `Average usage: ${assetStats.averageUsage.toFixed(1)} per asset`
        ]
      },
      brandGuidelines: {
        totalGuidelines: brandStats.totalGuidelines,
        lockedGuidelines: brandStats.lockedGuidelines,
        averageConfidence: Math.round(brandStats.averageConfidence * 100),
        recentChanges: [
          `${brandStats.pendingChanges} pending changes`,
          `${brandStats.totalViolations} total violations tracked`,
          `Brand maturity: ${brandStats.brandMaturity}`
        ]
      },
      compliance: {
        overallScore: Math.round(brandReport.complianceRate * 100),
        recentViolations: brandReport.recentViolations.length,
        recommendations: brandReport.recommendations
      },
      performance: {
        searchPerformance: 'Optimized with smart indexing',
        generationSuccess: 'Enhanced with brand guidelines',
        cacheHitRate: 'Intelligent brand-aware caching'
      }
    };
  }

  getPendingBrandChanges(): BrandGuideline[] {
    return this.brandEngine.getPendingChanges();
  }

  async approvePendingChanges(guidelineIds: string[]): Promise<void> {
    await this.brandEngine.confirmPendingChanges(guidelineIds);
    this.emit('pendingChangesApproved', guidelineIds);
  }

  async rejectPendingChanges(guidelineIds: string[]): Promise<void> {
    await this.brandEngine.rejectPendingChanges(guidelineIds);
    this.emit('pendingChangesRejected', guidelineIds);
  }

  getSystemStats(): {
    isInitialized: boolean;
    complianceThreshold: number;
    assetCount: number;
    guidelineCount: number;
    lockedGuidelines: number;
  } {
    return {
      isInitialized: this.isInitialized,
      complianceThreshold: this.coordinator.getComplianceThreshold(),
      assetCount: this.assetManager.getLibraryStats().totalAssets,
      guidelineCount: this.brandEngine.getBrandStats().totalGuidelines,
      lockedGuidelines: this.brandEngine.getBrandStats().lockedGuidelines
    };
  }

  setComplianceThreshold(threshold: number): void {
    this.coordinator.setComplianceThreshold(threshold);
    this.emit('complianceThresholdChanged', threshold);
  }
}

// Export all types and classes
export {
  SmartAssetManager,
  BrandGuidelinesEngine,
  BrandAssetCoordinator,
  Asset,
  AssetGenerationRequest,
  AssetSearchQuery,
  BrandGuideline,
  BrandAnalysis,
  ProjectContext,
  BrandPersonality,
  BrandCompliantAssetRequest,
  AssetBrandingResult,
  BrandAssetRecommendation
};

// Export convenience function for quick setup
export function createSmartAssetSystem(config: SmartAssetSystemConfig = {}): SmartAssetIntegrationSystem {
  return new SmartAssetIntegrationSystem(config);
}

// Export default instance for immediate use
export const smartAssetSystem = new SmartAssetIntegrationSystem(); 