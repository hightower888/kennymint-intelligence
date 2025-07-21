#!/usr/bin/env node

/**
 * 🧠 Cross-Project Learning Aggregator
 * 
 * Aggregates learning from ALL projects and leverages ALL backend systems:
 * - Analyzes patterns across all projects
 * - Generates insights and recommendations
 * - Shares learning with root intelligence
 * - Provides context-aware optimization
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class LearningAggregator {
  constructor() {
    this.rootPath = process.cwd();
    this.intelligencePath = '.intelligence/';
    this.backendLogicPath = 'RepoCloneMeta/backend-logic/';
    
    // Import ALL systems for aggregation
    this.allSystems = this.initializeAllSystems();
    
    console.log(chalk.magenta.bold('🧠 Learning Aggregator Initialized'));
    console.log(chalk.gray('Aggregating learning from ALL projects...'));
  }

  /**
   * Initialize all backend systems for aggregation
   */
  initializeAllSystems() {
    const systems = {
      // Self-Improving Systems (for learning aggregation)
      continuousLearning: this.tryImport('self-improving/continuous-learning'),
      mistakeLearning: this.tryImport('self-improving/mistake-learning-engine'),
      projectEvolution: this.tryImport('self-improving/project-evolution'),
      marketAnalysis: this.tryImport('self-improving/market-analysis'),
      enhancedLearning: this.tryImport('self-improving/enhanced-continuous-learning'),
      
      // Next-Level Systems (for advanced aggregation)
      predictiveIntelligence: this.tryImport('next-level/predictive-intelligence'),
      autonomousTeam: this.tryImport('next-level/autonomous-team'),
      masterSystem: this.tryImport('next-level/master-system'),
      
      // AI Systems (for pattern analysis)
      aiCoordinator: this.tryImport('ai-systems/ai-coordinator'),
      knowledgeGraph: this.tryImport('ai-systems/knowledge-graph/knowledge-graph-engine'),
      
      // Core Systems
      coreEngine: this.tryImport('core-engine')
    };

    return systems;
  }

  /**
   * Try to import a system (graceful fallback if not available)
   */
  tryImport(systemPath) {
    try {
      const fullPath = path.join(this.backendLogicPath, systemPath);
      if (fs.existsSync(fullPath + '.ts') || fs.existsSync(fullPath + '.js')) {
        return require(fullPath);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all projects at root level
   */
  async getAllProjects() {
    const projects = [];
    const items = fs.readdirSync(this.rootPath);
    
    for (const item of items) {
      const fullPath = path.join(this.rootPath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        // Check if it's a project (has package.json or is not a system directory)
        const isSystemDir = ['.git', '.hooks', '.intelligence', 'node_modules', 'RepoCloneMeta', 'scripts'].includes(item);
        if (!isSystemDir && !item.startsWith('.')) {
          projects.push(item);
        }
      }
    }
    
    return projects;
  }

  /**
   * Aggregate learning from ALL projects using ALL systems
   */
  async aggregateAllProjectLearning() {
    console.log(chalk.blue('\n🧠 Aggregating Learning from ALL Projects...'));
    
    const projects = await this.getAllProjects();
    const allLearning = {};

    console.log(chalk.gray(`Found ${projects.length} projects to analyze`));

    for (const project of projects) {
      console.log(chalk.gray(`\n📊 Analyzing project: ${project}`));
      const projectLearning = await this.analyzeProjectWithAllSystems(project);
      allLearning[project] = projectLearning;
    }

    // Use ALL systems to analyze cross-project patterns
    const crossProjectPatterns = await this.analyzeCrossProjectPatternsWithAllSystems(allLearning);
    
    // Save aggregated learning
    await this.saveAggregatedLearning(crossProjectPatterns);
    
    return crossProjectPatterns;
  }

  /**
   * Analyze project using ALL systems
   */
  async analyzeProjectWithAllSystems(projectPath) {
    const analysis = {
      project: projectPath,
      timestamp: new Date(),
      systems: {},
      patterns: [],
      insights: [],
      recommendations: []
    };
    
    // Analyze with each available system
    for (const [systemName, system] of Object.entries(this.allSystems)) {
      if (system) {
        try {
          console.log(chalk.gray(`   Analyzing with ${systemName}...`));
          
          if (typeof system.analyzeProject === 'function') {
            analysis.systems[systemName] = await system.analyzeProject(projectPath);
          } else if (typeof system.analyze === 'function') {
            analysis.systems[systemName] = await system.analyze(projectPath);
          } else {
            analysis.systems[systemName] = { status: 'analysis_not_supported' };
          }
          
          console.log(chalk.green(`   ✅ ${systemName} analysis complete`));
        } catch (error) {
          console.log(chalk.yellow(`   ⚠️  ${systemName} analysis failed: ${error.message}`));
          analysis.systems[systemName] = { error: error.message };
        }
      }
    }
    
    return analysis;
  }

  /**
   * Analyze cross-project patterns using ALL systems
   */
  async analyzeCrossProjectPatternsWithAllSystems(allLearning) {
    console.log(chalk.blue('\n🔍 Analyzing Cross-Project Patterns...'));
    
    const patterns = {
      timestamp: new Date(),
      totalProjects: Object.keys(allLearning).length,
      industryPatterns: {},
      audiencePatterns: {},
      commonMistakes: [],
      optimizationOpportunities: [],
      predictiveInsights: [],
      recommendations: []
    };
    
    // Use continuous learning system
    if (this.allSystems.continuousLearning) {
      try {
        console.log(chalk.gray('   Extracting patterns with continuous learning...'));
        const learningPatterns = await this.allSystems.continuousLearning.extractPatterns(allLearning);
        patterns.learningPatterns = learningPatterns;
      } catch (error) {
        console.log(chalk.yellow(`   ⚠️  Continuous learning analysis failed: ${error.message}`));
      }
    }
    
    // Use mistake learning system
    if (this.allSystems.mistakeLearning) {
      try {
        console.log(chalk.gray('   Analyzing mistakes with mistake learning...'));
        const mistakePatterns = await this.allSystems.mistakeLearning.analyzeMistakes(allLearning);
        patterns.commonMistakes = mistakePatterns;
      } catch (error) {
        console.log(chalk.yellow(`   ⚠️  Mistake learning analysis failed: ${error.message}`));
      }
    }
    
    // Use project evolution system
    if (this.allSystems.projectEvolution) {
      try {
        console.log(chalk.gray('   Analyzing evolution with project evolution...'));
        const evolutionPatterns = await this.allSystems.projectEvolution.analyzeEvolution(allLearning);
        patterns.evolutionPatterns = evolutionPatterns;
      } catch (error) {
        console.log(chalk.yellow(`   ⚠️  Project evolution analysis failed: ${error.message}`));
      }
    }
    
    // Use market analysis system
    if (this.allSystems.marketAnalysis) {
      try {
        console.log(chalk.gray('   Analyzing market patterns...'));
        const marketPatterns = await this.allSystems.marketAnalysis.analyzeMarket(allLearning);
        patterns.industryPatterns = marketPatterns;
      } catch (error) {
        console.log(chalk.yellow(`   ⚠️  Market analysis failed: ${error.message}`));
      }
    }
    
    // Use predictive intelligence system
    if (this.allSystems.predictiveIntelligence) {
      try {
        console.log(chalk.gray('   Generating predictive insights...'));
        const predictions = await this.allSystems.predictiveIntelligence.predictOutcomes(allLearning);
        patterns.predictiveInsights = predictions;
      } catch (error) {
        console.log(chalk.yellow(`   ⚠️  Predictive intelligence failed: ${error.message}`));
      }
    }
    
    // Generate recommendations
    patterns.recommendations = await this.generateRecommendations(patterns);
    
    return patterns;
  }

  /**
   * Generate recommendations based on aggregated patterns
   */
  async generateRecommendations(patterns) {
    const recommendations = [];
    
    // Industry-specific recommendations
    if (patterns.industryPatterns) {
      for (const [industry, industryData] of Object.entries(patterns.industryPatterns)) {
        recommendations.push({
          type: 'industry',
          industry: industry,
          recommendation: `Optimize for ${industry} industry patterns`,
          confidence: industryData.confidence || 0.8
        });
      }
    }
    
    // Mistake-based recommendations
    if (patterns.commonMistakes && patterns.commonMistakes.length > 0) {
      recommendations.push({
        type: 'prevention',
        recommendation: 'Implement mistake prevention strategies',
        mistakes: patterns.commonMistakes.slice(0, 3),
        confidence: 0.9
      });
    }
    
    // Optimization recommendations
    if (patterns.optimizationOpportunities && patterns.optimizationOpportunities.length > 0) {
      recommendations.push({
        type: 'optimization',
        recommendation: 'Apply cross-project optimizations',
        opportunities: patterns.optimizationOpportunities.slice(0, 3),
        confidence: 0.85
      });
    }
    
    return recommendations;
  }

  /**
   * Generate recommendations based on aggregated patterns
   */
  async generateRecommendations(patterns) {
    const recommendations = [];
    
    // Industry-specific recommendations
    if (patterns.industryPatterns) {
      for (const [industry, industryData] of Object.entries(patterns.industryPatterns)) {
        recommendations.push({
          type: 'industry',
          industry: industry,
          recommendation: `Optimize for ${industry} industry patterns`,
          confidence: industryData.confidence || 0.8
        });
      }
    }
    
    // Mistake-based recommendations
    if (patterns.commonMistakes && patterns.commonMistakes.length > 0) {
      recommendations.push({
        type: 'prevention',
        recommendation: 'Implement mistake prevention strategies',
        mistakes: patterns.commonMistakes.slice(0, 3),
        confidence: 0.9
      });
    }
    
    // Optimization recommendations
    if (patterns.optimizationOpportunities && patterns.optimizationOpportunities.length > 0) {
      recommendations.push({
        type: 'optimization',
        recommendation: 'Apply cross-project optimizations',
        opportunities: patterns.optimizationOpportunities.slice(0, 3),
        confidence: 0.85
      });
    }
    
    return recommendations;
  }

  /**
   * Save aggregated learning to root intelligence
   */
  async saveAggregatedLearning(patterns) {
    const learningDataPath = path.join(this.intelligencePath, 'learning-data');
    
    // Ensure directory exists
    if (!fs.existsSync(learningDataPath)) {
      fs.mkdirSync(learningDataPath, { recursive: true });
    }
    
    // Save cross-project patterns
    const patternsPath = path.join(learningDataPath, 'cross-project-patterns.json');
    fs.writeFileSync(patternsPath, JSON.stringify(patterns, null, 2));
    
    // Save insights
    const insightsPath = path.join(learningDataPath, 'project-insights.json');
    fs.writeFileSync(insightsPath, JSON.stringify(patterns, null, 2));
    
    console.log(chalk.green('✅ Aggregated learning saved to root intelligence'));
  }

  /**
   * Share insights with all projects
   */
  async shareInsightsWithAllProjects(insights) {
    console.log(chalk.blue('\n📤 Sharing Insights with All Projects...'));
    
    const projects = await this.getAllProjects();
    let sharedProjects = 0;
    
    for (const project of projects) {
      try {
        const projectPath = path.join(this.rootPath, project);
        const insightsPath = path.join(projectPath, '.intelligence', 'cross-project-insights.json');
        
        // Ensure project intelligence directory exists
        const projectIntelligencePath = path.join(projectPath, '.intelligence');
        if (!fs.existsSync(projectIntelligencePath)) {
          fs.mkdirSync(projectIntelligencePath, { recursive: true });
        }
        
        // Save insights to project
        fs.writeFileSync(insightsPath, JSON.stringify(insights, null, 2));
        
        sharedProjects++;
        console.log(chalk.green(`   ✅ Shared with ${project}`));
      } catch (error) {
        console.log(chalk.yellow(`   ⚠️  Failed to share with ${project}: ${error.message}`));
      }
    }
    
    console.log(chalk.green(`\n✅ Shared insights with ${sharedProjects} projects`));
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    const availableSystems = Object.entries(this.allSystems)
      .filter(([, system]) => system !== null)
      .map(([name]) => name);
    
    return {
      availableSystems: availableSystems.length,
      systems: availableSystems,
      totalSystems: Object.keys(this.allSystems).length
    };
  }
}

// Export the learning aggregator
module.exports = LearningAggregator;

// If run directly, aggregate learning
if (require.main === module) {
  const aggregator = new LearningAggregator();
  
  aggregator.aggregateAllProjectLearning()
    .then(patterns => {
      console.log(chalk.green('\n🎉 Learning aggregation complete!'));
      console.log(chalk.gray(`   Analyzed ${patterns.totalProjects} projects`));
      console.log(chalk.gray(`   Generated ${patterns.recommendations.length} recommendations`));
      
      return aggregator.shareInsightsWithAllProjects(patterns);
    })
    .then(() => {
      console.log(chalk.green('\n✅ All insights shared with projects'));
    })
    .catch(error => {
      console.error(chalk.red('\n❌ Learning aggregation failed:'), error);
    });
} 