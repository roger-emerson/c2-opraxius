import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Global setup/teardown
    globalSetup: './global-setup.ts',
    setupFiles: ['./setup.ts'],
    
    // Test patterns
    include: [
      '../unit/**/*.test.ts',
      '../integration/**/*.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '../e2e/**', // E2E tests run separately with Playwright
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../coverage',
      include: [
        'apps/api/src/**/*.ts',
        'apps/web/src/**/*.ts',
        'packages/*/src/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporter
    reporters: ['verbose'],
    
    // Pool configuration
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // For database tests
      },
    },
  },
  
  // Path aliases (match tsconfig)
  resolve: {
    alias: {
      '@c2/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@c2/database': path.resolve(__dirname, '../../packages/database/src'),
      '@c2/api': path.resolve(__dirname, '../../apps/api/src'),
      '@c2/web': path.resolve(__dirname, '../../apps/web/src'),
    },
  },
});

