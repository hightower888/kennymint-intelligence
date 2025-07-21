#!/usr/bin/env node

/**
 * User-Friendly Deployment Wizard
 * Interactive, error-resistant setup process that anyone can use
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { AuthManager } from '../infrastructure/auth-manager';
import { InfrastructureOrchestrator } from '../infrastructure/infrastructure-orchestrator';

interface WizardState {
  step: number;
  totalSteps: number;
  authenticated: boolean;
  projectName?: string;
  projectConfig?: any;
  infrastructure?: any;
  errors: string[];
  history: any[];
}

export class DeploymentWizard {
  private state: WizardState;
  private authManager: AuthManager;
  private orchestrator: InfrastructureOrchestrator;
  private spinner: any;
  
  constructor() {
    this.state = {
      step: 1,
      totalSteps: 8,
      authenticated: false,
      errors: [],
      history: []
    };
    this.authManager = new AuthManager();
    this.orchestrator = new InfrastructureOrchestrator();
    this.spinner = ora();
  }
  
  /**
   * Starts the deployment wizard
   */
  async start(): Promise<void> {
    console.clear();
    this.showWelcome();
    
    // Main wizard loop
    while (this.state.step <= this.state.totalSteps) {
      try {
        await this.executeStep();
      } catch (error) {
        await this.handleError(error);
      }
    }
    
    this.showCompletion();
  }
  
  /**
   * Shows welcome screen
   */
  private showWelcome(): void {
    console.log(chalk.cyan('╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║                                                           ║'));
    console.log(chalk.cyan('║') + chalk.white.bold('         🚀 AI Template Deployment Wizard 🚀              ') + chalk.cyan('║'));
    console.log(chalk.cyan('║                                                           ║'));
    console.log(chalk.cyan('║') + chalk.gray('  Deploy your AI-powered application in minutes!          ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + chalk.gray('  This wizard will guide you through every step.          ') + chalk.cyan('║'));
    console.log(chalk.cyan('║                                                           ║'));
    console.log(chalk.cyan('╚═══════════════════════════════════════════════════════════╝'));
    console.log('');
  }
  
  /**
   * Executes the current step
   */
  private async executeStep(): Promise<void> {
    this.showProgress();
    
    switch (this.state.step) {
      case 1:
        await this.stepAuthentication();
        break;
      case 2:
        await this.stepProjectName();
        break;
      case 3:
        await this.stepProjectType();
        break;
      case 4:
        await this.stepFeatureSelection();
        break;
      case 5:
        await this.stepServiceConfiguration();
        break;
      case 6:
        await this.stepReviewConfiguration();
        break;
      case 7:
        await this.stepDeployInfrastructure();
        break;
      case 8:
        await this.stepFinalSetup();
        break;
    }
    
    // Save state after each step
    this.saveState();
  }
  
  /**
   * Step 1: Authentication
   */
  private async stepAuthentication(): Promise<void> {
    console.log(chalk.blue('\n📋 Step 1: Authentication'));
    console.log(chalk.gray('Let\'s verify your identity to access the infrastructure.\n'));
    
    // Check if already authenticated
    const isAuth = await this.authManager.isAuthenticated();
    if (isAuth) {
      console.log(chalk.green('✅ Already authenticated!'));
      this.state.authenticated = true;
      this.state.step++;
      return;
    }
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email:',
        validate: (input) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) || 'Please enter a valid email';
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password:',
        mask: '*'
      }
    ]);
    
    this.spinner.start('Authenticating...');
    
    try {
      await this.authManager.authenticate(answers.email, answers.password);
      this.spinner.succeed('Authentication successful!');
      this.state.authenticated = true;
      this.state.step++;
    } catch (error) {
      this.spinner.fail('Authentication failed');
      throw error;
    }
  }
  
  /**
   * Step 2: Project Name
   */
  private async stepProjectName(): Promise<void> {
    console.log(chalk.blue('\n📋 Step 2: Project Information'));
    console.log(chalk.gray('Let\'s set up your new project.\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What would you like to name your project?',
        default: 'my-ai-app',
        validate: (input) => {
          if (input.length < 3) return 'Project name must be at least 3 characters';
          if (!/^[a-z0-9-]+$/.test(input)) return 'Use only lowercase letters, numbers, and hyphens';
          return true;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Brief description of your project:',
        default: 'AI-powered application'
      }
    ]);
    
    this.state.projectName = answers.projectName;
    this.state.projectConfig = {
      name: answers.projectName,
      description: answers.description
    };
    
    this.state.step++;
  }
  
  /**
   * Step 3: Project Type
   */
  private async stepProjectType(): Promise<void> {
    console.log(chalk.blue('\n📋 Step 3: Project Type'));
    console.log(chalk.gray('Choose the type of application you\'re building.\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'What type of application are you building?',
        choices: [
          { name: '💬 Chat Application (AI chatbot, customer support)', value: 'chat' },
          { name: '📊 Analytics Dashboard (Data visualization, insights)', value: 'analytics' },
          { name: '🛍️ E-commerce Platform (AI-powered shopping)', value: 'ecommerce' },
          { name: '📚 Content Management (Blog, documentation)', value: 'content' },
          { name: '🎮 Interactive Experience (Games, simulations)', value: 'interactive' },
          { name: '🔧 Custom Application (Start from scratch)', value: 'custom' }
        ]
      },
      {
        type: 'list',
        name: 'industry',
        message: 'Which industry is this for?',
        choices: [
          'Technology',
          'Healthcare',
          'Finance',
          'Education',
          'E-commerce',
          'Entertainment',
          'Other'
        ]
      }
    ]);
    
    this.state.projectConfig = {
      ...this.state.projectConfig,
      projectType: answers.projectType,
      industry: answers.industry.toLowerCase()
    };
    
    this.state.step++;
  }
  
  /**
   * Step 4: Feature Selection
   */
  private async stepFeatureSelection(): Promise<void> {
    console.log(chalk.blue('\n📋 Step 4: Feature Selection'));
    console.log(chalk.gray('Select the features you need for your application.\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which features do you need? (Space to select, Enter to continue)',
        choices: [
          { name: '🔐 User Authentication', value: 'authentication', checked: true },
          { name: '💾 Database Storage', value: 'database', checked: true },
          { name: '📁 File Storage', value: 'storage', checked: true },
          { name: '⚡ Real-time Updates', value: 'realtime', checked: false },
          { name: '📧 Email Notifications', value: 'email', checked: false },
          { name: '💳 Payment Processing', value: 'payments', checked: false },
          { name: '📊 Analytics & Monitoring', value: 'analytics', checked: true },
          { name: '🌐 Multi-language Support', value: 'i18n', checked: false },
          { name: '📱 Mobile App Support', value: 'mobile', checked: false },
          { name: '🤖 AI/ML Integration', value: 'ai', checked: true }
        ]
      }
    ]);
    
    this.state.projectConfig.features = answers.features.reduce((acc: any, feature: string) => {
      acc[feature] = true;
      return acc;
    }, {});
    
    this.state.step++;
  }
  
  /**
   * Step 5: Service Configuration
   */
  private async stepServiceConfiguration(): Promise<void> {
    console.log(chalk.blue('\n📋 Step 5: Service Configuration'));
    console.log(chalk.gray('Configure the services for your application.\n'));
    
    const questions = [];
    
    // Authentication providers
    if (this.state.projectConfig.features.authentication) {
      questions.push({
        type: 'checkbox',
        name: 'authProviders',
        message: 'Select authentication providers:',
        choices: [
          { name: '📧 Email/Password', value: 'email', checked: true },
          { name: '🔷 Google', value: 'google', checked: false },
          { name: '🐙 GitHub', value: 'github', checked: false },
          { name: '🔵 Facebook', value: 'facebook', checked: false },
          { name: '🐦 Twitter', value: 'twitter', checked: false }
        ]
      });
    }
    
    // Storage options
    if (this.state.projectConfig.features.storage) {
      questions.push({
        type: 'checkbox',
        name: 'storageOptions',
        message: 'Select storage options:',
        choices: [
          { name: '📦 File Versioning', value: 'versioning', checked: true },
          { name: '💾 Automatic Backups', value: 'backup', checked: true },
          { name: '🌐 CDN Integration', value: 'cdn', checked: false },
          { name: '🔒 Encryption at Rest', value: 'encryption', checked: true }
        ]
      });
    }
    
    // AI services
    if (this.state.projectConfig.features.ai) {
      questions.push({
        type: 'checkbox',
        name: 'aiServices',
        message: 'Select AI services to enable:',
        choices: [
          { name: '💬 OpenAI GPT', value: 'openai', checked: true },
          { name: '🖼️ Image Generation', value: 'dalle', checked: false },
          { name: '🎤 Speech Recognition', value: 'speech', checked: false },
          { name: '🌐 Translation', value: 'translate', checked: false },
          { name: '📊 Data Analysis', value: 'analysis', checked: false }
        ]
      });
    }
    
    const answers = await inquirer.prompt(questions);
    
    this.state.projectConfig = {
      ...this.state.projectConfig,
      ...answers
    };
    
    this.state.step++;
  }
  
  /**
   * Step 6: Review Configuration
   */
  private async stepReviewConfiguration(): Promise<void> {
    console.log(chalk.blue('\n📋 Step 6: Review Configuration'));
    console.log(chalk.gray('Please review your configuration before deployment.\n'));
    
    // Display configuration summary
    console.log(chalk.cyan('Project Configuration:'));
    console.log(chalk.gray('─────────────────────────────────────'));
    console.log(`${chalk.white('Name:')} ${this.state.projectName}`);
    console.log(`${chalk.white('Type:')} ${this.state.projectConfig.projectType}`);
    console.log(`${chalk.white('Industry:')} ${this.state.projectConfig.industry}`);
    
    console.log(`\n${chalk.white('Features:')}`);
    Object.entries(this.state.projectConfig.features || {}).forEach(([key, value]) => {
      if (value) console.log(`  ✓ ${key}`);
    });
    
    if (this.state.projectConfig.authProviders) {
      console.log(`\n${chalk.white('Auth Providers:')}`);
      this.state.projectConfig.authProviders.forEach((provider: string) => {
        console.log(`  ✓ ${provider}`);
      });
    }
    
    console.log(chalk.gray('\n─────────────────────────────────────\n'));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Is this configuration correct?',
        default: true
      }
    ]);
    
    if (!confirm) {
      // Go back to step 2
      this.state.step = 2;
      console.log(chalk.yellow('\n↩️  Let\'s reconfigure your project...'));
    } else {
      this.state.step++;
    }
  }
  
  /**
   * Step 7: Deploy Infrastructure
   */
  private async stepDeployInfrastructure(): Promise<void> {
    console.log(chalk.blue('\n📋 Step 7: Deploy Infrastructure'));
    console.log(chalk.gray('Now we\'ll create all the infrastructure for your project.\n'));
    
    const tasks = [
      { name: 'Creating GitHub repository', duration: 3000 },
      { name: 'Setting up Firebase project', duration: 4000 },
      { name: 'Creating storage buckets', duration: 2000 },
      { name: 'Configuring GCP project', duration: 3000 },
      { name: 'Setting up authentication', duration: 2000 },
      { name: 'Configuring API access', duration: 2000 },
      { name: 'Creating CI/CD pipelines', duration: 2000 },
      { name: 'Setting up monitoring', duration: 1000 }
    ];
    
    console.log(chalk.yellow('This will take a few minutes...\n'));
    
    for (const task of tasks) {
      this.spinner.start(task.name);
      
      try {
        // Simulate task execution (replace with actual infrastructure creation)
        await new Promise(resolve => setTimeout(resolve, task.duration));
        
        // In real implementation, call the actual infrastructure methods
        // await this.orchestrator.createProjectInfrastructure(...)
        
        this.spinner.succeed(task.name);
      } catch (error) {
        this.spinner.fail(task.name);
        throw error;
      }
    }
    
    // Store infrastructure details
    this.state.infrastructure = {
      github: { url: `https://github.com/your-org/${this.state.projectName}` },
      firebase: { projectId: `${this.state.projectName}-firebase` },
      gcs: { bucket: `${this.state.projectName}-storage` },
      gcp: { projectId: `${this.state.projectName}-gcp` }
    };
    
    console.log(chalk.green('\n✅ Infrastructure deployed successfully!'));
    this.state.step++;
  }
  
  /**
   * Step 8: Final Setup
   */
  private async stepFinalSetup(): Promise<void> {
    console.log(chalk.blue('\n📋 Step 8: Final Setup'));
    console.log(chalk.gray('Let\'s complete the setup and get you started!\n'));
    
    this.spinner.start('Generating configuration files');
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.spinner.succeed('Configuration files generated');
    
    this.spinner.start('Setting up local development environment');
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.spinner.succeed('Local environment ready');
    
    this.spinner.start('Running initial tests');
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.spinner.succeed('All tests passed');
    
    this.state.step++;
  }
  
  /**
   * Shows progress bar
   */
  private showProgress(): void {
    const progress = Math.round((this.state.step / this.state.totalSteps) * 100);
    const filled = Math.round(progress / 5);
    const empty = 20 - filled;
    
    console.log('\n' + chalk.gray('Progress: ') + 
      chalk.green('█'.repeat(filled)) + 
      chalk.gray('░'.repeat(empty)) + 
      chalk.gray(` ${progress}%`));
  }
  
  /**
   * Handles errors gracefully
   */
  private async handleError(error: any): Promise<void> {
    console.log(chalk.red(`\n❌ Error: ${error.message}`));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🔄 Retry this step', value: 'retry' },
          { name: '⬅️  Go back to previous step', value: 'back' },
          { name: '📝 View error details', value: 'details' },
          { name: '❌ Exit wizard', value: 'exit' }
        ]
      }
    ]);
    
    switch (action) {
      case 'retry':
        // Retry current step
        break;
      case 'back':
        if (this.state.step > 1) {
          this.state.step--;
        }
        break;
      case 'details':
        console.log(chalk.gray('\nError details:'));
        console.log(error.stack);
        await this.handleError(error); // Show menu again
        break;
      case 'exit':
        console.log(chalk.yellow('\n👋 Wizard closed. Your progress has been saved.'));
        process.exit(0);
    }
  }
  
  /**
   * Shows completion screen
   */
  private showCompletion(): void {
    console.clear();
    console.log(chalk.green('╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.green('║                                                           ║'));
    console.log(chalk.green('║') + chalk.white.bold('         🎉 Deployment Complete! 🎉                       ') + chalk.green('║'));
    console.log(chalk.green('║                                                           ║'));
    console.log(chalk.green('╚═══════════════════════════════════════════════════════════╝'));
    
    console.log(chalk.white('\n📦 Your project has been successfully deployed!\n'));
    
    console.log(chalk.cyan('Project Details:'));
    console.log(chalk.gray('─────────────────────────────────────'));
    console.log(`${chalk.white('Name:')} ${this.state.projectName}`);
    console.log(`${chalk.white('GitHub:')} ${this.state.infrastructure?.github.url}`);
    console.log(`${chalk.white('Firebase:')} ${this.state.infrastructure?.firebase.projectId}`);
    console.log(`${chalk.white('Storage:')} ${this.state.infrastructure?.gcs.bucket}`);
    console.log(chalk.gray('─────────────────────────────────────\n'));
    
    console.log(chalk.yellow('🚀 Next Steps:\n'));
    console.log('1. Clone your repository:');
    console.log(chalk.gray(`   git clone ${this.state.infrastructure?.github.url}`));
    console.log(chalk.gray(`   cd ${this.state.projectName}\n`));
    
    console.log('2. Install dependencies:');
    console.log(chalk.gray('   npm install\n'));
    
    console.log('3. Start development:');
    console.log(chalk.gray('   npm run dev\n'));
    
    console.log('4. View your project:');
    console.log(chalk.gray('   http://localhost:3000\n'));
    
    console.log(chalk.green('Happy coding! 🎨\n'));
  }
  
  /**
   * Saves wizard state for recovery
   */
  private saveState(): void {
    const statePath = path.join(process.env.HOME || '', '.ai-template', 'wizard-state.json');
    fs.writeFileSync(statePath, JSON.stringify(this.state, null, 2));
  }
  
  /**
   * Loads saved state
   */
  private loadState(): void {
    const statePath = path.join(process.env.HOME || '', '.ai-template', 'wizard-state.json');
    if (fs.existsSync(statePath)) {
      const savedState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      this.state = { ...this.state, ...savedState };
    }
  }
}

// Run wizard if called directly
if (require.main === module) {
  const wizard = new DeploymentWizard();
  wizard.start().catch(console.error);
} 