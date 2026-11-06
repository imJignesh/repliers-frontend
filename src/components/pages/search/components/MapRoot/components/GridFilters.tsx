'use client'

import React from 'react'

import { Box, CircularProgress, Typography } from '@mui/material'

import { ListingsCounter, SortModesSelect } from '@shared/Filters'

import { useSearch } from 'providers/SearchProvider'

import { FiltersTransitionContainer } from '.'

const GridFilters = () => {
  const { loading, error, page, count, filters, setFilter } = useSearch()

  const handleSortChange = (newValue: string) => setFilter('sortBy', newValue)

  return (
    <FiltersTransitionContainer>
      <Box sx={{ height: 34, display: 'flex', alignItems: 'center' }}>
        {error ? (
          <Typography variant="body2">Results unavailable</Typography>
        ) : loading || !page ? (
          <CircularProgress
            aria-label="Loading listings"
            size={16}
            sx={{ mx: 1 }}
          />
        ) : (
          <ListingsCounter filters={filters} count={count} />
        )}
      </Box>
      {/* Audit: the Map/Grid toggle (MapFiltersBar, absolute, 107px wide at
          right 24-32px) covered the sort value at 1440px. Keep clear of it. */}
      <Box sx={{ mr: { md: '128px', lg: '136px' } }}>
        <SortModesSelect filters={filters} onChange={handleSortChange} />
      </Box>
    </FiltersTransitionContainer>
  )
}

export default GridFilters
