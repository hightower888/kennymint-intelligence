/**
 * Efficiency Monitoring System
 * Tracks storage performance and automatically optimizes operations for maximum efficiency
 */

import { 
  PERFORMANCE_THRESHOLDS, 
  CLEANUP_THRESHOLDS,
  StorageMetrics 
} from '../constants/storage-limits.js';
import { 
  AUDIT_CONFIG,
  LogEvent,
  LogLevel 
} from '../constants/security-rules.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  diskUsage: number;
  cacheHitRate: number;
  operationsPerSecond: number;
  errorRate: number;
  timestamp: number;
}

export interface OptimizationRecommendation {
  type: 'cache' | 'storage' | 'memory' | 'network' | 'cleanup';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedImprovement: number; // percentage
  implementationCost: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
}

export class EfficiencyMonitor {
  private metricsHistory: PerformanceMetrics[] = [];
  private projectPath: string;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private cacheManager: Map<string, { data: any; timestamp: number; hits: number }> = new Map();
  
  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Starts continuous monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    this.stopMonitoring(); // Ensure no duplicate intervals
    
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.analyzeAndOptimize();
    }, intervalMs);
    
    console.log(`Efficiency monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * Stops monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Efficiency monitoring stopped');
    }
  }

  /**
   * Collects current performance metrics
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    try {
      const metrics: PerformanceMetrics = {
        responseTime: await this.measureResponseTime(),
        memoryUsage: await this.measureMemoryUsage(),
        diskUsage: await this.measureDiskUsage(),
        cacheHitRate: this.calculateCacheHitRate(),
        operationsPerSecond: await this.measureOperationsPerSecond(),
        errorRate: await this.calculateErrorRate(),
        timestamp: Date.now(),
      };

      // Store metrics in history (keep last 1000 entries)
      this.metricsHistory.push(metrics);
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory.shift();
      }

      return metrics;
    } catch (error) {
      console.error('Failed to collect metrics:', error);
      throw error;
    }
  }

  /**
   * Measures average response time for storage operations
   */
  private async measureResponseTime(): Promise<number> {
    const samples = 5;
    const times: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      const start = Date.now();
      
      try {
        // Test read operation
        await fs.access(join(this.projectPath, 'config'), fs.constants.F_OK);
        times.push(Date.now() - start);
      } catch (error) {
        // If config doesn't exist, create a simple test
        const testPath = join(this.projectPath, '.efficiency-test');
        await fs.writeFile(testPath, 'test');
        await fs.readFile(testPath);
        await fs.unlink(testPath);
        times.push(Date.now() - start);
      }
    }
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Measures current memory usage
   */
  private async measureMemoryUsage(): Promise<number> {
    const memUsage = process.memoryUsage();
    return memUsage.heapUsed / 1024 / 1024; // MB
  }

  /**
   * Measures disk usage for project directory
   */
  private async measureDiskUsage(): Promise<number> {
    let totalSize = 0;
    
    const scanDirectory = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
          }
        }
      } catch (error) {
        // Directory might not exist
      }
    };
    
    await scanDirectory(this.projectPath);
    return totalSize / 1024 / 1024; // MB
  }

  /**
   * Calculates cache hit rate
   */
  private calculateCacheHitRate(): number {
    if (this.cacheManager.size === 0) return 0;
    
    let totalHits = 0;
    let totalAccesses = 0;
    
    for (const [key, value] of this.cacheManager.entries()) {
      totalHits += value.hits;
      totalAccesses += value.hits + 1; // +1 for initial miss
    }
    
    return totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0;
  }

  /**
   * Measures operations per second
   */
  private async measureOperationsPerSecond(): Promise<number> {
    const testDuration = 1000; // 1 second
    const startTime = Date.now();
    let operations = 0;
    
    while (Date.now() - startTime < testDuration) {
      try {
        // Perform lightweight operation
        await fs.access(this.projectPath);
        operations++;
      } catch (error) {
        break;
      }
    }
    
    return operations;
  }

  /**
   * Calculates error rate from recent operations
   */
  private async calculateErrorRate(): Promise<number> {
    // In a real implementation, this would track actual error logs
    // For now, return a simulated value based on performance
    const recentMetrics = this.metricsHistory.slice(-10);
    if (recentMetrics.length === 0) return 0;
    
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
    
    // Simulate error rate based on response time degradation
    if (averageResponseTime > PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME * 2) {
      return 5; // 5% error rate for very slow responses
    }
    if (averageResponseTime > PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME) {
      return 1; // 1% error rate for slow responses
    }
    
    return 0.1; // 0.1% baseline error rate
  }

  /**
   * Analyzes metrics and provides optimization recommendations
   */
  async analyzeAndOptimize(): Promise<{
    status: 'optimal' | 'warning' | 'critical';
    recommendations: OptimizationRecommendation[];
    autoOptimizationsApplied: string[];
  }> {
    const currentMetrics = await this.collectMetrics();
    const recommendations: OptimizationRecommendation[] = [];
    const autoOptimizationsApplied: string[] = [];
    
    let status: 'optimal' | 'warning' | 'critical' = 'optimal';

    // Analyze response time
    if (currentMetrics.responseTime > PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME) {
      status = 'warning';
      recommendations.push({
        type: 'storage',
        priority: 'high',
        description: 'Response time exceeds threshold - consider storage optimization',
        estimatedImprovement: 30,
        implementationCost: 'medium',
        autoApplicable: true,
      });
    }

    // Analyze memory usage
    if (currentMetrics.memoryUsage > PERFORMANCE_THRESHOLDS.MAX_MEMORY_PER_OPERATION / 1024 / 1024) {
      status = 'critical';
      recommendations.push({
        type: 'memory',
        priority: 'critical',
        description: 'Memory usage critical - immediate cleanup required',
        estimatedImprovement: 50,
        implementationCost: 'low',
        autoApplicable: true,
      });
      
      // Auto-apply memory cleanup
      await this.performMemoryCleanup();
      autoOptimizationsApplied.push('Memory cleanup performed');
    }

    // Analyze cache performance
    if (currentMetrics.cacheHitRate < 70) {
      recommendations.push({
        type: 'cache',
        priority: 'medium',
        description: 'Low cache hit rate - optimize caching strategy',
        estimatedImprovement: 25,
        implementationCost: 'low',
        autoApplicable: true,
      });
      
      // Auto-optimize cache
      await this.optimizeCache();
      autoOptimizationsApplied.push('Cache optimization applied');
    }

    // Analyze disk usage
    if (currentMetrics.diskUsage > 1000) { // 1GB
      recommendations.push({
        type: 'cleanup',
        priority: 'high',
        description: 'High disk usage - cleanup old files',
        estimatedImprovement: 40,
        implementationCost: 'low',
        autoApplicable: true,
      });
      
      // Auto-apply cleanup
      await this.performDiskCleanup();
      autoOptimizationsApplied.push('Disk cleanup performed');
    }

    // Analyze error rate
    if (currentMetrics.errorRate > 2) {
      status = 'critical';
      recommendations.push({
        type: 'storage',
        priority: 'critical',
        description: 'High error rate detected - system stability at risk',
        estimatedImprovement: 60,
        implementationCost: 'high',
        autoApplicable: false,
      });
    }

    return {
      status,
      recommendations,
      autoOptimizationsApplied,
    };
  }

  /**
   * Performs automatic memory cleanup
   */
  private async performMemoryCleanup(): Promise<void> {
    try {
      // Clear old cache entries
      const now = Date.now();
      for (const [key, value] of this.cacheManager.entries()) {
        if (now - value.timestamp > CLEANUP_THRESHOLDS.MAX_CACHE_AGE) {
          this.cacheManager.delete(key);
        }
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      console.log('Memory cleanup completed');
    } catch (error) {
      console.error('Memory cleanup failed:', error);
    }
  }

  /**
   * Optimizes cache strategy
   */
  private async optimizeCache(): Promise<void> {
    try {
      // Remove least recently used items if cache is too large
      const maxCacheSize = 100;
      
      if (this.cacheManager.size > maxCacheSize) {
        const entries = Array.from(this.cacheManager.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by oldest first
        
        const toRemove = entries.slice(0, this.cacheManager.size - maxCacheSize);
        for (const [key] of toRemove) {
          this.cacheManager.delete(key);
        }
      }
      
      console.log('Cache optimization completed');
    } catch (error) {
      console.error('Cache optimization failed:', error);
    }
  }

  /**
   * Performs disk cleanup
   */
  private async performDiskCleanup(): Promise<void> {
    try {
      const cleanupPaths = [
        join(this.projectPath, '.tmp'),
        join(this.projectPath, '.cache'),
        join(this.projectPath, '.logs'),
      ];
      
      for (const cleanupPath of cleanupPaths) {
        try {
          await this.cleanupDirectory(cleanupPath);
        } catch (error) {
          // Directory might not exist
        }
      }
      
      console.log('Disk cleanup completed');
    } catch (error) {
      console.error('Disk cleanup failed:', error);
    }
  }

  /**
   * Cleans up old files in a directory
   */
  private async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const now = Date.now();
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        const stats = await fs.stat(fullPath);
        
        // Remove files older than cleanup threshold
        if (now - stats.mtime.getTime() > CLEANUP_THRESHOLDS.MAX_TEMP_FILE_AGE) {
          if (entry.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true });
          } else {
            await fs.unlink(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Cleanup failed for ${dirPath}:`, error);
    }
  }

  /**
   * Gets performance trends analysis
   */
  getTrends(): {
    responseTimetrend: 'improving' | 'stable' | 'degrading';
    memoryTrend: 'improving' | 'stable' | 'degrading';
    cacheTrend: 'improving' | 'stable' | 'degrading';
    overallTrend: 'improving' | 'stable' | 'degrading';
  } {
    if (this.metricsHistory.length < 10) {
      return {
        responseTimetrend: 'stable',
        memoryTrend: 'stable',
        cacheTrend: 'stable',
        overallTrend: 'stable',
      };
    }
    
    const recent = this.metricsHistory.slice(-5);
    const older = this.metricsHistory.slice(-10, -5);
    
    const recentAvg = {
      responseTime: recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length,
      memory: recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length,
      cache: recent.reduce((sum, m) => sum + m.cacheHitRate, 0) / recent.length,
    };
    
    const olderAvg = {
      responseTime: older.reduce((sum, m) => sum + m.responseTime, 0) / older.length,
      memory: older.reduce((sum, m) => sum + m.memoryUsage, 0) / older.length,
      cache: older.reduce((sum, m) => sum + m.cacheHitRate, 0) / older.length,
    };
    
    const getTrend = (recent: number, older: number, lowerIsBetter: boolean = true): 'improving' | 'stable' | 'degrading' => {
      const change = (recent - older) / older;
      if (Math.abs(change) < 0.05) return 'stable'; // Less than 5% change
      
      if (lowerIsBetter) {
        return change < 0 ? 'improving' : 'degrading';
      } else {
        return change > 0 ? 'improving' : 'degrading';
      }
    };
    
    const responseTimetrend = getTrend(recentAvg.responseTime, olderAvg.responseTime);
    const memoryTrend = getTrend(recentAvg.memory, olderAvg.memory);
    const cacheTrend = getTrend(recentAvg.cache, olderAvg.cache, false); // Higher cache hit rate is better
    
    // Overall trend is degrading if any critical metric is degrading
    let overallTrend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (responseTimetrend === 'degrading' || memoryTrend === 'degrading') {
      overallTrend = 'degrading';
    } else if (responseTimetrend === 'improving' && memoryTrend === 'improving' && cacheTrend === 'improving') {
      overallTrend = 'improving';
    }
    
    return {
      responseTimetrend,
      memoryTrend,
      cacheTrend,
      overallTrend,
    };
  }

  /**
   * Gets comprehensive performance report
   */
  getPerformanceReport(): {
    currentMetrics: PerformanceMetrics | null;
    trends: ReturnType<typeof this.getTrends>;
    recommendations: OptimizationRecommendation[];
    healthScore: number; // 0-100
  } {
    const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1] || null;
    const trends = this.getTrends();
    
    // Calculate health score
    let healthScore = 100;
    
    if (currentMetrics) {
      // Deduct points for poor performance
      if (currentMetrics.responseTime > PERFORMANCE_THRESHOLDS.MAX_QUERY_TIME) {
        healthScore -= 20;
      }
      if (currentMetrics.memoryUsage > PERFORMANCE_THRESHOLDS.MAX_MEMORY_PER_OPERATION / 1024 / 1024) {
        healthScore -= 30;
      }
      if (currentMetrics.cacheHitRate < 50) {
        healthScore -= 15;
      }
      if (currentMetrics.errorRate > 1) {
        healthScore -= 25;
      }
      
      // Deduct points for negative trends
      if (trends.overallTrend === 'degrading') {
        healthScore -= 10;
      }
    }
    
    return {
      currentMetrics,
      trends,
      recommendations: [], // Would be populated from latest analysis
      healthScore: Math.max(0, healthScore),
    };
  }

  /**
   * Caching utilities for improved performance
   */
  setCache(key: string, data: any): void {
    this.cacheManager.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  getCache(key: string): any | null {
    const entry = this.cacheManager.get(key);
    if (entry) {
      entry.hits++;
      return entry.data;
    }
    return null;
  }

  clearCache(): void {
    this.cacheManager.clear();
  }
} 