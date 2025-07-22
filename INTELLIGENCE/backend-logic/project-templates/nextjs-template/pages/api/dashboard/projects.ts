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

  switch (req.method) {
    case 'GET':
      try {
        const projects = manager.getAllProjects();
        const projectsWithStatus = projects.map(project => ({
          ...project,
          currentMetrics: manager.getCurrentMetrics(project.id),
          metricsCount: manager.getProjectMetrics(project.id, 24).length
        }));

        res.status(200).json({
          success: true,
          data: {
            projects: projectsWithStatus,
            count: projects.length
          }
        });
      } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch projects',
          message: error.message
        });
      }
      break;

    case 'POST':
      try {
        const { name, description, aiSystemsEnabled } = req.body;

        if (!name || typeof name !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Project name is required and must be a string'
          });
        }

        // Validate AI systems
        const validAISystems = [
          'error-prevention',
          'rule-enforcement',
          'knowledge-graph',
          'health-analysis',
          'drift-prevention',
          'ai-coordinator'
        ];

        const enabledSystems = aiSystemsEnabled || validAISystems;
        const invalidSystems = enabledSystems.filter(sys => !validAISystems.includes(sys));
        
        if (invalidSystems.length > 0) {
          return res.status(400).json({
            success: false,
            error: `Invalid AI systems: ${invalidSystems.join(', ')}`,
            validSystems: validAISystems
          });
        }

        const projectId = await manager.createProject({
          name,
          description,
          status: 'active',
          aiSystemsEnabled: enabledSystems
        });

        const project = manager.getProject(projectId);

        res.status(201).json({
          success: true,
          data: {
            project,
            message: 'Project created successfully'
          }
        });
      } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create project',
          message: error.message
        });
      }
      break;

    case 'DELETE':
      try {
        const { projectId } = req.body;

        if (!projectId) {
          return res.status(400).json({
            success: false,
            error: 'Project ID is required'
          });
        }

        const deleted = await manager.deleteProject(projectId);

        if (!deleted) {
          return res.status(404).json({
            success: false,
            error: 'Project not found'
          });
        }

        res.status(200).json({
          success: true,
          data: {
            message: 'Project deleted successfully',
            projectId
          }
        });
      } catch (error) {
        console.error('Delete project error:', error);
        
        if (error.message.includes('Cannot delete master project')) {
          return res.status(403).json({
            success: false,
            error: 'Cannot delete master project'
          });
        }

        res.status(500).json({
          success: false,
          error: 'Failed to delete project',
          message: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ 
        success: false, 
        error: `Method ${req.method} not allowed` 
      });
  }
} 