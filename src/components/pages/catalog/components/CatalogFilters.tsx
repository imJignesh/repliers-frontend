'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import {
  type ListingStatus,
  type ListingType,
  type ListingLocation
} from '@configs/filters'
import {
  ListingsCounter,
  ListingTypeSelect,
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
  searchFilters
}: {
  count: number
  city?: string
  hood?: string
  area?: string
  areas?: ApiBoardArea[]
  hoods?: ApiNeighborhood[]
  listingLocation?: string
  searchFilters: Partial<Filters>
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

    if (f.minPrice) urlFilters.push(`above-${f.minPrice}`)
    if (f.maxPrice) urlFilters.push(`below-${f.maxPrice}`)
    if (f.minBeds) urlFilters.push(`${f.minBeds}-bed`)
    if (f.minBaths) urlFilters.push(`${f.minBaths}-bath`)
    if (f.minGarageSpaces) urlFilters.push(`${f.minGarageSpaces}-garage`)
    if (f.minParkingSpaces) urlFilters.push(`${f.minParkingSpaces}-parking`)

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

  const handleTypeChange = (value: ListingType) => {
    // This will trigger the useEffect above
    setFilters({ ...filters, listingType: value })
  }

  const handleLocationChange = (value: ListingType) => {
    router.push(getCatalogUrl(value))
  }

  const handleSortChange = (value: ApiSortBy) => {
    // This will trigger the useEffect above
    setFilters({ ...filters, sortBy: value })
  }

  // Location handlers
  const handleRegionClick = (region: string) => {
    setSelectedRegion(region)
  }

  const handleBack = () => {
    setSelectedRegion(null)
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
      return hoods.map((h) => h.name)
    }
    if (!currentCitymap[region] || !currentCitymap[region].items) return []
    return Object.keys(currentCitymap[region].items).filter(
      (cityName) => currentCitymap[region].items[cityName].active
    )
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

                  <ListingTypeSelect
                    size={size}
                    value={listingType || 'allListings'}
                    onChange={handleTypeChange}
                  />

                  <AdvancedFiltersButton size={size} />
                </>
              ) : (
                <>
                  <Skeleton variant="rounded" sx={{ width: 257, height: 48 }} />

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
                p: 1.5,
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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            overflowX: 'auto',
            flexWrap: 'nowrap',
            flex: 1,

            pb: 1.5,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            '&::-webkit-scrollbar': {
              height: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '8px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(33, 150, 243, 0.3)'
            },
            msOverflowStyle: 'auto',
            scrollbarWidth: 'thin'
          }}
        >
          {!selectedRegion ? (
            <>
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
            </>
          ) : (
            <>
              <Button
                component={Link}
                href={routes.listings}
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  textTransform: 'none',
                  borderRadius: '4px',
                  flexShrink: 0,
                  px: 2
                }}
              >
                Regions
              </Button>
              <Box
                component={Link}
                href={city && hood ? getCatalogUrl(city, '', createFiltersArray({})) : '#'}
                sx={{
                  ml: 1,
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'primary.main',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
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
                  {selectedRegion}:
                </Typography>
              </Box>
              {getSubLocations(selectedRegion)
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
            </>
          )}
        </Box>

      </Stack>
      <AdvancedFiltersDialog />
    </>
  )
}

export default CatalogFilters
