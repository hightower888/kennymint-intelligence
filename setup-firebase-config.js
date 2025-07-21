#!/usr/bin/env node

/**
 * Firebase, GCS, and GitHub Configuration Setup
 * Sets up the complete infrastructure for RepoClone intelligence system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up RepoClone Intelligence Infrastructure...\n');

// Create .env file with proper configuration
const envContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=repoclone-intelligence
FIREBASE_CLIENT_EMAIL=service-account-repoclone@repoclone-intelligence.iam.gserviceaccount.com
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
GCS_BUCKET_NAME=repoclone-intelligence-storage
GCS_PROJECT_ID=repoclone-intelligence

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
  console.log('✅ Created .env file with Firebase, GCS, and GitHub configuration');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
}

// Initialize git repository if not already initialized
if (!fs.existsSync('.git')) {
  try {
    execSync('git init', { stdio: 'inherit' });
    console.log('✅ Initialized git repository');
    
    // Add all files
    execSync('git add .', { stdio: 'inherit' });
    console.log('✅ Added all files to git');
    
    // Initial commit
    execSync('git commit -m "Initial commit: RepoClone Intelligence System"', { stdio: 'inherit' });
    console.log('✅ Created initial commit');
    
  } catch (error) {
    console.error('❌ Failed to initialize git repository:', error.message);
  }
} else {
  console.log('✅ Git repository already initialized');
}

// Create Firebase configuration
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
  console.log('✅ Created firebase.json configuration');
} catch (error) {
  console.error('❌ Failed to create firebase.json:', error.message);
}

// Create Firestore rules
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users under any document
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`;

try {
  fs.writeFileSync('firestore.rules', firestoreRules);
  console.log('✅ Created Firestore security rules');
} catch (error) {
  console.error('❌ Failed to create firestore.rules:', error.message);
}

// Create storage rules
const storageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
`;

try {
  fs.writeFileSync('storage.rules', storageRules);
  console.log('✅ Created Storage security rules');
} catch (error) {
  console.error('❌ Failed to create storage.rules:', error.message);
}

// Create Firestore indexes
const firestoreIndexes = {
  "indexes": [
    {
      "collectionGroup": "activity_log",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
};

try {
  fs.writeFileSync('firestore.indexes.json', JSON.stringify(firestoreIndexes, null, 2));
  console.log('✅ Created Firestore indexes configuration');
} catch (error) {
  console.error('❌ Failed to create firestore.indexes.json:', error.message);
}

console.log('\n🎉 Setup complete! Next steps:');
console.log('1. Update the GITHUB_TOKEN in .env with your actual GitHub token');
console.log('2. Run: firebase login');
console.log('3. Run: firebase init (select Firestore, Storage, Hosting)');
console.log('4. Run: firebase deploy');
console.log('5. Run: npm run web (to start the dashboard)'); 