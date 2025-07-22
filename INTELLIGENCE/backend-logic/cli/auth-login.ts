#!/usr/bin/env node

/**
 * Authentication Login Command
 * Allows users to authenticate before using infrastructure
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { AuthManager } from '../infrastructure/auth-manager';

async function login() {
  console.log(chalk.cyan('🔐 AI Template Authentication\n'));
  
  const authManager = new AuthManager();
  
  // Check if already authenticated
  const isAuth = await authManager.isAuthenticated();
  if (isAuth) {
    console.log(chalk.green('✅ You are already authenticated!'));
    console.log(chalk.gray('\nTo logout, run: npm run deploy:logout'));
    return;
  }
  
  console.log(chalk.gray('Please enter your credentials to access the infrastructure.\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      validate: (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || 'Please enter a valid email';
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      mask: '*'
    }
  ]);
  
  try {
    const session = await authManager.authenticate(answers.email, answers.password);
    
    console.log(chalk.green('\n✅ Authentication successful!'));
    console.log(chalk.gray(`Logged in as: ${session.email}`));
    console.log(chalk.gray(`Session expires: ${new Date(session.expiresAt).toLocaleString()}`));
    console.log(chalk.yellow('\nYou can now deploy projects using: npm run deploy'));
    
  } catch (error: any) {
    console.error(chalk.red('\n❌ Authentication failed:'), error.message);
    console.log(chalk.yellow('\nIf you don\'t have credentials, please contact your administrator.'));
    process.exit(1);
  }
}

// Run login
login().catch(console.error); 