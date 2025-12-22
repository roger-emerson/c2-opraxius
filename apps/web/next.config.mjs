/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile internal packages and Three.js ecosystem
  transpilePackages: ['@c2/shared', '@c2/auth', 'three', '@react-three/fiber', '@react-three/drei'],
};

export default nextConfig;

