#!/usr/bin/env node

/**
 * Update GitHub Token in .env
 * Adds the GitHub token to the environment configuration
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔑 Updating GitHub Token in .env...\n');

try {
  // Get GitHub token from CLI
  const githubToken = execSync('gh auth token', { encoding: 'utf8' }).trim();
  
  // Read current .env content
  let envContent = fs.readFileSync('.env', 'utf8');
  
  // Replace the placeholder token with the actual token
  envContent = envContent.replace(
    'GITHUB_TOKEN=your_github_token_here',
    `GITHUB_TOKEN=${githubToken}`
  );
  
  // Write updated .env file
  fs.writeFileSync('.env', envContent);
  
  console.log('✅ GitHub token updated in .env file');
  console.log('✅ Token: gho_************************************');
  
  // Test the token
  console.log('\n🧪 Testing GitHub token...');
  const testScript = `
require('dotenv').config();
const { Octokit } = require('@octokit/rest');

async function testToken() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    const response = await octokit.users.getAuthenticated();
    console.log('✅ GitHub token is valid');
    console.log(\`👤 User: \${response.data.login}\`);
    console.log(\`📧 Email: \${response.data.email}\`);
    
  } catch (error) {
    console.error('❌ GitHub token test failed:', error.message);
  }
}

testToken();
`;
  
  fs.writeFileSync('temp-test-token.js', testScript);
  execSync('node temp-test-token.js', { stdio: 'inherit' });
  fs.unlinkSync('temp-test-token.js');
  
  console.log('\n🎉 GitHub Token Configuration Complete!');
  
} catch (error) {
  console.error('❌ Failed to update GitHub token:', error.message);
} 