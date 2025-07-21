#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

console.log(chalk.blue.bold('\n🔍 RepoClone Structure Validator\n'));

async function validateStructure() {
  const rootPath = path.resolve(__dirname, '..');
  let hasErrors = false;

  // Check root intelligence files
  console.log(chalk.cyan('📋 Checking Root Intelligence...'));
  const rootFiles = ['README.md', 'INTELLIGENCE.md', 'STRUCTURE_RULES.md', 'package.json', 'index.js'];
  
  for (const file of rootFiles) {
    const exists = await fs.pathExists(path.join(rootPath, file));
    if (exists) {
      console.log(chalk.green(`  ✓ ${file}`));
    } else {
      console.log(chalk.red(`  ✗ ${file} - MISSING`));
      hasErrors = true;
    }
  }

  // Check directory structure
  console.log(chalk.cyan('\n📁 Checking Directory Structure...'));
  
  // Should exist
  const requiredDirs = [
    { path: 'RepoCloneMeta', desc: 'Meta repository with backend logic' },
    { path: 'RepoCloneMeta/backend-logic', desc: 'Backend logic for OTHER projects' },
    { path: 'RepoCloneApp', desc: 'Mac application' },
    { path: 'scripts', desc: 'Root intelligence scripts' }
  ];
  
  for (const dir of requiredDirs) {
    const exists = await fs.pathExists(path.join(rootPath, dir.path));
    if (exists) {
      console.log(chalk.green(`  ✓ ${dir.path}/ - ${dir.desc}`));
    } else {
      console.log(chalk.red(`  ✗ ${dir.path}/ - ${dir.desc} - MISSING`));
      hasErrors = true;
    }
  }

  // Should NOT exist at root
  console.log(chalk.cyan('\n🚫 Checking Forbidden Locations...'));
  const forbiddenAtRoot = ['backend-logic', 'ai-systems', 'core-systems'];
  
  for (const dir of forbiddenAtRoot) {
    const exists = await fs.pathExists(path.join(rootPath, dir));
    if (!exists) {
      console.log(chalk.green(`  ✓ ${dir}/ not at root (correct)`));
    } else {
      console.log(chalk.red(`  ✗ ${dir}/ found at root - SHOULD BE IN RepoCloneMeta!`));
      hasErrors = true;
    }
  }

  // Check for projects at root
  console.log(chalk.cyan('\n🚀 Checking Projects...'));
  const entries = await fs.readdir(rootPath);
  const projects = [];
  
  for (const entry of entries) {
    const fullPath = path.join(rootPath, entry);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory() && 
        !entry.startsWith('.') && 
        entry !== 'RepoCloneMeta' && 
        entry !== 'RepoCloneApp' &&
        entry !== 'node_modules' &&
        entry !== 'scripts') {
      // Check if it has a package.json (likely a project)
      const hasPackageJson = await fs.pathExists(path.join(fullPath, 'package.json'));
      if (hasPackageJson) {
        projects.push(entry);
      }
    }
  }
  
  if (projects.length > 0) {
    console.log(chalk.green(`  ✓ Found ${projects.length} project(s) at root level (correct):`));
    projects.forEach(p => console.log(chalk.gray(`    • ${p}`)));
  } else {
    console.log(chalk.yellow('  ℹ No projects created yet'));
  }

  // Summary
  console.log(chalk.cyan('\n📊 Summary:'));
  if (!hasErrors) {
    console.log(chalk.green.bold('  ✅ Structure is VALID - RepoClone is properly configured!'));
    console.log(chalk.gray('\n  Root intelligence understands:'));
    console.log(chalk.gray('  • It is a template deployment system'));
    console.log(chalk.gray('  • Backend logic in RepoCloneMeta is for OTHER projects'));
    console.log(chalk.gray('  • Projects are created at root level'));
    console.log(chalk.gray('  • Clean separation is enforced'));
  } else {
    console.log(chalk.red.bold('  ❌ Structure has ERRORS - Please fix the issues above'));
  }

  return !hasErrors;
}

// Run validation
validateStructure()
  .then(isValid => {
    process.exit(isValid ? 0 : 1);
  })
  .catch(err => {
    console.error(chalk.red('Error during validation:'), err);
    process.exit(1);
  }); 