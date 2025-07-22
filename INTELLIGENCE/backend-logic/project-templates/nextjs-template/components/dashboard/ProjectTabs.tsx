import React from 'react';
import { motion } from 'framer-motion';
import { Star, Activity, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  healthScore: number;
  currentMetrics?: {
    alertCount: number;
  };
}

interface ProjectTabsProps {
  projects: Project[];
  activeProjectId: string;
  onProjectChange: (projectId: string) => void;
}

const ProjectTabs: React.FC<ProjectTabsProps> = ({ 
  projects, 
  activeProjectId, 
  onProjectChange 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'maintenance': return <Clock className="w-3 h-3" />;
      case 'error': return <AlertTriangle className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {projects.map((project) => {
        const isActive = project.id === activeProjectId;
        const isMaster = project.id === 'master';
        
        return (
          <motion.button
            key={project.id}
            onClick={() => onProjectChange(project.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 min-w-max
              ${isActive 
                ? 'bg-white shadow-lg border border-blue-200' 
                : 'bg-white/60 hover:bg-white/80 border border-transparent'
              }
            `}
          >
            {/* Master Project Badge */}
            {isMaster && (
              <div className="absolute -top-1 -left-1 p-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                <Star className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Status Indicator */}
            <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />

            {/* Project Info */}
            <div className="flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                  {project.name.length > 20 ? `${project.name.substring(0, 20)}...` : project.name}
                </span>
                
                {/* Alert Badge */}
                {project.currentMetrics?.alertCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                    {project.currentMetrics.alertCount}
                  </span>
                )}
              </div>

              {/* Health Score */}
              <div className={`
                flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-medium
                ${getHealthColor(project.healthScore)}
              `}>
                {getStatusIcon(project.status)}
                <span>{project.healthScore}%</span>
              </div>
            </div>

            {/* Active Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default ProjectTabs; 