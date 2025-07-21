import { EventEmitter } from 'events';
import { SmartAssetManager, Asset, AssetGenerationRequest, AssetSearchQuery } from './asset-manager';
import { BrandGuidelinesEngine, BrandGuideline, BrandAnalysis, ContentRequest } from '../brand-guidelines/brand-engine';

export interface BrandCompliantAssetRequest extends AssetGenerationRequest {
  enforceStrictCompliance?: boolean;
  allowBrandEvolution?: boolean;
  reviewRequired?: boolean;
}

export interface AssetBrandingResult {
  asset: Asset;
  brandAnalysis: BrandAnalysis;
  complianceScore: number;
  modifications: string[];
  approvalStatus: 'approved' | 'needs_review' | 'rejected';
}

export interface BrandAssetRecommendation {
  existingAssets: Asset[];
  suggestedGeneration?: BrandCompliantAssetRequest;
  brandJustification: string;
  confidenceScore: number;
}

export class BrandAssetCoordinator extends EventEmitter {
  private assetManager: SmartAssetManager;
  private brandEngine: BrandGuidelinesEngine;
  private brandAssetCache: Map<string, AssetBrandingResult> = new Map();
  private complianceThreshold: number = 0.8;

  constructor(assetManager: SmartAssetManager, brandEngine: BrandGuidelinesEngine) {
    super();
    this.assetManager = assetManager;
    this.brandEngine = brandEngine;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Listen for brand guideline changes to invalidate asset cache
    this.brandEngine.on('guidelineLocked', (guideline: BrandGuideline) => {
      this.invalidateCacheForCategory(guideline.category);
      this.auditExistingAssets(guideline);
    });

    // Listen for brand learning events
    this.brandEngine.on('brandLearned', (learningEvent: any) => {
      this.propagateBrandLearningToAssets(learningEvent);
    });

    // Listen for asset generation
    this.assetManager.on('assetGenerated', (asset: Asset) => {
      this.performPostGenerationBrandAudit(asset);
    });
  }

  async findOrCreateBrandCompliantAsset(request: BrandCompliantAssetRequest): Promise<AssetBrandingResult> {
    // First, try to find existing brand-compliant assets
    const searchQuery: AssetSearchQuery = {
      type: request.type,
      purpose: request.purpose,
      context: request.context,
      mustBeBrandCompliant: true,
      dimensions: request.specifications.dimensions
    };

    const existingAssets = await this.assetManager.searchAssets(searchQuery);
    
    // Check if any existing assets meet our brand requirements
    for (const asset of existingAssets) {
      const brandAnalysis = await this.analyzeAssetBrandCompliance(asset);
      
      if (brandAnalysis.adherence >= this.complianceThreshold) {
        // Found suitable existing asset
        await this.assetManager.useAsset(asset.id);
        
        const result: AssetBrandingResult = {
          asset,
          brandAnalysis,
          complianceScore: brandAnalysis.adherence,
          modifications: [],
          approvalStatus: 'approved'
        };

        this.brandAssetCache.set(asset.id, result);
        this.emit('assetReused', result);
        return result;
      }
    }

    // No suitable existing asset found, generate new one
    return await this.generateBrandCompliantAsset(request);
  }

  private async generateBrandCompliantAsset(request: BrandCompliantAssetRequest): Promise<AssetBrandingResult> {
    // Enhance request with current brand guidelines
    const enhancedRequest = await this.enhanceRequestWithBrandGuidelines(request);
    
    // Generate the asset
    const asset = await this.assetManager.generateAsset(enhancedRequest);
    
    // Analyze brand compliance
    const brandAnalysis = await this.analyzeAssetBrandCompliance(asset);
    
    const result: AssetBrandingResult = {
      asset,
      brandAnalysis,
      complianceScore: brandAnalysis.adherence,
      modifications: this.getModificationsSummary(request, enhancedRequest),
      approvalStatus: this.determineApprovalStatus(brandAnalysis, request)
    };

    // Handle non-compliant assets
    if (result.complianceScore < this.complianceThreshold) {
      if (request.enforceStrictCompliance) {
        // Regenerate with stricter compliance
        return await this.regenerateWithStricterCompliance(request, brandAnalysis);
      } else if (request.reviewRequired) {
        result.approvalStatus = 'needs_review';
      }
    }

    this.brandAssetCache.set(asset.id, result);
    this.emit('brandCompliantAssetGenerated', result);
    return result;
  }

  private async enhanceRequestWithBrandGuidelines(request: BrandCompliantAssetRequest): Promise<BrandCompliantAssetRequest> {
    const enhancedRequest = { ...request };
    
    // Get relevant brand guidelines
    const colorGuidelines = await this.getBrandColorGuidelines();
    const typographyGuidelines = await this.getBrandTypographyGuidelines();
    const spacingGuidelines = await this.getBrandSpacingGuidelines();

    // Apply color guidelines
    if (colorGuidelines && !enhancedRequest.specifications.colorScheme) {
      enhancedRequest.specifications.colorScheme = [
        colorGuidelines.primary,
        ...(colorGuidelines.secondary || [])
      ];
    }

    // Apply typography guidelines for text-based assets
    if (typographyGuidelines && ['header', 'banner'].includes(request.type)) {
      enhancedRequest.specifications.elements = [
        ...(enhancedRequest.specifications.elements || []),
        `font-family: ${typographyGuidelines.primary}`
      ];
    }

    // Apply spacing guidelines for layout assets
    if (spacingGuidelines && ['header', 'banner', 'infographic'].includes(request.type)) {
      enhancedRequest.specifications.elements = [
        ...(enhancedRequest.specifications.elements || []),
        `padding: ${spacingGuidelines.base}`
      ];
    }

    // Ensure brand requirements are properly set
    enhancedRequest.brandRequirements = {
      enforceGuidelines: true,
      specificRequirements: [
        ...(enhancedRequest.brandRequirements.specificRequirements || []),
        'Use established brand colors',
        'Follow brand typography standards',
        'Maintain consistent spacing'
      ]
    };

    return enhancedRequest;
  }

  private async getBrandColorGuidelines(): Promise<any> {
    const brandStats = this.brandEngine.getBrandStats();
    if (brandStats.totalGuidelines === 0) return null;

    // This would query the brand engine for color guidelines
    // For now, returning a placeholder structure
    return {
      primary: '#007bff',
      secondary: ['#6c757d', '#28a745']
    };
  }

  private async getBrandTypographyGuidelines(): Promise<any> {
    // Query brand engine for typography guidelines
    return {
      primary: 'Arial',
      fallback: ['sans-serif']
    };
  }

  private async getBrandSpacingGuidelines(): Promise<any> {
    // Query brand engine for spacing guidelines
    return {
      base: '16px',
      scale: [8, 16, 24, 32]
    };
  }

  private async analyzeAssetBrandCompliance(asset: Asset): Promise<BrandAnalysis> {
    // Create content request for brand analysis
    const contentRequest: ContentRequest = {
      type: 'visual',
      content: {
        assetType: asset.type,
        path: asset.path,
        metadata: asset.metadata,
        dimensions: asset.dimensions
      },
      context: asset.metadata.context,
      requirements: asset.metadata.brandElements
    };

    return await this.brandEngine.analyzeContent(contentRequest);
  }

  private getModificationsSummary(original: BrandCompliantAssetRequest, enhanced: BrandCompliantAssetRequest): string[] {
    const modifications: string[] = [];

    // Compare color schemes
    if (JSON.stringify(original.specifications.colorScheme) !== JSON.stringify(enhanced.specifications.colorScheme)) {
      modifications.push('Applied brand color palette');
    }

    // Compare elements
    if (JSON.stringify(original.specifications.elements) !== JSON.stringify(enhanced.specifications.elements)) {
      modifications.push('Added brand typography and spacing standards');
    }

    // Compare brand requirements
    if (original.brandRequirements.specificRequirements?.length !== enhanced.brandRequirements.specificRequirements?.length) {
      modifications.push('Enhanced brand compliance requirements');
    }

    return modifications;
  }

  private determineApprovalStatus(analysis: BrandAnalysis, request: BrandCompliantAssetRequest): 'approved' | 'needs_review' | 'rejected' {
    if (analysis.adherence >= this.complianceThreshold) {
      return 'approved';
    }

    if (request.enforceStrictCompliance) {
      return 'rejected';
    }

    if (request.reviewRequired || analysis.violations.some(v => v.severity === 'critical')) {
      return 'needs_review';
    }

    return 'approved';
  }

  private async regenerateWithStricterCompliance(
    request: BrandCompliantAssetRequest, 
    failedAnalysis: BrandAnalysis
  ): Promise<AssetBrandingResult> {
    // Create enhanced request addressing the specific violations
    const stricterRequest = { ...request };
    
    // Apply fixes based on violations
    failedAnalysis.violations.forEach(violation => {
      switch (violation.type) {
        case 'Primary color palette':
          stricterRequest.specifications.colorScheme = this.getStrictBrandColors();
          break;
        case 'Primary font family':
          stricterRequest.specifications.elements = [
            ...(stricterRequest.specifications.elements || []),
            'font-family: Arial, sans-serif'
          ];
          break;
        case 'Base spacing unit':
          stricterRequest.specifications.elements = [
            ...(stricterRequest.specifications.elements || []),
            'padding: 16px', 'margin: 16px'
          ];
          break;
      }
    });

    // Set stricter brand requirements
    stricterRequest.brandRequirements.enforceGuidelines = true;
    stricterRequest.brandRequirements.specificRequirements = [
      'STRICT: Only use approved brand colors',
      'STRICT: Only use approved brand typography',
      'STRICT: Follow exact spacing guidelines'
    ];

    // Generate new asset
    const asset = await this.assetManager.generateAsset(stricterRequest);
    const brandAnalysis = await this.analyzeAssetBrandCompliance(asset);

    const result: AssetBrandingResult = {
      asset,
      brandAnalysis,
      complianceScore: brandAnalysis.adherence,
      modifications: ['Regenerated with strict brand compliance'],
      approvalStatus: brandAnalysis.adherence >= this.complianceThreshold ? 'approved' : 'needs_review'
    };

    return result;
  }

  private getStrictBrandColors(): string[] {
    // Return the most restrictive brand color palette
    return ['#007bff', '#6c757d']; // Placeholder
  }

  async getBrandAssetRecommendations(
    searchQuery: AssetSearchQuery
  ): Promise<BrandAssetRecommendation> {
    // Search for existing brand-compliant assets
    const existingAssets = await this.assetManager.searchAssets({
      ...searchQuery,
      mustBeBrandCompliant: true
    });

    // Analyze existing assets for brand compliance
    const analyzedAssets = await Promise.all(
      existingAssets.map(async asset => ({
        asset,
        analysis: await this.analyzeAssetBrandCompliance(asset)
      }))
    );

    // Filter for high-compliance assets
    const compliantAssets = analyzedAssets
      .filter(({ analysis }) => analysis.adherence >= this.complianceThreshold)
      .map(({ asset }) => asset);

    let suggestedGeneration: BrandCompliantAssetRequest | undefined;
    let brandJustification = '';
    let confidenceScore = 0;

    if (compliantAssets.length === 0) {
      // No existing compliant assets, suggest generation
      suggestedGeneration = {
        type: searchQuery.type || 'icon',
        purpose: searchQuery.purpose || 'general use',
        context: searchQuery.context || 'brand-consistent asset',
        specifications: {
          dimensions: searchQuery.dimensions || { width: 200, height: 200 },
          style: 'brand-consistent',
          colorScheme: await this.getRecommendedBrandColors(),
          elements: await this.getRecommendedBrandElements()
        },
        brandRequirements: {
          enforceGuidelines: true,
          specificRequirements: [
            'Must follow established brand guidelines',
            'Ensure color palette compliance',
            'Apply brand typography standards'
          ]
        },
        enforceStrictCompliance: true,
        reviewRequired: false
      };

      brandJustification = 'No existing brand-compliant assets found. New asset generation recommended with strict brand adherence.';
      confidenceScore = 0.9;
    } else {
      brandJustification = `Found ${compliantAssets.length} existing brand-compliant assets that meet your requirements.`;
      confidenceScore = Math.min(compliantAssets.length / 5, 1); // More assets = higher confidence
    }

    return {
      existingAssets: compliantAssets,
      suggestedGeneration,
      brandJustification,
      confidenceScore
    };
  }

  private async getRecommendedBrandColors(): Promise<string[]> {
    const colorGuidelines = await this.getBrandColorGuidelines();
    return colorGuidelines ? [colorGuidelines.primary, ...colorGuidelines.secondary] : ['#007bff'];
  }

  private async getRecommendedBrandElements(): Promise<string[]> {
    const typographyGuidelines = await this.getBrandTypographyGuidelines();
    const spacingGuidelines = await this.getBrandSpacingGuidelines();

    return [
      typographyGuidelines ? `font-family: ${typographyGuidelines.primary}` : 'font-family: Arial',
      spacingGuidelines ? `padding: ${spacingGuidelines.base}` : 'padding: 16px'
    ];
  }

  private invalidateCacheForCategory(category: string): void {
    // Remove cached results for assets that might be affected by guideline changes
    for (const [assetId, result] of this.brandAssetCache.entries()) {
      if (this.isAssetAffectedByCategory(result.asset, category)) {
        this.brandAssetCache.delete(assetId);
      }
    }
  }

  private isAssetAffectedByCategory(asset: Asset, category: string): boolean {
    const affectedCategories: { [key: string]: string[] } = {
      'colors': ['header', 'banner', 'logo', 'icon', 'background'],
      'typography': ['header', 'banner'],
      'spacing': ['header', 'banner', 'infographic'],
      'logo': ['logo'],
      'imagery': ['illustration', 'background'],
      'iconography': ['icon']
    };

    return affectedCategories[category]?.includes(asset.type) || false;
  }

  private async auditExistingAssets(guideline: BrandGuideline): Promise<void> {
    // Get all assets that might be affected by this guideline
    const allAssets = await this.assetManager.searchAssets({});
    const affectedAssets = allAssets.filter(asset => 
      this.isAssetAffectedByCategory(asset, guideline.category)
    );

    // Analyze compliance for affected assets
    const complianceResults = await Promise.all(
      affectedAssets.map(async asset => ({
        asset,
        analysis: await this.analyzeAssetBrandCompliance(asset)
      }))
    );

    // Identify non-compliant assets
    const nonCompliantAssets = complianceResults.filter(
      ({ analysis }) => analysis.adherence < this.complianceThreshold
    );

    if (nonCompliantAssets.length > 0) {
      this.emit('assetsNeedUpdate', {
        guideline,
        affectedAssets: nonCompliantAssets.map(({ asset }) => asset),
        totalAffected: nonCompliantAssets.length
      });
    }
  }

  private async propagateBrandLearningToAssets(learningEvent: any): Promise<void> {
    // Update asset generation templates based on brand learning
    this.emit('brandLearningPropagated', {
      learningType: learningEvent.type,
      affectedAssetTypes: this.getAffectedAssetTypes(learningEvent.type),
      timestamp: new Date()
    });
  }

  private getAffectedAssetTypes(learningType: string): string[] {
    const typeMapping: { [key: string]: string[] } = {
      'color': ['header', 'banner', 'logo', 'icon', 'background'],
      'typography': ['header', 'banner'],
      'spacing': ['header', 'banner', 'infographic'],
      'general': ['header', 'banner', 'logo', 'icon']
    };

    return typeMapping[learningType] || [];
  }

  private async performPostGenerationBrandAudit(asset: Asset): Promise<void> {
    if (!asset.brandCompliant) return;

    const analysis = await this.analyzeAssetBrandCompliance(asset);
    
    if (analysis.adherence < this.complianceThreshold) {
      this.emit('brandComplianceWarning', {
        asset,
        analysis,
        message: 'Generated asset marked as brand compliant but fails compliance check'
      });
    }
  }

  async generateBrandReport(): Promise<{
    totalAssets: number;
    brandCompliantAssets: number;
    complianceRate: number;
    recentViolations: any[];
    recommendations: string[];
  }> {
    const stats = this.assetManager.getLibraryStats();
    const brandStats = this.brandEngine.getBrandStats();
    
    const cachedResults = Array.from(this.brandAssetCache.values());
    const averageCompliance = cachedResults.length > 0
      ? cachedResults.reduce((sum, result) => sum + result.complianceScore, 0) / cachedResults.length
      : 0;

    const recentViolations = cachedResults
      .filter(result => result.brandAnalysis.violations.length > 0)
      .slice(0, 10);

    const recommendations: string[] = [];
    
    if (stats.brandCompliantAssets / stats.totalAssets < 0.8) {
      recommendations.push('Increase brand compliance rate by updating non-compliant assets');
    }
    
    if (brandStats.lockedGuidelines < 3) {
      recommendations.push('Establish more locked brand guidelines to improve consistency');
    }
    
    if (averageCompliance < 0.8) {
      recommendations.push('Review and update asset generation templates for better brand compliance');
    }

    return {
      totalAssets: stats.totalAssets,
      brandCompliantAssets: stats.brandCompliantAssets,
      complianceRate: stats.totalAssets > 0 ? stats.brandCompliantAssets / stats.totalAssets : 0,
      recentViolations: recentViolations.map(r => ({
        assetId: r.asset.id,
        violations: r.brandAnalysis.violations.length,
        complianceScore: r.complianceScore
      })),
      recommendations
    };
  }

  setComplianceThreshold(threshold: number): void {
    this.complianceThreshold = Math.max(0, Math.min(1, threshold));
    this.emit('complianceThresholdChanged', this.complianceThreshold);
  }

  getComplianceThreshold(): number {
    return this.complianceThreshold;
  }
} 