'use client'

import React, { useState } from 'react'
import Image from 'next/legacy/image'

import { Box, Stack, Typography, Button, Collapse } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

import { ImagePlaceholder } from 'components/atoms'
import propsConfig from '@configs/properties'
import { useProperty } from 'providers/PropertyProvider'
import { getCDNPath } from 'utils/urls'
import { formatBuildingAddress } from 'utils/properties/formatters'
import { FullAddressInfo } from '../HomeHeaderInfo/components'
import { useAuthenticated } from 'hooks/useAuthenticated'
import { GalleryLockOverlay } from '@shared/Photos'

const BuildingGallery = ({
    activeCount = 0,
    historyCount = 0
}: {
    activeCount?: number
    historyCount?: number
}) => {
    const [showAllAddresses, setShowAllAddresses] = useState(false)
    const { property } = useProperty()
    const authenticated = useAuthenticated()
    const { images } = property
    const building = (property as any).building

    const activeImage = images?.[0]
    const activeImageUrl = building?.cover_photo_url || (activeImage ? getCDNPath(activeImage, 'large') : null)

    const handleScroll = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <Stack
            direction={{ xs: 'column', md: 'row-reverse' }}
            spacing={4}
            alignItems="stretch"
            sx={{
                bgcolor: '#f8f9fa', // Light grey background
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Image Section */}
            <Box
                sx={{
                    flex: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: 'background.default',
                    aspectRatio: {
                        xs: '3/2',
                        sm: '2.4/1',
                        md: '16/9'
                    },
                    maxHeight: { md: 400 }
                }}
            >
                {!activeImageUrl ? (
                    <ImagePlaceholder />
                ) : (
                    <Image
                        priority
                        unoptimized
                        layout="fill"
                        objectFit="cover"
                        alt="Building Image"
                        src={activeImageUrl}
                    />
                )}
            </Box>

            {/* Content Section */}
            <Stack
                spacing={3}
                sx={{
                    flex: 1,
                    justifyContent: 'center',
                    px: { xs: 2, md: 4 }, // Padding around the content
                }}
            >
                <Box>
                    <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, fontWeight: 700, lineHeight: 1.2, mb: 1 }}>
                        {building?.name || formatBuildingAddress(property.address)}
                    </Typography>

                    <Typography variant="h2" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500, mb: 2 }}>
                        {(() => {
                            const primaryAddr = formatBuildingAddress(property.address);
                            const otherAddrs = (building?.secondary_addresses || []).filter((addr: string) => {
                                const normalizedAddr = addr.toLowerCase();
                                const normalizedPrimary = primaryAddr.toLowerCase();
                                return normalizedAddr !== normalizedPrimary &&
                                    (!normalizedAddr.includes(property.address.streetNumber?.toLowerCase() || '') ||
                                        !normalizedAddr.includes(property.address.streetName?.toLowerCase() || ''));
                            });

                            if (otherAddrs.length > 0) {
                                return `${primaryAddr} & ${otherAddrs.join(' & ')}, ${property.address.city}`;
                            }
                            return `${primaryAddr}, ${property.address.city}`;
                        })()}
                    </Typography>
                </Box>

                <Stack spacing={2} direction="row">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleScroll('active-listings')}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                        <span className='pr-2 d-inline-block fw-bold '>{activeCount}</span> &nbsp;For Sale
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleScroll('history')}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                        <span className='pr-2 d-inline-block fw-bold '>{historyCount}</span> &nbsp;Price History
                    </Button>
                </Stack>

                <Stack spacing={3} direction="row" alignItems="center">
                    <Typography
                        variant="body1"
                        sx={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' }
                        }}
                        onClick={() => handleScroll('features')}
                    >
                        Features
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' }
                        }}
                        onClick={() => {
                            const element = document.getElementById('contact-section');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                                element.classList.remove('highlight-form');
                                void element.offsetWidth; // trigger reflow
                                element.classList.add('highlight-form');
                                setTimeout(() => {
                                    element.classList.remove('highlight-form');
                                }, 1500);
                            }
                        }}
                    >
                        Request more info
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default BuildingGallery
