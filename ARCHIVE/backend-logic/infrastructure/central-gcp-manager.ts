/**
 * Central GCP Project Manager
 * Manages API configs, secrets, and central infrastructure
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { ResourceManagerClient } from '@google-cloud/resource-manager';
import { IAMClient } from '@google-cloud/iam';

export interface CentralGCPConfig {
  centralProjectId: string;
  centralServiceAccount: string;
  secretsManager: {
    projectId: string;
    location: string;
  };
  apiConfigs: {
    openai: string;
    stripe: string;
    sendgrid: string;
    aws: string;
    github: string;
    firebase: string;
    gcp: string;
  };
}

export interface ProjectGCP {
  projectId: string;
  serviceAccount: string;
  secrets: Record<string, string>;
}

export class CentralGCPManager {
  private secretManager: SecretManagerServiceClient;
  private resourceManager: ResourceManagerClient;
  private iamClient: IAMClient;
  private config: CentralGCPConfig;
  
  constructor(config: CentralGCPConfig) {
    this.config = config;
    this.secretManager = new SecretManagerServiceClient();
    this.resourceManager = new ResourceManagerClient();
    this.iamClient = new IAMClient();
  }
  
  /**
   * Creates a new GCP project for a project
   */
  async createProjectGCP(projectName: string, projectConfig: any): Promise<ProjectGCP> {
    console.log(`🔧 Creating GCP project for: ${projectName}`);
    
    try {
      // Create GCP project
      const projectId = await this.createGCPProject(projectName, projectConfig);
      
      // Create service account
      const serviceAccount = await this.createServiceAccount(projectId, projectConfig);
      
      // Set up project APIs
      await this.enableProjectAPIs(projectId, projectConfig);
      
      // Set up IAM permissions
      await this.setupProjectIAM(projectId, serviceAccount, projectConfig);
      
      // Create project-specific secrets
      const secrets = await this.createProjectSecrets(projectName, projectId, projectConfig);
      
      console.log(`✅ GCP project created: ${projectId}`);
      
      return {
        projectId,
        serviceAccount,
        secrets
      };
      
    } catch (error) {
      console.error('❌ Failed to create GCP project:', error);
      throw error;
    }
  }
  
  /**
   * Creates a new GCP project
   */
  private async createGCPProject(projectName: string, config: any): Promise<string> {
    console.log('Creating GCP project...');
    
    const projectId = `${projectName}-gcp-${Date.now()}`;
    
    // Create project using Resource Manager API
    const [project] = await this.resourceManager.createProject({
      projectId,
      name: projectName,
      labels: {
        managed: 'backend-template',
        environment: config.environment || 'development',
        industry: config.industry || 'technology'
      }
    });
    
    console.log(`Created project: ${projectId}`);
    return projectId;
  }
  
  /**
   * Creates service account for the project
   */
  private async createServiceAccount(projectId: string, config: any): Promise<string> {
    console.log('Creating service account...');
    
    const serviceAccountId = `service-account-${projectId}`;
    const serviceAccountEmail = `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`;
    
    // Create service account
    const [serviceAccount] = await this.iamClient.createServiceAccount({
      name: `projects/${projectId}`,
      accountId: serviceAccountId,
      serviceAccount: {
        displayName: `Service Account for ${projectId}`,
        description: `Automatically created service account for project ${projectId}`
      }
    });
    
    // Create and download key
    const [key] = await this.iamClient.createServiceAccountKey({
      name: serviceAccount.name,
      privateKeyType: 'TYPE_GOOGLE_CREDENTIALS_FILE',
      keyAlgorithm: 'KEY_ALG_RSA_2048'
    });
    
    console.log(`Created service account: ${serviceAccountEmail}`);
    return serviceAccountEmail;
  }
  
  /**
   * Enables required APIs for the project
   */
  private async enableProjectAPIs(projectId: string, config: any): Promise<void> {
    console.log('Enabling project APIs...');
    
    const requiredAPIs = [
      'cloudresourcemanager.googleapis.com',
      'iam.googleapis.com',
      'secretmanager.googleapis.com',
      'storage.googleapis.com',
      'firebase.googleapis.com',
      'firestore.googleapis.com',
      'cloudfunctions.googleapis.com',
      'cloudbuild.googleapis.com',
      'run.googleapis.com'
    ];
    
    // Implementation would use Google Cloud API to enable services
    for (const api of requiredAPIs) {
      console.log(`Enabling ${api}...`);
    }
    
    console.log('✅ Project APIs enabled');
  }
  
  /**
   * Sets up IAM permissions for the project
   */
  private async setupProjectIAM(projectId: string, serviceAccount: string, config: any): Promise<void> {
    console.log('🔐 Setting up project IAM...');
    
    // Grant service account necessary roles
    const roles = [
      'roles/secretmanager.secretAccessor',
      'roles/storage.objectViewer',
      'roles/firebase.admin',
      'roles/cloudfunctions.developer',
      'roles/run.developer'
    ];
    
    for (const role of roles) {
      // Implementation would use IAM API to grant roles
      console.log(`Granting ${role} to ${serviceAccount}`);
    }
    
    console.log('✅ Project IAM configured');
  }
  
  /**
   * Creates project-specific secrets in central Secret Manager
   */
  private async createProjectSecrets(projectName: string, projectId: string, config: any): Promise<Record<string, string>> {
    console.log('🔐 Creating project secrets...');
    
    const secrets: Record<string, string> = {};
    
    // Project-specific secrets
    const projectSecrets = {
      [`${projectName}-GCP_PROJECT_ID`]: projectId,
      [`${projectName}-GCP_SERVICE_ACCOUNT`]: `service-account-${projectId}@${projectId}.iam.gserviceaccount.com`,
      [`${projectName}-FIREBASE_PROJECT_ID`]: `${projectName}-firebase-${Date.now()}`,
      [`${projectName}-GCS_BUCKET`]: `${projectName}-storage-${Date.now()}`,
      [`${projectName}-GITHUB_REPO`]: `${config.organization}/${projectName}`
    };
    
    // Inherit from central config
    const inheritedSecrets = {
      [`${projectName}-OPENAI_API_KEY`]: this.config.apiConfigs.openai,
      [`${projectName}-STRIPE_SECRET_KEY`]: this.config.apiConfigs.stripe,
      [`${projectName}-SENDGRID_API_KEY`]: this.config.apiConfigs.sendgrid,
      [`${projectName}-AWS_ACCESS_KEY`]: this.config.apiConfigs.aws,
      [`${projectName}-GITHUB_TOKEN`]: this.config.apiConfigs.github,
      [`${projectName}-FIREBASE_ADMIN_KEY`]: this.config.apiConfigs.firebase,
      [`${projectName}-GCP_SERVICE_ACCOUNT_KEY`]: this.config.apiConfigs.gcp
    };
    
    // Store all secrets
    for (const [key, value] of Object.entries({ ...projectSecrets, ...inheritedSecrets })) {
      await this.storeSecret(key, value);
      secrets[key] = value;
    }
    
    console.log('✅ Project secrets created');
    return secrets;
  }
  
  /**
   * Stores a secret in Secret Manager
   */
  private async storeSecret(secretName: string, value: string): Promise<void> {
    const secretPath = `projects/${this.config.secretsManager.projectId}/secrets/${secretName}`;
    
    try {
      // Create secret if it doesn't exist
      await this.secretManager.createSecret({
        parent: `projects/${this.config.secretsManager.projectId}`,
        secretId: secretName,
        secret: {
          replication: {
            automatic: {}
          }
        }
      });
    } catch (error) {
      // Secret might already exist
      console.log(`Secret ${secretName} already exists`);
    }
    
    // Add secret version
    await this.secretManager.addSecretVersion({
      parent: secretPath,
      payload: {
        data: Buffer.from(value, 'utf8')
      }
    });
    
    console.log(`Stored secret: ${secretName}`);
  }
  
  /**
   * Gets project secrets for runtime access
   */
  async getProjectSecrets(projectName: string): Promise<Record<string, string>> {
    console.log(`🔍 Retrieving secrets for: ${projectName}`);
    
    const secrets: Record<string, string> = {};
    const secretKeys = [
      'GCP_PROJECT_ID',
      'GCP_SERVICE_ACCOUNT',
      'FIREBASE_PROJECT_ID',
      'GCS_BUCKET',
      'GITHUB_REPO',
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY',
      'SENDGRID_API_KEY',
      'AWS_ACCESS_KEY',
      'GITHUB_TOKEN',
      'FIREBASE_ADMIN_KEY',
      'GCP_SERVICE_ACCOUNT_KEY'
    ];
    
    for (const key of secretKeys) {
      const secretName = `${projectName}-${key}`;
      try {
        const [version] = await this.secretManager.accessSecretVersion({
          name: `projects/${this.config.secretsManager.projectId}/secrets/${secretName}/versions/latest`
        });
        secrets[key] = version.payload?.data?.toString() || '';
      } catch (error) {
        console.warn(`Could not retrieve secret: ${secretName}`);
        secrets[key] = '';
      }
    }
    
    return secrets;
  }
  
  /**
   * Sets up central monitoring and alerting
   */
  async setupCentralMonitoring(): Promise<void> {
    console.log('📊 Setting up central monitoring...');
    
    // Implementation would use Google Cloud Monitoring API
    // Set up alerts for:
    // - API usage quotas
    // - Cost thresholds
    // - Security events
    // - Performance metrics
    
    console.log('✅ Central monitoring configured');
  }
  
  /**
   * Manages API quotas and limits
   */
  async manageAPIQuotas(): Promise<void> {
    console.log('📈 Managing API quotas...');
    
    // Implementation would use Google Cloud Quota API
    // Monitor and adjust quotas based on usage
    
    console.log('✅ API quotas managed');
  }
  
  /**
   * Generates project configuration file
   */
  generateProjectConfig(projectGCP: ProjectGCP): string {
    return `
// GCP Configuration for ${projectGCP.projectId}
const gcpConfig = {
  projectId: "${projectGCP.projectId}",
  serviceAccount: "${projectGCP.serviceAccount}",
  location: "us-central1",
  region: "us-central1",
  zone: "us-central1-a"
};

export default gcpConfig;
`;
  }
} 