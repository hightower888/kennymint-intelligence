#!/usr/bin/env node

/**
 * 🚀 Project Creation CLI
 * 
 * Simple command-line interface for creating new projects
 * with the Core Backend Engine template system.
 */

import { createNewProject, validateProjectConfig, ProjectInitConfig } from './project-template-creator';
import { createBackendEngine } from './backend-logic/core-engine';

async function main() {
  console.log('🚀 AI-Powered Project Creator');
  console.log('=============================\n');

  // Get project configuration from command line arguments or prompts
  const config = await getProjectConfig();

  if (!validateProjectConfig(config)) {
    console.error('❌ Invalid project configuration');
    process.exit(1);
  }

  try {
    // Create the project structure
    console.log('\n🏗️ Creating project structure...');
    const projectPath = await createNewProject(config);

    // Test the backend engine initialization
    console.log('\n🔧 Testing backend engine initialization...');
    const engine = createBackendEngine({ debugMode: false });
    await engine.initializeWithProject(projectPath);

    console.log('\n✅ Project created successfully!');
    console.log(`📁 Location: ${projectPath}`);
    console.log('\n🎯 Next Steps:');
    console.log(`   cd ${config.projectName}`);
    console.log('   npm install (install dependencies)');
    console.log('   Open the README.md for full instructions');
    console.log('\n🚀 Start building with AI-powered development!');

    await engine.shutdown();

  } catch (error) {
    console.error('❌ Error creating project:', error);
    process.exit(1);
  }
}

async function getProjectConfig(): Promise<ProjectInitConfig> {
  // For simplicity, using command line arguments
  // In a real CLI, you'd use a library like inquirer for interactive prompts
  
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: npm run create-project <name> <industry> <audience> <purpose>');
    console.log('\nExample:');
    console.log('  npm run create-project "MyApp" "technology" "business users" "SaaS platform"');
    console.log('\nOptional arguments:');
    console.log('  --brand-maturity <none|emerging|defined|established>');
    console.log('  --phase <discovery|development|established|maintenance>');
    console.log('  --mission "Your company mission"');
    console.log('  --values "Value1,Value2,Value3"');
    
    process.exit(1);
  }

  const [projectName, industry, targetAudience, purpose] = args;

  // Parse optional arguments
  const brandMaturity = getArgValue('--brand-maturity') as any || 'emerging';
  const currentPhase = getArgValue('--phase') as any || 'development';
  const mission = getArgValue('--mission');
  const valuesStr = getArgValue('--values');
  const values = valuesStr ? valuesStr.split(',').map(v => v.trim()) : undefined;

  const config: ProjectInitConfig = {
    projectName: projectName.replace(/[^a-zA-Z0-9-_]/g, ''), // Sanitize name
    industry,
    targetAudience,
    purpose,
    brandMaturity,
    currentPhase,
    companyInfo: {
      mission,
      values,
      culture: 'Collaborative and innovative',
      size: 'startup',
      workingStyle: 'Agile development with AI assistance'
    },
    teamInfo: {
      size: 5,
      roles: ['Developer', 'Designer', 'Product Manager'],
      workflowPreferences: ['AI-assisted development', 'Brand consistency', 'Continuous learning'],
      collaborationStyle: 'Cross-functional with AI systems'
    }
  };

  console.log('\n📋 Project Configuration:');
  console.log(`   Name: ${config.projectName}`);
  console.log(`   Industry: ${config.industry}`);
  console.log(`   Target Audience: ${config.targetAudience}`);
  console.log(`   Purpose: ${config.purpose}`);
  console.log(`   Brand Maturity: ${config.brandMaturity}`);
  console.log(`   Current Phase: ${config.currentPhase}`);

  return config;
}

function getArgValue(argName: string): string | undefined {
  const args = process.argv.slice(2);
  const index = args.indexOf(argName);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return undefined;
}

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
} 