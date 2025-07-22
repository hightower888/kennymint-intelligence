# Infrastructure Management System

This system provides automated infrastructure setup for GitHub, Firebase, Google Cloud Storage, and Google Cloud Platform projects. It creates a secure, scalable foundation for AI-powered applications with centralized secret management.

## 🏗️ Architecture Overview

### Central Infrastructure
- **Central GCP Project**: Manages all API keys, secrets, and configurations
- **Central Firebase Project**: Template for project-specific Firebase instances
- **Central GCS Bucket**: Template for project-specific storage buckets
- **GitHub Organization**: Manages all project repositories

### Project Infrastructure
Each project gets its own:
- **GitHub Repository**: With CI/CD workflows and branch protection
- **Firebase Project**: With authentication, Firestore, and storage
- **GCS Bucket**: With versioning, backup, and lifecycle policies
- **GCP Project**: With service accounts and API access

## 🔐 Security Model

### Secret Management
- All secrets stored in central GCP Secret Manager
- Projects inherit API keys from central configuration
- No secrets in template code
- Service accounts with minimal required permissions

### Access Control
- GitHub repositories with team-based access
- Firebase projects with role-based authentication
- GCS buckets with IAM policies
- GCP projects with service account isolation

## 🚀 Quick Start

### 1. Setup Central Infrastructure

```bash
# Clone the template repository
git clone https://github.com/your-org/ai-template.git
cd ai-template

# Install dependencies
npm install

# Copy environment configuration
cp backend-logic/infrastructure/env.example backend-logic/infrastructure/.env

# Edit the environment file with your credentials
nano backend-logic/infrastructure/.env
```

### 2. Configure Environment Variables

```bash
# GitHub Configuration
GITHUB_ACCESS_TOKEN=your_github_personal_access_token
GITHUB_ORGANIZATION=your_github_organization

# Firebase Configuration
FIREBASE_CENTRAL_PROJECT_ID=your_central_firebase_project_id
FIREBASE_CENTRAL_SERVICE_ACCOUNT=your_firebase_service_account_email

# GCP Configuration
GCP_CENTRAL_PROJECT_ID=your_central_gcp_project_id
GCP_CENTRAL_SERVICE_ACCOUNT=your_gcp_service_account_email

# API Keys
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

### 3. Create Project Infrastructure

```bash
# Interactive setup
npm run infrastructure:setup my-ai-project

# Non-interactive setup
npm run infrastructure:setup my-ai-project -- --non-interactive --purpose "AI Chat Application" --industry "technology"
```

## 📋 CLI Commands

### Setup Infrastructure
```bash
# Interactive setup with prompts
npm run infrastructure:setup <project-name>

# Non-interactive setup with options
npm run infrastructure:setup <project-name> -- --non-interactive --purpose "Purpose" --industry "technology"
```

### Validate Infrastructure
```bash
# Check if infrastructure is properly configured
npm run infrastructure:validate <project-name>
```

### Check Status
```bash
# Get status of all services
npm run infrastructure:status <project-name>
```

## 🏛️ Infrastructure Components

### GitHub Integration
- **Repository Creation**: Automatic repo creation with proper naming
- **Branch Protection**: Main branch protection with required reviews
- **CI/CD Workflows**: Automated testing and deployment
- **Team Access**: Developer and admin team permissions
- **Webhooks**: Integration with external services

### Firebase Integration
- **Project Creation**: Isolated Firebase projects per application
- **Authentication**: Email/password, Google, GitHub providers
- **Firestore**: NoSQL database with security rules
- **Storage**: File storage with CORS configuration
- **Functions**: Serverless functions (optional)

### Google Cloud Storage
- **Bucket Creation**: Project-specific storage buckets
- **Versioning**: File versioning for data protection
- **Lifecycle Policies**: Automatic archival and deletion
- **CORS Configuration**: Web access configuration
- **IAM Policies**: Service account and team access

### Google Cloud Platform
- **Project Creation**: Isolated GCP projects
- **Service Accounts**: Project-specific service accounts
- **API Enablement**: Required APIs automatically enabled
- **Secret Management**: Centralized secret storage
- **Monitoring**: Central monitoring and alerting

## 🔧 Configuration Options

### Project Configuration
```typescript
interface ProjectConfig {
  name: string;
  purpose: string;
  industry: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    authentication: boolean;
    database: boolean;
    storage: boolean;
    functions: boolean;
    monitoring: boolean;
  };
  authProviders: {
    google: boolean;
    github: boolean;
    email: boolean;
  };
  storage: {
    versioning: boolean;
    backup: boolean;
    cdn: boolean;
  };
}
```

### Environment Variables
The system generates environment files with:
- Firebase configuration
- GCS bucket details
- GCP project settings
- API keys (inherited from central config)
- Security keys

## 📊 Monitoring and Alerting

### Central Monitoring
- **API Usage**: Track API quota usage
- **Cost Monitoring**: Monitor project costs
- **Security Events**: Alert on security incidents
- **Performance Metrics**: Track application performance

### Project Monitoring
- **GitHub**: Repository activity and CI/CD status
- **Firebase**: Authentication and database usage
- **GCS**: Storage usage and access patterns
- **GCP**: API usage and service health

## 🔄 Workflow Integration

### CI/CD Pipeline
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-verification:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run backend verification
      run: npm run backend:verify
    - name: Run tests
      run: npm test
    - name: Build project
      run: npm run build
```

### Security Scanning
- **CodeQL Analysis**: Automated security scanning
- **Dependency Audits**: Regular vulnerability checks
- **Snyk Integration**: Third-party security scanning

## 🛡️ Security Best Practices

### Secret Management
- All secrets stored in GCP Secret Manager
- No secrets in code or configuration files
- Automatic secret rotation
- Access logging and auditing

### Access Control
- Principle of least privilege
- Service account isolation
- Team-based repository access
- Role-based Firebase permissions

### Data Protection
- Encryption at rest and in transit
- Automatic backup policies
- Versioning for data recovery
- Lifecycle policies for cost optimization

## 📈 Scaling and Optimization

### Automatic Scaling
- GCS bucket lifecycle policies
- Firebase automatic scaling
- GCP resource optimization
- Cost monitoring and alerts

### Performance Optimization
- CDN integration for static assets
- Firebase caching strategies
- GCS performance tuning
- Database optimization

## 🔍 Troubleshooting

### Common Issues

#### Missing Environment Variables
```bash
# Check required environment variables
npm run infrastructure:validate <project-name>
```

#### GitHub API Rate Limits
```bash
# Use GitHub personal access token with appropriate permissions
GITHUB_ACCESS_TOKEN=your_token_with_repo_permissions
```

#### Firebase Project Creation Fails
```bash
# Ensure Firebase Admin SDK is properly configured
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

#### GCP Service Account Issues
```bash
# Verify service account has necessary permissions
gcloud projects get-iam-policy your-project-id
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=backend-template:* npm run infrastructure:setup <project-name>
```

## 📚 API Reference

### InfrastructureOrchestrator
```typescript
class InfrastructureOrchestrator {
  async createProjectInfrastructure(projectName: string, config: ProjectConfig): Promise<ProjectInfrastructureSetup>
  async validateInfrastructure(projectName: string): Promise<boolean>
  async getInfrastructureStatus(projectName: string): Promise<any>
}
```

### GitHubManager
```typescript
class GitHubManager {
  async createProjectRepository(projectName: string, config: any): Promise<ProjectRepo>
  async setupRepositoryTemplates(repoFullName: string, config: any): Promise<void>
}
```

### FirebaseManager
```typescript
class FirebaseManager {
  async createProjectFirebase(projectName: string, config: any): Promise<ProjectFirebase>
  generateFirebaseConfig(projectFirebase: ProjectFirebase): string
}
```

## 🤝 Contributing

### Development Setup
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build TypeScript
npm run build

# Run linting
npm run lint
```

### Adding New Services
1. Create service manager in `backend-logic/infrastructure/`
2. Add to `InfrastructureOrchestrator`
3. Update CLI commands
4. Add documentation

## 📄 License

This infrastructure system is part of the AI Template project. See the main LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API reference
3. Open an issue in the repository
4. Contact the development team 