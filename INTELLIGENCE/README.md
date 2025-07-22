# Kennymint Intelligence System

## 🧠 Overview

The Kennymint Intelligence System is a comprehensive continuous monitoring and management platform that provides real-time insights, automated backups, health checks, and project management for the kennymint project.

## 🚀 Components

### 1. Intelligence Coordinator (`kennymint-intelligence-coordinator.js`)
- **Purpose**: Central coordination and monitoring system
- **Features**:
  - Continuous system monitoring (every 30 seconds)
  - Health checks (every 1 minute)
  - Automated backups (every 1 hour)
  - Project analysis (every 5 minutes)
  - Real-time event logging

### 2. Project Manager (`kennymint-project-manager.js`)
- **Purpose**: Intelligent project management with health scoring
- **Features**:
  - Project creation, updates, and deletion
  - Health score calculation
  - Project analytics and insights
  - Automated project monitoring
  - Recommendation generation

### 3. Monitoring Dashboard (`kennymint-monitoring-dashboard.js`)
- **Purpose**: Real-time web dashboard for monitoring and control
- **Features**:
  - Live system status
  - Project overview
  - Activity feed
  - Manual control triggers
  - Health monitoring

## 🛠️ Quick Start

### Start the Complete Intelligence System
```bash
npm run intelligence
```

This will start all components:
- 🧠 Intelligence Coordinator
- 📁 Project Manager  
- 📊 Monitoring Dashboard (http://localhost:3001)

### Start Individual Components

```bash
# Start only the coordinator
npm run intelligence-coordinator

# Start only the dashboard
npm run intelligence-dashboard

# Start only the project manager
npm run intelligence-projects
```

## 📊 Dashboard Access

Once running, access the monitoring dashboard at:
**http://localhost:3001**

The dashboard provides:
- Real-time system status
- Project overview and health scores
- Activity feed
- Manual control buttons
- Auto-refresh every 30 seconds

## 🔧 Configuration

### Firebase Collections
The system uses the following kennymint-specific collections:
- `kennymint-projects` - Project data
- `kennymint-activity` - Activity logs
- `kennymint-metrics` - System metrics
- `kennymint-intelligence` - Intelligence events
- `kennymint-templates` - Project templates
- `kennymint-monitoring` - Monitoring data

### Monitoring Intervals
- **System Monitoring**: 30 seconds
- **Health Checks**: 1 minute
- **Backups**: 1 hour
- **Project Analysis**: 5 minutes

## 📈 Features

### Continuous Monitoring
- Real-time system health checks
- Firestore and GCS connection monitoring
- Memory and disk usage tracking
- Activity pattern analysis

### Automated Backups
- Hourly automated backups to GCS
- Project data and activity logs backup
- Backup metadata and versioning
- Manual backup triggers

### Health Scoring
- Project health score calculation
- Activity-based scoring
- Error rate analysis
- Inactivity detection

### Intelligent Recommendations
- System health recommendations
- Project improvement suggestions
- Performance optimization tips
- Maintenance alerts

## 🔍 API Endpoints

### Dashboard API
- `GET /api/status` - System status
- `GET /api/projects` - Project list
- `GET /api/activity` - Recent activity
- `GET /api/metrics` - System metrics
- `GET /api/health` - Health status

### Control API
- `POST /api/control/backup` - Trigger manual backup
- `POST /api/control/analyze` - Trigger manual analysis

## 📁 File Structure

```
INTELLIGENCE/
├── kennymint-intelligence-coordinator.js    # Main coordinator
├── kennymint-project-manager.js             # Project management
├── kennymint-monitoring-dashboard.js        # Web dashboard
├── start-kennymint-intelligence.js          # Startup script
└── README.md                                # This documentation
```

## 🎯 Use Cases

### Development
- Monitor project health during development
- Track activity patterns
- Identify performance issues
- Generate insights for improvements

### Production
- Continuous system monitoring
- Automated backup management
- Health alerting
- Performance optimization

### Analytics
- Project analytics and insights
- Activity pattern analysis
- System performance metrics
- Trend analysis

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Ensure Firebase project is properly configured
   - Check service account permissions
   - Verify collection names

2. **Dashboard Not Loading**
   - Check if port 3001 is available
   - Verify all components are running
   - Check browser console for errors

3. **Monitoring Not Working**
   - Ensure all intervals are properly set
   - Check Firebase connection
   - Verify collection permissions

### Debug Mode
Add debug logging by setting environment variables:
```bash
DEBUG=true npm run intelligence
```

## 🚀 Advanced Usage

### Custom Monitoring Intervals
Edit the coordinator to change monitoring intervals:
```javascript
this.monitoringInterval = 30000; // 30 seconds
this.healthCheckInterval = 60000; // 1 minute
this.backupInterval = 3600000; // 1 hour
```

### Custom Health Scoring
Modify the health calculation in the project manager:
```javascript
async calculateProjectHealth(projectId) {
  // Custom health calculation logic
}
```

### Custom Dashboard
Extend the dashboard with custom components:
```javascript
// Add new API endpoints
this.app.get('/api/custom', async (req, res) => {
  // Custom endpoint logic
});
```

## 📊 Metrics and Analytics

The system tracks various metrics:
- Project count and health scores
- Activity patterns and types
- System performance metrics
- Error rates and trends
- Backup success rates

## 🔐 Security

- Uses Firebase authentication
- Secure API endpoints
- Environment variable protection
- Graceful error handling

## 🎉 Benefits

1. **Continuous Monitoring**: 24/7 system monitoring
2. **Automated Management**: Hands-off project management
3. **Real-time Insights**: Live dashboard and analytics
4. **Intelligent Recommendations**: AI-powered suggestions
5. **Reliable Backups**: Automated data protection
6. **Health Tracking**: Project health scoring
7. **Performance Optimization**: Continuous improvement

---

*Kennymint Intelligence System - Powered by continuous monitoring and intelligent management* 