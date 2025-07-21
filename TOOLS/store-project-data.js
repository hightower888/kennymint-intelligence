#!/usr/bin/env node

/**
 * Store RepoClone Project Data in GCS
 * Uploads current project data, intelligence, and assets to GCS bucket
 */

require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

console.log('📦 Storing RepoClone Project Data in GCS...\n');

async function storeProjectData() {
  try {
    // Initialize GCS
    const storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID || 'dangpt-4777e'
    });
    
    const bucketName = process.env.GCS_BUCKET_NAME || 'repoclone-storage';
    const bucket = storage.bucket(bucketName);
    
    console.log(`📦 Bucket: ${bucketName}`);
    console.log(`🏢 Project: ${process.env.GCS_PROJECT_ID}`);
    
    // Project metadata
    const projectMetadata = {
      name: 'RepoClone',
      version: '1.0.0',
      description: 'Intelligent project template and deployment system',
      timestamp: new Date().toISOString(),
      projectId: process.env.GCS_PROJECT_ID,
      bucket: bucketName,
      structure: {
        core: ['CORE/', 'INTELLIGENCE/', 'TOOLS/'],
        docs: ['DOCS/', 'README.md'],
        templates: ['TEMPLATES/', 'ARCHIVE/backend-logic/project-templates/'],
        assets: ['PROJECTS/', 'VERSION_CONTROL/']
      }
    };
    
    // Upload project metadata
    const metadataFile = bucket.file('projects/repoclone-metadata.json');
    await metadataFile.save(JSON.stringify(projectMetadata, null, 2));
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
    
    const intelligenceFile = bucket.file('intelligence/repoclone-intelligence.json');
    await intelligenceFile.save(JSON.stringify(intelligenceData, null, 2));
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
    
    const structureFile = bucket.file('projects/repoclone-structure.json');
    await structureFile.save(JSON.stringify(fileStructure, null, 2));
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
        const file = bucket.file(`config/${configFile}`);
        await file.save(fs.readFileSync(configFile));
        console.log(`✅ Uploaded ${configFile}`);
      }
    }
    
    // Store tools and scripts
    if (fs.existsSync('TOOLS')) {
      const toolsFiles = fs.readdirSync('TOOLS').filter(file => file.endsWith('.js'));
      for (const toolFile of toolsFiles) {
        const file = bucket.file(`tools/${toolFile}`);
        await file.save(fs.readFileSync(`TOOLS/${toolFile}`));
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
    
    const summaryFile = bucket.file('backups/repoclone-backup-summary.json');
    await summaryFile.save(JSON.stringify(backupSummary, null, 2));
    console.log('✅ Uploaded backup summary');
    
    // List all files in bucket
    const [files] = await bucket.getFiles();
    console.log(`\n📁 Total files in bucket: ${files.length}`);
    
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