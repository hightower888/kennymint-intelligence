import { NextApiRequest, NextApiResponse } from 'next';
import { DashboardManager } from '../../../src/dashboard/dashboard-manager';

// Global dashboard manager instance (shared across routes)
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
  const manager = await getDashboardManager();
  const { projectId, severity, resolved, limit = '50' } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        // Get alerts from all projects or specific project
        const projects = projectId ? [manager.getProject(projectId as string)] : manager.getAllProjects();
        const validProjects = projects.filter(p => p !== undefined);
        
        if (projectId && validProjects.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Project not found'
          });
        }

        let allAlerts: any[] = [];
        
        for (const project of validProjects) {
          const metrics = manager.getProjectMetrics(project.id, 24); // Last 24 hours
          const projectAlerts = metrics.flatMap(m => 
            m.alerts.map(alert => ({
              ...alert,
              projectId: project.id,
              projectName: project.name
            }))
          );
          allAlerts.push(...projectAlerts);
        }

        // Apply filters
        if (severity) {
          allAlerts = allAlerts.filter(alert => alert.severity === severity);
        }

        if (resolved !== undefined) {
          const isResolved = resolved === 'true';
          allAlerts = allAlerts.filter(alert => alert.resolved === isResolved);
        }

        // Sort by timestamp (newest first) and limit
        allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const limitNum = parseInt(limit as string, 10);
        allAlerts = allAlerts.slice(0, limitNum);

        // Calculate summary statistics
        const summary = {
          total: allAlerts.length,
          critical: allAlerts.filter(a => a.severity === 'critical').length,
          high: allAlerts.filter(a => a.severity === 'high').length,
          medium: allAlerts.filter(a => a.severity === 'medium').length,
          low: allAlerts.filter(a => a.severity === 'low').length,
          resolved: allAlerts.filter(a => a.resolved).length,
          unresolved: allAlerts.filter(a => !a.resolved).length,
          byProject: validProjects.map(project => ({
            projectId: project.id,
            projectName: project.name,
            alertCount: allAlerts.filter(a => a.projectId === project.id).length
          }))
        };

        res.status(200).json({
          success: true,
          data: {
            alerts: allAlerts,
            summary,
            filters: {
              projectId: projectId || 'all',
              severity: severity || 'all',
              resolved: resolved || 'all',
              limit: limitNum
            }
          }
        });
      } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch alerts',
          message: error.message
        });
      }
      break;

    case 'POST':
      try {
        const { alertIds, action } = req.body;

        if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Alert IDs array is required'
          });
        }

        if (!action || !['resolve', 'unresolve', 'delete'].includes(action)) {
          return res.status(400).json({
            success: false,
            error: 'Action must be one of: resolve, unresolve, delete'
          });
        }

        // For this demo, we'll simulate the alert management
        // In a real implementation, you'd update the alerts in the dashboard manager
        let updatedCount = 0;

        switch (action) {
          case 'resolve':
            // Mark alerts as resolved
            updatedCount = alertIds.length;
            break;
          case 'unresolve':
            // Mark alerts as unresolved
            updatedCount = alertIds.length;
            break;
          case 'delete':
            // Delete alerts
            updatedCount = alertIds.length;
            break;
        }

        res.status(200).json({
          success: true,
          data: {
            message: `Successfully ${action}d ${updatedCount} alerts`,
            updatedCount,
            action,
            alertIds
          }
        });
      } catch (error) {
        console.error('Alert action error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to perform alert action',
          message: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ 
        success: false, 
        error: `Method ${req.method} not allowed` 
      });
  }
} 