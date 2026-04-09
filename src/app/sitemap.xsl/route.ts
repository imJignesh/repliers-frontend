import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_PRECONDO_URL || 'http://localhost:8000';
  const xslUrl = `${backendUrl}/storage/sitemaps/sitemap.xsl`;

  try {
    const response = await fetch(xslUrl, { cache: 'no-store' });
    if (!response.ok) return new NextResponse('XSL not found', { status: 404 });

    const xsl = await response.text();
    return new NextResponse(xsl, {
      headers: {
        'Content-Type': 'application/xslt+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching sitemap XSL:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
