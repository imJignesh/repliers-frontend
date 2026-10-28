import { type MapPosition } from 'providers/MapOptionsProvider'

/**
 * Search results normally wait for the map `load` event so the first request
 * uses the real viewport. When the map failed to start there will never be a
 * viewport, so the request must go ahead with the polygon or the default
 * rectangle instead; otherwise the grid stays on skeletons forever
 * (audit RT05).
 */
export const shouldFetchResults = ({
  mapLoaded,
  mapFailed,
  position
}: {
  mapLoaded: boolean
  mapFailed: boolean
  position: Pick<MapPosition, 'center' | 'zoom'>
}) => {
  if (mapFailed) return true
  if (!mapLoaded) return false
  return !!position.center && !!position.zoom
}

/**
 * Later server pages wait for the map bounds in the map layout, because the
 * map owns the viewport. Without a map the bounds will never arrive, so
 * pagination must proceed with the fallback rectangle.
 */
export const canFetchNextPage = ({
  layout,
  hasBounds,
  mapFailed
}: {
  layout: 'map' | 'grid'
  hasBounds: boolean
  mapFailed: boolean
}) => layout !== 'map' || hasBounds || mapFailed
