'use client'

import React from 'react'

import { Box } from '@mui/material'

import BuildingPageContent from '@pages/listing/BuildingPageContent'

import { type Property } from 'services/API'
import { useFeatures } from 'providers/FeaturesProvider'
import PropertyDetailsProvider from 'providers/PropertyDetailsProvider'
import PropertyProvider from 'providers/PropertyProvider'

import { PageTemplate } from '.'

const BuildingPageTemplate = ({ property }: { property: Property }) => {
  const features = useFeatures()
  const noHeader = !features.pdpHeader
  const p = property?.listings?.[0] ? property?.listings?.[0] : [];


  return (
    <PageTemplate noHeader={noHeader}>
      {property?.listings?.length > 0 && <PropertyProvider property={p}>
        <PropertyDetailsProvider property={p}>
          <Box
            sx={{
              width: '100%',
              pt: { xs: 0, sm: 2 },
              overflow: { xs: 'hidden', md: 'visible' }
            }}
          >

            <BuildingPageContent similarProperties={property?.listings} />
          </Box>
        </PropertyDetailsProvider>
      </PropertyProvider>}
    </PageTemplate>
  )
}

export default BuildingPageTemplate
