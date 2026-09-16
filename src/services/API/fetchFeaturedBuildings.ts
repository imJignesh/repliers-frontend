import type { FeaturedBuilding } from './APIBuildings'

export const fetchFeaturedBuildings = async (): Promise<FeaturedBuilding[]> => {
  const response = await fetch('/r/api/featured-buildings', {
    signal: AbortSignal.timeout(25000)
  })
  if (!response.ok) throw new Error('Featured buildings unavailable')
  const body = await response.json()
  if (!Array.isArray(body?.data))
    throw new Error('Invalid featured buildings response')
  return body.data
}
