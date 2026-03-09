import type React from 'react'

import { Box, Stack, Typography } from '@mui/material'
import { PropertyCard, PropertyCarousel } from '@shared/Property'
import { CarouselHeader } from '@shared/Property/Carousel/components'


import { type Property } from 'services/API'

const UnitCarousel = ({
  properties
}: {
  properties: Property[]
}) => {
  if (properties.length === 0) return null

  const activeUnits = properties.filter((property) => {
    const status = property?.status === 'A'
    const pType = property?.details?.propertyType?.toLowerCase() || ''
    const isParking = pType.includes('parking') || pType.includes('locker')
    return status && !isParking
  })

  if (activeUnits.length === 0) return null

  return (
    <Box p={1} pt={4} mt={0} mb={0} mx={-1}>
      <Box>
        <CarouselHeader title={'Active Units'} navigation={false} onPrev={() => { }} onNext={() => { }} />
        <br />
        <Stack spacing={4} direction="row" flexWrap="wrap" justifyContent="center">
          {activeUnits.map((property, index) => (
            <PropertyCard key={index} property={property} />
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

export default UnitCarousel
