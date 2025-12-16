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
import type { AppBindings } from './types';

const app = new Hono<AppBindings>();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());

// CORS configuration
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://esg-web-staging.pages.dev',
    // Add your custom domain here when ready
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
    name: 'ESG Command Center API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT || 'unknown',
  });
});

// Mount route modules
app.route('/api/events', eventsRoutes);
app.route('/api/tasks', tasksRoutes);
app.route('/api/venues', venuesRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Export for Cloudflare Workers
export default app;

