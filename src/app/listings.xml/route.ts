import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_PRECONDO_URL || 'http://localhost:8000';
  const sitemapUrl = `${backendUrl}/storage/sitemaps/listings.xml`;

  try {
    const response = await fetch(sitemapUrl, { cache: 'no-store' });
    if (!response.ok) return new NextResponse('Sitemap not found', { status: 404 });

    const xml = await response.text();
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching listings sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
