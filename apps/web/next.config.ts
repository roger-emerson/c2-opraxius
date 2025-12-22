import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@c2/shared', '@c2/auth', 'three', '@react-three/fiber', '@react-three/drei'],
  // Force single React instance by ensuring all packages resolve to the same version
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure React is deduplicated in client bundles
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use require.resolve to find the actual installed package
        'react': require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      };
    }
    return config;
  },
};

export default nextConfig;
