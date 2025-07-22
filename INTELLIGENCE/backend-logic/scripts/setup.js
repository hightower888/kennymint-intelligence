#!/usr/bin/env node

/**
 * 🚀 Ultimate AI-Powered Development Template - Setup Script
 * 
 * Automated setup for the world's most advanced AI development template
 * This script initializes all AI systems, creates necessary directories,
 * and ensures your environment is ready for maximum productivity.
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Color codes for beautiful terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}\n🏆 ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}🔧 ${msg}${colors.reset}`)
};

class AIDevTemplateSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.requiredDirectories = [
      'src/ai-systems/models',
      'src/ai-systems/training-data',
      'src/core-systems/deployment',
      'src/core-systems/security',
      'src/core-systems/monitoring',
      'src/core-systems/database',
      'src/components',
      'src/hooks',
      'src/services',
      'src/utils',
      'src/types',
      'src/config',
      'public',
      'docs',
      'tests',
      'scripts',
      'config',
      'logs',
      'temp',
      'backups'
    ];
  }

  async run() {
    try {
      log.header('Ultimate AI-Powered Development Template Setup');
      console.log('═'.repeat(60));
      
      await this.checkPrerequisites();
      await this.createDirectoryStructure();
      await this.generateSecurityKeys();
      await this.setupEnvironmentFiles();
      await this.createConfigurationFiles();
      await this.initializeAIModels();
      await this.setupDevelopmentTools();
      await this.createDocumentation();
      await this.setupGitHooks();
      await this.finalizeSetup();

      this.displaySuccessMessage();

    } catch (error) {
      log.error(`Setup failed: ${error.message}`);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    log.step('Checking prerequisites...');

    const requiredVersions = {
      node: '18.0.0',
      npm: '8.0.0'
    };

    // Check Node.js version
    const nodeVersion = process.version.substring(1);
    if (this.compareVersions(nodeVersion, requiredVersions.node) < 0) {
      throw new Error(`Node.js ${requiredVersions.node} or higher is required. Current: ${nodeVersion}`);
    }

    // Check npm version
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      if (this.compareVersions(npmVersion, requiredVersions.npm) < 0) {
        log.warning(`npm ${requiredVersions.npm} or higher is recommended. Current: ${npmVersion}`);
      }
    } catch (error) {
      throw new Error('npm is not installed or not accessible');
    }

    // Check for Git
    try {
      execSync('git --version', { stdio: 'ignore' });
    } catch (error) {
      log.warning('Git is not installed. Some features may not work properly.');
    }

    log.success('Prerequisites check completed');
  }

  async createDirectoryStructure() {
    log.step('Creating directory structure...');

    for (const dir of this.requiredDirectories) {
      const fullPath = path.join(this.projectRoot, dir);
      await fs.ensureDir(fullPath);
      
      // Create .gitkeep for empty directories
      const gitkeepPath = path.join(fullPath, '.gitkeep');
      if (!(await fs.pathExists(gitkeepPath))) {
        await fs.writeFile(gitkeepPath, '# This file ensures the directory is tracked by Git\n');
      }
    }

    log.success('Directory structure created');
  }

  async generateSecurityKeys() {
    log.step('Generating security keys...');

    const keys = {
      SECRET_KEY: crypto.randomBytes(64).toString('hex'),
      JWT_SECRET: crypto.randomBytes(64).toString('hex'),
      ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex')
    };

    // Save keys to a secure file
    const keysPath = path.join(this.projectRoot, 'config', 'security-keys.json');
    await fs.ensureDir(path.dirname(keysPath));
    await fs.writeFile(keysPath, JSON.stringify(keys, null, 2));

    // Set secure permissions (Unix-like systems only)
    if (process.platform !== 'win32') {
      try {
        await fs.chmod(keysPath, 0o600);
      } catch (error) {
        log.warning('Could not set secure permissions on security keys file');
      }
    }

    log.success('Security keys generated and stored securely');
  }

  async setupEnvironmentFiles() {
    log.step('Setting up environment files...');

    const envPath = path.join(this.projectRoot, '.env');
    const envExamplePath = path.join(this.projectRoot, 'env.example');

    // Check if .env already exists
    if (await fs.pathExists(envPath)) {
      log.warning('.env file already exists. Skipping creation.');
      return;
    }

    // Copy from example if it exists
    if (await fs.pathExists(envExamplePath)) {
      await fs.copy(envExamplePath, envPath);
      
      // Load security keys and update .env
      const keysPath = path.join(this.projectRoot, 'config', 'security-keys.json');
      if (await fs.pathExists(keysPath)) {
        const keys = await fs.readJson(keysPath);
        let envContent = await fs.readFile(envPath, 'utf8');
        
        envContent = envContent
          .replace('your_super_secret_key_change_in_production', keys.SECRET_KEY)
          .replace('your_jwt_secret_here', keys.JWT_SECRET)
          .replace('your_encryption_key_here', keys.ENCRYPTION_KEY);
        
        await fs.writeFile(envPath, envContent);
      }
    } else {
      // Create basic .env file
      const basicEnv = `# Basic environment configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# AI Systems
ENABLE_REALTIME=true
ENABLE_AI_WATCHING=true
MAX_CONCURRENT_OPS=10

# Add your API keys here
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
`;
      await fs.writeFile(envPath, basicEnv);
    }

    log.success('Environment files configured');
  }

  async createConfigurationFiles() {
    log.step('Creating configuration files...');

    // ESLint configuration
    const eslintConfig = {
      extends: [
        '@typescript-eslint/recommended',
        'prettier'
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        'prefer-const': 'error',
        'no-console': 'warn'
      }
    };

    await fs.writeFile(
      path.join(this.projectRoot, '.eslintrc.json'),
      JSON.stringify(eslintConfig, null, 2)
    );

    // Prettier configuration
    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false
    };

    await fs.writeFile(
      path.join(this.projectRoot, '.prettierrc'),
      JSON.stringify(prettierConfig, null, 2)
    );

    // Jest configuration
    const jestConfig = {
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/src', '<rootDir>/tests'],
      testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest'
      },
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts'
      ],
      coverageDirectory: 'coverage',
      coverageReporters: ['text', 'lcov', 'html']
    };

    await fs.writeFile(
      path.join(this.projectRoot, 'jest.config.js'),
      `module.exports = ${JSON.stringify(jestConfig, null, 2)};`
    );

    // Docker configuration
    const dockerfile = `# Ultimate AI-Powered Development Template - Docker Configuration
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 py3-pip build-base

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
`;

    await fs.writeFile(path.join(this.projectRoot, 'Dockerfile'), dockerfile);

    // Docker Compose configuration
    const dockerCompose = `# Ultimate AI-Powered Development Template - Docker Compose
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
      - elasticsearch
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ai_dev_template
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
`;

    await fs.writeFile(path.join(this.projectRoot, 'docker-compose.yml'), dockerCompose);

    log.success('Configuration files created');
  }

  async initializeAIModels() {
    log.step('Initializing AI models...');

    const modelsDir = path.join(this.projectRoot, 'src/ai-systems/models');
    await fs.ensureDir(modelsDir);

    // Create model metadata files
    const modelConfigs = [
      {
        name: 'error-prevention-model',
        version: '1.0.0',
        description: 'AI model for predicting and preventing code errors',
        architecture: 'neural_network',
        inputShape: [50],
        outputShape: [1],
        trained: false
      },
      {
        name: 'rule-enforcement-model',
        version: '1.0.0',
        description: 'AI model for intelligent rule enforcement',
        architecture: 'neural_network',
        inputShape: [100],
        outputShape: [1],
        trained: false
      },
      {
        name: 'knowledge-graph-model',
        version: '1.0.0',
        description: 'AI model for semantic code understanding',
        architecture: 'transformer',
        inputShape: [512],
        outputShape: [512],
        trained: false
      }
    ];

    for (const config of modelConfigs) {
      const configPath = path.join(modelsDir, `${config.name}-config.json`);
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    }

    // Create training data directories
    const trainingDataDir = path.join(this.projectRoot, 'src/ai-systems/training-data');
    await fs.ensureDir(trainingDataDir);

    for (const config of modelConfigs) {
      await fs.ensureDir(path.join(trainingDataDir, config.name));
    }

    log.success('AI models initialized');
  }

  async setupDevelopmentTools() {
    log.step('Setting up development tools...');

    // VS Code settings
    const vscodeDir = path.join(this.projectRoot, '.vscode');
    await fs.ensureDir(vscodeDir);

    const vscodeSettings = {
      "typescript.preferences.importModuleSpecifier": "relative",
      "editor.formatOnSave": true,
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
      },
      "files.associations": {
        "*.ts": "typescript"
      },
      "search.exclude": {
        "**/node_modules": true,
        "**/dist": true,
        "**/.next": true,
        "**/coverage": true
      }
    };

    await fs.writeFile(
      path.join(vscodeDir, 'settings.json'),
      JSON.stringify(vscodeSettings, null, 2)
    );

    // VS Code extensions recommendations
    const extensions = {
      recommendations: [
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-json",
        "ms-vscode.vscode-github-pullrequest",
        "github.copilot",
        "ms-python.python"
      ]
    };

    await fs.writeFile(
      path.join(vscodeDir, 'extensions.json'),
      JSON.stringify(extensions, null, 2)
    );

    log.success('Development tools configured');
  }

  async createDocumentation() {
    log.step('Creating documentation...');

    const docsDir = path.join(this.projectRoot, 'docs');
    await fs.ensureDir(docsDir);

    // API Documentation
    const apiDocs = `# 🔌 API Documentation

## Overview
This document describes the AI-powered API endpoints available in the Ultimate AI Development Template.

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication
Currently, no authentication is required for development. In production, implement proper authentication.

## Endpoints

### Health Check
\`\`\`
GET /health
\`\`\`
Returns the health status of the application.

### AI System Status
\`\`\`
GET /api/ai/status
\`\`\`
Returns the current status of all AI systems.

### File Analysis
\`\`\`
POST /api/ai/analyze-file
Content-Type: application/json

{
  "filePath": "src/example.ts",
  "content": "const example = 'hello world';",
  "analysisType": "comprehensive"
}
\`\`\`

### Operation Validation
\`\`\`
POST /api/ai/validate-operation
Content-Type: application/json

{
  "operation": {
    "type": "file_operation",
    "action": "write",
    "target": "/path/to/file.ts",
    "parameters": {}
  }
}
\`\`\`

### Semantic Search
\`\`\`
POST /api/ai/search
Content-Type: application/json

{
  "query": "authentication functions",
  "filters": {
    "nodeTypes": ["function"],
    "filePaths": ["src/auth/"]
  }
}
\`\`\`

## WebSocket Events

Connect to \`ws://localhost:3000\` to receive real-time updates:

- \`ai_status\` - AI system status updates
- \`task_update\` - Task completion/failure notifications
- \`health_update\` - System health changes
- \`decision_made\` - AI routing decisions
- \`system_alert\` - Important system alerts

## Error Handling

All endpoints return errors in the following format:
\`\`\`json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
\`\`\`

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15-minute window per IP address.
`;

    await fs.writeFile(path.join(docsDir, 'api.md'), apiDocs);

    // Architecture Documentation
    const archDocs = `# 🏗️ Architecture Overview

## System Architecture

The Ultimate AI-Powered Development Template follows a modular, event-driven architecture with five core AI systems:

### 1. 🛡️ AI-Powered Error Prevention System
- **Purpose**: Prevent errors before they happen
- **Location**: \`src/ai-systems/error-prevention/\`
- **Capabilities**: Context-aware validation, risk assessment, conflict resolution

### 2. 🧩 Knowledge Graph Construction System
- **Purpose**: Semantic understanding of codebase relationships
- **Location**: \`src/ai-systems/knowledge-graph/\`
- **Capabilities**: Relationship mapping, pattern recognition, insight generation

### 3. ⚖️ AI-Powered Rule Enforcement System
- **Purpose**: Intelligent coding standards enforcement
- **Location**: \`src/ai-systems/rule-enforcement/\`
- **Capabilities**: Pattern detection, auto-fixing, learning-based evolution

### 4. 🎯 AI Systems Coordinator
- **Purpose**: Orchestrate all AI systems intelligently
- **Location**: \`src/ai-systems/ai-coordinator.ts\`
- **Capabilities**: Task routing, load balancing, decision making

## Data Flow

1. **Input**: User requests or file changes
2. **Coordination**: AI Coordinator receives and analyzes requests
3. **Routing**: Intelligent routing to appropriate AI systems
4. **Processing**: Multiple AI systems process in parallel
5. **Aggregation**: Results are combined and validated
6. **Output**: Unified response with insights and suggestions

## Technology Stack

- **Backend**: Node.js, TypeScript, Express
- **AI/ML**: TensorFlow.js, OpenAI API, Hugging Face
- **Database**: PostgreSQL, Redis, Elasticsearch
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting

## Deployment Architecture

- **Development**: Local with hot reload
- **Staging**: Docker containers with CI/CD
- **Production**: Kubernetes with auto-scaling
`;

    await fs.writeFile(path.join(docsDir, 'architecture.md'), archDocs);

    // Setup Guide
    const setupDocs = `# 🚀 Setup Guide

## Quick Start

1. **Clone and Install**
   \`\`\`bash
   git clone <your-repo-url>
   cd RepoClone
   npm install
   npm run setup
   \`\`\`

2. **Configure Environment**
   - Copy \`env.example\` to \`.env\`
   - Add your API keys (OpenAI, Hugging Face)
   - Configure database URLs if needed

3. **Start Development**
   \`\`\`bash
   npm run dev
   \`\`\`

## Environment Variables

See \`env.example\` for all available configuration options.

### Required for AI Features
- \`OPENAI_API_KEY\`: Your OpenAI API key
- \`HUGGINGFACE_API_KEY\`: Your Hugging Face API key

### Optional Services
- \`DATABASE_URL\`: PostgreSQL connection string
- \`REDIS_URL\`: Redis connection string
- \`ELASTICSEARCH_URL\`: Elasticsearch connection string

## Development Commands

- \`npm run dev\`: Start development server with hot reload
- \`npm run build\`: Build for production
- \`npm run test\`: Run test suite
- \`npm run lint\`: Lint code
- \`npm run ai:analyze\`: Run AI analysis on project
- \`npm run ai:health-check\`: Check AI system health

## Production Deployment

### Docker
\`\`\`bash
docker-compose up -d
\`\`\`

### Manual
\`\`\`bash
npm run build
npm start
\`\`\`

## Troubleshooting

### Common Issues
1. **AI systems not starting**: Check API keys in environment
2. **Port conflicts**: Change PORT in .env file
3. **Permission errors**: Ensure proper file permissions

### Getting Help
- Check the logs in \`logs/\` directory
- Review system health at \`/api/ai/status\`
- Monitor real-time updates via WebSocket
`;

    await fs.writeFile(path.join(docsDir, 'setup.md'), setupDocs);

    log.success('Documentation created');
  }

  async setupGitHooks() {
    log.step('Setting up Git hooks...');

    try {
      // Check if we're in a Git repository
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      
      // Install husky
      execSync('npx husky install', { stdio: 'inherit' });
      
      // Add pre-commit hook
      execSync('npx husky add .husky/pre-commit "npm run lint && npm run ai:validate"', { stdio: 'inherit' });
      
      // Add pre-push hook
      execSync('npx husky add .husky/pre-push "npm run test && npm run ai:health-check"', { stdio: 'inherit' });
      
      log.success('Git hooks configured');
    } catch (error) {
      log.warning('Git hooks setup skipped (not a Git repository or husky not available)');
    }
  }

  async finalizeSetup() {
    log.step('Finalizing setup...');

    // Create a setup completion marker
    const setupInfo = {
      setupDate: new Date().toISOString(),
      version: '1.0.0',
      features: [
        'ai-error-prevention',
        'knowledge-graph',
        'rule-enforcement',
        'real-time-analysis',
        'intelligent-coordination'
      ]
    };

    await fs.writeFile(
      path.join(this.projectRoot, '.ai-template-setup'),
      JSON.stringify(setupInfo, null, 2)
    );

    log.success('Setup finalized');
  }

  displaySuccessMessage() {
    console.log('\n' + '═'.repeat(60));
    log.header('Setup Complete! 🎉');
    console.log('\n🚀 Your Ultimate AI-Powered Development Template is ready!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Add your API keys to .env file');
    console.log('   2. Run: npm run dev');
    console.log('   3. Visit: http://localhost:3000');
    console.log('   4. Start building with AI! 🧠');
    console.log('\n📚 Documentation:');
    console.log('   • API Guide: docs/api.md');
    console.log('   • Architecture: docs/architecture.md');
    console.log('   • Setup Guide: docs/setup.md');
    console.log('\n🔧 Available Commands:');
    console.log('   • npm run dev         - Start development');
    console.log('   • npm run ai:analyze  - Analyze project');
    console.log('   • npm run ai:validate - Validate changes');
    console.log('   • npm run test        - Run tests');
    console.log('\n' + '═'.repeat(60));
    console.log('🏆 Ready to revolutionize development with AI! ✨\n');
  }

  compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }
    
    return 0;
  }
}

// Run the setup
const setup = new AIDevTemplateSetup();
setup.run().catch(error => {
  console.error('\n💥 Setup failed:', error.message);
  process.exit(1);
}); 