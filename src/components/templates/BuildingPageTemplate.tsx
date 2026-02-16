'use client'

import React from 'react'

import { Box } from '@mui/material'

import BuildingPageContent from '@pages/listing/BuildingPageContent'

import { type ApiQueryResponse } from 'services/API'
import PropertyDetailsProvider from 'providers/PropertyDetailsProvider'
import PropertyProvider from 'providers/PropertyProvider'

import { PageTemplate } from '.'

const BuildingPageTemplate = ({ property, history }: { property: ApiQueryResponse, history?: ApiQueryResponse }) => {
  let p = property?.listings?.[0]

  if (!p && property.building) {
    // Create a skeleton property object if we have building data but no active listings
    p = {
      address: {
        streetNumber: property.building.street?.number,
        streetName: property.building.street?.name,
        streetSuffix: property.building.street?.suffix,
        city: property.building.location?.city?.name,
        neighborhood: property.building.location?.locality?.name
      } as any,
      images: [],
      details: {
        description: property.building.content
      } as any,
      building: property.building
    } as any
  }

  if (!p) return null

  // Attach building metadata to the listing object so it's available via useProperty()
  if (property.building && !(p as any).building) {
    (p as any).building = property.building
  }

  return (
    <PageTemplate>
      <PropertyProvider property={p}>
        <PropertyDetailsProvider property={p}>
          <Box
            sx={{
              width: '100%',
              pt: { xs: 0, sm: 2 },
              overflow: { xs: 'hidden', md: 'visible' }
            }}
          >
            <BuildingPageContent
              similarProperties={property?.listings}
              history={history?.listings}
            />
          </Box>
        </PropertyDetailsProvider>
      </PropertyProvider>
    </PageTemplate>
  )
}

export default BuildingPageTemplate
