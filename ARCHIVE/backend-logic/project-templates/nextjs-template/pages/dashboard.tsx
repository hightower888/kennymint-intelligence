import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Server, 
  Zap, 
  Eye,
  Plus,
  Settings,
  Refresh,
  Bell,
  X
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProjectTabs from '../components/dashboard/ProjectTabs';
import SystemMetricsGrid from '../components/dashboard/SystemMetricsGrid';
import AISystemsOverview from '../components/dashboard/AISystemsOverview';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import PerformanceCharts from '../components/dashboard/PerformanceCharts';
import { useDashboardData } from '../hooks/useDashboardData';
import { useWebSocket } from '../hooks/useWebSocket';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  healthScore: number;
  aiSystemsEnabled: string[];
  createdAt: string;
  lastActivity: string;
  currentMetrics?: any;
}

interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  averageHealthScore: number;
  totalAlerts: number;
  criticalAlerts: number;
}

const Dashboard: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string>('master');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Custom hooks for data management
  const { data: dashboardData, loading, error, refetch } = useDashboardData(refreshKey);
  const { isConnected, lastMessage } = useWebSocket('ws://localhost:8080');

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage);
      if (data.type === 'metrics_update' || data.type === 'project_created') {
        setRefreshKey(prev => prev + 1);
      }
    }
  }, [lastMessage]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const handleProjectCreate = async (projectData: any) => {
    try {
      const response = await fetch('/api/dashboard/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        setShowNewProjectModal(false);
        handleRefresh();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const projects: Project[] = dashboardData?.projects || [];
  const overview: DashboardOverview = dashboardData?.overview || {
    totalProjects: 0,
    activeProjects: 0,
    averageHealthScore: 0,
    totalAlerts: 0,
    criticalAlerts: 0
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  if (loading && !dashboardData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <Brain className="w-4 h-4 text-blue-500 absolute top-2 left-2" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Initializing AI Dashboard</h3>
                <p className="text-sm text-gray-600">Starting monitoring systems...</p>
              </div>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-red-200/50"
          >
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>AI Systems Dashboard - Ultimate AI Dev Template</title>
        <meta name="description" content="Comprehensive monitoring dashboard for AI systems and project health" />
      </Head>

      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50"
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      AI Systems Dashboard
                    </h1>
                    <p className="text-sm text-gray-600">
                      Monitoring {overview.totalProjects} projects • {overview.activeProjects} active
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Connection Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-600">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  {/* Alert Badge */}
                  {overview.criticalAlerts > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative"
                    >
                      <Bell className="w-5 h-5 text-red-500" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {overview.criticalAlerts}
                      </span>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </button>

                  <button
                    onClick={handleRefresh}
                    className="p-2 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-colors border border-gray-200/50"
                  >
                    <Refresh className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-colors border border-gray-200/50">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Project Tabs */}
              <div className="mt-4">
                <ProjectTabs
                  projects={projects}
                  activeProjectId={activeProjectId}
                  onProjectChange={setActiveProjectId}
                />
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProjectId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Overview Cards */}
                <SystemMetricsGrid 
                  project={activeProject}
                  overview={overview}
                />

                {/* AI Systems Overview */}
                <AISystemsOverview 
                  project={activeProject}
                  projectId={activeProjectId}
                />

                {/* Charts and Analytics */}
                <PerformanceCharts 
                  projectId={activeProjectId}
                />

                {/* Alerts Panel */}
                <AlertsPanel 
                  projectId={activeProjectId}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* New Project Modal */}
        <AnimatePresence>
          {showNewProjectModal && (
            <NewProjectModal
              onClose={() => setShowNewProjectModal(false)}
              onSubmit={handleProjectCreate}
            />
          )}
        </AnimatePresence>
      </DashboardLayout>
    </>
  );
};

// New Project Modal Component
interface NewProjectModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    aiSystemsEnabled: [
      'error-prevention',
      'rule-enforcement',
      'knowledge-graph',
      'health-analysis',
      'drift-prevention',
      'ai-coordinator'
    ]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Project description"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 