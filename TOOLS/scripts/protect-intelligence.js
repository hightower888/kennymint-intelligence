#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const IntelligenceEnforcer = require('./enforce-intelligence');

class IntelligenceProtector {
  constructor() {
    this.rootDir = process.cwd();
    this.protectionInterval = 30000; // Check every 30econds
    this.isProtected = false;
  }

  async startProtection() {
    console.log(chalk.magenta.bold(`
╔═══════════════════════════════════════════════════════════╗
║              🛡️  REPOCLONE INTELLIGENCE PROTECTOR 🛡️              ║
║                  Continuous Rule Enforcement                ║
╚═══════════════════════════════════════════════════════════╝
`));

    // Initial protection check
    await this.performProtectionCheck();

    // Set up continuous protection
    this.protectionInterval = setInterval(async () => {
      await this.performProtectionCheck();
    }, this.protectionInterval);

    // Set up graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛡️  Shutting down intelligence protector...'));
      clearInterval(this.protectionInterval);
      process.exit(0);
    });

    console.log(chalk.green('✅ Intelligence protection active'));
    console.log(chalk.cyan('🔒 Monitoring for intelligence violations...'));
    console.log(chalk.cyan('⏰ Protection checks every 30ds'));
    console.log(chalk.cyan('nPress Ctrl+C to stop protection\n'));
  }

  async performProtectionCheck() {
    try {
      const enforcer = new IntelligenceEnforcer();
      const isCompliant = await enforcer.enforceIntelligence();

      if (!isCompliant) {
        console.log(chalk.red('🚨 INTELLIGENCE VIOLATION DETECTED!'));
        console.log(chalk.red('🛡️  Protection system activated'));
        
        // Attempt auto-fix for non-critical violations
        await this.attemptAutoFix();
        
        // Log violation for dashboard
        await this.logViolation();
      } else if (!this.isProtected) {
        console.log(chalk.green('✅ Intelligence system is protected'));
        this.isProtected = true;
      }
    } catch (error) {
      console.log(chalk.red('❌ Protection check failed:', error.message));
    }
  }

  async attemptAutoFix() {
    console.log(chalk.yellow('🔧 Attempting automatic fixes...'));
    
    try {
      // Check for missing intelligence files and create them
      const intelligenceFiles = ['INTELLIGENCE.md', 'STRUCTURE_RULES.md'];
      
      for (const file of intelligenceFiles) {
        const filePath = path.join(this.rootDir, file);
        if (!await fs.pathExists(filePath)) {
          const enforcer = new IntelligenceEnforcer();
          if (file === 'INTELLIGENCE.md') {
            await enforcer.createIntelligenceFile();
          } else if (file === 'STRUCTURE_RULES.md') {
            await enforcer.createStructureRulesFile();
          }
          console.log(chalk.green(`✓ Auto-created ${file}`));
        }
      }

      // Check for forbidden directories and warn
      const forbiddenDirs = ['backend-logic', 'ai-systems', 'core-systems'];
      for (const dir of forbiddenDirs) {
        const dirPath = path.join(this.rootDir, dir);
        if (await fs.pathExists(dirPath)) {
          console.log(chalk.red(`⚠️  CRITICAL: ${dir} found at root level!`));
          console.log(chalk.yellow(`💡 Manual fix required: Move ${dir} to RepoCloneMeta/backend-logic/`));
        }
      }

    } catch (error) {
      console.log(chalk.red('❌Auto-fix failed:', error.message));
    }
  }

  async logViolation() {
    try {
      const reportPath = path.join(this.rootDir, '.intelligence', 'protection-report.json');
      await fs.ensureDir(path.dirname(reportPath));
      
      const report = await fs.pathExists(reportPath) 
        ? await fs.readJson(reportPath) 
        : { violations: [], protectionChecks: [] };
      
      report.protectionChecks.push({
        timestamp: new Date().toISOString(),
        type: 'intelligence_violation',
        message: 'Intelligence system compliance check failed, action:auto_fix_attempted'
      });
      
      await fs.writeJson(reportPath, report, { spaces:2 });
    } catch (error) {
      console.log(chalk.red('❌ Failed to log violation:', error.message));
    }
  }

  async createBackup() {
    try {
      const backupDir = path.join(this.rootDir, '.intelligence', 'backups');
      await fs.ensureDir(backupDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `intelligence-backup-${timestamp}`);
      
      const intelligenceFiles = ['README.md', 'INTELLIGENCE.md', 'STRUCTURE_RULES.md', 'package.json', 'index.js'];
      
      for (const file of intelligenceFiles) {
        const sourcePath = path.join(this.rootDir, file);
        if (await fs.pathExists(sourcePath)) {
          const destPath = path.join(backupPath, file);
          await fs.ensureDir(path.dirname(destPath));
          await fs.copy(sourcePath, destPath);
        }
      }
      
      console.log(chalk.green(`✓ Intelligence backup created: ${backupPath}`));
    } catch (error) {
      console.log(chalk.red('❌ Backup failed:', error.message));
    }
  }
}

// Run protection
async function main() {
  const protector = new IntelligenceProtector();
  
  // Create initial backup
  await protector.createBackup();
  
  // Start protection
  await protector.startProtection();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = IntelligenceProtector; 