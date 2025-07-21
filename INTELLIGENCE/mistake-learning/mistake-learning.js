/**
 * 🧠 Mistake Learning Engine
 * 
 * Advanced AI-powered mistake learning system that:
 * - Records and analyzes mistakes and errors
 * - Learns from errors to prevent recurrence
 * - Provides proactive error prevention
 * - Improves system reliability over time
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class MistakeLearningEngine extends EventEmitter {
  constructor() {
    super();
    this.mistakeRecords = new Map();
    this.mappingMemories = new Map();
    this.structureMemories = new Map();
    this.preventionRules = new Map();
    this.learningInsights = new Map();
    
    this.learningRate = 0.1;
    this.confidenceThreshold = 80;
    this.isLearning = false;

    this.startLearningLoop();
    this.loadKnowledgeBase();
  }

  /**
   * 📝 Record Mistake
   */
  async recordMistake(context, errorDetails, attemptedSolution) {
    const mistakeId = `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mistakeRecord = {
      id: mistakeId,
      timestamp: new Date(),
      type: this.classifyMistakeType(errorDetails, context),
      category: this.classifyMistakeCategory(context),
      context,
      errorDetails,
      attemptedSolution,
      correctSolution: await this.findCorrectSolution(context, errorDetails),
      impact: await this.assessImpact(errorDetails, context),
      learningPattern: await this.extractLearningPattern(context, errorDetails, attemptedSolution),
      preventionRule: await this.generatePreventionRule(context, errorDetails),
      confidence: 85, // Initial confidence
      verified: false,
      recurrenceCount: 1
    };

    // Check for existing similar mistakes
    const existingMistake = await this.findSimilarMistake(mistakeRecord);
    if (existingMistake) {
      existingMistake.recurrenceCount++;
      existingMistake.impact.developmentTime += mistakeRecord.impact.developmentTime;
      this.mistakeRecords.set(existingMistake.id, existingMistake);
      console.log(`⚠️ Recurring mistake detected: ${existingMistake.learningPattern.pattern}`);
    } else {
      this.mistakeRecords.set(mistakeId, mistakeRecord);
    }

    // Update mapping memory if it's a mapping error
    if (mistakeRecord.type === 'mapping_error' || mistakeRecord.type === 'field_name_error') {
      await this.updateMappingMemory(mistakeRecord);
    }

    // Update structure memory if it's a structure error
    if (mistakeRecord.type === 'structure_error') {
      await this.updateStructureMemory(mistakeRecord);
    }

    // Generate or update prevention rules
    await this.updatePreventionRules(mistakeRecord);

    // Learn from the mistake
    await this.learnFromMistake(mistakeRecord);

    this.emit('mistakeRecorded', mistakeRecord);
    
    console.log(`🔍 Mistake recorded and learned: ${mistakeRecord.learningPattern.pattern}`);
    return mistakeId;
  }

  /**
   * 🔍 Check for Potential Mistakes
   */
  async checkForPotentialMistake(context, proposedSolution) {
    // Check against all prevention rules
    const applicableRules = await this.findApplicableRules(context);
    
    for (const rule of applicableRules) {
      const violation = await this.checkRuleViolation(rule, context, proposedSolution);
      if (violation) {
        return {
          shouldPrevent: true,
          rule: rule,
          confidence: violation.confidence,
          reasoning: violation.reasoning,
          alternatives: violation.alternatives,
          historicalEvidence: violation.evidence
        };
      }
    }

    // Check mapping predictions
    if (context.operation.includes('mapping') || context.operation.includes('field')) {
      const mappingIssue = await this.predictMappingIssue(context, proposedSolution);
      if (mappingIssue) {
        return mappingIssue;
      }
    }

    // Check structure predictions
    if (context.operation.includes('structure') || context.operation.includes('create')) {
      const structureIssue = await this.predictStructureIssue(context, proposedSolution);
      if (structureIssue) {
        return structureIssue;
      }
    }

    return {
      shouldPrevent: false,
      confidence: 95,
      reasoning: 'No potential issues detected based on historical learning'
    };
  }

  /**
   * 💡 Get Suggested Correction
   */
  async getSuggestedCorrection(context, errorType) {
    // Find similar past mistakes
    const similarMistakes = await this.findSimilarMistakesByContext(context, errorType);
    
    if (similarMistakes.length === 0) {
      return {
        suggestion: 'No similar mistakes found in knowledge base. Proceed with standard debugging.',
        confidence: 30,
        reasoning: 'Insufficient historical data',
        steps: ['Analyze error details', 'Check documentation', 'Test incrementally']
      };
    }

    // Analyze successful solutions
    const successfulSolutions = similarMistakes
      .filter(m => m.correctSolution && m.verified)
      .sort((a, b) => b.confidence - a.confidence);

    if (successfulSolutions.length > 0) {
      const bestSolution = successfulSolutions[0];
      
      return {
        suggestion: bestSolution.correctSolution.approach,
        confidence: Math.min(95, bestSolution.confidence + (successfulSolutions.length * 5)),
        reasoning: bestSolution.correctSolution.reasoning,
        steps: bestSolution.correctSolution.verificationSteps,
        codeExample: bestSolution.correctSolution.finalCode,
        avoidance: bestSolution.attemptedSolution.failureReason,
        relatedIssues: similarMistakes.map(m => m.learningPattern.pattern)
      };
    }

    return {
      suggestion: 'Similar issues found but no verified solutions. Proceed with caution.',
      confidence: 60,
      reasoning: 'Historical data available but solutions not yet verified',
      steps: ['Review similar cases', 'Apply learned patterns', 'Validate thoroughly']
    };
  }

  /**
   * 🗺️ Get Field Mapping Guidance
   */
  async getFieldMappingGuidance(sourceSchema, targetSchema, sourceField) {
    const mappingKey = `${sourceSchema}_to_${targetSchema}`;
    const mappingMemory = this.mappingMemories.get(mappingKey);

    if (!mappingMemory) {
      return {
        suggestedMapping: null,
        confidence: 0,
        reasoning: 'No mapping history found',
        alternatives: [],
        warnings: []
      };
    }

    // Find exact matches first
    const exactMatch = mappingMemory.correctMappings.find(m => 
      m.sourceField === sourceField || 
      mappingMemory.sourceSchema.fields.find(f => f.name === sourceField && f.aliases.includes(m.sourceField))
    );

    if (exactMatch) {
      return {
        suggestedMapping: exactMatch.targetField,
        confidence: exactMatch.confidence,
        reasoning: `Based on ${exactMatch.usageCount} successful mappings with ${exactMatch.successRate}% success rate`,
        alternatives: this.findAlternativeMappings(mappingMemory, sourceField),
        warnings: this.getFieldMappingWarnings(mappingMemory, sourceField),
        transformation: exactMatch.transformation,
        validation: exactMatch.validation,
        examples: exactMatch.examples.slice(0, 3)
      };
    }

    // Use AI to predict best mapping
    const prediction = await this.predictBestMapping(mappingMemory, sourceField);
    
    return {
      suggestedMapping: prediction.targetField,
      confidence: prediction.confidence,
      reasoning: prediction.reasoning,
      alternatives: prediction.alternatives,
      warnings: prediction.warnings
    };
  }

  /**
   * 🏗️ Get Structure Guidance
   */
  async getStructureGuidance(structureType, context) {
    const structureKey = `${structureType}_${context}`;
    const structureMemory = this.structureMemories.get(structureKey);

    if (!structureMemory) {
      return {
        suggestedStructure: null,
        confidence: 0,
        reasoning: 'No structure patterns found',
        template: null,
        warnings: []
      };
    }

    return {
      suggestedStructure: structureMemory.correctStructure,
      confidence: structureMemory.reliability,
      reasoning: `Based on proven pattern with ${structureMemory.reliability}% success rate`,
      template: structureMemory.correctStructure.template,
      warnings: structureMemory.incorrectAttempts.map(ia => ia.problems).flat(),
      bestPractices: structureMemory.bestPractices,
      antiPatterns: structureMemory.antiPatterns,
      namingGuidance: structureMemory.correctStructure.naming
    };
  }

  /**
   * 🔄 Start Learning Loop
   */
  startLearningLoop() {
    // Continuous learning from accumulated mistakes
    setInterval(async () => {
      if (!this.isLearning && this.mistakeRecords.size > 0) {
        await this.performDeepLearning();
      }
    }, 1800000); // 30 minutes

    // Pattern analysis
    setInterval(async () => {
      await this.analyzePatterns();
    }, 3600000); // 1 hour

    // Model retraining
    setInterval(async () => {
      await this.retrainModels();
    }, 86400000); // 24 hours
  }

  /**
   * 📚 Load Knowledge Base
   */
  async loadKnowledgeBase() {
    // Load common mistake patterns and mapping memories
    await this.loadCommonMistakePatterns();
    await this.loadCommonMappingPatterns();
    await this.loadCommonStructurePatterns();
    console.log('📚 Knowledge base loaded with common patterns');
  }

  /**
   * 📋 Load Common Mistake Patterns
   */
  async loadCommonMistakePatterns() {
    // Load pre-defined common mistake patterns
    const commonPatterns = [
      {
        pattern: 'Incorrect API field mapping',
        prevention: 'Always verify field names match API documentation',
        alternatives: ['Check API docs', 'Use schema validation', 'Test with sample data']
      },
      {
        pattern: 'Missing required fields in form validation',
        prevention: 'Cross-reference form fields with backend requirements',
        alternatives: ['Generate validation from schema', 'Use TypeScript interfaces']
      },
      {
        pattern: 'Database column name mismatch',
        prevention: 'Use ORM field mappings or verify column names',
        alternatives: ['Use migrations', 'Check database schema', 'Use descriptive names']
      }
    ];

    // Convert to prevention rules
    for (const pattern of commonPatterns) {
      const ruleId = `common_${pattern.pattern.toLowerCase().replace(/\s+/g, '_')}`;
      this.preventionRules.set(ruleId, {
        id: ruleId,
        name: pattern.pattern,
        description: pattern.prevention,
        trigger: {
          conditions: [],
          logicOperator: 'OR',
          minimumConfidence: 70
        },
        action: {
          type: 'warn',
          message: pattern.prevention,
          alternatives: pattern.alternatives,
          confidence: 80
        },
        priority: 80,
        enabled: true,
        successRate: 85,
        falsePositiveRate: 15
      });
    }
  }

  /**
   * 🗺️ Load Common Mapping Patterns
   */
  async loadCommonMappingPatterns() {
    // Load common field mapping patterns
    const commonMappings = [
      {
        source: 'user_api',
        target: 'user_form',
        mappings: [
          { source: 'firstName', target: 'first_name', confidence: 95 },
          { source: 'lastName', target: 'last_name', confidence: 95 },
          { source: 'emailAddress', target: 'email', confidence: 90 },
          { source: 'phoneNumber', target: 'phone', confidence: 85 }
        ]
      },
      {
        source: 'database_user',
        target: 'api_response',
        mappings: [
          { source: 'id', target: 'userId', confidence: 100 },
          { source: 'email', target: 'emailAddress', confidence: 95 },
          { source: 'created_at', target: 'createdDate', confidence: 90 }
        ]
      }
    ];

    for (const mapping of commonMappings) {
      const mappingKey = `${mapping.source}_to_${mapping.target}`;
      this.mappingMemories.set(mappingKey, {
        id: mappingKey,
        sourceSchema: { name: mapping.source, type: 'api', version: '1.0', fields: [], relationships: [], constraints: [] },
        targetSchema: { name: mapping.target, type: 'api', version: '1.0', fields: [], relationships: [], constraints: [] },
        correctMappings: mapping.mappings.map(m => ({
          sourceField: m.source,
          targetField: m.target,
          confidence: m.confidence,
          usageCount: 10,
          successRate: m.confidence,
          examples: []
        })),
        incorrectMappings: [],
        contextualRules: [],
        validationRules: [],
        lastUpdated: new Date(),
        successRate: 90,
        usageCount: 50
      });
    }
  }

  /**
   * 🏗️ Load Common Structure Patterns
   */
  async loadCommonStructurePatterns() {
    // Load common code structure patterns
    const commonStructures = [
      {
        pattern: 'react_component',
        template: `import React from 'react';

interface {ComponentName}Props {
  // Props interface
}

const {ComponentName}: React.FC<{ComponentName}Props> = ({ /* props */ }) => {
  // Component logic
  
  return (
    // JSX
  );
};

export default {ComponentName};`,
        naming: { style: 'PascalCase', forbiddenWords: [], preferredWords: [], contextualRules: [] }
      },
      {
        pattern: 'api_endpoint',
        template: `export async function handle{Method}{Resource}(req: Request, res: Response) {
  try {
    // Validation
    
    // Business logic
    
    // Response
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}`,
        naming: { style: 'camelCase', forbiddenWords: [], preferredWords: [], contextualRules: [] }
      }
    ];

    for (const structure of commonStructures) {
      this.structureMemories.set(structure.pattern, {
        id: structure.pattern,
        pattern: structure.pattern,
        correctStructure: {
          name: structure.pattern,
          type: 'component',
          template: structure.template,
          requiredElements: ['imports', 'interface', 'component', 'export'],
          optionalElements: ['hooks', 'helpers'],
          ordering: ['imports', 'interface', 'component', 'export'],
          naming: structure.naming,
          dependencies: [],
          testPattern: ''
        },
        incorrectAttempts: [],
        bestPractices: [],
        antiPatterns: [],
        contextualGuidance: [],
        lastUpdated: new Date(),
        reliability: 90
      });
    }
  }

  // Helper methods for mistake classification and analysis
  classifyMistakeType(errorDetails, context) {
    if (errorDetails.originalError.includes('field') || errorDetails.originalError.includes('property')) {
      return 'field_name_error';
    }
    if (errorDetails.originalError.includes('mapping') || errorDetails.originalError.includes('transform')) {
      return 'mapping_error';
    }
    if (errorDetails.originalError.includes('structure') || errorDetails.originalError.includes('syntax')) {
      return 'structure_error';
    }
    return 'logic_error';
  }

  classifyMistakeCategory(context) {
    if (context.operation.includes('api')) return 'api_integration';
    if (context.operation.includes('database')) return 'database_schema';
    if (context.operation.includes('ui') || context.operation.includes('component')) return 'ui_components';
    if (context.operation.includes('mapping')) return 'field_mapping';
    return 'code_generation';
  }

  async findCorrectSolution(context, errorDetails) {
    // This would implement logic to find or derive the correct solution
    return {
      approach: 'Corrected approach based on error analysis',
      reasoning: 'Analysis of error patterns and context',
      finalCode: '',
      keyInsights: [],
      criticalFactors: [],
      verificationSteps: [],
      testsCovering: [],
      documentation: '',
      timeToSolution: 30
    };
  }

  async assessImpact(errorDetails, context) {
    const severityMultiplier = { low: 1, medium: 2, high: 4, critical: 8 };
    const baseCost = severityMultiplier[errorDetails.severity] * 0.5;
    
    return {
      developmentTime: baseCost,
      deploymentDelay: errorDetails.severity === 'critical' ? baseCost * 2 : 0,
      userImpact: context.environment === 'production' ? 'major' : 'minor',
      businessCost: baseCost * 100,
      technicalDebt: severityMultiplier[errorDetails.severity] * 10,
      teamMorale: -severityMultiplier[errorDetails.severity] * 5,
      learning: severityMultiplier[errorDetails.severity] * 15
    };
  }

  async extractLearningPattern(context, errorDetails, attemptedSolution) {
    return {
      id: `pattern_${Date.now()}`,
      pattern: `${errorDetails.errorType} in ${context.operation}`,
      abstraction: `General pattern: ${errorDetails.errorType}`,
      applicability: [context.businessContext?.domain || 'general'],
      conditions: [
        {
          condition: 'operation_type',
          operator: 'equals',
          value: context.operation,
          weight: 80
        }
      ],
      warningSignals: errorDetails.symptoms,
      preventionTechniques: [attemptedSolution.failureReason],
      relatedPatterns: [],
      confidence: 75
    };
  }

  async generatePreventionRule(context, errorDetails) {
    return {
      id: `rule_${Date.now()}`,
      name: `Prevent ${errorDetails.errorType}`,
      description: `Prevents recurring ${errorDetails.errorType} in ${context.operation}`,
      trigger: {
        conditions: [
          {
            field: 'operation',
            operator: 'equals',
            value: context.operation,
            weight: 90
          }
        ],
        logicOperator: 'AND',
        minimumConfidence: 70
      },
      action: {
        type: 'warn',
        message: `Warning: This operation previously caused ${errorDetails.errorType}`,
        confidence: 80
      },
      priority: 70,
      enabled: true,
      successRate: 0,
      falsePositiveRate: 0
    };
  }

  async findSimilarMistake(mistake) {
    for (const [id, existing] of this.mistakeRecords) {
      if (existing.type === mistake.type && 
          existing.context.operation === mistake.context.operation &&
          existing.errorDetails.errorType === mistake.errorDetails.errorType) {
        return existing;
      }
    }
    return null;
  }

  async updateMappingMemory(mistake) {
    // Update mapping memory with new mistake information
    const mappingKey = `${mistake.context.component}_mapping`;
    let mappingMemory = this.mappingMemories.get(mappingKey);
    
    if (!mappingMemory) {
      mappingMemory = {
        id: mappingKey,
        sourceSchema: { name: '', type: 'object', version: '1.0', fields: [], relationships: [], constraints: [] },
        targetSchema: { name: '', type: 'object', version: '1.0', fields: [], relationships: [], constraints: [] },
        correctMappings: [],
        incorrectMappings: [],
        contextualRules: [],
        validationRules: [],
        lastUpdated: new Date(),
        successRate: 100,
        usageCount: 0
      };
    }

    // Add incorrect mapping
    if (mistake.type === 'mapping_error' || mistake.type === 'field_name_error') {
      mappingMemory.incorrectMappings.push({
        attemptedSourceField: mistake.context.inputData?.sourceField || '',
        attemptedTargetField: mistake.context.inputData?.targetField || '',
        reason: mistake.errorDetails.originalError,
        errorMessage: mistake.errorDetails.originalError,
        frequency: 1,
        lastAttempted: new Date(),
        consequences: mistake.errorDetails.symptoms
      });
    }

    mappingMemory.lastUpdated = new Date();
    this.mappingMemories.set(mappingKey, mappingMemory);
  }

  async updateStructureMemory(mistake) {
    // Update structure memory with new mistake information
    const structureKey = `${mistake.context.codeContext?.functionName || 'unknown'}_structure`;
    let structureMemory = this.structureMemories.get(structureKey);
    
    if (!structureMemory) {
      structureMemory = {
        id: structureKey,
        pattern: mistake.context.operation,
        correctStructure: {
          name: '',
          type: 'function',
          template: '',
          requiredElements: [],
          optionalElements: [],
          ordering: [],
          naming: { style: 'camelCase', forbiddenWords: [], preferredWords: [], contextualRules: [] },
          dependencies: [],
          testPattern: ''
        },
        incorrectAttempts: [],
        bestPractices: [],
        antiPatterns: [],
        contextualGuidance: [],
        lastUpdated: new Date(),
        reliability: 100
      };
    }

    // Add incorrect structure attempt
    structureMemory.incorrectAttempts.push({
      attemptedStructure: mistake.context.codeContext?.codeSnippet || '',
      problems: mistake.errorDetails.symptoms,
      corrections: [mistake.attemptedSolution.failureReason],
      frequency: 1,
      impact: mistake.errorDetails.severity,
      lastAttempted: new Date()
    });

    structureMemory.lastUpdated = new Date();
    this.structureMemories.set(structureKey, structureMemory);
  }

  async updatePreventionRules(mistake) {
    // Update or create prevention rules based on the mistake
    const existingRule = this.preventionRules.get(mistake.preventionRule.id);
    
    if (existingRule) {
      // Update existing rule with new evidence
      existingRule.successRate = (existingRule.successRate + mistake.confidence) / 2;
      existingRule.priority = Math.min(100, existingRule.priority + 5);
    } else {
      // Add new prevention rule
      this.preventionRules.set(mistake.preventionRule.id, mistake.preventionRule);
    }
  }

  async learnFromMistake(mistake) {
    // Extract learning insights from the mistake
    const insights = await this.extractInsights(mistake);
    
    for (const insight of insights) {
      this.learningInsights.set(insight.id, insight);
    }

    // Update AI models with new data
    await this.updateModelsWithMistake(mistake);
  }

  async extractInsights(mistake) {
    return [
      {
        id: `insight_${Date.now()}`,
        type: 'pattern_discovery',
        description: `New pattern discovered: ${mistake.learningPattern.pattern}`,
        evidence: [mistake.errorDetails.originalError],
        confidence: mistake.confidence,
        actionable: true,
        impact: mistake.impact.learning,
        timestamp: new Date(),
        validation: {
          method: 'statistical',
          result: 'pending',
          confidence: 70,
          evidence: []
        }
      }
    ];
  }

  async updateModelsWithMistake(mistake) {
    // This would update the AI models with new training data
    console.log(`🔄 Updating models with mistake pattern: ${mistake.learningPattern.pattern}`);
  }

  // Placeholder implementations for complex methods
  async findApplicableRules(context) { return []; }
  async checkRuleViolation(rule, context, solution) { return null; }
  async predictMappingIssue(context, solution) { return null; }
  async predictStructureIssue(context, solution) { return null; }
  async findSimilarMistakesByContext(context, errorType) { return []; }
  findAlternativeMappings(memory, sourceField) { return []; }
  getFieldMappingWarnings(memory, sourceField) { return []; }
  async predictBestMapping(memory, sourceField) { return {}; }
  async performDeepLearning() { console.log('🧠 Performing deep learning analysis...'); }
  async analyzePatterns() { console.log('🔍 Analyzing mistake patterns...'); }
  async retrainModels() { console.log('🔄 Retraining models with new data...'); }

  /**
   * 📊 Public API Methods
   */
  async getMistakeHistory(projectId, category) {
    let mistakes = Array.from(this.mistakeRecords.values());
    
    if (projectId) {
      mistakes = mistakes.filter(m => m.context.projectId === projectId);
    }
    
    if (category) {
      mistakes = mistakes.filter(m => m.category === category);
    }
    
    return mistakes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getPreventionRules() {
    return Array.from(this.preventionRules.values())
      .filter(r => r.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  async getMappingMemories() {
    return Array.from(this.mappingMemories.values())
      .sort((a, b) => b.successRate - a.successRate);
  }

  async getStructureMemories() {
    return Array.from(this.structureMemories.values())
      .sort((a, b) => b.reliability - a.reliability);
  }

  async getLearningInsights() {
    return Array.from(this.learningInsights.values())
      .filter(i => i.actionable)
      .sort((a, b) => b.impact - a.impact);
  }

  async getEffectivenessMetrics() {
    const totalMistakes = this.mistakeRecords.size;
    const recurringMistakes = Array.from(this.mistakeRecords.values())
      .filter(m => m.recurrenceCount > 1).length;
    
    const preventionEffectiveness = totalMistakes > 0 ? 
      ((totalMistakes - recurringMistakes) / totalMistakes) * 100 : 100;

    return {
      totalMistakesRecorded: totalMistakes,
      recurringMistakes,
      preventionEffectiveness,
      rulesGenerated: this.preventionRules.size,
      mappingAccuracy: this.calculateMappingAccuracy(),
      structureReliability: this.calculateStructureReliability(),
      learningInsights: this.learningInsights.size
    };
  }

  calculateMappingAccuracy() {
    const memories = Array.from(this.mappingMemories.values());
    if (memories.length === 0) return 100;
    
    const totalSuccessRate = memories.reduce((sum, m) => sum + m.successRate, 0);
    return totalSuccessRate / memories.length;
  }

  calculateStructureReliability() {
    const memories = Array.from(this.structureMemories.values());
    if (memories.length === 0) return 100;
    
    const totalReliability = memories.reduce((sum, m) => sum + m.reliability, 0);
    return totalReliability / memories.length;
  }

  /**
   * 🧠 Self-Awareness Check
   */
  async checkSelfAwareness() {
    return {
      identity: 'Mistake Learning Engine',
      purpose: 'Learn from errors and prevent recurrence through pattern analysis and proactive prevention',
      capabilities: [
        'Mistake recording and analysis',
        'Pattern recognition and learning',
        'Proactive error prevention',
        'Mapping guidance and validation',
        'Structure guidance and best practices',
        'Prevention rule generation',
        'Learning insight extraction'
      ],
      status: 'Active'
    };
  }

  /**
   * 📊 Health Report
   */
  async getHealthReport() {
    const metrics = await this.getEffectivenessMetrics();
    
    return {
      status: 'Healthy',
      totalMistakes: metrics.totalMistakesRecorded,
      preventionEffectiveness: metrics.preventionEffectiveness,
      rulesGenerated: metrics.rulesGenerated,
      mappingAccuracy: metrics.mappingAccuracy,
      structureReliability: metrics.structureReliability,
      learningInsights: metrics.learningInsights,
      lastUpdated: new Date(),
      performance: {
        mistakesPrevented: metrics.totalMistakesRecorded - metrics.recurringMistakes,
        preventionRate: metrics.preventionEffectiveness,
        averageConfidence: this.calculateAverageConfidence()
      }
    };
  }

  /**
   * 📈 Calculate Average Confidence
   */
  calculateAverageConfidence() {
    if (this.mistakeRecords.size === 0) return 0;
    
    const mistakes = Array.from(this.mistakeRecords.values());
    const totalConfidence = mistakes.reduce((sum, mistake) => sum + mistake.confidence, 0);
    return Math.round(totalConfidence / mistakes.length);
  }
}

module.exports = MistakeLearningEngine; 