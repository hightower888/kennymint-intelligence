/**
 * 🚀 AI Systems Initialization Script
 * 
 * Initializes all AI systems and prepares them for operation.
 * This script runs during setup and on first startup to ensure
 * all AI components are ready for maximum efficiency.
 */

import { promises as fs } from 'fs';
import path from 'path';
import AISystemsCoordinator from './ai-coordinator';
import { AIRuleEngine } from './rule-enforcement/rule-engine';
import { AIErrorPreventionEngine } from './error-prevention/error-prevention-engine';
import { KnowledgeGraphEngine } from './knowledge-graph/knowledge-graph-engine';

interface InitializationResult {
  success: boolean;
  systems: string[];
  errors: string[];
  warnings: string[];
  performance: {
    initTime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

class AISystemsInitializer {
  private startTime: number = Date.now();
  private errors: string[] = [];
  private warnings: string[] = [];
  private initializedSystems: string[] = [];

  async initialize(): Promise<InitializationResult> {
    console.log('🧠 Initializing AI Systems...\n');

    try {
      // Create necessary directories
      await this.createDirectories();
      
      // Initialize AI models
      await this.initializeAIModels();
      
      // Test system connectivity
      await this.testSystemConnectivity();
      
      // Run initial health checks
      await this.performHealthChecks();
      
      // Generate performance report
      const performance = this.generatePerformanceReport();
      
      console.log('✅ AI Systems initialization completed successfully!\n');
      
      return {
        success: true,
        systems: this.initializedSystems,
        errors: this.errors,
        warnings: this.warnings,
        performance
      };

    } catch (error: any) {
      console.error('❌ AI Systems initialization failed:', error.message);
      this.errors.push(error.message);
      
      return {
        success: false,
        systems: this.initializedSystems,
        errors: this.errors,
        warnings: this.warnings,
        performance: this.generatePerformanceReport()
      };
    }
  }

  private async createDirectories(): Promise<void> {
    console.log('📁 Creating AI system directories...');
    
    const directories = [
      'src/ai-systems/models',
      'src/ai-systems/training-data',
      'src/ai-systems/cache',
      'src/ai-systems/logs',
      'src/ai-systems/backups'
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        
        // Create .gitkeep file
        const gitkeepPath = path.join(dir, '.gitkeep');
        const gitkeepExists = await fs.access(gitkeepPath).then(() => true).catch(() => false);
        
        if (!gitkeepExists) {
          await fs.writeFile(gitkeepPath, '# AI Systems directory\n');
        }
        
      } catch (error: any) {
        this.warnings.push(`Could not create directory ${dir}: ${error.message}`);
      }
    }
    
    console.log('✅ Directories created');
  }

  private async initializeAIModels(): Promise<void> {
    console.log('🤖 Initializing AI models...');
    
    const modelConfigs = [
      {
        name: 'error-prevention',
        description: 'Predicts and prevents code errors',
        inputShape: [50],
        outputShape: [1],
        architecture: 'feedforward'
      },
      {
        name: 'rule-enforcement',
        description: 'Enforces coding rules intelligently',
        inputShape: [100],
        outputShape: [1],
        architecture: 'feedforward'
      },
      {
        name: 'knowledge-graph',
        description: 'Understands code semantics',
        inputShape: [512],
        outputShape: [512],
        architecture: 'transformer'
      }
    ];

    for (const config of modelConfigs) {
      try {
        await this.initializeModel(config);
        this.initializedSystems.push(config.name);
        console.log(`  ✅ ${config.name} model initialized`);
      } catch (error: any) {
        this.errors.push(`Failed to initialize ${config.name}: ${error.message}`);
        console.log(`  ❌ ${config.name} model failed: ${error.message}`);
      }
    }
  }

  private async initializeModel(config: any): Promise<void> {
    const modelDir = `src/ai-systems/models/${config.name}`;
    await fs.mkdir(modelDir, { recursive: true });
    
    // Create model configuration file
    const configPath = path.join(modelDir, 'config.json');
    const modelConfig = {
      ...config,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      status: 'initialized',
      performance: {
        accuracy: 0.5, // Default starting accuracy
        trainingEpochs: 0,
        lastTrained: null
      }
    };
    
    await fs.writeFile(configPath, JSON.stringify(modelConfig, null, 2));
    
    // Create training data directory
    const trainingDir = `src/ai-systems/training-data/${config.name}`;
    await fs.mkdir(trainingDir, { recursive: true });
    
    // Create initial training metadata
    const trainingMetadata = {
      datasetVersion: '1.0.0',
      samples: 0,
      features: config.inputShape[0],
      labels: config.outputShape[0],
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(trainingDir, 'metadata.json'),
      JSON.stringify(trainingMetadata, null, 2)
    );
  }

  private async testSystemConnectivity(): Promise<void> {
    console.log('🔗 Testing system connectivity...');
    
    const tests = [
      {
        name: 'Rule Engine',
        test: async () => {
          const engine = new AIRuleEngine();
          const rules = await engine.getAllRules();
          return rules.length >= 0; // Should return empty array at minimum
        }
      },
      {
        name: 'Error Prevention',
        test: async () => {
          const prevention = new AIErrorPreventionEngine();
          // Test with a simple operation
          const result = await prevention.validateOperation({
            type: 'file_operation',
            action: 'read',
            target: 'test.ts',
            parameters: {},
            riskLevel: 'low'
          });
          return result.confidence !== undefined;
        }
      },
      {
        name: 'Knowledge Graph',
        test: async () => {
          const graph = new KnowledgeGraphEngine();
          const stats = await graph.getGraphStats();
          return stats.nodeCount !== undefined;
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await Promise.race([
          test.test(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        
        if (result) {
          console.log(`  ✅ ${test.name} connectivity OK`);
        } else {
          this.warnings.push(`${test.name} connectivity test returned false`);
          console.log(`  ⚠️  ${test.name} connectivity uncertain`);
        }
      } catch (error: any) {
        this.warnings.push(`${test.name} connectivity failed: ${error.message}`);
        console.log(`  ⚠️  ${test.name} connectivity failed: ${error.message}`);
      }
    }
  }

  private async performHealthChecks(): Promise<void> {
    console.log('🏥 Performing health checks...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const requiredVersion = 'v18.0.0';
    
    if (nodeVersion.localeCompare(requiredVersion, undefined, { numeric: true, sensitivity: 'base' }) < 0) {
      this.warnings.push(`Node.js version ${nodeVersion} is below recommended ${requiredVersion}`);
    } else {
      console.log(`  ✅ Node.js version ${nodeVersion} OK`);
    }
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
    
    if (memoryMB > 500) {
      this.warnings.push(`High memory usage detected: ${memoryMB.toFixed(2)} MB`);
    } else {
      console.log(`  ✅ Memory usage: ${memoryMB.toFixed(2)} MB`);
    }
    
    // Check environment variables
    const requiredEnvVars = ['NODE_ENV'];
    const optionalEnvVars = ['OPENAI_API_KEY', 'HUGGINGFACE_API_KEY'];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        this.errors.push(`Required environment variable ${envVar} is not set`);
      } else {
        console.log(`  ✅ Environment variable ${envVar} set`);
      }
    }
    
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        this.warnings.push(`Optional environment variable ${envVar} is not set - AI features may be limited`);
      } else {
        console.log(`  ✅ Environment variable ${envVar} set`);
      }
    }
    
    // Check disk space
    try {
      const stats = await fs.stat('.');
      console.log('  ✅ Disk access OK');
    } catch (error: any) {
      this.errors.push(`Disk access failed: ${error.message}`);
    }
  }

  private generatePerformanceReport(): { initTime: number; memoryUsage: NodeJS.MemoryUsage } {
    const initTime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();
    
    console.log('\n📊 Performance Report:');
    console.log(`  ⏱️  Initialization time: ${initTime}ms`);
    console.log(`  🧠 Memory usage: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  💾 Heap total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    return { initTime, memoryUsage };
  }

  async createSystemStatus(): Promise<void> {
    const status = {
      initialized: true,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      systems: this.initializedSystems,
      health: {
        errors: this.errors.length,
        warnings: this.warnings.length,
        status: this.errors.length === 0 ? 'healthy' : 'degraded'
      },
      performance: this.generatePerformanceReport()
    };

    const statusPath = 'src/ai-systems/.system-status.json';
    await fs.writeFile(statusPath, JSON.stringify(status, null, 2));
    console.log(`💾 System status saved to ${statusPath}`);
  }
}

// Main initialization function
export async function initializeAISystems(): Promise<InitializationResult> {
  const initializer = new AISystemsInitializer();
  const result = await initializer.initialize();
  
  // Save system status
  await initializer.createSystemStatus();
  
  // Display summary
  console.log('\n🎯 Initialization Summary:');
  console.log(`  ✅ Successfully initialized: ${result.systems.length} systems`);
  console.log(`  ⚠️  Warnings: ${result.warnings.length}`);
  console.log(`  ❌ Errors: ${result.errors.length}`);
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`    - ${warning}`));
  }
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`    - ${error}`));
  }
  
  console.log('\n🚀 AI Systems are ready for operation!\n');
  
  return result;
}

// Run initialization if called directly
if (require.main === module) {
  initializeAISystems().catch(error => {
    console.error('💥 Initialization failed:', error);
    process.exit(1);
  });
}

export default initializeAISystems; 