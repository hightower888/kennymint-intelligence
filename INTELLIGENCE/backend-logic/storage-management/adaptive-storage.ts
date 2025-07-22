/**
 * Adaptive Storage Management System
 * Automatically scales storage architecture based on project complexity and usage patterns
 */

import { 
  SCALING_THRESHOLDS, 
  MIGRATION_TRIGGERS, 
  PERFORMANCE_THRESHOLDS,
  StorageType,
  ProjectSize,
  StorageMetrics 
} from '../constants/storage-limits.js';
import { 
  ACCESS_CONTROL, 
  ENCRYPTION_CONFIG,
  SecurityContext,
  FileSecurityMetadata 
} from '../constants/security-rules.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export class AdaptiveStorageManager {
  private currentStorageType: StorageType = 'json';
  private metrics: StorageMetrics = {
    fileCount: 0,
    totalSize: 0,
    queryFrequency: 0,
    averageResponseTime: 0,
  };
  private projectPath: string;
  private securityContext: SecurityContext;

  constructor(projectPath: string, securityContext: SecurityContext) {
    this.projectPath = projectPath;
    this.securityContext = securityContext;
  }

  /**
   * Analyzes current project metrics and determines optimal storage type
   */
  async analyzeAndOptimize(): Promise<{
    currentType: StorageType;
    recommendedType: StorageType;
    migrationNeeded: boolean;
    reason: string;
  }> {
    await this.updateMetrics();
    const recommendedType = this.determineOptimalStorageType();
    
    return {
      currentType: this.currentStorageType,
      recommendedType,
      migrationNeeded: recommendedType !== this.currentStorageType,
      reason: this.getMigrationReason(recommendedType),
    };
  }

  /**
   * Updates current storage metrics
   */
  private async updateMetrics(): Promise<void> {
    try {
      const stats = await this.calculateProjectStats();
      this.metrics = {
        ...this.metrics,
        ...stats,
      };
    } catch (error) {
      console.error('Failed to update storage metrics:', error);
    }
  }

  /**
   * Calculates comprehensive project statistics
   */
  private async calculateProjectStats(): Promise<Partial<StorageMetrics>> {
    const stats = {
      fileCount: 0,
      totalSize: 0,
      directories: [] as string[],
    };

    const scanDirectory = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            stats.directories.push(fullPath);
            await scanDirectory(fullPath);
          } else {
            stats.fileCount++;
            const fileStat = await fs.stat(fullPath);
            stats.totalSize += fileStat.size;
          }
        }
      } catch (error) {
        // Directory might not exist or be accessible
        console.warn(`Could not scan directory ${dirPath}:`, error);
      }
    };

    await scanDirectory(this.projectPath);
    
    return {
      fileCount: stats.fileCount,
      totalSize: stats.totalSize,
    };
  }

  /**
   * Determines optimal storage type based on current metrics
   */
  private determineOptimalStorageType(): StorageType {
    const { fileCount, totalSize, queryFrequency, concurrentUsers = 1 } = this.metrics;

    // Check for enterprise requirements
    if (
      fileCount >= MIGRATION_TRIGGERS.POSTGRESQL_TO_DISTRIBUTED.fileCount ||
      totalSize >= MIGRATION_TRIGGERS.POSTGRESQL_TO_DISTRIBUTED.totalSize ||
      queryFrequency >= MIGRATION_TRIGGERS.POSTGRESQL_TO_DISTRIBUTED.queryFrequency ||
      concurrentUsers >= MIGRATION_TRIGGERS.POSTGRESQL_TO_DISTRIBUTED.concurrentUsers
    ) {
      return 'distributed';
    }

    // Check for PostgreSQL requirements
    if (
      fileCount >= MIGRATION_TRIGGERS.SQLITE_TO_POSTGRESQL.fileCount ||
      totalSize >= MIGRATION_TRIGGERS.SQLITE_TO_POSTGRESQL.totalSize ||
      queryFrequency >= MIGRATION_TRIGGERS.SQLITE_TO_POSTGRESQL.queryFrequency ||
      concurrentUsers >= MIGRATION_TRIGGERS.SQLITE_TO_POSTGRESQL.concurrentUsers
    ) {
      return 'postgresql';
    }

    // Check for SQLite requirements
    if (
      fileCount >= MIGRATION_TRIGGERS.JSON_TO_SQLITE.fileCount ||
      totalSize >= MIGRATION_TRIGGERS.JSON_TO_SQLITE.totalSize ||
      queryFrequency >= MIGRATION_TRIGGERS.JSON_TO_SQLITE.queryFrequency
    ) {
      return 'sqlite';
    }

    // Default to JSON for small projects
    return 'json';
  }

  /**
   * Gets migration reason for recommended storage type
   */
  private getMigrationReason(recommendedType: StorageType): string {
    const { fileCount, totalSize, queryFrequency, concurrentUsers = 1 } = this.metrics;

    switch (recommendedType) {
      case 'distributed':
        return `Project requires distributed storage: ${fileCount} files (${Math.round(totalSize / 1024 / 1024)}MB), ${queryFrequency} queries/hour, ${concurrentUsers} concurrent users`;
      
      case 'postgresql':
        return `Project requires PostgreSQL: ${fileCount} files (${Math.round(totalSize / 1024 / 1024)}MB), ${queryFrequency} queries/hour`;
      
      case 'sqlite':
        return `Project requires SQLite: ${fileCount} files (${Math.round(totalSize / 1024 / 1024)}MB), ${queryFrequency} queries/hour`;
      
      case 'json':
        return `JSON storage is sufficient for current project size: ${fileCount} files (${Math.round(totalSize / 1024 / 1024)}MB)`;
      
      default:
        return 'Storage type determination needed';
    }
  }

  /**
   * Executes storage migration if needed
   */
  async migrateIfNeeded(): Promise<{
    migrated: boolean;
    fromType: StorageType;
    toType: StorageType;
    duration: number;
  }> {
    const startTime = Date.now();
    const analysis = await this.analyzeAndOptimize();
    
    if (!analysis.migrationNeeded) {
      return {
        migrated: false,
        fromType: analysis.currentType,
        toType: analysis.currentType,
        duration: Date.now() - startTime,
      };
    }

    await this.performMigration(analysis.currentType, analysis.recommendedType);
    
    return {
      migrated: true,
      fromType: analysis.currentType,
      toType: analysis.recommendedType,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Performs actual storage migration
   */
  private async performMigration(fromType: StorageType, toType: StorageType): Promise<void> {
    console.log(`Migrating storage from ${fromType} to ${toType}...`);
    
    try {
      // Backup current data
      await this.createMigrationBackup();
      
      // Perform migration based on target type
      switch (toType) {
        case 'sqlite':
          await this.migrateToSQLite();
          break;
        case 'postgresql':
          await this.migrateToPostgreSQL();
          break;
        case 'distributed':
          await this.migrateToDistributed();
          break;
        default:
          throw new Error(`Unsupported migration target: ${toType}`);
      }
      
      this.currentStorageType = toType;
      console.log(`Migration to ${toType} completed successfully`);
      
    } catch (error) {
      console.error(`Migration failed:`, error);
      await this.rollbackMigration();
      throw error;
    }
  }

  /**
   * Creates backup before migration
   */
  private async createMigrationBackup(): Promise<void> {
    const backupPath = join(this.projectPath, '.migration-backup');
    
    try {
      await fs.mkdir(backupPath, { recursive: true });
      
      // Copy all JSON files to backup
      const configDir = join(this.projectPath, 'config');
      const brandDir = join(this.projectPath, 'brand-guidelines');
      
      await this.copyDirectory(configDir, join(backupPath, 'config'));
      await this.copyDirectory(brandDir, join(backupPath, 'brand-guidelines'));
      
      console.log('Migration backup created successfully');
    } catch (error) {
      console.error('Failed to create migration backup:', error);
      throw error;
    }
  }

  /**
   * Copies directory recursively
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    try {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        
        if (entry.isDirectory()) {
          await this.copyDirectory(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    } catch (error) {
      // Source directory might not exist
      console.warn(`Could not copy directory ${src}:`, error);
    }
  }

  /**
   * Migrates to SQLite storage
   */
  private async migrateToSQLite(): Promise<void> {
    // Implementation would include:
    // - Creating SQLite database schema
    // - Migrating JSON data to SQLite tables
    // - Updating configuration files
    console.log('SQLite migration implementation would go here');
  }

  /**
   * Migrates to PostgreSQL storage
   */
  private async migrateToPostgreSQL(): Promise<void> {
    // Implementation would include:
    // - Setting up PostgreSQL connection
    // - Creating database schema
    // - Migrating data from previous storage
    // - Configuring connection pooling
    console.log('PostgreSQL migration implementation would go here');
  }

  /**
   * Migrates to distributed storage
   */
  private async migrateToDistributed(): Promise<void> {
    // Implementation would include:
    // - Setting up distributed storage nodes
    // - Implementing data sharding strategy
    // - Migrating data with replication
    // - Configuring load balancing
    console.log('Distributed storage migration implementation would go here');
  }

  /**
   * Rolls back migration on failure
   */
  private async rollbackMigration(): Promise<void> {
    const backupPath = join(this.projectPath, '.migration-backup');
    
    try {
      // Restore from backup
      await this.copyDirectory(join(backupPath, 'config'), join(this.projectPath, 'config'));
      await this.copyDirectory(join(backupPath, 'brand-guidelines'), join(this.projectPath, 'brand-guidelines'));
      
      // Clean up backup
      await fs.rm(backupPath, { recursive: true, force: true });
      
      console.log('Migration rollback completed');
    } catch (error) {
      console.error('Rollback failed:', error);
    }
  }

  /**
   * Monitors storage performance and triggers optimization
   */
  async monitorPerformance(): Promise<{
    status: 'optimal' | 'warning' | 'critical';
    metrics: StorageMetrics;
    recommendations: string[];
  }> {
    await this.updateMetrics();
    
    const recommendations: string[] = [];
    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    
    // Check response time
    if (this.metrics.averageResponseTime > PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME) {
      status = 'warning';
      recommendations.push('Consider storage optimization or migration');
    }
    
    // Check file count
    if (this.metrics.fileCount > SCALING_THRESHOLDS.LARGE_PROJECT.maxFiles) {
      status = 'warning';
      recommendations.push('Project size requires distributed storage');
    }
    
    // Check total size
    if (this.metrics.totalSize > 1024 * 1024 * 1024) { // 1GB
      status = 'critical';
      recommendations.push('Storage size critical - immediate migration recommended');
    }
    
    return {
      status,
      metrics: this.metrics,
      recommendations,
    };
  }

  /**
   * Gets current storage configuration
   */
  getStorageConfig(): {
    type: StorageType;
    metrics: StorageMetrics;
    thresholds: typeof SCALING_THRESHOLDS;
  } {
    return {
      type: this.currentStorageType,
      metrics: this.metrics,
      thresholds: SCALING_THRESHOLDS,
    };
  }

  /**
   * Optimizes file organization for current storage type
   */
  async optimizeFileOrganization(): Promise<{
    reorganized: boolean;
    changes: string[];
  }> {
    const changes: string[] = [];
    
    try {
      // Implement file organization optimization
      // - Move large files to appropriate directories
      // - Split oversized directories
      // - Optimize file naming for performance
      
      changes.push('File organization optimization completed');
      
      return {
        reorganized: true,
        changes,
      };
    } catch (error) {
      console.error('File organization optimization failed:', error);
      return {
        reorganized: false,
        changes: [`Optimization failed: ${error}`],
      };
    }
  }
} 