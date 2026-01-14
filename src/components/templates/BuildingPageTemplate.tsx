'use client'

import React from 'react'

import { Box } from '@mui/material'

import BuildingPageContent from '@pages/listing/BuildingPageContent'

import { type ApiQueryResponse } from 'services/API'
import PropertyDetailsProvider from 'providers/PropertyDetailsProvider'
import PropertyProvider from 'providers/PropertyProvider'

import { PageTemplate } from '.'

const BuildingPageTemplate = ({ property, history }: { property: ApiQueryResponse, history?: ApiQueryResponse }) => {
  const p = property?.listings?.[0]

  if (!p) return null


  return (
    <PageTemplate>
      {property?.listings?.length > 0 && <PropertyProvider property={p}>
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
      </PropertyProvider>}
    </PageTemplate>
  )
}

export default BuildingPageTemplate
