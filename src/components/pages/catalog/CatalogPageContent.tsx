'use client'

import React, { useRef } from 'react'

import { Box, Container, Stack, useTheme, useMediaQuery } from '@mui/material'
import APILocations from 'services/API/APILocations'

import { gridColumnsMediaQueries } from '@pages/search/components/MapRoot/constants'
import { EmptyCatalogListings, EmptyBuildings } from '@shared/EmptyStates'
import { PropertyCard, BuildingCard } from '@shared/Property'

import {
  type ApiBoardArea,
  type ApiBoardCity,
  type ApiNeighborhood,
  type Property
} from 'services/API'
import type { Filters } from 'services/Search'
import SearchProvider from 'providers/SearchProvider'
import { useState, useEffect } from 'react'
import MapOptionsProvider from 'providers/MapOptionsProvider'

import MapService from 'services/Map'
import CatalogMap from './components/CatalogMap'

import {
  Breadcrumbs,
  CatalogFilters,
  CatalogHeader,
  CatalogPagination,
  FiltersList,
  HoodsOfCity,
  PopularSearches
} from './components'

const CatalogPageContent = ({
  page,
  count,
  listings,
  area,
  hood,
  city,
  urlFilters,
  searchFilters,
  areas,
  hoods,
  cities,
  location
}: {
  listings: Property[]
  count: number
  page: number

  area?: string
  hood?: string
  city?: string

  areas: ApiBoardArea[]
  hoods: ApiNeighborhood[]
  cities: ApiBoardCity[]
  location?: ApiBoardCity | ApiNeighborhood

  urlFilters: string[]
  searchFilters: Partial<Filters>
}) => {
  const [showMap, setShowMap] = useState(false)
  const [viewMode, setViewMode] = useState<'listings' | 'buildings'>('listings')
  const [locationTree, setLocationTree] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  
  // Theme hooks for responsive detection
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    const stored = localStorage.getItem('repliers_catalog_map_view')
    if (stored === 'true') {
      setShowMap(true)
    }
  }, [])

  const handleToggleMap = () => {
    const newState = !showMap
    setShowMap(newState)
    localStorage.setItem('repliers_catalog_map_view', String(newState))
    
    // Scroll to map on mobile when toggled on
    if (!showMap && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const buildings = locationTree?.buildings || []

  return (
    <SearchProvider
      filters={
        {
          ...searchFilters,
          area,
          city,
          neighborhood: hood
        } as Filters
      }
    >
      <MapOptionsProvider layout="map" style="map">
        <Box minHeight="calc(100vh - 72px)">

          {/* Header — always full width constrained */}
          <Container maxWidth="xl" sx={{ pt: { xs: 0, sm: 0 } }}>
            <CatalogHeader
              count={count}
              area={area}
              city={city}
              hood={hood}
              areas={areas}
              cities={cities}
              hoods={hoods}
              location={location}
            />
          </Container>

          {/* Filters bar — always full width constrained */}
          <Box sx={{ boxShadow: count > 0 ? 1 : 0 }}>
            <Container maxWidth="xl" sx={{ pt: { xs: 0, sm: 0 } }}>
              <CatalogFilters
                count={count}
                area={area}
                city={city}
                hood={hood}
                areas={areas}
                hoods={hoods}
                searchFilters={searchFilters}
                showMap={showMap}
                onToggleMap={handleToggleMap}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onLocationTreeChange={setLocationTree}
              />
            </Container>
          </Box>

          {showMap ? (
            /* ── MAP MODE: Responsive Layout ── */
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                // height: { md: 'calc(100vh - 140px)' }, 
              }}
            >
              {/* 1. MAP PANEL (Top on Mobile, Right on Desktop) */}
              <Box
                ref={mapRef}
                sx={{
                  width: { xs: '100%', md: '50%' },
                  height: { xs: '50vh', md: '100vh' }, // Fixed height on mobile
                  position: { md: 'sticky' },
                  top: { md: 0 },
                  flexShrink: 0,
                  order: { xs: 1, md: 2 }, // Order: 1st on mobile, 2nd on desktop
                }}
              >
                <CatalogMap listings={listings} />
              </Box>

              {/* 2. LISTINGS PANEL (Bottom on Mobile, Left on Desktop) */}
              <Box
                sx={{
                  width: { xs: '100%', md: '50%' },
                  height: { xs: 'auto', md: '100%' },
                  overflowY: 'auto',
                  p: { xs: 1, sm: 2 },
                  borderRight: { md: '1px solid' },
                  borderColor: { md: 'divider' },
                  order: { xs: 2, md: 1 }, // Order: 2nd on mobile, 1st on desktop
                  /* Hide scrollbar cross-browser */
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {viewMode === 'listings' ? (
                  listings?.length > 0 ? (
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      justifyContent="center"
                      gap={{ xs: 1.5, sm: 2 }}
                      sx={{
                        '& > *': {
                          width: {
                            xs: '100%',
                            sm: 'calc(50% - 8px)',
                            md: 'calc(50% - 8px)', // 2 columns in split view
                          },
                        },
                      }}
                    >
                      {listings.map((property, index) => (
                        <PropertyCard
                          key={index}
                          property={property}
                          showViewOnMap={true}
                          onViewOnMap={() => {
                            if (property.map.latitude && property.map.longitude) {
                              MapService.map?.flyTo({
                                center: [Number(property.map.longitude), Number(property.map.latitude)],
                                zoom: 16,
                              })
                              MapService.showPopup(property.mlsNumber)
                              
                              // NEW: Scroll to map on mobile when location icon clicked
                              if (isMobile && mapRef.current) {
                                mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <EmptyCatalogListings />
                  )
                ) : (
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="center"
                    gap={{ xs: 1.5, sm: 2 }}
                    sx={{
                      '& > *': {
                        width: {
                          xs: '100%',
                          sm: 'calc(50% - 8px)',
                          md: 'calc(50% - 8px)',
                        },
                      },
                    }}
                  >
                    {buildings.map((building: any, index: number) => (
                      <BuildingCard key={index} building={building} />
                    ))}
                    {buildings.length === 0 && <EmptyBuildings />}
                  </Stack>
                )}

                {viewMode === 'listings' && (
                  <Stack spacing={2} alignItems="center" py={4}>
                    <CatalogPagination page={page} count={count} />
                  </Stack>
                )}
              </Box>
            </Box>
          ) : (
            /* ── LIST MODE: full width, no map ── */
            <Container
              maxWidth="xl"
              sx={{
                px: { xs: 1, sm: 2, md: 3 },
                pt: { xs: 2, sm: 3, md: 4 },
              }}
            >
              {viewMode === 'listings' ? (
                listings?.length > 0 ? (
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="center"
                    gap={{ xs: 1.5, sm: 2, md: 3 }}
                    sx={{
                      '& > *': {
                        width: {
                          xs: '100%',
                          sm: 'calc(50% - 8px)',
                          md: 'calc(33.333% - 11px)',
                          lg: 'calc(25% - 12px)',
                        },
                      },
                    }}
                  >
                    {listings.map((property, index) => (
                      <PropertyCard key={index} property={property} />
                    ))}
                  </Stack>
                ) : (
                  <EmptyCatalogListings />
                )
              ) : (
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  justifyContent="center"
                  gap={{ xs: 1.5, sm: 2, md: 3 }}
                  sx={{
                    '& > *': {
                      width: {
                        xs: '100%',
                        sm: 'calc(50% - 8px)',
                        md: 'calc(33.333% - 11px)',
                        lg: 'calc(25% - 12px)',
                      },
                    },
                  }}
                >
                  {buildings.map((building: any, index: number) => (
                    <BuildingCard key={index} building={building} />
                  ))}
                  {buildings.length === 0 && <EmptyBuildings />}
                </Stack>
              )}

              {viewMode === 'listings' && (
                <Stack spacing={2} alignItems="center" py={4}>
                  <CatalogPagination page={page} count={count} />
                </Stack>
              )}
            </Container>
          )}

          <Box sx={{ mt: 4 }}>
            <PopularSearches area={area} city={city} hood={hood} />
          </Box>

        </Box>
      </MapOptionsProvider>
    </SearchProvider>
  )
}

export default CatalogPageContent