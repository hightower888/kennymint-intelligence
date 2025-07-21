/**
 * Master Dashboard Server
 * Secure, real-time monitoring dashboard for all projects
 */

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import { AuthManager } from '../infrastructure/auth-manager';
import { DashboardDataCollector } from './data-collector';
import { ProjectMonitor } from './project-monitor';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.DASHBOARD_URL || 'http://localhost:4000',
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(cors({
  origin: process.env.DASHBOARD_URL || 'http://localhost:4000',
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dashboard-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 3600000 // 1 hour
  }
}));

// Initialize services
const authManager = new AuthManager();
const dataCollector = new DashboardDataCollector();
const projectMonitor = new ProjectMonitor();

// Authentication middleware
const requireAuth = async (req: any, res: any, next: any) => {
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const isValid = await authManager.isAuthenticated();
    if (!isValid) {
      req.session.authenticated = false;
      return res.status(401).json({ error: 'Session expired' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Routes

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const session = await authManager.authenticate(email, password);
    req.session.authenticated = true;
    req.session.user = session;
    
    res.json({
      success: true,
      user: {
        email: session.email,
        permissions: session.permissions
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Dashboard data endpoint
app.get('/api/dashboard/overview', requireAuth, async (req, res) => {
  try {
    const data = await dataCollector.getOverviewData();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Projects list endpoint
app.get('/api/projects', requireAuth, async (req, res) => {
  try {
    const projects = await dataCollector.getAllProjects();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Project details endpoint
app.get('/api/projects/:projectId', requireAuth, async (req, res) => {
  try {
    const projectData = await dataCollector.getProjectDetails(req.params.projectId);
    res.json(projectData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Project health endpoint
app.get('/api/projects/:projectId/health', requireAuth, async (req, res) => {
  try {
    const health = await projectMonitor.getProjectHealth(req.params.projectId);
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Backend logic usage endpoint
app.get('/api/projects/:projectId/usage', requireAuth, async (req, res) => {
  try {
    const usage = await dataCollector.getBackendUsage(req.params.projectId);
    res.json(usage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Rule sets visualization endpoint
app.get('/api/projects/:projectId/rules', requireAuth, async (req, res) => {
  try {
    const rules = await dataCollector.getRuleSetUsage(req.params.projectId);
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Brand guidelines endpoint
app.get('/api/projects/:projectId/brand', requireAuth, async (req, res) => {
  try {
    const brand = await dataCollector.getBrandGuidelines(req.params.projectId);
    res.json(brand);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Real-time monitoring endpoint
app.get('/api/monitoring/realtime', requireAuth, async (req, res) => {
  try {
    const monitoring = await projectMonitor.getRealTimeData();
    res.json(monitoring);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket for real-time updates
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  try {
    // Validate token
    const isValid = await authManager.validateAccessToken(token);
    if (!isValid) {
      return next(new Error('Authentication failed'));
    }
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log('Dashboard client connected');
  
  // Join project-specific rooms
  socket.on('subscribe:project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Client subscribed to project: ${projectId}`);
  });
  
  // Unsubscribe from project
  socket.on('unsubscribe:project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`Client unsubscribed from project: ${projectId}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Dashboard client disconnected');
  });
});

// Start real-time monitoring
projectMonitor.startMonitoring((data) => {
  // Emit updates to relevant rooms
  if (data.projectId) {
    io.to(`project:${data.projectId}`).emit('project:update', data);
  }
  
  // Emit to all connected clients for overview updates
  io.emit('overview:update', data);
});

// Serve dashboard UI
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Dashboard error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.DASHBOARD_PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Master Dashboard running on http://localhost:${PORT}`);
  console.log(`🔐 Authentication required for access`);
  console.log(`📊 Real-time monitoring active`);
}); 