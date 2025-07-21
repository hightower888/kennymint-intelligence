#!/usr/bin/env node

/**
 * RepoClone Project Summary
 * Shows complete setup status and configuration
 */

require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

console.log('📊 RepoClone Project Summary\n');

async function showProjectSummary() {
  try {
    // Initialize Firebase Admin
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'dangpt-4777e'
    });
    
    const db = admin.firestore();
    
    console.log('🏢 Project Configuration:');
    console.log(`  Project ID: ${process.env.FIREBASE_PROJECT_ID || 'dangpt-4777e'}`);
    console.log(`  GCS Bucket: ${process.env.GCS_BUCKET_NAME || 'repoclone-storage'}`);
    console.log(`  GitHub Repo: ${process.env.GITHUB_REPO || 'danielyoung/RepoClone'}`);
    
    // Get project data from Firestore
    const projectDoc = await db.collection('projects').doc('repoclone').get();
    const intelligenceDoc = await db.collection('intelligence').doc('system_status').get();
    const monitoringDoc = await db.collection('monitoring').doc('system_health').get();
    
    if (projectDoc.exists) {
      const projectData = projectDoc.data();
      console.log('\n📁 Project Data:');
      console.log(`  Name: ${projectData.name}`);
      console.log(`  Version: ${projectData.version}`);
      console.log(`  Status: ${projectData.status}`);
      console.log(`  Created: ${projectData.createdAt?.toDate() || 'N/A'}`);
      console.log(`  Features: ${projectData.features?.length || 0} features`);
    }
    
    if (intelligenceDoc.exists) {
      const intelligenceData = intelligenceDoc.data();
      console.log('\n🧠 Intelligence System:');
      console.log(`  Firebase: ${intelligenceData.data?.firebase || 'unknown'}`);
      console.log(`  GCS: ${intelligenceData.data?.gcs || 'unknown'}`);
      console.log(`  GitHub: ${intelligenceData.data?.github || 'unknown'}`);
      console.log(`  Dashboard: ${intelligenceData.data?.dashboard || 'unknown'}`);
      console.log(`  Intelligence: ${intelligenceData.data?.intelligence || 'unknown'}`);
    }
    
    if (monitoringDoc.exists) {
      const monitoringData = monitoringDoc.data();
      console.log('\n📈 System Health:');
      console.log(`  Status: ${monitoringData.status || 'unknown'}`);
      console.log(`  Services: ${Object.keys(monitoringData.services || {}).length} services`);
      console.log(`  Metrics: ${Object.keys(monitoringData.metrics || {}).length} metrics`);
    }
    
    // Check local file structure
    console.log('\n📂 Local File Structure:');
    const directories = ['CORE', 'INTELLIGENCE', 'TOOLS', 'DOCS', 'TEMPLATES', 'PROJECTS'];
    directories.forEach(dir => {
      const exists = fs.existsSync(dir);
      const fileCount = exists ? fs.readdirSync(dir).length : 0;
      console.log(`  ${dir}/: ${exists ? `${fileCount} files` : 'not found'}`);
    });
    
    // Check configuration files
    console.log('\n⚙️ Configuration Files:');
    const configFiles = [
      'package.json',
      'firebase.json',
      '.firebaserc',
      'firestore.rules',
      'firestore.indexes.json',
      '.env'
    ];
    
    configFiles.forEach(file => {
      const exists = fs.existsSync(file);
      console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
    });
    
    // Check GCS bucket
    console.log('\n📦 GCS Bucket Status:');
    try {
      const { execSync } = require('child_process');
      const bucketList = execSync('gsutil ls gs://repoclone-storage/', { encoding: 'utf8' });
      const fileCount = bucketList.split('\n').filter(line => line.trim()).length;
      console.log(`  repoclone-storage: ${fileCount} files`);
      console.log('  Status: ✅ Accessible');
    } catch (error) {
      console.log('  Status: ❌ Not accessible');
    }
    
    console.log('\n🎉 RepoClone Setup Complete!');
    console.log('\n🔗 Access Points:');
    console.log(`  Firebase Console: https://console.firebase.google.com/project/dangpt-4777e`);
    console.log(`  Firestore Database: https://console.firebase.google.com/project/dangpt-4777e/firestore`);
    console.log(`  GCS Console: https://console.cloud.google.com/storage/browser/repoclone-storage`);
    console.log(`  GitHub Repo: https://github.com/danielyoung/RepoClone`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Update GitHub token in .env for repo management');
    console.log('2. Deploy dashboard: firebase deploy --only hosting');
    console.log('3. Set up GitHub Actions for CI/CD');
    console.log('4. Configure domain and SSL certificates');
    
  } catch (error) {
    console.error('❌ Failed to generate summary:', error.message);
  }
}

showProjectSummary(); 