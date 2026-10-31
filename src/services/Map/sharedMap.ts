import type { Map } from 'mapbox-gl'

/**
 * Holds the Mapbox map instance currently mounted by a map page, if any.
 *
 * `MapService` (services/Map/Map.ts) owns markers and popups and therefore
 * imports the Mapbox GL runtime through its extensions. Components that only
 * need to know "is there a map, and where is it" (the header search box, the
 * search service) read this registry instead, so pages without a map never
 * download the ~520 KB gzip `mapbox-gl` chunk (audit RT08, October 2026).
 *
 * `MapService.setMap` / `removeMap` keep this in sync; `MapService.map`
 * reads from here, so there is a single source of truth.
 */
let sharedMap: Map | null = null

export const getSharedMap = (): Map | null => sharedMap

export const setSharedMap = (map: Map | null): void => {
  sharedMap = map
}
