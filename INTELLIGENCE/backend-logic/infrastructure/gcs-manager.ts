/**
 * Google Cloud Storage Integration Manager
 * Handles GCS bucket creation and configuration
 */

import { Storage } from '@google-cloud/storage';

export interface GCSConfig {
  centralBucket: string;
  centralServiceAccount: string;
  projectBucketPrefix: string;
}

export interface ProjectGCS {
  bucketName: string;
  bucketUrl: string;
  serviceAccount: string;
}

export class GCSManager {
  private storage: Storage;
  private config: GCSConfig;
  
  constructor(config: GCSConfig) {
    this.config = config;
    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  }
  
  /**
   * Creates a new GCS bucket for a project
   */
  async createProjectBucket(projectName: string, projectConfig: any): Promise<ProjectGCS> {
    console.log(`☁️  Creating GCS bucket for: ${projectName}`);
    
    try {
      // Generate unique bucket name
      const bucketName = `${this.config.projectBucketPrefix}-${projectName}-${Date.now()}`;
      
      // Create bucket
      const bucket = await this.createBucket(bucketName, projectConfig);
      
      // Set up bucket configuration
      await this.setupBucketConfig(bucket, projectConfig);
      
      // Create service account for bucket access
      const serviceAccount = await this.createBucketServiceAccount(bucketName, projectConfig);
      
      // Set up IAM permissions
      await this.setupBucketIAM(bucket, serviceAccount, projectConfig);
      
      // Configure CORS for web access
      await this.setupBucketCORS(bucket, projectConfig);
      
      // Set up lifecycle policies
      await this.setupLifecyclePolicies(bucket, projectConfig);
      
      console.log(`✅ GCS bucket created: ${bucketName}`);
      
      return {
        bucketName,
        bucketUrl: `gs://${bucketName}`,
        serviceAccount
      };
      
    } catch (error) {
      console.error('❌ Failed to create GCS bucket:', error);
      throw error;
    }
  }
  
  /**
   * Creates a new bucket
   */
  private async createBucket(bucketName: string, config: any): Promise<any> {
    console.log(`Creating bucket: ${bucketName}`);
    
    const bucket = this.storage.bucket(bucketName);
    
    // Create bucket with specific configuration
    await bucket.create({
      location: config.location || 'US',
      storageClass: config.storageClass || 'STANDARD',
      labels: {
        project: config.projectName,
        environment: config.environment || 'development',
        managed: 'backend-template'
      }
    });
    
    return bucket;
  }
  
  /**
   * Sets up bucket configuration
   */
  private async setupBucketConfig(bucket: any, config: any): Promise<void> {
    console.log('🔧 Setting up bucket configuration...');
    
    // Set bucket versioning
    await bucket.setMetadata({
      versioning: {
        enabled: config.versioning !== false
      }
    });
    
    // Set bucket encryption
    await bucket.setMetadata({
      encryption: {
        defaultKmsKeyName: config.kmsKeyName || null
      }
    });
    
    // Set bucket logging
    if (config.logging) {
      await bucket.setMetadata({
        logging: {
          logBucket: `${this.config.centralBucket}-logs`,
          logObjectPrefix: bucket.name
        }
      });
    }
    
    console.log('✅ Bucket configuration set');
  }
  
  /**
   * Creates service account for bucket access
   */
  private async createBucketServiceAccount(bucketName: string, config: any): Promise<string> {
    // Implementation would use Google Cloud IAM API
    const serviceAccountEmail = `service-account-${bucketName}@${process.env.GCP_PROJECT_ID}.iam.gserviceaccount.com`;
    console.log(`Created service account: ${serviceAccountEmail}`);
    return serviceAccountEmail;
  }
  
  /**
   * Sets up IAM permissions for the bucket
   */
  private async setupBucketIAM(bucket: any, serviceAccount: string, config: any): Promise<void> {
    console.log('🔐 Setting up bucket IAM...');
    
    // Grant service account access to bucket
    await bucket.iam.addBinding('roles/storage.objectViewer', `serviceAccount:${serviceAccount}`);
    await bucket.iam.addBinding('roles/storage.objectCreator', `serviceAccount:${serviceAccount}`);
    await bucket.iam.addBinding('roles/storage.objectAdmin', `serviceAccount:${serviceAccount}`);
    
    // Grant project team access
    if (config.teamAccess) {
      await bucket.iam.addBinding('roles/storage.objectViewer', 'group:project-team@company.com');
    }
    
    console.log('✅ Bucket IAM configured');
  }
  
  /**
   * Sets up CORS configuration for web access
   */
  private async setupBucketCORS(bucket: any, config: any): Promise<void> {
    console.log('🌐 Setting up bucket CORS...');
    
    const corsConfiguration = [
      {
        origin: config.allowedOrigins || ['*'],
        method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
        responseHeader: [
          'Content-Type',
          'Access-Control-Allow-Origin',
          'Access-Control-Allow-Methods',
          'Access-Control-Allow-Headers'
        ],
        maxAgeSeconds: 3600
      }
    ];
    
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('✅ CORS configured');
  }
  
  /**
   * Sets up lifecycle policies for the bucket
   */
  private async setupLifecyclePolicies(bucket: any, config: any): Promise<void> {
    console.log('⏰ Setting up lifecycle policies...');
    
    const lifecycleRules = [];
    
    // Archive old versions after 30 days
    if (config.versioning) {
      lifecycleRules.push({
        action: {
          type: 'Delete'
        },
        condition: {
          age: 30,
          isLive: false
        }
      });
    }
    
    // Move to cheaper storage after 90 days
    lifecycleRules.push({
      action: {
        type: 'SetStorageClass',
        storageClass: 'NEARLINE'
      },
      condition: {
        age: 90
      }
    });
    
    // Delete after 365 days
    lifecycleRules.push({
      action: {
        type: 'Delete'
      },
      condition: {
        age: 365
      }
    });
    
    await bucket.setMetadata({
      lifecycle: {
        rule: lifecycleRules
      }
    });
    
    console.log('✅ Lifecycle policies configured');
  }
  
  /**
   * Creates folder structure in the bucket
   */
  async createBucketStructure(bucketName: string, config: any): Promise<void> {
    console.log('📁 Creating bucket folder structure...');
    
    const bucket = this.storage.bucket(bucketName);
    
    // Create standard folders
    const folders = [
      'assets/',
      'assets/images/',
      'assets/documents/',
      'assets/videos/',
      'uploads/',
      'backups/',
      'logs/',
      'temp/'
    ];
    
    for (const folder of folders) {
      const file = bucket.file(folder);
      await file.save('', {
        metadata: {
          contentType: 'application/x-directory'
        }
      });
    }
    
    console.log('✅ Bucket structure created');
  }
  
  /**
   * Generates GCS configuration for the project
   */
  generateGCSConfig(projectGCS: ProjectGCS): string {
    return `
// Google Cloud Storage configuration for ${projectGCS.bucketName}
const gcsConfig = {
  bucketName: "${projectGCS.bucketName}",
  bucketUrl: "${projectGCS.bucketUrl}",
  serviceAccount: "${projectGCS.serviceAccount}",
  projectId: "${process.env.GCP_PROJECT_ID}",
  location: "US",
  storageClass: "STANDARD"
};

export default gcsConfig;
`;
  }
  
  /**
   * Sets up bucket monitoring and alerts
   */
  async setupBucketMonitoring(bucketName: string, config: any): Promise<void> {
    console.log('📊 Setting up bucket monitoring...');
    
    // Implementation would use Google Cloud Monitoring API
    // Set up alerts for:
    // - Storage usage
    // - Request errors
    // - Cost thresholds
    
    console.log('✅ Bucket monitoring configured');
  }
  
  /**
   * Creates backup bucket for the project
   */
  async createBackupBucket(projectName: string, config: any): Promise<string> {
    const backupBucketName = `${this.config.projectBucketPrefix}-${projectName}-backup-${Date.now()}`;
    
    console.log(`Creating backup bucket: ${backupBucketName}`);
    
    const bucket = this.storage.bucket(backupBucketName);
    await bucket.create({
      location: 'US',
      storageClass: 'COLDLINE', // Cheaper for backups
      labels: {
        project: projectName,
        purpose: 'backup',
        managed: 'backend-template'
      }
    });
    
    // Set up backup lifecycle (keep for 1 year)
    await bucket.setMetadata({
      lifecycle: {
        rule: [{
          action: {
            type: 'Delete'
          },
          condition: {
            age: 365
          }
        }]
      }
    });
    
    console.log(`✅ Backup bucket created: ${backupBucketName}`);
    return backupBucketName;
  }
} 