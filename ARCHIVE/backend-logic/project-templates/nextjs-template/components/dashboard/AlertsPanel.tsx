import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  Filter,
  Search,
  Clock,
  ExternalLink
} from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  projectId: string;
  projectName: string;
}

interface AlertsPanelProps {
  projectId: string;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ projectId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          projectId: projectId === 'master' ? '' : projectId, // Empty for all projects when master
          resolved: showResolved.toString(),
          limit: '20'
        });

        if (filter !== 'all') {
          params.append('severity', filter);
        }

        const response = await fetch(`/api/dashboard/alerts?${params}`);
        const result = await response.json();

        if (result.success) {
          setAlerts(result.data.alerts);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [projectId, filter, showResolved]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === '' || 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/dashboard/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertIds: [alertId], action: 'resolve' })
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">System Alerts</h2>
          <p className="text-sm text-gray-600">
            {filteredAlerts.length} alerts • {filteredAlerts.filter(a => !a.resolved).length} unresolved
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Severity Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Show Resolved Toggle */}
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Show resolved</span>
        </label>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No alerts found</h3>
            <p className="text-sm text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'All systems are running smoothly'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  p-4 rounded-2xl border transition-all duration-200
                  ${alert.resolved ? 'opacity-60' : ''}
                  ${getSeverityColor(alert.severity)}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Severity Icon */}
                    <div className="mt-0.5">
                      {getSeverityIcon(alert.severity)}
                    </div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wide opacity-75">
                          {alert.type}
                        </span>
                        {alert.resolved && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Resolved
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium mb-1">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center space-x-3 text-xs opacity-75">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(alert.timestamp)}</span>
                        </div>
                        {projectId === 'master' && (
                          <span>• {alert.projectName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!alert.resolved && (
                    <div className="flex items-center space-x-2 ml-3">
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                        title="Mark as resolved"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Summary */}
      {filteredAlerts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200/50">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-red-600">
                {filteredAlerts.filter(a => a.severity === 'critical' && !a.resolved).length}
              </div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {filteredAlerts.filter(a => a.severity === 'high' && !a.resolved).length}
              </div>
              <div className="text-xs text-gray-600">High</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                {filteredAlerts.filter(a => a.severity === 'medium' && !a.resolved).length}
              </div>
              <div className="text-xs text-gray-600">Medium</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {filteredAlerts.filter(a => a.severity === 'low' && !a.resolved).length}
              </div>
              <div className="text-xs text-gray-600">Low</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AlertsPanel; 