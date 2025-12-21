import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import type { Env } from './lib/db';
import { createDb } from './lib/db';
import { createRedis, CacheService } from './lib/redis';
import { eventsRoutes } from './routes/events';
import { tasksRoutes } from './routes/tasks';
import { venuesRoutes } from './routes/venues';
import { activityRoutes } from './routes/activity';
import type { AppBindings } from './types';

const app = new Hono<AppBindings>();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());

// Hostname blocking middleware - only allow custom domains
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const hostname = url.hostname;
  const path = url.pathname;
  const userAgent = c.req.header('user-agent') || '';

  const allowedDomains = [
    'dev.api.opraxius.com',      // development environment
    'staging.api.opraxius.com',  // staging environment
    'api.opraxius.com',          // production environment
    'localhost',                 // local development
  ];

  // Allow health checks from CI/CD tools (GitHub Actions, curl, etc.)
  // This enables deployment verification while maintaining security for other endpoints
  if (path === '/health' && (userAgent.includes('curl') || userAgent.includes('GitHub'))) {
    return next();
  }

  if (!allowedDomains.includes(hostname)) {
    return c.text('Not Found', 404);
  }

  await next();
});

// Request tracing middleware for debugging
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();
  
  // Log incoming request
  console.log(`📥 [${requestId}] ${c.req.method} ${c.req.path}`);
  
  // Add request ID to response headers for correlation
  c.header('X-Request-ID', requestId);
  
  await next();
  
  // Log response with timing
  const duration = Date.now() - startTime;
  console.log(`📤 [${requestId}] ${c.res.status} ${duration}ms`);
});

// CORS configuration
app.use('*', cors({
  origin: [
    'http://localhost:3000',              // local development
    'https://dev.web.opraxius.com',       // development environment
    'https://staging.web.opraxius.com',   // staging environment
    'https://dashboard.opraxius.com',     // production environment
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize database and cache on each request
app.use('*', async (c, next) => {
  try {
    const db = createDb(c.env);
    c.set('db', db);

    const redis = createRedis(c.env);
    c.set('cache', new CacheService(redis));

    await next();
  } catch (error) {
    console.error('Failed to initialize services:', error);
    return c.json({ error: 'Service initialization failed' }, 500);
  }
});

// Health check endpoint (no auth required)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'unknown',
  });
});

// API version endpoint
app.get('/', (c) => {
  return c.json({
    name: 'C2 Command Center API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT || 'unknown',
  });
});

// Mount route modules
app.route('/api/events', eventsRoutes);
app.route('/api/tasks', tasksRoutes);
app.route('/api/venues', venuesRoutes);
app.route('/api/activity', activityRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found', path: c.req.path }, 404);
});

// Error handler with enhanced debugging
app.onError((err, c) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const errorInfo = {
    requestId,
    message: err.message,
    name: err.name,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString(),
    env: c.env.ENVIRONMENT || 'unknown',
  };
  
  // Log structured error for wrangler tail
  console.error('🔴 [ERROR]', JSON.stringify(errorInfo, null, 2));
  
  return c.json({ 
    error: 'Internal server error',
    requestId, // Include for tracking in logs
    timestamp: errorInfo.timestamp,
  }, 500);
});

// Export for Cloudflare Workers
export default app;

