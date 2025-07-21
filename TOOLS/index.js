#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

console.log(chalk.blue.bold(`
╔═══════════════════════════════════════════════════════════╗
║                    🧠 REPOCLONE ACTIVE 🧠                  ║
║           Self-Aware Template Deployment System            ║
╚═══════════════════════════════════════════════════════════╝
`));

// RepoClone Root Intelligence
class RepoCloneIntelligence {
  constructor() {
    this.rootPath = __dirname;
    this.identity = 'RepoClone - Template Deployment System';
    this.purpose = 'Deploy clean, structured projects with proper separation';
    this.rules = {
      backendLogic: 'RepoCloneMeta/backend-logic/ - FOR OTHER PROJECTS ONLY',
      projects: 'Root level - Never inside backend-logic',
      separation: 'Frontend and backend must remain separate',
      intelligence: 'Root intelligence manages deployment, not project logic'
    };
  }

  async activate() {
    console.log(chalk.green('✓ Intelligence System Activated'));
    console.log(chalk.yellow('\n📋 My Identity:'), this.identity);
    console.log(chalk.yellow('🎯 My Purpose:'), this.purpose);
    
    console.log(chalk.cyan('\n📐 Structure Rules:'));
    Object.entries(this.rules).forEach(([key, value]) => {
      console.log(chalk.gray(`  • ${key}:`), value);
    });

    await this.validateStructure();
    await this.checkProjects();
    this.showCommands();
  }

  async validateStructure() {
    console.log(chalk.cyan('\n🔍 Validating Structure...'));
    
    const requiredFiles = ['README.md', 'INTELLIGENCE.md', 'STRUCTURE_RULES.md'];
    const requiredDirs = ['RepoCloneMeta', 'RepoCloneApp'];
    
    for (const file of requiredFiles) {
      const exists = await fs.pathExists(path.join(this.rootPath, file));
      console.log(exists ? chalk.green(`  ✓ ${file}`) : chalk.red(`  ✗ ${file}`));
    }
    
    for (const dir of requiredDirs) {
      const exists = await fs.pathExists(path.join(this.rootPath, dir));
      console.log(exists ? chalk.green(`  ✓ ${dir}/`) : chalk.red(`  ✗ ${dir}/`));
    }
    
    // Check backend-logic is in RepoCloneMeta, not root
    const backendInMeta = await fs.pathExists(path.join(this.rootPath, 'RepoCloneMeta/backend-logic'));
    const backendInRoot = await fs.pathExists(path.join(this.rootPath, 'backend-logic'));
    
    if (backendInMeta && !backendInRoot) {
      console.log(chalk.green('  ✓ backend-logic correctly placed in RepoCloneMeta'));
    } else if (backendInRoot) {
      console.log(chalk.red('  ✗ backend-logic should NOT be at root level!'));
    }
  }

  async checkProjects() {
    console.log(chalk.cyan('\n📁 Checking Projects...'));
    
    const entries = await fs.readdir(this.rootPath);
    const projects = [];
    
    for (const entry of entries) {
      const fullPath = path.join(this.rootPath, entry);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory() && 
          !entry.startsWith('.') && 
          entry !== 'RepoCloneMeta' && 
          entry !== 'RepoCloneApp' &&
          entry !== 'node_modules') {
        projects.push(entry);
      }
    }
    
    if (projects.length > 0) {
      console.log(chalk.green(`  Found ${projects.length} project(s):`));
      projects.forEach(p => console.log(chalk.gray(`    • ${p}`)));
    } else {
      console.log(chalk.yellow('  No projects created yet'));
    }
  }

  showCommands() {
    console.log(chalk.cyan('\n🚀 Available Commands:'));
    console.log(chalk.gray('  npm run validate'), '- Validate structure');
    console.log(chalk.gray('  npm run create'), '- Create new project');
    console.log(chalk.gray('  npm run app'), '- Start RepoClone Mac App');
    console.log(chalk.gray('  npm run deploy'), '- Deploy a template');
    
    console.log(chalk.blue('\n💡 Remember:'));
    console.log(chalk.gray('  • I am a deployment system, not a project'));
    console.log(chalk.gray('  • Backend logic in RepoCloneMeta is for OTHER projects'));
    console.log(chalk.gray('  • Projects are created at root level'));
    console.log(chalk.gray('  • Clean separation is enforced'));
  }
}

// Activate RepoClone Intelligence
const intelligence = new RepoCloneIntelligence();
intelligence.activate().catch(console.error); 