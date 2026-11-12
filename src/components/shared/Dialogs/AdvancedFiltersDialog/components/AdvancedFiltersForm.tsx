'use client'

import { useEffect, useRef, useState } from 'react'

import { Box, DialogContent, DialogTitle } from '@mui/material'

import { defaultAdvancedFilters } from '@configs/filters'
import { DialogCloseButton } from '@shared/Dialogs/components'

import SearchService, {
  type Filters,
  getMapPolygon,
  getMapRectangle
} from 'services/Search'
import { useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { mergeBuckets } from 'utils/filters'

import { dialogName } from '../AdvancedFiltersDialog'

import {
  AdvancedFiltersMenu,
  AdvancedFiltersTab,
  AiQualityFiltersTab,
  FilterActions
} from '.'

const AdvancedFiltersForm = ({
  onSubmit,
  onReset,
  countBuildings
}: {
  onSubmit: () => void
  onReset: () => void
  /**
   * Catalog Buildings view: count buildings with a listing matching the draft
   * filters (-1 when unknown), so the button says "Show N buildings".
   */
  countBuildings?: (filters: Filters) => Promise<number>
}) => {
  const countRequest = useRef(0)
  const [tab, setTab] = useState('advanced')
  const { position } = useMapOptions()
  const { filters, polygon, setFilters, resetFilters } = useSearch()

  const intialState = {
    ...defaultAdvancedFilters,
    ...filters
  }

  const [dialogState, setDialogState] = useState<Filters>(intialState)

  const handleDialogStateChange = (mutation: Partial<Filters>) => {
    setDialogState({
      ...dialogState,
      ...mutation
    })
  }

  const [count, setCount] = useState<number | null>(null)
  const [yearError, setYearError] = useState<string | null>(null)
  const priceReversed = Boolean(
    dialogState.minPrice &&
    dialogState.maxPrice &&
    dialogState.minPrice > dialogState.maxPrice
  )
  const invalid = Boolean(yearError) || priceReversed

  // Price Buckets
  const [priceBuckets, setPriceBuckets] = useState({})

  const handleReset = () => {
    resetFilters()
    setDialogState(defaultAdvancedFilters)
    onReset?.()
  }

  const handleSubmit = () => {
    if (invalid) return
    setFilters({ ...filters, ...dialogState })
    onSubmit?.()
  }

  const fetchBucketsCounts = async () => {
    // Audit R01: never show the previous selection's count as if it matched
    // the current one; the button shows a spinner until the new count arrives.
    setCount(null)
    const { bounds } = position
    const hasLocation =
      bounds || polygon || filters.city || filters.area || filters.neighborhood

    // remove price filters from the request
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { minPrice, maxPrice, ...requestFilters } = filters

    const mapParams = polygon
      ? getMapPolygon(polygon)
      : bounds
        ? getMapRectangle(bounds)
        : {}

    try {
      if (hasLocation) {
        const response = await SearchService.fetch(
          {
            ...requestFilters,
            ...dialogState,
            aggregates: 'listPrice',
            ...mapParams
          },
          { cancelGroup: 'filters' }
        )

        if (response) {
          const { aggregates: { listPrice } = {} } = response
          if (listPrice) {
            const priceBuckets = mergeBuckets(
              filters.listingStatus === 'rent'
                ? listPrice.lease
                : listPrice.sale
            )
            setPriceBuckets(priceBuckets)
          } else {
            setPriceBuckets({})
          }
        }
      } else {
        setPriceBuckets({})
      }

      if (invalid) {
        setCount(0)
        return
      }
      if (countBuildings) {
        // Ignore an older request that finishes after a newer one.
        const request = ++countRequest.current
        const buildings = await countBuildings({ ...filters, ...dialogState })
        if (request === countRequest.current) setCount(buildings)
        return
      }
      const response2 = await SearchService.fetch(
        {
          ...filters,
          ...dialogState,
          ...(hasLocation ? mapParams : {})
        },
        { cancelGroup: 'filters' }
      )
      if (response2) setCount(response2.count)
    } catch (error) {
      if (error !== 'disabled' && (error as any)?.name !== 'AbortError') {
        console.error('[AdvancedFiltersForm] fetchBucketsCounts error:', error)
        // Count unknown: let the visitor apply anyway rather than spin forever.
        setCount(-1)
      }
    }
  }

  useEffect(() => {
    fetchBucketsCounts()
  }, [dialogState])

  const features = useFeatures()

  const { hideDialog } = useDialog(dialogName)

  return (
    <>
      <DialogCloseButton
        onClose={hideDialog}
        sx={features.aiQuality ? { top: 12, right: 12 } : {}}
      />

      {features.aiQuality ? (
        <AdvancedFiltersMenu
          selected={tab}
          onChange={setTab}
          dialogState={dialogState}
        />
      ) : (
        // use regular title/header for dialog window
        <DialogTitle>Advanced Filters</DialogTitle>
      )}

      <DialogContent>
        <Box sx={features.aiQuality ? { py: 2 } : { pb: 2 }}>
          {tab === 'advanced' && (
            <AdvancedFiltersTab
              dialogState={dialogState}
              priceBuckets={priceBuckets}
              onChange={handleDialogStateChange}
              onYearError={setYearError}
            />
          )}

          {tab === 'image' && (
            <AiQualityFiltersTab
              dialogState={dialogState}
              onChange={handleDialogStateChange}
            />
          )}
        </Box>
      </DialogContent>

      <FilterActions
        count={count}
        noun={countBuildings ? 'building' : 'listing'}
        invalid={invalid}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default AdvancedFiltersForm
