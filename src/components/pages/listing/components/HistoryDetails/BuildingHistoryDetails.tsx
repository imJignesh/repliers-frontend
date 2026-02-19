'use client'

import React from 'react'
import Link from 'next/link'
import { Stack, Typography, Box, Alert } from '@mui/material'
import { DetailsContainer } from '@shared/Containers'
import { type Property, type HistoryItemType } from 'services/API'
import routes from '@configs/routes'
import { scrubbed, active as isActive } from 'utils/properties'
import { HistoryItem } from '.'
import { useAuthenticated } from 'hooks/useAuthenticated'

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
        const pType = item.details?.propertyType?.toLowerCase() || ''
        const isParking = pType.includes('parking') || pType.includes('locker')

        return !scrubbed(item.mlsNumber) &&
            !scrubbed(item.address?.streetNumber) &&
            !scrubbed(item.listPrice) &&
            !isParking
    })

    const scrubbedCount = history.length - visibleHistory.length

    if (!visibleHistory.length && scrubbedCount === 0) return null

    // Sort chronologically (most recent first)
    const sortedHistory = [...visibleHistory].sort((a, b) => {
        const dateA = new Date(b.timestamps?.listingUpdated || b.listDate).getTime()
        const dateB = new Date(a.timestamps?.listingUpdated || a.listDate).getTime()
        return dateA - dateB
    })

    const authenticated = useAuthenticated()

    const groups = React.useMemo(() => {
        const grouped: Record<string, { label: string, items: typeof sortedHistory, listed: number, sold: number }> = {}

        sortedHistory.forEach(item => {
            const d = new Date(item.timestamps?.listingUpdated || item.listDate)
            if (isNaN(d.getTime())) return

            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const label = d.toLocaleString('default', { month: 'short', year: 'numeric' })

            if (!grouped[key]) {
                grouped[key] = { label, items: [], listed: 0, sold: 0 }
            }

            grouped[key].items.push(item)
            grouped[key].listed++
            if (item.lastStatus === 'Sld') grouped[key].sold++
        })

        return Object.keys(grouped).sort().reverse().map(k => grouped[k])
    }, [sortedHistory])

    return (
        <DetailsContainer title="Building Sales History" id="history">
            <Stack spacing={4}>

                {!authenticated && (
                    <Alert severity="info" sx={{ mb: 4, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
                        <Typography variant="body2">
                            Real estate boards require you to be signed in to access price history. <Link href={'/register'} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'underline' }}>Sign up</Link> or <Link href={routes.login} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'underline' }}>Log in</Link>
                        </Typography>
                    </Alert>
                )}
                {groups.map((group) => (
                    <Box key={group.label}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, ml: 0, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.95rem' }}>
                            {group.label} — {group.listed} Listed | {group.sold} Sold
                        </Typography>
                        <Stack spacing={2}>
                            {group.items.map((item, index) => {
                                const active = isActive(item)
                                return (
                                    <Box key={item.mlsNumber}>

                                        <HistoryItem
                                            item={getListingData(item)}
                                            last={index === group.items.length - 1}
                                            active={active}
                                            propertyOverride={item}
                                            blurred={!authenticated}
                                        />
                                    </Box>
                                )
                            })}
                        </Stack>
                    </Box>
                ))}


                {authenticated && scrubbedCount > 0 && (
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
