'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Box, Typography, Divider } from '@mui/material'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { usePropertyDetails } from 'providers/PropertyDetailsProvider'
import { useProperty } from 'providers/PropertyProvider'
import {
  mapperTotalBeds,
  mapperBaths,
  mapperTotalParking
} from 'utils/dataMapper/mappers'

const RoomsDetails = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  try {
    const propertyDetails = usePropertyDetails()
    const { property } = useProperty()
    const t = useTranslations()

    console.log('RoomsDetails - propertyDetails:', propertyDetails)
    console.log('RoomsDetails - property:', property)

    // Safety check: ensure propertyDetails exists
    if (!propertyDetails) {
      console.log('RoomsDetails - No propertyDetails')
      return null
    }

    const { rooms } = propertyDetails

    console.log('RoomsDetails - rooms:', rooms)

    // Safety check: ensure rooms is an array
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      console.log('RoomsDetails - No rooms or empty array')
      return null
    }

    const { details } = property

    // Safety check: ensure details exists
    if (!details) {
      console.log('RoomsDetails - No details')
      return null
    }

    const facts = [
      { label: 'Beds', value: mapperTotalBeds(property) },
      { label: 'Baths', value: mapperBaths(property) },
      { label: 'Parking', value: mapperTotalParking(property) },
      { label: 'Kitchens', value: details.numKitchens },
      { label: 'Family Room', value: details.familyRoom === 'Y' ? 'Yes' : null },
      { label: 'Sq Ft', value: details.sqft },
      { label: 'Basement', value: details.basement1 },
      { label: 'Garage', value: details.garage },
      { label: 'A/C', value: details.airConditioning },
      { label: 'Heating', value: details.heating },
      { label: 'Year Built', value: details.yearBuilt },
    ].filter(f => f.value && f.value !== '0' && f.value !== '0 + 0' && f.value !== 'null' && f.value !== 'N')

    return (
      <DetailsContainer title={t('pdp.sections.rooms.name')} id="rooms">
        <Box sx={{ mb: 4 }}>
          <DetailsList mode="columns">
            <DetailsGroup
              group={{
                title: 'Summary',
                items: facts.map(f => ({ label: f.label, value: f.value }))
              }}
            />
          </DetailsList>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Room Dimensions</Typography>

        <DetailsList>
          {rooms.map((room, index) => {
            // Safety check for each room
            if (!room || typeof room !== 'object') return null

            return (
              <DetailsGroup
                key={room.title || `room-${index}`}
                group={room}
                scrubbedValue="****"
                breakInside={rooms.length > 1 ? 'avoid' : 'auto'}
              />
            )
          })}
        </DetailsList>
      </DetailsContainer>
    )
  } catch (error) {
    // Log error for debugging but don't crash the page
    console.error('Error rendering RoomsDetails:', error)
    return null
  }
}

export default RoomsDetails
