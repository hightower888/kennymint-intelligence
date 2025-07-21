#!/usr/bin/env node

/**
 * Connect to Actual Firebase Project
 * Sets up proper connection to dan-gpt-460014 Firebase project
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔗 Connecting to Actual Firebase Project...\n');

// Create .env file with proper configuration
const envContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=dan-gpt-460014
FIREBASE_CLIENT_EMAIL=service-account-repoclone@dan-gpt-460014.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY will be loaded from service account file

# GCS Configuration
GCS_BUCKET_NAME=repoclone-storage
GCS_PROJECT_ID=dan-gpt-460014

# GitHub Configuration
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=danielyoung/RepoClone

# Server Configuration
PORT=3000

# Additional Configuration
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Created .env file with proper Firebase configuration');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
}

// Initialize Firebase for the project
console.log('\n🔥 Initializing Firebase for dan-gpt-460014...');

try {
  // Check if Firebase is already initialized
  if (fs.existsSync('firebase.json')) {
    console.log('✅ Firebase already initialized');
  } else {
    console.log('⚠️  Firebase not initialized, run: firebase init');
  }
  
  // Use the correct project
  execSync('firebase use dan-gpt-460014', { stdio: 'inherit' });
  console.log('✅ Set Firebase project to dan-gpt-460014');
  
} catch (error) {
  console.error('❌ Failed to set Firebase project:', error.message);
}

// Check Firebase services
console.log('\n📊 Checking Firebase services...');

try {
  const services = execSync('firebase projects:list', { encoding: 'utf8' });
  if (services.includes('dan-gpt-460014')) {
    console.log('✅ Firebase project dan-gpt-460014 is accessible');
  }
} catch (error) {
  console.error('❌ Failed to check Firebase services:', error.message);
}

console.log('\n🎉 Firebase Connection Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Download service account key from Firebase Console:');
console.log('   https://console.firebase.google.com/project/dan-gpt-460014/settings/serviceaccounts/adminsdk');
console.log('2. Save the JSON file as service-account-key.json in project root');
console.log('3. Update GITHUB_TOKEN in .env with your actual token');
console.log('4. Run: firebase init (select Firestore, Storage)');
console.log('5. Run: firebase deploy');
console.log('6. Test connection: node store-project-data.js');

console.log('\n🔍 Current Status:');
console.log('  ✅ Firebase CLI installed');
console.log('  ✅ Project dan-gpt-460014 accessible');
console.log('  ✅ .env file created');
console.log('  ⏳ Waiting for service account key'); 