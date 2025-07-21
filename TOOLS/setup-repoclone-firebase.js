#!/usr/bin/env node

/**
 * RepoClone Firebase & GCS Setup
 * Sets up Firebase and GCS for storing the current project data and intelligence
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up RepoClone Firebase & GCS for Project Data...\n');

// Create proper .env file without hardcoded keys
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
  console.log('✅ Created .env file (update with your actual GitHub token)');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
}

// Create Firebase configuration for project data
const firebaseConfig = {
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions"
  }
};

try {
  fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
  console.log('✅ Created firebase.json for project data storage');
} catch (error) {
  console.error('❌ Failed to create firebase.json:', error.message);
}

// Create .firebaserc with correct project
const firebaserc = {
  "projects": {
    "default": "dan-gpt-460014"
  }
};

try {
  fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
  console.log('✅ Created .firebaserc with project ID');
} catch (error) {
  console.error('❌ Failed to create .firebaserc:', error.message);
}

// Create Firestore rules for project data
const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Project data collections
    match /projects/{projectId} {
      allow read, write: if true;
    }
    
    // Intelligence data collections
    match /intelligence/{docId} {
      allow read, write: if true;
    }
    
    // Template data collections
    match /templates/{templateId} {
      allow read, write: if true;
    }
    
    // Deployment data collections
    match /deployments/{deploymentId} {
      allow read, write: if true;
    }
    
    // Asset data collections
    match /assets/{assetId} {
      allow read, write: if true;
    }
  }
}`;

try {
  fs.writeFileSync('firestore.rules', firestoreRules);
  console.log('✅ Created Firestore rules for project data');
} catch (error) {
  console.error('❌ Failed to create firestore.rules:', error.message);
}

// Create Firestore indexes for project data
const firestoreIndexes = {
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "intelligence",
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
    },
    {
      "collectionGroup": "deployments",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "deployedAt",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
};

try {
  fs.writeFileSync('firestore.indexes.json', JSON.stringify(firestoreIndexes, null, 2));
  console.log('✅ Created Firestore indexes for project data');
} catch (error) {
  console.error('❌ Failed to create firestore.indexes.json:', error.message);
}

// Create storage rules
const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Project files
    match /projects/{projectId}/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Intelligence data
    match /intelligence/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Templates
    match /templates/{templateId}/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Assets
    match /assets/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Backups
    match /backups/{allPaths=**} {
      allow read, write: if true;
    }
  }
}`;

try {
  fs.writeFileSync('storage.rules', storageRules);
  console.log('✅ Created Storage rules for project data');
} catch (error) {
  console.error('❌ Failed to create storage.rules:', error.message);
}

// Create project data manager
const projectDataManager = `/**
 * Project Data Manager for RepoClone
 * Manages Firebase and GCS storage for project data
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

class ProjectDataManager {
  constructor() {
    this.initializeFirebase();
    this.initializeGCS();
  }

  initializeFirebase() {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      this.db = admin.firestore();
      console.log('✅ Firebase initialized for project data');
    } catch (error) {
      console.warn('⚠️  Firebase not configured:', error.message);
      this.db = null;
    }
  }

  initializeGCS() {
    try {
      this.storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID
      });
      this.bucket = this.storage.bucket(process.env.GCS_BUCKET_NAME);
      console.log('✅ GCS initialized for project data');
    } catch (error) {
      console.warn('⚠️  GCS not configured:', error.message);
      this.storage = null;
      this.bucket = null;
    }
  }

  // Store project data
  async storeProjectData(projectId, data) {
    if (!this.db) return null;
    
    try {
      await this.db.collection('projects').doc(projectId).set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to store project data:', error.message);
      return false;
    }
  }

  // Store intelligence data
  async storeIntelligenceData(data) {
    if (!this.db) return null;
    
    try {
      await this.db.collection('intelligence').add({
        ...data,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to store intelligence data:', error.message);
      return false;
    }
  }

  // Upload project files to GCS
  async uploadProjectFiles(projectId, filePath, destination) {
    if (!this.bucket) return null;
    
    try {
      const file = this.bucket.file(\`projects/\${projectId}/\${destination}\`);
      await file.save(fs.readFileSync(filePath));
      return file.publicUrl();
    } catch (error) {
      console.error('❌ Failed to upload project files:', error.message);
      return null;
    }
  }
}

module.exports = ProjectDataManager;`;

try {
  fs.writeFileSync('project-data-manager.js', projectDataManager);
  console.log('✅ Created project data manager');
} catch (error) {
  console.error('❌ Failed to create project data manager:', error.message);
}

console.log('\n🎉 RepoClone Firebase & GCS Setup Complete!');
console.log('\n📊 What we\'re storing:');
console.log('  📁 Projects: Current RepoClone project data');
console.log('  🧠 Intelligence: AI system data and learning');
console.log('  📦 Templates: Project templates (future)');
console.log('  🚀 Deployments: Deployment history');
console.log('  🎨 Assets: Brand assets and guidelines');
console.log('  💾 Backups: Project backups');

console.log('\n🔧 Next Steps:');
console.log('1. Download service account key from Firebase Console');
console.log('2. Save as service-account-key.json in project root');
console.log('3. Update GITHUB_TOKEN in .env with your token');
console.log('4. Run: firebase login');
console.log('5. Run: firebase init (select Firestore, Storage)');
console.log('6. Run: firebase deploy');
console.log('7. Test with: node project-data-manager.js'); 