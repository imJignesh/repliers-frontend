import { Box, Stack, Typography } from '@mui/material'

import { type Filters } from 'services/Search'

import { DaysSelect, FilterButtonGroup, PricePicker, PriceSelect, YearBuiltSelect } from '.'

const bedsItems: [string, number][] = [
  ['0 bed', 0],
  ['1 bed', 1],
  ['2 bed', 2],
  ['3+ Beds', 3]
]

const bathsItems: [string, number][] = [
  ['1 bath', 1],
  ['2 bath', 2],
  ['3+ bath', 3]
]

const parkingItems: [string, number][] = [
  ['0 parking', 0],
  ['1 parking', 1],
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
    minGarageSpaces,
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
        label="Garage"
        name="minGarageSpaces"
        value={minGarageSpaces || 0}
        onChange={onChange}
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
