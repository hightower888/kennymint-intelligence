#!/usr/bin/env node

/**
 * Store RepoClone Project Data using gsutil
 * Uploads current project data using gsutil commands
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('📦 Storing RepoClone Project Data using gsutil...\n');

async function storeProjectData() {
  try {
    const bucketName = 'repoclone-storage';
    
    console.log(`📦 Bucket: ${bucketName}`);
    console.log(`🏢 Project: dangpt-4777e`);
    
    // Project metadata
    const projectMetadata = {
      name: 'RepoClone',
      version: '1.0.0',
      description: 'Intelligent project template and deployment system',
      timestamp: new Date().toISOString(),
      projectId: 'dangpt-4777e',
      bucket: bucketName,
      structure: {
        core: ['CORE/', 'INTELLIGENCE/', 'TOOLS/'],
        docs: ['DOCS/', 'README.md'],
        templates: ['TEMPLATES/', 'ARCHIVE/backend-logic/project-templates/'],
        assets: ['PROJECTS/', 'VERSION_CONTROL/']
      }
    };
    
    // Upload project metadata
    fs.writeFileSync('temp-metadata.json', JSON.stringify(projectMetadata, null, 2));
    execSync(`gsutil cp temp-metadata.json gs://${bucketName}/projects/repoclone-metadata.json`);
    fs.unlinkSync('temp-metadata.json');
    console.log('✅ Uploaded project metadata');
    
    // Store intelligence data
    const intelligenceData = {
      timestamp: new Date().toISOString(),
      intelligence: {
        ai_coordinator: fs.existsSync('INTELLIGENCE/ai-coordinator.js'),
        continuous_learning: fs.existsSync('INTELLIGENCE/continuous-learning/'),
        error_prevention: fs.existsSync('INTELLIGENCE/error-prevention/'),
        knowledge_graph: fs.existsSync('INTELLIGENCE/knowledge-graph/'),
        predictive_intelligence: fs.existsSync('INTELLIGENCE/predictive-intelligence/'),
        rule_enforcement: fs.existsSync('INTELLIGENCE/rule-enforcement/')
      },
      core_systems: {
        dashboard: fs.existsSync('CORE/dashboard.js'),
        intelligence_connector: fs.existsSync('CORE/intelligence-connector.js'),
        learning_aggregator: fs.existsSync('CORE/learning-aggregator.js'),
        root_intelligence: fs.existsSync('CORE/root-intelligence-system.js')
      }
    };
    
    fs.writeFileSync('temp-intelligence.json', JSON.stringify(intelligenceData, null, 2));
    execSync(`gsutil cp temp-intelligence.json gs://${bucketName}/intelligence/repoclone-intelligence.json`);
    fs.unlinkSync('temp-intelligence.json');
    console.log('✅ Uploaded intelligence data');
    
    // Store file structure analysis
    const fileStructure = {
      timestamp: new Date().toISOString(),
      root_files: fs.readdirSync('.').filter(file => !file.startsWith('.')),
      directories: {
        core: fs.existsSync('CORE') ? fs.readdirSync('CORE') : [],
        intelligence: fs.existsSync('INTELLIGENCE') ? fs.readdirSync('INTELLIGENCE') : [],
        tools: fs.existsSync('TOOLS') ? fs.readdirSync('TOOLS') : [],
        docs: fs.existsSync('DOCS') ? fs.readdirSync('DOCS') : [],
        templates: fs.existsSync('TEMPLATES') ? fs.readdirSync('TEMPLATES') : [],
        projects: fs.existsSync('PROJECTS') ? fs.readdirSync('PROJECTS') : []
      }
    };
    
    fs.writeFileSync('temp-structure.json', JSON.stringify(fileStructure, null, 2));
    execSync(`gsutil cp temp-structure.json gs://${bucketName}/projects/repoclone-structure.json`);
    fs.unlinkSync('temp-structure.json');
    console.log('✅ Uploaded file structure analysis');
    
    // Store key configuration files
    const configFiles = [
      'package.json',
      'README.md',
      'STRUCTURE_RULES.md',
      'INTELLIGENCE.md'
    ];
    
    for (const configFile of configFiles) {
      if (fs.existsSync(configFile)) {
        execSync(`gsutil cp "${configFile}" gs://${bucketName}/config/${configFile}`);
        console.log(`✅ Uploaded ${configFile}`);
      }
    }
    
    // Store tools and scripts
    if (fs.existsSync('TOOLS')) {
      const toolsFiles = fs.readdirSync('TOOLS').filter(file => file.endsWith('.js'));
      for (const toolFile of toolsFiles) {
        execSync(`gsutil cp "TOOLS/${toolFile}" gs://${bucketName}/tools/${toolFile}`);
        console.log(`✅ Uploaded tool: ${toolFile}`);
      }
    }
    
    // Create backup summary
    const backupSummary = {
      timestamp: new Date().toISOString(),
      project: 'RepoClone',
      bucket: bucketName,
      files_uploaded: [
        'projects/repoclone-metadata.json',
        'intelligence/repoclone-intelligence.json',
        'projects/repoclone-structure.json',
        'config/package.json',
        'config/README.md',
        'config/STRUCTURE_RULES.md',
        'config/INTELLIGENCE.md'
      ],
      tools_uploaded: fs.existsSync('TOOLS') ? fs.readdirSync('TOOLS').filter(f => f.endsWith('.js')) : [],
      status: 'completed'
    };
    
    fs.writeFileSync('temp-summary.json', JSON.stringify(backupSummary, null, 2));
    execSync(`gsutil cp temp-summary.json gs://${bucketName}/backups/repoclone-backup-summary.json`);
    fs.unlinkSync('temp-summary.json');
    console.log('✅ Uploaded backup summary');
    
    // List all files in bucket
    const bucketList = execSync(`gsutil ls gs://${bucketName}/`, { encoding: 'utf8' });
    console.log(`\n📁 Total files in bucket:`);
    console.log(bucketList);
    
    console.log('\n🎉 RepoClone Project Data Stored Successfully!');
    console.log('\n📊 Storage Summary:');
    console.log('  ✅ Project metadata stored');
    console.log('  ✅ Intelligence data stored');
    console.log('  ✅ File structure analyzed');
    console.log('  ✅ Configuration files backed up');
    console.log('  ✅ Tools and scripts stored');
    console.log('  ✅ Backup summary created');
    
    console.log('\n🔗 Access your data at:');
    console.log(`   https://console.cloud.google.com/storage/browser/${bucketName}`);
    
  } catch (error) {
    console.error('❌ Failed to store project data:', error.message);
  }
}

storeProjectData(); 