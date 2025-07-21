import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Brain, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  healthScore: number;
  currentMetrics?: {
    systemMetrics: {
      cpu: number;
      memory: number;
      disk: number;
    };
    aiSystemsHealth: Record<string, {
      status: string;
      accuracy: number;
      responseTime: number;
      load: number;
    }>;
    applicationHealth: {
      uptime: number;
      requestsPerMinute: number;
      errorRate: number;
      averageResponseTime: number;
    };
  };
}

interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  averageHealthScore: number;
  totalAlerts: number;
  criticalAlerts: number;
}

interface SystemMetricsGridProps {
  project?: Project;
  overview: DashboardOverview;
}

const SystemMetricsGrid: React.FC<SystemMetricsGridProps> = ({ project, overview }) => {
  const metrics = project?.currentMetrics;

  // Calculate AI systems summary
  const aiSystemsCount = metrics ? Object.keys(metrics.aiSystemsHealth).length : 0;
  const healthyAISystems = metrics ? 
    Object.values(metrics.aiSystemsHealth).filter(sys => sys.status === 'healthy').length : 0;
  const avgAIAccuracy = metrics ? 
    Object.values(metrics.aiSystemsHealth).reduce((sum, sys) => sum + sys.accuracy, 0) / aiSystemsCount : 0;

  const cards = [
    {
      title: 'System Health',
      value: project?.healthScore || 0,
      unit: '%',
      icon: Activity,
      color: project?.healthScore >= 90 ? 'green' : project?.healthScore >= 70 ? 'yellow' : 'red',
      description: 'Overall system health score',
      trend: 'stable'
    },
    {
      title: 'CPU Usage',
      value: metrics?.systemMetrics.cpu || 0,
      unit: '%',
      icon: Cpu,
      color: (metrics?.systemMetrics.cpu || 0) > 80 ? 'red' : (metrics?.systemMetrics.cpu || 0) > 60 ? 'yellow' : 'green',
      description: 'Current CPU utilization',
      trend: 'stable'
    },
    {
      title: 'Memory Usage',
      value: metrics?.systemMetrics.memory || 0,
      unit: '%',
      icon: HardDrive,
      color: (metrics?.systemMetrics.memory || 0) > 85 ? 'red' : (metrics?.systemMetrics.memory || 0) > 70 ? 'yellow' : 'green',
      description: 'RAM utilization',
      trend: 'stable'
    },
    {
      title: 'AI Systems',
      value: healthyAISystems,
      unit: `/${aiSystemsCount}`,
      icon: Brain,
      color: healthyAISystems === aiSystemsCount ? 'green' : healthyAISystems > aiSystemsCount * 0.7 ? 'yellow' : 'red',
      description: 'Healthy AI systems',
      trend: 'stable'
    },
    {
      title: 'AI Accuracy',
      value: Math.round(avgAIAccuracy * 100),
      unit: '%',
      icon: Shield,
      color: avgAIAccuracy > 0.9 ? 'green' : avgAIAccuracy > 0.8 ? 'yellow' : 'red',
      description: 'Average AI accuracy',
      trend: 'stable'
    },
    {
      title: 'Response Time',
      value: metrics?.applicationHealth.averageResponseTime || 0,
      unit: 'ms',
      icon: Clock,
      color: (metrics?.applicationHealth.averageResponseTime || 0) < 200 ? 'green' : (metrics?.applicationHealth.averageResponseTime || 0) < 500 ? 'yellow' : 'red',
      description: 'Average response time',
      trend: 'stable'
    },
    {
      title: 'Active Projects',
      value: overview.activeProjects,
      unit: `/${overview.totalProjects}`,
      icon: Activity,
      color: 'blue',
      description: 'Active monitoring projects',
      trend: 'stable'
    },
    {
      title: 'Critical Alerts',
      value: overview.criticalAlerts,
      unit: '',
      icon: AlertCircle,
      color: overview.criticalAlerts === 0 ? 'green' : overview.criticalAlerts < 3 ? 'yellow' : 'red',
      description: 'Unresolved critical alerts',
      trend: 'stable'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'from-green-50 to-emerald-50',
          border: 'border-green-200/50',
          icon: 'text-green-600 bg-green-100',
          value: 'text-green-700',
          trend: 'text-green-600'
        };
      case 'yellow':
        return {
          bg: 'from-yellow-50 to-amber-50',
          border: 'border-yellow-200/50',
          icon: 'text-yellow-600 bg-yellow-100',
          value: 'text-yellow-700',
          trend: 'text-yellow-600'
        };
      case 'red':
        return {
          bg: 'from-red-50 to-rose-50',
          border: 'border-red-200/50',
          icon: 'text-red-600 bg-red-100',
          value: 'text-red-700',
          trend: 'text-red-600'
        };
      case 'blue':
        return {
          bg: 'from-blue-50 to-indigo-50',
          border: 'border-blue-200/50',
          icon: 'text-blue-600 bg-blue-100',
          value: 'text-blue-700',
          trend: 'text-blue-600'
        };
      default:
        return {
          bg: 'from-gray-50 to-slate-50',
          border: 'border-gray-200/50',
          icon: 'text-gray-600 bg-gray-100',
          value: 'text-gray-700',
          trend: 'text-gray-600'
        };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3" />;
      case 'down': return <TrendingDown className="w-3 h-3" />;
      default: return <CheckCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const colors = getColorClasses(card.color);
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative overflow-hidden rounded-2xl p-4 border backdrop-blur-sm
              bg-gradient-to-br ${colors.bg} ${colors.border}
            `}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45" />
            </div>

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${colors.icon}`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <div className={`flex items-center space-x-1 text-xs ${colors.trend}`}>
                  {getTrendIcon(card.trend)}
                </div>
              </div>

              {/* Value */}
              <div className="mb-2">
                <div className={`text-2xl font-bold ${colors.value}`}>
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  <span className="text-sm font-medium opacity-70 ml-1">
                    {card.unit}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-gray-600 font-medium">
                {card.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {card.description}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SystemMetricsGrid; 