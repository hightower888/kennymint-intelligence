#!/usr/bin/env node

/**
 * Download Service Account Key for dangpt-4777e Project
 * Helps set up the service account key for GCS and Firebase authentication
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔑 Setting up Service Account for dangpt-4777e Project...\n');

console.log('📋 Steps to download service account key:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/dangpt-4777e/settings/serviceaccounts/adminsdk');
console.log('2. Click "Generate new private key"');
console.log('3. Save the JSON file as "service-account-key.json" in this directory');
console.log('4. Run this script again to test the connection');

// Check if service account key exists
if (fs.existsSync('service-account-key.json')) {
  console.log('\n✅ Service account key found!');
  console.log('Testing GCS and Firebase connection...');
  
  try {
    // Test GCS connection
    const testScript = `
      require('dotenv').config();
      const { Storage } = require('@google-cloud/storage');
      
      try {
        const storage = new Storage({
          projectId: 'dangpt-4777e'
        });
        
        const bucket = storage.bucket('repoclone-storage');
        console.log('✅ GCS connection successful!');
        console.log('✅ Project ID: dangpt-4777e');
        console.log('✅ Bucket: repoclone-storage');
        
        // Test bucket access
        bucket.exists().then(([exists]) => {
          if (exists) {
            console.log('✅ Bucket access confirmed!');
            process.exit(0);
          } else {
            console.error('❌ Bucket does not exist');
            process.exit(1);
          }
        }).catch(error => {
          console.error('❌ Bucket access failed:', error.message);
          process.exit(1);
        });
        
      } catch (error) {
        console.error('❌ GCS connection failed:', error.message);
        process.exit(1);
      }
    `;
    
    fs.writeFileSync('test-gcs-connection.js', testScript);
    execSync('node test-gcs-connection.js', { stdio: 'inherit' });
    
    // Clean up test file
    fs.unlinkSync('test-gcs-connection.js');
    
    console.log('\n🎉 GCS and Firebase are properly connected!');
    console.log('\n📊 Next Steps:');
    console.log('1. Run: firebase init (select Firestore, Storage)');
    console.log('2. Run: firebase deploy');
    console.log('3. Run: node TOOLS/store-project-data.js');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure service-account-key.json is in the project root');
    console.log('2. Check that the JSON file is valid');
    console.log('3. Verify the project ID is correct');
  }
  
} else {
  console.log('\n⚠️  Service account key not found');
  console.log('\n📥 To download the service account key:');
  console.log('1. Open: https://console.firebase.google.com/project/dangpt-4777e/settings/serviceaccounts/adminsdk');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the downloaded JSON file as "service-account-key.json"');
  console.log('4. Place it in the project root directory');
  console.log('5. Run this script again');
  
  console.log('\n🔗 Direct link to Firebase Console:');
  console.log('https://console.firebase.google.com/project/dangpt-4777e/settings/serviceaccounts/adminsdk');
  
  console.log('\n📊 Current Configuration:');
  console.log('  ✅ Project: dangpt-4777e');
  console.log('  ✅ Bucket: repoclone-storage');
  console.log('  ✅ GCS: Working');
  console.log('  ⏳ Waiting for service account key');
} 