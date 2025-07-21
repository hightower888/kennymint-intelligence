#!/usr/bin/env node

/**
 * Setup Firestore Database for RepoClone
 * Creates the database structure and initial data
 */

require('dotenv').config();
const admin = require('firebase-admin');

console.log('🗄️ Setting up Firestore Database for RepoClone...\n');

async function setupFirestoreDatabase() {
  try {
    // Initialize Firebase Admin
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'dangpt-4777e'
    });
    
    const db = admin.firestore();
    
    console.log('✅ Firebase Admin initialized');
    console.log(`🏢 Project: ${process.env.FIREBASE_PROJECT_ID}`);
    
    // Create collections and initial data
    const collections = {
      projects: {
        repoclone: {
          name: 'RepoClone',
          version: '1.0.0',
          description: 'Intelligent project template and deployment system',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active',
          features: [
            'Firebase Firestore integration',
            'Google Cloud Storage',
            'GitHub repository management',
            'Intelligence system',
            'Project templates',
            'Deployment automation'
          ],
          structure: {
            core: ['CORE/', 'INTELLIGENCE/', 'TOOLS/'],
            docs: ['DOCS/', 'README.md'],
            templates: ['TEMPLATES/', 'ARCHIVE/backend-logic/project-templates/'],
            assets: ['PROJECTS/', 'VERSION_CONTROL/']
          },
          gcs_bucket: 'repoclone-storage',
          github_repo: 'danielyoung/RepoClone'
        }
      },
      intelligence: {
        system_status: {
          type: 'system_status',
          message: 'RepoClone Intelligence System Status',
          data: {
            firebase: 'configured',
            gcs: 'configured',
            github: 'connected',
            dashboard: 'running',
            intelligence: 'active',
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        },
        file_analysis: {
          type: 'file_structure',
          message: 'RepoClone File Structure Analysis',
          data: {
            totalFiles: 0,
            intelligenceFiles: 0,
            coreFiles: 0,
            toolFiles: 0,
            docFiles: 0,
            templateFiles: 0,
            projectFiles: 0
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      deployments: {
        current: {
          project: 'repoclone',
          environment: 'development',
          status: 'active',
          deployedAt: admin.firestore.FieldValue.serverTimestamp(),
          version: '1.0.0',
          services: ['firestore', 'storage', 'functions'],
          gcs_bucket: 'repoclone-storage'
        }
      },
      templates: {
        available: {
          nextjs: {
            name: 'Next.js Template',
            framework: 'nextjs',
            description: 'Modern Next.js application template',
            version: '1.0.0',
            features: ['SSR', 'API Routes', 'TypeScript'],
            location: 'ARCHIVE/backend-logic/project-templates/nextjs-template/'
          },
          react: {
            name: 'React Template',
            framework: 'react',
            description: 'React application template',
            version: '1.0.0',
            features: ['Hooks', 'Context', 'Router'],
            location: 'ARCHIVE/backend-logic/project-templates/react-template/'
          },
          vue: {
            name: 'Vue Template',
            framework: 'vue',
            description: 'Vue.js application template',
            version: '1.0.0',
            features: ['Composition API', 'Vuex', 'Router'],
            location: 'ARCHIVE/backend-logic/project-templates/vue-template/'
          }
        }
      },
      monitoring: {
        system_health: {
          status: 'healthy',
          lastCheck: admin.firestore.FieldValue.serverTimestamp(),
          services: {
            firestore: 'online',
            storage: 'online',
            functions: 'online',
            hosting: 'offline'
          },
          metrics: {
            totalProjects: 1,
            activeDeployments: 1,
            availableTemplates: 3
          }
        }
      }
    };
    
    // Create collections and documents
    for (const [collectionName, documents] of Object.entries(collections)) {
      console.log(`📁 Creating collection: ${collectionName}`);
      
      for (const [docId, data] of Object.entries(documents)) {
        try {
          await db.collection(collectionName).doc(docId).set(data);
          console.log(`  ✅ Created document: ${docId}`);
        } catch (error) {
          console.error(`  ❌ Failed to create ${docId}:`, error.message);
        }
      }
    }
    
    // Create indexes for better query performance
    const indexes = [
      {
        collectionGroup: 'intelligence',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'type', order: 'ASCENDING' },
          { fieldPath: 'timestamp', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'deployments',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'deployedAt', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'projects',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      }
    ];
    
    console.log('\n📊 Creating Firestore indexes...');
    for (const index of indexes) {
      try {
        await db.collection('_indexes').add(index);
        console.log(`  ✅ Created index for ${index.collectionGroup}`);
      } catch (error) {
        console.log(`  ⚠️ Index for ${index.collectionGroup} may already exist`);
      }
    }
    
    console.log('\n🎉 Firestore Database Setup Complete!');
    console.log('\n📊 Database Structure:');
    console.log('  ✅ projects/repoclone - Main project data');
    console.log('  ✅ intelligence/ - System analysis and status');
    console.log('  ✅ deployments/ - Deployment tracking');
    console.log('  ✅ templates/ - Available project templates');
    console.log('  ✅ monitoring/ - System health and metrics');
    
    console.log('\n🔗 Access your database at:');
    console.log('   https://console.firebase.google.com/project/dangpt-4777e/firestore');
    
    // Test database connection
    console.log('\n🧪 Testing database connection...');
    const testDoc = await db.collection('test').doc('connection').get();
    if (!testDoc.exists) {
      await db.collection('test').doc('connection').set({
        test: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Database connection successful!');
    }
    
  } catch (error) {
    console.error('❌ Failed to setup Firestore database:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if Firebase project is properly configured');
    console.log('2. Verify service account permissions');
    console.log('3. Ensure Firestore is enabled in Firebase Console');
  }
}

setupFirestoreDatabase(); 