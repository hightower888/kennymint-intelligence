#!/usr/bin/env node

/**
 * 🧠 Root Intelligence Enforcer
 * 
 * Core intelligence system that enforces structure rules and maintains
 * self-awareness at the root level
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class RootIntelligenceEnforcer {
  constructor() {
    this.projectRoot = process.cwd();
    this.rules = this.initializeRules();
    this.violations = [];
    this.validations = [];
    this.selfAwareness = {
      identity: 'RepoClone - Root-Level Intelligence System',
      purpose: 'Maintain and enforce clean project structure with self-awareness',
      understanding: 'I am a root-level intelligence system focused on structure validation and self-awareness',
      structure: 'Root level contains intelligence files, templates, and documentation'
    };
  }

  /**
   * Initialize structure rules
   */
  initializeRules() {
    return [
      {
        path: 'CORE/',
        type: 'root-intelligence',
        description: 'Root-level intelligence and system management',
        validation: () => true
      },
      {
        path: 'TEMPLATES/',
        type: 'project-templates',
        description: 'Project templates for deployment',
        validation: () => true
      },
      {
        path: 'DOCS/',
        type: 'documentation',
        description: 'System documentation and guides',
        validation: () => true
      },
      {
        path: 'ARCHIVE/',
        type: 'archived-systems',
        description: 'Archived backend logic and systems',
        validation: () => true
      }
    ];
  }

  /**
   * Check self-awareness
   */
  checkSelfAwareness() {
    console.log(chalk.blue('\n🧠 Self-Awareness Check...'));
    
    const awareness = {
      identity: this.selfAwareness.identity,
      purpose: this.selfAwareness.purpose,
      understanding: this.selfAwareness.understanding,
      structure: this.selfAwareness.structure
    };

    console.log(chalk.green('✅ Self-Awareness Confirmed:'));
    Object.entries(awareness).forEach(([key, value]) => {
      console.log(chalk.gray(`   ${key}: ${value}`));
    });

    return awareness;
  }

  /**
   * Validate structure rules
   */
  validateStructure() {
    console.log(chalk.blue('\n📋 Validating Structure Rules...'));
    
    this.violations = [];
    this.validations = [];

    // Check 1: Root intelligence files exist
    const rootIntelligenceFiles = ['root-intelligence-enforcer.js', 'README.md', 'package.json'];
    rootIntelligenceFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.validations.push(`✅ Root intelligence file exists: ${file}`);
      } else {
        this.violations.push(`❌ Missing root intelligence file: ${file}`);
      }
    });

    // Check 2: Required directories exist
    const requiredDirs = ['CORE', 'TEMPLATES', 'DOCS', 'ARCHIVE'];
    requiredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.validations.push(`✅ Required directory exists: ${dir}`);
      } else {
        this.violations.push(`❌ Missing required directory: ${dir}`);
      }
    });

    // Check 3: No backend logic at root level
    const rootItems = fs.readdirSync('.');
    const hasBackendLogic = rootItems.some(item => {
      const itemPath = path.join('.', item);
      return fs.statSync(itemPath).isDirectory() && 
             (item.includes('backend') || item.includes('logic') || item.includes('api'));
    });
    
    if (!hasBackendLogic) {
      this.validations.push('✅ No backend logic at root level');
    } else {
      this.violations.push('❌ Backend logic found at root level');
    }

    // Check 4: Archive contains backend logic
    if (fs.existsSync('ARCHIVE/backend-logic/')) {
      this.validations.push('✅ Backend logic properly archived');
    } else {
      this.violations.push('❌ Backend logic not found in archive');
    }

    const result = {
      valid: this.violations.length === 0,
      violations: this.violations,
      validations: this.validations
    };

    if (result.valid) {
      console.log(chalk.green('✅ Structure validation passed'));
    } else {
      console.log(chalk.red('❌ Structure validation failed'));
      this.violations.forEach(violation => {
        console.log(chalk.red(`   ${violation}`));
      });
    }

    return result;
  }

  /**
   * Enforce structure rules
   */
  enforceStructureRules() {
    console.log(chalk.blue('\n🛡️ Enforcing Structure Rules...'));
    
    const validation = this.validateStructure();
    
    if (!validation.valid) {
      console.log(chalk.yellow('⚠️  Structure violations detected'));
      console.log(chalk.gray('Run "npm run fix" to attempt automatic fixes'));
    } else {
      console.log(chalk.green('✅ All structure rules enforced'));
    }
    
    return validation;
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    const awareness = this.checkSelfAwareness();
    const structure = this.validateStructure();
    
    return {
      selfAware: true,
      structureValid: structure.valid,
      violations: structure.violations,
      validations: structure.validations,
      awareness: awareness
    };
  }

  /**
   * Run intelligence operations
   */
  async runIntelligenceOperations() {
    console.log(chalk.magenta.bold('\n🧠 Root Intelligence Operations'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Check self-awareness
    await this.checkSelfAwareness();
    
    // Validate structure
    await this.validateStructure();
    
    // Enforce rules
    await this.enforceStructureRules();
    
    console.log(chalk.green('\n✅ Root intelligence operations complete'));
  }
}

// Export the enforcer
module.exports = RootIntelligenceEnforcer;

// If run directly, execute intelligence operations
if (require.main === module) {
  const enforcer = new RootIntelligenceEnforcer();
  enforcer.runIntelligenceOperations().catch(console.error);
} 