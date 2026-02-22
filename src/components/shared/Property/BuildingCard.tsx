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
    const linkUrl = `/building/${slug}`

    return (
        <CardContainer size="normal" mlsNumber={slug}>
            <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ position: 'relative', display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
                <Gallery
                    size="normal"
                    images={[imageUrl]}
                    icon="house"
                />
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{
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
                        whiteSpace: 'nowrap'
                    }}>
                        {address}
                    </Typography>
                </Box>
            </a>
        </CardContainer>
    )
}

export default BuildingCard
