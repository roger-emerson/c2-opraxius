/**
 * Vitest Setup File
 * Runs before each test file
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/esg_test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6380';
process.env.JWT_SECRET = 'test-jwt-secret-do-not-use-in-production';
process.env.AUTH0_DOMAIN = 'test.auth0.com';
process.env.AUTH0_CLIENT_ID = 'test-client-id';
process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';

// Global test lifecycle hooks
beforeAll(async () => {
  // Setup that runs once before all tests in a file
  console.log('🧪 Test suite starting...');
});

afterAll(async () => {
  // Cleanup that runs once after all tests in a file
  console.log('🧪 Test suite complete.');
});

beforeEach(async () => {
  // Reset any mocks before each test
});

afterEach(async () => {
  // Clean up after each test
});

// Custom matchers (optional)
// expect.extend({
//   toBeValidUUID(received) {
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//     const pass = uuidRegex.test(received);
//     return {
//       message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`,
//       pass,
//     };
//   },
// });

