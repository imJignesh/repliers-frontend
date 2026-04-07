import { NextResponse } from 'next/server'

/**
 * @description This route proxies the listing sitemap from the backend API.
 * It ensures the sitemap is available at the root level of the frontend.
 */
export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL
  
  if (!backendUrl) {
    return new NextResponse('API URL not configured', { status: 500 })
  }

  const sitemapUrl = `${backendUrl}/api/listings-sitemap.xml`
  
  try {
    const response = await fetch(sitemapUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      return new NextResponse(`Error fetching sitemap: ${response.status}`, { status: response.status })
    }

    const xml = await response.text()
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=43200'
      }
    })
  } catch (error: any) {
    console.error('[Sitemap Proxy] error:', error)
    return new NextResponse('Failed to fetch sitemap', { status: 500 })
  }
}
