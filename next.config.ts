import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shadcnstudio.com',
        pathname: '/**'
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

export default nextConfig
