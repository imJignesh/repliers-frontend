'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Box,
  Button,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup
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

import { type ApiSortBy } from 'services/API'
import type { Filters } from 'services/Search'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'
import { getCatalogUrl } from 'utils/urls'
import location, { citymap } from 'configs/defaults/location'


const statusItems: Array<[ListingStatus, string]> = [
  ['active', 'For Sale'],
  ['rent', 'For Rent']
]

// Get all regions (level 1)
const regions = Object.keys(citymap).filter((key) => citymap[key].active)

const CatalogFilters = ({
  count,
  city,
  hood,
  area,
  searchFilters
}: {
  count: number
  city?: string
  hood?: string
  area?: string
  listingLocation?: string
  searchFilters: Partial<Filters>
}) => {
  const router = useRouter()
  const clientSide = useClientSide()
  const { mobile } = useBreakpoints()
  const size = mobile ? 'small' : 'medium'

  const { listingStatus, listingType, sortBy } = searchFilters

  // Location filter state
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

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
    if (!citymap[region] || !citymap[region].items) return []
    return Object.keys(citymap[region].items).filter(
      (cityName) => citymap[region].items[cityName].active
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
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {!selectedRegion ? (
            // Show region buttons
            <>
              {regions.map((region) => (
                <Button
                  key={region}
                  variant="outlined"
                  onClick={() => handleRegionClick(region)}
                  sx={{ textTransform: 'none' }}
                >
                  {region}
                </Button>
              ))}
            </>
          ) : (
            // Show back button and city buttons
            <>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
              {getCities(selectedRegion).map((cityName) => (
                <Button
                  key={cityName}
                  variant="outlined"
                  onClick={() => handleCityClick(selectedRegion, cityName)}
                  sx={{ textTransform: 'none' }}
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
