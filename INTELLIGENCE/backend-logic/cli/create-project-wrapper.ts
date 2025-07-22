#!/usr/bin/env ts-node

/**
 * Create Project Wrapper
 * Ensures all projects are created in the backend-logic/projects directory
 */

import { join } from 'path';
import { ProjectTemplateCreator } from './project-template-creator.js';
import { createBackendEngine } from '../core-engine.js';

async function createProject() {
  try {
    const config = await getProjectConfig();
    
    // FORCE project creation in backend-logic/projects
    const projectsDir = join(__dirname, '..', 'projects');
    const projectPath = join(projectsDir, config.projectName);
    
    console.log(`\n🚀 Creating AI-Powered Project: ${config.projectName}`);
    console.log('================================================\n');
    console.log('📍 Location: backend-logic/projects/ (enforced for backend integration)');

    // Create the project structure
    await ProjectTemplateCreator.createProject({
      ...config,
      projectPath // Override any other path
    });

    // Initialize backend engine for the project
    const engine = createBackendEngine();
    await engine.initializeWithProject(projectPath);

    console.log('\n✅ Project created successfully!\n');
    console.log(`📁 Project location: ${projectPath}`);
    console.log('\n🎯 To run your project:');
    console.log(`   npm run project:${config.projectName}`);
    console.log('\n📝 To add this to package.json:');
    console.log(`   Add: "project:${config.projectName}": "node run.js ${config.projectName}"`);
    console.log('\n⚠️  IMPORTANT: Projects can ONLY be run through the backend engine!');
    console.log('   Direct execution (cd project && npm start) is DISABLED by design.');
    console.log('\n🚀 Start building with AI-powered development!');

    await engine.shutdown();

  } catch (error) {
    console.error('❌ Error creating project:', error);
    process.exit(1);
  }
}

async function getProjectConfig() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: npm run create-project <name> <industry> <audience> <purpose>');
    console.log('\nExample:');
    console.log('  npm run create-project "MyApp" "technology" "business users" "SaaS platform"');
    console.log('\nIndustries: technology, healthcare, finance, retail, education, creative');
    console.log('Audiences: business professionals, developers, consumers, students, general public');
    process.exit(1);
  }

  return {
    projectName: args[0].replace(/[^a-zA-Z0-9-_]/g, ''),
    industry: args[1].toLowerCase(),
    targetAudience: args[2].toLowerCase(),
    purpose: args[3],
    brandMaturity: 'emerging',
    currentPhase: 'development'
  };
}

// Run if called directly
if (require.main === module) {
  createProject().catch(console.error);
}

export { createProject }; 