import APIBase from './APIBase'

export type Area = {
    name: string
    neighborhoods: string[]
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

    async fetchAreaNeighborhoods(area: string): Promise<string[]> {
        try {
            const slug = area.toLowerCase().replace(/\s+/g, '-')
            return await this.fetchJSON<string[]>(`/area/${slug}`)
        } catch (error) {
            console.error(`[APILocations] error fetching neighborhoods for ${area}`, error)
            return []
        }
    }
}

const apiLocationsInstance = new APILocations()
export default apiLocationsInstance
