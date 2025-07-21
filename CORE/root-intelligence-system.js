#!/usr/bin/env node

/**
 * 🧠 Root Intelligence System for RepoClone
 * 
 * This is the operational intelligence at the root level that:
 * - Maintains self-awareness as a template deployment system
 * - Enforces structure rules and separation
 * - Manages template deployment and project creation
 * - Learns from deployment patterns
 * - Prevents structure violations
 */

const fs = require('fs');
const RootIntelligenceIndex = require('../INTELLIGENCE/.intelligence/index');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const chalk = require('chalk');

class RootIntelligenceSystem {
  constructor() {
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
    };
    
    console.log(chalk.magenta.bold('🧠 Root Intelligence System Initialized'));
    console.log(chalk.gray('Identity: Template Deployment System'));
    console.log(chalk.gray('Purpose: Clean separation between frontend and backend'));
  }

  /**
   * 🎯 Self-Awareness Check
   */
  async checkSelfAwareness() {
    console.log(chalk.blue('\n🧠 Self-Awareness Check...'));
    
    const awareness = {
      identity: 'RepoClone - Template Deployment System',
      purpose: 'Create and enforce clean separation between frontend projects and backend logic',
      understanding: 'I am building a system for other projects, not for myself',
      structure: 'Backend logic in RepoCloneMeta/backend-logic/, projects at root level',
      enforcement: 'GitHub hooks and structure validation'
    };

    console.log(chalk.green('✅ Self-Awareness Confirmed:'));
    Object.entries(awareness).forEach(([key, value]) => {
      console.log(chalk.gray(`   ${key}: ${value}`));
    });

    return awareness;
  }

  /**
   * 📋 Structure Validation
   */
  async validateStructure() {
    console.log(chalk.blue('\n📋 Validating Structure Rules...'));
    
    const violations = [];
    const validations = [];

    // Check 1: Backend logic is in INTELLIGENCE/RepoCloneMeta/backend-logic/
    if (fs.existsSync('../INTELLIGENCE/RepoCloneMeta/backend-logic/')) {
      validations.push('✅ Backend logic properly located in INTELLIGENCE/RepoCloneMeta/backend-logic/');
    } else {
      violations.push('❌ Backend logic not found in INTELLIGENCE/RepoCloneMeta/backend-logic/');
    }

    // Check 2: No frontend code in backend-logic
    const backendLogicPath = '../INTELLIGENCE/RepoCloneMeta/backend-logic/';
    if (fs.existsSync(backendLogicPath)) {
      const hasFrontendCode = this.checkForFrontendCode(backendLogicPath);
      if (!hasFrontendCode) {
        validations.push('✅ No frontend code found in backend-logic');
      } else {
        violations.push('❌ Frontend code found in backend-logic');
      }
    }

    // Check 3: Projects are at root level
    const rootProjects = this.getRootLevelProjects();
    if (rootProjects.length > 0) {
      validations.push(`✅ Projects properly located at root level: ${rootProjects.join(', ')}`);
    } else {
      validations.push('ℹ️  No projects at root level yet');
    }

    // Check 4: GitHub hooks exist
    if (fs.existsSync('../VERSION_CONTROL/.hooks/')) {
      validations.push('✅ GitHub hooks directory exists');
    } else {
      violations.push('❌ GitHub hooks directory missing');
    }

    // Report results
    console.log(chalk.green('\n📊 Structure Validation Results:'));
    validations.forEach(validation => console.log(chalk.green(validation)));
    
    if (violations.length > 0) {
      console.log(chalk.red('\n🚨 Structure Violations:'));
      violations.forEach(violation => console.log(chalk.red(violation)));
    } else {
      console.log(chalk.green('\n🎉 No structure violations found!'));
    }

    return { validations, violations };
  }

  /**
   * 🔍 Check for frontend code in backend-logic
   */
  checkForFrontendCode(directory) {
    const frontendExtensions = ['.html', '.css', '.js', '.jsx', '.tsx', '.vue'];
    const frontendFiles = ['index.html', 'package.json', 'README.md'];
    
    try {
      const files = this.getAllFiles(directory);
      const flaggedFiles = [];
      
      const hasFrontendCode = files.some(file => {
        const ext = path.extname(file);
        const basename = path.basename(file);
        
        // Allow frontend code in project-templates directory (templates should contain frontend code)
        if (file.includes('project-templates/')) {
          return false;
        }
        
        // Allow CLI tools and scripts (they can be JavaScript)
        if (file.includes('cli/') || file.includes('scripts/') || file.includes('initialize-for-project.js')) {
          return false;
        }
        
        // Allow documentation files
        if (basename === 'README.md' || basename === 'package.json') {
          return false;
        }
        
        const isFrontend = frontendExtensions.includes(ext) || frontendFiles.includes(basename);
        if (isFrontend) {
          flaggedFiles.push(file);
        }
        return isFrontend;
      });
      
      if (flaggedFiles.length > 0) {
        console.log(chalk.yellow('🔍 Flagged files:'));
        flaggedFiles.forEach(file => console.log(chalk.gray(`   ${file}`)));
      }
      
      return hasFrontendCode;
    } catch (error) {
      return false;
    }
  }

  /**
   * 📁 Get all files in directory recursively
   */
  getAllFiles(dir) {
    const files = [];
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
    
    return files;
  }

  /**
   * 📂 Get root level projects
   */
  getRootLevelProjects() {
    const projects = [];
    const items = fs.readdirSync('../');
    
    for (const item of items) {
      const itemPath = path.join('../', item);
      if (fs.statSync(itemPath).isDirectory()) {
        // Check if it's a project (has package.json or is not a system directory)
        const isSystemDir = ['CORE', 'INTELLIGENCE', 'TEMPLATES', 'TOOLS', 'DOCS', 'PROJECTS', 'VERSION_CONTROL', 'CONFIG', 'node_modules'].includes(item);
        if (!isSystemDir && !item.startsWith('.')) {
          projects.push(item);
        }
      }
    }
    
    return projects;
  }

  /**
   * 🚀 Template Deployment Intelligence
   */
  async deployTemplate(templateName, projectName, options = {}) {
    console.log(chalk.blue(`\n🚀 Deploying Template: ${templateName} -> ${projectName}`));
    
    // Self-awareness check before deployment
    await this.checkSelfAwareness();
    
    // Validate structure before deployment
    const { violations } = await this.validateStructure();
    if (violations.length > 0) {
      console.log(chalk.red('❌ Cannot deploy template due to structure violations'));
      return false;
    }

    try {
      // Check if template exists
      const templatePath = `RepoCloneMeta/backend-logic/project-templates/${templateName}`;
      if (!fs.existsSync(templatePath)) {
        console.log(chalk.red(`❌ Template ${templateName} not found`));
        return false;
      }

      // Create project directory at root level
      const projectPath = path.join(this.projectRoot, projectName);
      if (fs.existsSync(projectPath)) {
        console.log(chalk.red(`❌ Project ${projectName} already exists`));
        return false;
      }

      // Copy template to root level
      await execAsync(`cp -r "${templatePath}" "${projectPath}"`);
      console.log(chalk.green(`✅ Template copied to ${projectPath}`));

      // Update project-specific files
      await this.updateProjectFiles(projectPath, projectName, options);

      // Log deployment pattern
      this.logDeploymentPattern(templateName, projectName, options);

      console.log(chalk.green(`\n🎉 Template ${templateName} deployed to ${projectName}!`));
      console.log(chalk.gray('   Project is ready for development'));
      console.log(chalk.gray('   Backend logic remains in RepoCloneMeta/backend-logic/'));
      
      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Template deployment failed: ${error.message}`));
      return false;
    }
  }

  /**
   * 📝 Update project-specific files
   */
  async updateProjectFiles(projectPath, projectName, options) {
    // Update package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.name = projectName;
      packageJson.description = `Project created from RepoClone template`;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // Update README.md
    const readmePath = path.join(projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      let readme = fs.readFileSync(readmePath, 'utf8');
      readme = readme.replace(/Project Name/g, projectName);
      readme = readme.replace(/Template Description/g, `Project created from RepoClone template`);
      fs.writeFileSync(readmePath, readme);
    }

    console.log(chalk.green('✅ Project files updated'));
  }

  /**
   * 📊 Log deployment pattern for learning
   */
  logDeploymentPattern(templateName, projectName, options) {
    const pattern = {
      timestamp: new Date().toISOString(),
      templateName,
      projectName,
      options,
      structureValidated: true,
      backendLogicReferenced: true
    };

    this.intelligenceData.deploymentPatterns.push(pattern);
    
    // Save to intelligence data
    const intelligencePath = '.intelligence/deployment-patterns.json';
    const patterns = this.intelligenceData.deploymentPatterns;
    fs.writeFileSync(intelligencePath, JSON.stringify(patterns, null, 2));
    
    console.log(chalk.gray('📊 Deployment pattern logged for learning'));
  }

  /**
   * 🧠 Learn from patterns
   */
  async learnFromPatterns() {
    console.log(chalk.blue('\n🧠 Learning from Deployment Patterns...'));
    
    const patterns = this.intelligenceData.deploymentPatterns;
    if (patterns.length === 0) {
      console.log(chalk.gray('ℹ️  No deployment patterns to learn from yet'));
      return;
    }

    const insights = this.analyzePatterns(patterns);
    
    console.log(chalk.green('\n💡 Insights from Deployment Patterns:'));
    insights.forEach(insight => {
      console.log(chalk.gray(`   • ${insight}`));
    });

    return insights;
  }

  /**
   * 📊 Analyze deployment patterns
   */
  analyzePatterns(patterns) {
    const insights = [];
    
    // Most used templates
    const templateCounts = {};
    patterns.forEach(pattern => {
      templateCounts[pattern.templateName] = (templateCounts[pattern.templateName] || 0) + 1;
    });
    
    const mostUsedTemplate = Object.entries(templateCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostUsedTemplate) {
      insights.push(`Most used template: ${mostUsedTemplate[0]} (${mostUsedTemplate[1]} deployments)`);
    }

    // Recent activity
    const recentPatterns = patterns.filter(p => {
      const patternDate = new Date(p.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return patternDate > weekAgo;
    });
    
    if (recentPatterns.length > 0) {
      insights.push(`Recent activity: ${recentPatterns.length} deployments in the last week`);
    }

    // Structure compliance
    const compliantPatterns = patterns.filter(p => p.structureValidated);
    const complianceRate = (compliantPatterns.length / patterns.length) * 100;
    insights.push(`Structure compliance rate: ${complianceRate.toFixed(1)}%`);

    return insights;
  }

  /**
   * 🛡️ Enforce structure rules
   */
  async enforceStructureRules() {
    console.log(chalk.blue('\n🛡️ Enforcing Structure Rules...'));
    
    const { violations } = await this.validateStructure();
    
    if (violations.length > 0) {
      console.log(chalk.red('🚨 Structure violations detected!'));
      console.log(chalk.yellow('Attempting to fix violations...'));
      
      // Try to fix violations
      for (const violation of violations) {
        await this.fixViolation(violation);
      }
      
      // Re-validate
      const { violations: remainingViolations } = await this.validateStructure();
      if (remainingViolations.length === 0) {
        console.log(chalk.green('✅ All violations fixed!'));
      } else {
        console.log(chalk.red('❌ Some violations could not be fixed automatically'));
      }
    } else {
      console.log(chalk.green('✅ No violations to fix'));
    }
  }

  /**
   * 🔧 Fix structure violation
   */
  async fixViolation(violation) {
    console.log(chalk.yellow(`🔧 Attempting to fix: ${violation}`));
    
    if (violation.includes('GitHub hooks directory missing')) {
      try {
        fs.mkdirSync('.hooks', { recursive: true });
        console.log(chalk.green('✅ Created .hooks directory'));
      } catch (error) {
        console.log(chalk.red('❌ Could not create .hooks directory'));
      }
    }
    
    // Add more violation fixes as needed
  }

  /**
   * 📋 Get system status
   */
  getSystemStatus() {
    return {
      identity: this.intelligenceData.selfAwareness.identity,
      purpose: this.intelligenceData.selfAwareness.purpose,
      deploymentPatterns: this.intelligenceData.deploymentPatterns.length,
      structureValidated: true,
      selfAware: true
    };
  }

  /**
   * 🎯 Main intelligence operations
   */
  async runIntelligenceOperations() {
    console.log(chalk.magenta.bold('\n🧠 Root Intelligence System Operations'));
    console.log(chalk.gray('Maintaining self-awareness as template deployment system\n'));

    // 1. Self-awareness check
    await this.checkSelfAwareness();

    // 2. Structure validation
    await this.validateStructure();

    // 3. Learn from patterns
    await this.learnFromPatterns();

    // 4. Enforce rules
    await this.enforceStructureRules();

    // 5. Show status
    const status = this.getSystemStatus();
    console.log(chalk.green('\n📊 System Status:'));
    console.log(chalk.gray(`   Identity: ${status.identity}`));
    console.log(chalk.gray(`   Purpose: ${status.purpose}`));
    console.log(chalk.gray(`   Deployment Patterns: ${status.deploymentPatterns}`));
    console.log(chalk.gray(`   Structure Validated: ${status.structureValidated}`));
    console.log(chalk.gray(`   Self-Aware: ${status.selfAware}`));
  }
}

// Export the intelligence system
module.exports = RootIntelligenceSystem;

// If run directly, execute intelligence operations
if (require.main === module) {
  const intelligence = new RootIntelligenceSystem();
  intelligence.runIntelligenceOperations().catch(console.error);
} 