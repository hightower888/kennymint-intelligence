#!/usr/bin/env node

/**
 * Setup GitHub Integration for RepoClone
 * Configures GitHub authentication and repository management
 */

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🐙 Setting up GitHub Integration for RepoClone...\n');

async function setupGitHubIntegration() {
  try {
    // Check current git status
    console.log('📋 Checking current git status...');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const hasChanges = gitStatus.trim().length > 0;
    
    if (hasChanges) {
      console.log('⚠️  You have uncommitted changes:');
      console.log(gitStatus);
      console.log('\n💡 Consider committing changes before proceeding');
    } else {
      console.log('✅ Working directory is clean');
    }
    
    // Check current branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`🌿 Current branch: ${currentBranch}`);
    
    // Check remote repository
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    console.log(`🔗 Remote URL: ${remoteUrl}`);
    
    // Test GitHub connection
    console.log('\n🧪 Testing GitHub connection...');
    try {
      const githubTest = execSync('gh auth status', { encoding: 'utf8' });
      console.log('✅ GitHub CLI authenticated');
    } catch (error) {
      console.log('⚠️  GitHub CLI not authenticated or not installed');
      console.log('💡 Run: gh auth login');
    }
    
    // Create GitHub token configuration
    console.log('\n🔑 Setting up GitHub token...');
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (githubToken && githubToken !== 'your_github_token_here') {
      console.log('✅ GitHub token found in .env');
    } else {
      console.log('⚠️  GitHub token not configured');
      console.log('💡 Add your GitHub token to .env file');
      console.log('   GITHUB_TOKEN=your_actual_token_here');
    }
    
    // Create GitHub integration script
    const githubIntegrationScript = `
const { Octokit } = require('@octokit/rest');
const fs = require('fs');

class GitHubManager {
  constructor(token, repo) {
    this.octokit = new Octokit({
      auth: token
    });
    this.repo = repo;
    this.owner = repo.split('/')[0];
    this.repoName = repo.split('/')[1];
  }
  
  async getRepository() {
    try {
      const response = await this.octokit.repos.get({
        owner: this.owner,
        repo: this.repoName
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get repository:', error.message);
      return null;
    }
  }
  
  async createIssue(title, body, labels = []) {
    try {
      const response = await this.octokit.issues.create({
        owner: this.owner,
        repo: this.repoName,
        title,
        body,
        labels
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create issue:', error.message);
      return null;
    }
  }
  
  async getIssues(state = 'open') {
    try {
      const response = await this.octokit.issues.listForRepo({
        owner: this.owner,
        repo: this.repoName,
        state
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get issues:', error.message);
      return [];
    }
  }
  
  async createRelease(tagName, name, body) {
    try {
      const response = await this.octokit.repos.createRelease({
        owner: this.owner,
        repo: this.repoName,
        tag_name: tagName,
        name,
        body
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create release:', error.message);
      return null;
    }
  }
  
  async getCommits(since) {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repoName,
        since
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get commits:', error.message);
      return [];
    }
  }
}

module.exports = GitHubManager;
`;
    
    fs.writeFileSync('TOOLS/github-manager.js', githubIntegrationScript);
    console.log('✅ Created GitHub manager');
    
    // Create GitHub workflow for CI/CD
    const workflowContent = `name: RepoClone CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Lint code
      run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '\${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: dangpt-4777e
        channelId: live
`;
    
    // Create .github/workflows directory if it doesn't exist
    if (!fs.existsSync('.github')) {
      fs.mkdirSync('.github');
    }
    if (!fs.existsSync('.github/workflows')) {
      fs.mkdirSync('.github/workflows');
    }
    
    fs.writeFileSync('.github/workflows/ci-cd.yml', workflowContent);
    console.log('✅ Created GitHub Actions workflow');
    
    // Create GitHub integration test script
    const testScript = `
require('dotenv').config();
const GitHubManager = require('./github-manager.js');

async function testGitHubIntegration() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'danielyoung/RepoClone';
    
    if (!token || token === 'your_github_token_here') {
      console.log('⚠️  GitHub token not configured');
      console.log('💡 Add GITHUB_TOKEN to your .env file');
      return;
    }
    
    const github = new GitHubManager(token, repo);
    
    console.log('🧪 Testing GitHub integration...');
    
    // Test repository access
    const repoInfo = await github.getRepository();
    if (repoInfo) {
      console.log('✅ Repository access successful');
      console.log(\`📁 Repository: \${repoInfo.full_name}\`);
      console.log(\`⭐ Stars: \${repoInfo.stargazers_count}\`);
      console.log(\`🔀 Forks: \${repoInfo.forks_count}\`);
    }
    
    // Test issues access
    const issues = await github.getIssues();
    console.log(\`📋 Found \${issues.length} open issues\`);
    
    // Test commits access
    const commits = await github.getCommits(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    console.log(\`📝 Found \${commits.length} commits in last 7 days\`);
    
    console.log('\\n🎉 GitHub integration test complete!');
    
  } catch (error) {
    console.error('❌ GitHub integration test failed:', error.message);
  }
}

testGitHubIntegration();
`;
    
    fs.writeFileSync('TOOLS/test-github-integration.js', testScript);
    console.log('✅ Created GitHub integration test');
    
    // Update .env with GitHub configuration
    const envContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=dangpt-4777e
FIREBASE_CLIENT_EMAIL=agent-backend@dangpt-4777e.iam.gserviceaccount.com
# Using application default credentials

# GCS Configuration
GCS_BUCKET_NAME=repoclone-storage
GCS_PROJECT_ID=dangpt-4777e

# GitHub Configuration
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=danielyoung/RepoClone

# Server Configuration
PORT=3000

# Additional Configuration
NODE_ENV=development
# Using gcloud application default credentials
`;
    
    fs.writeFileSync('.env', envContent);
    console.log('✅ Updated .env with GitHub configuration');
    
    console.log('\n🎉 GitHub Integration Setup Complete!');
    console.log('\n📊 Configuration:');
    console.log('  ✅ Repository: danielyoung/RepoClone');
    console.log('  ✅ Remote: Configured');
    console.log('  ✅ GitHub Manager: Created');
    console.log('  ✅ CI/CD Workflow: Created');
    console.log('  ✅ Integration Test: Created');
    
    console.log('\n🔗 GitHub Links:');
    console.log('  Repository: https://github.com/danielyoung/RepoClone');
    console.log('  Issues: https://github.com/danielyoung/RepoClone/issues');
    console.log('  Actions: https://github.com/danielyoung/RepoClone/actions');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Add your GitHub token to .env file');
    console.log('2. Run: node TOOLS/test-github-integration.js');
    console.log('3. Push changes: git add . && git commit -m "Setup GitHub integration"');
    console.log('4. Push to GitHub: git push origin main');
    
  } catch (error) {
    console.error('❌ Failed to setup GitHub integration:', error.message);
  }
}

setupGitHubIntegration(); 