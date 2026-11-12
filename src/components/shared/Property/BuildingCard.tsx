'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import { CardContainer } from './Card/components'
import { Gallery } from '@shared/Photos'

type BuildingCardProps = {
    building: any
}

const BuildingCard = ({ building }: BuildingCardProps) => {
    const name = typeof building === 'string' ? building : building.name
    const address = typeof building === 'string' ? '' : (building.address || building.fullAddress)
    const streetNum = building.street?.number || building.streetNumber || ''
    const streetName = building.street?.name || building.streetName || ''
    const slug = building.slug ||
        (streetNum && streetName ? `${streetNum}-${streetName.toLowerCase().replaceAll(' ', '-')}` : name.toLowerCase().replaceAll(' ', '-'))

    const imageUrl = building.cover_photo_url || building.coverPhotoUrl || 'https://stage25.precondo.ca/precondo_main_image.webp'
    const linkUrl = building.link || `/r/building/${slug}`
    // With search filters applied, the API returns how many of the building's
    // listings match them; show that instead of the building's total.
    const matching = typeof building === 'string' ? null : building.matching_listings
    const filtered = matching !== null && matching !== undefined
    const count = Number(filtered ? matching : building.listing_count) || 0
    const plural = count === 1 ? 'Listing' : 'Listings'

    return (
        <CardContainer size="normal" mlsNumber={slug}>
            <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ position: 'relative', display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
                <Box sx={{ position: 'relative' }}>
                    <Gallery
                        size="normal"
                        images={[imageUrl]}
                        icon="house"
                    />
                    {count > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'rgba(0, 0, 0, 0.65)',
                            backdropFilter: 'blur(8px)',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            zIndex: 2
                        }}>
                            {count} {filtered ? `Matching ${plural}` : plural}
                        </Box>
                    )}
                </Box>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" component="div" sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.5
                    }}>
                        {address}
                    </Typography>
                    {count > 0 && (
                        <Typography variant="caption" sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            <Box component="span" sx={{
                                width: 6,
                                height: 6,
                                bgcolor: 'primary.main',
                                borderRadius: '50%',
                                display: 'inline-block'
                            }} />
                            {count} {filtered ? 'Matching' : 'Active'} {plural}
                        </Typography>
                    )}
                </Box>
            </a>
        </CardContainer>
    )
}

export default BuildingCard
