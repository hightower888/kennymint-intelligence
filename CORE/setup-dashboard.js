#!/usr/bin/env node

/**
 * Dan-AI-Mate Dashboard Setup Script
 * Helps configure Firebase and GitHub integration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🧠 Dan-AI-Mate Intelligence Dashboard Setup');
console.log('==========================================\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupDashboard() {
  console.log('📋 This script will help you configure the dashboard with:');
  console.log('   • Firebase Firestore (for data storage)');
  console.log('   • GitHub API (for repository integration)');
  console.log('   • Environment variables\n');

  const useFirebase = await askQuestion('🔥 Do you want to set up Firebase Firestore? (y/n): ');
  
  let envContent = '# Dan-AI-Mate Dashboard Configuration\n\n';
  
  if (useFirebase.toLowerCase() === 'y') {
    console.log('\n📝 Firebase Setup:');
    console.log('1. Go to https://console.firebase.google.com');
    console.log('2. Create a new project or select existing one');
    console.log('3. Go to Project Settings > Service Accounts');
    console.log('4. Click "Generate new private key"');
    console.log('5. Download the JSON file\n');
    
    const projectId = await askQuestion('Enter your Firebase Project ID: ');
    const clientEmail = await askQuestion('Enter your Firebase Client Email: ');
    const privateKey = await askQuestion('Enter your Firebase Private Key (or path to JSON file): ');
    
    envContent += `# Firebase Configuration
FIREBASE_PROJECT_ID=${projectId}
FIREBASE_CLIENT_EMAIL=${clientEmail}
FIREBASE_PRIVATE_KEY="${privateKey}"\n\n`;
  } else {
    envContent += `# Firebase Configuration (disabled)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="your-private-key"\n\n`;
  }

  const useGitHub = await askQuestion('\n🐙 Do you want to set up GitHub integration? (y/n): ');
  
  if (useGitHub.toLowerCase() === 'y') {
    console.log('\n📝 GitHub Setup:');
    console.log('1. Go to https://github.com/settings/tokens');
    console.log('2. Click "Generate new token (classic)"');
    console.log('3. Give it a name like "Dan-AI-Mate Dashboard"');
    console.log('4. Select scopes: repo, read:org');
    console.log('5. Copy the generated token\n');
    
    const githubToken = await askQuestion('Enter your GitHub Personal Access Token: ');
    const githubRepo = await askQuestion('Enter your GitHub repository (format: owner/repo): ');
    
    envContent += `# GitHub Configuration
GITHUB_TOKEN=${githubToken}
GITHUB_REPO=${githubRepo}\n\n`;
  } else {
    envContent += `# GitHub Configuration (disabled)
# GITHUB_TOKEN=your-github-token
# GITHUB_REPO=owner/repo\n\n`;
  }

  envContent += `# Server Configuration
PORT=3000\n`;

  // Write .env file
  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Configuration saved to .env file');

  // Create .gitignore entry if it doesn't exist
  const gitignorePath = '.gitignore';
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '# Environment variables\n.env\n');
  } else {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('.env')) {
      fs.appendFileSync(gitignorePath, '\n# Environment variables\n.env\n');
    }
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Review the .env file and make sure all values are correct');
  console.log('2. Run: npm run web');
  console.log('3. Open http://localhost:3000 in your browser');
  
  if (useFirebase.toLowerCase() === 'y') {
    console.log('\n📊 Firebase Features:');
    console.log('   • Real-time activity logging');
    console.log('   • Persistent data storage');
    console.log('   • System metrics tracking');
  }
  
  if (useGitHub.toLowerCase() === 'y') {
    console.log('\n🐙 GitHub Features:');
    console.log('   • Repository information display');
    console.log('   • Recent commits and issues');
    console.log('   • Automatic issue creation for high-priority activities');
  }

  console.log('\n💡 Note: If you skip Firebase/GitHub setup, the dashboard will use local storage only.');
  console.log('   You can always run this setup script again later.');

  rl.close();
}

setupDashboard().catch(console.error); 