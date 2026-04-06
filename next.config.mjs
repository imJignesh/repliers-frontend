/** @type {import('next').NextConfig} */
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

const currentEnv = process.env.NODE_ENV

const loggingConfig =
  currentEnv === 'development'
    ? {
      logging: {
        fetches: {
          fullUrl: true,
        }
      }
    }
    : {}

const nextConfig = {
  basePath: '/r',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx', 'md'],

  // Note: 'eslint' and 'typescript' ignore keys are handled differently in v16.
  // If the build still fails, these may need to move to vercel.json or 
  // be handled via the 'ignoreDuringBuilds' environment variable.
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },

  trailingSlash: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.repliers.io'
      }
    ]
  },
  experimental: {
    // This helps Turbopack understand MDX files in v16
    mdxRs: true
  },
  ...loggingConfig
}

const withMDX = createMDX({})
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Chain the plugins
export default withNextIntl(withMDX(nextConfig))