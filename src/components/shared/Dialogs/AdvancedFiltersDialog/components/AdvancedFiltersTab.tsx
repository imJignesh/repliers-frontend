import { Box, Stack, Typography } from '@mui/material'

import { type Filters } from 'services/Search'

import { DaysSelect, FilterButtonGroup, PricePicker, PriceSelect, YearBuiltSelect } from '.'

const bedsItems: [string, number][] = [
  ['1+ beds', 1],
  ['2+ beds', 2],
  ['3+ beds', 3],
  ['4+ beds', 4]
]

const bathsItems: [string, number][] = [
  ['1+ baths', 1],
  ['2+ baths', 2],
  ['3+ baths', 3]
]

const parkingItems: [string, number][] = [
  ['1+ parking', 1],
  ['2+ parking', 2]
]

const AdvancedFiltersTab = ({
  dialogState,
  priceBuckets,
  onChange
}: {
  dialogState: Filters
  priceBuckets: Record<string, number>
  onChange: (mutation: Partial<Filters>) => void
}) => {
  // helpers
  const {
    minPrice,
    maxPrice,
    minBaths,
    minBeds,
    minParkingSpaces,
    listingStatus,
    soldWithin,
    daysOnMarket,
    minYearBuilt,
    maxYearBuilt
  } = dialogState

  const handlePriceChange = ([minPrice, maxPrice]: number[]) => {
    onChange({ minPrice, maxPrice })
  }

  return (
    <Stack direction="column" spacing={{ xs: 2, sm: 3, md: 4 }}>
      <FilterButtonGroup
        label="Beds"
        name="minBeds"
        value={minBeds || 0}
        items={bedsItems}
        onChange={onChange}
      />
      <FilterButtonGroup
        label="Baths"
        name="minBaths"
        value={minBaths || 0}
        onChange={onChange}
        items={bathsItems}
      />

      <FilterButtonGroup
        label="Parking"
        name="minParkingSpaces"
        value={minParkingSpaces || 0}
        onChange={onChange}
        items={parkingItems}
      />
      <Box>
        <Typography fontWeight={500}>Price</Typography>
        {Object.keys(priceBuckets).length > 0 ? (
          <PricePicker
            variant="bars"
            buckets={priceBuckets}
            values={[minPrice || 0, maxPrice || 0]}
            onChange={handlePriceChange}
          />
        ) : (
          <Box pt={2}>
            <PriceSelect
              min={minPrice}
              max={maxPrice}
              onChange={onChange}
            />
          </Box>
        )}
      </Box>
      <DaysSelect
        status={listingStatus}
        soldValue={soldWithin}
        daysValue={daysOnMarket}
        onChange={onChange}
      />
      <YearBuiltSelect
        from={minYearBuilt}
        to={maxYearBuilt}
        onChange={onChange}
      />
    </Stack>
  )
}

export default AdvancedFiltersTab
