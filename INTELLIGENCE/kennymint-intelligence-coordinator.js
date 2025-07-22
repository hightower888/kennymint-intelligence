/**
 * Kennymint Intelligence Coordinator
 * Continuous management and monitoring system for the kennymint project
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

class KennymintIntelligenceCoordinator {
  constructor() {
    this.projectId = 'dangpt-4777e';
    this.bucketName = 'kennymint-storage';
    this.collections = {
      projects: 'kennymint-projects',
      activity: 'kennymint-activity',
      metrics: 'kennymint-metrics',
      intelligence: 'kennymint-intelligence',
      templates: 'kennymint-templates',
      monitoring: 'kennymint-monitoring'
    };
    
    this.monitoringInterval = 30000; // 30 seconds
    this.healthCheckInterval = 60000; // 1 minute
    this.backupInterval = 3600000; // 1 hour
    
    this.initializeFirebase();
    this.setupMonitoring();
  }

  initializeFirebase() {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: this.projectId,
        storageBucket: `${this.bucketName}.appspot.com`
      });
    }
    
    this.db = admin.firestore();
    this.storage = new Storage({ projectId: this.projectId });
  }

  async setupMonitoring() {
    console.log('🧠 Initializing Kennymint Intelligence Coordinator...');
    
    // Start continuous monitoring
    this.startContinuousMonitoring();
    
    // Start health checks
    this.startHealthChecks();
    
    // Start backup system
    this.startBackupSystem();
    
    // Start project analysis
    this.startProjectAnalysis();
    
    console.log('✅ Kennymint Intelligence Coordinator active');
  }

  startContinuousMonitoring() {
    setInterval(async () => {
      try {
        await this.performSystemMonitoring();
      } catch (error) {
        console.error('❌ Monitoring error:', error);
        await this.logIntelligenceEvent('monitoring_error', { error: error.message });
      }
    }, this.monitoringInterval);
  }

  startHealthChecks() {
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ Health check error:', error);
        await this.logIntelligenceEvent('health_check_error', { error: error.message });
      }
    }, this.healthCheckInterval);
  }

  startBackupSystem() {
    setInterval(async () => {
      try {
        await this.performBackup();
      } catch (error) {
        console.error('❌ Backup error:', error);
        await this.logIntelligenceEvent('backup_error', { error: error.message });
      }
    }, this.backupInterval);
  }

  startProjectAnalysis() {
    setInterval(async () => {
      try {
        await this.analyzeProjectHealth();
      } catch (error) {
        console.error('❌ Project analysis error:', error);
        await this.logIntelligenceEvent('analysis_error', { error: error.message });
      }
    }, 300000); // 5 minutes
  }

  async performSystemMonitoring() {
    const monitoringData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      systemStatus: 'active',
      checks: {}
    };

    // Check Firestore connection
    try {
      await this.db.collection(this.collections.projects).limit(1).get();
      monitoringData.checks.firestore = 'healthy';
    } catch (error) {
      monitoringData.checks.firestore = 'error';
    }

    // Check GCS connection
    try {
      await this.storage.bucket(this.bucketName).exists();
      monitoringData.checks.gcs = 'healthy';
    } catch (error) {
      monitoringData.checks.gcs = 'error';
    }

    // Check file system
    try {
      const stats = fs.statSync('.');
      monitoringData.checks.filesystem = 'healthy';
      monitoringData.checks.diskSpace = stats.size;
    } catch (error) {
      monitoringData.checks.filesystem = 'error';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    monitoringData.checks.memory = {
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal
    };

    // Store monitoring data
    await this.db.collection(this.collections.monitoring).add(monitoringData);
    
    console.log('📊 System monitoring completed');
  }

  async performHealthCheck() {
    const healthData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'health_check',
      status: 'running'
    };

    // Check collections
    const collectionChecks = {};
    for (const [key, collectionName] of Object.entries(this.collections)) {
      try {
        const snapshot = await this.db.collection(collectionName).limit(1).get();
        collectionChecks[key] = {
          status: 'healthy',
          documentCount: snapshot.size
        };
      } catch (error) {
        collectionChecks[key] = {
          status: 'error',
          error: error.message
        };
      }
    }
    healthData.collections = collectionChecks;

    // Check bucket
    try {
      const [files] = await this.storage.bucket(this.bucketName).getFiles();
      healthData.bucket = {
        status: 'healthy',
        fileCount: files.length
      };
    } catch (error) {
      healthData.bucket = {
        status: 'error',
        error: error.message
      };
    }

    // Store health data
    await this.db.collection(this.collections.monitoring).add(healthData);
    
    console.log('🏥 Health check completed');
  }

  async performBackup() {
    console.log('💾 Starting backup process...');
    
    const backupData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'backup',
      status: 'started'
    };

    try {
      // Backup project data
      const projectsSnapshot = await this.db.collection(this.collections.projects).get();
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Backup activity logs
      const activitySnapshot = await this.db.collection(this.collections.activity).get();
      const activities = activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create backup file
      const backupContent = {
        timestamp: new Date().toISOString(),
        projects,
        activities,
        metadata: {
          totalProjects: projects.length,
          totalActivities: activities.length,
          version: '1.0.0'
        }
      };

      // Upload to GCS
      const backupFileName = `kennymint-backup-${Date.now()}.json`;
      const backupFile = this.storage.bucket(this.bucketName).file(`kennymint-backups/${backupFileName}`);
      
      await backupFile.save(JSON.stringify(backupContent, null, 2), {
        contentType: 'application/json',
        metadata: {
          customMetadata: {
            type: 'backup',
            timestamp: new Date().toISOString()
          }
        }
      });

      backupData.status = 'completed';
      backupData.backupFile = backupFileName;
      backupData.metadata = backupContent.metadata;

      console.log(`✅ Backup completed: ${backupFileName}`);
      
    } catch (error) {
      backupData.status = 'failed';
      backupData.error = error.message;
      console.error('❌ Backup failed:', error);
    }

    // Store backup record
    await this.db.collection(this.collections.monitoring).add(backupData);
  }

  async analyzeProjectHealth() {
    console.log('🔍 Analyzing project health...');
    
    const analysisData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'project_analysis',
      insights: {}
    };

    try {
      // Analyze projects
      const projectsSnapshot = await this.db.collection(this.collections.projects).get();
      const projects = projectsSnapshot.docs.map(doc => doc.data());
      
      analysisData.insights.projectCount = projects.length;
      analysisData.insights.activeProjects = projects.filter(p => p.status === 'active').length;
      analysisData.insights.recentProjects = projects.filter(p => {
        const created = p.created?.toDate?.() || new Date(p.created);
        return (Date.now() - created.getTime()) < 86400000; // Last 24 hours
      }).length;

      // Analyze activity patterns
      const activitySnapshot = await this.db.collection(this.collections.activity)
        .orderBy('timestamp', 'desc')
        .limit(100)
        .get();
      
      const activities = activitySnapshot.docs.map(doc => doc.data());
      analysisData.insights.recentActivity = activities.length;
      analysisData.insights.activityTypes = activities.reduce((acc, activity) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1;
        return acc;
      }, {});

      // Analyze system performance
      const monitoringSnapshot = await this.db.collection(this.collections.monitoring)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      const monitoringData = monitoringSnapshot.docs.map(doc => doc.data());
      const healthyChecks = monitoringData.filter(m => 
        m.checks && Object.values(m.checks).every(check => check === 'healthy')
      ).length;
      
      analysisData.insights.systemHealth = (healthyChecks / monitoringData.length) * 100;

      // Generate recommendations
      analysisData.recommendations = this.generateRecommendations(analysisData.insights);

      console.log('✅ Project analysis completed');
      
    } catch (error) {
      analysisData.error = error.message;
      console.error('❌ Project analysis failed:', error);
    }

    // Store analysis
    await this.db.collection(this.collections.monitoring).add(analysisData);
  }

  generateRecommendations(insights) {
    const recommendations = [];

    if (insights.systemHealth < 90) {
      recommendations.push({
        type: 'warning',
        message: 'System health is below optimal levels. Consider investigating recent errors.',
        priority: 'high'
      });
    }

    if (insights.recentProjects === 0) {
      recommendations.push({
        type: 'info',
        message: 'No new projects created recently. Consider promoting project creation features.',
        priority: 'medium'
      });
    }

    if (insights.recentActivity < 10) {
      recommendations.push({
        type: 'info',
        message: 'Low activity detected. Consider implementing automated tasks or user engagement features.',
        priority: 'medium'
      });
    }

    if (insights.activeProjects > 0) {
      recommendations.push({
        type: 'success',
        message: `System is healthy with ${insights.activeProjects} active projects.`,
        priority: 'low'
      });
    }

    return recommendations;
  }

  async logIntelligenceEvent(eventType, data = {}) {
    try {
      const event = {
        type: eventType,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        data,
        system: 'kennymint-intelligence-coordinator'
      };

      await this.db.collection(this.collections.intelligence).add(event);
      console.log(`📝 Intelligence event logged: ${eventType}`);
      
    } catch (error) {
      console.error('❌ Failed to log intelligence event:', error);
    }
  }

  async getSystemStatus() {
    try {
      const status = {
        coordinator: 'active',
        monitoring: 'running',
        lastCheck: new Date().toISOString(),
        intervals: {
          monitoring: this.monitoringInterval,
          healthCheck: this.healthCheckInterval,
          backup: this.backupInterval
        }
      };

      // Get recent monitoring data
      const monitoringSnapshot = await this.db.collection(this.collections.monitoring)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!monitoringSnapshot.empty) {
        const latestMonitoring = monitoringSnapshot.docs[0].data();
        status.latestMonitoring = latestMonitoring;
      }

      return status;
      
    } catch (error) {
      console.error('❌ Failed to get system status:', error);
      return { error: error.message };
    }
  }

  async stopMonitoring() {
    console.log('🛑 Stopping Kennymint Intelligence Coordinator...');
    
    // Clear intervals (in a real implementation, you'd store the interval IDs)
    await this.logIntelligenceEvent('coordinator_stopped', {
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Intelligence Coordinator stopped');
  }
}

// Export for use in other modules
module.exports = KennymintIntelligenceCoordinator;

// Run coordinator if called directly
if (require.main === module) {
  const coordinator = new KennymintIntelligenceCoordinator();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await coordinator.stopMonitoring();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await coordinator.stopMonitoring();
    process.exit(0);
  });

  console.log('🚀 Kennymint Intelligence Coordinator started');
  console.log('Press Ctrl+C to stop');
} 