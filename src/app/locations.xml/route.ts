import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_PRECONDO_URL || 'https://app.precondo.ca';
  const sitemapUrl = `${backendUrl}/storage/sitemaps/locations.xml`;

  try {
    const response = await fetch(sitemapUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) return new NextResponse('Sitemap not found', { status: 404 });

    const xml = await response.text();
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching locations sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

