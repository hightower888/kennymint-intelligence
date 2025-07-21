#!/usr/bin/env node

/**
 * 🧠 Real-Time Intelligence Dashboard
 * 
 * Shows live status of all intelligence systems and activities
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class IntelligenceDashboard {
  constructor() {
    this.updateInterval = 2000; // Update every 2 seconds
    this.isRunning = false;
    this.dashboardData = {
      lastUpdate: new Date(),
      rootIntelligence: {},
      learningAggregator: {},
      templateSystem: {},
      structureValidation: {},
      intelligenceConnector: {},
      projects: [],
      learningPatterns: {},
      systemStatus: {}
    };
  }

  /**
   * Start the real-time dashboard
   */
  async start() {
    console.clear();
    console.log(chalk.magenta.bold('🧠 RepoClone Intelligence Dashboard'));
    console.log(chalk.gray('Real-time monitoring of all intelligence systems\n'));
    
    this.isRunning = true;
    
    // Start continuous updates
    while (this.isRunning) {
      await this.updateDashboard();
      await this.sleep(this.updateInterval);
    }
  }

  /**
   * Update dashboard data
   */
  async updateDashboard() {
    try {
      // Update all data sources
      await this.updateRootIntelligence();
      await this.updateLearningAggregator();
      await this.updateTemplateSystem();
      await this.updateStructureValidation();
      await this.updateIntelligenceConnector();
      await this.updateProjects();
      await this.updateLearningPatterns();
      await this.updateSystemStatus();
      
      // Display dashboard
      this.displayDashboard();
      
    } catch (error) {
      console.error(chalk.red('Dashboard update error:'), error.message);
    }
  }

  /**
   * Update root intelligence status
   */
  async updateRootIntelligence() {
    try {
      const RootIntelligenceSystem = require('./root-intelligence-system');
      const rootIntelligence = new RootIntelligenceSystem();
      
      const awareness = await rootIntelligence.checkSelfAwareness();
      const validation = await rootIntelligence.validateStructure();
      const status = rootIntelligence.getSystemStatus();
      
      this.dashboardData.rootIntelligence = {
        selfAware: true,
        identity: awareness.identity,
        purpose: awareness.purpose,
        structureValidated: validation.violations.length === 0,
        violations: validation.violations,
        validations: validation.validations,
        deploymentPatterns: status.deploymentPatterns,
        lastUpdate: new Date()
      };
    } catch (error) {
      this.dashboardData.rootIntelligence = {
        selfAware: false,
        error: error.message,
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Update learning aggregator status
   */
  async updateLearningAggregator() {
    try {
      const LearningAggregator = require('./learning-aggregator');
      const aggregator = new LearningAggregator();
      
      const projects = await aggregator.getAllProjects();
      const status = aggregator.getSystemStatus();
      
      this.dashboardData.learningAggregator = {
        active: true,
        projectsFound: projects.length,
        availableSystems: status.availableSystems,
        totalSystems: status.totalSystems,
        lastUpdate: new Date()
      };
    } catch (error) {
      this.dashboardData.learningAggregator = {
        active: false,
        error: error.message,
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Update template system status
   */
  async updateTemplateSystem() {
    try {
      const templatesPath = '../INTELLIGENCE/RepoCloneMeta/backend-logic/project-templates';
      
      if (fs.existsSync(templatesPath)) {
        const templates = fs.readdirSync(templatesPath);
        const validTemplates = templates.filter(template => {
          const templatePath = path.join(templatesPath, template);
          return fs.statSync(templatePath).isDirectory();
        });
        
        this.dashboardData.templateSystem = {
          available: true,
          totalTemplates: validTemplates.length,
          templates: validTemplates,
          lastUpdate: new Date()
        };
      } else {
        this.dashboardData.templateSystem = {
          available: false,
          error: 'Templates directory not found',
          lastUpdate: new Date()
        };
      }
    } catch (error) {
      this.dashboardData.templateSystem = {
        available: false,
        error: error.message,
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Update structure validation status
   */
  async updateStructureValidation() {
    try {
      const violations = [];
      const validations = [];
      
      // Check backend logic location
      if (fs.existsSync('../INTELLIGENCE/RepoCloneMeta/backend-logic/')) {
        validations.push('✅ Backend logic properly located');
      } else {
        violations.push('❌ Backend logic not found');
      }
      
      // Check GitHub hooks
      if (fs.existsSync('../VERSION_CONTROL/.hooks/')) {
        validations.push('✅ GitHub hooks directory exists');
      } else {
        violations.push('❌ GitHub hooks directory missing');
      }
      
      // Check for frontend code in backend-logic
      const backendLogicPath = '../INTELLIGENCE/RepoCloneMeta/backend-logic/';
      if (fs.existsSync(backendLogicPath)) {
        const hasFrontendCode = this.checkForFrontendCode(backendLogicPath);
        if (!hasFrontendCode) {
          validations.push('✅ No frontend code in backend-logic');
        } else {
          violations.push('❌ Frontend code found in backend-logic');
        }
      }
      
      this.dashboardData.structureValidation = {
        valid: violations.length === 0,
        violations,
        validations,
        lastUpdate: new Date()
      };
    } catch (error) {
      this.dashboardData.structureValidation = {
        valid: false,
        error: error.message,
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Update intelligence connector status
   */
  async updateIntelligenceConnector() {
    try {
      const IntelligenceConnector = require('./intelligence-connector');
      const connector = new IntelligenceConnector(process.cwd());
      const status = connector.getSystemStatus();
      
      this.dashboardData.intelligenceConnector = {
        connected: status.availableSystems > 0,
        availableSystems: status.availableSystems,
        totalSystems: status.totalSystems,
        systems: status.systems,
        lastUpdate: new Date()
      };
    } catch (error) {
      this.dashboardData.intelligenceConnector = {
        connected: false,
        error: error.message,
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Update projects list
   */
  async updateProjects() {
    try {
      const rootPath = path.join(process.cwd(), '..');
      const items = fs.readdirSync(rootPath);
      
      const projects = items.filter(item => {
        const itemPath = path.join(rootPath, item);
        return fs.statSync(itemPath).isDirectory() && 
               !['CORE', 'INTELLIGENCE', 'TEMPLATES', 'TOOLS', 'DOCS', 'PROJECTS', 'VERSION_CONTROL', 'CONFIG', 'node_modules'].includes(item);
      });
      
      this.dashboardData.projects = projects;
    } catch (error) {
      this.dashboardData.projects = [];
    }
  }

  /**
   * Update learning patterns
   */
  async updateLearningPatterns() {
    try {
      const learningDataPath = '../INTELLIGENCE/.intelligence/learning-data';
      
      if (fs.existsSync(learningDataPath)) {
        const files = fs.readdirSync(learningDataPath);
        const patterns = {};
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const content = fs.readFileSync(path.join(learningDataPath, file), 'utf8');
              patterns[file] = JSON.parse(content);
            } catch (error) {
              patterns[file] = { error: 'Could not parse file' };
            }
          }
        }
        
        this.dashboardData.learningPatterns = {
          available: true,
          files: files.length,
          patterns,
          lastUpdate: new Date()
        };
      } else {
        this.dashboardData.learningPatterns = {
          available: false,
          error: 'Learning data directory not found',
          lastUpdate: new Date()
        };
      }
    } catch (error) {
      this.dashboardData.learningPatterns = {
        available: false,
        error: error.message,
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Update overall system status
   */
  async updateSystemStatus() {
    const rootIntelligence = this.dashboardData.rootIntelligence.selfAware;
    const learningAggregator = this.dashboardData.learningAggregator.active;
    const templateSystem = this.dashboardData.templateSystem.available;
    const structureValidation = this.dashboardData.structureValidation.valid;
    const intelligenceConnector = this.dashboardData.intelligenceConnector.connected;
    
    const totalSystems = 5;
    const workingSystems = [rootIntelligence, learningAggregator, templateSystem, structureValidation, intelligenceConnector].filter(Boolean).length;
    
    this.dashboardData.systemStatus = {
      overallHealth: workingSystems / totalSystems,
      workingSystems,
      totalSystems,
      lastUpdate: new Date()
    };
  }

  /**
   * Display the dashboard
   */
  displayDashboard() {
    console.clear();
    console.log(chalk.magenta.bold('🧠 RepoClone Intelligence Dashboard'));
    console.log(chalk.gray(`Last Updated: ${new Date().toLocaleTimeString()}\n`));
    
    // System Health Overview
    this.displaySystemHealth();
    
    // Root Intelligence Status
    this.displayRootIntelligence();
    
    // Learning Aggregator Status
    this.displayLearningAggregator();
    
    // Template System Status
    this.displayTemplateSystem();
    
    // Structure Validation Status
    this.displayStructureValidation();
    
    // Intelligence Connector Status
    this.displayIntelligenceConnector();
    
    // Projects Status
    this.displayProjects();
    
    // Learning Patterns Status
    this.displayLearningPatterns();
    
    // Commands
    this.displayCommands();
  }

  /**
   * Display system health overview
   */
  displaySystemHealth() {
    const { overallHealth, workingSystems, totalSystems } = this.dashboardData.systemStatus;
    const healthPercentage = Math.round(overallHealth * 100);
    
    console.log(chalk.blue.bold('📊 System Health Overview'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const healthBar = '█'.repeat(Math.floor(overallHealth * 20)) + '░'.repeat(20 - Math.floor(overallHealth * 20));
    const healthColor = overallHealth >= 0.8 ? chalk.green : overallHealth >= 0.6 ? chalk.yellow : chalk.red;
    
    console.log(`${healthColor(healthBar)} ${healthPercentage}%`);
    console.log(chalk.gray(`   ${workingSystems}/${totalSystems} systems working`));
    console.log('');
  }

  /**
   * Display root intelligence status
   */
  displayRootIntelligence() {
    const data = this.dashboardData.rootIntelligence;
    
    console.log(chalk.blue.bold('🧠 Root Intelligence System'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.selfAware) {
      console.log(chalk.green('✅ Self-Aware: Confirmed'));
      console.log(chalk.gray(`   Identity: ${data.identity}`));
      console.log(chalk.gray(`   Purpose: ${data.purpose}`));
      console.log(chalk.green(`✅ Structure: ${data.structureValidated ? 'Valid' : 'Invalid'}`));
      console.log(chalk.gray(`   Patterns: ${data.deploymentPatterns} deployment patterns`));
    } else {
      console.log(chalk.red('❌ Self-Aware: Failed'));
      console.log(chalk.red(`   Error: ${data.error}`));
    }
    console.log('');
  }

  /**
   * Display learning aggregator status
   */
  displayLearningAggregator() {
    const data = this.dashboardData.learningAggregator;
    
    console.log(chalk.blue.bold('📊 Learning Aggregator'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.active) {
      console.log(chalk.green('✅ Active'));
      console.log(chalk.gray(`   Projects: ${data.projectsFound} found`));
      console.log(chalk.gray(`   Systems: ${data.availableSystems}/${data.totalSystems} available`));
    } else {
      console.log(chalk.red('❌ Inactive'));
      console.log(chalk.red(`   Error: ${data.error}`));
    }
    console.log('');
  }

  /**
   * Display template system status
   */
  displayTemplateSystem() {
    const data = this.dashboardData.templateSystem;
    
    console.log(chalk.blue.bold('📋 Template System'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.available) {
      console.log(chalk.green('✅ Available'));
      console.log(chalk.gray(`   Templates: ${data.totalTemplates} available`));
      
      // Show some template examples
      const examples = data.templates.slice(0, 5);
      console.log(chalk.gray(`   Examples: ${examples.join(', ')}${data.templates.length > 5 ? '...' : ''}`));
    } else {
      console.log(chalk.red('❌ Unavailable'));
      console.log(chalk.red(`   Error: ${data.error}`));
    }
    console.log('');
  }

  /**
   * Display structure validation status
   */
  displayStructureValidation() {
    const data = this.dashboardData.structureValidation;
    
    console.log(chalk.blue.bold('🛡️ Structure Validation'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.valid) {
      console.log(chalk.green('✅ Valid'));
      data.validations.forEach(validation => {
        console.log(chalk.gray(`   ${validation}`));
      });
    } else {
      console.log(chalk.red('❌ Invalid'));
      data.violations.forEach(violation => {
        console.log(chalk.red(`   ${violation}`));
      });
    }
    console.log('');
  }

  /**
   * Display intelligence connector status
   */
  displayIntelligenceConnector() {
    const data = this.dashboardData.intelligenceConnector;
    
    console.log(chalk.blue.bold('🔗 Intelligence Connector'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.connected) {
      console.log(chalk.green('✅ Connected'));
      console.log(chalk.gray(`   Systems: ${data.availableSystems}/${data.totalSystems} available`));
      
      // Show some system examples
      const examples = data.systems.slice(0, 5);
      console.log(chalk.gray(`   Examples: ${examples.join(', ')}${data.systems.length > 5 ? '...' : ''}`));
    } else {
      console.log(chalk.red('❌ Disconnected'));
      console.log(chalk.red(`   Error: ${data.error}`));
    }
    console.log('');
  }

  /**
   * Display projects status
   */
  displayProjects() {
    const projects = this.dashboardData.projects;
    
    console.log(chalk.blue.bold('🚀 Projects'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (projects.length > 0) {
      console.log(chalk.green(`✅ ${projects.length} projects found`));
      projects.forEach(project => {
        console.log(chalk.gray(`   📁 ${project}`));
      });
    } else {
      console.log(chalk.yellow('ℹ️  No projects at root level yet'));
    }
    console.log('');
  }

  /**
   * Display learning patterns status
   */
  displayLearningPatterns() {
    const data = this.dashboardData.learningPatterns;
    
    console.log(chalk.blue.bold('📈 Learning Patterns'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.available) {
      console.log(chalk.green('✅ Available'));
      console.log(chalk.gray(`   Files: ${data.files} learning data files`));
      
      // Show file examples
      const files = Object.keys(data.patterns);
      const examples = files.slice(0, 3);
      console.log(chalk.gray(`   Examples: ${examples.join(', ')}${files.length > 3 ? '...' : ''}`));
    } else {
      console.log(chalk.yellow('ℹ️  No learning data available'));
      if (data.error) {
        console.log(chalk.red(`   Error: ${data.error}`));
      }
    }
    console.log('');
  }

  /**
   * Display available commands
   */
  displayCommands() {
    console.log(chalk.blue.bold('🎯 Available Commands'));
    console.log(chalk.gray('─'.repeat(30)));
    console.log(chalk.gray('   npm start          # Start root intelligence'));
    console.log(chalk.gray('   npm run validate   # Validate structure'));
    console.log(chalk.gray('   npm run aggregate  # Aggregate learning'));
    console.log(chalk.gray('   npm run intelligence # Check systems'));
    console.log(chalk.gray('   npm run deploy     # Deploy template'));
    console.log(chalk.gray('   Ctrl+C             # Stop dashboard'));
    console.log('');
  }

  /**
   * Check for frontend code in directory
   */
  checkForFrontendCode(directory) {
    const frontendExtensions = ['.html', '.css', '.js', '.jsx', '.tsx', '.vue'];
    const frontendFiles = ['index.html', 'package.json', 'README.md'];
    
    try {
      const files = this.getAllFiles(directory);
      
      return files.some(file => {
        const ext = path.extname(file);
        const basename = path.basename(file);
        
        // Allow frontend code in project-templates directory
        if (file.includes('project-templates/')) {
          return false;
        }
        
        // Allow CLI tools and scripts
        if (file.includes('cli/') || file.includes('scripts/') || file.includes('initialize-for-project.js')) {
          return false;
        }
        
        return frontendExtensions.includes(ext) || frontendFiles.includes(basename);
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all files in directory recursively
   */
  getAllFiles(dir) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return files;
  }

  /**
   * Sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop the dashboard
   */
  stop() {
    this.isRunning = false;
    console.log(chalk.yellow('\n🛑 Dashboard stopped'));
  }
}

// Export the dashboard
module.exports = IntelligenceDashboard;

// If run directly, start the dashboard
if (require.main === module) {
  const dashboard = new IntelligenceDashboard();
  
  // Handle Ctrl+C to stop dashboard
  process.on('SIGINT', () => {
    dashboard.stop();
    process.exit(0);
  });
  
  dashboard.start().catch(console.error);
} 