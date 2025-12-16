import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@esg/shared', '@esg/auth'],
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei'],
  },
};

export default nextConfig;
