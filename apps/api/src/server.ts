import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { config } from './config/env.js';
import { eventsRoutes } from './routes/events.routes.js';
import { tasksRoutes } from './routes/tasks.routes.js';
import { venuesRoutes } from './routes/venues.routes.js';

const fastify = Fastify({
  logger: {
    level: config.isDevelopment ? 'debug' : 'info',
  },
});

// Register plugins
await fastify.register(cors, {
  origin: config.isDevelopment ? ['http://localhost:3000'] : [],
  credentials: true,
});

await fastify.register(helmet, {
  contentSecurityPolicy: config.isProduction,
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API Routes
fastify.register(eventsRoutes, { prefix: '/api/events' });
fastify.register(tasksRoutes, { prefix: '/api/tasks' });
fastify.register(venuesRoutes, { prefix: '/api/venues' });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: config.host });
    fastify.log.info(`Server listening on http://${config.host}:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
