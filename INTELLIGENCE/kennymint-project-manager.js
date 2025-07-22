/**
 * Kennymint Project Manager
 * Continuous project management with intelligent features
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

class KennymintProjectManager {
  constructor() {
    this.projectId = 'dangpt-4777e';
    this.collections = {
      projects: 'kennymint-projects',
      activity: 'kennymint-activity',
      metrics: 'kennymint-metrics',
      intelligence: 'kennymint-intelligence',
      templates: 'kennymint-templates'
    };
    
    this.initializeFirebase();
    this.setupProjectMonitoring();
  }

  initializeFirebase() {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: this.projectId,
        storageBucket: 'kennymint-storage.appspot.com'
      });
    }
    
    this.db = admin.firestore();
  }

  setupProjectMonitoring() {
    // Monitor project changes every 5 minutes
    setInterval(async () => {
      try {
        await this.monitorProjectChanges();
      } catch (error) {
        console.error('❌ Project monitoring error:', error);
      }
    }, 300000); // 5 minutes
  }

  async createProject(projectData) {
    try {
      const projectId = projectData.id || `project-${Date.now()}`;
      
      const project = {
        ...projectData,
        id: projectId,
        created: admin.firestore.FieldValue.serverTimestamp(),
        updated: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        version: '1.0.0',
        metrics: {
          activityCount: 0,
          lastActivity: null,
          healthScore: 100
        }
      };

      await this.db.collection(this.collections.projects).doc(projectId).set(project);
      
      // Log project creation
      await this.logActivity('project_created', {
        projectId,
        projectName: projectData.name,
        projectType: projectData.type
      });

      // Update metrics
      await this.updateProjectMetrics(projectId, 'created');

      console.log(`✅ Project created: ${projectId}`);
      return projectId;

    } catch (error) {
      console.error('❌ Failed to create project:', error);
      throw error;
    }
  }

  async updateProject(projectId, updateData) {
    try {
      const update = {
        ...updateData,
        updated: admin.firestore.FieldValue.serverTimestamp()
      };

      await this.db.collection(this.collections.projects).doc(projectId).update(update);
      
      // Log project update
      await this.logActivity('project_updated', {
        projectId,
        updates: Object.keys(updateData)
      });

      // Update metrics
      await this.updateProjectMetrics(projectId, 'updated');

      console.log(`✅ Project updated: ${projectId}`);
      
    } catch (error) {
      console.error('❌ Failed to update project:', error);
      throw error;
    }
  }

  async getProject(projectId) {
    try {
      const doc = await this.db.collection(this.collections.projects).doc(projectId).get();
      
      if (!doc.exists) {
        return null;
      }

      const project = doc.data();
      
      // Calculate health score
      project.healthScore = await this.calculateProjectHealth(projectId);
      
      return project;
      
    } catch (error) {
      console.error('❌ Failed to get project:', error);
      throw error;
    }
  }

  async listProjects(filters = {}) {
    try {
      let query = this.db.collection(this.collections.projects);
      
      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }

      const snapshot = await query.get();
      const projects = [];

      for (const doc of snapshot.docs) {
        const project = {
          id: doc.id,
          ...doc.data()
        };
        
        // Calculate health score for each project
        project.healthScore = await this.calculateProjectHealth(doc.id);
        projects.push(project);
      }

      return projects;
      
    } catch (error) {
      console.error('❌ Failed to list projects:', error);
      throw error;
    }
  }

  async deleteProject(projectId) {
    try {
      // Get project before deletion for logging
      const project = await this.getProject(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      await this.db.collection(this.collections.projects).doc(projectId).delete();
      
      // Log project deletion
      await this.logActivity('project_deleted', {
        projectId,
        projectName: project.name,
        projectType: project.type
      });

      console.log(`✅ Project deleted: ${projectId}`);
      
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      throw error;
    }
  }

  async calculateProjectHealth(projectId) {
    try {
      // Get recent activity for this project (simplified query to avoid index requirement)
      const activitySnapshot = await this.db.collection(this.collections.activity)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      // Filter in memory to avoid complex index requirement
      const activities = activitySnapshot.docs
        .map(doc => doc.data())
        .filter(activity => activity.data?.projectId === projectId)
        .slice(0, 10);
      
      let healthScore = 100;
      
      // Reduce score for errors
      const errorCount = activities.filter(a => a.status === 'error').length;
      healthScore -= errorCount * 10;
      
      // Reduce score for inactivity
      const lastActivity = activities[0]?.timestamp;
      if (lastActivity) {
        const daysSinceLastActivity = (Date.now() - lastActivity.toDate().getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastActivity > 7) {
          healthScore -= 20;
        }
      }
      
      // Ensure score doesn't go below 0
      healthScore = Math.max(0, healthScore);
      
      return healthScore;
      
    } catch (error) {
      console.error('❌ Failed to calculate project health:', error);
      return 50; // Default score
    }
  }

  async updateProjectMetrics(projectId, action) {
    try {
      const projectRef = this.db.collection(this.collections.projects).doc(projectId);
      
      await this.db.runTransaction(async (transaction) => {
        const projectDoc = await transaction.get(projectRef);
        
        if (!projectDoc.exists) {
          throw new Error('Project not found');
        }
        
        const project = projectDoc.data();
        const metrics = project.metrics || {};
        
        // Update activity count
        metrics.activityCount = (metrics.activityCount || 0) + 1;
        metrics.lastActivity = admin.firestore.FieldValue.serverTimestamp();
        
        // Update health score
        metrics.healthScore = await this.calculateProjectHealth(projectId);
        
        transaction.update(projectRef, {
          metrics,
          updated: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
    } catch (error) {
      console.error('❌ Failed to update project metrics:', error);
    }
  }

  async monitorProjectChanges() {
    try {
      console.log('🔍 Monitoring project changes...');
      
      const projects = await this.listProjects();
      const insights = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        healthyProjects: projects.filter(p => p.healthScore >= 80).length,
        needsAttention: projects.filter(p => p.healthScore < 50).length,
        averageHealthScore: projects.reduce((sum, p) => sum + p.healthScore, 0) / projects.length
      };

      // Log insights
      await this.logActivity('project_insights', insights);

      // Generate recommendations
      const recommendations = this.generateProjectRecommendations(insights);
      
      if (recommendations.length > 0) {
        await this.logActivity('project_recommendations', { recommendations });
      }

      console.log('✅ Project monitoring completed');
      
    } catch (error) {
      console.error('❌ Project monitoring failed:', error);
    }
  }

  generateProjectRecommendations(insights) {
    const recommendations = [];

    if (insights.needsAttention > 0) {
      recommendations.push({
        type: 'warning',
        message: `${insights.needsAttention} projects need attention due to low health scores.`,
        priority: 'high'
      });
    }

    if (insights.averageHealthScore < 70) {
      recommendations.push({
        type: 'info',
        message: 'Overall project health is below optimal levels. Consider reviewing project configurations.',
        priority: 'medium'
      });
    }

    if (insights.activeProjects === 0) {
      recommendations.push({
        type: 'info',
        message: 'No active projects found. Consider creating new projects or reactivating existing ones.',
        priority: 'medium'
      });
    }

    if (insights.healthyProjects === insights.totalProjects && insights.totalProjects > 0) {
      recommendations.push({
        type: 'success',
        message: 'All projects are healthy! Great job maintaining project quality.',
        priority: 'low'
      });
    }

    return recommendations;
  }

  async logActivity(action, data = {}) {
    try {
      const activity = {
        action,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        data,
        status: 'success'
      };

      await this.db.collection(this.collections.activity).add(activity);
      console.log(`📝 Activity logged: ${action}`);
      
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
    }
  }

  async getProjectAnalytics(projectId) {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Get recent activity (simplified query to avoid index requirement)
      const activitySnapshot = await this.db.collection(this.collections.activity)
        .orderBy('timestamp', 'desc')
        .limit(100)
        .get();
      
      // Filter in memory to avoid complex index requirement
      const activities = activitySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(activity => activity.data?.projectId === projectId)
        .slice(0, 50);

      // Calculate analytics
      const analytics = {
        project,
        activityCount: activities.length,
        recentActivity: activities.slice(0, 10),
        activityTypes: activities.reduce((acc, activity) => {
          acc[activity.action] = (acc[activity.action] || 0) + 1;
          return acc;
        }, {}),
        healthTrend: await this.calculateHealthTrend(projectId),
        recommendations: this.generateProjectRecommendations({
          totalProjects: 1,
          activeProjects: project.status === 'active' ? 1 : 0,
          healthyProjects: project.healthScore >= 80 ? 1 : 0,
          needsAttention: project.healthScore < 50 ? 1 : 0,
          averageHealthScore: project.healthScore
        })
      };

      return analytics;
      
    } catch (error) {
      console.error('❌ Failed to get project analytics:', error);
      throw error;
    }
  }

  async calculateHealthTrend(projectId) {
    try {
      // Get health scores over time (simplified implementation)
      const trend = {
        current: await this.calculateProjectHealth(projectId),
        trend: 'stable', // In a real implementation, you'd calculate this from historical data
        factors: ['activity_level', 'error_rate', 'update_frequency']
      };

      return trend;
      
    } catch (error) {
      console.error('❌ Failed to calculate health trend:', error);
      return { current: 50, trend: 'unknown', factors: [] };
    }
  }

  async getSystemOverview() {
    try {
      const projects = await this.listProjects();
      
      const overview = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        inactiveProjects: projects.filter(p => p.status === 'inactive').length,
        averageHealthScore: projects.reduce((sum, p) => sum + p.healthScore, 0) / projects.length,
        projectTypes: projects.reduce((acc, p) => {
          acc[p.type] = (acc[p.type] || 0) + 1;
          return acc;
        }, {}),
        healthDistribution: {
          excellent: projects.filter(p => p.healthScore >= 90).length,
          good: projects.filter(p => p.healthScore >= 70 && p.healthScore < 90).length,
          fair: projects.filter(p => p.healthScore >= 50 && p.healthScore < 70).length,
          poor: projects.filter(p => p.healthScore < 50).length
        }
      };

      return overview;
      
    } catch (error) {
      console.error('❌ Failed to get system overview:', error);
      throw error;
    }
  }
}

// Export for use in other modules
module.exports = KennymintProjectManager;

// Run manager if called directly
if (require.main === module) {
  const manager = new KennymintProjectManager();
  
  async function testManager() {
    try {
      console.log('🧪 Testing Kennymint Project Manager...');
      
      // Test project creation
      const projectId = await manager.createProject({
        name: 'Test Intelligence Project',
        description: 'A test project for the intelligence system',
        type: 'intelligence',
        owner: 'kennymint-system'
      });
      
      console.log(`✅ Created project: ${projectId}`);
      
      // Test getting project
      const project = await manager.getProject(projectId);
      console.log('📁 Project details:', project);
      
      // Test system overview
      const overview = await manager.getSystemOverview();
      console.log('📊 System overview:', overview);
      
      // Test project analytics
      const analytics = await manager.getProjectAnalytics(projectId);
      console.log('📈 Project analytics:', analytics);
      
      console.log('✅ All tests passed!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
  
  testManager();
} 