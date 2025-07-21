import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Activity, 
  Cpu, 
  Clock, 
  BarChart3,
  LineChart,
  Calendar
} from 'lucide-react';

interface ProjectMetrics {
  timestamp: string;
  systemMetrics: {
    cpu: number;
    memory: number;
    disk: number;
  };
  aiSystemsHealth: Record<string, {
    accuracy: number;
    responseTime: number;
  }>;
  applicationHealth: {
    averageResponseTime: number;
    errorRate: number;
  };
}

interface PerformanceChartsProps {
  projectId: string;
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ projectId }) => {
  const [metrics, setMetrics] = useState<ProjectMetrics[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '24h' ? 24 : 168;
        
        const response = await fetch(`/api/dashboard/metrics/${projectId}?hours=${hours}`);
        const result = await response.json();

        if (result.success) {
          setMetrics(result.data.metrics || []);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [projectId, timeRange]);

  // Simple chart component for demonstration
  const SimpleChart: React.FC<{
    data: number[];
    color: string;
    label: string;
    unit: string;
    height?: number;
  }> = ({ data, color, label, unit, height = 60 }) => {
    if (data.length === 0) return (
      <div className={`h-${height} flex items-center justify-center text-gray-400 text-sm`}>
        No data available
      </div>
    );

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`var(--color-${color}-500)`} stopOpacity={0.8} />
              <stop offset="100%" stopColor={`var(--color-${color}-500)`} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          {/* Chart area */}
          <path
            d={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((value - min) / range) * 100;
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
            }).join(' ')}
            stroke={`var(--color-${color}-500)`}
            strokeWidth="2"
            fill="none"
            className="drop-shadow-sm"
          />
          
          {/* Fill area */}
          <path
            d={`${data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((value - min) / range) * 100;
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
            }).join(' ')} L 100% 100% L 0% 100% Z`}
            fill={`url(#gradient-${color})`}
          />
        </svg>
        
        {/* Current value */}
        <div className="absolute top-2 right-2 text-xs font-medium">
          {data[data.length - 1]?.toFixed(1)}{unit}
        </div>
      </div>
    );
  };

  const cpuData = metrics.map(m => m.systemMetrics.cpu);
  const memoryData = metrics.map(m => m.systemMetrics.memory);
  const responseTimeData = metrics.map(m => m.applicationHealth.averageResponseTime);
  const errorRateData = metrics.map(m => m.applicationHealth.errorRate);

  // Calculate AI accuracy average across all systems
  const aiAccuracyData = metrics.map(m => {
    const accuracies = Object.values(m.aiSystemsHealth).map(sys => sys.accuracy);
    return accuracies.length > 0 ? (accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length) * 100 : 0;
  });

  const charts = [
    {
      title: 'CPU Usage',
      icon: Cpu,
      data: cpuData,
      color: 'blue',
      unit: '%',
      description: 'System CPU utilization over time'
    },
    {
      title: 'Memory Usage',
      icon: Activity,
      data: memoryData,
      color: 'green',
      unit: '%',
      description: 'RAM consumption patterns'
    },
    {
      title: 'Response Time',
      icon: Clock,
      data: responseTimeData,
      color: 'purple',
      unit: 'ms',
      description: 'Application response latency'
    },
    {
      title: 'AI Accuracy',
      icon: TrendingUp,
      data: aiAccuracyData,
      color: 'indigo',
      unit: '%',
      description: 'Average AI system accuracy'
    },
    {
      title: 'Error Rate',
      icon: BarChart3,
      data: errorRateData,
      color: 'red',
      unit: '%',
      description: 'Application error frequency'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Performance Analytics</h2>
          <p className="text-sm text-gray-600">
            Real-time metrics and trends analysis
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts.map((chart, index) => (
            <motion.div
              key={chart.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-200"
            >
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl bg-${chart.color}-100 text-${chart.color}-600`}>
                    <chart.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {chart.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {chart.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="mb-4">
                <SimpleChart
                  data={chart.data}
                  color={chart.color}
                  label={chart.title}
                  unit={chart.unit}
                  height={80}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-600">Min</div>
                  <div className="text-sm font-medium">
                    {chart.data.length > 0 ? Math.min(...chart.data).toFixed(1) : '0'}{chart.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Avg</div>
                  <div className="text-sm font-medium">
                    {chart.data.length > 0 ? 
                      (chart.data.reduce((sum, val) => sum + val, 0) / chart.data.length).toFixed(1) : '0'
                    }{chart.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Max</div>
                  <div className="text-sm font-medium">
                    {chart.data.length > 0 ? Math.max(...chart.data).toFixed(1) : '0'}{chart.unit}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Additional Styles for Colors */}
      <style jsx>{`
        :root {
          --color-blue-500: #3b82f6;
          --color-green-500: #10b981;
          --color-purple-500: #8b5cf6;
          --color-indigo-500: #6366f1;
          --color-red-500: #ef4444;
        }
      `}</style>
    </motion.div>
  );
};

export default PerformanceCharts; 