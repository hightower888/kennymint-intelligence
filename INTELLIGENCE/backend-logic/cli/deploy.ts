#!/usr/bin/env node

/**
 * Simple Deploy Command
 * Starts the deployment wizard with one command
 */

import { DeploymentWizard } from './deploy-wizard';
import chalk from 'chalk';

async function deploy() {
  try {
    const wizard = new DeploymentWizard();
    await wizard.start();
  } catch (error: any) {
    console.error(chalk.red('\n❌ Deployment failed:'), error.message);
    console.log(chalk.yellow('\nFor help, run: npm run deploy:help'));
    process.exit(1);
  }
}

// Run deployment
deploy(); 