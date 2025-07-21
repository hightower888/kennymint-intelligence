#!/usr/bin/env node

/**
 * Setup GCS Connection for RepoClone
 * Configures the connection to the working GCS bucket
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔗 Setting up GCS Connection for RepoClone...\n');

// Update .env file with correct GCS configuration
const envContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=dangpt-4777e
FIREBASE_CLIENT_EMAIL=service-account-repoclone@dangpt-4777e.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY will be loaded from service account file

# GCS Configuration
GCS_BUCKET_NAME=repoclone-storage
GCS_PROJECT_ID=dangpt-4777e

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
  console.log('✅ Updated .env file with GCS configuration');
} catch (error) {
  console.error('❌ Failed to update .env file:', error.message);
}

// Update Firebase configuration
const firebaserc = {
  "projects": {
    "default": "dangpt-4777e"
  }
};

try {
  fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
  console.log('✅ Updated .firebaserc with project ID');
} catch (error) {
  console.error('❌ Failed to update .firebaserc:', error.message);
}

// Test GCS connection
console.log('\n🧪 Testing GCS connection...');

try {
  const bucketList = execSync('gsutil ls gs://repoclone-storage/', { encoding: 'utf8' });
  console.log('✅ GCS bucket accessible');
  console.log('📁 Bucket contents:');
  console.log(bucketList);
} catch (error) {
  console.error('❌ GCS connection test failed:', error.message);
}

// Create folder structure in GCS
console.log('\n📁 Creating GCS folder structure...');

const folders = [
  'projects',
  'intelligence', 
  'templates',
  'assets',
  'backups',
  'deployments'
];

folders.forEach(folder => {
  try {
    const testFile = `${folder}/test.txt`;
    fs.writeFileSync(testFile, `Test file for ${folder} folder`);
    execSync(`gsutil cp ${testFile} gs://repoclone-storage/${folder}/`);
    fs.unlinkSync(testFile);
    console.log(`✅ Created ${folder}/ folder`);
  } catch (error) {
    console.error(`❌ Failed to create ${folder}/ folder:`, error.message);
  }
});

console.log('\n🎉 GCS Connection Setup Complete!');
console.log('\n📊 Configuration:');
console.log('  ✅ Project: dangpt-4777e');
console.log('  ✅ Bucket: repoclone-storage');
console.log('  ✅ Folders: projects, intelligence, templates, assets, backups, deployments');

console.log('\n🚀 Next Steps:');
console.log('1. Download service account key for dangpt-4777e project');
console.log('2. Save as service-account-key.json');
console.log('3. Update GITHUB_TOKEN in .env');
console.log('4. Test connection: node TOOLS/test-gcs-connection.js');
console.log('5. Store project data: node TOOLS/store-project-data.js'); 