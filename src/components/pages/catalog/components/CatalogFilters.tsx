'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import {
  Box,
  Button,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
  IconButton
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MapIcon from '@mui/icons-material/Map'
import ListIcon from '@mui/icons-material/ViewList'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import {
  type ListingStatus,
  type ListingType,
  type ListingLocation
} from '@configs/filters'
import {
  ListingsCounter,
  SortModesSelect
} from '@shared/Filters'
import { AdvancedFiltersDialog } from '@shared/Dialogs'
import { AdvancedFiltersButton } from '@pages/search/components/MapFilters/components'
import routes from '@configs/routes'

import { type ApiSortBy, type ApiBoardArea, type ApiNeighborhood } from 'services/API'
import { type Filters } from 'services/Search'
import { useSearch } from 'providers/SearchProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'
import { getCatalogUrl } from 'utils/urls'
import { capitalize } from 'utils/strings'
import location, { citymap } from 'configs/defaults/location'

const statusItems: Array<[ListingStatus, string]> = [
  ['active', 'For Sale'],
  ['rent', 'For Rent']
]

const CatalogFilters = ({
  count,
  city,
  hood,
  area,
  areas = [],
  hoods = [],
  searchFilters,
  showMap,
  onToggleMap,
  viewMode,
  setViewMode,
  onLocationTreeChange
}: {
  count: number
  city?: string
  hood?: string
  area?: string
  areas?: ApiBoardArea[]
  hoods?: ApiNeighborhood[]
  listingLocation?: string
  searchFilters: Partial<Filters>
  showMap: boolean
  onToggleMap: () => void
  viewMode: 'listings' | 'buildings'
  setViewMode: (mode: 'listings' | 'buildings') => void
  onLocationTreeChange?: (tree: any) => void
}) => {
  const dynamicCitymap: Record<string, { active: boolean; items: Record<string, { active: boolean }> }> = {}
  areas.forEach((a: ApiBoardArea) => {
    dynamicCitymap[a.name] = {
      active: true,
      items: {}
    }
    a.cities.forEach((c: any) => {
      dynamicCitymap[a.name].items[c.name] = { active: true }
    })
  })

  const regions = areas.length ? areas.map((a: ApiBoardArea) => a.name) : Object.keys(citymap).filter((key) => citymap[key].active)
  const currentCitymap = (areas.length ? dynamicCitymap : citymap) as any
  const router = useRouter()
  const clientSide = useClientSide()
  const { mobile } = useBreakpoints()
  const size = mobile ? 'small' : 'medium'

  const { filters, setFilters, addFilters } = useSearch()
  const { listingStatus, listingType, sortBy } = filters
  // Default configurations are now handled in @configs/defaults/filters.ts

  const featuredRegions = [
    'Toronto',
    'Ottawa',
    'Hamilton',
    'Brampton',
    'Mississauga',
    'Vaughan',
    'Markham',
    'Oakville'
  ]
  const sortedRegions = [...regions].sort((a, b) => {
    const aFeatured = featuredRegions.includes(a)
    const bFeatured = featuredRegions.includes(b)
    if (aFeatured && !bFeatured) return -1
    if (!aFeatured && bFeatured) return 1
    return a.localeCompare(b)
  })

  // Location filter state
  const [locationTree, setLocationTree] = useState<any>(null)

  const [selectedRegion, setSelectedRegion] = useState<string | null>(() => {
    const areaMatch = areas.find(
      (a: ApiBoardArea) =>
        (area && a.name.toLowerCase() === area.toLowerCase()) ||
        (city && a.name.toLowerCase() === city.toLowerCase())
    )
    if (areaMatch) return areaMatch.name

    const cityMatch = areas.find((a: ApiBoardArea) =>
      a.cities.some((c: any) => c.name.toLowerCase() === city?.toLowerCase())
    )
    if (cityMatch) return cityMatch.name

    if (area && area.length > 0) return capitalize(area)
    if (city && city.length > 0) return capitalize(city)

    return null
  })

  // Sync selection with URL changes
  useEffect(() => {
    const areaMatch = areas.find(
      (a: ApiBoardArea) =>
        (area && a.name.toLowerCase() === area.toLowerCase()) ||
        (city && a.name.toLowerCase() === city.toLowerCase())
    )
    if (areaMatch) {
      setSelectedRegion(areaMatch.name)
      return
    }

    const cityMatch = areas.find((a: ApiBoardArea) =>
      a.cities.some((c: any) => c.name.toLowerCase() === city?.toLowerCase())
    )
    if (cityMatch) {
      setSelectedRegion(cityMatch.name)
      return
    }

    if (area && area.length > 0) {
      setSelectedRegion(capitalize(area))
    } else if (city && city.length > 0) {
      setSelectedRegion(capitalize(city))
    } else {
      setSelectedRegion(null)
    }
  }, [city, area, areas])

  useEffect(() => {
    if (selectedRegion) {
      const slug = selectedRegion.toLowerCase().replace(/\s+/g, '-')
      const buildingsSlug = hood ? hood.toLowerCase().replace(/\s+/g, '-') : slug

      // Avoid re-fetching if we already have the correct data
      if (locationTree &&
        (locationTree.slug === slug || locationTree.name.toLowerCase() === selectedRegion.toLowerCase()) &&
        locationTree.buildingsSlug === buildingsSlug
      ) {
        if (onLocationTreeChange) onLocationTreeChange(locationTree)
        return
      }

      Promise.all([
        fetch(`https://app.precondo.ca/api/locations/area/${slug}`).then((res) => res.json()),
        fetch(`https://backend.precondo.ca/api/area/${buildingsSlug}/buildings`).then((res) => res.json())
      ])
        .then(([locationDataFull, buildingsList]) => {
          if (locationDataFull.success) {
            const locationData = locationDataFull.data
            locationData.buildingsSlug = buildingsSlug

            if (Array.isArray(buildingsList)) {
              locationData.buildings = buildingsList.map((b: any) => ({
                ...b,
                address: b.fullAddress,
                street: {
                  number: b.streetNumber,
                  name: b.streetName
                }
              }))
            }

            setLocationTree(locationData)
            if (onLocationTreeChange) onLocationTreeChange(locationData)
          } else {
            if (locationTree?.name.toLowerCase() !== selectedRegion.toLowerCase()) {
              setLocationTree(null)
              if (onLocationTreeChange) onLocationTreeChange(null)
            }
          }
        })
        .catch((err) => {
          console.error(err)
          setLocationTree(null)
          if (onLocationTreeChange) onLocationTreeChange(null)
        })
    } else {
      setLocationTree(null)
      if (onLocationTreeChange) onLocationTreeChange(null)
    }
  }, [selectedRegion, locationTree])

  const createFiltersArray = (f: Partial<Filters> = filters) => {
    const urlFilters: string[] = []
    const type = f.listingType || 'allListings'
    const status = f.listingStatus
    const sort = f.sortBy

    if (type !== 'allListings') {
      const typeMap: Record<string, string> = {
        residential: 'houses',
        condo: 'condos',
        townhome: 'townhomes'
      }
      urlFilters.push(typeMap[type] || type)
    }

    if (status === 'rent') urlFilters.push('for-rent')
    if (status === 'sold') urlFilters.push('sold')
    if (status === 'all') urlFilters.push('all')

    if (sort && sort !== 'listPriceDesc') urlFilters.push('sort-' + sort)

    if (f.minPrice) urlFilters.push(`above - ${f.minPrice} `)
    if (f.maxPrice) urlFilters.push(`below - ${f.maxPrice} `)
    if (f.minBeds) urlFilters.push(`${f.minBeds} -bed`)
    if (f.minBaths) urlFilters.push(`${f.minBaths} -bath`)
    if (f.minGarageSpaces) urlFilters.push(`${f.minGarageSpaces} -garage`)
    if (f.minParkingSpaces) urlFilters.push(`${f.minParkingSpaces} -parking`)

    return urlFilters
  }

  // Effect to sync SearchProvider state with URL
  useEffect(() => {
    if (!clientSide) return

    const keys: (keyof Filters)[] = [
      'listingType',
      'listingStatus',
      'sortBy',
      'minPrice',
      'maxPrice',
      'minBeds',
      'minBaths',
      'minGarageSpaces',
      'minParkingSpaces'
    ]

    const filtersChanged = keys.some((key) => {
      const v1 = filters[key] || (key.startsWith('min') || key === 'maxPrice' ? 0 : undefined)
      const v2 = searchFilters[key] || (key.startsWith('min') || key === 'maxPrice' ? 0 : undefined)
      return v1 !== v2
    })

    if (filtersChanged) {
      const urlFilters = createFiltersArray(filters)
      const newUrl = getCatalogUrl(city || area, hood, urlFilters)
      router.push(newUrl)
    }
  }, [filters, searchFilters, city, hood, area, clientSide, router])

  const listingLocation = area || 'Ontario'



  const handleSortChange = (value: ApiSortBy) => {
    // This will trigger the useEffect above
    setFilters({ ...filters, sortBy: value })
  }



  const getSubLocationUrl = (locationName: string) => {
    const filters = createFiltersArray({})
    if (city) {
      // We are in a city, clicking a neighborhood (Level 2)
      return getCatalogUrl(city, locationName, filters)
    } else if (area) {
      // We are in a region, clicking a city/hood (Level 1+)
      return getCatalogUrl(area, locationName, filters)
    } else {
      // clicking a city from the main list
      return getCatalogUrl(locationName, '', filters)
    }
  }

  const getSubLocations = (region: string) => {
    // If we have neighborhoods/cities data for the current selection (Area or City)
    if ((city || area) && hoods.length > 0) {
      return Array.from(new Set(hoods.map((h) => h.name)))
    }
    if (!currentCitymap[region] || !currentCitymap[region].items) return []
    return Object.keys(currentCitymap[region].items).filter(
      (cityName) => currentCitymap[region].items[cityName].active
    )
  }

  // State for locally toggled group
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null)

  // Sync activeGroupId when URL changes or data loads
  useEffect(() => {
    if (locationTree && locationTree.children) {
      const activeGroup = locationTree.children.find((g: any) => {
        // Check exact group match
        const isGroupMatch =
          city?.toLowerCase() === g.name.toLowerCase() ||
          hood?.toLowerCase() === g.name.toLowerCase() ||
          city?.toLowerCase() === g.slug.toLowerCase() ||
          hood?.toLowerCase() === g.slug.toLowerCase()

        if (isGroupMatch) return true

        // Check children match (deep search)
        const hasChildMatch = g.children && g.children.some((child: any) =>
          hood?.toLowerCase() === child.name.toLowerCase() ||
          hood?.toLowerCase() === child.slug.toLowerCase() ||
          city?.toLowerCase() === child.name.toLowerCase() ||
          city?.toLowerCase() === child.slug.toLowerCase()
        )

        return hasChildMatch
      })

      if (activeGroup) {
        setActiveGroupId(activeGroup.id)
      }
    }
  }, [locationTree, city, hood])




  // Scroll handler for the slider
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const currentScroll = scrollContainerRef.current.scrollLeft
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
      <Stack
        py={{ xs: 1, sm: 1.5 }}
        width="100%"
        spacing={1}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        {count > 0 && (
          <>
            <Stack spacing={1} direction="row" alignItems="center">
              {clientSide ? (
                <>
                  {/* <ToggleButtonGroup
                    exclusive
                    value={listingStatus}
                    onChange={(_, value) => value && setFilters({ ...filters, listingStatus: value })}
                    sx={{
                      '& .MuiToggleButton-root': {
                        px: { md: 3, lg: 4 },
                        fontWeight: 400
                      }
                    }}
                  >
                    {statusItems.map(([key, label]) => (
                      <ToggleButton key={key} value={key}>
                        {label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup> */}

                  <ToggleButtonGroup
                    exclusive
                    value={viewMode}
                    onChange={(_, value) => value && setViewMode(value)}
                    size="small"
                    sx={{ mr: 1, '& .MuiToggleButton-root': { px: 2, height: 40 } }}
                  >
                    <ToggleButton value="listings">Listings</ToggleButton>
                    <ToggleButton value="buildings">Buildings</ToggleButton>
                  </ToggleButtonGroup>

                  <AdvancedFiltersButton size={size} sx={{ height: 40 }} />

                  <ToggleButton
                    value="map"
                    selected={showMap}
                    onChange={onToggleMap}
                    size={size}
                    sx={{
                      height: 40,
                      width: 40,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '8px !important',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }
                    }}
                  >
                    {showMap ? <ListIcon /> : <MapIcon />}
                  </ToggleButton>
                </>
              ) : (
                <>
                  <Skeleton variant="rounded" sx={{ width: 257, height: 40 }} />

                </>
              )}
            </Stack>
            <Box
              sx={{
                minWidth: { md: 218 },
                alignContent: 'end',
                textAlign: 'right'
              }}
            >
              <ListingsCounter count={count} />
            </Box>
            <Box
              sx={{
                minWidth: { md: 240 },
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                height: 40,
                px: 2,
                borderRadius: '8px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.light',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }
              }}
            >
              <SortModesSelect filters={filters} onChange={handleSortChange} />
            </Box>
          </>
        )}
      </Stack>

      <Stack sx={{ mb: 2 }} spacing={2}>
        {!selectedRegion ? (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              overflowX: 'auto',
              flexWrap: 'nowrap',
              pb: 1.5,
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.1)', borderRadius: '8px' },
              '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(33, 150, 243, 0.3)' },
              msOverflowStyle: 'auto',
              scrollbarWidth: 'thin'
            }}
          >
            {sortedRegions.map((region) => (
              <Button
                key={region}
                component={Link}
                href={getCatalogUrl(region, '', createFiltersArray({}))}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  borderRadius: '4px',
                  px: 3,
                  flexShrink: 0,
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(33, 150, 243, 0.04)'
                  }
                }}
              >
                {region}
              </Button>
            ))}
          </Box>
        ) : (
          <Stack spacing={1}>
            <Box
              component={Link}
              href={city && hood ? getCatalogUrl(city, '', createFiltersArray({})) : '#'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'primary.main',
                whiteSpace: 'nowrap',
                cursor: (city && hood) ? 'pointer' : 'default',
                '&:hover': {
                  '& .region-label': {
                    textDecoration: (city && hood) ? 'underline' : 'none'
                  }
                }
              }}
            >
              <Typography
                className="region-label"
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
              >
                Areas in {selectedRegion}:
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => handleScroll('left')} size="small" sx={{ mr: 1, border: '1px solid', borderColor: 'divider' }}>
                <ChevronLeftIcon />
              </IconButton>

              <Box
                ref={scrollContainerRef}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                  overflowX: 'auto',
                  flexWrap: 'nowrap',
                  flex: 1,
                  scrollBehavior: 'smooth',
                  pb: 0.5,
                  '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for cleaner look
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none'
                }}
              >
                {!locationTree && getSubLocations(selectedRegion)
                  .sort((a, b) => {
                    if (hood?.toLowerCase() === a.toLowerCase()) return -1
                    if (hood?.toLowerCase() === b.toLowerCase()) return 1
                    return a.localeCompare(b)
                  })
                  .map((locationName) => (
                    <Button
                      key={locationName}
                      component={Link}
                      href={getSubLocationUrl(locationName)}
                      variant={hood?.toLowerCase() === locationName.toLowerCase() ? 'contained' : 'outlined'}
                      sx={{
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        borderRadius: '4px',
                        borderColor: 'primary.light',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      {capitalize(locationName)}
                    </Button>
                  ))}

                {/* New Hierarchical Groups View */}
                {locationTree && locationTree.children && (
                  <>
                    {locationTree.children.map((group: any) => {
                      const isActive = activeGroupId === group.id
                      return (
                        <Button
                          key={group.id}
                          // Toggle local state only, no redirect
                          onClick={() => setActiveGroupId(isActive ? null : group.id)}
                          variant={isActive ? 'contained' : 'outlined'}
                          sx={{
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            borderRadius: '4px', // More "toggle" like rounded shape
                            borderColor: isActive ? 'primary.main' : 'divider',
                            bgcolor: isActive ? 'primary.main' : 'background.paper',
                            color: isActive ? 'white' : 'text.primary',
                            boxShadow: isActive ? 2 : 0,
                            '&:hover': {
                              bgcolor: isActive ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                              borderColor: isActive ? 'primary.dark' : 'text.primary',
                            }
                          }}
                        >
                          {group.name}
                          {isActive ? (
                            <Box component="span" sx={{ transform: 'rotate(180deg)', display: 'inline-flex', ml: 0.5 }}><KeyboardArrowDownIcon /></Box>
                          ) : (
                            <Box component="span" sx={{ display: 'inline-flex', ml: 0.5 }}><KeyboardArrowDownIcon /></Box>
                          )}
                        </Button>
                      )
                    })}
                  </>
                )}
              </Box>

              <IconButton onClick={() => handleScroll('right')} size="small" sx={{ ml: 1, border: '1px solid', borderColor: 'divider' }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Stack>
        )}
      </Stack>

      {/* Active Group Neighborhoods (Chips) */}
      {locationTree && locationTree.children && (
        <Box sx={{ mb: 2 }}>
          {(() => {
            // Find active group from STATE
            const activeGroup = locationTree.children.find((g: any) => g.id === activeGroupId)

            if (activeGroup && activeGroup.children && activeGroup.children.length > 0) {
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  {activeGroup.children.map((child: any) => {
                    const isChildActive = hood?.toLowerCase() === child.name.toLowerCase() || hood?.toLowerCase() === child.slug.toLowerCase()
                    return (
                      <Chip
                        key={child.id}
                        label={child.name}
                        clickable
                        onClick={() => {
                          const url = `${routes.listings}/${locationTree.slug}/${child.slug}`
                          router.push(url)
                        }}
                        sx={{
                          borderRadius: '4px',
                          bgcolor: isChildActive ? 'primary.main' : 'white',
                          color: isChildActive ? 'white' : 'text.primary',
                          border: '1px solid',
                          borderColor: isChildActive ? 'primary.main' : 'divider',
                          '&:hover': {
                            bgcolor: isChildActive ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                            borderColor: isChildActive ? 'primary.dark' : 'primary.main',
                          }
                        }}
                      />
                    )
                  })}
                </Box>
              )
            }
            return null
          })()}
        </Box>
      )}

      <AdvancedFiltersDialog />
    </>
  )
}

export default CatalogFilters
