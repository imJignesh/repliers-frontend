import { type MapOptions } from 'mapbox-gl'

import { type ApiLocation } from 'services/API'

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY || ''

const config = {
  // Mapbox access token and default options
  mapboxDefaults: {
    zoom: 10,
    minZoom: 4,
    maxZoom: 18,
    dragRotate: false,
    doubleClickZoom: true,
    attributionControl: false,
    logoPosition: 'bottom-left',
    accessToken
  } as Partial<MapOptions>,
  // Mapbox map styles
  mapStyles: {
    map: 'streets-v12',
    hybrid: 'satellite-streets-v12',
    satellite: 'satellite-v9'
  },
  // zoom levels for search area and addresses
  defaultAreaZoom: 13,
  fallbackAreaZoom: 11,
  defaultAddressZoom: 15,
  propertyPageAddressZoom: 18,
  // Default polygon to limit searches and Repliers API requests (!).
  // Scoped to (Southern/Central) Ontario — the actual market — so the default
  // map view lands on the listings instead of the empty centre of North America.
  defaultPolygon: [
    { lat: 46.8, lng: -83.5 },
    { lat: 46.8, lng: -74.0 },
    { lat: 41.6, lng: -74.0 },
    { lat: 41.6, lng: -83.5 }
  ] as ApiLocation[],
  // proximity search
  proximitySearchCenter: { lat: 43.613131, lng: 8.18188 } as ApiLocation,
  proximitySearchLanguage: 'en',
  proximitySearchCountry: 'CA',
  proximitySearchLimit: 10
}

export type MapStyle = keyof typeof config.mapStyles

export default config
