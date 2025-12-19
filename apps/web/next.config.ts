import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@c2/shared', '@c2/auth'],
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei'],
  },
};

export default nextConfig;
