#!/usr/bin/env node

/**
 * Infrastructure Setup CLI
 * Sets up GitHub, Firebase, GCS, and GCP infrastructure for projects
 */

import { InfrastructureOrchestrator } from '../infrastructure/infrastructure-orchestrator';
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

const program = new Command();

interface ProjectConfig {
  name: string;
  purpose: string;
  industry: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    authentication: boolean;
    database: boolean;
    storage: boolean;
    functions: boolean;
    monitoring: boolean;
  };
  authProviders: {
    google: boolean;
    github: boolean;
    email: boolean;
  };
  storage: {
    versioning: boolean;
    backup: boolean;
    cdn: boolean;
  };
}

class InfrastructureCLI {
  private orchestrator: InfrastructureOrchestrator;
  
  constructor() {
    this.orchestrator = new InfrastructureOrchestrator();
  }
  
  /**
   * Main setup command
   */
  async setup(projectName: string, options: any): Promise<void> {
    console.log(chalk.blue('🚀 AI Template Infrastructure Setup'));
    console.log(chalk.gray('Setting up complete infrastructure for your project...\n'));
    
    try {
      // Get project configuration
      const projectConfig = await this.getProjectConfig(projectName, options);
      
      // Validate configuration
      await this.validateConfig(projectConfig);
      
      // Create infrastructure
      const infrastructure = await this.orchestrator.createProjectInfrastructure(
        projectConfig.name,
        projectConfig
      );
      
      // Save configuration files
      await this.saveConfigurationFiles(infrastructure);
      
      // Display results
      this.displayResults(infrastructure);
      
      console.log(chalk.green('\n✅ Infrastructure setup completed successfully!'));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log(chalk.gray('1. Review the generated configuration files'));
      console.log(chalk.gray('2. Update your project with the new environment variables'));
      console.log(chalk.gray('3. Test the infrastructure connections'));
      console.log(chalk.gray('4. Deploy your application'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Infrastructure setup failed:'), error);
      process.exit(1);
    }
  }
  
  /**
   * Gets project configuration from user input
   */
  private async getProjectConfig(projectName: string, options: any): Promise<ProjectConfig> {
    const config: ProjectConfig = {
      name: projectName,
      purpose: '',
      industry: '',
      environment: 'development',
      features: {
        authentication: true,
        database: true,
        storage: true,
        functions: false,
        monitoring: true
      },
      authProviders: {
        google: false,
        github: false,
        email: true
      },
      storage: {
        versioning: true,
        backup: true,
        cdn: false
      }
    };
    
    // If not in interactive mode, use defaults
    if (options.nonInteractive) {
      config.purpose = options.purpose || 'AI-powered application';
      config.industry = options.industry || 'technology';
      return config;
    }
    
    // Interactive configuration
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'purpose',
        message: 'What is the purpose of this project?',
        default: 'AI-powered application'
      },
      {
        type: 'list',
        name: 'industry',
        message: 'What industry is this project for?',
        choices: [
          'technology',
          'healthcare',
          'finance',
          'education',
          'ecommerce',
          'entertainment',
          'other'
        ],
        default: 'technology'
      },
      {
        type: 'list',
        name: 'environment',
        message: 'What environment are you setting up?',
        choices: ['development', 'staging', 'production'],
        default: 'development'
      },
      {
        type: 'confirm',
        name: 'authentication',
        message: 'Do you need user authentication?',
        default: true
      },
      {
        type: 'confirm',
        name: 'database',
        message: 'Do you need a database?',
        default: true
      },
      {
        type: 'confirm',
        name: 'storage',
        message: 'Do you need file storage?',
        default: true
      },
      {
        type: 'confirm',
        name: 'functions',
        message: 'Do you need serverless functions?',
        default: false
      },
      {
        type: 'confirm',
        name: 'monitoring',
        message: 'Do you need monitoring and alerting?',
        default: true
      },
      {
        type: 'checkbox',
        name: 'authProviders',
        message: 'Which authentication providers do you need?',
        choices: [
          { name: 'Email/Password', value: 'email', checked: true },
          { name: 'Google', value: 'google' },
          { name: 'GitHub', value: 'github' }
        ]
      },
      {
        type: 'checkbox',
        name: 'storageFeatures',
        message: 'Which storage features do you need?',
        choices: [
          { name: 'Versioning', value: 'versioning', checked: true },
          { name: 'Backup', value: 'backup', checked: true },
          { name: 'CDN', value: 'cdn' }
        ]
      }
    ]);
    
    // Update config with answers
    config.purpose = answers.purpose;
    config.industry = answers.industry;
    config.environment = answers.environment;
    config.features.authentication = answers.authentication;
    config.features.database = answers.database;
    config.features.storage = answers.storage;
    config.features.functions = answers.functions;
    config.features.monitoring = answers.monitoring;
    
    // Update auth providers
    config.authProviders.email = answers.authProviders.includes('email');
    config.authProviders.google = answers.authProviders.includes('google');
    config.authProviders.github = answers.authProviders.includes('github');
    
    // Update storage features
    config.storage.versioning = answers.storageFeatures.includes('versioning');
    config.storage.backup = answers.storageFeatures.includes('backup');
    config.storage.cdn = answers.storageFeatures.includes('cdn');
    
    return config;
  }
  
  /**
   * Validates the configuration
   */
  private async validateConfig(config: ProjectConfig): Promise<void> {
    console.log(chalk.blue('\n🔍 Validating configuration...'));
    
    // Check required environment variables
    const requiredEnvVars = [
      'GITHUB_ACCESS_TOKEN',
      'FIREBASE_CENTRAL_PROJECT_ID',
      'GCP_CENTRAL_PROJECT_ID',
      'OPENAI_API_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    // Validate project name
    if (!config.name || config.name.length < 3) {
      throw new Error('Project name must be at least 3 characters long');
    }
    
    console.log(chalk.green('✅ Configuration validated'));
  }
  
  /**
   * Saves configuration files to the project
   */
  private async saveConfigurationFiles(infrastructure: any): Promise<void> {
    console.log(chalk.blue('\n💾 Saving configuration files...'));
    
    const projectPath = path.join(process.cwd(), infrastructure.projectName);
    
    // Create project directory if it doesn't exist
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    
    // Save environment file
    const envPath = path.join(projectPath, '.env');
    fs.writeFileSync(envPath, infrastructure.environment['.env']);
    
    // Save Firebase config
    const firebaseConfigPath = path.join(projectPath, 'firebase.config.js');
    fs.writeFileSync(firebaseConfigPath, infrastructure.environment['firebase.config.js']);
    
    // Save GCS config
    const gcsConfigPath = path.join(projectPath, 'gcs.config.js');
    fs.writeFileSync(gcsConfigPath, infrastructure.environment['gcs.config.js']);
    
    // Save GCP config
    const gcpConfigPath = path.join(projectPath, 'gcp.config.js');
    fs.writeFileSync(gcpConfigPath, infrastructure.environment['gcp.config.js']);
    
    // Save service account key
    const serviceAccountPath = path.join(projectPath, 'firebase-service-account.json');
    fs.writeFileSync(serviceAccountPath, infrastructure.environment['firebase-service-account.json']);
    
    console.log(chalk.green('✅ Configuration files saved'));
  }
  
  /**
   * Displays infrastructure setup results
   */
  private displayResults(infrastructure: any): void {
    console.log(chalk.blue('\n📊 Infrastructure Setup Results:'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    
    console.log(chalk.cyan('📦 GitHub Repository:'));
    console.log(chalk.gray(`   URL: ${infrastructure.github.repoUrl}`));
    console.log(chalk.gray(`   Clone: ${infrastructure.github.cloneUrl}`));
    
    console.log(chalk.cyan('\n🔥 Firebase Project:'));
    console.log(chalk.gray(`   Project ID: ${infrastructure.firebase.projectId}`));
    console.log(chalk.gray(`   Auth Domain: ${infrastructure.firebase.config.authDomain}`));
    
    console.log(chalk.cyan('\n☁️  GCS Bucket:'));
    console.log(chalk.gray(`   Bucket: ${infrastructure.gcs.bucketName}`));
    console.log(chalk.gray(`   URL: ${infrastructure.gcs.bucketUrl}`));
    
    console.log(chalk.cyan('\n🔧 GCP Project:'));
    console.log(chalk.gray(`   Project ID: ${infrastructure.gcp.projectId}`));
    console.log(chalk.gray(`   Service Account: ${infrastructure.gcp.serviceAccount}`));
    
    console.log(chalk.gray('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  }
  
  /**
   * Validates existing infrastructure
   */
  async validate(projectName: string): Promise<void> {
    console.log(chalk.blue(`🔍 Validating infrastructure for: ${projectName}`));
    
    try {
      const isValid = await this.orchestrator.validateInfrastructure(projectName);
      
      if (isValid) {
        console.log(chalk.green('✅ Infrastructure validation passed'));
      } else {
        console.log(chalk.red('❌ Infrastructure validation failed'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Validation error:'), error);
      process.exit(1);
    }
  }
  
  /**
   * Gets infrastructure status
   */
  async status(projectName: string): Promise<void> {
    console.log(chalk.blue(`📊 Infrastructure status for: ${projectName}`));
    
    try {
      const status = await this.orchestrator.getInfrastructureStatus(projectName);
      
      console.log(chalk.cyan('\nService Status:'));
      Object.entries(status).forEach(([service, info]: [string, any]) => {
        const statusColor = info.status === 'active' ? chalk.green : chalk.red;
        console.log(chalk.gray(`   ${service}: ${statusColor(info.status)}`));
      });
    } catch (error) {
      console.error(chalk.red('❌ Status check error:'), error);
      process.exit(1);
    }
  }
}

// CLI setup
const cli = new InfrastructureCLI();

program
  .name('setup-infrastructure')
  .description('Setup GitHub, Firebase, GCS, and GCP infrastructure for projects')
  .version('1.0.0');

program
  .command('setup <project-name>')
  .description('Setup infrastructure for a new project')
  .option('-p, --purpose <purpose>', 'Project purpose')
  .option('-i, --industry <industry>', 'Project industry')
  .option('--non-interactive', 'Run in non-interactive mode')
  .action(async (projectName, options) => {
    await cli.setup(projectName, options);
  });

program
  .command('validate <project-name>')
  .description('Validate existing infrastructure')
  .action(async (projectName) => {
    await cli.validate(projectName);
  });

program
  .command('status <project-name>')
  .description('Get infrastructure status')
  .action(async (projectName) => {
    await cli.status(projectName);
  });

program.parse(); 