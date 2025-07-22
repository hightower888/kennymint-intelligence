import { EventEmitter } from 'events';
import * as tf from '@tensorflow/tfjs-node';

interface MarketAnalysis {
  id: string;
  timestamp: Date;
  industry: string;
  marketSize: number;
  growthRate: number;
  competitivePosition: CompetitivePosition;
  trends: MarketTrend[];
  opportunities: MarketOpportunity[];
  threats: MarketThreat[];
  recommendations: MarketRecommendation[];
  confidenceScore: number;
}

interface CompetitivePosition {
  ranking: number; // 1-10 where 1 is market leader
  marketShare: number; // percentage
  strengths: string[];
  weaknesses: string[];
  differentiators: string[];
  competitors: CompetitorAnalysis[];
  competitiveAdvantages: CompetitiveAdvantage[];
  vulnerabilities: string[];
}

interface CompetitorAnalysis {
  id: string;
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  recentMoves: CompetitorMove[];
  funding: FundingInfo;
  technology: TechnologyStack;
  userBase: UserBaseInfo;
  pricing: PricingStrategy;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface CompetitorMove {
  date: Date;
  type: 'product_launch' | 'acquisition' | 'funding' | 'partnership' | 'expansion';
  description: string;
  impact: number; // 0-100
  response: string; // Our potential response
}

interface FundingInfo {
  totalRaised: number;
  lastRound: string;
  lastRoundAmount: number;
  lastRoundDate: Date;
  investors: string[];
  valuation: number;
}

interface TechnologyStack {
  frontend: string[];
  backend: string[];
  infrastructure: string[];
  ai_ml: string[];
  modernityScore: number; // 0-100
}

interface UserBaseInfo {
  size: number;
  growthRate: number; // monthly %
  demographics: Record<string, any>;
  satisfaction: number; // 0-100
  churnRate: number; // monthly %
}

interface PricingStrategy {
  model: 'freemium' | 'subscription' | 'one-time' | 'usage-based' | 'enterprise';
  tiers: PricingTier[];
  averageRevenue: number;
  pricePosition: 'budget' | 'mid-market' | 'premium' | 'enterprise';
}

interface PricingTier {
  name: string;
  price: number;
  features: string[];
  limitations: string[];
  targetSegment: string;
}

interface CompetitiveAdvantage {
  id: string;
  category: 'technology' | 'market' | 'operational' | 'financial' | 'strategic';
  description: string;
  sustainability: number; // 0-100 how hard to replicate
  impact: number; // 0-100 market impact
  timeToMarket: number; // months to achieve
  investmentRequired: number; // estimated cost
}

interface MarketTrend {
  id: string;
  name: string;
  category: 'technology' | 'consumer' | 'regulatory' | 'economic' | 'social';
  direction: 'rising' | 'declining' | 'stable' | 'volatile';
  strength: number; // 0-100
  timeframe: 'short' | 'medium' | 'long'; // <1yr, 1-3yr, >3yr
  impact: TrendImpact;
  confidence: number; // 0-100
  sources: string[];
}

interface TrendImpact {
  market: number; // -100 to 100
  technology: number; // -100 to 100
  userBehavior: number; // -100 to 100
  competition: number; // -100 to 100
  regulation: number; // -100 to 100
}

interface MarketOpportunity {
  id: string;
  type: 'market_gap' | 'emerging_trend' | 'competitor_weakness' | 'new_segment' | 'technology_shift';
  description: string;
  marketSize: number;
  timeline: string;
  probability: number; // 0-100
  impact: number; // 0-100
  effort: number; // 0-100
  priority: number; // calculated score
  requirements: string[];
  risks: string[];
  successMetrics: string[];
}

interface MarketThreat {
  id: string;
  type: 'new_competitor' | 'technology_disruption' | 'regulatory' | 'economic' | 'consumer_shift';
  description: string;
  probability: number; // 0-100
  impact: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeline: string;
  mitigation: string[];
  earlyWarnings: string[];
}

interface MarketRecommendation {
  id: string;
  category: 'product' | 'marketing' | 'technology' | 'business_model' | 'strategy';
  title: string;
  description: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // 0-100
  effort: number; // 0-100
  timeline: string;
  success_probability: number; // 0-100
  dependencies: string[];
  metrics: string[];
}

interface IndustryData {
  name: string;
  marketSize: number;
  growthRate: number;
  keyPlayers: string[];
  barriers: string[];
  drivers: string[];
  keyMetrics: Record<string, number>;
  regulations: string[];
  trends: string[];
}

class MarketLeadershipAnalysisEngine extends EventEmitter {
  private analyses: Map<string, MarketAnalysis> = new Map();
  private competitorData: Map<string, CompetitorAnalysis> = new Map();
  private industryData: Map<string, IndustryData> = new Map();
  private trends: Map<string, MarketTrend> = new Map();
  
  // AI Models
  private marketPredictionModel: tf.LayersModel | null = null;
  private competitorAnalysisModel: tf.LayersModel | null = null;
  private trendAnalysisModel: tf.LayersModel | null = null;
  private opportunityModel: tf.LayersModel | null = null;
  
  private isAnalyzing: boolean = false;
  private analysisInterval: number = 3600000; // 1 hour
  private dataUpdateInterval: number = 21600000; // 6 hours

  constructor() {
    super();
    this.initializeModels();
    this.startAnalysisLoop();
  }

  private async initializeModels(): Promise<void> {
    try {
      this.marketPredictionModel = await this.createMarketPredictionModel();
      this.competitorAnalysisModel = await this.createCompetitorAnalysisModel();
      this.trendAnalysisModel = await this.createTrendAnalysisModel();
      this.opportunityModel = await this.createOpportunityModel();
      
      console.log('📈 Market Leadership Analysis Engine initialized');
    } catch (error) {
      console.error('Failed to initialize market analysis models:', error);
    }
  }

  private async createMarketPredictionModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [150], units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 10, activation: 'sigmoid' }) // Market metrics
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });

    return model;
  }

  private async createCompetitorAnalysisModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [100], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.25 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'softmax' }) // Threat levels
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private async createTrendAnalysisModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [80], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'sigmoid' }) // Trend impacts
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });

    return model;
  }

  private async createOpportunityModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [60], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Opportunity score
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private startAnalysisLoop(): void {
    // Regular market analysis
    setInterval(async () => {
      if (!this.isAnalyzing) {
        await this.performMarketAnalysis();
      }
    }, this.analysisInterval);

    // Data updates
    setInterval(async () => {
      await this.updateMarketData();
    }, this.dataUpdateInterval);

    // Immediate competitor monitoring
    setInterval(async () => {
      await this.monitorCompetitors();
    }, 1800000); // 30 minutes
  }

  async analyzeMarket(projectDomain: string, projectData?: any): Promise<MarketAnalysis> {
    const analysis: MarketAnalysis = {
      id: `market_analysis_${Date.now()}`,
      timestamp: new Date(),
      industry: projectDomain,
      marketSize: await this.getMarketSize(projectDomain),
      growthRate: await this.getGrowthRate(projectDomain),
      competitivePosition: await this.analyzeCompetitivePosition(projectDomain, projectData),
      trends: await this.analyzeMarketTrends(projectDomain),
      opportunities: await this.identifyOpportunities(projectDomain),
      threats: await this.identifyThreats(projectDomain),
      recommendations: await this.generateRecommendations(projectDomain),
      confidenceScore: 0
    };

    // Calculate confidence score
    analysis.confidenceScore = this.calculateAnalysisConfidence(analysis);

    // Store analysis
    this.analyses.set(analysis.id, analysis);

    this.emit('marketAnalysisComplete', analysis);
    return analysis;
  }

  private async getMarketSize(industry: string): Promise<number> {
    const industryData = this.industryData.get(industry);
    if (industryData) {
      return industryData.marketSize;
    }

    // Use AI model to estimate market size
    const features = this.extractIndustryFeatures(industry);
    if (this.marketPredictionModel) {
      const prediction = this.marketPredictionModel.predict(
        tf.tensor2d([features])
      ) as tf.Tensor;
      
      const marketMetrics = await prediction.data();
      return marketMetrics[0] * 1000000000; // Convert to actual market size
    }

    return 1000000000; // Default 1B market
  }

  private async getGrowthRate(industry: string): Promise<number> {
    const industryData = this.industryData.get(industry);
    if (industryData) {
      return industryData.growthRate;
    }

    // Industry-specific growth rate estimation
    const growthRates: Record<string, number> = {
      'ai-ml': 25,
      'fintech': 20,
      'healthcare': 15,
      'e-commerce': 18,
      'saas': 22,
      'cybersecurity': 12,
      'iot': 28,
      'blockchain': 30
    };

    return growthRates[industry] || 10; // Default 10%
  }

  private async analyzeCompetitivePosition(domain: string, projectData?: any): Promise<CompetitivePosition> {
    const competitors = await this.identifyCompetitors(domain);
    const competitorAnalyses = await this.analyzeCompetitors(competitors);
    
    const position: CompetitivePosition = {
      ranking: await this.calculateMarketRanking(domain, competitorAnalyses),
      marketShare: await this.estimateMarketShare(domain, competitorAnalyses),
      strengths: await this.identifyStrengths(projectData),
      weaknesses: await this.identifyWeaknesses(projectData),
      differentiators: await this.identifyDifferentiators(projectData),
      competitors: competitorAnalyses,
      competitiveAdvantages: await this.identifyCompetitiveAdvantages(domain),
      vulnerabilities: await this.identifyVulnerabilities(competitorAnalyses)
    };

    return position;
  }

  private async identifyCompetitors(domain: string): Promise<string[]> {
    // Domain-specific competitor identification
    const competitorMap: Record<string, string[]> = {
      'ai-ml': ['OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI', 'Amazon AI'],
      'fintech': ['Stripe', 'Square', 'PayPal', 'Plaid', 'Robinhood'],
      'e-commerce': ['Shopify', 'WooCommerce', 'Magento', 'BigCommerce', 'Amazon'],
      'saas': ['Salesforce', 'HubSpot', 'Zendesk', 'Slack', 'Zoom'],
      'healthcare': ['Epic', 'Cerner', 'Allscripts', 'athenahealth', 'Veracyte']
    };

    return competitorMap[domain] || ['Generic Competitor 1', 'Generic Competitor 2'];
  }

  private async analyzeCompetitors(competitors: string[]): Promise<CompetitorAnalysis[]> {
    const analyses: CompetitorAnalysis[] = [];
    
    for (const competitor of competitors) {
      const analysis = await this.analyzeCompetitor(competitor);
      analyses.push(analysis);
    }
    
    return analyses;
  }

  private async analyzeCompetitor(competitor: string): Promise<CompetitorAnalysis> {
    // Get or create competitor analysis
    let analysis = this.competitorData.get(competitor);
    
    if (!analysis) {
      analysis = await this.createCompetitorAnalysis(competitor);
      this.competitorData.set(competitor, analysis);
    }
    
    // Update with latest data
    analysis = await this.updateCompetitorAnalysis(analysis);
    
    return analysis;
  }

  private async createCompetitorAnalysis(competitor: string): Promise<CompetitorAnalysis> {
    return {
      id: `competitor_${competitor.toLowerCase().replace(/\s+/g, '_')}`,
      name: competitor,
      marketShare: await this.estimateCompetitorMarketShare(competitor),
      strengths: await this.identifyCompetitorStrengths(competitor),
      weaknesses: await this.identifyCompetitorWeaknesses(competitor),
      recentMoves: await this.getRecentCompetitorMoves(competitor),
      funding: await this.getCompetitorFunding(competitor),
      technology: await this.analyzeCompetitorTechnology(competitor),
      userBase: await this.analyzeCompetitorUserBase(competitor),
      pricing: await this.analyzeCompetitorPricing(competitor),
      threatLevel: await this.assessThreatLevel(competitor)
    };
  }

  private async analyzeMarketTrends(domain: string): Promise<MarketTrend[]> {
    const trends: MarketTrend[] = [];
    
    // Get domain-specific trends
    const domainTrends = await this.getDomainTrends(domain);
    trends.push(...domainTrends);
    
    // Get global technology trends
    const techTrends = await this.getTechnologyTrends();
    trends.push(...techTrends);
    
    // Use AI to predict emerging trends
    const predictedTrends = await this.predictEmergingTrends(domain);
    trends.push(...predictedTrends);
    
    return this.rankTrendsByImpact(trends);
  }

  private async identifyOpportunities(domain: string): Promise<MarketOpportunity[]> {
    const opportunities: MarketOpportunity[] = [];
    
    // Market gap analysis
    const gapOpportunities = await this.findMarketGaps(domain);
    opportunities.push(...gapOpportunities);
    
    // Emerging trend opportunities
    const trendOpportunities = await this.findTrendOpportunities(domain);
    opportunities.push(...trendOpportunities);
    
    // Competitor weakness opportunities
    const competitorOpportunities = await this.findCompetitorWeaknessOpportunities(domain);
    opportunities.push(...competitorOpportunities);
    
    // Technology shift opportunities
    const techOpportunities = await this.findTechnologyOpportunities(domain);
    opportunities.push(...techOpportunities);
    
    return this.prioritizeOpportunities(opportunities);
  }

  private async identifyThreats(domain: string): Promise<MarketThreat[]> {
    const threats: MarketThreat[] = [];
    
    // Competitive threats
    const competitiveThreats = await this.identifyCompetitiveThreats(domain);
    threats.push(...competitiveThreats);
    
    // Technology disruption threats
    const techThreats = await this.identifyTechnologyThreats(domain);
    threats.push(...techThreats);
    
    // Regulatory threats
    const regulatoryThreats = await this.identifyRegulatoryThreats(domain);
    threats.push(...regulatoryThreats);
    
    // Market shift threats
    const marketThreats = await this.identifyMarketShiftThreats(domain);
    threats.push(...marketThreats);
    
    return this.prioritizeThreats(threats);
  }

  private async generateRecommendations(domain: string): Promise<MarketRecommendation[]> {
    const recommendations: MarketRecommendation[] = [];
    
    // Strategic recommendations
    const strategicRecs = await this.generateStrategicRecommendations(domain);
    recommendations.push(...strategicRecs);
    
    // Product recommendations
    const productRecs = await this.generateProductRecommendations(domain);
    recommendations.push(...productRecs);
    
    // Technology recommendations
    const techRecs = await this.generateTechnologyRecommendations(domain);
    recommendations.push(...techRecs);
    
    // Marketing recommendations
    const marketingRecs = await this.generateMarketingRecommendations(domain);
    recommendations.push(...marketingRecs);
    
    return this.prioritizeRecommendations(recommendations);
  }

  private async performMarketAnalysis(): Promise<void> {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    
    try {
      console.log('📊 Performing comprehensive market analysis...');
      
      // Update all industry data
      await this.updateAllIndustryData();
      
      // Refresh competitor data
      await this.refreshCompetitorData();
      
      // Update market trends
      await this.updateMarketTrends();
      
      // Generate new insights
      const insights = await this.generateMarketInsights();
      
      this.emit('marketAnalysisUpdate', insights);
      
    } catch (error) {
      console.error('Error performing market analysis:', error);
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async updateMarketData(): Promise<void> {
    console.log('🔄 Updating market data...');
    
    // Update industry data from external sources
    await this.fetchLatestIndustryData();
    
    // Update competitor information
    await this.fetchLatestCompetitorData();
    
    // Update trend data
    await this.fetchLatestTrendData();
    
    this.emit('marketDataUpdated');
  }

  private async monitorCompetitors(): Promise<void> {
    console.log('👀 Monitoring competitor activities...');
    
    for (const [competitorId, competitor] of this.competitorData) {
      const updates = await this.checkCompetitorUpdates(competitor);
      
      if (updates.length > 0) {
        // Update competitor data
        competitor.recentMoves.push(...updates);
        
        // Reassess threat level
        competitor.threatLevel = await this.assessThreatLevel(competitor.name);
        
        this.competitorData.set(competitorId, competitor);
        
        this.emit('competitorUpdate', { competitor: competitor.name, updates });
      }
    }
  }

  // Placeholder implementations for complex methods
  private extractIndustryFeatures(industry: string): number[] {
    return new Array(150).fill(0).map(() => Math.random());
  }

  private async calculateMarketRanking(domain: string, competitors: CompetitorAnalysis[]): Promise<number> {
    // Calculate ranking based on market share, funding, user base, etc.
    return Math.floor(Math.random() * 10) + 1;
  }

  private async estimateMarketShare(domain: string, competitors: CompetitorAnalysis[]): Promise<number> {
    // Estimate our market share
    return Math.random() * 10; // 0-10%
  }

  private async identifyStrengths(projectData?: any): Promise<string[]> {
    return ['Innovation', 'Technical Excellence', 'User Experience'];
  }

  private async identifyWeaknesses(projectData?: any): Promise<string[]> {
    return ['Limited Market Presence', 'Resource Constraints'];
  }

  private async identifyDifferentiators(projectData?: any): Promise<string[]> {
    return ['Unique Technology', 'Superior Performance'];
  }

  private async identifyCompetitiveAdvantages(domain: string): Promise<CompetitiveAdvantage[]> {
    return [];
  }

  private async identifyVulnerabilities(competitors: CompetitorAnalysis[]): Promise<string[]> {
    return ['Market Consolidation Risk', 'Technology Disruption'];
  }

  // Additional placeholder methods...
  private async estimateCompetitorMarketShare(competitor: string): Promise<number> { return Math.random() * 20; }
  private async identifyCompetitorStrengths(competitor: string): Promise<string[]> { return []; }
  private async identifyCompetitorWeaknesses(competitor: string): Promise<string[]> { return []; }
  private async getRecentCompetitorMoves(competitor: string): Promise<CompetitorMove[]> { return []; }
  private async getCompetitorFunding(competitor: string): Promise<FundingInfo> { 
    return { totalRaised: 0, lastRound: 'Series A', lastRoundAmount: 0, lastRoundDate: new Date(), investors: [], valuation: 0 };
  }
  private async analyzeCompetitorTechnology(competitor: string): Promise<TechnologyStack> { 
    return { frontend: [], backend: [], infrastructure: [], ai_ml: [], modernityScore: 75 };
  }
  private async analyzeCompetitorUserBase(competitor: string): Promise<UserBaseInfo> { 
    return { size: 1000000, growthRate: 10, demographics: {}, satisfaction: 80, churnRate: 5 };
  }
  private async analyzeCompetitorPricing(competitor: string): Promise<PricingStrategy> { 
    return { model: 'subscription', tiers: [], averageRevenue: 50, pricePosition: 'mid-market' };
  }
  private async assessThreatLevel(competitor: string): Promise<'low' | 'medium' | 'high' | 'critical'> { return 'medium'; }
  private async updateCompetitorAnalysis(analysis: CompetitorAnalysis): Promise<CompetitorAnalysis> { return analysis; }
  private async getDomainTrends(domain: string): Promise<MarketTrend[]> { return []; }
  private async getTechnologyTrends(): Promise<MarketTrend[]> { return []; }
  private async predictEmergingTrends(domain: string): Promise<MarketTrend[]> { return []; }
  private rankTrendsByImpact(trends: MarketTrend[]): MarketTrend[] { return trends; }
  private async findMarketGaps(domain: string): Promise<MarketOpportunity[]> { return []; }
  private async findTrendOpportunities(domain: string): Promise<MarketOpportunity[]> { return []; }
  private async findCompetitorWeaknessOpportunities(domain: string): Promise<MarketOpportunity[]> { return []; }
  private async findTechnologyOpportunities(domain: string): Promise<MarketOpportunity[]> { return []; }
  private prioritizeOpportunities(opportunities: MarketOpportunity[]): MarketOpportunity[] { return opportunities; }
  private async identifyCompetitiveThreats(domain: string): Promise<MarketThreat[]> { return []; }
  private async identifyTechnologyThreats(domain: string): Promise<MarketThreat[]> { return []; }
  private async identifyRegulatoryThreats(domain: string): Promise<MarketThreat[]> { return []; }
  private async identifyMarketShiftThreats(domain: string): Promise<MarketThreat[]> { return []; }
  private prioritizeThreats(threats: MarketThreat[]): MarketThreat[] { return threats; }
  private async generateStrategicRecommendations(domain: string): Promise<MarketRecommendation[]> { return []; }
  private async generateProductRecommendations(domain: string): Promise<MarketRecommendation[]> { return []; }
  private async generateTechnologyRecommendations(domain: string): Promise<MarketRecommendation[]> { return []; }
  private async generateMarketingRecommendations(domain: string): Promise<MarketRecommendation[]> { return []; }
  private prioritizeRecommendations(recommendations: MarketRecommendation[]): MarketRecommendation[] { return recommendations; }
  private async updateAllIndustryData(): Promise<void> {}
  private async refreshCompetitorData(): Promise<void> {}
  private async updateMarketTrends(): Promise<void> {}
  private async generateMarketInsights(): Promise<any> { return {}; }
  private async fetchLatestIndustryData(): Promise<void> {}
  private async fetchLatestCompetitorData(): Promise<void> {}
  private async fetchLatestTrendData(): Promise<void> {}
  private async checkCompetitorUpdates(competitor: CompetitorAnalysis): Promise<CompetitorMove[]> { return []; }
  
  private calculateAnalysisConfidence(analysis: MarketAnalysis): number {
    let confidence = 50;
    
    if (analysis.competitivePosition.competitors.length > 3) confidence += 20;
    if (analysis.trends.length > 5) confidence += 15;
    if (analysis.opportunities.length > 0) confidence += 10;
    if (analysis.marketSize > 0) confidence += 5;
    
    return Math.min(confidence, 100);
  }

  // Public API methods
  async getLatestAnalysis(industry?: string): Promise<MarketAnalysis | null> {
    const analyses = Array.from(this.analyses.values());
    const filtered = industry ? analyses.filter(a => a.industry === industry) : analyses;
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }

  async getCompetitorAnalysis(competitor: string): Promise<CompetitorAnalysis | null> {
    return this.competitorData.get(competitor) || null;
  }

  async getTrendAnalysis(category?: string): Promise<MarketTrend[]> {
    const trends = Array.from(this.trends.values());
    return category ? trends.filter(t => t.category === category) : trends;
  }

  async getMarketOpportunities(domain: string): Promise<MarketOpportunity[]> {
    const analysis = await this.getLatestAnalysis(domain);
    return analysis ? analysis.opportunities : [];
  }

  async getMarketThreats(domain: string): Promise<MarketThreat[]> {
    const analysis = await this.getLatestAnalysis(domain);
    return analysis ? analysis.threats : [];
  }

  async getMarketRecommendations(domain: string): Promise<MarketRecommendation[]> {
    const analysis = await this.getLatestAnalysis(domain);
    return analysis ? analysis.recommendations : [];
  }
}

export default MarketLeadershipAnalysisEngine;
export {
  MarketAnalysis,
  CompetitivePosition,
  CompetitorAnalysis,
  MarketTrend,
  MarketOpportunity,
  MarketThreat,
  MarketRecommendation,
  CompetitiveAdvantage
}; 