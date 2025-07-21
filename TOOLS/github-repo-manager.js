#!/usr/bin/env node

/**
 * GitHub Repository Manager for RepoClone Intelligence System
 * Handles remote repository operations, issues, and integration
 */

require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitHubRepoManager {
  constructor() {
    this.initializeGitHub();
    this.repoName = process.env.GITHUB_REPO || 'danielyoung/RepoClone';
    this.owner = this.repoName.split('/')[0];
    this.repo = this.repoName.split('/')[1];
  }

  /**
   * Initialize GitHub API
   */
  initializeGitHub() {
    try {
      this.octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
      });
      console.log('✅ GitHub API initialized');
    } catch (error) {
      console.warn('⚠️  GitHub not configured:', error.message);
      this.octokit = null;
    }
  }

  /**
   * Initialize git repository and connect to remote
   */
  async initializeRepository() {
    try {
      // Check if git is already initialized
      if (!fs.existsSync('.git')) {
        execSync('git init', { stdio: 'inherit' });
        console.log('✅ Git repository initialized');
      }

      // Add remote origin if not exists
      try {
        execSync('git remote get-url origin', { stdio: 'pipe' });
        console.log('✅ Remote origin already configured');
      } catch (error) {
        const remoteUrl = `https://github.com/${this.repoName}.git`;
        execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
        console.log(`✅ Added remote origin: ${remoteUrl}`);
      }

      // Create initial commit if needed
      try {
        execSync('git log --oneline -1', { stdio: 'pipe' });
        console.log('✅ Repository has commits');
      } catch (error) {
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "Initial commit: RepoClone Intelligence System"', { stdio: 'inherit' });
        console.log('✅ Created initial commit');
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize repository:', error.message);
      return false;
    }
  }

  /**
   * Push changes to remote repository
   */
  async pushChanges(commitMessage = 'Update RepoClone Intelligence System') {
    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Changes pushed to remote repository');
      return true;
    } catch (error) {
      console.error('❌ Failed to push changes:', error.message);
      return false;
    }
  }

  /**
   * Create GitHub issue
   */
  async createIssue(title, body, labels = []) {
    if (!this.octokit) {
      console.warn('⚠️  GitHub not configured, skipping issue creation');
      return null;
    }

    try {
      const response = await this.octokit.rest.issues.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        labels: ['intelligence-system', ...labels]
      });

      console.log(`✅ GitHub issue created: ${response.data.html_url}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create GitHub issue:', error.message);
      return null;
    }
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo() {
    if (!this.octokit) {
      return {
        name: this.repoName,
        status: 'not_configured',
        issues: 0,
        stars: 0,
        forks: 0
      };
    }

    try {
      const [repoResponse, issuesResponse] = await Promise.all([
        this.octokit.rest.repos.get({
          owner: this.owner,
          repo: this.repo
        }),
        this.octokit.rest.issues.listForRepo({
          owner: this.owner,
          repo: this.repo,
          state: 'open'
        })
      ]);

      return {
        name: this.repoName,
        status: 'active',
        description: repoResponse.data.description,
        issues: issuesResponse.data.length,
        stars: repoResponse.data.stargazers_count,
        forks: repoResponse.data.forks_count,
        language: repoResponse.data.language,
        updated: repoResponse.data.updated_at,
        url: repoResponse.data.html_url
      };
    } catch (error) {
      console.error('❌ Failed to get repository info:', error.message);
      return {
        name: this.repoName,
        status: 'error',
        issues: 0,
        stars: 0,
        forks: 0
      };
    }
  }

  /**
   * Get recent commits
   */
  async getRecentCommits(limit = 10) {
    if (!this.octokit) {
      return [];
    }

    try {
      const response = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        per_page: limit
      });

      return response.data.map(commit => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url
      }));
    } catch (error) {
      console.error('❌ Failed to get recent commits:', error.message);
      return [];
    }
  }

  /**
   * Create release
   */
  async createRelease(tag, name, body) {
    if (!this.octokit) {
      console.warn('⚠️  GitHub not configured, skipping release creation');
      return null;
    }

    try {
      const response = await this.octokit.rest.repos.createRelease({
        owner: this.owner,
        repo: this.repo,
        tag_name: tag,
        name,
        body,
        draft: false,
        prerelease: false
      });

      console.log(`✅ GitHub release created: ${response.data.html_url}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create release:', error.message);
      return null;
    }
  }

  /**
   * Get repository statistics
   */
  async getRepositoryStats() {
    if (!this.octokit) {
      return {
        commits: 0,
        issues: 0,
        pullRequests: 0,
        contributors: 0
      };
    }

    try {
      const [commits, issues, pulls, contributors] = await Promise.all([
        this.octokit.rest.repos.listCommits({
          owner: this.owner,
          repo: this.repo,
          per_page: 1
        }),
        this.octokit.rest.issues.listForRepo({
          owner: this.owner,
          repo: this.repo,
          state: 'all'
        }),
        this.octokit.rest.pulls.list({
          owner: this.owner,
          repo: this.repo,
          state: 'all'
        }),
        this.octokit.rest.repos.listContributors({
          owner: this.owner,
          repo: this.repo
        })
      ]);

      return {
        commits: commits.data.length > 0 ? commits.data[0].sha : 0,
        issues: issues.data.length,
        pullRequests: pulls.data.length,
        contributors: contributors.data.length
      };
    } catch (error) {
      console.error('❌ Failed to get repository stats:', error.message);
      return {
        commits: 0,
        issues: 0,
        pullRequests: 0,
        contributors: 0
      };
    }
  }

  /**
   * Sync local changes with remote
   */
  async syncWithRemote() {
    try {
      // Pull latest changes
      execSync('git pull origin main', { stdio: 'inherit' });
      console.log('✅ Pulled latest changes from remote');

      // Push local changes
      await this.pushChanges('Auto-sync: Update RepoClone Intelligence System');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync with remote:', error.message);
      return false;
    }
  }

  /**
   * Get repository health metrics
   */
  async getRepositoryHealth() {
    const repoInfo = await this.getRepositoryInfo();
    const stats = await this.getRepositoryStats();
    const recentCommits = await this.getRecentCommits(5);

    return {
      repository: repoInfo,
      statistics: stats,
      recentActivity: recentCommits,
      health: {
        score: this.calculateHealthScore(repoInfo, stats),
        status: this.getHealthStatus(repoInfo, stats),
        recommendations: this.getHealthRecommendations(repoInfo, stats)
      }
    };
  }

  /**
   * Calculate repository health score
   */
  calculateHealthScore(repoInfo, stats) {
    let score = 0;
    
    if (repoInfo.status === 'active') score += 30;
    if (stats.commits > 0) score += 20;
    if (stats.issues > 0) score += 15;
    if (stats.pullRequests > 0) score += 15;
    if (stats.contributors > 1) score += 20;

    return Math.min(score, 100);
  }

  /**
   * Get health status
   */
  getHealthStatus(repoInfo, stats) {
    const score = this.calculateHealthScore(repoInfo, stats);
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'needs_attention';
  }

  /**
   * Get health recommendations
   */
  getHealthRecommendations(repoInfo, stats) {
    const recommendations = [];

    if (repoInfo.status !== 'active') {
      recommendations.push('Configure GitHub repository connection');
    }

    if (stats.commits === 0) {
      recommendations.push('Make initial commit to establish repository history');
    }

    if (stats.issues === 0) {
      recommendations.push('Create issues to track project tasks');
    }

    if (stats.pullRequests === 0) {
      recommendations.push('Use pull requests for code reviews');
    }

    if (stats.contributors <= 1) {
      recommendations.push('Consider adding collaborators for better project health');
    }

    return recommendations;
  }
}

module.exports = GitHubRepoManager; 