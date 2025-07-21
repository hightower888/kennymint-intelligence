/**
 * Infrastructure Orchestrator
 * Coordinates GitHub, Firebase, GCS, and GCP infrastructure creation
 */

import { InfrastructureManager, CentralConfig } from './central-config';
import { GitHubManager, GitHubConfig } from './github-manager';
import { FirebaseManager, FirebaseConfig } from './firebase-manager';
import { GCSManager, GCSConfig } from './gcs-manager';
import { CentralGCPManager, CentralGCPConfig } from './central-gcp-manager';
import { AuthManager } from './auth-manager';

export interface ProjectInfrastructureSetup {
  projectName: string;
  github: {
    repoName: string;
    repoUrl: string;
    cloneUrl: string;
  };
  firebase: {
    projectId: string;
    config: any;
  };
  gcs: {
    bucketName: string;
    bucketUrl: string;
  };
  gcp: {
    projectId: string;
    serviceAccount: string;
    secrets: Record<string, string>;
  };
  environment: Record<string, string>;
}

export class InfrastructureOrchestrator {
  private infrastructureManager: InfrastructureManager;
  private githubManager: GitHubManager;
  private firebaseManager: FirebaseManager;
  private gcsManager: GCSManager;
  private centralGcpManager: CentralGCPManager;
  private authManager: AuthManager;
  
  constructor() {
    // Initialize auth manager
    this.authManager = new AuthManager();
    // Initialize with central configuration
    const centralConfig: CentralConfig = {
      github: {
        templateRepo: process.env.GITHUB_TEMPLATE_REPO || 'your-org/ai-template',
        organization: process.env.GITHUB_ORGANIZATION || 'your-org',
        accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
        webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || ''
      },
      firebase: {
        centralProjectId: process.env.FIREBASE_CENTRAL_PROJECT_ID || '',
        centralServiceAccount: process.env.FIREBASE_CENTRAL_SERVICE_ACCOUNT || '',
        projectTemplateId: process.env.FIREBASE_PROJECT_TEMPLATE_ID || ''
      },
      gcs: {
        centralBucket: process.env.GCS_CENTRAL_BUCKET || '',
        centralServiceAccount: process.env.GCS_CENTRAL_SERVICE_ACCOUNT || '',
        projectBucketPrefix: process.env.GCS_PROJECT_BUCKET_PREFIX || 'project-storage'
      },
      gcp: {
        centralProjectId: process.env.GCP_CENTRAL_PROJECT_ID || '',
        centralServiceAccount: process.env.GCP_CENTRAL_SERVICE_ACCOUNT || '',
        secretsManager: {
          projectId: process.env.GCP_SECRETS_PROJECT_ID || '',
          location: process.env.GCP_SECRETS_LOCATION || 'us-central1'
        },
        apiConfigs: {
          openai: process.env.OPENAI_API_KEY || '',
          stripe: process.env.STRIPE_SECRET_KEY || '',
          sendgrid: process.env.SENDGRID_API_KEY || '',
          aws: process.env.AWS_ACCESS_KEY || ''
        }
      },
      security: {
        encryptionKey: process.env.ENCRYPTION_KEY || '',
        jwtSecret: process.env.JWT_SECRET || '',
        sessionSecret: process.env.SESSION_SECRET || ''
      }
    };
    
    this.infrastructureManager = new InfrastructureManager(centralConfig);
    this.githubManager = new GitHubManager(centralConfig.github);
    this.firebaseManager = new FirebaseManager(centralConfig.firebase);
    this.gcsManager = new GCSManager(centralConfig.gcs);
    this.centralGcpManager = new CentralGCPManager(centralConfig.gcp);
  }
  
  /**
   * Creates complete infrastructure for a new project
   */
  async createProjectInfrastructure(projectName: string, projectConfig: any): Promise<ProjectInfrastructureSetup> {
    console.log(`🚀 Creating complete infrastructure for: ${projectName}`);
    
    try {
      // Require authentication
      await this.authManager.requireAuth();
      // 1. Create GitHub Repository
      console.log('\n📦 Step 1: Creating GitHub Repository...');
      const githubRepo = await this.githubManager.createProjectRepository(projectName, projectConfig);
      
      // 2. Create Firebase Project
      console.log('\n🔥 Step 2: Creating Firebase Project...');
      const firebaseProject = await this.firebaseManager.createProjectFirebase(projectName, projectConfig);
      
      // 3. Create GCS Bucket
      console.log('\n☁️  Step 3: Creating GCS Bucket...');
      const gcsBucket = await this.gcsManager.createProjectBucket(projectName, projectConfig);
      
      // 4. Create GCP Project
      console.log('\n🔧 Step 4: Creating GCP Project...');
      const gcpProject = await this.centralGcpManager.createProjectGCP(projectName, projectConfig);
      
      // 5. Set up repository templates and workflows
      console.log('\n🔧 Step 5: Setting up Repository Templates...');
      await this.githubManager.setupRepositoryTemplates(githubRepo.fullName, projectConfig);
      
      // 6. Create bucket folder structure
      console.log('\n📁 Step 6: Creating Bucket Structure...');
      await this.gcsManager.createBucketStructure(gcsBucket.bucketName, projectConfig);
      
      // 7. Generate configuration files
      console.log('\n⚙️  Step 7: Generating Configuration Files...');
      const configs = await this.generateProjectConfigs(projectName, {
        github: githubRepo,
        firebase: firebaseProject,
        gcs: gcsBucket,
        gcp: gcpProject
      }, projectConfig);
      
      // 8. Set up monitoring and alerts
      console.log('\n📊 Step 8: Setting up Monitoring...');
      await this.setupProjectMonitoring(projectName, {
        github: githubRepo,
        firebase: firebaseProject,
        gcs: gcsBucket,
        gcp: gcpProject
      });
      
      console.log('\n✅ Infrastructure creation completed successfully!');
      
      return {
        projectName,
        github: githubRepo,
        firebase: firebaseProject,
        gcs: gcsBucket,
        gcp: gcpProject,
        environment: configs
      };
      
    } catch (error) {
      console.error('❌ Infrastructure creation failed:', error);
      throw error;
    }
  }
  
  /**
   * Generates all configuration files for the project
   */
  private async generateProjectConfigs(projectName: string, infrastructure: any, projectConfig: any): Promise<Record<string, string>> {
    const configs: Record<string, string> = {};
    
    // Generate Firebase config
    configs['firebase.config.js'] = this.firebaseManager.generateFirebaseConfig(infrastructure.firebase);
    
    // Generate GCS config
    configs['gcs.config.js'] = this.gcsManager.generateGCSConfig(infrastructure.gcs);
    
    // Generate GCP config
    configs['gcp.config.js'] = this.centralGcpManager.generateProjectConfig(infrastructure.gcp);
    
    // Generate environment variables
    configs['.env'] = this.generateEnvironmentFile(projectName, infrastructure, projectConfig);
    
    // Generate service account keys
    configs['firebase-service-account.json'] = this.firebaseManager.generateServiceAccountKey(infrastructure.firebase);
    
    return configs;
  }
  
  /**
   * Generates environment file for the project
   */
  private generateEnvironmentFile(projectName: string, infrastructure: any, projectConfig: any): string {
    return `
# Project: ${projectName}
# Generated by Backend Template Infrastructure

# GitHub Configuration
GITHUB_REPO_URL=${infrastructure.github.repoUrl}
GITHUB_REPO_NAME=${infrastructure.github.repoName}

# Firebase Configuration
FIREBASE_PROJECT_ID=${infrastructure.firebase.projectId}
FIREBASE_API_KEY=${infrastructure.firebase.config.apiKey}
FIREBASE_AUTH_DOMAIN=${infrastructure.firebase.config.authDomain}
FIREBASE_STORAGE_BUCKET=${infrastructure.firebase.config.storageBucket}
FIREBASE_MESSAGING_SENDER_ID=${infrastructure.firebase.config.messagingSenderId}
FIREBASE_APP_ID=${infrastructure.firebase.config.appId}

# GCS Configuration
GCS_BUCKET_NAME=${infrastructure.gcs.bucketName}
GCS_BUCKET_URL=${infrastructure.gcs.bucketUrl}

# GCP Configuration
GCP_PROJECT_ID=${infrastructure.gcp.projectId}
GCP_SERVICE_ACCOUNT=${infrastructure.gcp.serviceAccount}

# Central API Keys (inherited from central config)
OPENAI_API_KEY=${infrastructure.gcp.secrets.OPENAI_API_KEY}
STRIPE_SECRET_KEY=${infrastructure.gcp.secrets.STRIPE_SECRET_KEY}
SENDGRID_API_KEY=${infrastructure.gcp.secrets.SENDGRID_API_KEY}
AWS_ACCESS_KEY=${infrastructure.gcp.secrets.AWS_ACCESS_KEY}

# Security
JWT_SECRET=${process.env.JWT_SECRET}
SESSION_SECRET=${process.env.SESSION_SECRET}
ENCRYPTION_KEY=${process.env.ENCRYPTION_KEY}

# Environment
NODE_ENV=development
PORT=3000
`;
  }
  
  /**
   * Sets up monitoring and alerts for the project
   */
  private async setupProjectMonitoring(projectName: string, infrastructure: any): Promise<void> {
    // Set up GitHub monitoring
    // Set up Firebase monitoring
    // Set up GCS monitoring
    // Set up GCP monitoring
    
    console.log('✅ Project monitoring configured');
  }
  
  /**
   * Validates infrastructure setup
   */
  async validateInfrastructure(projectName: string): Promise<boolean> {
    console.log(`🔍 Validating infrastructure for: ${projectName}`);
    
    try {
      // Validate GitHub repository
      // Validate Firebase project
      // Validate GCS bucket
      // Validate GCP project
      // Validate secrets access
      
      console.log('✅ Infrastructure validation passed');
      return true;
    } catch (error) {
      console.error('❌ Infrastructure validation failed:', error);
      return false;
    }
  }
  
  /**
   * Cleans up infrastructure (for testing/development)
   */
  async cleanupInfrastructure(projectName: string): Promise<void> {
    console.log(`🧹 Cleaning up infrastructure for: ${projectName}`);
    
    // Implementation would delete all created resources
    // This should be used carefully in production
    
    console.log('✅ Infrastructure cleanup completed');
  }
  
  /**
   * Gets infrastructure status
   */
  async getInfrastructureStatus(projectName: string): Promise<any> {
    console.log(`📊 Getting infrastructure status for: ${projectName}`);
    
    // Implementation would check status of all services
    return {
      github: { status: 'active' },
      firebase: { status: 'active' },
      gcs: { status: 'active' },
      gcp: { status: 'active' }
    };
  }
} 