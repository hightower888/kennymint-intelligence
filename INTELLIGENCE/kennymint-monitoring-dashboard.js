/**
 * Kennymint Monitoring Dashboard
 * Real-time monitoring and control for the kennymint intelligence system
 */

const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

class KennymintMonitoringDashboard {
  constructor() {
    this.projectId = 'dangpt-4777e';
    this.collections = {
      projects: 'kennymint-projects',
      activity: 'kennymint-activity',
      metrics: 'kennymint-metrics',
      intelligence: 'kennymint-intelligence',
      templates: 'kennymint-templates',
      monitoring: 'kennymint-monitoring'
    };
    
    this.initializeFirebase();
    this.setupServer();
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

  setupServer() {
    this.app = express();
    this.port = process.env.PORT || 6000;

    // Middleware
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));

    // Routes
    this.setupRoutes();

    // Start server
    this.app.listen(this.port, () => {
      console.log(`🚀 Kennymint Monitoring Dashboard running on port ${this.port}`);
      console.log(`📊 Dashboard: http://localhost:${this.port}`);
    });
  }

  setupRoutes() {
    // Dashboard home
    this.app.get('/', (req, res) => {
      res.send(this.getDashboardHTML());
    });

    // API Routes
    this.app.get('/api/status', async (req, res) => {
      try {
        const status = await this.getSystemStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/projects', async (req, res) => {
      try {
        const projects = await this.getProjects();
        res.json(projects);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/activity', async (req, res) => {
      try {
        const activity = await this.getRecentActivity();
        res.json(activity);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/metrics', async (req, res) => {
      try {
        const metrics = await this.getSystemMetrics();
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/health', async (req, res) => {
      try {
        const health = await this.getHealthStatus();
        res.json(health);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Control routes
    this.app.post('/api/control/backup', async (req, res) => {
      try {
        await this.triggerBackup();
        res.json({ success: true, message: 'Backup triggered' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/control/analyze', async (req, res) => {
      try {
        await this.triggerAnalysis();
        res.json({ success: true, message: 'Analysis triggered' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async getSystemStatus() {
    try {
      const status = {
        timestamp: new Date().toISOString(),
        system: 'kennymint-intelligence',
        status: 'active',
        components: {}
      };

      // Check Firestore
      try {
        await this.db.collection(this.collections.projects).limit(1).get();
        status.components.firestore = 'healthy';
      } catch (error) {
        status.components.firestore = 'error';
      }

      // Get project count
      const projectsSnapshot = await this.db.collection(this.collections.projects).get();
      status.components.projects = {
        total: projectsSnapshot.size,
        status: 'healthy'
      };

      // Get recent activity
      const activitySnapshot = await this.db.collection(this.collections.activity)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (!activitySnapshot.empty) {
        status.components.activity = {
          lastActivity: activitySnapshot.docs[0].data().timestamp.toDate().toISOString(),
          status: 'active'
        };
      }

      return status;
    } catch (error) {
      throw error;
    }
  }

  async getProjects() {
    try {
      const snapshot = await this.db.collection(this.collections.projects).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  }

  async getRecentActivity(limit = 20) {
    try {
      const snapshot = await this.db.collection(this.collections.activity)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toISOString()
      }));
    } catch (error) {
      throw error;
    }
  }

  async getSystemMetrics() {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        projects: {},
        activity: {},
        health: {}
      };

      // Project metrics
      const projects = await this.getProjects();
      metrics.projects = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        inactive: projects.filter(p => p.status === 'inactive').length,
        averageHealthScore: projects.reduce((sum, p) => sum + (p.healthScore || 0), 0) / projects.length
      };

      // Activity metrics
      const activities = await this.getRecentActivity(100);
      metrics.activity = {
        recentCount: activities.length,
        types: activities.reduce((acc, activity) => {
          acc[activity.action] = (acc[activity.action] || 0) + 1;
          return acc;
        }, {})
      };

      // Health metrics
      const healthSnapshot = await this.db.collection(this.collections.monitoring)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      const healthData = healthSnapshot.docs.map(doc => doc.data());
      metrics.health = {
        recentChecks: healthData.length,
        averageHealth: healthData.reduce((sum, h) => {
          if (h.checks) {
            const healthyChecks = Object.values(h.checks).filter(check => check === 'healthy').length;
            return sum + (healthyChecks / Object.keys(h.checks).length);
          }
          return sum;
        }, 0) / healthData.length
      };

      return metrics;
    } catch (error) {
      throw error;
    }
  }

  async getHealthStatus() {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        overall: 'healthy',
        components: {}
      };

      // Check each component
      const checks = [
        { name: 'firestore', check: () => this.db.collection(this.collections.projects).limit(1).get() },
        { name: 'projects', check: () => this.db.collection(this.collections.projects).get() },
        { name: 'activity', check: () => this.db.collection(this.collections.activity).limit(1).get() }
      ];

      for (const check of checks) {
        try {
          await check.check();
          health.components[check.name] = 'healthy';
        } catch (error) {
          health.components[check.name] = 'error';
          health.overall = 'degraded';
        }
      }

      return health;
    } catch (error) {
      throw error;
    }
  }

  async triggerBackup() {
    try {
      console.log('💾 Triggering manual backup...');
      
      const backupData = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        type: 'manual_backup',
        status: 'started'
      };

      // Store backup record
      await this.db.collection(this.collections.monitoring).add(backupData);
      
      console.log('✅ Manual backup triggered');
      
    } catch (error) {
      console.error('❌ Backup trigger failed:', error);
      throw error;
    }
  }

  async triggerAnalysis() {
    try {
      console.log('🔍 Triggering manual analysis...');
      
      const analysisData = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        type: 'manual_analysis',
        status: 'started'
      };

      // Store analysis record
      await this.db.collection(this.collections.monitoring).add(analysisData);
      
      console.log('✅ Manual analysis triggered');
      
    } catch (error) {
      console.error('❌ Analysis trigger failed:', error);
      throw error;
    }
  }

  getDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kennymint Intelligence Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
        }

        .card h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.3em;
        }

        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .status-healthy { background-color: #4CAF50; }
        .status-warning { background-color: #FF9800; }
        .status-error { background-color: #F44336; }

        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }

        .metric:last-child {
            border-bottom: none;
        }

        .metric-value {
            font-weight: bold;
            color: #667eea;
        }

        .control-panel {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }

        .control-panel h3 {
            color: #667eea;
            margin-bottom: 20px;
        }

        .control-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }

        .btn-secondary {
            background: #f8f9fa;
            color: #667eea;
            border: 2px solid #667eea;
        }

        .btn-secondary:hover {
            background: #667eea;
            color: white;
        }

        .activity-feed {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .activity-item {
            padding: 15px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-time {
            color: #666;
            font-size: 0.9em;
        }

        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }

        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .control-buttons {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Kennymint Intelligence Dashboard</h1>
            <p>Real-time monitoring and control for the kennymint intelligence system</p>
        </div>

        <div class="control-panel">
            <h3>🎛️ Control Panel</h3>
            <div class="control-buttons">
                <button class="btn btn-primary" onclick="triggerBackup()">💾 Trigger Backup</button>
                <button class="btn btn-primary" onclick="triggerAnalysis()">🔍 Trigger Analysis</button>
                <button class="btn btn-secondary" onclick="refreshDashboard()">🔄 Refresh</button>
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="card">
                <h3>📊 System Status</h3>
                <div id="system-status">
                    <div class="loading">Loading...</div>
                </div>
            </div>

            <div class="card">
                <h3>📁 Projects</h3>
                <div id="projects-status">
                    <div class="loading">Loading...</div>
                </div>
            </div>

            <div class="card">
                <h3>📈 Metrics</h3>
                <div id="metrics-status">
                    <div class="loading">Loading...</div>
                </div>
            </div>

            <div class="card">
                <h3>🏥 Health Check</h3>
                <div id="health-status">
                    <div class="loading">Loading...</div>
                </div>
            </div>
        </div>

        <div class="activity-feed">
            <h3>📝 Recent Activity</h3>
            <div id="activity-feed">
                <div class="loading">Loading...</div>
            </div>
        </div>
    </div>

    <script>
        // Dashboard functionality
        async function loadDashboard() {
            await Promise.all([
                loadSystemStatus(),
                loadProjects(),
                loadMetrics(),
                loadHealthStatus(),
                loadActivityFeed()
            ]);
        }

        async function loadSystemStatus() {
            try {
                const response = await fetch('/api/status');
                const status = await response.json();
                
                const statusHtml = \`
                    <div class="metric">
                        <span>System Status</span>
                        <span class="metric-value">
                            <span class="status-indicator status-healthy"></span>
                            \${status.status}
                        </span>
                    </div>
                    <div class="metric">
                        <span>Firestore</span>
                        <span class="metric-value">
                            <span class="status-indicator status-\${status.components?.firestore || 'error'}"></span>
                            \${status.components?.firestore || 'error'}
                        </span>
                    </div>
                    <div class="metric">
                        <span>Last Updated</span>
                        <span class="metric-value">\${new Date(status.timestamp).toLocaleTimeString()}</span>
                    </div>
                \`;
                
                document.getElementById('system-status').innerHTML = statusHtml;
            } catch (error) {
                document.getElementById('system-status').innerHTML = '<div class="error">Failed to load system status</div>';
            }
        }

        async function loadProjects() {
            try {
                const response = await fetch('/api/projects');
                const projects = await response.json();
                
                const projectsHtml = \`
                    <div class="metric">
                        <span>Total Projects</span>
                        <span class="metric-value">\${projects.length}</span>
                    </div>
                    <div class="metric">
                        <span>Active Projects</span>
                        <span class="metric-value">\${projects.filter(p => p.status === 'active').length}</span>
                    </div>
                    <div class="metric">
                        <span>Average Health</span>
                        <span class="metric-value">\${Math.round(projects.reduce((sum, p) => sum + (p.healthScore || 0), 0) / projects.length)}%</span>
                    </div>
                \`;
                
                document.getElementById('projects-status').innerHTML = projectsHtml;
            } catch (error) {
                document.getElementById('projects-status').innerHTML = '<div class="error">Failed to load projects</div>';
            }
        }

        async function loadMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const metrics = await response.json();
                
                const metricsHtml = \`
                    <div class="metric">
                        <span>Total Projects</span>
                        <span class="metric-value">\${metrics.projects?.total || 0}</span>
                    </div>
                    <div class="metric">
                        <span>Active Projects</span>
                        <span class="metric-value">\${metrics.projects?.active || 0}</span>
                    </div>
                    <div class="metric">
                        <span>Recent Activity</span>
                        <span class="metric-value">\${metrics.activity?.recentCount || 0}</span>
                    </div>
                    <div class="metric">
                        <span>System Health</span>
                        <span class="metric-value">\${Math.round((metrics.health?.averageHealth || 0) * 100)}%</span>
                    </div>
                \`;
                
                document.getElementById('metrics-status').innerHTML = metricsHtml;
            } catch (error) {
                document.getElementById('metrics-status').innerHTML = '<div class="error">Failed to load metrics</div>';
            }
        }

        async function loadHealthStatus() {
            try {
                const response = await fetch('/api/health');
                const health = await response.json();
                
                const healthHtml = \`
                    <div class="metric">
                        <span>Overall Health</span>
                        <span class="metric-value">
                            <span class="status-indicator status-\${health.overall === 'healthy' ? 'healthy' : 'warning'}"></span>
                            \${health.overall}
                        </span>
                    </div>
                    \${Object.entries(health.components || {}).map(([component, status]) => \`
                        <div class="metric">
                            <span>\${component}</span>
                            <span class="metric-value">
                                <span class="status-indicator status-\${status}"></span>
                                \${status}
                            </span>
                        </div>
                    \`).join('')}
                \`;
                
                document.getElementById('health-status').innerHTML = healthHtml;
            } catch (error) {
                document.getElementById('health-status').innerHTML = '<div class="error">Failed to load health status</div>';
            }
        }

        async function loadActivityFeed() {
            try {
                const response = await fetch('/api/activity');
                const activities = await response.json();
                
                const activityHtml = activities.map(activity => \`
                    <div class="activity-item">
                        <div>
                            <strong>\${activity.action}</strong>
                            <div class="activity-time">\${new Date(activity.timestamp).toLocaleString()}</div>
                        </div>
                        <span class="status-indicator status-\${activity.status || 'success'}"></span>
                    </div>
                \`).join('');
                
                document.getElementById('activity-feed').innerHTML = activityHtml || '<div class="loading">No recent activity</div>';
            } catch (error) {
                document.getElementById('activity-feed').innerHTML = '<div class="error">Failed to load activity feed</div>';
            }
        }

        async function triggerBackup() {
            try {
                const response = await fetch('/api/control/backup', { method: 'POST' });
                const result = await response.json();
                alert(result.message || 'Backup triggered');
                loadDashboard();
            } catch (error) {
                alert('Failed to trigger backup');
            }
        }

        async function triggerAnalysis() {
            try {
                const response = await fetch('/api/control/analyze', { method: 'POST' });
                const result = await response.json();
                alert(result.message || 'Analysis triggered');
                loadDashboard();
            } catch (error) {
                alert('Failed to trigger analysis');
            }
        }

        function refreshDashboard() {
            loadDashboard();
        }

        // Auto-refresh every 30 seconds
        setInterval(loadDashboard, 30000);

        // Initial load
        loadDashboard();
    </script>
</body>
</html>
    `;
  }
}

// Export for use in other modules
module.exports = KennymintMonitoringDashboard;

// Run dashboard if called directly
if (require.main === module) {
  const dashboard = new KennymintMonitoringDashboard();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down dashboard...');
    process.exit(0);
  });

  console.log('🚀 Kennymint Monitoring Dashboard started');
} 