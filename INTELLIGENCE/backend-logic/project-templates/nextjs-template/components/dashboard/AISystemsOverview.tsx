import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Shield, 
  Activity, 
  Zap, 
  Eye, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  aiSystemsEnabled: string[];
  currentMetrics?: {
    aiSystemsHealth: Record<string, {
      status: string;
      accuracy: number;
      responseTime: number;
      load: number;
      lastCheck: string;
    }>;
  };
}

interface AISystemsOverviewProps {
  project?: Project;
  projectId: string;
}

const AISystemsOverview: React.FC<AISystemsOverviewProps> = ({ project, projectId }) => {
  const aiSystems = [
    {
      id: 'ai-coordinator',
      name: 'AI Coordinator',
      description: 'Master orchestrator for all AI systems',
      icon: Brain,
      color: 'purple'
    },
    {
      id: 'error-prevention',
      name: 'Error Prevention',
      description: 'Predictive error detection and prevention',
      icon: Shield,
      color: 'blue'
    },
    {
      id: 'rule-enforcement',
      name: 'Rule Enforcement',
      description: 'Intelligent code rule validation',
      icon: Activity,
      color: 'green'
    },
    {
      id: 'knowledge-graph',
      name: 'Knowledge Graph',
      description: 'Semantic code understanding',
      icon: Eye,
      color: 'indigo'
    },
    {
      id: 'health-analysis',
      name: 'Health Analysis',
      description: 'Comprehensive system health monitoring',
      icon: TrendingUp,
      color: 'red'
    },
    {
      id: 'drift-prevention',
      name: 'Drift Prevention',
      description: 'Automated quality drift detection',
      icon: Zap,
      color: 'yellow'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getColorClasses = (color: string, status: string = 'healthy') => {
    const isHealthy = status === 'healthy';
    const opacity = isHealthy ? '' : 'opacity-60';
    
    switch (color) {
      case 'purple':
        return {
          bg: `from-purple-50 to-violet-50 ${opacity}`,
          border: 'border-purple-200/50',
          icon: 'text-purple-600 bg-purple-100',
          accent: 'bg-purple-500'
        };
      case 'blue':
        return {
          bg: `from-blue-50 to-cyan-50 ${opacity}`,
          border: 'border-blue-200/50',
          icon: 'text-blue-600 bg-blue-100',
          accent: 'bg-blue-500'
        };
      case 'green':
        return {
          bg: `from-green-50 to-emerald-50 ${opacity}`,
          border: 'border-green-200/50',
          icon: 'text-green-600 bg-green-100',
          accent: 'bg-green-500'
        };
      case 'indigo':
        return {
          bg: `from-indigo-50 to-blue-50 ${opacity}`,
          border: 'border-indigo-200/50',
          icon: 'text-indigo-600 bg-indigo-100',
          accent: 'bg-indigo-500'
        };
      case 'red':
        return {
          bg: `from-red-50 to-rose-50 ${opacity}`,
          border: 'border-red-200/50',
          icon: 'text-red-600 bg-red-100',
          accent: 'bg-red-500'
        };
      case 'yellow':
        return {
          bg: `from-yellow-50 to-amber-50 ${opacity}`,
          border: 'border-yellow-200/50',
          icon: 'text-yellow-600 bg-yellow-100',
          accent: 'bg-yellow-500'
        };
      default:
        return {
          bg: `from-gray-50 to-slate-50 ${opacity}`,
          border: 'border-gray-200/50',
          icon: 'text-gray-600 bg-gray-100',
          accent: 'bg-gray-500'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Systems Health</h2>
        <p className="text-sm text-gray-600">
          Real-time monitoring of all AI intelligence systems
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiSystems.map((system, index) => {
          const isEnabled = project?.aiSystemsEnabled.includes(system.id) ?? true;
          const systemHealth = project?.currentMetrics?.aiSystemsHealth[system.id];
          const status = systemHealth?.status || (isEnabled ? 'healthy' : 'offline');
          const colors = getColorClasses(system.color, status);

          return (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative overflow-hidden rounded-2xl p-4 border backdrop-blur-sm
                bg-gradient-to-br ${colors.bg} ${colors.border}
                ${!isEnabled ? 'grayscale' : ''}
              `}
            >
              {/* Status Indicator */}
              <div className="absolute top-3 right-3">
                {getStatusIcon(status)}
              </div>

              {/* System Icon and Info */}
              <div className="mb-4">
                <div className={`p-3 rounded-2xl ${colors.icon} inline-block mb-3`}>
                  <system.icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">
                  {system.name}
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  {system.description}
                </p>
              </div>

              {/* Metrics */}
              {isEnabled && systemHealth && (
                <div className="space-y-2">
                  {/* Accuracy */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Accuracy</span>
                    <span className="text-xs font-medium text-gray-900">
                      {Math.round(systemHealth.accuracy * 100)}%
                    </span>
                  </div>
                  
                  {/* Response Time */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Response</span>
                    <span className="text-xs font-medium text-gray-900">
                      {systemHealth.responseTime}ms
                    </span>
                  </div>
                  
                  {/* Load */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Load</span>
                    <span className="text-xs font-medium text-gray-900">
                      {Math.round(systemHealth.load * 100)}%
                    </span>
                  </div>

                  {/* Load Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${systemHealth.load * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-1.5 rounded-full ${colors.accent}`}
                    />
                  </div>
                </div>
              )}

              {/* Disabled State */}
              {!isEnabled && (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500">System Disabled</p>
                </div>
              )}

              {/* System Loading State */}
              {isEnabled && !systemHealth && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-xs text-gray-600">Initializing...</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {project?.currentMetrics ? 
                Object.values(project.currentMetrics.aiSystemsHealth).filter(s => s.status === 'healthy').length : 0
              }
            </div>
            <div className="text-xs text-gray-600">Healthy</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {project?.currentMetrics ? 
                Math.round(Object.values(project.currentMetrics.aiSystemsHealth).reduce((sum, s) => sum + s.accuracy, 0) / 
                Object.keys(project.currentMetrics.aiSystemsHealth).length * 100) : 0
              }%
            </div>
            <div className="text-xs text-gray-600">Avg Accuracy</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {project?.currentMetrics ? 
                Math.round(Object.values(project.currentMetrics.aiSystemsHealth).reduce((sum, s) => sum + s.responseTime, 0) / 
                Object.keys(project.currentMetrics.aiSystemsHealth).length) : 0
              }ms
            </div>
            <div className="text-xs text-gray-600">Avg Response</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {project?.aiSystemsEnabled.length || 0}
            </div>
            <div className="text-xs text-gray-600">Enabled</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AISystemsOverview; 