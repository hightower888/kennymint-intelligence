#!/usr/bin/env node

/**
 * Backend Engine Initializer
 * Prepares the backend engine for a specific project
 */

const path = require('path');
const fs = require('fs');

// Get project path from arguments
const projectPath = process.argv[2];

if (!projectPath) {
  console.error('❌ No project path provided');
  process.exit(1);
}

console.log('🔧 Preparing Backend Engine...');

// Verify project has required structure
const requiredFiles = [
  'config/project-context.json',
  'brand-guidelines/brand-guidelines.json'
];

const missingFiles = requiredFiles.filter(file => 
  !fs.existsSync(path.join(projectPath, file))
);

if (missingFiles.length > 0) {
  console.error(`
❌ Project missing required files:
${missingFiles.map(f => `  - ${f}`).join('\n')}

This project may not have been created with the backend engine.
Run: npm run create-project
  `);
  process.exit(1);
}

// Create backend lock file
const lockFile = path.join(projectPath, '.backend-lock');
const lockContent = {
  enginePath: path.join(__dirname, '..'),
  lockedAt: new Date().toISOString(),
  version: '1.0.0',
  pid: process.pid
};

fs.writeFileSync(lockFile, JSON.stringify(lockContent, null, 2));

// Load project context
try {
  const contextPath = path.join(projectPath, 'config/project-context.json');
  const context = JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
  
  console.log(`
✅ Backend Engine Initialized
  Project: ${context.projectName}
  Industry: ${context.industry}
  Audience: ${context.targetAudience}
  `);
  
  // Set up global backend access
  global.BACKEND_ENGINE = {
    projectPath,
    context,
    initialized: true,
    startTime: Date.now()
  };
  
} catch (error) {
  console.error('❌ Failed to load project context:', error);
  process.exit(1);
}

// Success
process.exit(0); 