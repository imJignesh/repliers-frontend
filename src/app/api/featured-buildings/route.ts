import { NextResponse } from 'next/server'

import APIBuildings from 'services/API/APIBuildings'

export async function GET() {
  try {
    const data = await APIBuildings.fetchFeatured()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: 'Featured buildings unavailable' },
      { status: 502 }
    )
  }
}
