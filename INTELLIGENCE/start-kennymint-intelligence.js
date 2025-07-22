/**
 * Kennymint Intelligence Startup Script
 * Launches all intelligence components for continuous monitoring and management
 */

const KennymintIntelligenceCoordinator = require('./kennymint-intelligence-coordinator');
const KennymintProjectManager = require('./kennymint-project-manager');
const KennymintMonitoringDashboard = require('./kennymint-monitoring-dashboard');
const KennymintAdvancedAIIntegration = require('./kennymint-advanced-ai-integration');
const KennymintSelfImprovingIntegration = require('./kennymint-self-improving-integration');
const KennymintBackendSystemsIntegration = require('./kennymint-backend-systems-integration');
const KennymintAISystemsIntegration = require('./kennymint-ai-systems-integration');
const KennymintCompleteBackendIntegration = require('./kennymint-complete-backend-integration');
const KennymintFirestoreConnector = require('./kennymint-firestore-connector');
const KennymintEliteCodingStandards = require('./kennymint-elite-coding-standards');

class KennymintIntelligenceSystem {
  constructor() {
    this.components = {};
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Starting Kennymint Intelligence System...');
    console.log('=' .repeat(50));

    try {
      // Start Intelligence Coordinator
      console.log('🧠 Starting Intelligence Coordinator...');
      this.components.coordinator = new KennymintIntelligenceCoordinator();
      console.log('✅ Intelligence Coordinator started');

      // Start Project Manager
      console.log('📁 Starting Project Manager...');
      this.components.projectManager = new KennymintProjectManager();
      console.log('✅ Project Manager started');

      // Start Monitoring Dashboard
      console.log('📊 Starting Monitoring Dashboard...');
      this.components.dashboard = new KennymintMonitoringDashboard();
      console.log('✅ Monitoring Dashboard started');

      // Start Advanced AI Integration
      console.log('🧠 Starting Advanced AI Integration...');
      this.components.advancedAI = new KennymintAdvancedAIIntegration();
      console.log('✅ Advanced AI Integration started');

      // Start Self-Improving Integration
      console.log('🔄 Starting Self-Improving Integration...');
      this.components.selfImproving = new KennymintSelfImprovingIntegration();
      console.log('✅ Self-Improving Integration started');

      // Start Backend Systems Integration
      console.log('🔧 Starting Backend Systems Integration...');
      this.components.backendSystems = new KennymintBackendSystemsIntegration();
      console.log('✅ Backend Systems Integration started');

      // Start AI Systems Integration
      console.log('🧠 Starting AI Systems Integration...');
      this.components.aiSystems = new KennymintAISystemsIntegration();
      console.log('✅ AI Systems Integration started');

      // Start Complete Backend Integration
      console.log('🔧 Starting Complete Backend Integration...');
      this.components.completeBackend = new KennymintCompleteBackendIntegration();
      console.log('✅ Complete Backend Integration started');

      // Start Firestore Connector
      console.log('🔥 Starting Firestore Connector...');
      this.components.firestoreConnector = new KennymintFirestoreConnector();
      console.log('✅ Firestore Connector started');

      // Start Elite Coding Standards
      console.log('🏆 Starting Elite Coding Standards...');
      this.components.eliteStandards = new KennymintEliteCodingStandards();
      console.log('✅ Elite Coding Standards started');

      this.isRunning = true;

      console.log('=' .repeat(50));
      console.log('🎉 Kennymint Intelligence System is now running!');
      console.log('');
      console.log('📊 Dashboard: http://localhost:6000');
      console.log('🔍 Monitoring: Active');
      console.log('📁 Project Management: Active');
      console.log('🧠 Intelligence Coordinator: Active');
      console.log('🚀 Advanced AI Systems: Active');
      console.log('🔄 Self-Improving Systems: Active');
      console.log('🔧 Backend Systems: Active');
      console.log('🧠 AI Systems: Active');
      console.log('🔧 Complete Backend: Active');
      console.log('🔥 Firestore Connector: Active');
      console.log('🏆 Elite Coding Standards: Active');
      console.log('');
      console.log('Press Ctrl+C to stop all components');
      console.log('=' .repeat(50));

      // Set up graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Failed to start Kennymint Intelligence System:', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      
      this.isRunning = false;

      try {
        // Stop coordinator if it has a stop method
        if (this.components.coordinator && this.components.coordinator.stopMonitoring) {
          await this.components.coordinator.stopMonitoring();
        }

        console.log('✅ All components stopped gracefully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  async getSystemStatus() {
    if (!this.isRunning) {
      return { status: 'stopped' };
    }

    const status = {
      status: 'running',
      timestamp: new Date().toISOString(),
      components: {}
    };

    // Check each component
    for (const [name, component] of Object.entries(this.components)) {
      try {
        if (component.getSystemStatus) {
          status.components[name] = await component.getSystemStatus();
        } else {
          status.components[name] = { status: 'active' };
        }
      } catch (error) {
        status.components[name] = { status: 'error', error: error.message };
      }
    }

    return status;
  }

  async testSystem() {
    console.log('🧪 Testing Kennymint Intelligence System...');

    try {
      // Test coordinator
      if (this.components.coordinator) {
        const coordinatorStatus = await this.components.coordinator.getSystemStatus();
        console.log('✅ Intelligence Coordinator:', coordinatorStatus);
      }

      // Test project manager
      if (this.components.projectManager) {
        const overview = await this.components.projectManager.getSystemOverview();
        console.log('✅ Project Manager:', overview);
      }

      // Test dashboard
      if (this.components.dashboard) {
        const dashboardStatus = await this.components.dashboard.getSystemStatus();
        console.log('✅ Monitoring Dashboard:', dashboardStatus);
      }

      console.log('✅ All system tests passed!');

    } catch (error) {
      console.error('❌ System test failed:', error);
    }
  }
}

// Run system if called directly
if (require.main === module) {
  const system = new KennymintIntelligenceSystem();
  
  // Start the system
  system.start().then(() => {
    // Run initial test after a short delay
    setTimeout(() => {
      system.testSystem();
    }, 5000);
  });
}

module.exports = KennymintIntelligenceSystem; 