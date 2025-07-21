#!/usr/bin/env node

/**
 * 🔗 NEXT-LEVEL System Connector
 * 
 * Connects root level to next-level systems in backend logic
 */

const path = require('path');

class nextLevelConnector {
  constructor() {
    this.backendPath = path.join(__dirname, '../../RepoCloneMeta/backend-logic/next-level');
    this.rootPath = path.join(__dirname, '../');
  }

  /**
   * Get system from backend logic
   */
  getSystem(systemName) {
    try {
      const systemPath = path.join(this.backendPath, systemName);
      return require(systemPath);
    } catch (error) {
      console.warn(`⚠️  System ${systemName} not available: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all available systems
   */
  getAllSystems() {
    const systems = {};
    const files = ["master-system.ts","autonomous-team.ts","infinite-scalability.ts","quantum-pipeline.ts","self-evolving-ai.ts","natural-language-programming.ts","reality-aware.ts","universal-translator.ts","predictive-intelligence.ts","zero-bug-guarantee.ts"];
    
    for (const file of files) {
      if (!file.endsWith('/')) {
        const systemName = file.replace('.ts', '').replace('.js', '');
        systems[systemName] = this.getSystem(file);
      }
    }
    
    return systems;
  }

  /**
   * Initialize system for project
   */
  async initializeForProject(projectPath) {
    const systems = this.getAllSystems();
    const initialized = {};
    
    for (const [name, system] of Object.entries(systems)) {
      if (system && typeof system.initializeForProject === 'function') {
        try {
          initialized[name] = await system.initializeForProject(projectPath);
        } catch (error) {
          console.warn(`⚠️  Failed to initialize ${name}: ${error.message}`);
        }
      }
    }
    
    return initialized;
  }
}

module.exports = nextLevelConnector;

// If run directly, show system status
if (require.main === module) {
  const connector = new nextLevelConnector();
  const systems = connector.getAllSystems();
  
  console.log(`📊 ${systemName.toUpperCase()} Systems Status:`);
  console.log(`   Available: ${Object.keys(systems).filter(s => systems[s]).length}`);
  console.log(`   Total: ${Object.keys(systems).length}`);
}