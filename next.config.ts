import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shadcnstudio.com',
        pathname: '/**'
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@tabler/icons-react', 'recharts', 'motion']
  }
}

export default async () => {
  // Use a variable to prevent esbuild from trying to bundle next-intl/plugin
  // when OpenNext is generating the server bundle
  const pluginName = 'next-intl/plugin'
  const createNextIntlPlugin = (await import(pluginName)).default
  const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

  return withNextIntl(nextConfig)
}
