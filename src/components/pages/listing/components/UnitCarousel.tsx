import type React from 'react'

import { Box, Stack, Typography } from '@mui/material'
import { PropertyCard, PropertyCarousel } from '@shared/Property'
import { CarouselHeader } from '@shared/Property/Carousel/components'


import { type Property } from 'services/API'

const UnitCarousel = ({
  properties
}: {
  properties: Object[]
}) => {
  if (properties.length === 0) return null

  return (
    <Box p={1} pt={4} mt={0} mb={0} mx={-1}>

      {/* <PropertyCarousel
        title="Active Units"
        properties={properties}
        openInNewTab
      /> */}

      {
        properties.filter((property) => property?.status === 'A').length > 0 && (
          <Box>
            <CarouselHeader title={'Active Units'} />
            <br />
            {properties?.length > 0 ? (
              <Stack spacing={4} direction="row" flexWrap="wrap">

                {/* {properties.map((property, index) => ( */}
                {properties.filter((property) => property?.status === 'A')?.map((property, index) => (

                  <PropertyCard key={index} property={property} />

                ))}
              </Stack>
            ) : (
              <Typography variant="body1" color="text.secondary"></Typography>
            )}
          </Box>)
      }

    </Box>
  )
}

export default UnitCarousel
