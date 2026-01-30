import React from 'react'

import Link from 'next/link'
import { Box, Stack, Typography } from '@mui/material'
import { useUser } from 'providers/UserProvider'
import routes from '@configs/routes'

import { DetailsContainer } from '@shared/Containers'

import { type HistoryItemType, type Property } from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { rent, sold } from 'utils/properties'

import { HistoryItem } from '.'

const getListingData = (property: Property): HistoryItemType => ({
  lastStatus: property.lastStatus,
  mlsNumber: property.mlsNumber,
  listDate: property.listDate,
  listPrice: property.listPrice,
  timestamps: property.timestamps,
  soldDate: property.soldDate,
  soldPrice: +property.soldPrice,
  office: property.office,
  type: property.type,
  images: property.images
})

const getActiveItem = (property: Property): HistoryItemType =>
  ({
    mlsNumber: property.mlsNumber,
    timestamps: { listingEntryDate: property.listDate },
    type: rent(property) ? 'Rent' : 'Sale',
    listPrice: Number(property.listPrice),
    images: property.images
  }) as HistoryItemType

const HistoryDetails = () => {
  const { property } = useProperty()
  const { logged } = useUser()
  const { mlsNumber, history = [] } = property
  const soldProperty = sold(property)
  const shouldShowActiveItem = soldProperty
    ? false // hide for sold properties
    : !history.length || history[0].mlsNumber !== mlsNumber

  if (!history.length && !shouldShowActiveItem) return null

  return (
    <DetailsContainer title="Sale History" id="history">
      <Stack spacing={3}>
        {!logged && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Require you to be <Link href={routes.login} style={{ fontWeight: 'bold', color: 'inherit' }}>signed in</Link> to access price history. <Link href={'/register'} style={{ fontWeight: 'bold', color: 'inherit' }}>Sign up</Link> to Request Price full history.
            </Typography>
          </Box>
        )}
        {shouldShowActiveItem && (
          <HistoryItem
            key={mlsNumber}
            item={getActiveItem(property)}
            active
            last={!history.length}
            blurred={!logged}
          />
        )}

        {history.map((item, index) => {
          const active = index === 0 && mlsNumber === item.mlsNumber
          const current = active ? getListingData(property) : item
          const last = index === history.length - 1
          return (
            <HistoryItem
              key={index}
              item={current}
              last={last}
              active={active}
              blurred={!logged}
            />
          )
        })}


      </Stack>
    </DetailsContainer>
  )
}

export default HistoryDetails
