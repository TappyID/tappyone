/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'server.tappy.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.deepseek.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '159.65.34.199',
        port: '3000',
        pathname: '/**',
      }
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/',
    NEXT_PUBLIC_WAHA_API_URL: process.env.WAHA_API_URL || 'http://159.65.34.199:3001',
    NEXT_PUBLIC_WAHA_API_KEY: process.env.WAHA_API_KEY || 'tappyone-waha-2024-secretkey',
  },
  // Comentado para permitir que as rotas API do Next.js funcionem
  // async rewrites() {
  //   const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/';
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${backendUrl}/api/:path*`,
  //     },
  //   ]
  // },
}

module.exports = nextConfig
