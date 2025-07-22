import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface BrandGuideline {
  id: string;
  category: 'colors' | 'typography' | 'logo' | 'imagery' | 'voice' | 'layout' | 'spacing' | 'iconography';
  rule: string;
  value: any;
  confidence: number; // 0-1, how certain we are about this rule
  isLocked: boolean; // true after user explicit confirmation
  source: 'inferred' | 'user_specified' | 'learned' | 'corrected';
  createdAt: Date;
  lastUpdated: Date;
  usageCount: number;
  violations: number;
  examples: string[]; // URLs or file paths to examples
  context: string; // project context when this rule was established
}

export interface BrandPersonality {
  tone: 'professional' | 'friendly' | 'playful' | 'serious' | 'innovative' | 'traditional';
  style: 'modern' | 'classic' | 'minimalist' | 'bold' | 'elegant' | 'casual';
  targetAudience: string;
  industry: string;
  brandValues: string[];
  communicationStyle: string;
}

export interface ProjectContext {
  name: string;
  industry: string;
  targetAudience: string;
  purpose: string;
  currentPhase: 'discovery' | 'development' | 'established' | 'maintenance';
  brandMaturity: 'none' | 'emerging' | 'defined' | 'established';
}

export interface BrandAnalysis {
  consistency: number; // 0-1
  completeness: number; // 0-1
  adherence: number; // 0-1
  suggestions: string[];
  violations: BrandViolation[];
  missingGuidelines: string[];
}

export interface BrandViolation {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  affectedElements: string[];
}

export interface ContentRequest {
  type: 'text' | 'visual' | 'layout' | 'component';
  content: any;
  context: string;
  requirements?: string[];
}

export class BrandGuidelinesEngine extends EventEmitter {
  private guidelines: Map<string, BrandGuideline> = new Map();
  private brandPersonality: BrandPersonality | null = null;
  private projectContext: ProjectContext | null = null;
  private guidelinesPath: string;
  private learningHistory: Map<string, any[]> = new Map();
  private pendingChanges: Map<string, BrandGuideline> = new Map();
  private brandAssets: string[] = [];

  constructor(guidelinesPath: string = './brand-guidelines') {
    super();
    this.guidelinesPath = guidelinesPath;
    this.ensureDirectoryExists();
    this.loadExistingGuidelines();
    this.setupPeriodicAnalysis();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.guidelinesPath)) {
      fs.mkdirSync(this.guidelinesPath, { recursive: true });
    }

    const subDirs = ['assets', 'examples', 'templates', 'violations'];
    subDirs.forEach(dir => {
      const fullPath = path.join(this.guidelinesPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  private loadExistingGuidelines(): void {
    try {
      const guidelinesFile = path.join(this.guidelinesPath, 'brand-guidelines.json');
      if (fs.existsSync(guidelinesFile)) {
        const data = JSON.parse(fs.readFileSync(guidelinesFile, 'utf-8'));
        
        // Load guidelines
        if (data.guidelines) {
          data.guidelines.forEach((guideline: any) => {
            this.guidelines.set(guideline.id, {
              ...guideline,
              createdAt: new Date(guideline.createdAt),
              lastUpdated: new Date(guideline.lastUpdated)
            });
          });
        }

        // Load brand personality
        if (data.brandPersonality) {
          this.brandPersonality = data.brandPersonality;
        }

        // Load project context
        if (data.projectContext) {
          this.projectContext = data.projectContext;
        }
      }
    } catch (error) {
      console.error('Error loading brand guidelines:', error);
    }
  }

  async initializeProject(context: ProjectContext): Promise<void> {
    this.projectContext = context;
    
    // If no brand exists yet, we're in discovery mode
    if (context.brandMaturity === 'none') {
      await this.startBrandDiscovery(context);
    }

    await this.saveGuidelines();
    this.emit('projectInitialized', context);
  }

  private async startBrandDiscovery(context: ProjectContext): Promise<void> {
    // Create initial inferred guidelines based on project context
    const inferredGuidelines = await this.inferInitialGuidelines(context);
    
    inferredGuidelines.forEach(guideline => {
      this.guidelines.set(guideline.id, guideline);
    });

    // Set up brand personality framework
    this.brandPersonality = await this.inferBrandPersonality(context);
    
    this.emit('brandDiscoveryStarted', {
      inferredGuidelines: inferredGuidelines.length,
      brandPersonality: this.brandPersonality
    });
  }

  private async inferInitialGuidelines(context: ProjectContext): Promise<BrandGuideline[]> {
    const guidelines: BrandGuideline[] = [];

    // Infer color guidelines based on industry
    const industryColors = this.getIndustryColorPalette(context.industry);
    guidelines.push({
      id: this.generateId(),
      category: 'colors',
      rule: 'Primary color palette',
      value: { primary: industryColors.primary, secondary: industryColors.secondary },
      confidence: 0.6,
      isLocked: false,
      source: 'inferred',
      createdAt: new Date(),
      lastUpdated: new Date(),
      usageCount: 0,
      violations: 0,
      examples: [],
      context: `Inferred from ${context.industry} industry standards`
    });

    // Infer typography based on target audience
    const typography = this.getAudienceTypography(context.targetAudience);
    guidelines.push({
      id: this.generateId(),
      category: 'typography',
      rule: 'Primary font family',
      value: { primary: typography.primary, fallback: typography.fallback },
      confidence: 0.5,
      isLocked: false,
      source: 'inferred',
      createdAt: new Date(),
      lastUpdated: new Date(),
      usageCount: 0,
      violations: 0,
      examples: [],
      context: `Inferred from target audience: ${context.targetAudience}`
    });

    // Infer spacing and layout guidelines
    guidelines.push({
      id: this.generateId(),
      category: 'spacing',
      rule: 'Base spacing unit',
      value: { base: '8px', scale: [4, 8, 16, 24, 32, 48, 64] },
      confidence: 0.8,
      isLocked: false,
      source: 'inferred',
      createdAt: new Date(),
      lastUpdated: new Date(),
      usageCount: 0,
      violations: 0,
      examples: [],
      context: 'Standard design system spacing'
    });

    return guidelines;
  }

  private async inferBrandPersonality(context: ProjectContext): Promise<BrandPersonality> {
    // Industry-based personality inference
    const industryPersonalities: { [key: string]: Partial<BrandPersonality> } = {
      'technology': { tone: 'innovative', style: 'modern' },
      'finance': { tone: 'professional', style: 'classic' },
      'healthcare': { tone: 'serious', style: 'minimalist' },
      'education': { tone: 'friendly', style: 'modern' },
      'entertainment': { tone: 'playful', style: 'bold' },
      'luxury': { tone: 'professional', style: 'elegant' }
    };

    const basePersonality = industryPersonalities[context.industry.toLowerCase()] || 
                           { tone: 'professional', style: 'modern' };

    return {
      tone: basePersonality.tone as any || 'professional',
      style: basePersonality.style as any || 'modern',
      targetAudience: context.targetAudience,
      industry: context.industry,
      brandValues: [],
      communicationStyle: `${basePersonality.tone} and ${basePersonality.style} approach suitable for ${context.targetAudience}`
    };
  }

  private getIndustryColorPalette(industry: string): { primary: string; secondary: string[] } {
    const palettes: { [key: string]: { primary: string; secondary: string[] } } = {
      'technology': { primary: '#007bff', secondary: ['#6c757d', '#28a745', '#ffc107'] },
      'finance': { primary: '#004d7a', secondary: ['#2c5aa0', '#e4e9f7', '#f8f9fa'] },
      'healthcare': { primary: '#0056b3', secondary: ['#17a2b8', '#6f42c1', '#e9ecef'] },
      'education': { primary: '#28a745', secondary: ['#007bff', '#ffc107', '#f8f9fa'] },
      'entertainment': { primary: '#e83e8c', secondary: ['#fd7e14', '#6610f2', '#20c997'] },
      'luxury': { primary: '#212529', secondary: ['#6c757d', '#f8f9fa', '#e9ecef'] }
    };

    return palettes[industry.toLowerCase()] || palettes['technology'];
  }

  private getAudienceTypography(audience: string): { primary: string; fallback: string[] } {
    const typographies: { [key: string]: { primary: string; fallback: string[] } } = {
      'business': { primary: 'Inter', fallback: ['Arial', 'sans-serif'] },
      'creative': { primary: 'Poppins', fallback: ['Helvetica', 'sans-serif'] },
      'technical': { primary: 'JetBrains Mono', fallback: ['Courier', 'monospace'] },
      'general': { primary: 'Roboto', fallback: ['Arial', 'sans-serif'] },
      'luxury': { primary: 'Playfair Display', fallback: ['Times', 'serif'] },
      'casual': { primary: 'Open Sans', fallback: ['Arial', 'sans-serif'] }
    };

    const audienceKey = audience.toLowerCase();
    for (const key of Object.keys(typographies)) {
      if (audienceKey.includes(key)) {
        return typographies[key];
      }
    }

    return typographies['general'];
  }

  async setGuideline(
    category: BrandGuideline['category'],
    rule: string,
    value: any,
    userExplicit: boolean = false,
    context?: string
  ): Promise<BrandGuideline> {
    const existingGuideline = this.findGuideline(category, rule);
    
    if (existingGuideline && existingGuideline.isLocked && !userExplicit) {
      throw new Error(`Brand guideline "${rule}" is locked and requires explicit user consent to change`);
    }

    const guideline: BrandGuideline = {
      id: existingGuideline?.id || this.generateId(),
      category,
      rule,
      value,
      confidence: userExplicit ? 1.0 : 0.8,
      isLocked: userExplicit,
      source: userExplicit ? 'user_specified' : 'learned',
      createdAt: existingGuideline?.createdAt || new Date(),
      lastUpdated: new Date(),
      usageCount: existingGuideline?.usageCount || 0,
      violations: existingGuideline?.violations || 0,
      examples: existingGuideline?.examples || [],
      context: context || `Set via ${userExplicit ? 'user instruction' : 'system learning'}`
    };

    if (userExplicit) {
      // Lock the guideline when user explicitly sets it
      guideline.isLocked = true;
      this.guidelines.set(guideline.id, guideline);
      await this.saveGuidelines();
      this.emit('guidelineLocked', guideline);
    } else if (!existingGuideline?.isLocked) {
      // Only update if not locked
      this.pendingChanges.set(guideline.id, guideline);
      this.emit('guidelineSuggested', guideline);
    }

    return guideline;
  }

  private findGuideline(category: BrandGuideline['category'], rule: string): BrandGuideline | undefined {
    return Array.from(this.guidelines.values()).find(g => g.category === category && g.rule === rule);
  }

  async confirmPendingChanges(guidelineIds: string[]): Promise<void> {
    guidelineIds.forEach(id => {
      const pendingGuideline = this.pendingChanges.get(id);
      if (pendingGuideline) {
        this.guidelines.set(id, pendingGuideline);
        this.pendingChanges.delete(id);
      }
    });

    await this.saveGuidelines();
    this.emit('pendingChangesConfirmed', guidelineIds);
  }

  async rejectPendingChanges(guidelineIds: string[]): Promise<void> {
    guidelineIds.forEach(id => {
      this.pendingChanges.delete(id);
    });

    this.emit('pendingChangesRejected', guidelineIds);
  }

  async analyzeContent(request: ContentRequest): Promise<BrandAnalysis> {
    const analysis: BrandAnalysis = {
      consistency: 0,
      completeness: 0,
      adherence: 0,
      suggestions: [],
      violations: [],
      missingGuidelines: []
    };

    const activeGuidelines = Array.from(this.guidelines.values());
    let totalChecks = 0;
    let passedChecks = 0;

    // Analyze against each applicable guideline
    for (const guideline of activeGuidelines) {
      const applicable = this.isGuidelineApplicable(guideline, request);
      if (!applicable) continue;

      totalChecks++;
      const compliance = await this.checkCompliance(guideline, request);
      
      if (compliance.passes) {
        passedChecks++;
        guideline.usageCount++;
      } else {
        guideline.violations++;
        analysis.violations.push({
          type: guideline.rule,
          description: compliance.reason || 'Guideline violation detected',
          severity: compliance.severity || 'medium',
          suggestion: compliance.suggestion || 'Please review brand guidelines',
          affectedElements: compliance.affectedElements || []
        });
      }
    }

    // Calculate scores
    analysis.adherence = totalChecks > 0 ? passedChecks / totalChecks : 1;
    analysis.consistency = this.calculateConsistencyScore(request);
    analysis.completeness = this.calculateCompletenessScore(request);

    // Generate suggestions
    analysis.suggestions = await this.generateSuggestions(analysis, request);

    // Identify missing guidelines
    analysis.missingGuidelines = this.identifyMissingGuidelines(request);

    return analysis;
  }

  private isGuidelineApplicable(guideline: BrandGuideline, request: ContentRequest): boolean {
    // Check if guideline applies to this type of content
    const applicabilityMap: { [key: string]: string[] } = {
      'colors': ['visual', 'layout', 'component'],
      'typography': ['text', 'layout', 'component'],
      'logo': ['visual', 'layout'],
      'imagery': ['visual'],
      'voice': ['text'],
      'layout': ['layout', 'component'],
      'spacing': ['layout', 'component'],
      'iconography': ['visual', 'component']
    };

    return applicabilityMap[guideline.category]?.includes(request.type) || false;
  }

  private async checkCompliance(
    guideline: BrandGuideline, 
    request: ContentRequest
  ): Promise<{
    passes: boolean;
    reason?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    suggestion?: string;
    affectedElements?: string[];
  }> {
    // This would be expanded with specific compliance checkers for each guideline type
    switch (guideline.category) {
      case 'colors':
        return this.checkColorCompliance(guideline, request);
      case 'typography':
        return this.checkTypographyCompliance(guideline, request);
      case 'spacing':
        return this.checkSpacingCompliance(guideline, request);
      default:
        return { passes: true };
    }
  }

  private checkColorCompliance(guideline: BrandGuideline, request: ContentRequest): any {
    // Color compliance checking logic
    if (request.type === 'visual' && guideline.rule === 'Primary color palette') {
      // Extract colors from content and check against palette
      const allowedColors = [
        guideline.value.primary,
        ...(guideline.value.secondary || [])
      ];

      // This would be more sophisticated in practice
      const contentColors = this.extractColorsFromContent(request.content);
      const violatingColors = contentColors.filter(color => !allowedColors.includes(color));

      if (violatingColors.length > 0) {
        return {
          passes: false,
          reason: `Unauthorized colors detected: ${violatingColors.join(', ')}`,
          severity: 'high' as const,
          suggestion: `Use approved brand colors: ${allowedColors.join(', ')}`,
          affectedElements: violatingColors
        };
      }
    }

    return { passes: true };
  }

  private checkTypographyCompliance(guideline: BrandGuideline, request: ContentRequest): any {
    // Typography compliance checking logic
    if (request.type === 'text' && guideline.rule === 'Primary font family') {
      const allowedFonts = [guideline.value.primary, ...(guideline.value.fallback || [])];
      const contentFonts = this.extractFontsFromContent(request.content);
      const violatingFonts = contentFonts.filter(font => !allowedFonts.includes(font));

      if (violatingFonts.length > 0) {
        return {
          passes: false,
          reason: `Unauthorized fonts detected: ${violatingFonts.join(', ')}`,
          severity: 'medium' as const,
          suggestion: `Use approved brand fonts: ${allowedFonts.join(', ')}`,
          affectedElements: violatingFonts
        };
      }
    }

    return { passes: true };
  }

  private checkSpacingCompliance(guideline: BrandGuideline, request: ContentRequest): any {
    // Spacing compliance checking logic
    if (request.type === 'layout' && guideline.rule === 'Base spacing unit') {
      const allowedSpacing = guideline.value.scale || [];
      const contentSpacing = this.extractSpacingFromContent(request.content);
      const violatingSpacing = contentSpacing.filter(spacing => !allowedSpacing.includes(spacing));

      if (violatingSpacing.length > 0) {
        return {
          passes: false,
          reason: `Non-standard spacing detected: ${violatingSpacing.join(', ')}px`,
          severity: 'low' as const,
          suggestion: `Use spacing scale: ${allowedSpacing.join(', ')}px`,
          affectedElements: violatingSpacing.map(s => `${s}px`)
        };
      }
    }

    return { passes: true };
  }

  private extractColorsFromContent(content: any): string[] {
    // Extract color values from content (CSS, SVG, etc.)
    const colors: string[] = [];
    const colorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g;
    
    const contentStr = JSON.stringify(content);
    const matches = contentStr.match(colorRegex);
    
    if (matches) {
      colors.push(...matches);
    }

    return [...new Set(colors)];
  }

  private extractFontsFromContent(content: any): string[] {
    // Extract font family values from content
    const fonts: string[] = [];
    const fontRegex = /font-family:\s*["']?([^;"']+)["']?/g;
    
    const contentStr = JSON.stringify(content);
    let match;
    
    while ((match = fontRegex.exec(contentStr)) !== null) {
      fonts.push(match[1].trim());
    }

    return [...new Set(fonts)];
  }

  private extractSpacingFromContent(content: any): number[] {
    // Extract spacing values from content
    const spacing: number[] = [];
    const spacingRegex = /(?:margin|padding|gap|top|right|bottom|left):\s*(\d+)px/g;
    
    const contentStr = JSON.stringify(content);
    let match;
    
    while ((match = spacingRegex.exec(contentStr)) !== null) {
      spacing.push(parseInt(match[1]));
    }

    return [...new Set(spacing)];
  }

  private calculateConsistencyScore(request: ContentRequest): number {
    // Calculate how consistent this content is with previous content
    const historicalContent = this.learningHistory.get(request.type) || [];
    if (historicalContent.length === 0) return 1;

    // This would implement more sophisticated consistency analysis
    return 0.8; // Placeholder
  }

  private calculateCompletenessScore(request: ContentRequest): number {
    // Calculate how complete the brand guidelines are for this content type
    const requiredGuidelines = this.getRequiredGuidelinesForContent(request.type);
    const existingGuidelines = Array.from(this.guidelines.values())
      .filter(g => requiredGuidelines.includes(g.category));
    
    return existingGuidelines.length / requiredGuidelines.length;
  }

  private getRequiredGuidelinesForContent(contentType: string): BrandGuideline['category'][] {
    const requirements: { [key: string]: BrandGuideline['category'][] } = {
      'text': ['typography', 'voice'],
      'visual': ['colors', 'imagery', 'logo'],
      'layout': ['spacing', 'layout', 'colors'],
      'component': ['colors', 'typography', 'spacing', 'iconography']
    };

    return requirements[contentType] || [];
  }

  private async generateSuggestions(analysis: BrandAnalysis, request: ContentRequest): Promise<string[]> {
    const suggestions: string[] = [];

    if (analysis.adherence < 0.8) {
      suggestions.push('Consider reviewing brand guidelines to improve compliance');
    }

    if (analysis.completeness < 0.5) {
      suggestions.push('Brand guidelines are incomplete for this content type');
    }

    if (analysis.violations.length > 0) {
      suggestions.push(`Address ${analysis.violations.length} brand violations`);
    }

    return suggestions;
  }

  private identifyMissingGuidelines(request: ContentRequest): string[] {
    const required = this.getRequiredGuidelinesForContent(request.type);
    const existing = Array.from(this.guidelines.values()).map(g => g.category);
    
    return required.filter(category => !existing.includes(category));
  }

  async learnFromCorrection(
    correctionType: 'color' | 'typography' | 'spacing' | 'general',
    oldValue: any,
    newValue: any,
    userInstruction: string,
    context: string
  ): Promise<void> {
    // Create or update guideline based on user correction
    const category = this.mapCorrectionToCategory(correctionType);
    const rule = this.inferRuleFromCorrection(correctionType, userInstruction);

    await this.setGuideline(category, rule, newValue, true, context);

    // Record learning event
    const learningEvent = {
      type: correctionType,
      oldValue,
      newValue,
      instruction: userInstruction,
      context,
      timestamp: new Date()
    };

    if (!this.learningHistory.has('corrections')) {
      this.learningHistory.set('corrections', []);
    }
    this.learningHistory.get('corrections')!.push(learningEvent);

    this.emit('brandLearned', learningEvent);
  }

  private mapCorrectionToCategory(correctionType: string): BrandGuideline['category'] {
    const mapping: { [key: string]: BrandGuideline['category'] } = {
      'color': 'colors',
      'typography': 'typography',
      'spacing': 'spacing',
      'general': 'layout'
    };

    return mapping[correctionType] || 'layout';
  }

  private inferRuleFromCorrection(correctionType: string, instruction: string): string {
    // Infer specific rule from user instruction
    const lowerInstruction = instruction.toLowerCase();

    if (lowerInstruction.includes('logo')) return 'Logo colors';
    if (lowerInstruction.includes('primary')) return 'Primary color';
    if (lowerInstruction.includes('background')) return 'Background colors';
    if (lowerInstruction.includes('text')) return 'Text colors';
    if (lowerInstruction.includes('font')) return 'Primary font family';
    if (lowerInstruction.includes('spacing')) return 'Base spacing unit';

    return `${correctionType} preference`;
  }

  generateBrandDocument(): string {
    const guidelines = Array.from(this.guidelines.values())
      .sort((a, b) => a.category.localeCompare(b.category));

    let document = `# Brand Guidelines\n\n`;
    
    if (this.projectContext) {
      document += `## Project: ${this.projectContext.name}\n`;
      document += `**Industry:** ${this.projectContext.industry}\n`;
      document += `**Target Audience:** ${this.projectContext.targetAudience}\n`;
      document += `**Purpose:** ${this.projectContext.purpose}\n\n`;
    }

    if (this.brandPersonality) {
      document += `## Brand Personality\n`;
      document += `- **Tone:** ${this.brandPersonality.tone}\n`;
      document += `- **Style:** ${this.brandPersonality.style}\n`;
      document += `- **Communication:** ${this.brandPersonality.communicationStyle}\n\n`;
    }

    const categorizedGuidelines = this.groupGuidelinesByCategory(guidelines);

    Object.entries(categorizedGuidelines).forEach(([category, items]) => {
      document += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      
      items.forEach(guideline => {
        const lockStatus = guideline.isLocked ? '🔒' : '📝';
        const confidence = Math.round(guideline.confidence * 100);
        
        document += `### ${lockStatus} ${guideline.rule} (${confidence}% confidence)\n`;
        document += `**Value:** ${JSON.stringify(guideline.value, null, 2)}\n`;
        document += `**Source:** ${guideline.source}\n`;
        document += `**Context:** ${guideline.context}\n`;
        document += `**Usage Count:** ${guideline.usageCount}\n\n`;
      });
    });

    const pendingChanges = Array.from(this.pendingChanges.values());
    if (pendingChanges.length > 0) {
      document += `## Pending Changes (Require Approval)\n\n`;
      pendingChanges.forEach(change => {
        document += `- **${change.rule}:** ${JSON.stringify(change.value)}\n`;
      });
      document += `\n`;
    }

    return document;
  }

  private groupGuidelinesByCategory(guidelines: BrandGuideline[]): { [key: string]: BrandGuideline[] } {
    return guidelines.reduce((groups, guideline) => {
      if (!groups[guideline.category]) {
        groups[guideline.category] = [];
      }
      groups[guideline.category].push(guideline);
      return groups;
    }, {} as { [key: string]: BrandGuideline[] });
  }

  private generateId(): string {
    return `brand-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveGuidelines(): Promise<void> {
    const data = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      projectContext: this.projectContext,
      brandPersonality: this.brandPersonality,
      guidelines: Array.from(this.guidelines.values()),
      learningHistory: Object.fromEntries(this.learningHistory),
      stats: {
        totalGuidelines: this.guidelines.size,
        lockedGuidelines: Array.from(this.guidelines.values()).filter(g => g.isLocked).length,
        pendingChanges: this.pendingChanges.size
      }
    };

    const guidelinesFile = path.join(this.guidelinesPath, 'brand-guidelines.json');
    fs.writeFileSync(guidelinesFile, JSON.stringify(data, null, 2));

    // Also generate human-readable brand document
    const brandDocument = this.generateBrandDocument();
    const documentFile = path.join(this.guidelinesPath, 'brand-document.md');
    fs.writeFileSync(documentFile, brandDocument);
  }

  private setupPeriodicAnalysis(): void {
    // Run brand consistency analysis daily
    setInterval(() => {
      this.runPeriodicAnalysis().catch(console.error);
    }, 24 * 60 * 60 * 1000);
  }

  private async runPeriodicAnalysis(): Promise<void> {
    const stats = this.getBrandStats();
    this.emit('periodicAnalysis', stats);
  }

  getBrandStats(): {
    totalGuidelines: number;
    lockedGuidelines: number;
    pendingChanges: number;
    averageConfidence: number;
    totalUsage: number;
    totalViolations: number;
    brandMaturity: string;
  } {
    const guidelines = Array.from(this.guidelines.values());
    
    return {
      totalGuidelines: guidelines.length,
      lockedGuidelines: guidelines.filter(g => g.isLocked).length,
      pendingChanges: this.pendingChanges.size,
      averageConfidence: guidelines.length > 0 
        ? guidelines.reduce((sum, g) => sum + g.confidence, 0) / guidelines.length 
        : 0,
      totalUsage: guidelines.reduce((sum, g) => sum + g.usageCount, 0),
      totalViolations: guidelines.reduce((sum, g) => sum + g.violations, 0),
      brandMaturity: this.projectContext?.brandMaturity || 'none'
    };
  }

  getPendingChanges(): BrandGuideline[] {
    return Array.from(this.pendingChanges.values());
  }

  getLockedGuidelines(): BrandGuideline[] {
    return Array.from(this.guidelines.values()).filter(g => g.isLocked);
  }
} 