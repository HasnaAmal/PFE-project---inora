/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },
};

export default nextConfig;