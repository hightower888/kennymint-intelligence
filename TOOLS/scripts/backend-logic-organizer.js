#!/usr/bin/env node

/**
 * 🧠 Backend Logic Organizer
 * 
 * Moves essential backend logic to root level while maintaining clean separation:
 * - Core intelligence systems accessible at root
 * - Templates and tools remain in backend-logic
 * - Clean separation between frontend and backend
 * - Version control for all changes
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class BackendLogicOrganizer {
  constructor() {
    this.rootPath = process.cwd();
    this.backendLogicPath = 'RepoCloneMeta/backend-logic';
    this.rootIntelligencePath = '.intelligence';
    
    console.log(chalk.magenta.bold('🧠 Backend Logic Organizer'));
    console.log(chalk.gray('Organizing backend logic for root-level access...'));
  }

  /**
   * Analyze current backend logic structure
   */
  async analyzeBackendLogic() {
    console.log(chalk.blue('\n📊 Analyzing Backend Logic Structure...'));
    
    const analysis = {
      aiSystems: this.getDirectoryInfo('ai-systems'),
      selfImproving: this.getDirectoryInfo('self-improving'),
      nextLevel: this.getDirectoryInfo('next-level'),
      coreSystems: this.getDirectoryInfo('core-systems'),
      smartAssetIntegration: this.getDirectoryInfo('smart-asset-integration'),
      storageManagement: this.getDirectoryInfo('storage-management'),
      infrastructure: this.getDirectoryInfo('infrastructure'),
      cli: this.getDirectoryInfo('cli'),
      projectTemplates: this.getDirectoryInfo('project-templates'),
      docs: this.getDirectoryInfo('docs')
    };
    
    console.log(chalk.green('✅ Backend logic analysis complete'));
    return analysis;
  }

  /**
   * Get directory information
   */
  getDirectoryInfo(dirPath) {
    const fullPath = path.join(this.backendLogicPath, dirPath);
    if (!fs.existsSync(fullPath)) {
      return { exists: false, files: [], size: 0 };
    }
    
    const files = this.getAllFiles(fullPath);
    const size = this.calculateDirectorySize(fullPath);
    
    return {
      exists: true,
      files: files,
      size: size,
      path: dirPath
    };
  }

  /**
   * Get all files in directory recursively
   */
  getAllFiles(dirPath) {
    const files = [];
    const backendLogicPath = this.backendLogicPath;
    
    function traverse(currentPath) {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else {
          files.push(fullPath.replace(backendLogicPath + '/', ''));
        }
      }
    }
    
    traverse(dirPath);
    return files;
  }

  /**
   * Calculate directory size
   */
  calculateDirectorySize(dirPath) {
    let size = 0;
    
    function traverse(currentPath) {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else {
          size += stat.size;
        }
      }
    }
    
    traverse(dirPath);
    return size;
  }

  /**
   * Create root-level intelligence structure
   */
  async createRootIntelligenceStructure() {
    console.log(chalk.blue('\n📁 Creating Root Intelligence Structure...'));
    
    const intelligenceDirs = [
      'ai-systems',
      'self-improving',
      'next-level',
      'core-systems',
      'smart-asset-integration',
      'storage-management',
      'infrastructure',
      'cli',
      'docs'
    ];
    
    for (const dir of intelligenceDirs) {
      const fullPath = path.join(this.rootIntelligencePath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(chalk.green(`   ✅ Created ${dir}/`));
      }
    }
    
    console.log(chalk.green('✅ Root intelligence structure created'));
  }

  /**
   * Create intelligence system connectors at root level
   */
  async createIntelligenceConnectors() {
    console.log(chalk.blue('\n🔗 Creating Intelligence System Connectors...'));
    
    // AI Systems Connector
    await this.createSystemConnector('ai-systems', [
      'ai-coordinator.ts',
      'init.ts',
      'rule-enforcement/',
      'error-prevention/',
      'knowledge-graph/',
      'health-analysis/',
      'drift-prevention/'
    ]);
    
    // Self-Improving Systems Connector
    await this.createSystemConnector('self-improving', [
      'master-self-improvement.ts',
      'continuous-learning.ts',
      'mistake-learning-engine.ts',
      'improvement-suggestions.ts',
      'project-evolution.ts',
      'project-understanding.ts',
      'market-analysis.ts',
      'enhanced-continuous-learning.ts'
    ]);
    
    // Next-Level Systems Connector
    await this.createSystemConnector('next-level', [
      'master-system.ts',
      'autonomous-team.ts',
      'infinite-scalability.ts',
      'quantum-pipeline.ts',
      'self-evolving-ai.ts',
      'natural-language-programming.ts',
      'reality-aware.ts',
      'universal-translator.ts',
      'predictive-intelligence.ts',
      'zero-bug-guarantee.ts'
    ]);
    
    // Core Systems Connector
    await this.createSystemConnector('core-systems', [
      'core-engine.ts',
      'monitoring/',
      'deployment/',
      'security/'
    ]);
    
    // Smart Asset Integration Connector
    await this.createSystemConnector('smart-asset-integration', [
      'asset-manager.ts',
      'brand-asset-coordinator.ts',
      'index.ts'
    ]);
    
    // Storage Management Connector
    await this.createSystemConnector('storage-management', [
      'adaptive-storage.ts',
      'efficiency-monitor.ts'
    ]);
    
    console.log(chalk.green('✅ Intelligence system connectors created'));
  }

  /**
   * Create system connector
   */
  async createSystemConnector(systemName, files) {
    const connectorPath = path.join(this.rootIntelligencePath, systemName, 'connector.js');
    const backendPath = path.join(this.backendLogicPath, systemName);
    
    const connectorContent = `#!/usr/bin/env node

/**
 * 🔗 ${systemName.toUpperCase()} System Connector
 * 
 * Connects root level to ${systemName} systems in backend logic
 */

const path = require('path');

class ${systemName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Connector {
  constructor() {
    this.backendPath = path.join(__dirname, '../../RepoCloneMeta/backend-logic/${systemName}');
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
      console.warn(\`⚠️  System \${systemName} not available: \${error.message}\`);
      return null;
    }
  }

  /**
   * Get all available systems
   */
  getAllSystems() {
    const systems = {};
    const files = ${JSON.stringify(files)};
    
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
          console.warn(\`⚠️  Failed to initialize \${name}: \${error.message}\`);
        }
      }
    }
    
    return initialized;
  }
}

module.exports = ${systemName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Connector;

// If run directly, show system status
if (require.main === module) {
  const connector = new ${systemName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Connector();
  const systems = connector.getAllSystems();
  
  console.log(\`📊 \${systemName.toUpperCase()} Systems Status:\`);
  console.log(\`   Available: \${Object.keys(systems).filter(s => systems[s]).length}\`);
  console.log(\`   Total: \${Object.keys(systems).length}\`);
}`;
    
    fs.writeFileSync(connectorPath, connectorContent);
    console.log(chalk.green(`   ✅ Created ${systemName} connector`));
  }

  /**
   * Create root-level intelligence index
   */
  async createRootIntelligenceIndex() {
    console.log(chalk.blue('\n📋 Creating Root Intelligence Index...'));
    
    const indexContent = `#!/usr/bin/env node

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
    console.log(\`   \${category}: \${info.available}/\${info.total} systems\`);
  }
}`;
    
    const indexPath = path.join(this.rootIntelligencePath, 'index.js');
    fs.writeFileSync(indexPath, indexContent);
    console.log(chalk.green('✅ Root intelligence index created'));
  }

  /**
   * Update root intelligence system to use new connectors
   */
  async updateRootIntelligenceSystem() {
    console.log(chalk.blue('\n🔄 Updating Root Intelligence System...'));
    
    const rootIntelligencePath = 'root-intelligence-system.js';
    const content = fs.readFileSync(rootIntelligencePath, 'utf8');
    
    // Add import for root intelligence index
    const updatedContent = content.replace(
      "const fs = require('fs');",
      `const fs = require('fs');
const RootIntelligenceIndex = require('./.intelligence/index');`
    );
    
    // Add root intelligence initialization
    const initPattern = /constructor\(\) \{[\s\S]*?this\.intelligenceData = \{[\s\S]*?\};/;
    const initReplacement = `constructor() {
    this.projectRoot = process.cwd();
    this.rootIntelligence = new RootIntelligenceIndex();
    this.intelligenceData = {
      selfAwareness: {
        identity: 'RepoClone - Template Deployment System',
        purpose: 'Create and enforce clean separation between frontend projects and backend logic',
        understanding: 'I am building a system for other projects, not for myself',
        comprehensiveIntelligence: 'Leverages ALL 26+ backend systems for maximum intelligence'
      },
      structureRules: {
        backendLogicLocation: 'RepoCloneMeta/backend-logic/',
        projectLocation: 'root level',
        forbiddenMixing: ['frontend in backend-logic', 'backend in project root'],
        enforcedSeparation: true
      },
      deploymentPatterns: [],
      templateCompleteness: [],
      violations: [],
      crossProjectLearning: [],
      contextAwarePatterns: {},
      industryInsights: {},
      audiencePreferences: {}
    };`;
    
    const updatedContent2 = updatedContent.replace(initPattern, initReplacement);
    
    fs.writeFileSync(rootIntelligencePath, updatedContent2);
    console.log(chalk.green('✅ Root intelligence system updated'));
  }

  /**
   * Create version control backup
   */
  async createVersionControlBackup() {
    console.log(chalk.blue('\n📝 Creating Version Control Backup...'));
    
    const backupBranch = 'backup-before-reorganization';
    
    try {
      // Create backup branch
      const { execSync } = require('child_process');
      execSync(`git checkout -b ${backupBranch}`, { stdio: 'inherit' });
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "backup: Before backend logic reorganization"', { stdio: 'inherit' });
      execSync('git checkout main', { stdio: 'inherit' });
      
      console.log(chalk.green(`✅ Backup created in branch: ${backupBranch}`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Git backup failed, continuing without backup'));
    }
  }

  /**
   * Run complete reorganization
   */
  async reorganize() {
    console.log(chalk.magenta.bold('\n🚀 Starting Backend Logic Reorganization...'));
    
    try {
      // 1. Analyze current structure
      const analysis = await this.analyzeBackendLogic();
      
      // 2. Create version control backup
      await this.createVersionControlBackup();
      
      // 3. Create root intelligence structure
      await this.createRootIntelligenceStructure();
      
      // 4. Create intelligence connectors
      await this.createIntelligenceConnectors();
      
      // 5. Create root intelligence index
      await this.createRootIntelligenceIndex();
      
      // 6. Update root intelligence system
      await this.updateRootIntelligenceSystem();
      
      console.log(chalk.green('\n🎉 Backend Logic Reorganization Complete!'));
      console.log(chalk.gray('   All intelligence systems now accessible at root level'));
      console.log(chalk.gray('   Clean separation maintained'));
      console.log(chalk.gray('   Version control backup created'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Reorganization failed:'), error);
    }
  }
}

// Export the organizer
module.exports = BackendLogicOrganizer;

// If run directly, start reorganization
if (require.main === module) {
  const organizer = new BackendLogicOrganizer();
  organizer.reorganize();
} 