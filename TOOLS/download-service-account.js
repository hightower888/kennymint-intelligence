#!/usr/bin/env node

/**
 * Download Service Account Key and Test Firebase Connection
 * Helps set up the service account key for Firebase authentication
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔑 Setting up Firebase Service Account...\n');

console.log('📋 Steps to download service account key:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/dan-gpt-460014/settings/serviceaccounts/adminsdk');
console.log('2. Click "Generate new private key"');
console.log('3. Save the JSON file as "service-account-key.json" in this directory');
console.log('4. Run this script again to test the connection');

// Check if service account key exists
if (fs.existsSync('service-account-key.json')) {
  console.log('\n✅ Service account key found!');
  console.log('Testing Firebase connection...');
  
  try {
    // Test Firebase connection
    const testScript = `
      require('dotenv').config();
      const admin = require('firebase-admin');
      
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: 'dan-gpt-460014'
        });
        
        const db = admin.firestore();
        console.log('✅ Firebase connection successful!');
        console.log('✅ Project ID: dan-gpt-460014');
        console.log('✅ Firestore initialized');
        
        // Test a simple operation
        db.collection('test').doc('connection-test').set({
          test: true,
          timestamp: new Date().toISOString()
        }).then(() => {
          console.log('✅ Firestore write test successful!');
          process.exit(0);
        }).catch(error => {
          console.error('❌ Firestore write test failed:', error.message);
          process.exit(1);
        });
        
      } catch (error) {
        console.error('❌ Firebase connection failed:', error.message);
        process.exit(1);
      }
    `;
    
    fs.writeFileSync('test-firebase.js', testScript);
    execSync('node test-firebase.js', { stdio: 'inherit' });
    
    // Clean up test file
    fs.unlinkSync('test-firebase.js');
    
    console.log('\n🎉 Firebase is properly connected!');
    console.log('\n📊 Next Steps:');
    console.log('1. Run: firebase init (select Firestore, Storage)');
    console.log('2. Run: firebase deploy');
    console.log('3. Run: node store-project-data.js');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure service-account-key.json is in the project root');
    console.log('2. Check that the JSON file is valid');
    console.log('3. Verify the project ID is correct');
  }
  
} else {
  console.log('\n⚠️  Service account key not found');
  console.log('\n📥 To download the service account key:');
  console.log('1. Open: https://console.firebase.google.com/project/dan-gpt-460014/settings/serviceaccounts/adminsdk');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the downloaded JSON file as "service-account-key.json"');
  console.log('4. Place it in the project root directory');
  console.log('5. Run this script again');
  
  console.log('\n🔗 Direct link to Firebase Console:');
  console.log('https://console.firebase.google.com/project/dan-gpt-460014/settings/serviceaccounts/adminsdk');
} 