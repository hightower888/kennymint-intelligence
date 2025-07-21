
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
