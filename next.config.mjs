import { readFileSync } from 'node:fs'
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

const rootPage = JSON.parse(readFileSync(new URL('./src/features/_static.json', import.meta.url), 'utf8')).rootPage

const nextConfig = {
  assetPrefix: '/r',
  // Root-page variants come from the existing static feature configuration.
  // Exclude the unused estimate UI from the landing page's client entry.
  env: { NEXT_PUBLIC_ROOT_PAGE: rootPage },
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

  async headers() {
    return ['/listing/:path*', '/r/listing/:path*'].map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    }))
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