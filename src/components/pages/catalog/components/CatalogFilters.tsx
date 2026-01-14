'use client'

import { useRouter } from 'next/navigation'
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
  SortModesSelect,
  ListingLocationSelect
} from '@shared/Filters'

import { type ApiSortBy, type ApiBoardArea } from 'services/API'
import type { Filters } from 'services/Search'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'
import { getCatalogUrl } from 'utils/urls'
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
  searchFilters
}: {
  count: number
  city?: string
  hood?: string
  area?: string
  areas?: ApiBoardArea[]
  listingLocation?: string
  searchFilters: Partial<Filters>
}) => {
  const dynamicCitymap: Record<string, { active: boolean; items: Record<string, { active: boolean }> }> = {}
  areas.forEach(a => {
    dynamicCitymap[a.name] = {
      active: true,
      items: {}
    }
    a.cities.forEach(c => {
      dynamicCitymap[a.name].items[c.name] = { active: true }
    })
  })

  const regions = areas.length ? areas.map(a => a.name) : Object.keys(citymap).filter((key) => citymap[key].active)
  const currentCitymap = (areas.length ? dynamicCitymap : citymap) as any
  const router = useRouter()
  const clientSide = useClientSide()
  const { mobile } = useBreakpoints()
  const size = mobile ? 'small' : 'medium'

  const { listingStatus, listingType, sortBy } = searchFilters

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
      (a) =>
        (area && a.name.toLowerCase() === area.toLowerCase()) ||
        (city && a.name.toLowerCase() === city.toLowerCase())
    )
    if (areaMatch) return areaMatch.name

    const cityMatch = areas.find((a) =>
      a.cities.some((c) => c.name.toLowerCase() === city?.toLowerCase())
    )
    return cityMatch?.name || null
  })

  // Sync selection with URL changes
  useEffect(() => {
    const areaMatch = areas.find(
      (a) =>
        (area && a.name.toLowerCase() === area.toLowerCase()) ||
        (city && a.name.toLowerCase() === city.toLowerCase())
    )
    if (areaMatch) {
      setSelectedRegion(areaMatch.name)
      return
    }

    const cityMatch = areas.find((a) =>
      a.cities.some((c) => c.name.toLowerCase() === city?.toLowerCase())
    )
    if (cityMatch) {
      setSelectedRegion(cityMatch.name)
    } else if (city || area) {
      // If path changed but no match found in dynamic areas, maybe reset or keep current
    } else {
      setSelectedRegion(null)
    }
  }, [city, area, areas])

  const createFiltersArray = ({
    type = listingType || 'condos',
    status = listingStatus,
    sort = sortBy
  }) => {
    const filters: string[] = []

    if (type !== 'allListings') filters.push(type)
    if (status === 'rent') filters.push('for-rent')
    if (sort !== 'createdOnDesc') filters.push('sort-' + sort)

    return filters
  }

  const listingLocation = area || 'Ontario'

  const handleTypeChange = (value: ListingType) => {
    const filters = createFiltersArray({ type: value })
    router.push(getCatalogUrl(city, hood, filters))
  }

  const handleLocationChange = (value: ListingType) => {
    router.push(getCatalogUrl(value))
  }

  const handleSortChange = (value: ApiSortBy) => {
    const filters = createFiltersArray({ sort: value })
    router.push(getCatalogUrl(city, hood, filters))
  }

  // Location handlers
  const handleRegionClick = (region: string) => {
    setSelectedRegion(region)
  }

  const handleBack = () => {
    setSelectedRegion(null)
  }

  const handleCityClick = (region: string, cityName: string) => {
    router.push(getCatalogUrl(cityName))
    setSelectedRegion(null)
  }

  const getCities = (region: string) => {
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
            <Stack spacing={1} direction="row">
              {clientSide ? (
                <ToggleButtonGroup
                  exclusive
                  value={listingStatus}
                  sx={{
                    '& .MuiToggleButton-root': {
                      px: { md: 3, lg: 4 },
                      fontWeight: 400
                    }
                  }}
                >
                  {statusItems.map(([key, label]) => (
                    <ToggleButton
                      key={key}
                      value={key}
                      href={getCatalogUrl(
                        city,
                        hood,
                        createFiltersArray({ status: key })
                      )}
                    >
                      {label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              ) : (
                <Skeleton variant="rounded" sx={{ width: 257, height: 48 }} />
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
          </>
        )}
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {!selectedRegion ? (
            <>
              {sortedRegions.slice(0, 8).map((region) => (
                <Button
                  key={region}
                  variant="outlined"
                  onClick={() => handleRegionClick(region)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '20px',
                    px: 3,
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
              {sortedRegions.length > 8 && (
                <Button
                  variant="text"
                  sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 600 }}
                  onClick={() => setSelectedRegion('all')}
                >
                  +{sortedRegions.length - 8} more areas
                </Button>
              )}
            </>
          ) : selectedRegion === 'all' ? (
            <>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ textTransform: 'none', borderRadius: '20px' }}
              >
                Back
              </Button>
              {sortedRegions.map((region) => (
                <Button
                  key={region}
                  variant="outlined"
                  onClick={() => handleRegionClick(region)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '20px',
                    borderColor: 'divider'
                  }}
                >
                  {region}
                </Button>
              ))}
            </>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ textTransform: 'none', borderRadius: '20px' }}
              >
                Back to Regions
              </Button>
              <Typography variant="subtitle2" sx={{ mx: 2, fontWeight: 700, color: 'primary.main' }}>
                {selectedRegion}:
              </Typography>
              {getCities(selectedRegion).map((cityName) => (
                <Button
                  key={cityName}
                  variant="outlined"
                  onClick={() => handleCityClick(selectedRegion, cityName)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '20px',
                    borderColor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white'
                    }
                  }}
                >
                  {cityName}
                </Button>
              ))}
            </>
          )}
        </Box>
        <Box
          sx={{
            minWidth: { md: 218 },
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <SortModesSelect
            filters={searchFilters}
            onChange={handleSortChange}
          />
        </Box>
      </Stack>
    </>
  )
}

export default CatalogFilters
