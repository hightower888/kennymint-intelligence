/**
 * Project Connector
 * Ensures frontend projects are always connected to the backend engine
 */

import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { createBackendEngine } from '../core-engine.js';

export interface BackendConnection {
  enginePath: string;
  projectPath: string;
  version: string;
  connected: boolean;
  lastSync: Date;
}

export class ProjectConnector {
  private static CONNECTION_FILE = '.backend-connection.json';
  
  /**
   * Establishes a foolproof connection between project and backend
   */
  static async connectProject(projectPath: string): Promise<BackendConnection> {
    const absoluteProjectPath = resolve(projectPath);
    const enginePath = resolve(join(__dirname, '..', '..'));
    
    // Create connection file in project
    const connection: BackendConnection = {
      enginePath,
      projectPath: absoluteProjectPath,
      version: '1.0.0',
      connected: true,
      lastSync: new Date(),
    };
    
    const connectionFile = join(absoluteProjectPath, this.CONNECTION_FILE);
    await fs.writeFile(connectionFile, JSON.stringify(connection, null, 2));
    
    // Create project package.json scripts that use backend
    await this.injectBackendScripts(absoluteProjectPath);
    
    // Create .backend-lock file to prevent disconnection
    const lockFile = join(absoluteProjectPath, '.backend-lock');
    await fs.writeFile(lockFile, `LOCKED TO: ${enginePath}\nDO NOT DELETE THIS FILE`);
    
    return connection;
  }
  
  /**
   * Injects scripts into project package.json to ensure backend usage
   */
  private static async injectBackendScripts(projectPath: string): Promise<void> {
    const packagePath = join(projectPath, 'package.json');
    let packageJson: any = {};
    
    try {
      const content = await fs.readFile(packagePath, 'utf-8');
      packageJson = JSON.parse(content);
    } catch {
      // Create if doesn't exist
      packageJson = {
        name: 'frontend-project',
        version: '1.0.0',
        private: true,
      };
    }
    
    // Inject backend-dependent scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'start': 'node ../../../backend-logic/connection/start-with-backend.js',
      'dev': 'node ../../../backend-logic/connection/dev-with-backend.js',
      'build': 'node ../../../backend-logic/connection/build-with-backend.js',
      'backend:sync': 'node ../../../backend-logic/connection/sync.js',
      'backend:status': 'node ../../../backend-logic/connection/status.js',
    };
    
    // Add backend as a dependency (symbolic)
    packageJson.backendEngine = {
      connected: true,
      path: '../../../backend-logic',
      version: '1.0.0',
    };
    
    await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
  }
  
  /**
   * Verifies connection is still valid
   */
  static async verifyConnection(projectPath: string): Promise<boolean> {
    try {
      const connectionFile = join(projectPath, this.CONNECTION_FILE);
      const lockFile = join(projectPath, '.backend-lock');
      
      // Check both files exist
      await fs.access(connectionFile);
      await fs.access(lockFile);
      
      // Verify connection data
      const connectionData = await fs.readFile(connectionFile, 'utf-8');
      const connection: BackendConnection = JSON.parse(connectionData);
      
      // Check engine path still exists
      await fs.access(connection.enginePath);
      
      return connection.connected;
    } catch {
      return false;
    }
  }
  
  /**
   * Auto-reconnect if connection is broken
   */
  static async ensureConnection(projectPath: string): Promise<void> {
    const isConnected = await this.verifyConnection(projectPath);
    
    if (!isConnected) {
      console.log('⚠️  Backend connection lost, reconnecting...');
      await this.connectProject(projectPath);
      console.log('✅ Backend connection restored');
    }
  }
}

/**
 * Project Guard - Prevents project from running without backend
 */
export class ProjectGuard {
  static async guardProject(projectPath: string): Promise<void> {
    // Check connection
    const isConnected = await ProjectConnector.verifyConnection(projectPath);
    
    if (!isConnected) {
      console.error(`
❌ BACKEND NOT CONNECTED

This project requires the backend engine to run.
The backend provides:
- AI Intelligence Systems
- Brand Management
- Asset Generation  
- Security & Compliance
- Performance Optimization

To connect: npm run backend:sync

Exiting...
      `);
      process.exit(1);
    }
    
    // Initialize backend engine
    const engine = createBackendEngine();
    await engine.initializeWithProject(projectPath);
    
    console.log('✅ Backend engine connected and initialized');
  }
}

/**
 * Auto-injection system for existing projects
 */
export async function injectBackendIntoProject(projectPath: string): Promise<void> {
  console.log(`🔧 Injecting backend connection into: ${projectPath}`);
  
  // Connect project
  await ProjectConnector.connectProject(projectPath);
  
  // Create startup guard files
  const guardFiles = [
    {
      name: 'index.js',
      content: `
// Backend Guard - DO NOT REMOVE
require('../../../backend-logic/connection/guard');

// Your app starts here
require('./app');
      `,
    },
    {
      name: '.gitignore',
      append: `
# Backend connection files
.backend-connection.json
.backend-lock
      `,
    },
  ];
  
  for (const file of guardFiles) {
    const filePath = join(projectPath, file.name);
    
    if (file.append) {
      try {
        const existing = await fs.readFile(filePath, 'utf-8');
        if (!existing.includes(file.append)) {
          await fs.appendFile(filePath, file.append);
        }
      } catch {
        await fs.writeFile(filePath, file.append);
      }
    } else if (file.content) {
      await fs.writeFile(filePath, file.content);
    }
  }
  
  console.log('✅ Backend injection complete');
} 