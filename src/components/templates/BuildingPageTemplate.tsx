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
    // Use cached response if available, otherwise create a skeleton property object
    const cached = property.building.cached_response;

    p = {
      ...(cached || {}),
      address: {
        streetNumber: property.building.street?.number || cached?.address?.streetNumber,
        streetName: property.building.street?.name || cached?.address?.streetName,
        streetSuffix: property.building.street?.suffix || cached?.address?.streetSuffix,
        city: property.building.location?.city?.name || cached?.address?.city,
        neighborhood: property.building.location?.locality?.name || cached?.address?.neighborhood
      } as any,
      images: (property.building.cover_photo_url ? [property.building.cover_photo_url] : []).concat(cached?.images || []),
      details: {
        ...(cached?.details || {}),
        description: property.building.content || cached?.details?.description
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
