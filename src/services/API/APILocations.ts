import APIBase from './APIBase'

export type AreaCity = {
    name: string
    neighborhoods: string[]
}

export type Area = {
    name: string
    cities: AreaCity[]       // grouped by city (Downtown, Etobicoke, etc.)
    neighborhoods: string[]  // flat list of all descendants (backward compat)
}

class APILocations extends APIBase {
    async fetchAreas(): Promise<Area[]> {
        try {
            return await this.fetchJSON<Area[]>('/areas')
        } catch (error) {
            console.error('[APILocations] error fetching areas', error)
            return []
        }
    }

    async fetchAreaNeighborhoods(area: string): Promise<AreaCity[] | string[]> {
        try {
            const slug = area.toLowerCase().replace(/[\s\u2011]+/g, '-')
            return await this.fetchJSON<AreaCity[] | string[]>(`/area/${slug}`)
        } catch (error) {
            console.error(`[APILocations] error fetching neighborhoods for ${area}`, error)
            return []
        }
    }

    async fetchNeighborhoodListings(neighborhood: string): Promise<string[]> {
        try {
            const slug = neighborhood.toLowerCase().replace(/[\s\u2011]+/g, '-')
            return await this.fetchJSON<string[]>(`/area/${slug}/listings`)
        } catch (error) {
            console.error(`[APILocations] error fetching listings for ${neighborhood}`, error)
            return []
        }
    }

    async fetchNeighborhoodBuildings(neighborhood: string): Promise<any[]> {
        try {
            const slug = neighborhood.toLowerCase().replace(/[\s\u2011]+/g, '-')
            return await this.fetchJSON<any[]>(`/area/${slug}/buildings`)
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
            return await this.fetchJSON<Record<string, string | null>>(
                `/locations/validate?slugs=${q}`
            )
        } catch (error) {
            console.error('[APILocations] error validating slugs', slugs, error)
            // On network error, fail open (don't 404 legitimate pages)
            return {}
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
