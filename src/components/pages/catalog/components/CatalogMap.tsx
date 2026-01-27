'use client'

import React, { useEffect, useRef } from 'react'
import { Map as MapboxMap, LngLatBounds } from 'mapbox-gl'
import { Box } from '@mui/material'
import { useLocale, useMessages } from 'next-intl'

import mapConfig from '@configs/map'
import { getMapStyleUrl } from 'utils/map'
import MapService from 'services/Map'
import { type Property } from 'services/API'
import { useMapOptions } from 'providers/MapOptionsProvider'

const { mapboxDefaults } = mapConfig

const CatalogMap = ({ listings }: { listings: Property[] }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<MapboxMap | null>(null)
    const locale = useLocale()
    const messages = useMessages()
    const { style } = useMapOptions()

    useEffect(() => {
        if (!mapContainerRef.current) return

        const map = new MapboxMap({
            container: mapContainerRef.current,
            ...mapboxDefaults,
            style: getMapStyleUrl(style),
            center: [-79.3832, 43.6532], // Toronto
            zoom: 10
        })

        mapRef.current = map
        MapService.setMap(map)
        MapService.popupExtension.setIntlProviderData(locale, messages)

        map.on('load', () => {
            // Fit bounds to listings
            if (listings.length > 0) {
                fitBounds(map, listings)
            }
        })

        return () => {
            MapService.removeMap()
        }
    }, [])

    useEffect(() => {
        if (!mapRef.current) return
        MapService.showMarkers({
            properties: listings,
            onClick: (e, property) => {
                // Handle click if needed, maybe scroll to listing in list?
            }
        })

        // basic fit bounds when listings change
        if (listings.length > 0 && mapRef.current) {
            // Optional: Refit bounds when listings change? 
            // Might be annoying if user moved map. 
            // For now, let's do it only on initial load or if explicitly requested.
            // Actually, creating a new map on mount handles specific set of listings.
        }

    }, [listings])

    const fitBounds = (map: MapboxMap, properties: Property[]) => {
        if (!properties.length) return

        const bounds = new LngLatBounds()
        let hasCoords = false
        properties.forEach(p => {
            if (p.map.latitude && p.map.longitude) {
                bounds.extend([Number(p.map.longitude), Number(p.map.latitude)])
                hasCoords = true
            }
        })

        if (hasCoords) {
            map.fitBounds(bounds, { padding: 50, maxZoom: 15, animate: false })
        }
    }

    return (
        <Box
            ref={mapContainerRef}
            sx={{
                width: '100%',
                height: '100%',
                bgcolor: '#e9e6e0',
                '& .mapboxgl-canvas': {
                    outline: 'none !important'
                },
                '& .mapboxgl-popup-content': {
                    p: 0,
                    boxShadow: 0,
                    bgcolor: 'transparent !important'
                },
                '& .mapboxgl-popup-tip': {
                    display: 'none !important'
                }
            }}
        />
    )
}



export default CatalogMap
