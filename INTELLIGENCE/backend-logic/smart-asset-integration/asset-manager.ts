import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';

export interface Asset {
  id: string;
  name: string;
  type: 'header' | 'icon' | 'infographic' | 'logo' | 'banner' | 'illustration' | 'background';
  format: 'svg' | 'png' | 'jpg' | 'webp' | 'gif' | 'pdf';
  path: string;
  tags: string[];
  brandCompliant: boolean;
  usageCount: number;
  createdAt: Date;
  lastUsed: Date;
  dimensions: { width: number; height: number };
  metadata: {
    purpose: string;
    context: string;
    colorPalette: string[];
    style: string;
    brandElements: string[];
  };
}

export interface AssetSearchQuery {
  type?: Asset['type'];
  tags?: string[];
  purpose?: string;
  context?: string;
  dimensions?: { width?: number; height?: number; ratio?: string };
  style?: string;
  mustBeBrandCompliant?: boolean;
}

export interface AssetGenerationRequest {
  type: Asset['type'];
  purpose: string;
  context: string;
  specifications: {
    dimensions: { width: number; height: number };
    style: string;
    colorScheme?: string[];
    text?: string;
    elements?: string[];
  };
  brandRequirements: {
    enforceGuidelines: boolean;
    specificRequirements?: string[];
  };
}

export class SmartAssetManager extends EventEmitter {
  private assets: Map<string, Asset> = new Map();
  private assetIndex: Map<string, string[]> = new Map(); // tag -> asset IDs
  private usageHistory: Map<string, { query: AssetSearchQuery; result: string; timestamp: Date }[]> = new Map();
  private generationQueue: AssetGenerationRequest[] = [];
  private assetLibraryPath: string;

  constructor(assetLibraryPath: string = './assets') {
    super();
    this.assetLibraryPath = assetLibraryPath;
    this.ensureDirectoryExists();
    this.loadExistingAssets();
    this.setupPeriodicOptimization();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.assetLibraryPath)) {
      fs.mkdirSync(this.assetLibraryPath, { recursive: true });
    }

    const subDirs = ['headers', 'icons', 'infographics', 'logos', 'banners', 'illustrations', 'backgrounds'];
    subDirs.forEach(dir => {
      const fullPath = path.join(this.assetLibraryPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  private loadExistingAssets(): void {
    try {
      const manifestPath = path.join(this.assetLibraryPath, 'asset-manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        manifest.assets.forEach((asset: any) => {
          this.assets.set(asset.id, {
            ...asset,
            createdAt: new Date(asset.createdAt),
            lastUsed: new Date(asset.lastUsed)
          });
          this.updateIndex(asset);
        });
      }
    } catch (error) {
      console.error('Error loading asset manifest:', error);
    }
  }

  private updateIndex(asset: Asset): void {
    // Index by tags
    asset.tags.forEach(tag => {
      if (!this.assetIndex.has(tag)) {
        this.assetIndex.set(tag, []);
      }
      this.assetIndex.get(tag)!.push(asset.id);
    });

    // Index by type
    if (!this.assetIndex.has(asset.type)) {
      this.assetIndex.set(asset.type, []);
    }
    this.assetIndex.get(asset.type)!.push(asset.id);

    // Index by purpose
    if (asset.metadata.purpose) {
      const purposeKey = `purpose:${asset.metadata.purpose}`;
      if (!this.assetIndex.has(purposeKey)) {
        this.assetIndex.set(purposeKey, []);
      }
      this.assetIndex.get(purposeKey)!.push(asset.id);
    }
  }

  async searchAssets(query: AssetSearchQuery): Promise<Asset[]> {
    const candidateIds = new Set<string>();

    // Find candidates based on query criteria
    if (query.type) {
      const typeAssets = this.assetIndex.get(query.type) || [];
      typeAssets.forEach(id => candidateIds.add(id));
    }

    if (query.tags) {
      query.tags.forEach(tag => {
        const tagAssets = this.assetIndex.get(tag) || [];
        tagAssets.forEach(id => candidateIds.add(id));
      });
    }

    if (query.purpose) {
      const purposeAssets = this.assetIndex.get(`purpose:${query.purpose}`) || [];
      purposeAssets.forEach(id => candidateIds.add(id));
    }

    // If no specific criteria, consider all assets
    if (candidateIds.size === 0) {
      this.assets.forEach((_, id) => candidateIds.add(id));
    }

    // Filter and score candidates
    const results: { asset: Asset; score: number }[] = [];

    candidateIds.forEach(id => {
      const asset = this.assets.get(id);
      if (!asset) return;

      // Apply filters
      if (query.mustBeBrandCompliant && !asset.brandCompliant) return;

      // Calculate relevance score
      let score = 0;

      // Type match (high weight)
      if (query.type && asset.type === query.type) score += 100;

      // Tag matches
      if (query.tags) {
        const matchingTags = query.tags.filter(tag => asset.tags.includes(tag));
        score += matchingTags.length * 20;
      }

      // Purpose match
      if (query.purpose && asset.metadata.purpose === query.purpose) score += 50;

      // Context similarity (basic keyword matching)
      if (query.context && asset.metadata.context) {
        const contextWords = query.context.toLowerCase().split(' ');
        const assetContextWords = asset.metadata.context.toLowerCase().split(' ');
        const matches = contextWords.filter(word => assetContextWords.includes(word));
        score += matches.length * 10;
      }

      // Dimension match
      if (query.dimensions) {
        if (query.dimensions.width && asset.dimensions.width === query.dimensions.width) score += 30;
        if (query.dimensions.height && asset.dimensions.height === query.dimensions.height) score += 30;
        if (query.dimensions.ratio) {
          const assetRatio = asset.dimensions.width / asset.dimensions.height;
          const queryRatio = this.parseRatio(query.dimensions.ratio);
          if (Math.abs(assetRatio - queryRatio) < 0.1) score += 40;
        }
      }

      // Usage frequency boost (popular assets are more likely to be good)
      score += Math.log(asset.usageCount + 1) * 5;

      // Brand compliance boost
      if (asset.brandCompliant) score += 25;

      // Recency boost (newer assets might be more relevant)
      const ageInDays = (Date.now() - asset.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - ageInDays * 0.1);

      results.push({ asset, score });
    });

    // Sort by score and return top results
    results.sort((a, b) => b.score - a.score);
    const finalResults = results.slice(0, 20).map(r => r.asset);

    // Track search for learning
    this.trackSearch(query, finalResults.map(a => a.id));

    return finalResults;
  }

  private parseRatio(ratio: string): number {
    const [width, height] = ratio.split(':').map(Number);
    return width / height;
  }

  private trackSearch(query: AssetSearchQuery, resultIds: string[]): void {
    const searchId = this.generateSearchId(query);
    if (!this.usageHistory.has(searchId)) {
      this.usageHistory.set(searchId, []);
    }

    resultIds.forEach(resultId => {
      this.usageHistory.get(searchId)!.push({
        query,
        result: resultId,
        timestamp: new Date()
      });
    });
  }

  private generateSearchId(query: AssetSearchQuery): string {
    const queryString = JSON.stringify(query);
    return crypto.createHash('md5').update(queryString).digest('hex');
  }

  async generateAsset(request: AssetGenerationRequest): Promise<Asset> {
    // Add to generation queue for processing
    this.generationQueue.push(request);

    // Create placeholder asset
    const assetId = this.generateAssetId();
    const assetPath = this.generateAssetPath(request.type, assetId, 'svg'); // Default to SVG

    // Generate asset content based on type and specifications
    const assetContent = await this.createAssetContent(request);
    
    // Save asset file
    fs.writeFileSync(assetPath, assetContent);

    // Create asset metadata
    const asset: Asset = {
      id: assetId,
      name: `${request.purpose}-${request.type}`,
      type: request.type,
      format: 'svg',
      path: assetPath,
      tags: this.generateTags(request),
      brandCompliant: request.brandRequirements.enforceGuidelines,
      usageCount: 0,
      createdAt: new Date(),
      lastUsed: new Date(),
      dimensions: request.specifications.dimensions,
      metadata: {
        purpose: request.purpose,
        context: request.context,
        colorPalette: request.specifications.colorScheme || [],
        style: request.specifications.style,
        brandElements: request.brandRequirements.specificRequirements || []
      }
    };

    // Add to library
    this.assets.set(assetId, asset);
    this.updateIndex(asset);
    await this.saveManifest();

    this.emit('assetGenerated', asset);
    return asset;
  }

  private generateAssetId(): string {
    return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAssetPath(type: string, id: string, format: string): string {
    return path.join(this.assetLibraryPath, `${type}s`, `${id}.${format}`);
  }

  private async createAssetContent(request: AssetGenerationRequest): Promise<string> {
    // This would integrate with AI image generation APIs (DALL-E, Midjourney, Stable Diffusion)
    // For now, creating SVG templates based on type
    
    const { width, height } = request.specifications.dimensions;
    const colors = request.specifications.colorScheme || ['#007bff', '#6c757d'];
    
    switch (request.type) {
      case 'header':
        return this.generateHeaderSVG(width, height, request.specifications.text || 'Header', colors);
      case 'icon':
        return this.generateIconSVG(width, height, request.purpose, colors);
      case 'logo':
        return this.generateLogoSVG(width, height, request.specifications.text || 'Logo', colors);
      case 'banner':
        return this.generateBannerSVG(width, height, request.specifications.text || 'Banner', colors);
      default:
        return this.generateGenericSVG(width, height, request.type, colors);
    }
  }

  private generateHeaderSVG(width: number, height: number, text: string, colors: string[]): string {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[1] || colors[0]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#headerGradient)" rx="8"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            fill="white" font-family="Arial, sans-serif" font-size="${Math.min(width/text.length*1.2, height*0.4)}" 
            font-weight="bold">${text}</text>
    </svg>`;
  }

  private generateIconSVG(width: number, height: number, purpose: string, colors: string[]): string {
    // Generate different icon shapes based on purpose
    const iconShape = this.getIconShape(purpose);
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g fill="${colors[0]}" stroke="${colors[1] || colors[0]}" stroke-width="2">
        ${iconShape}
      </g>
    </svg>`;
  }

  private getIconShape(purpose: string): string {
    const shapes: { [key: string]: string } = {
      'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>',
      'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      'settings': '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>',
      'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
      'menu': '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
      'default': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>'
    };
    
    return shapes[purpose.toLowerCase()] || shapes['default'];
  }

  private generateLogoSVG(width: number, height: number, text: string, colors: string[]): string {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[1] || colors[0]};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <circle cx="${width/2}" cy="${height/2}" r="${Math.min(width, height)/3}" fill="url(#logoGradient)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            fill="white" font-family="Arial, sans-serif" font-size="${Math.min(width/text.length*0.8, height*0.25)}" 
            font-weight="bold">${text}</text>
    </svg>`;
  }

  private generateBannerSVG(width: number, height: number, text: string, colors: string[]): string {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bannerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.9" />
          <stop offset="50%" style="stop-color:${colors[1] || colors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[0]};stop-opacity:0.9" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bannerGradient)" rx="12"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            fill="white" font-family="Arial, sans-serif" font-size="${Math.min(width/text.length*1.5, height*0.5)}" 
            font-weight="300">${text}</text>
    </svg>`;
  }

  private generateGenericSVG(width: number, height: number, type: string, colors: string[]): string {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${colors[0]}" rx="8"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            fill="white" font-family="Arial, sans-serif" font-size="${height*0.2}" 
            font-weight="bold">${type.toUpperCase()}</text>
    </svg>`;
  }

  private generateTags(request: AssetGenerationRequest): string[] {
    const tags = [
      request.type,
      request.purpose,
      request.specifications.style,
      ...request.context.split(' ').filter(word => word.length > 3)
    ];

    // Add contextual tags based on specifications
    if (request.specifications.colorScheme) {
      tags.push(...request.specifications.colorScheme.map(color => `color-${color.replace('#', '')}`));
    }

    if (request.specifications.elements) {
      tags.push(...request.specifications.elements);
    }

    return [...new Set(tags.filter(Boolean))]; // Remove duplicates and empty values
  }

  async useAsset(assetId: string): Promise<Asset | null> {
    const asset = this.assets.get(assetId);
    if (!asset) return null;

    // Update usage statistics
    asset.usageCount++;
    asset.lastUsed = new Date();

    await this.saveManifest();
    this.emit('assetUsed', asset);
    
    return asset;
  }

  async optimizeLibrary(): Promise<void> {
    // Remove unused assets older than 6 months
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    
    const assetsToRemove: string[] = [];
    this.assets.forEach((asset, id) => {
      if (asset.usageCount === 0 && asset.createdAt < sixMonthsAgo) {
        assetsToRemove.push(id);
      }
    });

    for (const assetId of assetsToRemove) {
      await this.removeAsset(assetId);
    }

    // Rebuild index
    this.assetIndex.clear();
    this.assets.forEach(asset => this.updateIndex(asset));

    await this.saveManifest();
    this.emit('libraryOptimized', { removedAssets: assetsToRemove.length });
  }

  private async removeAsset(assetId: string): Promise<void> {
    const asset = this.assets.get(assetId);
    if (!asset) return;

    // Remove file
    try {
      if (fs.existsSync(asset.path)) {
        fs.unlinkSync(asset.path);
      }
    } catch (error) {
      console.error(`Error removing asset file ${asset.path}:`, error);
    }

    // Remove from memory
    this.assets.delete(assetId);
  }

  private async saveManifest(): Promise<void> {
    const manifest = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      assetCount: this.assets.size,
      assets: Array.from(this.assets.values())
    };

    const manifestPath = path.join(this.assetLibraryPath, 'asset-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  private setupPeriodicOptimization(): void {
    // Run optimization weekly
    setInterval(() => {
      this.optimizeLibrary().catch(console.error);
    }, 7 * 24 * 60 * 60 * 1000);
  }

  getLibraryStats(): {
    totalAssets: number;
    assetsByType: { [key: string]: number };
    brandCompliantAssets: number;
    totalUsage: number;
    averageUsage: number;
  } {
    const stats = {
      totalAssets: this.assets.size,
      assetsByType: {} as { [key: string]: number },
      brandCompliantAssets: 0,
      totalUsage: 0,
      averageUsage: 0
    };

    this.assets.forEach(asset => {
      stats.assetsByType[asset.type] = (stats.assetsByType[asset.type] || 0) + 1;
      if (asset.brandCompliant) stats.brandCompliantAssets++;
      stats.totalUsage += asset.usageCount;
    });

    stats.averageUsage = stats.totalAssets > 0 ? stats.totalUsage / stats.totalAssets : 0;

    return stats;
  }
} 