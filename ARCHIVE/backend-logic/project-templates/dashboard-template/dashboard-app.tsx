/**
 * Master Dashboard UI
 * Sexy, futuristic dashboard for monitoring all projects
 */

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Project {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  health: number;
  metrics: {
    apiCalls: number;
    storage: number;
    users: number;
    errors: number;
  };
}

interface DashboardData {
  totalProjects: number;
  activeProjects: number;
  totalApiCalls: number;
  totalStorage: number;
  systemHealth: number;
  recentActivity: any[];
}

const Dashboard: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Authentication check
  useEffect(() => {
    checkAuthentication();
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (authenticated) {
      connectWebSocket();
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [authenticated]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      if (response.ok) {
        setAuthenticated(true);
        loadDashboardData();
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const newSocket = io({
      auth: {
        token: localStorage.getItem('dashboardToken')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to dashboard server');
    });

    newSocket.on('overview:update', (data) => {
      setRealTimeData(data);
    });

    newSocket.on('project:update', (data) => {
      // Update specific project data
      updateProjectData(data);
    });

    setSocket(newSocket);
  };

  const loadDashboardData = async () => {
    try {
      const [overviewRes, projectsRes] = await Promise.all([
        fetch('/api/dashboard/overview', { credentials: 'include' }),
        fetch('/api/projects', { credentials: 'include' })
      ]);

      if (overviewRes.ok && projectsRes.ok) {
        const overview = await overviewRes.json();
        const projectsList = await projectsRes.json();
        
        setDashboardData(overview);
        setProjects(projectsList);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const updateProjectData = (data: any) => {
    // Update project data in state
    setProjects(prev => prev.map(p => 
      p.id === data.projectId ? { ...p, ...data.updates } : p
    ));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!authenticated) {
    return <LoginScreen onLogin={() => checkAuthentication()} />;
  }

  return (
    <div className="dashboard-container">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: #0a0a0a;
          color: #ffffff;
          overflow-x: hidden;
        }

        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          position: relative;
        }

        /* Animated background grid */
        .dashboard-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
          pointer-events: none;
        }

        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .header {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          padding: 1.5rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .main-content {
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .stat-card:hover::before {
          transform: scaleX(1);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .projects-section {
          margin-top: 3rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .project-tabs {
          display: flex;
          gap: 0.5rem;
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 0.5rem;
          overflow-x: auto;
        }

        .project-tab {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          position: relative;
        }

        .project-tab:hover {
          color: #ffffff;
        }

        .project-tab.active {
          color: #ffffff;
          background: rgba(59, 130, 246, 0.2);
        }

        .project-tab.active::after {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }

        .project-content {
          background: rgba(30, 41, 59, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          padding: 2rem;
          min-height: 400px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .chart-container {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .health-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 0.5rem;
          position: relative;
        }

        .health-indicator.healthy {
          background: #10b981;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }

        .health-indicator.warning {
          background: #f59e0b;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }

        .health-indicator.critical {
          background: #ef4444;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .activity-feed {
          background: rgba(30, 41, 59, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .activity-item {
          padding: 1rem;
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: background 0.3s ease;
        }

        .activity-item:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .activity-icon.deployment {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .activity-icon.error {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .activity-icon.user {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
      `}</style>

      <header className="header">
        <div className="header-content">
          <h1 className="logo">AI Master Dashboard</h1>
          <div className="header-actions">
            <span className="user-info">Welcome back, Master</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Stats Overview */}
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-value">{dashboardData?.totalProjects || 0}</div>
            <div className="stat-label">Total Projects</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-value">{dashboardData?.activeProjects || 0}</div>
            <div className="stat-label">Active Projects</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-value">{formatNumber(dashboardData?.totalApiCalls || 0)}</div>
            <div className="stat-label">API Calls</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-value">{dashboardData?.systemHealth || 0}%</div>
            <div className="stat-label">System Health</div>
          </motion.div>
        </div>

        {/* Projects Section */}
        <div className="projects-section">
          <div className="section-header">
            <h2 className="section-title">Projects</h2>
          </div>

          <div className="project-tabs">
            <button 
              className={`project-tab ${!selectedProject ? 'active' : ''}`}
              onClick={() => setSelectedProject(null)}
            >
              Overview
            </button>
            {projects.map(project => (
              <button
                key={project.id}
                className={`project-tab ${selectedProject === project.id ? 'active' : ''}`}
                onClick={() => setSelectedProject(project.id)}
              >
                <span className={`health-indicator ${getHealthStatus(project.health)}`} />
                {project.name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedProject || 'overview'}
              className="project-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {selectedProject ? (
                <ProjectDetails projectId={selectedProject} />
              ) : (
                <ProjectsOverview projects={projects} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Real-time Monitoring */}
        <div className="charts-grid">
          <div className="chart-container">
            <h3>System Performance</h3>
            <SystemPerformanceChart data={realTimeData} />
          </div>

          <div className="chart-container">
            <h3>API Usage</h3>
            <APIUsageChart data={realTimeData} />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="activity-feed">
          <h3>Recent Activity</h3>
          {dashboardData?.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-details">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-meta">
                  {activity.project} • {formatTime(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// Helper components and functions would go here...
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner" />
    <div>Initializing Dashboard...</div>
  </div>
);

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="login-screen">
    <h1>Master Dashboard</h1>
    <button onClick={onLogin}>Login</button>
  </div>
);

const ProjectDetails = ({ projectId }: { projectId: string }) => (
  <div>Project details for {projectId}</div>
);

const ProjectsOverview = ({ projects }: { projects: Project[] }) => (
  <div>Projects overview</div>
);

const SystemPerformanceChart = ({ data }: { data: any }) => (
  <div>Performance chart</div>
);

const APIUsageChart = ({ data }: { data: any }) => (
  <div>API usage chart</div>
);

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const getHealthStatus = (health: number): string => {
  if (health >= 80) return 'healthy';
  if (health >= 50) return 'warning';
  return 'critical';
};

const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'deployment': return '🚀';
    case 'error': return '⚠️';
    case 'user': return '👤';
    default: return '📌';
  }
};

const formatTime = (timestamp: Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

export default Dashboard; 