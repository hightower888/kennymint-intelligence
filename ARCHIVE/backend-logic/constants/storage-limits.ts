/**
 * Storage Limits and Thresholds
 * Centralized configuration for all storage-related limits and scaling thresholds
 */

// =============================================================================
// FILE SIZE LIMITS
// =============================================================================

export const FILE_SIZE_LIMITS = {
  // Individual file size limits (bytes)
  MAX_ASSET_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DOCUMENT_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
  MAX_AUDIO_SIZE: 100 * 1024 * 1024, // 100MB
  
  // Configuration file limits
  MAX_CONFIG_SIZE: 1 * 1024 * 1024, // 1MB
  MAX_BRAND_GUIDELINES_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Learning data limits
  MAX_LEARNING_DATA_SIZE: 100 * 1024 * 1024, // 100MB
} as const;

// =============================================================================
// DIRECTORY LIMITS
// =============================================================================

export const DIRECTORY_LIMITS = {
  // Maximum files per directory before auto-organization
  MAX_FILES_PER_DIRECTORY: 1000,
  
  // Maximum subdirectories before restructuring
  MAX_SUBDIRECTORIES: 50,
  
  // Maximum depth for nested folders
  MAX_FOLDER_DEPTH: 10,
  
  // Asset-specific limits
  MAX_ASSETS_PER_TYPE: 500,
  MAX_BRAND_VARIATIONS: 100,
} as const;

// =============================================================================
// PROJECT SCALING THRESHOLDS
// =============================================================================

export const SCALING_THRESHOLDS = {
  // Project size indicators
  SMALL_PROJECT: {
    maxFiles: 100,
    maxAssets: 50,
    maxConfigs: 10,
    storageType: 'json' as const,
  },
  
  MEDIUM_PROJECT: {
    maxFiles: 1000,
    maxAssets: 500,
    maxConfigs: 50,
    storageType: 'sqlite' as const,
  },
  
  LARGE_PROJECT: {
    maxFiles: 10000,
    maxAssets: 5000,
    maxConfigs: 200,
    storageType: 'postgresql' as const,
  },
  
  ENTERPRISE_PROJECT: {
    maxFiles: 100000,
    maxAssets: 50000,
    maxConfigs: 1000,
    storageType: 'distributed' as const,
  },
} as const;

// =============================================================================
// PERFORMANCE THRESHOLDS
// =============================================================================

export const PERFORMANCE_THRESHOLDS = {
  // Response time limits (milliseconds)
  MAX_QUERY_TIME: 1000,
  MAX_FILE_OPERATION_TIME: 5000,
  MAX_GENERATION_TIME: 30000,
  
  // Memory usage limits (bytes)
  MAX_MEMORY_PER_OPERATION: 256 * 1024 * 1024, // 256MB
  MAX_CACHE_SIZE: 512 * 1024 * 1024, // 512MB
  
  // Concurrent operation limits
  MAX_CONCURRENT_OPERATIONS: 10,
  MAX_CONCURRENT_GENERATIONS: 3,
} as const;

// =============================================================================
// STORAGE MIGRATION TRIGGERS
// =============================================================================

export const MIGRATION_TRIGGERS = {
  // When to migrate from JSON to SQLite
  JSON_TO_SQLITE: {
    fileCount: 500,
    totalSize: 50 * 1024 * 1024, // 50MB
    queryFrequency: 100, // queries per hour
  },
  
  // When to migrate from SQLite to PostgreSQL
  SQLITE_TO_POSTGRESQL: {
    fileCount: 5000,
    totalSize: 500 * 1024 * 1024, // 500MB
    queryFrequency: 1000, // queries per hour
    concurrentUsers: 10,
  },
  
  // When to migrate to distributed storage
  POSTGRESQL_TO_DISTRIBUTED: {
    fileCount: 50000,
    totalSize: 5 * 1024 * 1024 * 1024, // 5GB
    queryFrequency: 10000, // queries per hour
    concurrentUsers: 100,
  },
} as const;

// =============================================================================
// CLEANUP THRESHOLDS
// =============================================================================

export const CLEANUP_THRESHOLDS = {
  // Auto-cleanup triggers
  MAX_TEMP_FILE_AGE: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CACHE_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_LOG_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days
  
  // Storage cleanup triggers
  DISK_USAGE_WARNING: 0.8, // 80% full
  DISK_USAGE_CRITICAL: 0.95, // 95% full
  
  // Archive thresholds
  INACTIVE_PROJECT_DAYS: 90,
  UNUSED_ASSET_DAYS: 30,
} as const;

// =============================================================================
// BACKUP AND VERSIONING
// =============================================================================

export const BACKUP_CONSTANTS = {
  // Backup frequency
  AUTO_BACKUP_INTERVAL: 4 * 60 * 60 * 1000, // 4 hours
  
  // Version limits
  MAX_FILE_VERSIONS: 10,
  MAX_BACKUP_RETENTION_DAYS: 90,
  
  // Backup size limits
  MAX_BACKUP_SIZE: 1 * 1024 * 1024 * 1024, // 1GB
  INCREMENTAL_BACKUP_THRESHOLD: 10 * 1024 * 1024, // 10MB
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type StorageType = 'json' | 'sqlite' | 'postgresql' | 'distributed';
export type ProjectSize = 'small' | 'medium' | 'large' | 'enterprise';

export interface StorageMetrics {
  fileCount: number;
  totalSize: number;
  queryFrequency: number;
  concurrentUsers?: number;
  averageResponseTime: number;
} 