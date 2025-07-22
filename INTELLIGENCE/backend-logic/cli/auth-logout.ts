#!/usr/bin/env node

/**
 * Authentication Logout Command
 * Logs out the current user
 */

import chalk from 'chalk';
import { AuthManager } from '../infrastructure/auth-manager';

async function logout() {
  const authManager = new AuthManager();
  
  const isAuth = await authManager.isAuthenticated();
  if (!isAuth) {
    console.log(chalk.yellow('⚠️  You are not currently logged in.'));
    return;
  }
  
  await authManager.logout();
  console.log(chalk.green('✅ Successfully logged out!'));
  console.log(chalk.gray('\nTo login again, run: npm run deploy:login'));
}

// Run logout
logout().catch(console.error); 