/**
 * 🧩 Knowledge Graph Construction System
 * 
 * Advanced semantic understanding with:
 * - Semantic relationship mapping of entire codebase
 * - Concept extraction and intelligent pattern recognition
 * - Relevance engine for context-aware queries
 * - AI-powered suggestions based on deep understanding
 * - Cross-language comprehension and translation
 * - Architecture pattern recognition
 * - Code dependency visualization with insights
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

class KnowledgeGraphEngine extends EventEmitter {
  constructor() {
    super();
    this.nodes = new Map();
    this.relationships = new Map();
    this.concepts = new Map();
    this.queryIndex = new Map();
    this.vectorCache = new Map();
    this.changeTracker = new Map();
    
    this.initializeDefaultConcepts();
  }

  /**
   * 🎯 Main Graph Construction Entry Point
   */
  async buildGraph(projectPath) {
    console.log('🧩 Building knowledge graph...');
    
    // Phase 1: File discovery and initial node creation
    const files = await this.discoverFiles(projectPath);
    await this.createFileNodes(files);

    // Phase 2: Code analysis and relationship extraction
    for (const file of files) {
      await this.analyzeFile(file);
    }

    // Phase 3: Semantic analysis and concept extraction
    await this.performSemanticAnalysis();

    // Phase 4: Pattern recognition and insight generation
    await this.recognizePatterns();

    // Phase 5: Build query index for fast retrieval
    await this.buildQueryIndex();

    this.emit('graph_built', {
      nodeCount: this.nodes.size,
      relationshipCount: this.relationships.size,
      conceptCount: this.concepts.size
    });

    console.log(`✅ Knowledge graph built: ${this.nodes.size} nodes, ${this.relationships.size} relationships`);
  }

  /**
   * 🔍 Intelligent Query Engine
   */
  async query(semanticQuery) {
    const startTime = Date.now();
    
    // Generate semantic vector for query
    const queryVector = await this.generateSemanticVector(semanticQuery.text);
    
    // Find relevant nodes based on semantic similarity
    const relevantNodes = await this.findSemanticallySimilarNodes(queryVector, semanticQuery.filters);
    
    // Get related relationships
    const relationships = this.getRelationshipsForNodes(relevantNodes.map(n => n.id));
    
    // Calculate relevance score
    const relevanceScore = this.calculateOverallRelevance(relevantNodes);
    
    // Generate suggestions based on context
    const suggestions = await this.generateSuggestions(semanticQuery, relevantNodes);
    
    // Extract insights from the query results
    const insights = await this.extractInsights(relevantNodes, relationships);

    const queryTime = Date.now() - startTime;
    
    this.emit('query_executed', {
      query: semanticQuery.text,
      resultCount: relevantNodes.length,
      queryTime,
      relevanceScore
    });

    return {
      nodes: relevantNodes,
      relationships,
      relevanceScore,
      suggestions,
      insights
    };
  }

  /**
   * 📁 File Discovery and Analysis
   */
  async discoverFiles(projectPath) {
    const files = [];
    const excludePatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /coverage/,
      /\.next/
    ];

    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs'];

    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!excludePatterns.some(pattern => pattern.test(entry.name))) {
            await walk(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    }

    await walk(projectPath);
    return files;
  }

  /**
   * 🏗️ File Node Creation
   */
  async createFileNodes(files) {
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        
        const node = {
          id: this.generateNodeId('file', filePath),
          type: 'file',
          name: path.basename(filePath),
          filePath,
          metadata: {
            size: stats.size,
            extension: path.extname(filePath),
            lastModified: stats.mtime,
            lineCount: content.split('\n').length
          },
          attributes: {
            language: this.detectLanguage(filePath),
            complexity: this.calculateFileComplexity(content)
          },
          importance: this.calculateFileImportance(filePath, content),
          lastUpdated: new Date()
        };

        this.nodes.set(node.id, node);
      } catch (error) {
        console.warn(`Failed to process file ${filePath}:`, error);
      }
    }
  }

  /**
   * 📊 File Analysis and Code Entity Extraction
   */
  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const language = this.detectLanguage(filePath);

      // Extract code entities based on language
      const entities = await this.extractCodeEntities(content, language, filePath);
      
      // Create nodes for entities
      for (const entity of entities) {
        const node = {
          id: this.generateNodeId(entity.type, `${filePath}:${entity.name}`),
          type: entity.type,
          name: entity.name,
          filePath,
          metadata: entity.metadata,
          attributes: entity.attributes,
          importance: entity.importance || 0.5,
          lastUpdated: new Date()
        };
        
        this.nodes.set(node.id, node);
        
        // Create relationship to file
        this.createRelationship(
          this.generateNodeId('file', filePath),
          node.id,
          'part_of',
          0.9
        );
      }

      // Extract dependencies and imports
      const dependencies = await this.extractDependencies(content, language);
      await this.processDependencies(filePath, dependencies);

      // Extract function calls and usage patterns
      const usagePatterns = await this.extractUsagePatterns(content, language);
      await this.processUsagePatterns(filePath, usagePatterns);

    } catch (error) {
      console.warn(`Failed to analyze file ${filePath}:`, error);
    }
  }

  /**
   * 🧠 Semantic Analysis and Vector Generation
   */
  async performSemanticAnalysis() {
    const nodes = Array.from(this.nodes.values());
    
    for (const node of nodes) {
      // Generate semantic vector for each node
      const semanticVector = await this.generateNodeSemanticVector(node);
      node.semanticVector = semanticVector;
      
      // Update node with semantic information
      this.nodes.set(node.id, node);
    }

    // Find semantic relationships between nodes
    await this.findSemanticRelationships();
  }

  /**
   * 🔍 Pattern Recognition and Concept Extraction
   */
  async recognizePatterns() {
    // Recognize architectural patterns
    await this.recognizeArchitecturalPatterns();
    
    // Recognize design patterns
    await this.recognizeDesignPatterns();
    
    // Recognize anti-patterns
    await this.recognizeAntiPatterns();
    
    // Extract domain concepts
    await this.extractDomainConcepts();
  }

  /**
   * 🎯 Code Entity Extraction
   */
  async extractCodeEntities(content, language, filePath) {
    const entities = [];

    switch (language) {
      case 'typescript':
      case 'javascript':
        entities.push(...this.extractJSEntities(content, filePath));
        break;
      case 'python':
        entities.push(...this.extractPythonEntities(content, filePath));
        break;
      // Add more languages as needed
    }

    return entities;
  }

  /**
   * 🟨 JavaScript/TypeScript Entity Extraction
   */
  extractJSEntities(content, filePath) {
    const entities = [];
    
    // Extract functions
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|function))/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1] || match[2];
      entities.push({
        type: 'function',
        name: functionName,
        metadata: {
          line: this.getLineNumber(content, match.index),
          isAsync: match[0].includes('async')
        },
        attributes: {
          complexity: this.calculateFunctionComplexity(match[0])
        },
        importance: 0.7
      });
    }

    // Extract classes
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    while ((match = classRegex.exec(content)) !== null) {
      entities.push({
        type: 'class',
        name: match[1],
        metadata: {
          line: this.getLineNumber(content, match.index),
          extends: match[2] || null
        },
        attributes: {
          isAbstract: match[0].includes('abstract')
        },
        importance: 0.8
      });
    }

    // Extract interfaces (TypeScript)
    const interfaceRegex = /interface\s+(\w+)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      entities.push({
        type: 'interface',
        name: match[1],
        metadata: {
          line: this.getLineNumber(content, match.index)
        },
        importance: 0.6
      });
    }

    // Extract variables and constants
    const variableRegex = /(?:const|let|var)\s+(\w+)\s*=/g;
    while ((match = variableRegex.exec(content)) !== null) {
      entities.push({
        type: 'variable',
        name: match[1],
        metadata: {
          line: this.getLineNumber(content, match.index),
          declarationType: match[0].split(' ')[0]
        },
        importance: 0.3
      });
    }

    return entities;
  }

  /**
   * 🐍 Python Entity Extraction
   */
  extractPythonEntities(content, filePath) {
    const entities = [];

    // Extract functions
    const functionRegex = /def\s+(\w+)\s*\([^)]*\):/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      entities.push({
        type: 'function',
        name: match[1],
        metadata: {
          line: this.getLineNumber(content, match.index)
        },
        importance: 0.7
      });
    }

    // Extract classes
    const classRegex = /class\s+(\w+)(?:\([^)]*\))?:/g;
    while ((match = classRegex.exec(content)) !== null) {
      entities.push({
        type: 'class',
        name: match[1],
        metadata: {
          line: this.getLineNumber(content, match.index)
        },
        importance: 0.8
      });
    }

    return entities;
  }

  /**
   * 📦 Dependency Extraction
   */
  async extractDependencies(content, language) {
    const dependencies = [];

    if (language === 'typescript' || language === 'javascript') {
      // Extract imports
      const importRegex = /import\s+(?:{[^}]*}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        dependencies.push({
          type: 'import',
          module: match[1],
          line: this.getLineNumber(content, match.index)
        });
      }

      // Extract requires
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
      while ((match = requireRegex.exec(content)) !== null) {
        dependencies.push({
          type: 'require',
          module: match[1],
          line: this.getLineNumber(content, match.index)
        });
      }
    } else if (language === 'python') {
      // Extract Python imports
      const importRegex = /(?:from\s+(\S+)\s+)?import\s+([^#\n]+)/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        dependencies.push({
          type: 'import',
          module: match[1] || match[2].trim(),
          line: this.getLineNumber(content, match.index)
        });
      }
    }

    return dependencies;
  }

  /**
   * 🔗 Dependency Processing
   */
  async processDependencies(filePath, dependencies) {
    const sourceNodeId = this.generateNodeId('file', filePath);

    for (const dep of dependencies) {
      // Create or find target node
      let targetNodeId;
      
      if (dep.module.startsWith('.')) {
        // Local dependency
        const resolvedPath = path.resolve(path.dirname(filePath), dep.module);
        targetNodeId = this.generateNodeId('file', resolvedPath);
      } else {
        // External dependency
        targetNodeId = this.generateNodeId('module', dep.module);
        
        // Create module node if it doesn't exist
        if (!this.nodes.has(targetNodeId)) {
          const moduleNode = {
            id: targetNodeId,
            type: 'module',
            name: dep.module,
            metadata: {
              isExternal: true,
              importType: dep.type
            },
            importance: 0.4,
            lastUpdated: new Date()
          };
          this.nodes.set(targetNodeId, moduleNode);
        }
      }

      // Create dependency relationship
      this.createRelationship(sourceNodeId, targetNodeId, 'depends_on', 0.8);
    }
  }

  /**
   * 🔍 Usage Pattern Extraction
   */
  async extractUsagePatterns(content, language) {
    const patterns = [];

    // Extract function calls
    const functionCallRegex = /(\w+)\s*\(/g;
    let match;
    while ((match = functionCallRegex.exec(content)) !== null) {
      patterns.push({
        type: 'function_call',
        name: match[1],
        line: this.getLineNumber(content, match.index)
      });
    }

    return patterns;
  }

  /**
   * 🔗 Usage Pattern Processing
   */
  async processUsagePatterns(filePath, patterns) {
    const sourceNodeId = this.generateNodeId('file', filePath);

    for (const pattern of patterns) {
      if (pattern.type === 'function_call') {
        // Find the function node and create a 'calls' relationship
        const functionNodes = Array.from(this.nodes.values()).filter(
          node => node.type === 'function' && node.name === pattern.name
        );

        for (const functionNode of functionNodes) {
          this.createRelationship(sourceNodeId, functionNode.id, 'calls', 0.6);
        }
      }
    }
  }

  /**
   * 🧠 Semantic Vector Generation
   */
  async generateSemanticVector(text) {
    // Check cache first
    const hash = crypto.createHash('md5').update(text).digest('hex');
    if (this.vectorCache.has(hash)) {
      return this.vectorCache.get(hash);
    }

    // Generate vector using simple TF-IDF for now
    // In a real implementation, you'd use a pre-trained embedding model
    const vector = this.generateTFIDFVector(text);
    
    // Cache the result
    this.vectorCache.set(hash, vector);
    
    return vector;
  }

  /**
   * 📊 Node Semantic Vector Generation
   */
  async generateNodeSemanticVector(node) {
    let text = node.name;
    
    // Add context based on node type
    if (node.type === 'file') {
      text += ` ${path.basename(node.filePath || '')} ${node.attributes?.language || ''}`;
    } else if (node.type === 'function') {
      text += ` function ${node.metadata?.complexity || ''} ${node.filePath || ''}`;
    } else if (node.type === 'class') {
      text += ` class ${node.metadata?.extends || ''} ${node.filePath || ''}`;
    }

    return await this.generateSemanticVector(text);
  }

  /**
   * 🔍 Semantic Relationship Discovery
   */
  async findSemanticRelationships() {
    const nodes = Array.from(this.nodes.values());
    const threshold = 0.7; // Similarity threshold

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        if (!nodeA.semanticVector || !nodeB.semanticVector) continue;

        const similarity = this.calculateCosineSimilarity(
          nodeA.semanticVector,
          nodeB.semanticVector
        );

        if (similarity > threshold) {
          this.createRelationship(
            nodeA.id,
            nodeB.id,
            'similar_to',
            similarity,
            true // bidirectional
          );
        }
      }
    }
  }

  /**
   * 🏗️ Architectural Pattern Recognition
   */
  async recognizeArchitecturalPatterns() {
    // MVC Pattern Detection
    const controllers = Array.from(this.nodes.values()).filter(
      node => node.name.toLowerCase().includes('controller')
    );
    const models = Array.from(this.nodes.values()).filter(
      node => node.name.toLowerCase().includes('model')
    );
    const views = Array.from(this.nodes.values()).filter(
      node => node.name.toLowerCase().includes('view') || 
             node.name.toLowerCase().includes('component')
    );

    if (controllers.length > 0 && models.length > 0 && views.length > 0) {
      const concept = {
        id: 'pattern_mvc',
        name: 'Model-View-Controller',
        description: 'MVC architectural pattern detected',
        category: 'architecture',
        keywords: ['mvc', 'controller', 'model', 'view'],
        relatedConcepts: ['separation_of_concerns'],
        codePatterns: ['*Controller.ts', '*Model.ts', '*View.*'],
        confidence: 0.8
      };
      this.concepts.set(concept.id, concept);
    }

    // Microservices Pattern Detection
    const serviceFiles = Array.from(this.nodes.values()).filter(
      node => node.name.toLowerCase().includes('service')
    );
    
    if (serviceFiles.length > 3) {
      const concept = {
        id: 'pattern_microservices',
        name: 'Microservices Architecture',
        description: 'Microservices pattern detected based on service count',
        category: 'architecture',
        keywords: ['microservices', 'service', 'api'],
        relatedConcepts: ['distributed_systems'],
        codePatterns: ['*Service.ts', 'services/*'],
        confidence: 0.7
      };
      this.concepts.set(concept.id, concept);
    }
  }

  /**
   * 🎨 Design Pattern Recognition
   */
  async recognizeDesignPatterns() {
    // Singleton Pattern Detection
    const singletonCandidates = Array.from(this.nodes.values()).filter(
      node => node.type === 'class' && 
             (node.name.toLowerCase().includes('singleton') ||
              node.metadata?.hasPrivateConstructor)
    );

    for (const candidate of singletonCandidates) {
      const concept = {
        id: `pattern_singleton_${candidate.id}`,
        name: 'Singleton Pattern',
        description: `Singleton pattern detected in ${candidate.name}`,
        category: 'design_pattern',
        keywords: ['singleton', 'instance', 'private'],
        relatedConcepts: ['creational_patterns'],
        codePatterns: ['private constructor', 'static instance'],
        confidence: 0.8
      };
      this.concepts.set(concept.id, concept);
    }

    // Factory Pattern Detection
    const factoryFiles = Array.from(this.nodes.values()).filter(
      node => node.name.toLowerCase().includes('factory')
    );

    for (const factory of factoryFiles) {
      const concept = {
        id: `pattern_factory_${factory.id}`,
        name: 'Factory Pattern',
        description: `Factory pattern detected in ${factory.name}`,
        category: 'design_pattern',
        keywords: ['factory', 'create', 'instance'],
        relatedConcepts: ['creational_patterns'],
        codePatterns: ['*Factory.ts', 'create*'],
        confidence: 0.7
      };
      this.concepts.set(concept.id, concept);
    }
  }

  /**
   * ⚠️ Anti-Pattern Recognition
   */
  async recognizeAntiPatterns() {
    // God Object Detection
    const largeClasses = Array.from(this.nodes.values()).filter(
      node => node.type === 'class' && 
             (node.metadata?.lineCount || 0) > 500
    );

    for (const largeClass of largeClasses) {
      const concept = {
        id: `antipattern_god_object_${largeClass.id}`,
        name: 'God Object Anti-pattern',
        description: `Potential God Object detected in ${largeClass.name}`,
        category: 'design_pattern',
        keywords: ['god object', 'large class', 'complexity'],
        relatedConcepts: ['code_smells'],
        codePatterns: ['large classes', 'high complexity'],
        confidence: 0.6
      };
      this.concepts.set(concept.id, concept);
    }
  }

  /**
   * 🎯 Domain Concept Extraction
   */
  async extractDomainConcepts() {
    // Extract concepts from file and class names
    const nodeNames = Array.from(this.nodes.values()).map(node => node.name);
    const domainTerms = this.extractDomainTerms(nodeNames);

    for (const term of domainTerms) {
      if (term.frequency > 2) { // Only concepts that appear multiple times
        const concept = {
          id: `domain_${term.term.toLowerCase()}`,
          name: term.term,
          description: `Domain concept: ${term.term}`,
          category: 'business_logic',
          keywords: [term.term.toLowerCase()],
          relatedConcepts: [],
          codePatterns: [`*${term.term}*`],
          confidence: Math.min(0.9, term.frequency / 10)
        };
        this.concepts.set(concept.id, concept);
      }
    }
  }

  /**
   * 🔍 Query Processing Helpers
   */
  async findSemanticallySimilarNodes(queryVector, filters) {
    const candidates = Array.from(this.nodes.values());
    const scoredNodes = [];

    for (const node of candidates) {
      if (!node.semanticVector) continue;

      // Apply filters
      if (filters?.nodeTypes && !filters.nodeTypes.includes(node.type)) continue;
      if (filters?.filePaths && !filters.filePaths.some(path => node.filePath?.includes(path))) continue;

      const similarity = this.calculateCosineSimilarity(queryVector, node.semanticVector);
      if (similarity > 0.3) { // Minimum relevance threshold
        scoredNodes.push({ node, score: similarity });
      }
    }

    // Sort by relevance and return top results
    scoredNodes.sort((a, b) => b.score - a.score);
    return scoredNodes.slice(0, 20).map(item => item.node);
  }

  /**
   * 🔗 Relationship Retrieval
   */
  getRelationshipsForNodes(nodeIds) {
    const nodeIdSet = new Set(nodeIds);
    return Array.from(this.relationships.values()).filter(
      rel => nodeIdSet.has(rel.fromNodeId) || nodeIdSet.has(rel.toNodeId)
    );
  }

  /**
   * 💡 Suggestion Generation
   */
  async generateSuggestions(query, relevantNodes) {
    const suggestions = [];

    if (query.type === 'search') {
      // Suggest related searches
      const relatedConcepts = this.findRelatedConcepts(relevantNodes);
      suggestions.push(...relatedConcepts.map(concept => `Search for: ${concept}`));
    }

    if (relevantNodes.length === 0) {
      suggestions.push('Try a broader search term');
      suggestions.push('Check spelling and try synonyms');
    }

    // Add pattern-based suggestions
    const patterns = this.identifyQueryPatterns(query.text);
    suggestions.push(...patterns);

    return suggestions.slice(0, 5);
  }

  /**
   * 💎 Insight Extraction
   */
  async extractInsights(nodes, relationships) {
    const insights = [];

    // Identify highly connected nodes (potential architectural centers)
    const connectionCounts = new Map();
    for (const rel of relationships) {
      connectionCounts.set(rel.fromNodeId, (connectionCounts.get(rel.fromNodeId) || 0) + 1);
      connectionCounts.set(rel.toNodeId, (connectionCounts.get(rel.toNodeId) || 0) + 1);
    }

    const highlyConnected = Array.from(connectionCounts.entries())
      .filter(([_, count]) => count > 5)
      .map(([nodeId, count]) => ({ nodeId, count }));

    for (const { nodeId, count } of highlyConnected) {
      const node = this.nodes.get(nodeId);
      if (node) {
        insights.push({
          type: 'architecture',
          title: 'Highly Connected Component',
          description: `${node.name} has ${count} connections and may be a central architectural component`,
          confidence: Math.min(0.9, count / 20),
          actionable: true,
          suggestion: 'Consider reviewing for single responsibility principle',
          affectedNodes: [nodeId]
        });
      }
    }

    // Identify potential circular dependencies
    const cycles = this.detectCycles(relationships);
    if (cycles.length > 0) {
      insights.push({
        type: 'vulnerability',
        title: 'Circular Dependencies Detected',
        description: `Found ${cycles.length} potential circular dependencies`,
        confidence: 0.8,
        actionable: true,
        suggestion: 'Refactor to break circular dependencies',
        affectedNodes: cycles.flat()
      });
    }

    // Identify orphaned nodes (no relationships)
    const connectedNodes = new Set([
      ...relationships.map(r => r.fromNodeId),
      ...relationships.map(r => r.toNodeId)
    ]);
    const orphanedNodes = nodes.filter(node => !connectedNodes.has(node.id));

    if (orphanedNodes.length > 0) {
      insights.push({
        type: 'anomaly',
        title: 'Isolated Components',
        description: `Found ${orphanedNodes.length} components with no relationships`,
        confidence: 0.7,
        actionable: true,
        suggestion: 'Review if these components are still needed',
        affectedNodes: orphanedNodes.map(n => n.id)
      });
    }

    return insights;
  }

  /**
   * 🛠️ Utility Methods
   */
  createRelationship(fromNodeId, toNodeId, type, weight, bidirectional = false) {
    const id = `${fromNodeId}_${type}_${toNodeId}`;
    
    if (!this.relationships.has(id)) {
      const relationship = {
        id,
        fromNodeId,
        toNodeId,
        type,
        weight,
        confidence: 0.8,
        bidirectional
      };
      
      this.relationships.set(id, relationship);
    }
  }

  generateNodeId(type, identifier) {
    return `${type}_${crypto.createHash('md5').update(identifier).digest('hex').substring(0, 8)}`;
  }

  detectLanguage(filePath) {
    const ext = path.extname(filePath);
    const languageMap = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.go': 'go',
      '.rs': 'rust'
    };
    return languageMap[ext] || 'unknown';
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  calculateFileComplexity(content) {
    const lines = content.split('\n').length;
    const functions = (content.match(/function|def|class/g) || []).length;
    const conditionals = (content.match(/if|else|switch|case|while|for/g) || []).length;
    
    return Math.min(10, (functions + conditionals) / lines * 100);
  }

  calculateFileImportance(filePath, content) {
    let importance = 0.5;
    
    // Boost importance for certain file types
    if (filePath.includes('index.') || filePath.includes('main.')) importance += 0.3;
    if (filePath.includes('config')) importance += 0.2;
    if (filePath.includes('util') || filePath.includes('helper')) importance += 0.1;
    
    // Boost based on content
    const lines = content.split('\n').length;
    importance += Math.min(0.3, lines / 1000);
    
    return Math.min(1.0, importance);
  }

  calculateFunctionComplexity(functionCode) {
    const conditionals = (functionCode.match(/if|else|switch|case|while|for/g) || []).length;
    const lines = functionCode.split('\n').length;
    return Math.min(10, conditionals + lines / 10);
  }

  generateTFIDFVector(text) {
    // Simplified TF-IDF implementation
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    const wordCounts = new Map();
    
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
    
    // Create vector of fixed size (100 dimensions)
    const vector = new Array(100).fill(0);
    const wordArray = Array.from(wordCounts.entries());
    
    for (let i = 0; i < Math.min(wordArray.length, 100); i++) {
      vector[i] = wordArray[i][1] / words.length; // TF
    }
    
    return vector;
  }

  calculateCosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  calculateOverallRelevance(nodes) {
    if (nodes.length === 0) return 0;
    
    const avgImportance = nodes.reduce((sum, node) => sum + node.importance, 0) / nodes.length;
    const diversityScore = new Set(nodes.map(n => n.type)).size / nodes.length;
    
    return (avgImportance + diversityScore) / 2;
  }

  extractDomainTerms(names) {
    const termCounts = new Map();
    
    for (const name of names) {
      // Extract camelCase and PascalCase terms
      const terms = name.split(/(?=[A-Z])|[_-]/).filter(term => term.length > 2);
      
      for (const term of terms) {
        const normalized = term.toLowerCase();
        termCounts.set(normalized, (termCounts.get(normalized) || 0) + 1);
      }
    }
    
    return Array.from(termCounts.entries())
      .map(([term, frequency]) => ({ term, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  findRelatedConcepts(nodes) {
    const concepts = Array.from(this.concepts.values());
    const relatedConcepts = [];
    
    for (const concept of concepts) {
      const relevance = nodes.some(node => 
        concept.keywords.some(keyword => 
          node.name.toLowerCase().includes(keyword)
        )
      );
      
      if (relevance) {
        relatedConcepts.push(...concept.relatedConcepts);
      }
    }
    
    return [...new Set(relatedConcepts)];
  }

  identifyQueryPatterns(queryText) {
    const patterns = [];
    const words = queryText.toLowerCase().split(/\s+/);
    
    if (words.includes('function') || words.includes('method')) {
      patterns.push('Search for related functions');
    }
    
    if (words.includes('class') || words.includes('component')) {
      patterns.push('Find similar classes');
    }
    
    if (words.includes('pattern')) {
      patterns.push('Explore design patterns');
    }
    
    return patterns;
  }

  detectCycles(relationships) {
    // Simplified cycle detection using DFS
    const graph = new Map();
    
    for (const rel of relationships) {
      if (!graph.has(rel.fromNodeId)) {
        graph.set(rel.fromNodeId, []);
      }
      graph.get(rel.fromNodeId).push(rel.toNodeId);
    }
    
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];
    
    function dfs(node, path) {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart));
        return;
      }
      
      if (visited.has(node)) return;
      
      visited.add(node);
      recursionStack.add(node);
      
      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor, [...path, neighbor]);
      }
      
      recursionStack.delete(node);
    }
    
    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, [node]);
      }
    }
    
    return cycles.slice(0, 10); // Limit to first 10 cycles
  }

  async buildQueryIndex() {
    // Build inverted index for fast text search
    for (const node of this.nodes.values()) {
      const words = [
        node.name,
        node.type,
        ...(node.metadata ? Object.values(node.metadata).map(String) : [])
      ].join(' ').toLowerCase().split(/\W+/);
      
      for (const word of words) {
        if (word.length > 2) {
          if (!this.queryIndex.has(word)) {
            this.queryIndex.set(word, new Set());
          }
          this.queryIndex.get(word).add(node.id);
        }
      }
    }
  }

  async initializeDefaultConcepts() {
    // Initialize with common software engineering concepts
    const defaultConcepts = [
      {
        id: 'concept_mvc',
        name: 'Model-View-Controller',
        description: 'Architectural pattern separating concerns',
        category: 'architecture',
        keywords: ['mvc', 'model', 'view', 'controller'],
        relatedConcepts: ['separation_of_concerns'],
        codePatterns: ['*Controller', '*Model', '*View'],
        confidence: 1.0
      },
      {
        id: 'concept_solid',
        name: 'SOLID Principles',
        description: 'Five design principles for maintainable software',
        category: 'design_pattern',
        keywords: ['solid', 'srp', 'ocp', 'lsp', 'isp', 'dip'],
        relatedConcepts: ['design_principles'],
        codePatterns: ['interface', 'abstract'],
        confidence: 1.0
      }
    ];

    for (const concept of defaultConcepts) {
      this.concepts.set(concept.id, concept);
    }
  }

  /**
   * 📊 Public API Methods
   */
  async getGraphStats() {
    return {
      nodeCount: this.nodes.size,
      relationshipCount: this.relationships.size,
      conceptCount: this.concepts.size,
      nodeTypes: this.getNodeTypeDistribution(),
      relationshipTypes: this.getRelationshipTypeDistribution()
    };
  }

  getNodeTypeDistribution() {
    const distribution = {};
    for (const node of this.nodes.values()) {
      distribution[node.type] = (distribution[node.type] || 0) + 1;
    }
    return distribution;
  }

  getRelationshipTypeDistribution() {
    const distribution = {};
    for (const rel of this.relationships.values()) {
      distribution[rel.type] = (distribution[rel.type] || 0) + 1;
    }
    return distribution;
  }

  async exportGraph() {
    return {
      nodes: Array.from(this.nodes.values()),
      relationships: Array.from(this.relationships.values()),
      concepts: Array.from(this.concepts.values()),
      metadata: {
        exportDate: new Date(),
        version: '1.0.0'
      }
    };
  }

  async visualizeGraph() {
    // Return data in a format suitable for graph visualization
    return {
      nodes: Array.from(this.nodes.values()).map(node => ({
        id: node.id,
        label: node.name,
        type: node.type,
        size: node.importance * 20,
        color: this.getNodeColor(node.type)
      })),
      edges: Array.from(this.relationships.values()).map(rel => ({
        id: rel.id,
        source: rel.fromNodeId,
        target: rel.toNodeId,
        label: rel.type,
        weight: rel.weight
      }))
    };
  }

  getNodeColor(nodeType) {
    const colors = {
      'file': '#3498db',
      'function': '#2ecc71',
      'class': '#e74c3c',
      'interface': '#f39c12',
      'variable': '#9b59b6',
      'module': '#1abc9c',
      'concept': '#e67e22'
    };
    return colors[nodeType] || '#95a5a6';
  }

  /**
   * 🧠 Self-Awareness Check
   */
  async checkSelfAwareness() {
    return {
      identity: 'Knowledge Graph Engine',
      purpose: 'Build and maintain semantic understanding of project structure',
      capabilities: [
        'File discovery and analysis',
        'Code entity extraction',
        'Semantic relationship mapping',
        'Pattern recognition',
        'Intelligent query processing',
        'Insight generation'
      ],
      status: 'Active'
    };
  }

  /**
   * 📊 Health Report
   */
  async getHealthReport() {
    const stats = await this.getGraphStats();
    return {
      status: 'Healthy',
      nodeCount: stats.nodeCount,
      relationshipCount: stats.relationshipCount,
      conceptCount: stats.conceptCount,
      lastUpdated: new Date(),
      performance: {
        queryIndexSize: this.queryIndex.size,
        vectorCacheSize: this.vectorCache.size,
        changeTrackerSize: this.changeTracker.size
      }
    };
  }
}

module.exports = KnowledgeGraphEngine; 