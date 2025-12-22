import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@c2/shared', '@c2/auth'],
  // Ensure React is resolved to a single instance (fixes ReactCurrentBatchConfig error)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    };
    return config;
  },
};

export default nextConfig;
