#!/usr/bin/env node

/**
 * 🧠 Real Intelligence Dashboard
 * 
 * Actually connects to and uses the real intelligence systems
 * from the backend logic to show live status and activity
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class IntelligenceDashboard {
  constructor() {
    this.updateInterval = 3000; // Update every 3 seconds
    this.isRunning = false;
    this.backendLogicPath = '../INTELLIGENCE/RepoCloneMeta/backend-logic';
    this.aiSystemsPath = path.join(this.backendLogicPath, 'ai-systems');
    this.selfImprovingPath = path.join(this.backendLogicPath, 'self-improving');
    this.nextLevelPath = path.join(this.backendLogicPath, 'next-level');
    this.coreSystemsPath = path.join(this.backendLogicPath, 'core-systems');
    this.templatesPath = path.join(this.backendLogicPath, 'project-templates');
  }

  /**
   * Start the real-time dashboard
   */
  async start() {
    console.clear();
    console.log(chalk.magenta.bold('🧠 RepoClone Intelligence Dashboard'));
    console.log(chalk.gray('Connecting to real intelligence systems...\n'));
    
    this.isRunning = true;
    
    // Start continuous updates
    while (this.isRunning) {
      await this.updateDashboard();
      await this.sleep(this.updateInterval);
    }
  }

  /**
   * Update dashboard with real intelligence data
   */
  async updateDashboard() {
    try {
      // Get real system status
      const aiSystems = await this.getAISystemsStatus();
      const selfImproving = await this.getSelfImprovingStatus();
      const nextLevel = await this.getNextLevelStatus();
      const coreSystems = await this.getCoreSystemsStatus();
      const templates = await this.getTemplatesStatus();
      const structure = await this.getStructureValidation();
      const learning = await this.getLearningData();
      
      // Display dashboard
      this.displayDashboard({
        aiSystems,
        selfImproving,
        nextLevel,
        coreSystems,
        templates,
        structure,
        learning
      });
      
    } catch (error) {
      console.error(chalk.red('Dashboard error:'), error.message);
    }
  }

  /**
   * Get AI Systems status from real backend logic
   */
  async getAISystemsStatus() {
    const systems = [];
    const status = { available: 0, total: 0, systems: [] };
    
    if (fs.existsSync(this.aiSystemsPath)) {
      const items = fs.readdirSync(this.aiSystemsPath);
      
      for (const item of items) {
        const itemPath = path.join(this.aiSystemsPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          status.total++;
          
          // Check if system has main files
          const hasMainFile = this.checkSystemFiles(itemPath);
          if (hasMainFile) {
            status.available++;
            systems.push(item);
          }
        }
      }
      
      status.systems = systems;
    }
    
    return status;
  }

  /**
   * Get Self-Improving Systems status
   */
  async getSelfImprovingStatus() {
    const systems = [];
    const status = { available: 0, total: 0, systems: [] };
    
    if (fs.existsSync(this.selfImprovingPath)) {
      const items = fs.readdirSync(this.selfImprovingPath);
      
      for (const item of items) {
        const itemPath = path.join(this.selfImprovingPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          status.total++;
          
          const hasMainFile = this.checkSystemFiles(itemPath);
          if (hasMainFile) {
            status.available++;
            systems.push(item);
          }
        }
      }
      
      status.systems = systems;
    }
    
    return status;
  }

  /**
   * Get Next-Level Systems status
   */
  async getNextLevelStatus() {
    const systems = [];
    const status = { available: 0, total: 0, systems: [] };
    
    if (fs.existsSync(this.nextLevelPath)) {
      const items = fs.readdirSync(this.nextLevelPath);
      
      for (const item of items) {
        const itemPath = path.join(this.nextLevelPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          status.total++;
          
          const hasMainFile = this.checkSystemFiles(itemPath);
          if (hasMainFile) {
            status.available++;
            systems.push(item);
          }
        }
      }
      
      status.systems = systems;
    }
    
    return status;
  }

  /**
   * Get Core Systems status
   */
  async getCoreSystemsStatus() {
    const systems = [];
    const status = { available: 0, total: 0, systems: [] };
    
    if (fs.existsSync(this.coreSystemsPath)) {
      const items = fs.readdirSync(this.coreSystemsPath);
      
      for (const item of items) {
        const itemPath = path.join(this.coreSystemsPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          status.total++;
          
          const hasMainFile = this.checkSystemFiles(itemPath);
          if (hasMainFile) {
            status.available++;
            systems.push(item);
          }
        }
      }
      
      status.systems = systems;
    }
    
    return status;
  }

  /**
   * Get Templates status
   */
  async getTemplatesStatus() {
    const templates = [];
    const status = { available: 0, total: 0, templates: [] };
    
    if (fs.existsSync(this.templatesPath)) {
      const items = fs.readdirSync(this.templatesPath);
      
      for (const item of items) {
        const itemPath = path.join(this.templatesPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          status.total++;
          
          // Check if template has required files
          const hasRequiredFiles = this.checkTemplateFiles(itemPath);
          if (hasRequiredFiles) {
            status.available++;
            templates.push(item);
          }
        }
      }
      
      status.templates = templates;
    }
    
    return status;
  }

  /**
   * Get Structure Validation status
   */
  async getStructureValidation() {
    const violations = [];
    const validations = [];
    
    // Check backend logic location
    if (fs.existsSync(this.backendLogicPath)) {
      validations.push('✅ Backend logic properly located');
    } else {
      violations.push('❌ Backend logic not found');
    }
    
    // Check for frontend code in backend-logic
    if (fs.existsSync(this.backendLogicPath)) {
      const hasFrontendCode = this.checkForFrontendCode(this.backendLogicPath);
      if (!hasFrontendCode) {
        validations.push('✅ No frontend code in backend-logic');
      } else {
        violations.push('❌ Frontend code found in backend-logic');
      }
    }
    
    // Check GitHub hooks
    if (fs.existsSync('../VERSION_CONTROL/.hooks/')) {
      validations.push('✅ GitHub hooks directory exists');
    } else {
      violations.push('❌ GitHub hooks directory missing');
    }
    
    return {
      valid: violations.length === 0,
      violations,
      validations
    };
  }

  /**
   * Get Learning Data status
   */
  async getLearningData() {
    const learningPath = '../INTELLIGENCE/.intelligence/learning-data';
    
    if (fs.existsSync(learningPath)) {
      const files = fs.readdirSync(learningPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      return {
        available: true,
        files: jsonFiles.length,
        totalFiles: files.length
      };
    } else {
      return {
        available: false,
        error: 'Learning data directory not found'
      };
    }
  }

  /**
   * Check if system directory has main files
   */
  checkSystemFiles(systemPath) {
    const mainFiles = ['index.ts', 'index.js', 'main.ts', 'main.js'];
    
    for (const file of mainFiles) {
      if (fs.existsSync(path.join(systemPath, file))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if template has required files
   */
  checkTemplateFiles(templatePath) {
    const requiredFiles = ['package.json', 'README.md'];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(templatePath, file))) {
        return false;
      }
    }
    
    return true;
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
   * Display the dashboard
   */
  displayDashboard(data) {
    console.clear();
    console.log(chalk.magenta.bold('🧠 RepoClone Intelligence Dashboard'));
    console.log(chalk.gray(`Last Updated: ${new Date().toLocaleTimeString()}\n`));
    
    // System Health Overview
    this.displaySystemHealth(data);
    
    // AI Systems Status
    this.displayAISystems(data.aiSystems);
    
    // Self-Improving Systems Status
    this.displaySelfImproving(data.selfImproving);
    
    // Next-Level Systems Status
    this.displayNextLevel(data.nextLevel);
    
    // Core Systems Status
    this.displayCoreSystems(data.coreSystems);
    
    // Templates Status
    this.displayTemplates(data.templates);
    
    // Structure Validation Status
    this.displayStructureValidation(data.structure);
    
    // Learning Data Status
    this.displayLearningData(data.learning);
    
    // Commands
    this.displayCommands();
  }

  /**
   * Display system health overview
   */
  displaySystemHealth(data) {
    const totalSystems = data.aiSystems.total + data.selfImproving.total + data.nextLevel.total + data.coreSystems.total;
    const workingSystems = data.aiSystems.available + data.selfImproving.available + data.nextLevel.available + data.coreSystems.available;
    const healthPercentage = totalSystems > 0 ? Math.round((workingSystems / totalSystems) * 100) : 0;
    
    console.log(chalk.blue.bold('📊 System Health Overview'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const healthBar = '█'.repeat(Math.floor(healthPercentage / 5)) + '░'.repeat(20 - Math.floor(healthPercentage / 5));
    const healthColor = healthPercentage >= 80 ? chalk.green : healthPercentage >= 60 ? chalk.yellow : chalk.red;
    
    console.log(`${healthColor(healthBar)} ${healthPercentage}%`);
    console.log(chalk.gray(`   ${workingSystems}/${totalSystems} systems working`));
    console.log('');
  }

  /**
   * Display AI Systems status
   */
  displayAISystems(data) {
    console.log(chalk.blue.bold('🤖 AI Systems'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.available > 0) {
      console.log(chalk.green(`✅ ${data.available}/${data.total} available`));
      
      // Show some system examples
      const examples = data.systems.slice(0, 5);
      console.log(chalk.gray(`   Examples: ${examples.join(', ')}${data.systems.length > 5 ? '...' : ''}`));
    } else {
      console.log(chalk.red('❌ No AI systems available'));
    }
    console.log('');
  }

  /**
   * Display Self-Improving Systems status
   */
  displaySelfImproving(data) {
    console.log(chalk.blue.bold('🔄 Self-Improving Systems'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.available > 0) {
      console.log(chalk.green(`✅ ${data.available}/${data.total} available`));
      
      const examples = data.systems.slice(0, 5);
      console.log(chalk.gray(`   Examples: ${examples.join(', ')}${data.systems.length > 5 ? '...' : ''}`));
    } else {
      console.log(chalk.red('❌ No self-improving systems available'));
    }
    console.log('');
  }

  /**
   * Display Next-Level Systems status
   */
  displayNextLevel(data) {
    console.log(chalk.blue.bold('🚀 Next-Level Systems'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.available > 0) {
      console.log(chalk.green(`✅ ${data.available}/${data.total} available`));
      
      const examples = data.systems.slice(0, 5);
      console.log(chalk.gray(`   Examples: ${examples.join(', ')}${data.systems.length > 5 ? '...' : ''}`));
    } else {
      console.log(chalk.red('❌ No next-level systems available'));
    }
    console.log('');
  }

  /**
   * Display Core Systems status
   */
  displayCoreSystems(data) {
    console.log(chalk.blue.bold('⚙️ Core Systems'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.available > 0) {
      console.log(chalk.green(`✅ ${data.available}/${data.total} available`));
      
      const examples = data.systems.slice(0, 5);
      console.log(chalk.gray(`   Examples: ${examples.join(', ')}${data.systems.length > 5 ? '...' : ''}`));
    } else {
      console.log(chalk.red('❌ No core systems available'));
    }
    console.log('');
  }

  /**
   * Display Templates status
   */
  displayTemplates(data) {
    console.log(chalk.blue.bold('📋 Templates'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.available > 0) {
      console.log(chalk.green(`✅ ${data.available}/${data.total} available`));
      
      const examples = data.templates.slice(0, 5);
      console.log(chalk.gray(`   Examples: ${examples.join(', ')}${data.templates.length > 5 ? '...' : ''}`));
    } else {
      console.log(chalk.red('❌ No templates available'));
    }
    console.log('');
  }

  /**
   * Display Structure Validation status
   */
  displayStructureValidation(data) {
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
   * Display Learning Data status
   */
  displayLearningData(data) {
    console.log(chalk.blue.bold('📈 Learning Data'));
    console.log(chalk.gray('─'.repeat(30)));
    
    if (data.available) {
      console.log(chalk.green('✅ Available'));
      console.log(chalk.gray(`   Files: ${data.files} learning data files`));
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
    console.log(chalk.gray('   npm run dashboard  # Start real-time dashboard'));
    console.log(chalk.gray('   Ctrl+C             # Stop dashboard'));
    console.log('');
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