#!/usr/bin/env node

/**
 * Update Environment Configuration
 * Sets up .env file to use application default credentials
 */

const fs = require('fs');

console.log('🔧 Updating environment configuration...\n');

const envContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=dangpt-4777e
FIREBASE_CLIENT_EMAIL=agent-backend@dangpt-4777e.iam.gserviceaccount.com
# Using application default credentials

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
# Using gcloud application default credentials
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Updated .env file with application default credentials');
  console.log('✅ Removed service account key requirement');
  console.log('✅ Using gcloud authentication');
} catch (error) {
  console.error('❌ Failed to update .env file:', error.message);
}

console.log('\n🧪 Testing GCS connection with new configuration...');

// Test GCS connection directly
const testScript = `
  const { Storage } = require('@google-cloud/storage');
  
  async function testConnection() {
    try {
      const storage = new Storage({
        projectId: 'dangpt-4777e'
      });
      
      const bucket = storage.bucket('repoclone-storage');
      const [exists] = await bucket.exists();
      
      if (exists) {
        console.log('✅ GCS connection successful!');
        console.log('✅ Using application default credentials');
        console.log('✅ Bucket access confirmed');
        
        const [files] = await bucket.getFiles();
        console.log(\`📁 Found \${files.length} files in bucket\`);
        
        process.exit(0);
      } else {
        console.error('❌ Bucket does not exist');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ GCS connection failed:', error.message);
      process.exit(1);
    }
  }
  
  testConnection();
`;

try {
  fs.writeFileSync('temp-test.js', testScript);
  const { execSync } = require('child_process');
  execSync('node temp-test.js', { stdio: 'inherit' });
  fs.unlinkSync('temp-test.js');
  
  console.log('\n🎉 Configuration updated successfully!');
  console.log('\n📊 Status:');
  console.log('  ✅ .env file updated');
  console.log('  ✅ GCS connection working');
  console.log('  ✅ Using application default credentials');
  console.log('  ✅ No service account key required');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  if (fs.existsSync('temp-test.js')) {
    fs.unlinkSync('temp-test.js');
  }
} 