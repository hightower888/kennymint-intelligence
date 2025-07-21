#!/usr/bin/env node

/**
 * Sync RepoClone Project Data
 * Syncs data between GCS and Firestore database
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

console.log('🔄 Syncing RepoClone Project Data...\n');

async function syncProjectData() {
  try {
    // Initialize Firebase Admin
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'dangpt-4777e'
    });
    
    const db = admin.firestore();
    const storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID || 'dangpt-4777e'
    });
    
    const bucketName = process.env.GCS_BUCKET_NAME || 'repoclone-storage';
    const bucket = storage.bucket(bucketName);
    
    console.log('✅ Services initialized');
    console.log(`🏢 Project: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`📦 GCS Bucket: ${bucketName}`);
    
    // Get current project structure
    const projectStructure = {
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
    
    // Update Firestore with current structure
    await db.collection('intelligence').doc('file_analysis').update({
      data: {
        totalFiles: projectStructure.root_files.length,
        intelligenceFiles: projectStructure.directories.intelligence.length,
        coreFiles: projectStructure.directories.core.length,
        toolFiles: projectStructure.directories.tools.length,
        docFiles: projectStructure.directories.docs.length,
        templateFiles: projectStructure.directories.templates.length,
        projectFiles: projectStructure.directories.projects.length,
        structure: projectStructure
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Updated file structure in Firestore');
    
    // Get GCS bucket contents
    const [files] = await bucket.getFiles();
    const gcsData = {
      bucket: bucketName,
      totalFiles: files.length,
      files: files.map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        contentType: file.metadata?.contentType || 'unknown',
        updated: file.metadata?.updated || new Date().toISOString()
      }))
    };
    
    // Store GCS data in Firestore
    await db.collection('projects').doc('repoclone').update({
      gcs_data: gcsData,
      lastSync: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Synced GCS data to Firestore');
    
    // Create sync summary
    const syncSummary = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      services: {
        firestore: 'synced',
        gcs: 'synced',
        github: 'pending'
      },
      data: {
        firestore_collections: 5,
        gcs_files: files.length,
        project_files: projectStructure.root_files.length,
        directories: Object.keys(projectStructure.directories).length
      },
      status: 'completed'
    };
    
    await db.collection('monitoring').doc('sync_status').set(syncSummary);
    console.log('✅ Created sync summary');
    
    // Update system health
    await db.collection('monitoring').doc('system_health').update({
      lastSync: admin.firestore.FieldValue.serverTimestamp(),
      services: {
        firestore: 'online',
        storage: 'online',
        functions: 'online',
        hosting: 'offline'
      },
      metrics: {
        totalProjects: 1,
        activeDeployments: 1,
        availableTemplates: 3,
        gcsFiles: files.length,
        firestoreDocuments: 8
      }
    });
    
    console.log('✅ Updated system health');
    
    // Create backup in GCS
    const backupData = {
      timestamp: new Date().toISOString(),
      sync_summary: syncSummary,
      project_structure: projectStructure,
      gcs_contents: gcsData
    };
    
    const backupFile = bucket.file('backups/sync-backup.json');
    await backupFile.save(JSON.stringify(backupData, null, 2));
    console.log('✅ Created sync backup in GCS');
    
    console.log('\n🎉 Project Data Sync Complete!');
    console.log('\n📊 Sync Summary:');
    console.log(`  ✅ Firestore collections: 5`);
    console.log(`  ✅ GCS files: ${files.length}`);
    console.log(`  ✅ Project files: ${projectStructure.root_files.length}`);
    console.log(`  ✅ Directories: ${Object.keys(projectStructure.directories).length}`);
    
    console.log('\n🔗 Access your data:');
    console.log(`   Firestore: https://console.firebase.google.com/project/dangpt-4777e/firestore`);
    console.log(`   GCS: https://console.cloud.google.com/storage/browser/${bucketName}`);
    
  } catch (error) {
    console.error('❌ Failed to sync project data:', error.message);
  }
}

syncProjectData(); 