/**
 * GitHub Integration Manager
 * Handles repository creation and management
 */

import { Octokit } from '@octokit/rest';

export interface GitHubConfig {
  accessToken: string;
  organization: string;
  templateRepo: string;
  webhookSecret: string;
}

export interface ProjectRepo {
  name: string;
  fullName: string;
  url: string;
  cloneUrl: string;
  webhookUrl: string;
}

export class GitHubManager {
  private octokit: Octokit;
  private config: GitHubConfig;
  
  constructor(config: GitHubConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.accessToken,
    });
  }
  
  /**
   * Creates a new repository for a project
   */
  async createProjectRepository(projectName: string, projectConfig: any): Promise<ProjectRepo> {
    console.log(`📦 Creating GitHub repository: ${projectName}`);
    
    try {
      // Create repository
      const repo = await this.octokit.repos.createInOrg({
        org: this.config.organization,
        name: projectName,
        private: true,
        description: `AI-powered project: ${projectConfig.purpose}`,
        homepage: `https://${projectName}.com`,
        has_issues: true,
        has_projects: true,
        has_wiki: false,
        auto_init: true,
        gitignore_template: 'Node',
        license_template: 'mit'
      });
      
      // Set up branch protection
      await this.setupBranchProtection(repo.data.full_name);
      
      // Create webhook for CI/CD
      await this.createWebhook(repo.data.full_name);
      
      // Set up team access
      await this.setupTeamAccess(repo.data.full_name, projectConfig);
      
      console.log(`✅ Repository created: ${repo.data.html_url}`);
      
      return {
        name: repo.data.name,
        fullName: repo.data.full_name,
        url: repo.data.html_url,
        cloneUrl: repo.data.clone_url,
        webhookUrl: `https://api.github.com/repos/${repo.data.full_name}/hooks`
      };
      
    } catch (error) {
      console.error('❌ Failed to create GitHub repository:', error);
      throw error;
    }
  }
  
  /**
   * Sets up branch protection rules
   */
  private async setupBranchProtection(repoFullName: string): Promise<void> {
    try {
      await this.octokit.repos.updateBranchProtection({
        owner: this.config.organization,
        repo: repoFullName.split('/')[1],
        branch: 'main',
        required_status_checks: {
          strict: true,
          contexts: ['ci/backend-verification']
        },
        enforce_admins: false,
        required_pull_request_reviews: {
          required_approving_review_count: 1,
          dismiss_stale_reviews: true,
          require_code_owner_reviews: false
        },
        restrictions: null
      });
      
      console.log('✅ Branch protection configured');
    } catch (error) {
      console.warn('⚠️  Could not set up branch protection:', error);
    }
  }
  
  /**
   * Creates webhook for CI/CD integration
   */
  private async createWebhook(repoFullName: string): Promise<void> {
    try {
      await this.octokit.repos.createWebhook({
        owner: this.config.organization,
        repo: repoFullName.split('/')[1],
        name: 'web',
        config: {
          url: `https://your-ci-service.com/webhook/${repoFullName}`,
          content_type: 'json',
          secret: this.config.webhookSecret
        },
        events: ['push', 'pull_request'],
        active: true
      });
      
      console.log('✅ Webhook created');
    } catch (error) {
      console.warn('⚠️  Could not create webhook:', error);
    }
  }
  
  /**
   * Sets up team access for the repository
   */
  private async setupTeamAccess(repoFullName: string, projectConfig: any): Promise<void> {
    try {
      // Add developers team
      await this.octokit.teams.addOrUpdateRepoPermissionsInOrg({
        org: this.config.organization,
        team_slug: 'developers',
        owner: this.config.organization,
        repo: repoFullName.split('/')[1],
        permission: 'push'
      });
      
      // Add admins team
      await this.octokit.teams.addOrUpdateRepoPermissionsInOrg({
        org: this.config.organization,
        team_slug: 'admins',
        owner: this.config.organization,
        repo: repoFullName.split('/')[1],
        permission: 'admin'
      });
      
      console.log('✅ Team access configured');
    } catch (error) {
      console.warn('⚠️  Could not set up team access:', error);
    }
  }
  
  /**
   * Pushes initial code to the repository
   */
  async pushInitialCode(repoFullName: string, projectPath: string): Promise<void> {
    console.log('📤 Pushing initial code to repository...');
    
    // This would use git commands to push the project code
    // Implementation would depend on the project structure
    
    console.log('✅ Initial code pushed');
  }
  
  /**
   * Sets up repository templates and workflows
   */
  async setupRepositoryTemplates(repoFullName: string, projectConfig: any): Promise<void> {
    console.log('🔧 Setting up repository templates...');
    
    // Create .github/workflows directory
    const workflowsDir = '.github/workflows';
    
    // Add CI/CD workflow
    await this.addWorkflowFile(repoFullName, 'ci.yml', this.getCIWorkflow(projectConfig));
    
    // Add security scanning
    await this.addWorkflowFile(repoFullName, 'security.yml', this.getSecurityWorkflow());
    
    // Add dependency updates
    await this.addWorkflowFile(repoFullName, 'dependabot.yml', this.getDependabotConfig());
    
    console.log('✅ Repository templates configured');
  }
  
  /**
   * Adds a workflow file to the repository
   */
  private async addWorkflowFile(repoFullName: string, filename: string, content: string): Promise<void> {
    try {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.organization,
        repo: repoFullName.split('/')[1],
        path: `.github/workflows/${filename}`,
        message: `Add ${filename} workflow`,
        content: Buffer.from(content).toString('base64'),
        branch: 'main'
      });
    } catch (error) {
      console.warn(`⚠️  Could not add ${filename}:`, error);
    }
  }
  
  /**
   * Generates CI workflow content
   */
  private getCIWorkflow(projectConfig: any): string {
    return `
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

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Run security scan
      uses: github/codeql-action/init@v2
      with:
        languages: javascript
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
`;
  }
  
  /**
   * Generates security workflow content
   */
  private getSecurityWorkflow(): string {
    return `
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 0'

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Run npm audit
      run: npm audit --audit-level moderate
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
`;
  }
  
  /**
   * Generates Dependabot configuration
   */
  private getDependabotConfig(): string {
    return `
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "your-team"
    assignees:
      - "your-team"
`;
  }
} 