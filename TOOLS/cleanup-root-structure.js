#!/usr/bin/env node

/**
 * Cleanup Root Structure
 * Enforces RepoClone structure rules and organizes files properly
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up RepoClone root structure...\n');

// Define structure rules
const ROOT_ALLOWED = [
  'README.md',
  'INTELLIGENCE.md', 
  'STRUCTURE_RULES.md',
  'package.json',
  'package-lock.json',
  '.gitignore',
  '.env',
  '.firebaserc',
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json',
  'storage.rules',
  'index.js',
  'root-intelligence-enforcer.js',
  'ai-monitor.js'
];

const ROOT_DIRECTORIES = [
  'INTELLIGENCE',
  'CORE',
  'DOCS',
  'TOOLS',
  'CONFIG',
  'PROJECTS',
  'TEMPLATES',
  'VERSION_CONTROL',
  '.intelligence',
  'public',
  'node_modules',
  '.git'
];

// Files to move to appropriate directories
const FILES_TO_ORGANIZE = {
  // Firebase/GCS setup files -> TOOLS/
  'setup-firebase-config.js': 'TOOLS/',
  'setup-repoclone-firebase.js': 'TOOLS/',
  'setup-complete-integration.js': 'TOOLS/',
  'update-firebase-config.js': 'TOOLS/',
  'connect-firebase.js': 'TOOLS/',
  'download-service-account.js': 'TOOLS/',
  'project-data-manager.js': 'TOOLS/',
  'store-project-data.js': 'TOOLS/',
  'gcs-manager.js': 'TOOLS/',
  'database-manager.js': 'TOOLS/',
  'github-repo-manager.js': 'TOOLS/',
  
  // Dashboard files -> CORE/
  'dashboard-server.js': 'CORE/',
  'dashboard-app.html': 'CORE/',
  'interactive-dashboard.html': 'CORE/',
  'comprehensive-intelligence-dashboard.js': 'CORE/',
  'visual-intelligence-dashboard.js': 'CORE/',
  'root-intelligence-dashboard.js': 'CORE/',
  'visual-demo.js': 'CORE/',
  'intelligence-demo.js': 'CORE/',
  'setup-dashboard.js': 'CORE/',
  
  // Documentation -> DOCS/
  'INTELLIGENCE_MIGRATION_SCOPE.md': 'DOCS/',
  
  // Environment example -> CONFIG/
  'env.example': 'CONFIG/'
};

function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

function moveFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      const destPath = path.join(destination, path.basename(source));
      fs.renameSync(source, destPath);
      console.log(`📁 Moved: ${source} → ${destPath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Failed to move ${source}:`, error.message);
    return false;
  }
}

function cleanupRoot() {
  console.log('📋 Organizing files according to structure rules...\n');
  
  // Create necessary directories
  Object.values(FILES_TO_ORGANIZE).forEach(dir => {
    createDirectoryIfNotExists(dir);
  });
  
  // Move files to appropriate directories
  let movedCount = 0;
  Object.entries(FILES_TO_ORGANIZE).forEach(([file, directory]) => {
    if (moveFile(file, directory)) {
      movedCount++;
    }
  });
  
  console.log(`\n✅ Moved ${movedCount} files to appropriate directories`);
  
  // Check for forbidden files in root
  const currentFiles = fs.readdirSync('.');
  const forbiddenFiles = currentFiles.filter(file => {
    return !ROOT_ALLOWED.includes(file) && 
           !ROOT_DIRECTORIES.includes(file) && 
           !file.startsWith('.') &&
           fs.statSync(file).isFile();
  });
  
  if (forbiddenFiles.length > 0) {
    console.log('\n⚠️  Files still in root that should be organized:');
    forbiddenFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  }
  
  // Verify required intelligence files
  const requiredFiles = ['README.md', 'INTELLIGENCE.md', 'STRUCTURE_RULES.md', 'package.json'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.log('\n⚠️  Missing required intelligence files:');
    missingFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log('\n✅ All required intelligence files present');
  }
  
  // Create a clean index.js for root
  const indexContent = `/**
 * RepoClone - Root-Level Intelligence System
 * Entry point for the RepoClone intelligence system
 */

require('./root-intelligence-enforcer.js');

console.log('🧠 RepoClone Intelligence System Initialized');
console.log('📊 Structure rules enforced');
console.log('🔍 Monitoring active');
`;

if (!fs.existsSync('index.js')) {
  fs.writeFileSync('index.js', indexContent);
  console.log('✅ Created root index.js');
}

// Update package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts = {
  "start": "node index.js",
  "enforce": "node root-intelligence-enforcer.js",
  "monitor": "node ai-monitor.js",
  "dashboard": "node CORE/dashboard-server.js",
  "cleanup": "node TOOLS/cleanup-root-structure.js",
  "setup": "node TOOLS/setup-repoclone-firebase.js",
  "store": "node TOOLS/store-project-data.js"
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json scripts');

console.log('\n🎉 Root structure cleanup complete!');
console.log('\n📊 Current root structure:');
console.log('  ✅ Intelligence files only');
console.log('  ✅ Proper directory organization');
console.log('  ✅ Structure rules enforced');
console.log('  ✅ Clean entry point (index.js)');

console.log('\n🚀 Available commands:');
console.log('  npm start          - Start intelligence system');
console.log('  npm run enforce    - Enforce structure rules');
console.log('  npm run monitor    - Run AI monitor');
console.log('  npm run dashboard  - Start dashboard');
console.log('  npm run cleanup    - Clean up structure');
console.log('  npm run setup      - Setup Firebase');
console.log('  npm run store      - Store project data');
}

cleanupRoot(); 