#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectCreator {
  constructor() {
    this.templatesPath = 'backend-logic/project-templates';
    this.availableTemplates = this.getAvailableTemplates();
  }

  async run() {
    console.log('🧠 RepoClone Intelligence: Project Creation');
    console.log('===========================================\n');

    // Get project details
    const projectName = await this.getProjectName();
    const template = await this.selectTemplate();
    const industry = await this.getIndustry();
    const audience = await this.getAudience();

    // Create project at root level
    await this.createProject(projectName, template, industry, audience);

    console.log('\n✅ Project created successfully!');
    console.log(`📁 Project location: ${projectName}/`);
    console.log('🎯 Project follows RepoClone structure rules');
    console.log('🚀 Ready to deploy with backend logic integration');
  }

  getAvailableTemplates() {
    if (!fs.existsSync(this.templatesPath)) {
      return [];
    }

    return fs.readdirSync(this.templatesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  }

  async getProjectName() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('📝 Enter project name: ', (name) => {
        rl.close();
        resolve(name.trim());
      });
    });
  }

  async selectTemplate() {
    if (this.availableTemplates.length === 0) {
      console.log('❌ No templates available. Please create templates first.');
      process.exit(1);
    }

    console.log('\n📋 Available templates:');
    this.availableTemplates.forEach((template, index) => {
      console.log(`  ${index + 1}. ${template}`);
    });

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\n🎯 Select template (number): ', (selection) => {
        rl.close();
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < this.availableTemplates.length) {
          resolve(this.availableTemplates[index]);
        } else {
          console.log('❌ Invalid selection. Using first template.');
          resolve(this.availableTemplates[0]);
        }
      });
    });
  }

  async getIndustry() {
    const industries = ['technology', 'healthcare', 'finance', 'education', 'general'];
    
    console.log('\n🏭 Available industries:');
    industries.forEach((industry, index) => {
      console.log(`  ${index + 1}. ${industry}`);
    });

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\n🏭 Select industry (number): ', (selection) => {
        rl.close();
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < industries.length) {
          resolve(industries[index]);
        } else {
          console.log('❌ Invalid selection. Using general.');
          resolve('general');
        }
      });
    });
  }

  async getAudience() {
    const audiences = ['developers', 'business', 'consumers', 'enterprise', 'general'];
    
    console.log('\n👥 Available audiences:');
    audiences.forEach((audience, index) => {
      console.log(`  ${index + 1}. ${audience}`);
    });

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\n👥 Select audience (number): ', (selection) => {
        rl.close();
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < audiences.length) {
          resolve(audiences[index]);
        } else {
          console.log('❌ Invalid selection. Using general.');
          resolve('general');
        }
      });
    });
  }

  async createProject(projectName, template, industry, audience) {
    console.log(`\n🚀 Creating project: ${projectName}`);
    console.log(`📋 Template: ${template}`);
    console.log(`🏭 Industry: ${industry}`);
    console.log(`👥 Audience: ${audience}`);

    // Check if project already exists
    if (fs.existsSync(projectName)) {
      console.log(`❌ Project ${projectName} already exists.`);
      process.exit(1);
    }

    // Copy template to project
    const templatePath = path.join(this.templatesPath, template);
    const projectPath = path.join('.', projectName);

    console.log('📦 Copying template...');
    this.copyDirectory(templatePath, projectPath);

    // Update project-specific files
    await this.updateProjectFiles(projectPath, projectName, industry, audience);

    // Create project-specific directories
    this.createProjectDirectories(projectPath);

    // Create backend logic connector
    this.createBackendConnector(projectPath, projectName);

    console.log('✅ Project structure created');
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async updateProjectFiles(projectPath, projectName, industry, audience) {
    // Update package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.name = projectName;
      packageJson.description = `${industry} ${audience} project powered by RepoClone backend logic`;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // Update README.md
    const readmePath = path.join(projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      let readme = fs.readFileSync(readmePath, 'utf8');
      readme = readme.replace(/ProjectName/g, projectName);
      readme = readme.replace(/industry/g, industry);
      readme = readme.replace(/audience/g, audience);
      fs.writeFileSync(readmePath, readme);
    }

    // Create project-specific README
    const projectReadme = `# ${projectName}

## Project Information
- **Industry**: ${industry}
- **Audience**: ${audience}
- **Template**: Generated from RepoClone backend logic
- **Created**: ${new Date().toISOString()}

## Backend Logic Integration

This project references backend logic from the RepoClone system:
- AI systems and intelligence
- Security and monitoring
- Storage and asset management
- Infrastructure orchestration

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Structure

This project follows RepoClone structure rules:
- ✅ Clean separation between frontend and backend
- ✅ References backend logic (doesn't copy it)
- ✅ Project-specific content only
- ✅ Industry-specific components

## Backend Logic Reference

The project connects to backend logic through:
- Import statements referencing \`../backend-logic/\`
- Configuration files pointing to backend systems
- Template files that reference backend logic
- No copied backend code (maintains separation)

---

**🧠 RepoClone Intelligence: Project Created Successfully**
**🎯 Template Deployment: Clean and Structured**
**🚀 Ready for Development**
`;

    fs.writeFileSync(path.join(projectPath, 'PROJECT_INFO.md'), projectReadme);
  }

  createProjectDirectories(projectPath) {
    const directories = [
      'templates',
      'assets',
      'config',
      'data-stores',
      'learning-data',
      'workflows'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(projectPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  createBackendConnector(projectPath, projectName) {
    const connectorContent = `// Backend Logic Connector for ${projectName}
// This file ensures proper connection to RepoClone backend logic

import { AISystem } from '../../backend-logic/ai-systems/ai-coordinator';
import { SecurityManager } from '../../backend-logic/core-systems/security/security-manager';
import { StorageManager } from '../../backend-logic/storage-management/storage-manager';

export class BackendConnector {
  private aiSystem: AISystem;
  private securityManager: SecurityManager;
  private storageManager: StorageManager;

  constructor() {
    this.initializeBackendLogic();
  }

  private async initializeBackendLogic() {
    try {
      // Initialize backend logic systems
      this.aiSystem = new AISystem();
      this.securityManager = new SecurityManager({
        enabled: true,
        threatDetection: true,
        vulnerabilityScanning: true,
        intrusionPrevention: true,
        encryptionEnabled: true,
        auditLogging: true,
        autoResponse: true,
        securityHeaders: true,
        rateLimiting: { enabled: true, windowMs: 900000, maxRequests: 100 },
        authentication: {
          jwtSecret: process.env.JWT_SECRET || 'default-secret',
          tokenExpiry: '24h',
          refreshTokenExpiry: '7d',
          maxLoginAttempts: 5,
          lockoutDuration: 300000
        }
      });
      this.storageManager = new StorageManager();

      console.log('✅ Backend logic connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to backend logic:', error);
    }
  }

  // Expose backend logic functionality
  getAISystem() {
    return this.aiSystem;
  }

  getSecurityManager() {
    return this.securityManager;
  }

  getStorageManager() {
    return this.storageManager;
  }
}

export default BackendConnector;
`;

    fs.writeFileSync(path.join(projectPath, 'backend-connector.ts'), connectorContent);
  }
}

// Run the project creator
if (require.main === module) {
  const creator = new ProjectCreator();
  creator.run().catch(console.error);
}

module.exports = ProjectCreator; 