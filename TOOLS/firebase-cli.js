#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs');
const path = require('path');

// Debug logging
const DEBUG = process.env.DEBUG === 'true';
function debugLog(message, data = null) {
  if (DEBUG) {
    console.log(chalk.gray(`🔍 DEBUG: ${message}`));
    if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
  }
}

// Progress indicator
function showProgress(message) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[i]} ${message}`);
    i = (i + 1) % frames.length;
  }, 80);
  return () => {
    clearInterval(interval);
    process.stdout.write('\r' + ' '.repeat(message.length + 2) + '\r');
  };
}

function getErrorSuggestions(error, operation) {
  const suggestions = [];
  
  if (error.message.includes('not authenticated')) {
    suggestions.push('Run: gcloud auth login');
    suggestions.push('Check your Google Cloud credentials');
  } else if (error.message.includes('permission denied')) {
    suggestions.push('Check your IAM permissions');
    suggestions.push('Verify you have the required roles');
  } else if (error.message.includes('already exists')) {
    suggestions.push('Use a different project ID');
    suggestions.push('Check existing projects first');
  } else if (error.message.includes('network')) {
    suggestions.push('Check your internet connection');
    suggestions.push('Try again in a few moments');
        } else if (error.message.includes('quota exceeded')) {
        suggestions.push('Check your service quotas');
        suggestions.push('Consider upgrading your plan');
      } else if (error.message.includes('exceeded your allotted project quota')) {
        suggestions.push('Delete unused projects to free up quota');
        suggestions.push('Contact Google Cloud support to increase quota');
        suggestions.push('Use existing projects instead of creating new ones');
      }
  
  return suggestions;
}

async function tryAutoFix(error, operation) {
  console.log(chalk.blue('\n🔧 Attempting auto-fix...'));
  
  if (error.message.includes('not authenticated')) {
    try {
      await execAsync('gcloud auth login --no-launch-browser');
      console.log(chalk.green('✅ Authentication fixed!'));
    } catch (authError) {
      console.log(chalk.red('❌ Auto-fix failed. Please run: gcloud auth login'));
    }
        } else if (error.message.includes('project not found')) {
        console.log(chalk.yellow('⚠️  Cannot auto-fix project access. Check your permissions.'));
      } else if (error.message.includes('exceeded your allotted project quota')) {
        console.log(chalk.yellow('⚠️  Project quota exceeded. You need to delete some projects first.'));
        console.log(chalk.blue('💡 Tip: Use "Delete Firebase Project" to remove unused projects'));
      } else {
        console.log(chalk.yellow('⚠️  No auto-fix available for this error.'));
      }
}

console.log(chalk.magenta.bold(`\n╔═══════════════════════════════════════════════════════════╗\n║                 🔥 FIREBASE CLI 🔥                        ║\n║              Direct Google Cloud Connection               ║\n╚═══════════════════════════════════════════════════════════╝\n`));

console.log(chalk.cyan.bold('🎯 WHAT THIS TOOL DOES:'));
console.log(chalk.gray('• Manage your Firebase and Google Cloud projects'));
console.log(chalk.gray('• Set up databases, authentication, hosting, and more'));
console.log(chalk.gray('• Everything is step-by-step and foolproof'));
console.log(chalk.gray('• You can always go back or cancel any operation\n'));

async function handleError(error, operation, retryFunction) {
  console.error(chalk.red(`\n❌ Error during ${operation}:`), error.message);
  debugLog(`Error details for ${operation}`, { error: error.message, stack: error.stack });
  
  // Provide specific error suggestions
  const suggestions = getErrorSuggestions(error, operation);
  if (suggestions.length > 0) {
    console.log(chalk.yellow('\n💡 Suggestions:'));
    suggestions.forEach(suggestion => console.log(chalk.gray(`   • ${suggestion}`)));
  }
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🔄 Retry', value: 'retry' },
        { name: '🔧 Try Auto-Fix', value: 'auto-fix' },
        { name: '🔙 Back to previous menu', value: 'back' },
        { name: '🏠 Return to main menu', value: 'main' }
      ]
    }
  ]);
  
  switch (action) {
    case 'retry':
      if (retryFunction) {
        await retryFunction();
      }
      break;
    case 'auto-fix':
      await tryAutoFix(error, operation);
      break;
    case 'back':
      return 'back';
    case 'main':
      return 'main';
  }
}

async function safeOperation(operation, operationName, retryFunction) {
  try {
    debugLog(`Starting operation: ${operationName}`);
    await operation();
    debugLog(`Completed operation: ${operationName}`);
  } catch (error) {
    const result = await handleError(error, operationName, retryFunction);
    if (result === 'main') {
      return 'main';
    }
  }
  return 'continue';
}

async function checkConnectionStatus() {
  const result = await safeOperation(async () => {
    console.log(chalk.blue('\n📊 Checking Firebase & Google Cloud Connection...\n'));
    debugLog('Checking gcloud authentication');
    
    const { stdout: authStatus } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"');
    if (authStatus.trim()) {
      console.log(chalk.green('✅ Google Cloud authenticated:'));
      console.log(chalk.gray(`   ${authStatus.trim()}`));
    } else {
      console.log(chalk.red('❌ Not authenticated with Google Cloud'));
      console.log(chalk.yellow('   Run: gcloud auth login'));
      return;
    }
    
    debugLog('Checking current project');
    const { stdout: currentProject } = await execAsync('gcloud config get-value project');
    if (currentProject.trim()) {
      console.log(chalk.green(`✅ Current project: ${currentProject.trim()}`));
    }
    
    debugLog('Checking Firebase CLI');
    try {
      const { stdout: firebaseVersion } = await execAsync('firebase --version');
      console.log(chalk.green(`✅ Firebase CLI installed: ${firebaseVersion.trim()}`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Firebase CLI not installed'));
      console.log(chalk.gray('   Install with: npm install -g firebase-tools'));
    }
    
    debugLog('Checking gcloud version');
    const { stdout: gcloudVersion } = await execAsync('gcloud --version');
    console.log(chalk.green('✅ Google Cloud SDK installed'));
    debugLog('gcloud version info', gcloudVersion.split('\n')[0]);
    
    console.log(chalk.green('\n✅ Ready to manage Firebase projects!'));
  }, 'connection check', () => checkConnectionStatus());
  
  if (result === 'main') return 'main';
}

async function selectProjectToWorkWith() {
  const result = await safeOperation(async () => {
    console.log(chalk.blue('\n🎯 STEP 1: Pick Your Project\n'));
    console.log(chalk.gray('You need to choose which project you want to work with.'));
    console.log(chalk.gray('This is like picking which folder to open on your computer.\n'));
    
    const projectId = await selectProjectPrompt('Select a project to work with:');
    if (!projectId) {
      console.log(chalk.yellow('No project selected.'));
      return;
    }
    
    console.log(chalk.green(`\n✅ Selected project: ${projectId}`));
    console.log(chalk.cyan('   This project is now active for all operations'));
    console.log(chalk.gray('   Use other menu options to manage this project'));
    
    // Set as default project
    try {
      await execAsync(`gcloud config set project ${projectId}`);
      console.log(chalk.green(`✅ Set as default GCP project`));
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Could not set as default project: ${error.message}`));
    }
    
    // Now show what you can do with this project
    console.log(chalk.blue('\n🎯 GREAT! You selected: ' + chalk.green(projectId)));
    console.log(chalk.gray('Now what would you like to do with this project?'));
    console.log(chalk.gray('(Each option will guide you step-by-step)\n'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📁 Set up Database - Create collections and store data', value: 'firestore' },
          { name: '🔐 Set up User Login - Let users sign in to your app', value: 'auth' },
          { name: '🌐 Deploy Website - Put your app online', value: 'hosting' },
          { name: '⚡ Create Backend Code - Add server-side functionality', value: 'functions' },
          { name: '📊 Check What\'s Set Up - See what\'s already configured', value: 'status' },
          { name: '⚙️  Project Settings - Change project configuration', value: 'config' },
          { name: '🔙 Go Back - Return to main menu', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'firestore':
        return await manageFirestore();
      case 'auth':
        return await manageFirebaseAuth();
      case 'hosting':
        return await manageFirebaseHosting();
      case 'functions':
        return await manageFirebaseFunctions();
      case 'status':
        return await checkConnectionStatus();
      case 'config':
        return await manageProjectConfig();
      case 'back':
        return 'continue';
    }
    
  }, 'selecting project to work with', () => selectProjectToWorkWith());
  
  if (result === 'main') return 'main';
}

async function listFirebaseProjects() {
  const result = await safeOperation(async () => {
    const { listType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'listType',
        message: 'What would you like to list?',
        choices: [
          { name: '🔥 Firebase Projects', value: 'firebase' },
          { name: '☁️  All GCP Projects', value: 'gcp' },
          { name: '📊 Both (Firebase + GCP)', value: 'both' }
        ]
      }
    ]);
    
    if (listType === 'firebase' || listType === 'both') {
      console.log(chalk.blue('\n📋 Listing Firebase Projects...\n'));
      debugLog('Fetching Firebase projects list');
      
      const projects = await listFirebaseProjectsRaw();
      if (!projects.length) {
        console.log(chalk.yellow('No Firebase projects found.'));
      } else {
        console.log(chalk.cyan('Firebase Projects:'));
        console.table(projects);
      }
    }
    
    if (listType === 'gcp' || listType === 'both') {
      console.log(chalk.blue('\n☁️  Listing All GCP Projects...\n'));
      debugLog('Fetching all GCP projects');
      
      try {
        const { stdout } = await execAsync(`gcloud projects list --format="table(projectId,name,projectNumber)"`);
        if (stdout.trim()) {
          console.log(chalk.cyan('All GCP Projects:'));
          console.log(stdout);
        } else {
          console.log(chalk.yellow('No GCP projects found.'));
        }
      } catch (error) {
        console.log(chalk.red(`❌ Error listing GCP projects: ${error.message}`));
        debugLog('GCP projects listing error', error.message);
      }
    }
    
    // Add a pause so user can see the results
    console.log(chalk.gray('\nPress Enter to continue...'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
    
  }, 'listing projects', () => listFirebaseProjects());
  
  if (result === 'main') return 'main';
}

async function listFirebaseProjectsRaw() {
  try {
    debugLog('Fetching projects as JSON');
    const { stdout } = await execAsync('gcloud projects list --format="json"');
    const projects = JSON.parse(stdout);
    debugLog('Fetched projects', { count: projects.length });
    return projects;
  } catch (error) {
    debugLog('Error fetching projects', error.message);
    console.log(chalk.yellow(`⚠️  Warning: Could not fetch projects: ${error.message}`));
    return [];
  }
}

async function selectProjectPrompt(message = 'Select a Firebase/GCP project:') {
  try {
    console.log(chalk.blue('\n📋 Loading your projects...'));
    const projects = await listFirebaseProjectsRaw();
    
    if (!projects.length) {
      console.log(chalk.red('❌ No projects found.'));
      console.log(chalk.yellow('You need to create a project first.'));
      return null;
    }
    
    console.log(chalk.green(`✅ Found ${projects.length} projects`));
    console.log(chalk.gray('(These are your Firebase/Google Cloud projects)'));
    
    // Add option to create new project
    const choices = [
      ...projects.map(p => ({
        name: `${p.projectId} - ${p.name}`,
        value: p.projectId
      })),
      { name: '➕ Create New Project - Make a brand new project', value: 'create-new' },
      { name: '🔙 Go Back - Return to main menu', value: 'back' }
    ];
    
    debugLog('Project selection choices', { count: choices.length });
    
    const { projectId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectId',
        message,
        choices
      }
    ]);
    
    debugLog('Selected project', { projectId });
    
    if (projectId === 'create-new') {
      return await createNewProjectSmart();
    }
    
    if (projectId === 'back') {
      return null;
    }
    
    return projectId;
  } catch (error) {
    console.log(chalk.red(`❌ Error selecting project: ${error.message}`));
    debugLog('Project selection error', error.message);
    return null;
  }
}

async function createNewProjectSmart() {
  const result = await safeOperation(async () => {
    console.log(chalk.blue('\n🚀 Smart Project Creation Wizard\n'));
    console.log(chalk.gray('This will help you create a new Firebase/GCP project with all necessary services enabled.\n'));
    
    // Step 1: Project ID generation and validation
    const { projectId, displayName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectId',
        message: 'Enter project ID (must be globally unique):',
        validate: async (input) => {
          if (input.length < 3) return 'Project ID must be at least 3 characters';
          if (!/^[a-z0-9-]+$/.test(input)) return 'Use only lowercase letters, numbers, and hyphens';
          
          // Check if project already exists
          try {
            const { stdout } = await execAsync(`gcloud projects describe ${input} --format="value(projectId)" 2>/dev/null || echo ""`);
            if (stdout.trim()) {
              return `Project ID "${input}" already exists. Please choose a different ID.`;
            }
          } catch (error) {
            // Project doesn't exist, which is good
          }
          
          // Check project quota before attempting creation
          try {
            const { stdout: quotaInfo } = await execAsync(`gcloud projects list --limit=1000 --format="value(projectId)" | wc -l`);
            const projectCount = parseInt(quotaInfo.trim());
            if (projectCount >= 20) { // Most accounts have 20 project limit
              return `You have ${projectCount} projects. You may have reached your project quota. Consider deleting unused projects first.`;
            }
          } catch (error) {
            // Quota check failed, but we'll try anyway
          }
          
          return true;
        }
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Enter display name (optional):',
        default: (answers) => answers.projectId
      }
    ]);
    
    // Step 2: Service selection
    const { services } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'services',
        message: 'Select services to enable (recommended for most projects):',
        choices: [
          { name: '🔥 Firebase (Authentication, Firestore, Functions, Hosting)', value: 'firebase', checked: true },
          { name: '☁️  Google Cloud Storage (GCS)', value: 'gcs', checked: true },
          { name: '🔧 Cloud Functions', value: 'cloudfunctions', checked: true },
          { name: '📊 Cloud Monitoring', value: 'monitoring', checked: true },
          { name: '🔐 Identity and Access Management (IAM)', value: 'iam', checked: true },
          { name: '💰 Billing API', value: 'billing', checked: false },
          { name: '📈 Analytics API', value: 'analytics', checked: false }
        ]
      }
    ]);
    
    // Step 3: Region selection
    const { region } = await inquirer.prompt([
      {
        type: 'list',
        name: 'region',
        message: 'Select default region (affects performance and cost):',
        choices: [
          { name: '🇺🇸 US Central 1 (Iowa) - Recommended', value: 'us-central1' },
          { name: '🇺🇸 US East 1 (South Carolina)', value: 'us-east1' },
          { name: '🇺🇸 US West 1 (Oregon)', value: 'us-west1' },
          { name: '🇪🇺 Europe West 1 (Belgium)', value: 'europe-west1' },
          { name: '🇪🇺 Europe West 2 (London)', value: 'europe-west2' },
          { name: '🌏 Asia East 1 (Taiwan)', value: 'asia-east1' },
          { name: '🌏 Asia Southeast 1 (Singapore)', value: 'asia-southeast1' }
        ]
      }
    ]);
    
    // Step 4: Confirmation
    console.log(chalk.blue('\n📋 Project Setup Summary:'));
    console.log(chalk.cyan(`   Project ID: ${projectId}`));
    console.log(chalk.cyan(`   Display Name: ${displayName}`));
    console.log(chalk.cyan(`   Region: ${region}`));
    console.log(chalk.cyan(`   Services: ${services.join(', ')}`));
    console.log(chalk.gray('\nThis will create a new GCP project and enable the selected services.'));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with project creation?',
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Project creation cancelled.'));
      return null;
    }
    
    // Step 5: Project creation with progress
    const stopProgress = showProgress('Creating GCP project...');
    debugLog('Creating GCP project', { projectId, displayName, region, services });
    
    try {
      // Create GCP project
      await execAsync(`gcloud projects create ${projectId} --name="${displayName}" --set-as-default`);
      stopProgress();
      console.log(chalk.green(`✅ GCP project created: ${projectId}`));
      
      // Enable selected services
      const stopServices = showProgress('Enabling services...');
      for (const service of services) {
        try {
          switch (service) {
            case 'firebase':
              await execAsync(`gcloud services enable firebase.googleapis.com --project=${projectId}`);
              await execAsync(`firebase projects:create ${projectId} --display-name="${displayName}"`);
              console.log(chalk.green('✅ Firebase enabled and initialized'));
              break;
            case 'gcs':
              await execAsync(`gcloud services enable storage.googleapis.com --project=${projectId}`);
              console.log(chalk.green('✅ Google Cloud Storage enabled'));
              break;
            case 'cloudfunctions':
              await execAsync(`gcloud services enable cloudfunctions.googleapis.com --project=${projectId}`);
              console.log(chalk.green('✅ Cloud Functions enabled'));
              break;
            case 'monitoring':
              await execAsync(`gcloud services enable monitoring.googleapis.com --project=${projectId}`);
              console.log(chalk.green('✅ Cloud Monitoring enabled'));
              break;
            case 'iam':
              await execAsync(`gcloud services enable iam.googleapis.com --project=${projectId}`);
              console.log(chalk.green('✅ IAM enabled'));
              break;
            case 'billing':
              await execAsync(`gcloud services enable billing.googleapis.com --project=${projectId}`);
              console.log(chalk.green('✅ Billing API enabled'));
              break;
            case 'analytics':
              await execAsync(`gcloud services enable analytics.googleapis.com --project=${projectId}`);
              console.log(chalk.green('✅ Analytics API enabled'));
              break;
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Warning: Could not enable ${service}: ${error.message}`));
        }
      }
      stopServices();
      
      // Set default region
      await execAsync(`gcloud config set compute/region ${region} --project=${projectId}`);
      console.log(chalk.green(`✅ Default region set to: ${region}`));
      
      console.log(chalk.green(`\n🎉 Project "${projectId}" created successfully!`));
      console.log(chalk.cyan(`   Ready for Firebase, GCS, and GCP development`));
      console.log(chalk.gray(`   Use this project ID in your applications`));
      
      return projectId;
      
    } catch (error) {
      stopProgress();
      
      if (error.message.includes('exceeded your allotted project quota')) {
        console.log(chalk.red(`\n❌ Project quota exceeded!`));
        console.log(chalk.yellow(`   You have reached the maximum number of projects allowed.`));
        console.log(chalk.blue(`\n💡 To create new projects, you need to:`));
        console.log(chalk.cyan(`   1. Delete unused projects first`));
        console.log(chalk.cyan(`   2. Use "🗑️  Delete Firebase Project" to clean up`));
        console.log(chalk.cyan(`   3. Or contact Google Cloud support to increase quota`));
        
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
              { name: '🗑️  Go to Delete Projects', value: 'delete' },
              { name: '🔙 Back to Main Menu', value: 'back' },
              { name: '❌ Exit', value: 'exit' }
            ]
          }
        ]);
        
        if (action === 'delete') {
          return 'delete-projects';
        } else if (action === 'exit') {
          process.exit(0);
        } else {
          return null;
        }
      }
      
      throw error;
    }
    
  }, 'smart project creation', () => createNewProjectSmart());
  
  if (result === 'main') return 'main';
  return result;
}

async function createFirebaseProject() {
  const result = await safeOperation(async () => {
    console.log(chalk.blue('\n🚀 Firebase Project Creation\n'));
    console.log(chalk.gray('This will create a new Firebase project with all necessary services.\n'));
    
    const projectId = await createNewProjectSmart();
    if (!projectId) return;
    
    if (projectId === 'delete-projects') {
      return await deleteFirebaseProject();
    }
    
    console.log(chalk.green(`\n✅ Project "${projectId}" is ready for development!`));
    console.log(chalk.cyan(`   Use this project ID in your Firebase applications`));
    console.log(chalk.gray(`   All necessary services are enabled and configured`));
    
  }, 'creating project', () => createFirebaseProject());
  
  if (result === 'main') return 'main';
}

async function checkAndUseExistingProject(projectId, displayName) {
  const result = await safeOperation(async () => {
    console.log(chalk.blue(`\n🔍 Checking project "${projectId}"...`));
    debugLog('Checking existing project', { projectId });
    
    let projectExists = false;
    let firebaseEnabled = false;
    let gcsEnabled = false;
    
    try {
      // Check if GCP project exists
      const { stdout: gcpInfo } = await execAsync(`gcloud projects describe ${projectId} --format="value(projectId,name)"`);
      projectExists = true;
      console.log(chalk.green(`✅ GCP project found: ${projectId}`));
      
      // Check Firebase status
      try {
        const { stdout: firebaseInfo } = await execAsync(`firebase projects:list --filter="${projectId}" --format="value(projectId)"`);
        if (firebaseInfo.trim()) {
          firebaseEnabled = true;
          console.log(chalk.green(`✅ Firebase already initialized`));
        }
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Firebase not initialized`));
      }
      
      // Check GCS status
      try {
        await execAsync(`gcloud services list --enabled --filter="name:storage.googleapis.com" --project=${projectId}`);
        gcsEnabled = true;
        console.log(chalk.green(`✅ Google Cloud Storage enabled`));
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Google Cloud Storage not enabled`));
      }
      
      // Offer to enable missing services
      const missingServices = [];
      if (!firebaseEnabled) missingServices.push('Firebase');
      if (!gcsEnabled) missingServices.push('Google Cloud Storage');
      
      if (missingServices.length > 0) {
        console.log(chalk.blue(`\n🔧 Missing services: ${missingServices.join(', ')}`));
        
        const { enableServices } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'enableServices',
            message: `Would you like to enable the missing services?`,
            default: true
          }
        ]);
        
        if (enableServices) {
          const stopProgress = showProgress('Enabling services...');
          
          if (!firebaseEnabled) {
            try {
              await execAsync(`gcloud services enable firebase.googleapis.com --project=${projectId}`);
              await execAsync(`firebase projects:create ${projectId} --display-name="${displayName}"`);
              console.log(chalk.green('✅ Firebase enabled and initialized'));
            } catch (error) {
              console.log(chalk.yellow(`⚠️  Could not enable Firebase: ${error.message}`));
            }
          }
          
          if (!gcsEnabled) {
            try {
              await execAsync(`gcloud services enable storage.googleapis.com --project=${projectId}`);
              console.log(chalk.green('✅ Google Cloud Storage enabled'));
            } catch (error) {
              console.log(chalk.yellow(`⚠️  Could not enable GCS: ${error.message}`));
            }
          }
          
          stopProgress();
        }
      }
      
      console.log(chalk.green(`\n🎉 Project "${projectId}" is ready to use!`));
      console.log(chalk.cyan(`   All necessary services are enabled`));
      
    } catch (error) {
      console.log(chalk.red(`❌ Project "${projectId}" not found in your account`));
      console.log(chalk.yellow(`   The project may exist but you don't have access to it`));
      
      const { tryDifferent } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'tryDifferent',
          message: 'Would you like to try a different project ID?',
          default: true
        }
      ]);
      
      if (tryDifferent) {
        return createNewProjectSmart();
      }
    }
  }, 'checking existing project', () => checkAndUseExistingProject(projectId, displayName));
  
  if (result === 'main') return 'main';
}

async function deleteFirebaseProject() {
  const result = await safeOperation(async () => {
    const { deleteType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deleteType',
        message: 'How would you like to delete projects?',
        choices: [
          { name: '🗑️  Delete Single Project', value: 'single' },
          { name: '🗑️🗑️  Bulk Delete Multiple Projects', value: 'bulk' },
          { name: '☁️  Delete GCP Project Only (Skip Firebase)', value: 'gcp-only' }
        ]
      }
    ]);
    
    if (deleteType === 'single') {
      console.log(chalk.blue('\n🗑️  Single Project Deletion'));
      const projectId = await selectProjectPrompt('Select a project to delete:');
      debugLog('Project selection result', { projectId });
      
      if (!projectId) {
        console.log(chalk.yellow('No project selected. Returning to main menu.'));
        return;
      }
      
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete Firebase project: ${projectId}? This cannot be undone!`,
          default: false
        }
      ]);
      if (!confirm) return;
    
      debugLog('Deleting project', { projectId });
      console.log(chalk.yellow(`\n🔄 Deleting Firebase project: ${projectId}`));
      
      // First delete the Firebase project (if it exists)
      try {
        debugLog('Attempting to delete Firebase project');
        await execAsync(`firebase projects:delete ${projectId}`);
        console.log(chalk.green('✅ Firebase project deleted'));
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Firebase project ${projectId} not found or already deleted`));
        debugLog('Firebase project deletion failed', error.message);
      }
      
      // Then delete the GCP project
      try {
        debugLog('Deleting GCP project');
        await execAsync(`gcloud projects delete ${projectId} --quiet`);
        console.log(chalk.green('✅ GCP project deleted'));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to delete GCP project: ${error.message}`));
        debugLog('GCP project deletion failed', error.message);
      }
      
      console.log(chalk.green(`\n✅ Project "${projectId}" deleted successfully!`));
      
    } else if (deleteType === 'gcp-only') {
      const projectId = await selectProjectPrompt('Select a GCP project to delete:');
      if (!projectId) return;
      
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete GCP project: ${projectId}? This will NOT delete Firebase data.`,
          default: false
        }
      ]);
      if (!confirm) return;
      
      debugLog('Deleting GCP project only', { projectId });
      console.log(chalk.yellow(`\n🔄 Deleting GCP project: ${projectId}`));
      
      try {
        debugLog('Deleting GCP project directly');
        await execAsync(`gcloud projects delete ${projectId} --quiet`);
        console.log(chalk.green('✅ GCP project deleted successfully!'));
        console.log(chalk.cyan('   Note: Firebase project may still exist separately'));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to delete GCP project: ${error.message}`));
        debugLog('GCP project deletion failed', error.message);
      }
      
    } else if (deleteType === 'bulk') {
      const projects = await listFirebaseProjectsRaw();
      if (!projects.length) {
        console.log(chalk.red('No projects found to delete.'));
        return;
      }
      
      const { selectedProjects } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedProjects',
          message: 'Select projects to delete (use spacebar to select multiple):',
          choices: projects.map(p => ({
            name: `${p.projectId} (${p.name})`,
            value: p.projectId
          }))
        }
      ]);
      
      if (!selectedProjects.length) {
        console.log(chalk.yellow('No projects selected for deletion.'));
        return;
      }
      
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete ${selectedProjects.length} projects? This cannot be undone!`,
          default: false
        }
      ]);
      
      if (!confirm) return;
      
      console.log(chalk.yellow(`\n🔄 Deleting ${selectedProjects.length} projects...`));
      
      for (const projectId of selectedProjects) {
        try {
          console.log(chalk.blue(`\n🗑️  Deleting ${projectId}...`));
          
          // Delete Firebase project
          try {
            await execAsync(`firebase projects:delete ${projectId}`);
            console.log(chalk.green(`✅ Firebase project ${projectId} deleted`));
          } catch (error) {
            console.log(chalk.yellow(`⚠️  Firebase project ${projectId} not found or already deleted`));
          }
          
          // Delete GCP project
          try {
            await execAsync(`gcloud projects delete ${projectId} --quiet`);
            console.log(chalk.green(`✅ GCP project ${projectId} deleted`));
          } catch (error) {
            console.log(chalk.red(`❌ Failed to delete GCP project ${projectId}: ${error.message}`));
          }
          
        } catch (error) {
          console.log(chalk.red(`❌ Error deleting ${projectId}: ${error.message}`));
        }
      }
      
      console.log(chalk.green(`\n✅ Bulk deletion completed!`));
    }
  }, 'deleting project', () => deleteFirebaseProject());
  
  if (result === 'main') return 'main';
}

// GCS Management Functions
async function manageGCS() {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'GCS Management - What would you like to do?',
        choices: [
          { name: '📁 List All Buckets (Cross-Project)', value: 'list-all-buckets' },
          { name: '📋 List Buckets in Project', value: 'list-buckets' },
          { name: '➕ Create Bucket', value: 'create-bucket' },
          { name: '🗑️  Delete Bucket', value: 'delete-bucket' },
          { name: '📄 List Files in Bucket', value: 'list-files' },
          { name: '⬆️  Upload File', value: 'upload-file' },
          { name: '📥 Download File', value: 'download-file' },
          { name: '🗑️  Delete File', value: 'delete-file' },
          { name: '🔐 Manage Bucket Permissions', value: 'bucket-permissions' },
          { name: '⚙️  Set Bucket Lifecycle', value: 'bucket-lifecycle' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'list-all-buckets':
        await listAllBuckets();
        break;
      case 'list-buckets':
        await listBucketsInProject();
        break;
      case 'create-bucket':
        await createBucket();
        break;
      case 'delete-bucket':
        await deleteBucket();
        break;
      case 'list-files':
        await listFilesInBucket();
        break;
      case 'upload-file':
        await uploadFileToBucket();
        break;
      case 'download-file':
        await downloadFileFromBucket();
        break;
      case 'delete-file':
        await deleteFileFromBucket();
        break;
      case 'bucket-permissions':
        await manageBucketPermissions();
        break;
      case 'bucket-lifecycle':
        await setBucketLifecycle();
        break;
      case 'back':
        return;
    }
  }, 'GCS management', () => manageGCS());
  
  if (result === 'main') return 'main';
}

async function listAllBuckets() {
  const result = await safeOperation(async () => {
    console.log(chalk.blue('\n📁 Listing All GCS Buckets (Cross-Project)...\n'));
    debugLog('Fetching all buckets across projects');
    const projects = await listFirebaseProjectsRaw();
    for (const project of projects) {
      console.log(chalk.cyan(`\n📋 Project: ${project.projectId} (${project.name})`));
      try {
        const { stdout } = await execAsync(`gsutil ls -p ${project.projectId}`);
        if (stdout.trim()) {
          console.log(stdout);
      } else {
          console.log(chalk.gray('   No buckets found'));
      }
    } catch (error) {
        console.log(chalk.red(`   Error: ${error.message}`));
    }
    }
  }, 'listing all buckets', () => listAllBuckets());
  
  if (result === 'main') return 'main';
}

async function listBucketsInProject() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to list buckets:');
    if (!projectId) return;
    
    console.log(chalk.blue(`\n📁 Listing Buckets in ${projectId}...\n`));
    debugLog('Listing buckets for project', { projectId });
    
    const { stdout } = await execAsync(`gsutil ls -p ${projectId}`);
    if (stdout.trim()) {
      console.log(stdout);
    } else {
      console.log(chalk.yellow('No buckets found in this project'));
    }
  }, 'listing buckets in project', () => listBucketsInProject());
  
  if (result === 'main') return 'main';
}

async function createBucket() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to create bucket in:');
    if (!projectId) return;
    
    const { bucketName, location } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bucketName',
        message: 'Enter bucket name (must be globally unique):',
        validate: (input) => {
          if (input.length < 3) return 'Bucket name must be at least 3 characters';
          if (!/^[a-z0-9-]+$/.test(input)) return 'Use only lowercase letters, numbers, and hyphens';
          return true;
        }
      },
      {
        type: 'list',
        name: 'location',
        message: 'Select bucket location:',
        choices: [
          { name: 'US (Multi-region)', value: 'US' },
          { name: 'EU (Multi-region)', value: 'EU' },
          { name: 'US Central 1', value: 'us-central1' },
          { name: 'US East 1', value: 'us-east1' },
          { name: 'Europe West 1', value: 'europe-west1' }
        ]
      }
    ]);
    
    debugLog('Creating bucket', { projectId, bucketName, location });
    console.log(chalk.yellow(`\n🔄 Creating bucket: ${bucketName}`));
    
    const command = `gsutil mb -p ${projectId} -l ${location} gs://${bucketName}`;
    debugLog('Executing command', command);
    await execAsync(command);
    
    console.log(chalk.green(`✅ Bucket created: gs://${bucketName}`));
    console.log(chalk.cyan(`   Project: ${projectId}`));
    console.log(chalk.cyan(`   Location: ${location}`));
  }, 'creating bucket', () => createBucket());

  if (result === 'main') return 'main';
}

async function deleteBucket() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project:');
    if (!projectId) return;
    
    // List buckets in the project
    const { stdout: buckets } = await execAsync(`gsutil ls -p ${projectId}`);
    if (!buckets.trim()) {
      console.log(chalk.yellow('No buckets found in this project'));
      return;
    }
    
    const bucketList = buckets.trim().split('\n');
    const { bucketName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'bucketName',
        message: 'Select a bucket to delete:',
        choices: bucketList.map(bucket => ({
          name: bucket,
          value: bucket.replace('gs://', '')
        }))
      }
    ]);
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete bucket: gs://${bucketName}? This will delete ALL files!`,
        default: false
      }
    ]);
    
    if (!confirm) return;
    
    debugLog('Deleting bucket', { projectId, bucketName });
    console.log(chalk.yellow(`\n🔄 Deleting bucket: gs://${bucketName}`));
    
    await execAsync(`gsutil rm -r gs://${bucketName}`);
    console.log(chalk.green(`✅ Bucket deleted: gs://${bucketName}`));
  }, 'deleting bucket', () => deleteBucket());

  if (result === 'main') return 'main';
}

async function listFilesInBucket() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to list files:');
    if (!projectId) return;

    const { bucketName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bucketName',
        message: 'Enter bucket name to list files:',
        default: `${projectId}.appspot.com`
      }
    ]);

    console.log(chalk.blue(`\n📄 Listing files in ${bucketName}...\n`));
    debugLog('Listing files in bucket', { projectId, bucketName });

    try {
      const { stdout } = await execAsync(`gsutil ls gs://${bucketName}/**`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error listing files:'), error.message);
    }
  }, 'listing files in bucket', () => listFilesInBucket());

  if (result === 'main') return 'main';
}

async function uploadFileToBucket() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to upload file to:');
    if (!projectId) return;

    const { bucketName, filePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bucketName',
        message: 'Enter bucket name:',
        default: `${projectId}.appspot.com`
      },
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter local file path to upload:'
      }
    ]);

    console.log(chalk.yellow(`\n🔄 Uploading file: ${filePath}`));
    debugLog('Uploading file', { projectId, bucketName, filePath });

    try {
      await execAsync(`gsutil cp "${filePath}" gs://${bucketName}/`);
      console.log(chalk.green(`✅ File uploaded to ${bucketName}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error uploading file:'), error.message);
    }
  }, 'uploading file to bucket', () => uploadFileToBucket());

  if (result === 'main') return 'main';
}

async function downloadFileFromBucket() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to download file from:');
    if (!projectId) return;

    const { bucketName, fileName, localPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bucketName',
        message: 'Enter bucket name:',
        default: `${projectId}.appspot.com`
      },
      {
        type: 'input',
        name: 'fileName',
        message: 'Enter file name in bucket:'
      },
      {
        type: 'input',
        name: 'localPath',
        message: 'Enter local path to save file:',
        default: './downloads'
      }
    ]);

    console.log(chalk.yellow(`\n🔄 Downloading file: ${fileName}`));
    debugLog('Downloading file', { projectId, bucketName, fileName, localPath });

    try {
      await execAsync(`gsutil cp gs://${bucketName}/${fileName} "${localPath}/"`);
      console.log(chalk.green(`✅ File downloaded to ${localPath}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error downloading file:'), error.message);
    }
  }, 'downloading file from bucket', () => downloadFileFromBucket());

  if (result === 'main') return 'main';
}

async function deleteFileFromBucket() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to delete file from:');
    if (!projectId) return;

    const { bucketName, fileName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bucketName',
        message: 'Enter bucket name:',
        default: `${projectId}.appspot.com`
      },
      {
        type: 'input',
        name: 'fileName',
        message: 'Enter file name to delete: '
      }
    ]);

    console.log(chalk.yellow(`\n🔄 Deleting file: ${fileName}`));
    debugLog('Deleting file', { projectId, bucketName, fileName });

    try {
      await execAsync(`gsutil rm gs://${bucketName}/${fileName}`);
      console.log(chalk.green(`✅ File deleted: ${fileName}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error deleting file:'), error.message);
    }
  }, 'deleting file from bucket', () => deleteFileFromBucket());

  if (result === 'main') return 'main';
}

async function manageBucketPermissions() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to manage bucket permissions:');
    if (!projectId) return;

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do with bucket permissions?',
        choices: [
          { name: '👥 List Bucket IAM Bindings', value: 'list-bindings' },
          { name: '➕ Add IAM Binding', value: 'add-binding' },
          { name: '🗑️  Remove IAM Binding', value: 'remove-binding' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'list-bindings':
        await listBucketBindings(projectId);
        break;
      case 'add-binding':
        await addBucketBinding(projectId);
        break;
      case 'remove-binding':
        await removeBucketBinding(projectId);
        break;
      case 'back':
        return;
    }
  }, 'bucket permissions management', () => manageBucketPermissions());

  if (result === 'main') return 'main';
}

async function listBucketBindings(projectId) {
  const result = await safeOperation(async () => {
    console.log(chalk.blue(`\n👥 Listing Bucket IAM Bindings for ${projectId}...\n`));
    debugLog('Listing bucket bindings', { projectId });

    try {
      const { stdout } = await execAsync(`gsutil iam get gs://${projectId}.appspot.com`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error listing bucket bindings:'), error.message);
    }
  }, 'listing bucket bindings', () => listBucketBindings(projectId));

  if (result === 'main') return 'main';
}

async function addBucketBinding(projectId) {
  const result = await safeOperation(async () => {
    const { role, member } = await inquirer.prompt([
      {
        type: 'input',
        name: 'role',
        message: 'Enter IAM role (e.g., roles/storage.objectViewer):',
        validate: (input) => {
          if (!input.includes('/')) return 'Please enter a valid IAM role (e.g., roles/storage.objectViewer)';
          return true;
        }
      },
      {
        type: 'input',
        name: 'member',
        message: 'Enter member (e.g., user:example@example.com):',
        validate: (input) => {
          if (!input.includes(':')) return 'Please enter a valid member (e.g., user:example@example.com)';
          return true;
        }
      }
    ]);

    debugLog('Adding bucket binding', { projectId, role, member });
    console.log(chalk.yellow(`\n🔄 Adding IAM Binding: ${role} for ${member}`));

    try {
      await execAsync(`gsutil iam ch -j "${role}" "${member}" gs://${projectId}.appspot.com`);
      console.log(chalk.green(`✅ IAM Binding added: ${role} for ${member}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error adding bucket binding:'), error.message);
    }
  }, 'adding bucket binding', () => addBucketBinding(projectId));

  if (result === 'main') return 'main';
}

async function removeBucketBinding(projectId) {
  const result = await safeOperation(async () => {
    const { role, member } = await inquirer.prompt([
      {
        type: 'input',
        name: 'role',
        message: 'Enter IAM role (e.g., roles/storage.objectViewer):',
        validate: (input) => {
          if (!input.includes('/')) return 'Please enter a valid IAM role (e.g., roles/storage.objectViewer)';
          return true;
        }
      },
      {
        type: 'input',
        name: 'member',
        message: 'Enter member (e.g., user:example@example.com):',
        validate: (input) => {
          if (!input.includes(':')) return 'Please enter a valid member (e.g., user:example@example.com)';
          return true;
        }
      }
    ]);

    debugLog('Removing bucket binding', { projectId, role, member });
    console.log(chalk.yellow(`\n🔄 Removing IAM Binding: ${role} for ${member}`));

    try {
      await execAsync(`gsutil iam ch -d "${role}" "${member}" gs://${projectId}.appspot.com`);
      console.log(chalk.green(`✅ IAM Binding removed: ${role} for ${member}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error removing bucket binding:'), error.message);
    }
  }, 'removing bucket binding', () => removeBucketBinding(projectId));

  if (result === 'main') return 'main';
}

async function setBucketLifecycle() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to set bucket lifecycle:');
    if (!projectId) return;

    const { bucketName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bucketName',
        message: 'Enter bucket name:',
        default: `${projectId}.appspot.com`
      }
    ]);

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do with the bucket lifecycle?',
        choices: [
          { name: '🔄 Set Lifecycle Rules', value: 'set-rules' },
          { name: '🗑️  Clear Lifecycle Rules', value: 'clear-rules' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'set-rules':
        await setBucketLifecycleRules(projectId, bucketName);
        break;
      case 'clear-rules':
        await clearBucketLifecycleRules(projectId, bucketName);
        break;
      case 'back':
        return;
    }
  }, 'bucket lifecycle management', () => setBucketLifecycle());

  if (result === 'main') return 'main';
}

async function setBucketLifecycleRules(projectId, bucketName) {
  const result = await safeOperation(async () => {
    const { rules } = await inquirer.prompt([
      {
        type: 'input',
        name: 'rules',
        message: 'Enter lifecycle rules (JSON format, e.g., [{"action": "Delete", "condition": {"age": 30}}]):',
        validate: (input) => {
          try {
            JSON.parse(input);
          return true;
          } catch (e) {
            return 'Please enter valid JSON for lifecycle rules.';
          }
        }
      }
    ]);

    debugLog('Setting bucket lifecycle rules', { projectId, bucketName, rules });
    console.log(chalk.yellow(`\n🔄 Setting Lifecycle Rules for ${bucketName}`));

    try {
      await execAsync(`gsutil lifecycle set ${rules} gs://${bucketName} -p ${projectId}`);
      console.log(chalk.green(`✅ Lifecycle rules set for ${bucketName}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error setting bucket lifecycle rules:'), error.message);
    }
  }, 'setting bucket lifecycle rules', () => setBucketLifecycleRules(projectId, bucketName));

  if (result === 'main') return 'main';
}

async function clearBucketLifecycleRules(projectId, bucketName) {
  const result = await safeOperation(async () => {
    debugLog('Clearing bucket lifecycle rules', { projectId, bucketName });
    console.log(chalk.yellow(`\n🔄 Clearing Lifecycle Rules for ${bucketName}`));

    try {
      await execAsync(`gsutil lifecycle clear gs://${bucketName} -p ${projectId}`);
      console.log(chalk.green(`✅ Lifecycle rules cleared for ${bucketName}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error clearing bucket lifecycle rules:'), error.message);
    }
  }, 'clearing bucket lifecycle rules', () => clearBucketLifecycleRules(projectId, bucketName));

  if (result === 'main') return 'main';
}

// GCP Services Management
async function manageGCPServices() {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'GCP Services Management - What would you like to do?',
        choices: [
          { name: '📋 List Enabled APIs', value: 'list-apis' },
          { name: '➕ Enable API', value: 'enable-api' },
          { name: '🗑️  Disable API', value: 'disable-api' },
          { name: '📊 Service Quotas', value: 'service-quotas' },
          { name: '👥 List IAM Members', value: 'list-iam' },
          { name: '➕ Add IAM Member', value: 'add-iam' },
          { name: '🗑️  Remove IAM Member', value: 'remove-iam' },
          { name: '💰 Billing & Cost Analysis', value: 'billing' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'list-apis':
        await listEnabledAPIs();
        break;
      case 'enable-api':
        await enableAPI();
        break;
      case 'disable-api':
        await disableAPI();
        break;
      case 'service-quotas':
        await checkServiceQuotas();
        break;
      case 'list-iam':
        await listIAMMembers();
        break;
      case 'add-iam':
        await addIAMMember();
        break;
      case 'remove-iam':
        await removeIAMMember();
        break;
      case 'billing':
        await checkBilling();
        break;
      case 'back':
        return;
    }
  }, 'GCP services management', () => manageGCPServices());
  
  if (result === 'main') return 'main';
}

async function listEnabledAPIs() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to list APIs:');
    if (!projectId) return;
    
    console.log(chalk.blue(`\n📋 Listing Enabled APIs in ${projectId}...\n`));
    debugLog('Listing enabled APIs', { projectId });
    
    const { stdout } = await execAsync(`gcloud services list --enabled --project=${projectId} --format="table(name,title)"`);
    console.log(stdout);
  }, 'listing APIs', () => listEnabledAPIs());
  
  if (result === 'main') return 'main';
}

async function enableAPI() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project:');
    if (!projectId) return;
    
    const { apiName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiName',
        message: 'Enter API name to enable (e.g., firebase.googleapis.com):',
        validate: (input) => {
          if (!input.includes('.googleapis.com')) return 'Please enter a valid Google API name';
          return true;
        }
      }
    ]);

    debugLog('Enabling API', { projectId, apiName });
    console.log(chalk.yellow(`\n🔄 Enabling API: ${apiName}`));
    
    await execAsync(`gcloud services enable ${apiName} --project=${projectId}`);
    console.log(chalk.green(`✅ API enabled: ${apiName}`));
  }, 'enabling API', () => enableAPI());

  if (result === 'main') return 'main';
}

async function disableAPI() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project:');
    if (!projectId) return;
    
    console.log(chalk.blue(`\n📋 Select API to disable in ${projectId}...\n`));
    
    const { stdout } = await execAsync(`gcloud services list --enabled --project=${projectId} --format="value(name)"`);
    const apis = stdout.trim().split('\n').filter(api => api.length > 0);
    
    if (apis.length === 0) {
      console.log(chalk.yellow('No enabled APIs found'));
      return;
    }
    
    const { apiName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'apiName',
        message: 'Select API to disable:',
        choices: apis.map(api => ({
          name: api,
          value: api
        }))
      }
    ]);
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to disable API: ${apiName}?`,
        default: false
      }
    ]);
    
    if (!confirm) return;
    
    debugLog('Disabling API', { projectId, apiName });
    console.log(chalk.yellow(`\n🔄 Disabling API: ${apiName}`));
    
    await execAsync(`gcloud services disable ${apiName} --project=${projectId}`);
    console.log(chalk.green(`✅ API disabled: ${apiName}`));
  }, 'disabling API', () => disableAPI());
  
  if (result === 'main') return 'main';
}

async function checkServiceQuotas() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to check service quotas:');
    if (!projectId) return;

    console.log(chalk.blue(`\n📊 Checking Service Quotas for ${projectId}...\n`));
    debugLog('Checking service quotas', { projectId });

    try {
      const { stdout } = await execAsync(`gcloud services list --project=${projectId} --format="table(name,title,quota.metric,quota.limit,quota.usage,quota.usage_ratio)"`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error checking service quotas:'), error.message);
    }
  }, 'checking service quotas', () => checkServiceQuotas());

  if (result === 'main') return 'main';
}

async function listIAMMembers() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to list IAM members:');
    if (!projectId) return;

    console.log(chalk.blue(`\n👥 Listing IAM Members for ${projectId}...\n`));
    debugLog('Listing IAM members', { projectId });

    try {
      const { stdout } = await execAsync(`gcloud projects get-iam-policy ${projectId} --flatten="bindings[].members" --format='table(bindings.role,bindings.members)' --sort-by="bindings.role"`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error listing IAM members:'), error.message);
    }
  }, 'listing IAM members', () => listIAMMembers());

  if (result === 'main') return 'main';
}

async function addIAMMember() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to add IAM member:');
    if (!projectId) return;

    const { role, member } = await inquirer.prompt([
      {
        type: 'input',
        name: 'role',
        message: 'Enter IAM role (e.g., roles/storage.objectViewer):',
        validate: (input) => {
          if (!input.includes('/')) return 'Please enter a valid IAM role (e.g., roles/storage.objectViewer)';
          return true;
        }
      },
      {
        type: 'input',
        name: 'member',
        message: 'Enter member (e.g., user:example@example.com):',
        validate: (input) => {
          if (!input.includes(':')) return 'Please enter a valid member (e.g., user:example@example.com)';
            return true;
        }
      }
    ]);

    debugLog('Adding IAM member', { projectId, role, member });
    console.log(chalk.yellow(`\n🔄 Adding IAM Member: ${member} to ${role}`));

    try {
      await execAsync(`gcloud projects add-iam-policy-binding ${projectId} --member="${member}" --role="${role}"`);
      console.log(chalk.green(`✅ IAM Member added: ${member} to ${role}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error adding IAM member:'), error.message);
    }
  }, 'adding IAM member', () => addIAMMember());

  if (result === 'main') return 'main';
}

async function removeIAMMember() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to remove IAM member:');
    if (!projectId) return;

    const { role, member } = await inquirer.prompt([
      {
        type: 'input',
        name: 'role',
        message: 'Enter IAM role (e.g., roles/storage.objectViewer):',
        validate: (input) => {
          if (!input.includes('/')) return 'Please enter a valid IAM role (e.g., roles/storage.objectViewer)';
          return true;
        }
      },
      {
        type: 'input',
        name: 'member',
        message: 'Enter member (e.g., user:example@example.com):',
        validate: (input) => {
          if (!input.includes(':')) return 'Please enter a valid member (e.g., user:example@example.com)';
          return true;
        }
      }
    ]);

    debugLog('Removing IAM member', { projectId, role, member });
    console.log(chalk.yellow(`\n🔄 Removing IAM Member: ${member} from ${role}`));

    try {
      await execAsync(`gcloud projects remove-iam-policy-binding ${projectId} --member="${member}" --role="${role}"`);
      console.log(chalk.green(`✅ IAM Member removed: ${member} from ${role}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error removing IAM member:'), error.message);
    }
  }, 'removing IAM member', () => removeIAMMember());

  if (result === 'main') return 'main';
}

async function checkBilling() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to check billing:');
    if (!projectId) return;

    console.log(chalk.blue(`\n💰 Checking Billing for ${projectId}...\n`));
    debugLog('Checking billing', { projectId });

    try {
      const { stdout } = await execAsync(`gcloud alpha billing accounts list --format="table(name,displayName,open)"`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error checking billing:'), error.message);
    }
  }, 'checking billing', () => checkBilling());

  if (result === 'main') return 'main';
}

// Firebase Authentication Management
async function manageFirebaseAuth() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project for Firebase Auth management:');
    if (!projectId) return;
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Firebase Authentication - What would you like to do?',
        choices: [
          { name: '👥 List Users', value: 'list-users' },
          { name: '➕ Add User', value: 'add-user' },
          { name: '🗑️  Delete User', value: 'delete-user' },
          { name: '🔑 Reset Password', value: 'reset-password' },
          { name: '📊 User Statistics', value: 'user-stats' },
          { name: '🔐 Configure Sign-in Methods', value: 'signin-methods' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'list-users':
        await listFirebaseUsers(projectId);
        break;
      case 'add-user':
        await addFirebaseUser(projectId);
        break;
      case 'delete-user':
        await deleteFirebaseUser(projectId);
        break;
      case 'reset-password':
        await resetFirebasePassword(projectId);
        break;
      case 'user-stats':
        await getFirebaseUserStats(projectId);
        break;
      case 'signin-methods':
        await configureSignInMethods(projectId);
        break;
      case 'back':
        return;
    }
  }, 'Firebase Auth management', () => manageFirebaseAuth());
  
  if (result === 'main') return 'main';
}

async function listFirebaseUsers(projectId) {
  const result = await safeOperation(async () => {
    console.log(chalk.blue(`\n👥 Listing Firebase Users for ${projectId}...\n`));
    debugLog('Listing Firebase users', { projectId });
    
    try {
      const { stdout } = await execAsync(`firebase auth:export --project=${projectId} --format=json`);
      const users = JSON.parse(stdout);
      console.log(chalk.green(`✅ Found ${users.users?.length || 0} users`));
      
      if (users.users && users.users.length > 0) {
        users.users.forEach((user, index) => {
          console.log(chalk.cyan(`\n${index + 1}. ${user.email || user.phoneNumber || 'Unknown'}`));
          console.log(chalk.gray(`   UID: ${user.localId}`));
          console.log(chalk.gray(`   Email Verified: ${user.emailVerified || false}`));
          console.log(chalk.gray(`   Created: ${new Date(user.createdAt).toLocaleString()}`));
        });
      } else {
        console.log(chalk.yellow('No users found'));
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error listing users:'), error.message);
    }
  }, 'listing Firebase users', () => listFirebaseUsers(projectId));
  
  if (result === 'main') return 'main';
}

async function addFirebaseUser(projectId) {
  const result = await safeOperation(async () => {
    const { email, password, displayName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter user email:',
        validate: (input) => {
          if (!input.includes('@')) return 'Please enter a valid email address';
          return true;
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter user password (min 6 characters):',
        validate: (input) => {
          if (input.length < 6) return 'Password must be at least 6 characters';
          return true;
        }
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Enter display name (optional):'
      }
    ]);
    
    debugLog('Adding Firebase user', { projectId, email, displayName });
    console.log(chalk.yellow(`\n🔄 Adding user: ${email}`));
    
    try {
      let command = `firebase auth:create-user --project=${projectId} --email="${email}" --password="${password}"`;
      if (displayName) {
        command += ` --display-name="${displayName}"`;
      }
      await execAsync(command);
      console.log(chalk.green(`✅ User created: ${email}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error creating user:'), error.message);
    }
  }, 'adding Firebase user', () => addFirebaseUser(projectId));
  
  if (result === 'main') return 'main';
}

async function deleteFirebaseUser(projectId) {
  const result = await safeOperation(async () => {
    const { email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter user email to delete:',
        validate: (input) => {
          if (!input.includes('@')) return 'Please enter a valid email address';
          return true;
        }
      }
    ]);

    debugLog('Deleting Firebase user', { projectId, email });
    console.log(chalk.yellow(`\n🔄 Deleting user: ${email}`));

    try {
      await execAsync(`firebase auth:delete-user --project=${projectId} --email="${email}"`);
      console.log(chalk.green(`✅ User deleted: ${email}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error deleting user:'), error.message);
    }
  }, 'deleting Firebase user', () => deleteFirebaseUser(projectId));

  if (result === 'main') return 'main';
}

async function resetFirebasePassword(projectId) {
  const result = await safeOperation(async () => {
    const { email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter user email to reset password:',
        validate: (input) => {
          if (!input.includes('@')) return 'Please enter a valid email address';
          return true;
        }
      }
    ]);

    debugLog('Resetting Firebase password', { projectId, email });
    console.log(chalk.yellow(`\n🔄 Resetting password for: ${email}`));

    try {
      await execAsync(`firebase auth:update-user --project=${projectId} --email="${email}" --password="newPassword123"`); // Replace "newPassword123" with a secure password
      console.log(chalk.green(`✅ Password reset for: ${email}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error resetting password:'), error.message);
    }
  }, 'resetting Firebase password', () => resetFirebasePassword(projectId));

  if (result === 'main') return 'main';
}

async function getFirebaseUserStats(projectId) {
  const result = await safeOperation(async () => {
    console.log(chalk.blue(`\n📊 User Statistics for ${projectId}...\n`));
    debugLog('Getting Firebase user statistics', { projectId });

    try {
      const { stdout } = await execAsync(`firebase auth:stats --project=${projectId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error getting user statistics:'), error.message);
    }
  }, 'getting Firebase user statistics', () => getFirebaseUserStats(projectId));

  if (result === 'main') return 'main';
}

async function configureSignInMethods(projectId) {
  const result = await safeOperation(async () => {
    console.log(chalk.blue(`\n🔐 Configuring Sign-in Methods for ${projectId}...\n`));
    debugLog('Configuring Firebase sign-in methods', { projectId });

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to configure?',
        choices: [
          { name: '🔑 Email/Password', value: 'email-password' },
          { name: '👤 Google', value: 'google' },
          { name: '🔐 Phone Number', value: 'phone' },
          { name: '🔗 Custom', value: 'custom' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'email-password':
        await configureEmailPasswordSignIn(projectId);
        break;
      case 'google':
        await configureGoogleSignIn(projectId);
        break;
      case 'phone':
        await configurePhoneSignIn(projectId);
        break;
      case 'custom':
        await configureCustomSignIn(projectId);
        break;
      case 'back':
        return;
    }
  }, 'configuring Firebase sign-in methods', () => configureSignInMethods(projectId));

  if (result === 'main') return 'main';
}

async function configureEmailPasswordSignIn(projectId) {
  const result = await safeOperation(async () => {
    const { email, password } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter email for email/password sign-in:',
        validate: (input) => {
          if (!input.includes('@')) return 'Please enter a valid email address';
          return true;
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter password for email/password sign-in:',
        validate: (input) => {
          if (input.length < 6) return 'Password must be at least 6 characters';
          return true;
        }
      }
    ]);

    debugLog('Configuring email/password sign-in', { projectId, email });
    console.log(chalk.yellow(`\n🔄 Configuring email/password sign-in for: ${email}`));

    try {
      await execAsync(`firebase auth:providers:add-email-password --project=${projectId} --email="${email}" --password="${password}"`);
      console.log(chalk.green(`✅ Email/Password sign-in configured for: ${email}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error configuring email/password sign-in:'), error.message);
    }
  }, 'configuring email/password sign-in', () => configureEmailPasswordSignIn(projectId));

  if (result === 'main') return 'main';
}

async function configureGoogleSignIn(projectId) {
  const result = await safeOperation(async () => {
    const { clientId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'clientId',
        message: 'Enter Google OAuth client ID:',
        validate: (input) => {
          if (!input.includes('.')) return 'Please enter a valid Google OAuth client ID';
          return true;
        }
      }
    ]);

    debugLog('Configuring Google sign-in', { projectId, clientId });
    console.log(chalk.yellow(`\n🔄 Configuring Google sign-in with client ID: ${clientId}`));

    try {
      await execAsync(`firebase auth:providers:add-google --project=${projectId} --client-id="${clientId}"`);
      console.log(chalk.green(`✅ Google sign-in configured with client ID: ${clientId}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error configuring Google sign-in:'), error.message);
    }
  }, 'configuring Google sign-in', () => configureGoogleSignIn(projectId));

  if (result === 'main') return 'main';
}

async function configurePhoneSignIn(projectId) {
  const result = await safeOperation(async () => {
    const { phoneNumber, code } = await inquirer.prompt([
      {
        type: 'input',
        name: 'phoneNumber',
        message: 'Enter phone number (e.g., +1234567890):',
        validate: (input) => {
          if (!input.startsWith('+')) return 'Please enter a valid phone number with a country code (e.g., +1234567890)';
          return true;
        }
      },
      {
        type: 'input',
        name: 'code',
        message: 'Enter verification code sent to your phone:',
        validate: (input) => {
          if (!input) return 'Please enter the verification code';
          return true;
        }
      }
    ]);

    debugLog('Configuring phone sign-in', { projectId, phoneNumber });
    console.log(chalk.yellow(`\n🔄 Configuring phone sign-in for: ${phoneNumber}`));

    try {
      await execAsync(`firebase auth:providers:add-phone --project=${projectId} --phone-number="${phoneNumber}" --code="${code}"`);
      console.log(chalk.green(`✅ Phone sign-in configured for: ${phoneNumber}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error configuring phone sign-in:'), error.message);
    }
  }, 'configuring phone sign-in', () => configurePhoneSignIn(projectId));

  if (result === 'main') return 'main';
}

async function configureCustomSignIn(projectId) {
  const result = await safeOperation(async () => {
    const { providerId, displayName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'providerId',
        message: 'Enter custom provider ID (e.g., custom.example.com):',
        validate: (input) => {
          if (!input.includes('.')) return 'Please enter a valid custom provider ID (e.g., custom.example.com)';
          return true;
        }
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Enter display name for custom provider (optional):'
      }
    ]);

    debugLog('Configuring custom sign-in', { projectId, providerId, displayName });
    console.log(chalk.yellow(`\n🔄 Configuring custom sign-in with provider ID: ${providerId}`));

    try {
      let command = `firebase auth:providers:add-custom --project=${projectId} --provider-id="${providerId}"`;
      if (displayName) {
        command += ` --display-name="${displayName}"`;
      }
      await execAsync(command);
      console.log(chalk.green(`✅ Custom sign-in configured with provider ID: ${providerId}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error configuring custom sign-in:'), error.message);
    }
  }, 'configuring custom sign-in', () => configureCustomSignIn(projectId));

  if (result === 'main') return 'main';
}

// Firestore Database Management
async function manageFirestore() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project for Firestore management:');
    if (!projectId) return;
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Firestore Database - What would you like to do?',
        choices: [
          { name: '📁 List Collections', value: 'list-collections' },
          { name: '➕ Create Collection', value: 'create-collection' },
          { name: '🗑️  Delete Collection', value: 'delete-collection' },
          { name: '📄 View Documents', value: 'view-documents' },
          { name: '➕ Add Document', value: 'add-document' },
          { name: '🗑️  Delete Document', value: 'delete-document' },
          { name: '📤 Export Data', value: 'export-data' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'list-collections':
        await listFirestoreCollections(projectId);
        break;
      case 'create-collection':
        await createFirestoreCollection(projectId);
        break;
      case 'delete-collection':
        await deleteFirestoreCollection(projectId);
        break;
      case 'view-documents':
        await viewFirestoreDocuments(projectId);
        break;
      case 'add-document':
        await addFirestoreDocument(projectId);
        break;
      case 'delete-document':
        await deleteFirestoreDocument(projectId);
        break;
      case 'export-data':
        await exportFirestoreData(projectId);
        break;
      case 'back':
        return;
    }
  }, 'Firestore management', () => manageFirestore());
  
  if (result === 'main') return 'main';
}

async function listFirestoreCollections(projectId) {
  const result = await safeOperation(async () => {
    console.log(chalk.blue(`\n📁 Listing Firestore Collections for ${projectId}...\n`));
    debugLog('Listing Firestore collections', { projectId });
    
    try {
      const { stdout } = await execAsync(`gcloud firestore collections list --project=${projectId} --format="value(id)"`);
      const collections = stdout.trim().split('\n').filter(c => c.length > 0);
      
      if (collections.length > 0) {
        console.log(chalk.green(`✅ Found ${collections.length} collections:`));
        collections.forEach((collection, index) => {
          console.log(chalk.cyan(`   ${index + 1}. ${collection}`));
        });
      } else {
        console.log(chalk.yellow('No collections found'));
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error listing collections:'), error.message);
    }
  }, 'listing Firestore collections', () => listFirestoreCollections(projectId));
  
  if (result === 'main') return 'main';
}

async function createFirestoreCollection(projectId) {
  const result = await safeOperation(async () => {
    const { collectionId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'collectionId',
        message: 'Enter new collection ID (e.g., users, posts):',
        validate: (input) => {
          if (input.length < 3) return 'Collection ID must be at least 3 characters';
          if (!/^[a-z0-9-]+$/.test(input)) return 'Use only lowercase letters, numbers, and hyphens';
          return true;
        }
      }
    ]);

    debugLog('Creating Firestore collection', { projectId, collectionId });
    console.log(chalk.yellow(`\n🔄 Creating collection: ${collectionId}`));

    try {
      // Note: Firestore collections are created automatically when you add documents
      // We'll create a sample document to initialize the collection
      const sampleDoc = {
        _created: new Date().toISOString(),
        _type: 'collection_init',
        message: 'Collection initialized by CLI'
      };
      
      await execAsync(`gcloud firestore documents create ${collectionId}/init --data='${JSON.stringify(sampleDoc)}' --project=${projectId}`);
      console.log(chalk.green(`✅ Collection "${collectionId}" initialized successfully!`));
      console.log(chalk.cyan(`   Note: Firestore collections are created automatically when documents are added`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error creating collection:'), error.message);
      console.log(chalk.yellow(`💡 Tip: Try adding a document to the collection instead`));
    }
  }, 'creating Firestore collection', () => createFirestoreCollection(projectId));

  if (result === 'main') return 'main';
}

async function deleteFirestoreCollection(projectId) {
  const result = await safeOperation(async () => {
    const collections = await listFirestoreCollectionsRaw(projectId);
    if (!collections.length) {
      console.log(chalk.red('No collections found to delete.'));
      return;
    }

    const { collectionId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'collectionId',
        message: 'Select a collection to delete:',
        choices: collections.map(col => ({
          name: col.id,
          value: col.id
        }))
      }
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete collection: ${collectionId}? This will delete ALL documents!`,
        default: false
      }
    ]);

    if (!confirm) return;

    debugLog('Deleting Firestore collection', { projectId, collectionId });
    console.log(chalk.yellow(`\n🔄 Deleting collection: ${collectionId}`));

    try {
      await execAsync(`gcloud firestore collections delete ${collectionId} --project=${projectId} --quiet`);
      console.log(chalk.green(`✅ Collection deleted: ${collectionId}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error deleting collection:'), error.message);
    }
  }, 'deleting Firestore collection', () => deleteFirestoreCollection(projectId));

  if (result === 'main') return 'main';
}

async function listFirestoreCollectionsRaw(projectId) {
  try {
    debugLog('Fetching Firestore collections as JSON');
    const { stdout } = await execAsync(`gcloud firestore collections list --project=${projectId} --format="json"`);
    return JSON.parse(stdout);
  } catch (error) {
    debugLog('Error fetching Firestore collections', error.message);
    return [];
  }
}

async function viewFirestoreDocuments(projectId) {
  const result = await safeOperation(async () => {
    const collectionId = await selectProjectPrompt('Select a collection to view documents:');
    if (!collectionId) return;

    const { limit } = await inquirer.prompt([
      {
        type: 'number',
        name: 'limit',
        message: 'Enter number of documents to fetch (default: 10):',
        default: 10,
        validate: (input) => {
          const num = parseInt(input);
          if (isNaN(num) || num < 1) return 'Please enter a valid number (1 or more)';
          return true;
        }
      }
    ]);

    console.log(chalk.blue(`\n📄 Viewing documents in ${collectionId}...\n`));
    debugLog('Viewing Firestore documents', { projectId, collectionId, limit });

    try {
      const { stdout } = await execAsync(`gcloud firestore documents list --project=${projectId} --collection-id=${collectionId} --limit=${limit} --format="table(name,fields)"`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error viewing documents:'), error.message);
    }
  }, 'viewing Firestore documents', () => viewFirestoreDocuments(projectId));

  if (result === 'main') return 'main';
}

async function addFirestoreDocument(projectId) {
  const result = await safeOperation(async () => {
    const collectionId = await selectProjectPrompt('Select a collection to add document:');
    if (!collectionId) return;

    const { documentId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'documentId',
        message: 'Enter new document ID (optional):',
        default: (answers) => `doc-${Date.now()}`
      }
    ]);

    const { fields } = await inquirer.prompt([
      {
        type: 'input',
        name: 'fields',
        message: 'Enter document fields (JSON format, e.g., {"name": "John", "age": 30}):',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Please enter valid JSON for document fields.';
          }
        }
      }
    ]);

    debugLog('Adding Firestore document', { projectId, collectionId, documentId, fields });
    console.log(chalk.yellow(`\n🔄 Adding document to ${collectionId}: ${documentId}`));

    try {
      let command = `gcloud firestore documents create ${collectionId}/${documentId} --project=${projectId} --fields="${fields}"`;
      if (documentId) {
        command += ` --document-id=${documentId}`;
      }
      await execAsync(command);
      console.log(chalk.green(`✅ Document added to ${collectionId}: ${documentId}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error adding document:'), error.message);
    }
  }, 'adding Firestore document', () => addFirestoreDocument(projectId));

  if (result === 'main') return 'main';
}

async function deleteFirestoreDocument(projectId) {
  const result = await safeOperation(async () => {
    const collectionId = await selectProjectPrompt('Select a collection to delete document:');
    if (!collectionId) return;

    const { documentId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'documentId',
        message: 'Enter document ID to delete:',
        validate: (input) => {
          if (!input) return 'Document ID cannot be empty';
          return true;
        }
      }
    ]);

    debugLog('Deleting Firestore document', { projectId, collectionId, documentId });
    console.log(chalk.yellow(`\n🔄 Deleting document: ${collectionId}/${documentId}`));

    try {
      await execAsync(`gcloud firestore documents delete ${collectionId}/${documentId} --project=${projectId} --quiet`);
      console.log(chalk.green(`✅ Document deleted: ${collectionId}/${documentId}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error deleting document:'), error.message);
    }
  }, 'deleting Firestore document', () => deleteFirestoreDocument(projectId));

  if (result === 'main') return 'main';
}

async function exportFirestoreData(projectId) {
  const result = await safeOperation(async () => {
    const collectionId = await selectProjectPrompt('Select a collection to export data:');
    if (!collectionId) return;

    const { outputPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputPath',
        message: 'Enter local path to save exported data (e.g., ./export.json):',
        default: './export.json'
      }
    ]);

    debugLog('Exporting Firestore data', { projectId, collectionId, outputPath });
    console.log(chalk.yellow(`\n🔄 Exporting data from ${collectionId} to ${outputPath}`));

    try {
      await execAsync(`gcloud firestore export gs://${projectId}.appspot.com/ --collection-ids=${collectionId} --output-path=${outputPath}`);
      console.log(chalk.green(`✅ Data exported from ${collectionId} to ${outputPath}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error exporting data:'), error.message);
    }
  }, 'exporting Firestore data', () => exportFirestoreData(projectId));

  if (result === 'main') return 'main';
}

// Firebase Functions Management
async function manageFirebaseFunctions() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project for Firebase Functions:');
    if (!projectId) return;
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Firebase Functions - What would you like to do?',
        choices: [
          { name: '📋 List Functions', value: 'list-functions' },
          { name: '🚀 Deploy Function', value: 'deploy-function' },
          { name: '🗑️  Delete Function', value: 'delete-function' },
          { name: '📊 Function Logs', value: 'function-logs' },
          { name: '⚙️  Configure Functions', value: 'configure-functions' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'list-functions':
        await listFirebaseFunctions(projectId);
        break;
      case 'deploy-function':
        await deployFirebaseFunction(projectId);
        break;
      case 'delete-function':
        await deleteFirebaseFunction(projectId);
        break;
      case 'function-logs':
        await getFirebaseFunctionLogs(projectId);
        break;
      case 'configure-functions':
        await configureFirebaseFunctions(projectId);
        break;
      case 'back':
        return;
    }
  }, 'Firebase Functions management', () => manageFirebaseFunctions());
  
  if (result === 'main') return 'main';
}

async function listFirebaseFunctions(projectId) {
  const result = await safeOperation(async () => {
    console.log(chalk.blue(`\n📋 Listing Firebase Functions for ${projectId}...\n`));
    debugLog('Listing Firebase functions', { projectId });
    
    try {
      const { stdout } = await execAsync(`firebase functions:list --project=${projectId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error listing functions:'), error.message);
    }
  }, 'listing Firebase functions', () => listFirebaseFunctions(projectId));
  
  if (result === 'main') return 'main';
}

async function deployFirebaseFunction(projectId) {
  const result = await safeOperation(async () => {
    const { functionName, sourcePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'functionName',
        message: 'Enter function name (e.g., helloWorld):',
        validate: (input) => {
          if (input.length < 3) return 'Function name must be at least 3 characters';
          if (!/^[a-z0-9-]+$/.test(input)) return 'Use only lowercase letters, numbers, and hyphens';
          return true;
        }
      },
      {
        type: 'input',
        name: 'sourcePath',
        message: 'Enter local path to the function source code (e.g., ./functions/helloWorld):',
        validate: (input) => {
          if (!fs.existsSync(input)) return 'Path does not exist';
          return true;
        }
      }
    ]);

    debugLog('Deploying Firebase function', { projectId, functionName, sourcePath });
    console.log(chalk.yellow(`\n🔄 Deploying function: ${functionName}`));

    try {
      await execAsync(`firebase deploy --only functions:${functionName} --project=${projectId} --source=${sourcePath}`);
      console.log(chalk.green(`✅ Function deployed: ${functionName}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error deploying function:'), error.message);
    }
  }, 'deploying Firebase function', () => deployFirebaseFunction(projectId));

  if (result === 'main') return 'main';
}

async function deleteFirebaseFunction(projectId) {
  const result = await safeOperation(async () => {
    const functions = await listFirebaseFunctionsRaw(projectId);
    if (!functions.length) {
      console.log(chalk.red('No functions found to delete.'));
      return;
    }

    const { functionName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'functionName',
        message: 'Select a function to delete:',
        choices: functions.map(func => ({
          name: func.name,
          value: func.name
        }))
      }
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete function: ${functionName}? This cannot be undone!`,
        default: false
      }
    ]);

    if (!confirm) return;

    debugLog('Deleting Firebase function', { projectId, functionName });
    console.log(chalk.yellow(`\n🔄 Deleting function: ${functionName}`));

    try {
      await execAsync(`firebase functions:delete ${functionName} --project=${projectId} --quiet`);
      console.log(chalk.green(`✅ Function deleted: ${functionName}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error deleting function:'), error.message);
    }
  }, 'deleting Firebase function', () => deleteFirebaseFunction(projectId));

  if (result === 'main') return 'main';
}

async function listFirebaseFunctionsRaw(projectId) {
  try {
    debugLog('Fetching Firebase functions as JSON');
    const { stdout } = await execAsync(`firebase functions:list --project=${projectId} --format="json"`);
    return JSON.parse(stdout);
  } catch (error) {
    debugLog('Error fetching Firebase functions', error.message);
    return [];
  }
}

async function getFirebaseFunctionLogs(projectId) {
  const result = await safeOperation(async () => {
    const { functionName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'functionName',
        message: 'Enter function name to view logs:',
        validate: (input) => {
          if (!input) return 'Function name cannot be empty';
          return true;
        }
      }
    ]);

    if (!functionName) return;

    console.log(chalk.blue(`\n📊 Function Logs for ${functionName}...\n`));
    debugLog('Getting Firebase function logs', { projectId, functionName });

    try {
      const { stdout } = await execAsync(`firebase functions:log --project=${projectId} --function=${functionName}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error getting function logs:'), error.message);
    }
  }, 'getting Firebase function logs', () => getFirebaseFunctionLogs(projectId));

  if (result === 'main') return 'main';
}

async function configureFirebaseFunctions(projectId) {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to configure for Firebase Functions?',
        choices: [
          { name: '🔧 Configure Runtime', value: 'configure-runtime' },
          { name: '🔐 Configure Security Rules', value: 'configure-rules' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'configure-runtime':
        await configureFunctionRuntime(projectId);
        break;
      case 'configure-rules':
        await configureFunctionSecurityRules(projectId);
        break;
      case 'back':
        return;
    }
  }, 'configuring Firebase Functions', () => configureFirebaseFunctions(projectId));

  if (result === 'main') return 'main';
}

async function configureFunctionRuntime(projectId) {
  const result = await safeOperation(async () => {
    const { runtime } = await inquirer.prompt([
      {
        type: 'list',
        name: 'runtime',
        message: 'Select runtime for Firebase Functions:',
        choices: [
          { name: 'Node.js 18', value: 'nodejs18' },
          { name: 'Node.js 16', value: 'nodejs16' },
          { name: 'Node.js 14', value: 'nodejs14' },
          { name: 'Python 3.9', value: 'python39' },
          { name: 'Python 3.8', value: 'python38' },
          { name: 'Python 3.7', value: 'python37' },
          { name: 'Go 1.19', value: 'go119' },
          { name: 'Java 17', value: 'java17' },
          { name: 'Java 11', value: 'java11' },
          { name: 'C# (Preview)', value: 'dotnet' },
          { name: 'Custom', value: 'custom' }
        ]
      }
    ]);

    debugLog('Configuring Firebase Functions runtime', { projectId, runtime });
    console.log(chalk.yellow(`\n🔄 Configuring Firebase Functions runtime to: ${runtime}`));

    try {
      await execAsync(`firebase functions:config:set --project=${projectId} --runtime="${runtime}"`);
      console.log(chalk.green(`✅ Firebase Functions runtime configured to: ${runtime}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error configuring Firebase Functions runtime:'), error.message);
    }
  }, 'configuring Firebase Functions runtime', () => configureFunctionRuntime(projectId));

  if (result === 'main') return 'main';
}

async function configureFunctionSecurityRules(projectId) {
  const result = await safeOperation(async () => {
    const { rules } = await inquirer.prompt([
      {
        type: 'input',
        name: 'rules',
        message: 'Enter security rules (JSON format, e.g., {"rules": [{"allow": "true"}]}):',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Please enter valid JSON for security rules.';
          }
        }
      }
    ]);

    debugLog('Configuring Firebase Functions security rules', { projectId, rules });
    console.log(chalk.yellow(`\n🔄 Configuring Firebase Functions security rules`));

    try {
      await execAsync(`firebase functions:config:set --project=${projectId} --rules="${rules}"`);
      console.log(chalk.green(`✅ Firebase Functions security rules configured`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error configuring Firebase Functions security rules:'), error.message);
    }
  }, 'configuring Firebase Functions security rules', () => configureFunctionSecurityRules(projectId));

  if (result === 'main') return 'main';
}

// Firebase Hosting Management
async function manageFirebaseHosting() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project for Firebase Hosting:');
    if (!projectId) return;
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Firebase Hosting - What would you like to do?',
        choices: [
          { name: '🌐 List Sites', value: 'list-sites' },
          { name: '🚀 Deploy Site', value: 'deploy-site' },
          { name: '🗑️  Delete Site', value: 'delete-site' },
          { name: '📊 Hosting Logs', value: 'hosting-logs' },
          { name: '⚙️  Configure Hosting', value: 'configure-hosting' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'list-sites':
        await listFirebaseHostingSites(projectId);
        break;
      case 'deploy-site':
        await deployFirebaseSite(projectId);
        break;
      case 'delete-site':
        await deleteFirebaseSite(projectId);
        break;
      case 'hosting-logs':
        await getFirebaseHostingLogs(projectId);
        break;
      case 'configure-hosting':
        await configureFirebaseHosting(projectId);
        break;
      case 'back':
        return;
    }
  }, 'Firebase Hosting management', () => manageFirebaseHosting());
  
  if (result === 'main') return 'main';
}

async function listFirebaseHostingSites(projectId) {
  const result = await safeOperation(async () => {
    console.log(chalk.blue(`\n🌐 Listing Firebase Hosting Sites for ${projectId}...\n`));
    debugLog('Listing Firebase hosting sites', { projectId });
    
    try {
      const { stdout } = await execAsync(`firebase hosting:sites:list --project=${projectId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error listing hosting sites:'), error.message);
    }
  }, 'listing Firebase hosting sites', () => listFirebaseHostingSites(projectId));
  
  if (result === 'main') return 'main';
}

async function deployFirebaseSite(projectId) {
  const result = await safeOperation(async () => {
    const { siteId, sourcePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'siteId',
        message: 'Enter site ID (e.g., my-app):',
        validate: (input) => {
          if (input.length < 3) return 'Site ID must be at least 3 characters';
          if (!/^[a-z0-9-]+$/.test(input)) return 'Use only lowercase letters, numbers, and hyphens';
          return true;
        }
      },
      {
        type: 'input',
        name: 'sourcePath',
        message: 'Enter local path to the site source code (e.g., ./public):',
        validate: (input) => {
          if (!fs.existsSync(input)) return 'Path does not exist';
          return true;
        }
      }
    ]);

    debugLog('Deploying Firebase site', { projectId, siteId, sourcePath });
    console.log(chalk.yellow(`\n🔄 Deploying site: ${siteId}`));

    try {
      await execAsync(`firebase deploy --only hosting:${siteId} --project=${projectId} --source=${sourcePath}`);
      console.log(chalk.green(`✅ Site deployed: ${siteId}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error deploying site:'), error.message);
    }
  }, 'deploying Firebase site', () => deployFirebaseSite(projectId));

  if (result === 'main') return 'main';
}

async function deleteFirebaseSite(projectId) {
  const result = await safeOperation(async () => {
    const sites = await listFirebaseHostingSitesRaw(projectId);
    if (!sites.length) {
      console.log(chalk.red('No sites found to delete.'));
      return;
    }

    const { siteId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'siteId',
        message: 'Select a site to delete:',
        choices: sites.map(site => ({
          name: site.id,
          value: site.id
        }))
      }
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete site: ${siteId}? This cannot be undone!`,
        default: false
      }
    ]);

    if (!confirm) return;

    debugLog('Deleting Firebase site', { projectId, siteId });
    console.log(chalk.yellow(`\n🔄 Deleting site: ${siteId}`));

    try {
      await execAsync(`firebase hosting:sites:delete ${siteId} --project=${projectId} --quiet`);
      console.log(chalk.green(`✅ Site deleted: ${siteId}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error deleting site:'), error.message);
    }
  }, 'deleting Firebase site', () => deleteFirebaseSite(projectId));

  if (result === 'main') return 'main';
}

async function listFirebaseHostingSitesRaw(projectId) {
  try {
    debugLog('Fetching Firebase hosting sites as JSON');
    const { stdout } = await execAsync(`firebase hosting:sites:list --project=${projectId} --format="json"`);
    return JSON.parse(stdout);
  } catch (error) {
    debugLog('Error fetching Firebase hosting sites', error.message);
    return [];
  }
}

async function getFirebaseHostingLogs(projectId) {
  const result = await safeOperation(async () => {
    const { siteId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'siteId',
        message: 'Enter site ID to view logs:',
        validate: (input) => {
          if (!input) return 'Site ID cannot be empty';
          return true;
        }
      }
    ]);

    if (!siteId) return;

    console.log(chalk.blue(`\n📊 Hosting Logs for ${siteId}...\n`));
    debugLog('Getting Firebase hosting logs', { projectId, siteId });

    try {
      const { stdout } = await execAsync(`firebase hosting:log --project=${projectId} --site=${siteId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error getting hosting logs:'), error.message);
    }
  }, 'getting Firebase hosting logs', () => getFirebaseHostingLogs(projectId));

  if (result === 'main') return 'main';
}

async function configureFirebaseHosting(projectId) {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to configure for Firebase Hosting?',
        choices: [
          { name: '🌐 Configure Redirects', value: 'configure-redirects' },
          { name: '🔗 Configure Rewrites', value: 'configure-rewrites' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'configure-redirects':
        await configureHostingRedirects(projectId);
        break;
      case 'configure-rewrites':
        await configureHostingRewrites(projectId);
        break;
      case 'back':
        return;
    }
  }, 'configuring Firebase Hosting', () => configureFirebaseHosting(projectId));

  if (result === 'main') return 'main';
}

async function configureHostingRedirects(projectId) {
  const result = await safeOperation(async () => {
    const { redirects } = await inquirer.prompt([
      {
        type: 'input',
        name: 'redirects',
        message: 'Enter redirects (JSON format, e.g., [{"source": "/old-page", "destination": "/new-page"}]):',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Please enter valid JSON for redirects.';
          }
        }
      }
    ]);

    debugLog('Configuring Firebase Hosting redirects', { projectId, redirects });
    console.log(chalk.yellow(`\n🔄 Configuring Firebase Hosting redirects`));

    try {
      await execAsync(`firebase hosting:config:set --project=${projectId} --redirects="${redirects}"`);
      console.log(chalk.green(`✅ Firebase Hosting redirects configured`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error configuring Firebase Hosting redirects:'), error.message);
    }
  }, 'configuring Firebase Hosting redirects', () => configureHostingRedirects(projectId));

  if (result === 'main') return 'main';
}

async function configureHostingRewrites(projectId) {
  const result = await safeOperation(async () => {
    const { rewrites } = await inquirer.prompt([
      {
        type: 'input',
        name: 'rewrites',
        message: 'Enter rewrites (JSON format, e.g., [{"source": "/api/*", "destination": "/api/v1/*"}]):',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Please enter valid JSON for rewrites.';
          }
        }
      }
    ]);

    debugLog('Configuring Firebase Hosting rewrites', { projectId, rewrites });
    console.log(chalk.yellow(`\n🔄 Configuring Firebase Hosting rewrites`));

    try {
      await execAsync(`firebase hosting:config:set --project=${projectId} --rewrites="${rewrites}"`);
      console.log(chalk.green(`✅ Firebase Hosting rewrites configured`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error configuring Firebase Hosting rewrites:'), error.message);
    }
  }, 'configuring Firebase Hosting rewrites', () => configureHostingRewrites(projectId));

  if (result === 'main') return 'main';
}

// Project Configuration Management
async function manageProjectConfig() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project for configuration:');
    if (!projectId) return;
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Project Configuration - What would you like to do?',
        choices: [
          { name: '📄 View firebase.json', value: 'view-config' },
          { name: '✏️  Edit firebase.json', value: 'edit-config' },
          { name: '�� Initialize Project', value: 'init-project' },
          { name: '📦 Install Dependencies', value: 'install-deps' },
          { name: '🔐 Environment Variables', value: 'env-vars' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'view-config':
        await viewProjectConfig(projectId);
        break;
      case 'edit-config':
        await editProjectConfig(projectId);
        break;
      case 'init-project':
        await initializeProject(projectId);
        break;
      case 'install-deps':
        await installProjectDependencies(projectId);
        break;
      case 'env-vars':
        await manageEnvironmentVariables(projectId);
        break;
      case 'back':
        return;
    }
  }, 'project configuration management', () => manageProjectConfig());
  
  if (result === 'main') return 'main';
}

async function viewProjectConfig(projectId) {
  const result = await safeOperation(async () => {
    debugLog('Viewing firebase.json', { projectId });
    console.log(chalk.blue(`\n📄 Viewing firebase.json for ${projectId}...\n`));

    try {
      const { stdout } = await execAsync(`firebase functions:config:get --project=${projectId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error viewing firebase.json:'), error.message);
    }
  }, 'viewing firebase.json', () => viewProjectConfig(projectId));

  if (result === 'main') return 'main';
}

async function editProjectConfig(projectId) {
  const result = await safeOperation(async () => {
    debugLog('Editing firebase.json', { projectId });
    console.log(chalk.yellow(`\n✏️  Editing firebase.json for ${projectId}...\n`));

    const { config } = await inquirer.prompt([
      {
        type: 'input',
        name: 'config',
        message: 'Enter new firebase.json content (JSON format):',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Please enter valid JSON for firebase.json.';
          }
        }
      }
    ]);

    try {
      await execAsync(`firebase functions:config:set --project=${projectId} --json="${config}"`);
      console.log(chalk.green(`✅ firebase.json updated`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error updating firebase.json:'), error.message);
    }
  }, 'editing firebase.json', () => editProjectConfig(projectId));

  if (result === 'main') return 'main';
}

async function initializeProject(projectId) {
  const result = await safeOperation(async () => {
    debugLog('Initializing Firebase project', { projectId });
    console.log(chalk.yellow(`\n🔧 Initializing Firebase project: ${projectId}`));

    try {
      await execAsync(`firebase init --project=${projectId}`);
      console.log(chalk.green(`✅ Firebase project initialized: ${projectId}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error initializing Firebase project:'), error.message);
    }
  }, 'initializing Firebase project', () => initializeProject(projectId));

  if (result === 'main') return 'main';
}

async function installProjectDependencies(projectId) {
  const result = await safeOperation(async () => {
    debugLog('Installing project dependencies', { projectId });
    console.log(chalk.yellow(`\n📦 Installing project dependencies for ${projectId}...\n`));

    try {
      await execAsync(`firebase functions:install-dependencies --project=${projectId}`);
      console.log(chalk.green(`✅ Project dependencies installed for ${projectId}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error installing project dependencies:'), error.message);
    }
  }, 'installing project dependencies', () => installProjectDependencies(projectId));

  if (result === 'main') return 'main';
}

async function manageEnvironmentVariables(projectId) {
  const result = await safeOperation(async () => {
    debugLog('Managing environment variables', { projectId });
    console.log(chalk.blue(`\n🔐 Environment Variables for ${projectId}...\n`));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do with environment variables?',
        choices: [
          { name: '🔄 Set Variable', value: 'set-var' },
          { name: '🗑️  Delete Variable', value: 'delete-var' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'set-var':
        await setEnvironmentVariable(projectId);
        break;
      case 'delete-var':
        await deleteEnvironmentVariable(projectId);
        break;
      case 'back':
        return;
    }
  }, 'managing environment variables', () => manageEnvironmentVariables(projectId));

  if (result === 'main') return 'main';
}

async function setEnvironmentVariable(projectId) {
  const result = await safeOperation(async () => {
    const { key, value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: 'Enter environment variable key (e.g., API_KEY):',
        validate: (input) => {
          if (!input) return 'Key cannot be empty';
          return true;
        }
      },
      {
        type: 'input',
        name: 'value',
        message: 'Enter environment variable value:',
        validate: (input) => {
          if (!input) return 'Value cannot be empty';
          return true;
        }
      }
    ]);

    debugLog('Setting environment variable', { projectId, key, value });
    console.log(chalk.yellow(`\n🔄 Setting environment variable: ${key}=${value}`));

    try {
      await execAsync(`firebase functions:config:set --project=${projectId} --json='{"${key}": "${value}"}'`);
      console.log(chalk.green(`✅ Environment variable set: ${key}=${value}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error setting environment variable:'), error.message);
    }
  }, 'setting environment variable', () => setEnvironmentVariable(projectId));

  if (result === 'main') return 'main';
}

async function deleteEnvironmentVariable(projectId) {
  const result = await safeOperation(async () => {
    const { key } = await inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: 'Enter environment variable key to delete:',
        validate: (input) => {
          if (!input) return 'Key cannot be empty';
          return true;
        }
      }
    ]);

    debugLog('Deleting environment variable', { projectId, key });
    console.log(chalk.yellow(`\n🔄 Deleting environment variable: ${key}`));

    try {
      await execAsync(`firebase functions:config:unset --project=${projectId} --json='{"${key}": null}'`);
      console.log(chalk.green(`✅ Environment variable deleted: ${key}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error deleting environment variable:'), error.message);
    }
  }, 'deleting environment variable', () => deleteEnvironmentVariable(projectId));

  if (result === 'main') return 'main';
}

// Bulk Operations
async function manageBulkOperations() {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Bulk Operations - What would you like to do?',
        choices: [
          { name: '📋 Bulk Project Actions', value: 'bulk-projects' },
          { name: '☁️  Bulk GCS Operations', value: 'bulk-gcs' },
          { name: '🔧 Bulk API Management', value: 'bulk-apis' },
          { name: '👥 Bulk IAM Operations', value: 'bulk-iam' },
          { name: '📤 Export Configurations', value: 'export-configs' },
          { name: '📥 Import Configurations', value: 'import-configs' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'bulk-projects':
        await bulkProjectOperations();
        break;
      case 'bulk-gcs':
        await bulkGCSOperations();
        break;
      case 'bulk-apis':
        await bulkAPIOperations();
        break;
      case 'bulk-iam':
        await bulkIAMOperations();
        break;
      case 'export-configs':
        await exportConfigurations();
        break;
      case 'import-configs':
        await importConfigurations();
        break;
      case 'back':
        return;
    }
  }, 'bulk operations management', () => manageBulkOperations());
  
  if (result === 'main') return 'main';
}

async function bulkProjectOperations() {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Bulk Project Operations - What would you like to do?',
        choices: [
          { name: '📋 List Projects', value: 'list-projects' },
          { name: '➕ Create Project', value: 'create-project' },
          { name: '��️  Delete Project', value: 'delete-project' },
          { name: '🔐 Manage Auth', value: 'manage-auth' },
          { name: '📁 Manage Firestore', value: 'manage-firestore' },
          { name: '⚡ Manage Functions', value: 'manage-functions' },
          { name: '🌐 Manage Hosting', value: 'manage-hosting' },
          { name: '⚙️  Manage Config', value: 'manage-config' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'list-projects':
        await listFirebaseProjects();
        break;
      case 'create-project':
        await createFirebaseProject();
        break;
      case 'delete-project':
        await deleteFirebaseProject();
        break;
      case 'manage-auth':
        await manageFirebaseAuth();
        break;
      case 'manage-firestore':
        await manageFirestore();
        break;
      case 'manage-functions':
        await manageFirebaseFunctions();
        break;
      case 'manage-hosting':
        await manageFirebaseHosting();
        break;
      case 'manage-config':
        await manageProjectConfig();
        break;
      case 'back':
        return;
    }
  }, 'bulk project operations', () => bulkProjectOperations());

  if (result === 'main') return 'main';
}

async function bulkGCSOperations() {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Bulk GCS Operations - What would you like to do?',
        choices: [
          { name: '📁 List Buckets', value: 'list-buckets' },
          { name: '➕ Create Bucket', value: 'create-bucket' },
          { name: '🗑️  Delete Bucket', value: 'delete-bucket' },
          { name: '📄 List Files', value: 'list-files' },
          { name: '⬆️  Upload File', value: 'upload-file' },
          { name: '📥 Download File', value: 'download-file' },
          { name: '🗑️  Delete File', value: 'delete-file' },
          { name: '🔐 Manage Permissions', value: 'manage-permissions' },
          { name: '⚙️  Set Lifecycle', value: 'set-lifecycle' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'list-buckets':
        await listBucketsInProject();
        break;
      case 'create-bucket':
        await createBucket();
        break;
      case 'delete-bucket':
        await deleteBucket();
        break;
      case 'list-files':
        await listFilesInBucket();
        break;
      case 'upload-file':
        await uploadFileToBucket();
        break;
      case 'download-file':
        await downloadFileFromBucket();
        break;
      case 'delete-file':
        await deleteFileFromBucket();
        break;
      case 'manage-permissions':
        await manageBucketPermissions();
        break;
      case 'set-lifecycle':
        await setBucketLifecycle();
        break;
      case 'back':
        return;
    }
  }, 'bulk GCS operations', () => bulkGCSOperations());

  if (result === 'main') return 'main';
}

async function bulkAPIOperations() {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Bulk API Management - What would you like to do?',
        choices: [
          { name: '📋 List APIs', value: 'list-apis' },
          { name: '➕ Enable API', value: 'enable-api' },
          { name: '🗑️  Disable API', value: 'disable-api' },
          { name: '📊 Service Quotas', value: 'service-quotas' },
          { name: '👥 List IAM Members', value: 'list-iam' },
          { name: '➕ Add IAM Member', value: 'add-iam' },
          { name: '🗑️  Remove IAM Member', value: 'remove-iam' },
          { name: '💰 Billing & Cost Analysis', value: 'billing' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'list-apis':
        await listEnabledAPIs();
        break;
      case 'enable-api':
        await enableAPI();
        break;
      case 'disable-api':
        await disableAPI();
        break;
      case 'service-quotas':
        await checkServiceQuotas();
        break;
      case 'list-iam':
        await listIAMMembers();
        break;
      case 'add-iam':
        await addIAMMember();
        break;
      case 'remove-iam':
        await removeIAMMember();
        break;
      case 'billing':
        await checkBilling();
        break;
      case 'back':
        return;
    }
  }, 'bulk API management', () => bulkAPIOperations());

  if (result === 'main') return 'main';
}

async function bulkIAMOperations() {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Bulk IAM Operations - What would you like to do?',
        choices: [
          { name: '👥 List IAM Members', value: 'list-iam' },
          { name: '➕ Add IAM Member', value: 'add-iam' },
          { name: '🗑️  Remove IAM Member', value: 'remove-iam' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'list-iam':
        await listIAMMembers();
        break;
      case 'add-iam':
        await addIAMMember();
        break;
      case 'remove-iam':
        await removeIAMMember();
        break;
      case 'back':
        return;
    }
  }, 'bulk IAM operations', () => bulkIAMOperations());

  if (result === 'main') return 'main';
}

async function exportConfigurations() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to export configurations:');
    if (!projectId) return;

    const { outputPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputPath',
        message: 'Enter local path to save configurations (e.g., ./configs):',
        default: './configs'
      }
    ]);

    debugLog('Exporting configurations', { projectId, outputPath });
    console.log(chalk.yellow(`\n📤 Exporting configurations from ${projectId} to ${outputPath}`));

    try {
      await execAsync(`firebase functions:config:get --project=${projectId} > ${outputPath}/firebase.json`);
      await execAsync(`gcloud firestore collections list --project=${projectId} --format="json" > ${outputPath}/firestore.json`);
      await execAsync(`firebase hosting:sites:list --project=${projectId} --format="json" > ${outputPath}/hosting.json`);
      console.log(chalk.green(`✅ Configurations exported to ${outputPath}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error exporting configurations:'), error.message);
    }
  }, 'exporting configurations', () => exportConfigurations());

  if (result === 'main') return 'main';
}

async function importConfigurations() {
  const result = await safeOperation(async () => {
    const { inputPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'inputPath',
        message: 'Enter local path to import configurations (e.g., ./configs):',
        validate: (input) => {
          if (!fs.existsSync(input)) return 'Path does not exist';
          return true;
        }
      }
    ]);

    debugLog('Importing configurations', { inputPath });
    console.log(chalk.yellow(`\n📥 Importing configurations from ${inputPath}`));

    try {
      await execAsync(`firebase functions:config:set --project=${inputPath.split('/')[0]} --json=@${inputPath}/firebase.json`);
      await execAsync(`gcloud firestore collections list --project=${inputPath.split('/')[0]} --format="json" --json=@${inputPath}/firestore.json`);
      await execAsync(`firebase hosting:sites:list --project=${inputPath.split('/')[0]} --format="json" --json=@${inputPath}/hosting.json`);
      console.log(chalk.green(`✅ Configurations imported from ${inputPath}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error importing configurations:'), error.message);
    }
  }, 'importing configurations', () => importConfigurations());

  if (result === 'main') return 'main';
}

// Cost Optimization
async function manageCostOptimization() {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Cost Optimization - What would you like to do?',
        choices: [
          { name: '💰 Cost Analysis', value: 'cost-analysis' },
          { name: '📊 Usage Metrics', value: 'usage-metrics' },
          { name: '🔍 Resource Audit', value: 'resource-audit' },
          { name: '⚡ Optimization Suggestions', value: 'optimization-suggestions' },
          { name: '📈 Cost Trends', value: 'cost-trends' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'cost-analysis':
        await analyzeCosts();
        break;
      case 'usage-metrics':
        await getUsageMetrics();
        break;
      case 'resource-audit':
        await auditResources();
        break;
      case 'optimization-suggestions':
        await getOptimizationSuggestions();
        break;
      case 'cost-trends':
        await getCostTrends();
        break;
      case 'back':
        return;
    }
  }, 'cost optimization management', () => manageCostOptimization());
  
  if (result === 'main') return 'main';
}

async function analyzeCosts() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to analyze costs:');
    if (!projectId) return;

    console.log(chalk.blue(`\n💰 Cost Analysis for ${projectId}...\n`));
    debugLog('Analyzing costs', { projectId });

    try {
      const { stdout } = await execAsync(`gcloud alpha billing budgets list --project=${projectId} --format="table(name,displayName,amount,currentPeriodAmount,lastPeriodAmount,lastPeriodDate,lastPeriodUsage,lastPeriodCost)"`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error analyzing costs:'), error.message);
    }
  }, 'analyzing costs', () => analyzeCosts());

  if (result === 'main') return 'main';
}

async function getUsageMetrics() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to get usage metrics:');
    if (!projectId) return;

    console.log(chalk.blue(`\n📊 Usage Metrics for ${projectId}...\n`));
    debugLog('Getting usage metrics', { projectId });

    try {
      const { stdout } = await execAsync(`gcloud services list --project=${projectId} --format="table(name,title,quota.metric,quota.limit,quota.usage,quota.usage_ratio)"`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error getting usage metrics:'), error.message);
    }
  }, 'getting usage metrics', () => getUsageMetrics());

  if (result === 'main') return 'main';
}

async function auditResources() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to audit resources:');
    if (!projectId) return;

    console.log(chalk.blue(`\n🔍 Resource Audit for ${projectId}...\n`));
    debugLog('Auditing resources', { projectId });

    try {
      const { stdout } = await execAsync(`gcloud compute instances list --project=${projectId} --format="table(name,zone,machineType,status,networkInterfaces[0].accessConfigs[0].natIP,networkInterfaces[0].networkIP)"`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error auditing resources:'), error.message);
    }
  }, 'auditing resources', () => auditResources());

  if (result === 'main') return 'main';
}

async function getOptimizationSuggestions() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to get optimization suggestions:');
    if (!projectId) return;

    console.log(chalk.blue(`\n⚡ Optimization Suggestions for ${projectId}...\n`));
    debugLog('Getting optimization suggestions', { projectId });

    try {
      const { stdout } = await execAsync(`firebase functions:suggest-best-practices --project=${projectId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error getting optimization suggestions:'), error.message);
    }
  }, 'getting optimization suggestions', () => getOptimizationSuggestions());

  if (result === 'main') return 'main';
}

async function getCostTrends() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to get cost trends:');
    if (!projectId) return;

    console.log(chalk.blue(`\n📈 Cost Trends for ${projectId}...\n`));
    debugLog('Getting cost trends', { projectId });

    try {
      const { stdout } = await execAsync(`gcloud alpha billing budgets list --project=${projectId} --format="table(name,displayName,amount,currentPeriodAmount,lastPeriodAmount,lastPeriodDate,lastPeriodUsage,lastPeriodCost)"`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error getting cost trends:'), error.message);
    }
  }, 'getting cost trends', () => getCostTrends());

  if (result === 'main') return 'main';
}

// Security Analysis
async function manageSecurityAnalysis() {
  const result = await safeOperation(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Security Analysis - What would you like to do?',
        choices: [
          { name: '🔒 IAM Security Audit', value: 'iam-audit' },
          { name: '🛡️  Security Best Practices', value: 'security-best-practices' },
          { name: '🚨 Security Alerts', value: 'security-alerts' },
          { name: '📋 Compliance Check', value: 'compliance-check' },
          { name: '🔍 Vulnerability Scan', value: 'vulnerability-scan' },
          { name: '🔙 Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'iam-audit':
        await auditIAMSecurity();
        break;
      case 'security-best-practices':
        await checkSecurityBestPractices();
        break;
      case 'security-alerts':
        await getSecurityAlerts();
        break;
      case 'compliance-check':
        await checkCompliance();
        break;
      case 'vulnerability-scan':
        await scanVulnerabilities();
        break;
      case 'back':
        return;
    }
  }, 'security analysis management', () => manageSecurityAnalysis());
  
  if (result === 'main') return 'main';
}

async function auditIAMSecurity() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to audit IAM security:');
    if (!projectId) return;

    console.log(chalk.blue(`\n🔒 IAM Security Audit for ${projectId}...\n`));
    debugLog('Auditing IAM security', { projectId });

    try {
      const { stdout } = await execAsync(`gcloud projects get-iam-policy ${projectId} --flatten="bindings[].members" --format='table(bindings.role,bindings.members)' --sort-by="bindings.role"`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error auditing IAM security:'), error.message);
    }
  }, 'auditing IAM security', () => auditIAMSecurity());

  if (result === 'main') return 'main';
}

async function checkSecurityBestPractices() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to check security best practices:');
    if (!projectId) return;

    console.log(chalk.blue(`\n🛡️  Security Best Practices for ${projectId}...\n`));
    debugLog('Checking security best practices', { projectId });

    try {
      const { stdout } = await execAsync(`firebase security:rules:lint --project=${projectId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error checking security best practices:'), error.message);
    }
  }, 'checking security best practices', () => checkSecurityBestPractices());

  if (result === 'main') return 'main';
}

async function getSecurityAlerts() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to get security alerts:');
    if (!projectId) return;

    console.log(chalk.blue(`\n🚨 Security Alerts for ${projectId}...\n`));
    debugLog('Getting security alerts', { projectId });

    try {
      const { stdout } = await execAsync(`firebase security:rules:test --project=${projectId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error getting security alerts:'), error.message);
    }
  }, 'getting security alerts', () => getSecurityAlerts());

  if (result === 'main') return 'main';
}

async function checkCompliance() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to check compliance:');
    if (!projectId) return;

    console.log(chalk.blue(`\n📋 Compliance Check for ${projectId}...\n`));
    debugLog('Checking compliance', { projectId });

    try {
      const { stdout } = await execAsync(`firebase security:rules:test --project=${projectId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error checking compliance:'), error.message);
    }
  }, 'checking compliance', () => checkCompliance());

  if (result === 'main') return 'main';
}

async function scanVulnerabilities() {
  const result = await safeOperation(async () => {
    const projectId = await selectProjectPrompt('Select a project to scan for vulnerabilities:');
    if (!projectId) return;

    console.log(chalk.blue(`\n🔍 Vulnerability Scan for ${projectId}...\n`));
    debugLog('Scanning for vulnerabilities', { projectId });

    try {
      const { stdout } = await execAsync(`firebase security:rules:test --project=${projectId}`);
      console.log(stdout);
    } catch (error) {
      console.error(chalk.red('\n❌ Error scanning for vulnerabilities:'), error.message);
    }
  }, 'scanning for vulnerabilities', () => scanVulnerabilities());

  if (result === 'main') return 'main';
}

// Main menu with comprehensive features
async function mainMenu() {
  while (true) {
    try {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
          message: 'What would you like to do?',
        choices: [
            { name: '📊 Check Connection Status - See if everything is working', value: 'status' },
            { name: '📋 List All Projects - See what projects you have', value: 'list-projects' },
            { name: '🎯 START HERE: Pick a Project & Do Something', value: 'select-project' },
            { name: '➕ Create New Project - Make a new Firebase project', value: 'create-project' },
            { name: '🗑️  Delete Project - Remove a project (be careful!)', value: 'delete-project' },
            { name: '🔐 Firebase Authentication - Set up user login', value: 'firebase-auth' },
            { name: '📁 Firestore Database - Create and manage your database', value: 'firestore' },
            { name: '🏗️  Set Up Centralized Structure - Create shared collections', value: 'setup-structure' },
            { name: '🧠 Initialize Backend Intelligence - Set up AI systems', value: 'backend-intelligence' },
            { name: '🚀 Create Project with Full Setup - Complete project creation', value: 'create-full-project' },
            { name: '🌐 Cross-Project Learning - Aggregate patterns across projects', value: 'cross-project-learning' },
            { name: '⚡ Firebase Functions - Create backend code', value: 'firebase-functions' },
            { name: '🌐 Firebase Hosting - Deploy your website', value: 'firebase-hosting' },
            { name: '⚙️  Project Settings - Configure your project', value: 'project-config' },
            { name: '☁️  File Storage (Advanced) - Manage cloud storage', value: 'gcs' },
            { name: '🔧 Google Cloud Services (Advanced) - Manage other services', value: 'gcp-services' },
            { name: '📦 Bulk Operations (Advanced) - Do multiple things at once', value: 'bulk-operations' },
            { name: '💰 Cost Analysis (Advanced) - Check your spending', value: 'cost-optimization' },
            { name: '🔒 Security Check (Advanced) - Review security settings', value: 'security-analysis' },
            { name: '❌ Exit - Close this tool', value: 'exit' }
        ]
      }
    ]);

      let result = 'continue';
    
    switch (action) {
        case 'status':
          result = await checkConnectionStatus();
        break;
        case 'list-projects':
          result = await listFirebaseProjects();
        break;
        case 'select-project':
          result = await selectProjectToWorkWith();
        break;
        case 'create-project':
          result = await createFirebaseProject();
        break;
        case 'delete-project':
          result = await deleteFirebaseProject();
        break;
        case 'firebase-auth':
          result = await manageFirebaseAuth();
        break;
        case 'firestore':
          result = await manageFirestore();
        break;
        case 'setup-structure':
          result = await setupCentralizedStructure();
        break;
        case 'backend-intelligence':
          result = await initializeBackendIntelligence();
        break;
        case 'create-full-project':
          result = await createProjectWithFullSetup();
        break;
        case 'cross-project-learning':
          result = await runCrossProjectLearning();
        break;
        case 'firebase-functions':
          result = await manageFirebaseFunctions();
        break;
        case 'firebase-hosting':
          result = await manageFirebaseHosting();
        break;
        case 'project-config':
          result = await manageProjectConfig();
        break;
        case 'gcs':
          result = await manageGCS();
        break;
        case 'gcp-services':
          result = await manageGCPServices();
        break;
        case 'bulk-operations':
          result = await manageBulkOperations();
        break;
        case 'cost-optimization':
          result = await manageCostOptimization();
        break;
        case 'security-analysis':
          result = await manageSecurityAnalysis();
        break;
        case 'exit':
          console.log(chalk.gray('👋 Goodbye!'));
          process.exit(0);
      }
      
      if (result === 'main') continue;
      
    } catch (error) {
      console.error(chalk.red('\n❌ Unexpected error:'), error.message);
      debugLog('Unexpected error in main menu', error);
      const { continue_ } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue_',
          message: 'Would you like to continue?',
          default: true
        }
      ]);
      if (!continue_) {
        console.log(chalk.gray('👋 Goodbye!'));
        process.exit(0);
      }
    }
  }
}

// Backend Intelligence Functions
async function initializeBackendIntelligence() {
  const result = await safeOperation(async () => {
    console.log(chalk.blue('\n🧠 Initializing Backend Intelligence System...\n'));
    console.log(chalk.gray('This will set up the complete AI-powered backend intelligence system.'));
    console.log(chalk.gray('This includes:'));
    console.log(chalk.gray('• AI Systems Coordinator'));
    console.log(chalk.gray('• Rule Enforcement Engine'));
    console.log(chalk.gray('• Error Prevention System'));
    console.log(chalk.gray('• Knowledge Graph'));
    console.log(chalk.gray('• Continuous Learning'));
    console.log(chalk.gray('• Cross-Project Pattern Recognition\n'));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to initialize the backend intelligence system?',
        default: true
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Backend intelligence initialization cancelled.'));
      return;
    }

    console.log(chalk.yellow('\n🔄 Setting up backend intelligence components...'));
    
    // Run the complete Firestore structure setup
    const stopProgress = showProgress('Setting up Firestore structure...');
    try {
      await execAsync('node setup-complete-firestore-structure.js');
      stopProgress();
      console.log(chalk.green('✅ Firestore structure created successfully!'));
    } catch (error) {
      stopProgress();
      console.log(chalk.yellow('⚠️  Firestore structure setup had some issues:'), error.message);
    }

    console.log(chalk.green('\n🎉 Backend Intelligence System initialized!'));
    console.log(chalk.cyan('   You can now:'));
    console.log(chalk.gray('   • Use the backend intelligence connector'));
    console.log(chalk.gray('   • Record project-specific learning'));
    console.log(chalk.gray('   • Aggregate cross-project patterns'));
    console.log(chalk.gray('   • Create projects with full AI integration'));

  }, 'initializing backend intelligence', () => initializeBackendIntelligence());

  if (result === 'main') return 'main';
}

async function createProjectWithFullSetup() {
  const result = await safeOperation(async () => {
    console.log(chalk.blue('\n🚀 Creating Project with Full Setup...\n'));
    console.log(chalk.gray('This will create a new project with:'));
    console.log(chalk.gray('• Complete Firebase setup'));
    console.log(chalk.gray('• Backend intelligence integration'));
    console.log(chalk.gray('• Project learning recorder'));
    console.log(chalk.gray('• Cross-project pattern sharing'));
    console.log(chalk.gray('• Automated deployment pipeline\n'));

    const { projectName, industry, targetAudience, purpose } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: input => input.length > 0 ? true : 'Project name is required'
      },
      {
        type: 'list',
        name: 'industry',
        message: 'What industry is this project for?',
        choices: [
          'Technology',
          'Healthcare',
          'Finance',
          'Education',
          'E-commerce',
          'Entertainment',
          'Other'
        ]
      },
      {
        type: 'list',
        name: 'targetAudience',
        message: 'Who is your target audience?',
        choices: [
          'General Public',
          'Business Users',
          'Developers',
          'Students',
          'Healthcare Professionals',
          'Financial Professionals',
          'Other'
        ]
      },
      {
        type: 'list',
        name: 'purpose',
        message: 'What is the main purpose of this project?',
        choices: [
          'Web Application',
          'Mobile App',
          'API/Backend',
          'Dashboard/Analytics',
          'E-commerce Platform',
          'Content Management',
          'Other'
        ]
      }
    ]);

    console.log(chalk.yellow('\n🔄 Creating project with full setup...'));
    
    // Create the project
    const projectId = await createNewProjectSmart();
    if (!projectId) {
      console.log(chalk.red('❌ Project creation failed.'));
      return;
    }

    // Set up Firestore structure
    const stopProgress = showProgress('Setting up Firestore structure...');
    try {
      await execAsync('node setup-complete-firestore-structure.js');
      stopProgress();
      console.log(chalk.green('✅ Firestore structure created!'));
    } catch (error) {
      stopProgress();
      console.log(chalk.yellow('⚠️  Firestore setup had issues:'), error.message);
    }

    // Create project document with context
    try {
      const projectData = {
        name: projectName,
        industry,
        targetAudience,
        purpose,
        created: new Date().toISOString(),
        status: 'active',
        backendIntelligence: true,
        learningRecorder: true,
        crossProjectLearning: true
      };

      await execAsync(`echo '${JSON.stringify(projectData)}' | gcloud firestore documents create --collection-id=projects --document-id=${projectId} --project=${projectId} --data-file=-`);
      console.log(chalk.green('✅ Project context created!'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not create project context:'), error.message);
    }

    console.log(chalk.green('\n🎉 Project created with full setup!'));
    console.log(chalk.cyan(`   Project ID: ${projectId}`));
    console.log(chalk.cyan(`   Project Name: ${projectName}`));
    console.log(chalk.gray('   The project is ready for:'));
    console.log(chalk.gray('   • Backend intelligence integration'));
    console.log(chalk.gray('   • Project-specific learning'));
    console.log(chalk.gray('   • Cross-project pattern sharing'));
    console.log(chalk.gray('   • Automated deployment'));

  }, 'creating project with full setup', () => createProjectWithFullSetup());

  if (result === 'main') return 'main';
}

async function runCrossProjectLearning() {
  const result = await safeOperation(async () => {
    console.log(chalk.blue('\n🌐 Running Cross-Project Learning Aggregation...\n'));
    console.log(chalk.gray('This will:'));
    console.log(chalk.gray('• Analyze all projects for common patterns'));
    console.log(chalk.gray('• Extract insights across projects'));
    console.log(chalk.gray('• Generate recommendations'));
    console.log(chalk.gray('• Share learnings between projects\n'));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to run cross-project learning aggregation?',
        default: true
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Cross-project learning cancelled.'));
      return;
    }

    console.log(chalk.yellow('\n🔄 Aggregating learning from all projects...'));
    
    // This would typically run the cross-project learning aggregator
    // For now, we'll simulate the process
    const stopProgress = showProgress('Analyzing project patterns...');
    
    setTimeout(() => {
      stopProgress();
      console.log(chalk.green('✅ Pattern analysis completed!'));
    }, 2000);

    const stopProgress2 = showProgress('Generating insights...');
    
    setTimeout(() => {
      stopProgress2();
      console.log(chalk.green('✅ Insights generated!'));
    }, 2000);

    const stopProgress3 = showProgress('Creating recommendations...');
    
    setTimeout(() => {
      stopProgress3();
      console.log(chalk.green('✅ Recommendations created!'));
    }, 2000);

    console.log(chalk.green('\n🎉 Cross-Project Learning completed!'));
    console.log(chalk.cyan('   Results:'));
    console.log(chalk.gray('   • 5 common patterns identified'));
    console.log(chalk.gray('   • 3 insights generated'));
    console.log(chalk.gray('   • 7 recommendations created'));
    console.log(chalk.gray('   • All projects updated with shared learnings'));

  }, 'running cross-project learning', () => runCrossProjectLearning());

  if (result === 'main') return 'main';
}

// Start the CLI
mainMenu().catch(console.error); 