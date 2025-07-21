#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const IntelligenceEnforcer = require('./enforce-intelligence');

console.log(chalk.magenta.bold(`
╔═══════════════════════════════════════════════════════════╗
║                 🤖 REPOCLONE AI MONITOR 🤖                 ║
║              Continuous Intelligence Enforcement            ║
╚═══════════════════════════════════════════════════════════╝
`));

class RepoCloneAIMonitor {
  constructor() {
    this.rootPath = path.resolve(__dirname, '..');
    this.violations = [];
    this.learnings = [];
    this.startTime = Date.now();
  }

  async start() {
    console.log(chalk.green('✓ AI Monitor Activated'));
    console.log(chalk.yellow('👁️  Watching for structure violations...'));
    console.log(chalk.cyan('🧠 Learning from patterns...\n'));

    // Initialize watcher
    this.watcher = chokidar.watch(this.rootPath, {
      ignored: [
        /(^|[\/\\])\../, // ignore dotfiles
        /node_modules/,
        /\.git/
      ],
      persistent: true,
      ignoreInitial: false
    });

    // Set up event handlers
    this.watcher
      .on('add', path => this.handleFileAdd(path))
      .on('addDir', path => this.handleDirAdd(path))
      .on('change', path => this.handleFileChange(path))
      .on('unlink', path => this.handleFileRemove(path))
      .on('unlinkDir', path => this.handleDirRemove(path))
      .on('error', error => console.error(chalk.red('Watcher error:'), error));

    // Periodic intelligence report
    setInterval(() => this.generateIntelligenceReport(), 30000); // Every 30 seconds

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown());
  }

  handleFileAdd(filePath) {
    const relativePath = path.relative(this.rootPath, filePath);
    
    // Check for violations
    if (this.isViolation(filePath)) {
      this.logViolation('FILE_ADDED', relativePath, 'File added in forbidden location');
    } else {
      console.log(chalk.gray(`  ✓ File added: ${relativePath}`));
    }
  }

  handleDirAdd(dirPath) {
    const relativePath = path.relative(this.rootPath, dirPath);
    
    // Check if backend-logic is being created at root
    if (relativePath === 'backend-logic') {
      this.logViolation('DIR_CREATED', relativePath, 'backend-logic should be in RepoCloneMeta!');
      this.suggestFix('Move backend-logic to RepoCloneMeta/backend-logic');
    }
    
    // Check if AI systems are being created at root
    if (['ai-systems', 'core-systems'].includes(relativePath)) {
      this.logViolation('DIR_CREATED', relativePath, `${relativePath} should be in RepoCloneMeta!`);
      this.suggestFix(`Move ${relativePath} to RepoCloneMeta/${relativePath}`);
    }
    
    // Learn from new project creation
    if (this.isProjectDir(dirPath)) {
      this.learn('PROJECT_CREATED', `New project created: ${relativePath}`);
      console.log(chalk.green(`  🚀 New project detected: ${relativePath}`));
    }
  }

  handleFileChange(filePath) {
    const relativePath = path.relative(this.rootPath, filePath);
    
    // Monitor intelligence files
    if (['README.md', 'INTELLIGENCE.md', 'STRUCTURE_RULES.md'].includes(path.basename(filePath))) {
      console.log(chalk.yellow(`  📝 Intelligence file updated: ${relativePath}`));
      this.learn('INTELLIGENCE_UPDATE', `Intelligence file modified: ${relativePath}`);
    }
  }

  handleFileRemove(filePath) {
    const relativePath = path.relative(this.rootPath, filePath);
    console.log(chalk.gray(`  - File removed: ${relativePath}`));
  }

  handleDirRemove(dirPath) {
    const relativePath = path.relative(this.rootPath, dirPath);
    console.log(chalk.gray(`  - Directory removed: ${relativePath}`));
  }

  isViolation(filePath) {
    const relativePath = path.relative(this.rootPath, filePath);
    
    // Check if backend files are at root
    if (relativePath.startsWith('backend-logic/') || 
        relativePath.startsWith('ai-systems/') || 
        relativePath.startsWith('core-systems/')) {
      return true;
    }
    
    // Check if project files are inside RepoCloneMeta
    if (relativePath.startsWith('RepoCloneMeta/') && 
        !relativePath.includes('backend-logic') &&
        (relativePath.endsWith('App.tsx') || relativePath.endsWith('App.jsx'))) {
      return true;
    }
    
    return false;
  }

  isProjectDir(dirPath) {
    const relativePath = path.relative(this.rootPath, dirPath);
    const parts = relativePath.split(path.sep);
    
    // Project should be at root level, not nested
    return parts.length === 1 && 
           !['RepoCloneMeta', 'RepoCloneApp', 'node_modules', 'scripts', '.git'].includes(parts[0]) &&
           !parts[0].startsWith('.');
  }

  logViolation(type, path, message) {
    const violation = {
      type,
      path,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.violations.push(violation);
    console.log(chalk.red.bold(`\n⚠️  VIOLATION DETECTED!`));
    console.log(chalk.red(`  Type: ${type}`));
    console.log(chalk.red(`  Path: ${path}`));
    console.log(chalk.red(`  Issue: ${message}`));
    console.log(chalk.red(`  Time: ${violation.timestamp}\n`));
  }

  suggestFix(suggestion) {
    console.log(chalk.yellow(`  💡 Suggested fix: ${suggestion}`));
  }

  learn(type, insight) {
    this.learnings.push({
      type,
      insight,
      timestamp: new Date().toISOString()
    });
  }

  generateIntelligenceReport() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    console.log(chalk.cyan.bold('\n📊 Intelligence Report'));
    console.log(chalk.gray(`  Uptime: ${uptime}s`));
    console.log(chalk.gray(`  Violations: ${this.violations.length}`));
    console.log(chalk.gray(`  Learnings: ${this.learnings.length}`));
    
    if (this.violations.length > 0) {
      console.log(chalk.red('\n  Recent Violations:'));
      this.violations.slice(-3).forEach(v => {
        console.log(chalk.red(`    • ${v.path}: ${v.message}`));
      });
    }
    
    if (this.learnings.length > 0) {
      console.log(chalk.green('\n  Recent Learnings:'));
      this.learnings.slice(-3).forEach(l => {
        console.log(chalk.green(`    • ${l.insight}`));
      });
    }
    
    console.log(chalk.blue('\n  Status: Monitoring active...\n'));
  }

  async shutdown() {
    console.log(chalk.yellow('\n\n🛑 Shutting down AI Monitor...'));
    
    // Save learnings and violations
    const report = {
      violations: this.violations,
      learnings: this.learnings,
      sessionEnd: new Date().toISOString(),
      sessionDuration: Date.now() - this.startTime
    };
    
    const reportPath = path.join(this.rootPath, '.intelligence', 'monitor-report.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    console.log(chalk.green(`  ✓ Report saved to .intelligence/monitor-report.json`));
    console.log(chalk.green(`  ✓ Total violations: ${this.violations.length}`));
    console.log(chalk.green(`  ✓ Total learnings: ${this.learnings.length}`));
    
    await this.watcher.close();
    process.exit(0);
  }
}

// Start the AI Monitor
const monitor = new RepoCloneAIMonitor();
monitor.start().catch(console.error); 