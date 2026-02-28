'use client'

import React from 'react'

import { Box, Container, Stack, Card, CardContent, Typography, CardActionArea } from '@mui/material'
import Link from 'next/link'
import ApartmentIcon from '@mui/icons-material/Apartment'
import APILocations from 'services/API/APILocations'

import gridConfig from '@configs/cards-grids'
// TODO: fix constants import from @pages alias
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
  // CitiesOfRegion,
  FiltersList,
  HoodsOfCity,
  // PopularCities,
  // PopularHoods,
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
  // nearbyLocations: ApiBoardCity[]

  urlFilters: string[]
  searchFilters: Partial<Filters>
}) => {
  const [showMap, setShowMap] = useState(false)
  const [viewMode, setViewMode] = useState<'listings' | 'buildings'>('listings')
  const [locationTree, setLocationTree] = useState<any>(null)



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
          <Container maxWidth="lg" sx={{ pt: { xs: 0, sm: 0 } }}>
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
          <Box sx={{ boxShadow: count > 0 ? 1 : 0 }}>
            <Container maxWidth="lg" sx={{ pt: { xs: 0, sm: 0 } }}>
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

          <Container
            disableGutters
            maxWidth={showMap ? false : 'lg'}
            sx={{
              ...gridColumnsMediaQueries,
              px: gridConfig.gridSpacing,
              pt: gridConfig.gridSpacing,
              ...(showMap && {
                p: 0,
                height: 'calc(100vh - 140px)', // Approx height
                overflow: 'hidden'
              })
            }}
          >
            {showMap ? (
              <Box sx={{ display: 'flex', height: '100%' }}>
                <Box sx={{
                  width: { xs: '100%', md: '50%' },
                  height: '100%',
                  overflowY: 'auto',
                  p: 2,
                  borderRight: '1px solid',
                  borderColor: 'divider'
                }}>
                  {viewMode === 'listings' ? (
                    listings?.length > 0 ? (
                      <Stack spacing={4} direction="row" flexWrap="wrap">
                        {listings.map((property, index) => (
                          <PropertyCard
                            key={index}
                            property={property}
                            showViewOnMap={true}
                            onViewOnMap={() => {
                              if (property.map.latitude && property.map.longitude) {
                                MapService.map?.flyTo({
                                  center: [Number(property.map.longitude), Number(property.map.latitude)],
                                  zoom: 16
                                })
                                MapService.showPopup(property.mlsNumber)
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <EmptyCatalogListings />
                    )
                  ) : (
                    <Stack spacing={4} direction="row" flexWrap="wrap">
                      {buildings.map((building: any, index: number) => (
                        <BuildingCard key={index} building={building} />
                      ))}
                      {buildings.length === 0 && (
                        <EmptyBuildings />
                      )}
                    </Stack>
                  )}
                  {viewMode === 'listings' && (
                    <Stack spacing={2} alignItems="center" py={4}>
                      <CatalogPagination page={page} count={count} />
                    </Stack>
                  )}
                </Box>
                <Box sx={{
                  width: { xs: '0%', md: '50%' },
                  display: { xs: 'none', md: 'block' },
                  height: '100%',
                  position: 'relative'
                }}>
                  <CatalogMap listings={listings} />
                </Box>
              </Box>
            ) : (
              <>
                {viewMode === 'listings' ? (
                  listings?.length > 0 ? (
                    <Stack spacing={4} direction="row" flexWrap="wrap">
                      {listings.map((property, index) => (
                        <PropertyCard key={index} property={property} />
                      ))}
                    </Stack>
                  ) : (
                    <EmptyCatalogListings />
                  )
                ) : (
                  <Stack spacing={4} direction="row" flexWrap="wrap">
                    {buildings.map((building: any, index: number) => (
                      <BuildingCard key={index} building={building} />
                    ))}
                    {buildings.length === 0 && (
                      <EmptyBuildings />
                    )}
                  </Stack>
                )}

                {viewMode === 'listings' && (
                  <Stack spacing={2} alignItems="center" py={4}>
                    <CatalogPagination page={page} count={count} />
                  </Stack>
                )}
              </>
            )}

          </Container>

          {/* <CitiesOfRegion /> */}
          {/* <HoodsOfCity
            hoods={hoods}
            city={city || area || ''}
            isArea={!city && !!area}
          /> */}
          {/* <PopularCities /> */}
          {/* <PopularHoods /> */}
          <Box sx={{ mt: 4 }}>
            <PopularSearches area={area} city={city} hood={hood} />
          </Box>
        </Box>
      </MapOptionsProvider>
    </SearchProvider>
  )
}

export default CatalogPageContent
