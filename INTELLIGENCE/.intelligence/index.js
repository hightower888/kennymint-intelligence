#!/usr/bin/env node

/**
 * 🧠 Root Intelligence Index
 * 
 * Central access point for all intelligence systems
 */

const AiSystemsConnector = require('./ai-systems/connector');
const SelfImprovingConnector = require('./self-improving/connector');
const NextLevelConnector = require('./next-level/connector');
const CoreSystemsConnector = require('./core-systems/connector');
const SmartAssetConnector = require('./smart-asset-integration/connector');
const StorageManagementConnector = require('./storage-management/connector');

class RootIntelligenceIndex {
  constructor() {
    this.aiSystems = new AiSystemsConnector();
    this.selfImproving = new SelfImprovingConnector();
    this.nextLevel = new NextLevelConnector();
    this.coreSystems = new CoreSystemsConnector();
    this.smartAsset = new SmartAssetConnector();
    this.storageManagement = new StorageManagementConnector();
  }

  /**
   * Get all intelligence systems
   */
  getAllSystems() {
    return {
      aiSystems: this.aiSystems.getAllSystems(),
      selfImproving: this.selfImproving.getAllSystems(),
      nextLevel: this.nextLevel.getAllSystems(),
      coreSystems: this.coreSystems.getAllSystems(),
      smartAsset: this.smartAsset.getAllSystems(),
      storageManagement: this.storageManagement.getAllSystems()
    };
  }

  /**
   * Initialize all systems for project
   */
  async initializeForProject(projectPath) {
    const results = {};
    
    try {
      results.aiSystems = await this.aiSystems.initializeForProject(projectPath);
    } catch (error) {
      console.warn('⚠️  AI systems initialization failed:', error.message);
    }
    
    try {
      results.selfImproving = await this.selfImproving.initializeForProject(projectPath);
    } catch (error) {
      console.warn('⚠️  Self-improving systems initialization failed:', error.message);
    }
    
    try {
      results.nextLevel = await this.nextLevel.initializeForProject(projectPath);
    } catch (error) {
      console.warn('⚠️  Next-level systems initialization failed:', error.message);
    }
    
    try {
      results.coreSystems = await this.coreSystems.initializeForProject(projectPath);
    } catch (error) {
      console.warn('⚠️  Core systems initialization failed:', error.message);
    }
    
    try {
      results.smartAsset = await this.smartAsset.initializeForProject(projectPath);
    } catch (error) {
      console.warn('⚠️  Smart asset systems initialization failed:', error.message);
    }
    
    try {
      results.storageManagement = await this.storageManagement.initializeForProject(projectPath);
    } catch (error) {
      console.warn('⚠️  Storage management systems initialization failed:', error.message);
    }
    
    return results;
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    const allSystems = this.getAllSystems();
    const status = {};
    
    for (const [category, systems] of Object.entries(allSystems)) {
      status[category] = {
        available: Object.keys(systems).filter(s => systems[s]).length,
        total: Object.keys(systems).length
      };
    }
    
    return status;
  }
}

module.exports = RootIntelligenceIndex;

// If run directly, show system status
if (require.main === module) {
  const index = new RootIntelligenceIndex();
  const status = index.getSystemStatus();
  
  console.log('🧠 Root Intelligence Systems Status:');
  for (const [category, info] of Object.entries(status)) {
    console.log(`   ${category}: ${info.available}/${info.total} systems`);
  }
}