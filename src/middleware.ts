import { NextResponse, type NextRequest } from 'next/server'

import { slugifyAddress } from 'utils/properties/slug'

/**
 * Canonical redirects for listing URLs.
 *
 * This lives in middleware rather than in the page purely to control the status
 * code. The App Router's permanentRedirect() emits 308; the SEO requirement for
 * this route is a literal 301, and middleware is the only place in the request
 * lifecycle that can name its own status while still redirecting in one hop.
 *
 * Cost note: this adds one listing lookup per listing document request. The
 * upstream endpoint resolves by MLS number and is server-side cached, and the
 * lookup is skipped entirely for prefetches, RSC payloads and assets. It fails
 * open on any error or timeout -- a slow API degrades the canonical redirect,
 * it never blocks the page.
 */

const LISTING_PATH = /^(?:\/r)?\/listing\/([^/]+)\/?$/
const BOARD_ID_SUFFIX = /^\d{1,3}$/
const LOOKUP_TIMEOUT_MS = 2000

export const config = {
  matcher: ['/listing/:path*', '/r/listing/:path*']
}

export async function middleware(request: NextRequest) {
  const pass = NextResponse.next()

  // Only real document navigations. Prefetches and RSC payload requests must
  // not pay for the lookup, and redirecting them achieves nothing.
  if (
    request.method !== 'GET' ||
    request.headers.get('next-router-prefetch') ||
    request.headers.get('rsc') ||
    request.headers.get('purpose') === 'prefetch'
  ) {
    return pass
  }

  const match = request.nextUrl.pathname.match(LISTING_PATH)
  if (!match) return pass

  let slug: string
  try {
    slug = decodeURIComponent(match[1])
  } catch {
    slug = match[1]
  }
  if (!slug) return pass

  // Mirror parseParams(): an optional 1-3 digit boardId, then the MLS number.
  const segments = slug.split('-')
  if (BOARD_ID_SUFFIX.test(segments.at(-1) ?? '')) segments.pop()
  const mlsNumber = segments.pop()
  if (!mlsNumber) return pass

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return pass

  let property: any
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS)
    const response = await fetch(
      `${apiUrl}/api/listings/${encodeURIComponent(mlsNumber)}?fields=raw`,
      { signal: controller.signal, headers: { Accept: 'application/json' } }
    ).finally(() => clearTimeout(timeout))

    // A missing record is the page's call to make (it renders the 404), and a
    // failing upstream must not strand the request here.
    if (!response.ok) return pass
    property = await response.json()
  } catch {
    return pass
  }

  if (!property?.address || !property?.mlsNumber) return pass

  // A withdrawn record is about to 404 in the page. Redirecting first would
  // hand crawlers a pointless 301 -> 404 chain, so let the 404 answer directly.
  if (
    property.status === 'U' &&
    ['Exp', 'Ter'].includes(String(property.lastStatus))
  ) {
    return pass
  }

  const addr = slugifyAddress(property.address)
  const canonicalSlug = addr
    ? `${addr}-${property.mlsNumber}`
    : String(property.mlsNumber)

  if (canonicalSlug === slug) return pass

  // Loop guard: the target has to parse back to the listing we just resolved.
  const reparsed = canonicalSlug.split('-')
  if (BOARD_ID_SUFFIX.test(reparsed.at(-1) ?? '')) reparsed.pop()
  if (reparsed.pop() !== String(property.mlsNumber)) return pass

  const target = request.nextUrl.clone()
  target.pathname = `${request.nextUrl.pathname.startsWith('/r/') ? '/r' : ''}/listing/${canonicalSlug}`

  return NextResponse.redirect(target, 301)
}
