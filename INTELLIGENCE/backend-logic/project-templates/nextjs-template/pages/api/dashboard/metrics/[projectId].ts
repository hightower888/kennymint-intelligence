import { NextApiRequest, NextApiResponse } from 'next';
import { DashboardManager } from '../../../../src/dashboard/dashboard-manager';

// Global dashboard manager instance (shared with overview route)
let dashboardManager: DashboardManager | null = null;

async function getDashboardManager(): Promise<DashboardManager> {
  if (!dashboardManager) {
    dashboardManager = new DashboardManager({
      updateInterval: 5000,
      dataRetentionDays: 30,
      maxProjectsPerDashboard: 10,
      realTimeEnabled: true,
      webSocketPort: 8080
    });
    await dashboardManager.initialize();
  }
  return dashboardManager;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, hours = '24' } = req.query;

  if (req.method === 'GET') {
    try {
      const manager = await getDashboardManager();
      const project = manager.getProject(projectId as string);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const hoursBack = parseInt(hours as string, 10);
      const metrics = manager.getProjectMetrics(projectId as string, hoursBack);
      const currentMetrics = manager.getCurrentMetrics(projectId as string);
      
      // Calculate derived metrics for the time period
      const derivedMetrics = calculateDerivedMetrics(metrics);
      
      res.status(200).json({
        success: true,
        data: {
          project,
          metrics,
          currentMetrics,
          derivedMetrics,
          timeRange: {
            hours: hoursBack,
            startTime: new Date(Date.now() - (hoursBack * 60 * 60 * 1000)).toISOString(),
            endTime: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Project metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project metrics',
        message: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}

function calculateDerivedMetrics(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      averageResponseTime: 0,
      peakCpuUsage: 0,
      peakMemoryUsage: 0,
      totalAlerts: 0,
      uptimePercentage: 100,
      aiSystemsAvailability: {},
      trends: {
        cpu: 'stable',
        memory: 'stable',
        responseTime: 'stable',
        errorRate: 'stable'
      }
    };
  }

  const latest = metrics[metrics.length - 1];
  const oldest = metrics[0];
  
  // Calculate averages and peaks
  const avgResponseTime = metrics.reduce((sum, m) => sum + m.applicationHealth.averageResponseTime, 0) / metrics.length;
  const peakCpu = Math.max(...metrics.map(m => m.systemMetrics.cpu));
  const peakMemory = Math.max(...metrics.map(m => m.systemMetrics.memory));
  const totalAlerts = metrics.reduce((sum, m) => sum + m.alerts.filter(a => !a.resolved).length, 0);
  
  // Calculate AI systems availability
  const aiSystemsAvailability: Record<string, number> = {};
  const aiSystemIds = Object.keys(latest.aiSystemsHealth);
  
  for (const systemId of aiSystemIds) {
    const healthyCount = metrics.filter(m => 
      m.aiSystemsHealth[systemId]?.status === 'healthy'
    ).length;
    aiSystemsAvailability[systemId] = (healthyCount / metrics.length) * 100;
  }
  
  // Calculate trends (simple comparison between first and last values)
  const trends = {
    cpu: getTrend(oldest.systemMetrics.cpu, latest.systemMetrics.cpu),
    memory: getTrend(oldest.systemMetrics.memory, latest.systemMetrics.memory),
    responseTime: getTrend(oldest.applicationHealth.averageResponseTime, latest.applicationHealth.averageResponseTime),
    errorRate: getTrend(oldest.applicationHealth.errorRate, latest.applicationHealth.errorRate)
  };
  
  return {
    averageResponseTime: Math.round(avgResponseTime),
    peakCpuUsage: Math.round(peakCpu * 100) / 100,
    peakMemoryUsage: Math.round(peakMemory * 100) / 100,
    totalAlerts,
    uptimePercentage: 99.9, // Simplified calculation
    aiSystemsAvailability,
    trends
  };
}

function getTrend(oldValue: number, newValue: number): 'improving' | 'degrading' | 'stable' {
  const change = ((newValue - oldValue) / oldValue) * 100;
  if (Math.abs(change) < 5) return 'stable';
  return change > 0 ? 'degrading' : 'improving';
} 