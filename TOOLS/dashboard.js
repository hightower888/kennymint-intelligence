#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

const app = express();
const PORT = 3001;

console.log(chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║              🎯 REPOCLONE DASHBOARD SERVER 🎯              ║
║                  Intelligence Health Monitor                ║
╚═══════════════════════════════════════════════════════════╝
`));

// Serve static files
app.use(express.static(path.join(__dirname, 'dashboard-ui')));
app.use(express.json());

// API endpoints
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'active',
    intelligence: {
      root: await checkRootIntelligence(),
      monitor: await checkMonitorStatus(),
      structure: await checkStructureHealth()
    },
    metrics: await getSystemMetrics(),
    timestamp: new Date().toISOString()
  };
  res.json(health);
});

app.get('/api/violations', async (req, res) => {
  try {
    const reportPath = path.join(__dirname, '.intelligence', 'monitor-report.json');
    if (await fs.pathExists(reportPath)) {
      const report = await fs.readJson(reportPath);
      res.json(report.violations || []);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/learnings', async (req, res) => {
  try {
    const reportPath = path.join(__dirname, '.intelligence', 'monitor-report.json');
    if (await fs.pathExists(reportPath)) {
      const report = await fs.readJson(reportPath);
      res.json(report.learnings || []);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/projects', async (req, res) => {
  const projects = await getProjects();
  res.json(projects);
});

app.get('/api/structure', async (req, res) => {
  const structure = await analyzeStructure();
  res.json(structure);
});

// Helper functions
async function checkRootIntelligence() {
  const files = ['README.md', 'INTELLIGENCE.md', 'STRUCTURE_RULES.md', 'package.json', 'index.js'];
  const status = {};
  
  for (const file of files) {
    status[file] = await fs.pathExists(path.join(__dirname, file));
  }
  
  return {
    healthy: Object.values(status).every(v => v),
    files: status
  };
}

async function checkMonitorStatus() {
  // Check if monitor process is running
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec('ps aux | grep "ai-monitor" | grep -v grep', (error, stdout) => {
      resolve({
        running: !error && stdout.trim().length > 0,
        process: stdout.trim()
      });
    });
  });
}

async function checkStructureHealth() {
  const forbidden = ['backend-logic', 'ai-systems', 'core-systems'];
  const violations = [];
  
  for (const dir of forbidden) {
    if (await fs.pathExists(path.join(__dirname, dir))) {
      violations.push(dir);
    }
  }
  
  return {
    healthy: violations.length === 0,
    violations
  };
}

async function getSystemMetrics() {
  const entries = await fs.readdir(__dirname);
  const projects = [];
  
  for (const entry of entries) {
    const fullPath = path.join(__dirname, entry);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory() && 
        !entry.startsWith('.') && 
        entry !== 'RepoCloneMeta' && 
        entry !== 'RepoCloneApp' &&
        entry !== 'node_modules' &&
        entry !== 'scripts' &&
        entry !== 'dashboard-ui') {
      const hasPackageJson = await fs.pathExists(path.join(fullPath, 'package.json'));
      if (hasPackageJson) {
        projects.push(entry);
      }
    }
  }
  
  return {
    totalProjects: projects.length,
    backendLogicLocation: 'RepoCloneMeta/backend-logic',
    templatesAvailable: await countTemplates(),
    lastCheck: new Date().toISOString()
  };
}

async function countTemplates() {
  const templatesPath = path.join(__dirname, 'RepoCloneMeta', 'backend-logic', 'project-templates');
  if (await fs.pathExists(templatesPath)) {
    const templates = await fs.readdir(templatesPath);
    return templates.filter(t => !t.startsWith('.')).length;
  }
  return 0;
}

async function getProjects() {
  const entries = await fs.readdir(__dirname);
  const projects = [];
  
  for (const entry of entries) {
    const fullPath = path.join(__dirname, entry);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory() && 
        !entry.startsWith('.') && 
        entry !== 'RepoCloneMeta' && 
        entry !== 'RepoCloneApp' &&
        entry !== 'node_modules' &&
        entry !== 'scripts' &&
        entry !== 'dashboard-ui') {
      const hasPackageJson = await fs.pathExists(path.join(fullPath, 'package.json'));
      if (hasPackageJson) {
        const packageJson = await fs.readJson(path.join(fullPath, 'package.json'));
        projects.push({
          name: entry,
          description: packageJson.description || 'No description',
          version: packageJson.version || '1.0.0',
          created: stat.birthtime
        });
      }
    }
  }
  
  return projects;
}

async function analyzeStructure() {
  return {
    root: {
      intelligence: await checkRootIntelligence(),
      hasBackendLogic: await fs.pathExists(path.join(__dirname, 'backend-logic')),
      hasRepoCloneMeta: await fs.pathExists(path.join(__dirname, 'RepoCloneMeta')),
      hasRepoCloneApp: await fs.pathExists(path.join(__dirname, 'RepoCloneApp'))
    },
    meta: {
      hasBackendLogic: await fs.pathExists(path.join(__dirname, 'RepoCloneMeta', 'backend-logic')),
      hasTemplates: await fs.pathExists(path.join(__dirname, 'RepoCloneMeta', 'backend-logic', 'project-templates'))
    }
  };
}

// Start server
app.listen(PORT, () => {
  console.log(chalk.green(`✓ Dashboard running at http://localhost:${PORT}`));
  console.log(chalk.yellow('📊 Monitoring RepoClone health...'));
  console.log(chalk.cyan('\nPress Ctrl+C to stop the dashboard\n'));
}); 