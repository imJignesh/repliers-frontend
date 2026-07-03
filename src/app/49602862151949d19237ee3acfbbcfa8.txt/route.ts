import { NextResponse } from 'next/server'

// IndexNow key verification file. Search engines fetch this to confirm we own
// the host before accepting URL submissions from the backend (indexnow:submit).
// The key must match services.indexnow.key in the Laravel app.
export async function GET() {
  return new NextResponse('49602862151949d19237ee3acfbbcfa8', {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
