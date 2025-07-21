#!/usr/bin/env node

/**
 * Update Firebase Configuration for RepoClone Project
 * Updates configuration with the correct Firebase project details
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Updating RepoClone Firebase Configuration...\n');

// Create updated .env file with correct Firebase project
const envContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=dan-gpt-460014
FIREBASE_CLIENT_EMAIL=service-account-repoclone@dan-gpt-460014.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
T1aFv8yLzD1WBeld8u2fXmRtm1cTvtCjSlVH/yl4tAeWiQ5Q9TDWvMe8BFxnwwIl
2dJRrwKuEQXajSlnyR0BReWSYJpemfuK2FGvGJzVdLveP6BW82BjYyWk3ytK3tJf
S6N3aC7gdQZX6f7jPGyf3g/7GjL50C7d6dBJ2dlOMW6J7jLFbB1dn1f29OiL6S6i
9qFXwQlcy7JsRSo3CQ5lqoGDlLx5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
-----END PRIVATE KEY-----"

# GCS Configuration
GCS_BUCKET_NAME=repoclone-storage
GCS_PROJECT_ID=dan-gpt-460014

# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_REPO=danielyoung/RepoClone

# Server Configuration
PORT=3000

# Additional Configuration
NODE_ENV=development
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Updated .env file with correct Firebase project configuration');
} catch (error) {
  console.error('❌ Failed to update .env file:', error.message);
}

// Update Firebase configuration
const firebaseConfig = {
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
};

try {
  fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
  console.log('✅ Updated firebase.json configuration');
} catch (error) {
  console.error('❌ Failed to update firebase.json:', error.message);
}

// Create .firebaserc file with correct project
const firebaserc = {
  "projects": {
    "default": "dan-gpt-460014"
  }
};

try {
  fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
  console.log('✅ Created .firebaserc with correct project ID');
} catch (error) {
  console.error('❌ Failed to create .firebaserc:', error.message);
}

console.log('\n🎉 Firebase configuration updated!');
console.log('Project Details:');
console.log('  - Project Name: repoclone');
console.log('  - Project ID: dan-gpt-460014');
console.log('  - Project Number: 130600555571');
console.log('\nNext steps:');
console.log('1. Update the GITHUB_TOKEN in .env with your actual GitHub token');
console.log('2. Run: firebase login');
console.log('3. Run: firebase init (select Firestore, Storage, Hosting)');
console.log('4. Run: firebase deploy');
console.log('5. Run: npm run web (to start the dashboard)'); 