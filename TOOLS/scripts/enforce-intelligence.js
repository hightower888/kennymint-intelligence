#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class IntelligenceEnforcer {
  constructor() {
    this.rootDir = process.cwd();
    this.intelligenceFiles = [
      'README.md',
      'INTELLIGENCE.md',
      'STRUCTURE_RULES.md',
      'package.json',
      'index.js'
    ];
    
    this.forbiddenAtRoot = [
      'backend-logic',
      'ai-systems',
      'core-systems',
      'advanced-features',
      'integration',
      'next-level',
      'self-improving'
    ];
    
    this.requiredAtRoot = [
      'RepoCloneMeta',
      'scripts',
      '.intelligence'
    ];
  }

  async enforceIntelligence() {
    console.log(chalk.cyan.bold('\n🔒 ENFORCING REPOCLONE INTELLIGENCE RULES\n'));
    
    const violations = [];
    const fixes = [];
    
    // 1. Check root intelligence files
    console.log(chalk.yellow('📋 Checking root intelligence files...'));
    for (const file of this.intelligenceFiles) {
      const filePath = path.join(this.rootDir, file);
      if (!await fs.pathExists(filePath)) {
        violations.push(`Missing intelligence file: ${file}`);
        fixes.push(`Create ${file} with proper intelligence content`);
      }
    }
    
    // 2. Check for forbidden directories at root
    console.log(chalk.yellow('🚫 Checking for forbidden directories at root...'));
    for (const dir of this.forbiddenAtRoot) {
      const dirPath = path.join(this.rootDir, dir);
      if (await fs.pathExists(dirPath)) {
        violations.push(`Forbidden directory at root: ${dir}`);
        fixes.push(`Move ${dir} to RepoCloneMeta/backend-logic/`);
      }
    }
    
    //3. Check required structure
    console.log(chalk.yellow('✅ Checking required structure...'));
    for (const dir of this.requiredAtRoot) {
      const dirPath = path.join(this.rootDir, dir);
      if (!await fs.pathExists(dirPath)) {
        violations.push(`Missing required directory: ${dir}`);
        fixes.push(`Create ${dir} directory`);
      }
    }
    
    // 4. Validate RepoCloneMeta structure
    console.log(chalk.yellow('🏗️  Validating RepoCloneMeta structure...'));
    const metaPath = path.join(this.rootDir, 'RepoCloneMeta');
    if (await fs.pathExists(metaPath)) {
      const backendLogicPath = path.join(metaPath, 'backend-logic');
      if (!await fs.pathExists(backendLogicPath)) {
        violations.push('RepoCloneMeta missing backend-logic directory');
        fixes.push('Create RepoCloneMeta/backend-logic/ structure');
      }
    }
    
    // 5. Check intelligence content integrity
    console.log(chalk.yellow('🧠 Validating intelligence content...'));
    await this.validateIntelligenceContent(violations, fixes);
    
    // 6. Enforce file permissions
    console.log(chalk.yellow('🔐 Setting intelligence file permissions...'));
    await this.setIntelligencePermissions();
    
    // Report results
    this.reportResults(violations, fixes);
    
    // Auto-fix if requested
    if (process.argv.includes('--fix')) {
      await this.autoFix(violations, fixes);
    }
    
    return violations.length === 0;
  }

  async validateIntelligenceContent(violations, fixes) {
    const intelligencePath = path.join(this.rootDir, 'INTELLIGENCE.md');
    if (await fs.pathExists(intelligencePath)) {
      const content = await fs.readFile(intelligencePath, 'utf8');
      
      // Check for key intelligence markers
      const requiredMarkers = [
        'RepoClone',
        'template deployment',
        'self-aware',
        'backend-logic',
        'RepoCloneMeta'
      ];
      
      for (const marker of requiredMarkers) {
        if (!content.toLowerCase().includes(marker.toLowerCase())) {
          violations.push(`Intelligence content missing key marker: ${marker}`);
          fixes.push(`Update INTELLIGENCE.md to include ${marker} context`);
        }
      }
    }
  }

  async setIntelligencePermissions() {
    for (const file of this.intelligenceFiles) {
      const filePath = path.join(this.rootDir, file);
      if (await fs.pathExists(filePath)) {
        try {
          await fs.chmod(filePath, 0o644); // Readable by all, writable by owner
          console.log(chalk.green(`✓ Set permissions for ${file}`));
        } catch (error) {
          console.log(chalk.red(`✗ Failed to set permissions for ${file}`));
        }
      }
    }
  }

  reportResults(violations, fixes) {
    console.log(chalk.cyan('\n📊 INTELLIGENCE ENFORCEMENT REPORT\n'));
    
    if (violations.length === 0) {
      console.log(chalk.green('✅ All intelligence rules are being followed!'));
      console.log(chalk.green('🎯 Root intelligence system is healthy and compliant.'));
    } else {
      console.log(chalk.red(`❌ Found ${violations.length} violations:`));
      violations.forEach((violation, index) => {
        console.log(chalk.red(`  ${index + 1}. ${violation}`));
      });
      
      console.log(chalk.yellow('\n🔧 Suggested fixes:'));
      fixes.forEach((fix, index) => {
        console.log(chalk.yellow(`  ${index + 1}. ${fix}`));
      });
      
      console.log(chalk.cyan('\n💡 Run with --fix to automatically apply fixes'));
    }
  }

  async autoFix(violations, fixes) {
    console.log(chalk.yellow('\n�� Applying automatic fixes...'));
    
    for (const fix of fixes) {
      if (fix.includes('Create INTELLIGENCE.md')) {
        await this.createIntelligenceFile();
      } else if (fix.includes('Create STRUCTURE_RULES.md')) {
        await this.createStructureRulesFile();
      } else if (fix.includes('Move')) { // Dont auto-move files, require manual intervention
        console.log(chalk.yellow(`⚠️  Manual fix required: ${fix}`));
      }
    }
    
    console.log(chalk.green('✅ Auto-fix completed'));
  }

  async createIntelligenceFile() {
    const content = `# RepoClone Intelligence System

## System Identity
RepoClone is a self-aware template deployment system that enforces strict separation between backend logic and frontend project templates.

## Core Principles
- **Separation of Concerns**: Backend logic stays in RepoCloneMeta/backend-logic/
- **Root Intelligence**: Root level contains only intelligence files and project templates
- **Template Deployment**: Projects are created at root level, not within backend logic
- **Self-Awareness**: System monitors and enforces its own structure

## Intelligence Files
- README.md: System overview and usage
- INTELLIGENCE.md: This file - system self-awareness
- STRUCTURE_RULES.md: Enforced file organization rules
- package.json: Root system configuration
- index.js: Main intelligence script

## Enforcement
The system continuously monitors for:
- Forbidden directories at root level
- Missing intelligence files
- Improper file organization
- Structure violations

## Health Status
- Root Intelligence: Active
- AI Monitor: Running
- Structure Enforcement: Enabled
- Template System: Operational

Last Updated: ${new Date().toISOString()}
`;
    
    await fs.writeFile(path.join(this.rootDir, 'INTELLIGENCE.md'), content);
    console.log(chalk.green('✓ Created INTELLIGENCE.md'));
  }

  async createStructureRulesFile() {
    const content = `# RepoClone Structure Rules

## Root Level (RepoClone)
### Allowed
- Intelligence files (README.md, INTELLIGENCE.md, STRUCTURE_RULES.md, package.json, index.js)
- Project templates (created by users)
- RepoCloneMeta/ (backend logic container)
- scripts/ (enforcement tools)
- .intelligence/ (monitoring data)

### Forbidden
- backend-logic/ (must be in RepoCloneMeta/)
- ai-systems/ (must be in RepoCloneMeta/backend-logic/)
- core-systems/ (must be in RepoCloneMeta/backend-logic/)
- Any other backend logic directories

## RepoCloneMeta/backend-logic/
### Allowed
- ai-systems/ (AI systems for OTHER projects)
- core-systems/ (Core systems for OTHER projects)
- project-templates/ (Templates for deployment)
- cli-tools/ (Command line tools)
- infrastructure/ (Deployment infrastructure)

## Enforcement
- AI Monitor continuously watches for violations
- Automatic violation detection and reporting
- Structure validation on system startup
- Intelligence file integrity checks

## Violation Types
1. **Forbidden Directory**: Backend logic at root level
2. **Missing Intelligence**: Required files not present
3. **Structure Violation**: Improper file organization
4. **Content Violation**: Intelligence files missing key content

Last Updated: ${new Date().toISOString()}
`;
    
    await fs.writeFile(path.join(this.rootDir, 'STRUCTURE_RULES.md'), content);
    console.log(chalk.green('✓ Created STRUCTURE_RULES.md'));
  }
}

// Run enforcement
async function main() {
  const enforcer = new IntelligenceEnforcer();
  const isCompliant = await enforcer.enforceIntelligence();
  
  if (!isCompliant && !process.argv.includes('--fix')) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = IntelligenceEnforcer; 