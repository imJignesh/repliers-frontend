import APIBase from './APIBase'
import { toAreaSlug } from 'utils/areaSlug'

export type AreaCity = {
    name: string
    neighborhoods: string[]
    building_count?: number
    listing_count?: number
}

export type Area = {
    name: string
    cities: AreaCity[]       // grouped by city (Downtown, Etobicoke, etc.)
    neighborhoods: string[]  // flat list of all descendants (backward compat)
    building_count?: number
    listing_count?: number
}

// Audit 4 T05: the header and the mobile menu each asked for the area tree,
// so every page load fetched it twice. In the browser, share one request
// for five minutes.
let browserAreas: { at: number; promise: Promise<Area[]> } | null = null
const BROWSER_AREAS_TTL_MS = 5 * 60 * 1000

class APILocations extends APIBase {
    async fetchAreas(): Promise<Area[]> {
        if (typeof window !== 'undefined') {
            if (browserAreas && Date.now() - browserAreas.at < BROWSER_AREAS_TTL_MS) {
                return browserAreas.promise
            }
            const promise = this.fetchAreasOnce()
            browserAreas = { at: Date.now(), promise }
            // A failed load is not kept: the next caller tries again.
            promise.then((areas) => {
                if (!areas.length && browserAreas?.promise === promise) browserAreas = null
            })
            return promise
        }
        return this.fetchAreasOnce()
    }

    private async fetchAreasOnce(): Promise<Area[]> {
        try {
            return await this.fetchPublicJSON<Area[]>('/areas', 600)
        } catch (error) {
            console.error('[APILocations] error fetching areas', error)
            return []
        }
    }

    async fetchAreaNeighborhoods(area: string, withCounts: boolean = false): Promise<any[]> {
        try {
            const slug = toAreaSlug(area)
            const query = withCounts ? '?with_counts=1' : ''
            return await this.fetchPublicJSON<any[]>(`/area/${slug}${query}`, 600)
        } catch (error) {
            console.error(`[APILocations] error fetching neighborhoods for ${area}`, error)
            return []
        }
    }

    async fetchNeighborhoodListings(neighborhood: string, city?: string, area?: string): Promise<string[]> {
        try {
            const slug = toAreaSlug(neighborhood)
            const params = new URLSearchParams()
            if (city) params.append('city', city)
            if (area) params.append('area', area)
            const query = params.toString() ? `?${params.toString()}` : ''
            return await this.fetchPublicJSON<string[]>(`/area/${slug}/listings${query}`, 300)
        } catch (error) {
            console.error(`[APILocations] error fetching listings for ${neighborhood}`, error)
            return []
        }
    }

    /**
     * Same listings as fetchNeighborhoodListings, each with its canonical path
     * (T10, Nov full-site audit). Falls back to path: null on an older backend.
     */
    async fetchNeighborhoodListingLinks(neighborhood: string, city?: string, area?: string): Promise<{ entry: string; path: string | null }[]> {
        try {
            const slug = toAreaSlug(neighborhood)
            const params = new URLSearchParams({ paths: '1' })
            if (city) params.append('city', city)
            if (area) params.append('area', area)
            const rows = await this.fetchJSON<any[]>(`/area/${slug}/listings?${params.toString()}`)
            return (rows || []).map((row) =>
                typeof row === 'string' ? { entry: row, path: null } : { entry: String(row.entry ?? ''), path: row.path || null }
            )
        } catch (error) {
            console.error(`[APILocations] error fetching listing links for ${neighborhood}`, error)
            return []
        }
    }

    async fetchNeighborhoodBuildings(neighborhood: string, city?: string, area?: string): Promise<any[]> {
        try {
            const slug = toAreaSlug(neighborhood)
            const params = new URLSearchParams()
            if (city) params.append('city', city)
            if (area) params.append('area', area)
            const query = params.toString() ? `?${params.toString()}` : ''
            return await this.fetchJSON<any[]>(`/area/${slug}/buildings${query}`)
        } catch (error) {
            console.error(`[APILocations] error fetching buildings for ${neighborhood}`, error)
            return []
        }
    }

    /**
     * Validate that a set of location slugs exist in the active location tree.
     *
     * Returns a map of slug → type ("area" | "city" | "locality") or null when
     * the slug is not found in the database. A null value means the slug is
     * invalid and the page should render a 404.
     */
    async validateSlugs(slugs: string[]): Promise<Record<string, string | null>> {
        if (!slugs.length) return {}
        try {
            const q = encodeURIComponent(slugs.join(','))
            return await this.fetchPublicJSON<Record<string, string | null>>(
                `/locations/validate?slugs=${q}`,
                3600
            )
        } catch (error) {
            console.error('[APILocations] error validating slugs', slugs, error)
            // On network error, fail open (don't 404 legitimate pages)
            return {}
        }
    }

    /**
     * Look up a redirect destination for a given source URL path.
     *
     * Returns the redirect object with source and destination, or null if no redirect exists.
     */
    async lookupRedirect(sourcePath: string): Promise<{ source: string; destination: string } | null> {
        if (!sourcePath) return null
        try {
            return await this.fetchPublicJSON<{ source: string; destination: string } | null>(
                `/redirects/lookup?source=${encodeURIComponent(sourcePath)}`,
                3600
            )
        } catch (error) {
            console.error('[APILocations] error looking up redirect for', sourcePath, error)
            // On error, fail open (don't break legitimate pages)
            return null
        }
    }

    async fetchAutosuggestions(q: string): Promise<any> {
        try {
            return await this.fetchJSON<any>(`/search?q=${encodeURIComponent(q)}`)
        } catch (error) {
            console.error(`[APILocations] error fetching autosuggestions for ${q}`, error)
            return { buildings: [], listings: [], locations: [], success: false }
        }
    }
}

const apiLocationsInstance = new APILocations()
export default apiLocationsInstance
