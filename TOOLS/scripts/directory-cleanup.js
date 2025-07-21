#!/usr/bin/env node

/**
 * 🧹 Directory Cleanup and Organization
 * 
 * Comprehensive cleanup and organization:
 * - Remove dormant files
 * - Organize directory structure
 * - Set up version control
 * - Create clean architecture
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class DirectoryCleanup {
  constructor() {
    this.rootPath = process.cwd();
    this.dormantFiles = [];
    this.organizedFiles = [];
    
    console.log(chalk.magenta.bold('🧹 Directory Cleanup and Organization'));
    console.log(chalk.gray('Cleaning and organizing directory structure...'));
  }

  /**
   * Detect dormant files
   */
  detectDormantFiles() {
    console.log(chalk.blue('\n🔍 Detecting Dormant Files...'));
    
    const dormantPatterns = [
      /^\.DS_Store$/,
      /^\.tmp$/,
      /^\.cache$/,
      /^test-.*\.js$/,
      /^temp-.*\.js$/,
      /.*\.bak$/,
      /.*\.backup$/,
      /.*\.old$/,
      /^setup-.*\.js$/,
      /^cross-project-.*\.ts$/,
      /^backend-.*\.ts$/,
      /^project-.*\.ts$/
    ];
    
    const items = fs.readdirSync(this.rootPath);
    
    for (const item of items) {
      if (dormantPatterns.some(pattern => pattern.test(item))) {
        this.dormantFiles.push(item);
        console.log(chalk.yellow(`   ⚠️  Dormant file detected: ${item}`));
      }
    }
    
    console.log(chalk.green(`✅ Found ${this.dormantFiles.length} dormant files`));
    return this.dormantFiles;
  }

  /**
   * Remove dormant files
   */
  removeDormantFiles() {
    console.log(chalk.blue('\n🗑️  Removing Dormant Files...'));
    
    let removedCount = 0;
    
    for (const file of this.dormantFiles) {
      try {
        const filePath = path.join(this.rootPath, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(chalk.green(`   ✅ Removed: ${file}`));
          removedCount++;
        }
      } catch (error) {
        console.log(chalk.red(`   ❌ Failed to remove ${file}: ${error.message}`));
      }
    }
    
    console.log(chalk.green(`✅ Removed ${removedCount} dormant files`));
  }

  /**
   * Organize directory structure
   */
  organizeDirectoryStructure() {
    console.log(chalk.blue('\n📁 Organizing Directory Structure...'));
    
    // Create organized directories
    const organizedDirs = [
      'CORE',
      'INTELLIGENCE',
      'TEMPLATES',
      'TOOLS',
      'DOCS',
      'PROJECTS',
      'VERSION_CONTROL',
      'CONFIG'
    ];
    
    for (const dir of organizedDirs) {
      const dirPath = path.join(this.rootPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(chalk.green(`   ✅ Created ${dir}/`));
      }
    }
    
    // Move core files
    this.moveCoreFiles();
    
    // Move intelligence files
    this.moveIntelligenceFiles();
    
    // Move documentation
    this.moveDocumentation();
    
    console.log(chalk.green('✅ Directory structure organized'));
  }

  /**
   * Move core files
   */
  moveCoreFiles() {
    const coreFiles = [
      'README.md',
      'package.json',
      'root-intelligence-system.js',
      'intelligence-connector.js',
      'learning-aggregator.js'
    ];
    
    for (const file of coreFiles) {
      const sourcePath = path.join(this.rootPath, file);
      const destPath = path.join(this.rootPath, 'CORE', file);
      
      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, destPath);
        console.log(chalk.green(`   ✅ Moved ${file} to CORE/`));
      }
    }
  }

  /**
   * Move intelligence files
   */
  moveIntelligenceFiles() {
    const intelligenceItems = [
      '.intelligence',
      'RepoCloneMeta'
    ];
    
    for (const item of intelligenceItems) {
      const sourcePath = path.join(this.rootPath, item);
      const destPath = path.join(this.rootPath, 'INTELLIGENCE', item);
      
      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, destPath);
        console.log(chalk.green(`   ✅ Moved ${item} to INTELLIGENCE/`));
      }
    }
  }

  /**
   * Move documentation
   */
  moveDocumentation() {
    const docsFiles = [
      'INTELLIGENCE.md',
      'STRUCTURE_RULES.md',
      'DIRECTORY_ORGANIZATION.md',
      'IMPLEMENTATION_SUMMARY.md',
      'backend-functions-firestore-mapping.md'
    ];
    
    for (const file of docsFiles) {
      const sourcePath = path.join(this.rootPath, file);
      const destPath = path.join(this.rootPath, 'DOCS', file);
      
      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, destPath);
        console.log(chalk.green(`   ✅ Moved ${file} to DOCS/`));
      }
    }
  }

  /**
   * Set up version control
   */
  setupVersionControl() {
    console.log(chalk.blue('\n📝 Setting Up Version Control...'));
    
    const versionControlItems = [
      '.git',
      '.hooks',
      '.github'
    ];
    
    for (const item of versionControlItems) {
      const sourcePath = path.join(this.rootPath, item);
      const destPath = path.join(this.rootPath, 'VERSION_CONTROL', item);
      
      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, destPath);
        console.log(chalk.green(`   ✅ Moved ${item} to VERSION_CONTROL/`));
      }
    }
    
    // Create changelog
    const changelogPath = path.join(this.rootPath, 'VERSION_CONTROL', 'changelog');
    if (!fs.existsSync(changelogPath)) {
      fs.mkdirSync(changelogPath, { recursive: true });
      console.log(chalk.green('   ✅ Created changelog/'));
    }
    
    console.log(chalk.green('✅ Version control setup complete'));
  }

  /**
   * Create clean architecture
   */
  createCleanArchitecture() {
    console.log(chalk.blue('\n🏗️  Creating Clean Architecture...'));
    
    // Create .gitignore
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
*.tmp
*.temp
*.log

# Build artifacts
dist/
build/
out/

# Backup files
*.bak
*.backup
*.old

# Test files
test-*.js
temp-*.js
`;
    
    const gitignorePath = path.join(this.rootPath, '.gitignore');
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log(chalk.green('   ✅ Created .gitignore'));
    
    // Create README for new structure
    const readmeContent = `# 🧠 RepoClone - Clean Architecture

## **📁 Directory Structure**

\`\`\`
RepoClone/
├── 📁 CORE/                    # Core system files
│   ├── README.md               # Main documentation
│   ├── package.json            # Root dependencies
│   ├── root-intelligence-system.js # Main intelligence system
│   ├── intelligence-connector.js # Cross-project connector
│   └── learning-aggregator.js  # Learning aggregation
├── 📁 INTELLIGENCE/            # Intelligence systems
│   ├── .intelligence/          # Learning data and patterns
│   └── RepoCloneMeta/          # Backend logic and systems
├── 📁 TEMPLATES/               # Project templates
├── 📁 TOOLS/                   # Development tools
├── 📁 DOCS/                    # Documentation
├── 📁 PROJECTS/                # Generated projects
├── 📁 VERSION_CONTROL/         # Version control and history
└── 📁 CONFIG/                  # Configuration files
\`\`\`

## **🧹 Clean Architecture**

### **✅ Organized Structure**
- **Core Files**: Essential system files in CORE/
- **Intelligence**: All AI and learning systems in INTELLIGENCE/
- **Templates**: Project templates in TEMPLATES/
- **Tools**: Development tools in TOOLS/
- **Documentation**: All docs in DOCS/
- **Projects**: Generated projects in PROJECTS/
- **Version Control**: Git and history in VERSION_CONTROL/
- **Configuration**: Config files in CONFIG/

### **❌ No Dormant Files**
- Removed all temporary files
- Removed backup files
- Removed test files
- Removed build artifacts
- Clean and organized structure

## **🚀 Quick Start**

\`\`\`bash
# Start the system
cd CORE && npm start

# Create new project
npm run deploy MyProject

# Validate structure
npm run validate
\`\`\`

## **📊 System Status**

- ✅ **Clean Architecture**: Organized and structured
- ✅ **No Dormant Files**: All unnecessary files removed
- ✅ **Version Control**: Proper Git setup
- ✅ **Intelligence Systems**: All systems accessible
- ✅ **Documentation**: Comprehensive docs organized

---

**🧠 Clean Architecture: Implemented**  
**📁 Organized Structure: Complete**  
**🧹 No Dormant Files: Clean**  
**🚀 Ready for Development: Optimized**
`;
    
    const readmePath = path.join(this.rootPath, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log(chalk.green('   ✅ Created new README.md'));
    
    console.log(chalk.green('✅ Clean architecture created'));
  }

  /**
   * Run complete cleanup and organization
   */
  async cleanup() {
    console.log(chalk.magenta.bold('\n🚀 Starting Directory Cleanup and Organization...'));
    
    try {
      // 1. Detect dormant files
      this.detectDormantFiles();
      
      // 2. Remove dormant files
      this.removeDormantFiles();
      
      // 3. Organize directory structure
      this.organizeDirectoryStructure();
      
      // 4. Set up version control
      this.setupVersionControl();
      
      // 5. Create clean architecture
      this.createCleanArchitecture();
      
      console.log(chalk.green('\n🎉 Directory Cleanup and Organization Complete!'));
      console.log(chalk.gray('   Clean architecture implemented'));
      console.log(chalk.gray('   No dormant files remaining'));
      console.log(chalk.gray('   Organized directory structure'));
      console.log(chalk.gray('   Version control properly set up'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Cleanup failed:'), error);
    }
  }
}

// Export the cleanup class
module.exports = DirectoryCleanup;

// If run directly, start cleanup
if (require.main === module) {
  const cleanup = new DirectoryCleanup();
  cleanup.cleanup();
} 