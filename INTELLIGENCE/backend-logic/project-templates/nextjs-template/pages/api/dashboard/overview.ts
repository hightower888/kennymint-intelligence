import { NextApiRequest, NextApiResponse } from 'next';
import { DashboardManager } from '../../../src/dashboard/dashboard-manager';

// Global dashboard manager instance
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
  if (req.method === 'GET') {
    try {
      const manager = await getDashboardManager();
      const overview = manager.getSystemOverview();
      const projects = manager.getAllProjects();
      
      // Get current metrics for each project
      const projectsWithMetrics = projects.map(project => {
        const currentMetrics = manager.getCurrentMetrics(project.id);
        return {
          ...project,
          currentMetrics: currentMetrics ? {
            timestamp: currentMetrics.timestamp,
            systemMetrics: currentMetrics.systemMetrics,
            aiSystemsHealth: currentMetrics.aiSystemsHealth,
            applicationHealth: currentMetrics.applicationHealth,
            alertCount: currentMetrics.alerts.filter(a => !a.resolved).length
          } : null
        };
      });
      
      res.status(200).json({
        success: true,
        data: {
          overview,
          projects: projectsWithMetrics,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Dashboard overview error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard overview',
        message: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
} 