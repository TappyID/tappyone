/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 PERFORMANCE MÁXIMA - USAR TODO PODER DO PC
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 🔥 OTIMIZAÇÕES DE COMPILAÇÃO
  swcMinify: true, // Usar SWC (Rust) - muito mais rápido que Terser
  // compiler.removeConsole não é compatível com Turbopack - removido
  // ⚡ OTIMIZAÇÕES DE BUILD
  productionBrowserSourceMaps: false, // Desabilita sourcemaps pesados
  poweredByHeader: false,
  reactStrictMode: true,
  // 🎯 OTIMIZAÇÕES DE PERFORMANCE
  experimental: {
    optimizeCss: true, // Otimizar CSS
    optimizePackageImports: ['lucide-react', 'react-icons', 'framer-motion'], // Tree-shaking agressivo
    // turbotrace - analisa imports mais rápido
  },
  // 📦 CHUNKING OTIMIZADO
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Aumentar limite de chunks em DEV para compilar mais rápido
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Separar vendors grandes em chunks
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier())
              },
              name(module) {
                const hash = require('crypto').createHash('sha1')
                hash.update(module.identifier())
                return hash.digest('hex').substring(0, 8)
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
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
        port: '3001',
        pathname: '/**',
      }
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081',
    NEXT_PUBLIC_WAHA_API_URL: process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001',
    NEXT_PUBLIC_WAHA_API_KEY: process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey',
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
