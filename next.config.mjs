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

  // Technical audit TA11 (23 Nov 2026): with streaming metadata, slow pages
  // sent <title>, description and rel=canonical after </head> (190 of 413
  // /r/sitemap pages). Cloudflare caches one copy for every user agent, so
  // bots received it too, and Google ignores a canonical outside <head>.
  // Treat every user agent as "HTML-limited" so metadata always blocks and
  // lands in <head>.
  htmlLimitedBots: /.*/,

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
    const noindex = ['/listing/:path*', '/r/listing/:path*'].map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    }))
    // Audit 4 T05: area and building pages render per request and answer
    // "private, no-store", so every visit rebuilt them. Their HTML is the same
    // for every visitor (no server cookie reads), so let Vercel's CDN keep it
    // for 5 minutes and serve the stale copy for an hour while it rebuilds.
    // Vercel-CDN-Cache-Control outranks the page's Cache-Control and is not
    // passed on to browsers or Cloudflare. RSC navigation requests are left out.
    // Header rules in vercel.json were not applied to this Next.js project.
    const cdnCache = [
      '/locations/:path*',
      '/r/locations/:path*',
      '/building/:path*',
      '/r/building/:path*'
    ].map((source) => ({
      source,
      missing: [{ type: 'header', key: 'rsc' }],
      headers: [
        {
          key: 'Vercel-CDN-Cache-Control',
          value: 'max-age=300, stale-while-revalidate=3600'
        }
      ]
    }))
    return [...noindex, ...cdnCache]
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