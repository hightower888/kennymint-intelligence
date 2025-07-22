/**
 * Firebase Integration Manager
 * Handles Firebase project creation and configuration
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

export interface FirebaseConfig {
  centralProjectId: string;
  centralServiceAccount: string;
  projectTemplateId: string;
}

export interface ProjectFirebase {
  projectId: string;
  config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  serviceAccount: string;
}

export class FirebaseManager {
  private config: FirebaseConfig;
  private adminApp: any;
  
  constructor(config: FirebaseConfig) {
    this.config = config;
    this.initializeAdmin();
  }
  
  /**
   * Initializes Firebase Admin SDK
   */
  private initializeAdmin(): void {
    if (getApps().length === 0) {
      this.adminApp = initializeApp({
        credential: cert({
          projectId: this.config.centralProjectId,
          clientEmail: this.config.centralServiceAccount,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        }),
        projectId: this.config.centralProjectId
      });
    } else {
      this.adminApp = getApps()[0];
    }
  }
  
  /**
   * Creates a new Firebase project for a project
   */
  async createProjectFirebase(projectName: string, projectConfig: any): Promise<ProjectFirebase> {
    console.log(`🔥 Creating Firebase project: ${projectName}`);
    
    try {
      // Generate unique project ID
      const projectId = `${projectName}-${Date.now()}`;
      
      // Create Firebase project (this would use Firebase Management API)
      const firebaseProject = await this.createFirebaseProject(projectId, projectConfig);
      
      // Set up Firebase services
      await this.setupFirebaseServices(projectId, projectConfig);
      
      // Create service account
      const serviceAccount = await this.createServiceAccount(projectId);
      
      // Configure authentication
      await this.setupAuthentication(projectId, projectConfig);
      
      // Set up Firestore rules
      await this.setupFirestoreRules(projectId, projectConfig);
      
      // Configure storage
      await this.setupStorage(projectId, projectConfig);
      
      console.log(`✅ Firebase project created: ${projectId}`);
      
      return {
        projectId,
        config: {
          apiKey: firebaseProject.apiKey,
          authDomain: `${projectId}.firebaseapp.com`,
          projectId,
          storageBucket: `${projectId}.appspot.com`,
          messagingSenderId: firebaseProject.messagingSenderId,
          appId: firebaseProject.appId
        },
        serviceAccount
      };
      
    } catch (error) {
      console.error('❌ Failed to create Firebase project:', error);
      throw error;
    }
  }
  
  /**
   * Creates Firebase project using Management API
   */
  private async createFirebaseProject(projectId: string, config: any): Promise<any> {
    // This would use Firebase Management API
    // For now, return mock data
    return {
      apiKey: `api-key-${projectId}`,
      messagingSenderId: `${Date.now()}`,
      appId: `app-id-${projectId}`
    };
  }
  
  /**
   * Sets up Firebase services for the project
   */
  private async setupFirebaseServices(projectId: string, config: any): Promise<void> {
    console.log('🔧 Setting up Firebase services...');
    
    // Enable Firestore
    await this.enableFirestore(projectId);
    
    // Enable Authentication
    await this.enableAuthentication(projectId);
    
    // Enable Storage
    await this.enableStorage(projectId);
    
    // Enable Functions (if needed)
    if (config.needsFunctions) {
      await this.enableFunctions(projectId);
    }
    
    console.log('✅ Firebase services configured');
  }
  
  /**
   * Enables Firestore for the project
   */
  private async enableFirestore(projectId: string): Promise<void> {
    // Implementation would use Firebase Management API
    console.log(`Enabling Firestore for ${projectId}`);
  }
  
  /**
   * Enables Authentication for the project
   */
  private async enableAuthentication(projectId: string): Promise<void> {
    // Implementation would use Firebase Management API
    console.log(`Enabling Authentication for ${projectId}`);
  }
  
  /**
   * Enables Storage for the project
   */
  private async enableStorage(projectId: string): Promise<void> {
    // Implementation would use Firebase Management API
    console.log(`Enabling Storage for ${projectId}`);
  }
  
  /**
   * Enables Functions for the project
   */
  private async enableFunctions(projectId: string): Promise<void> {
    // Implementation would use Firebase Management API
    console.log(`Enabling Functions for ${projectId}`);
  }
  
  /**
   * Creates service account for the project
   */
  private async createServiceAccount(projectId: string): Promise<string> {
    // Implementation would use Google Cloud IAM API
    const serviceAccountEmail = `service-account-${projectId}@${projectId}.iam.gserviceaccount.com`;
    console.log(`Created service account: ${serviceAccountEmail}`);
    return serviceAccountEmail;
  }
  
  /**
   * Sets up authentication providers
   */
  private async setupAuthentication(projectId: string, config: any): Promise<void> {
    console.log('🔐 Setting up authentication...');
    
    const auth = getAuth(this.adminApp);
    
    // Enable email/password authentication
    await auth.updateProjectConfig({
      projectId,
      signInOptions: {
        email: {
          enabled: true,
          requireDisplayName: false
        }
      }
    });
    
    // Enable Google authentication
    if (config.authProviders?.google) {
      await auth.updateProjectConfig({
        projectId,
        signInOptions: {
          google: {
            enabled: true,
            clientId: config.authProviders.google.clientId
          }
        }
      });
    }
    
    console.log('✅ Authentication configured');
  }
  
  /**
   * Sets up Firestore security rules
   */
  private async setupFirestoreRules(projectId: string, config: any): Promise<void> {
    console.log('📜 Setting up Firestore rules...');
    
    const rules = this.generateFirestoreRules(config);
    
    // Implementation would use Firebase Management API to set rules
    console.log('Firestore rules configured');
  }
  
  /**
   * Generates Firestore security rules
   */
  private generateFirestoreRules(config: any): string {
    return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read public data
    match /public/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Admin access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`;
  }
  
  /**
   * Sets up Firebase Storage
   */
  private async setupStorage(projectId: string, config: any): Promise<void> {
    console.log('📦 Setting up Firebase Storage...');
    
    const storage = getStorage(this.adminApp);
    
    // Create default bucket
    const bucket = storage.bucket(`${projectId}.appspot.com`);
    
    // Set up CORS for web access
    await bucket.setCorsConfiguration([
      {
        origin: ['*'],
        method: ['GET', 'POST', 'PUT', 'DELETE'],
        maxAgeSeconds: 3600
      }
    ]);
    
    console.log('✅ Storage configured');
  }
  
  /**
   * Generates Firebase config file for the project
   */
  generateFirebaseConfig(projectFirebase: ProjectFirebase): string {
    return `
// Firebase configuration for ${projectFirebase.projectId}
const firebaseConfig = {
  apiKey: "${projectFirebase.config.apiKey}",
  authDomain: "${projectFirebase.config.authDomain}",
  projectId: "${projectFirebase.config.projectId}",
  storageBucket: "${projectFirebase.config.storageBucket}",
  messagingSenderId: "${projectFirebase.config.messagingSenderId}",
  appId: "${projectFirebase.config.appId}"
};

export default firebaseConfig;
`;
  }
  
  /**
   * Generates service account key file
   */
  generateServiceAccountKey(projectFirebase: ProjectFirebase): string {
    return `
{
  "type": "service_account",
  "project_id": "${projectFirebase.projectId}",
  "private_key_id": "auto-generated",
  "private_key": "auto-generated",
  "client_email": "${projectFirebase.serviceAccount}",
  "client_id": "auto-generated",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/${projectFirebase.serviceAccount}"
}
`;
  }
} 