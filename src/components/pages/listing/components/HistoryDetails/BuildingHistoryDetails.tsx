'use client'

import React from 'react'
import { Stack, Typography, Box, Alert } from '@mui/material'
import { DetailsContainer } from '@shared/Containers'
import { type Property, type HistoryItemType } from 'services/API'
import { scrubbed, active as isActive } from 'utils/properties'
import { HistoryItem } from '.'

// Helper to convert Property to HistoryItemType
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

const BuildingHistoryDetails = ({ history = [] }: { history?: Property[] }) => {
    // Filter out scrubbed entries and count them
    const visibleHistory = history.filter(item => {
        return !scrubbed(item.mlsNumber) &&
            !scrubbed(item.address?.streetNumber) &&
            !scrubbed(item.listPrice)
    })

    const scrubbedCount = history.length - visibleHistory.length

    if (!visibleHistory.length && scrubbedCount === 0) return null

    // Sort chronologically (most recent first)
    const sortedHistory = [...visibleHistory].sort((a, b) => {
        const dateA = new Date(b.timestamps?.listingUpdated || b.listDate).getTime()
        const dateB = new Date(a.timestamps?.listingUpdated || a.listDate).getTime()
        return dateA - dateB
    })

    return (
        <DetailsContainer title="Building Sales History" id="history">
            <Stack spacing={4}>
                {sortedHistory.map((item, index) => {
                    const last = index === sortedHistory.length - 1 && scrubbedCount === 0
                    const active = isActive(item)

                    return (
                        <Box key={item.mlsNumber}>
                            <Typography variant="subtitle2" sx={{ ml: 6, mb: 1, fontWeight: 'bold' }}>
                                Unit {item.address?.unitNumber || 'N/A'} - {item.address?.streetNumber} {item.address?.streetName}
                            </Typography>
                            <HistoryItem
                                item={getListingData(item)}
                                last={last}
                                active={active}
                                propertyOverride={item}
                            />
                        </Box>
                    )
                })}

                {scrubbedCount > 0 && (
                    <Box sx={{ ml: 6 }}>
                        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                            There are <strong>{scrubbedCount}</strong> additional historical records in this building that are restricted or have suppressed details.
                        </Alert>
                    </Box>
                )}
            </Stack>
        </DetailsContainer>
    )
}

export default BuildingHistoryDetails
