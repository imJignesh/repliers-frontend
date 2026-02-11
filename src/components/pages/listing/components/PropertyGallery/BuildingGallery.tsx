'use client'

import React, { useState } from 'react'
import Image from 'next/legacy/image'

import { Box, Stack, Typography, Button, Collapse } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

import { ImagePlaceholder } from 'components/atoms'
import { useProperty } from 'providers/PropertyProvider'
import { getCDNPath } from 'utils/urls'
import { formatBuildingAddress } from 'utils/properties/formatters'
import { FullAddressInfo } from '../HomeHeaderInfo/components'

const BuildingGallery = ({
    activeCount = 0,
    historyCount = 0
}: {
    activeCount?: number
    historyCount?: number
}) => {
    const [showAllAddresses, setShowAllAddresses] = useState(false)
    const { property } = useProperty()
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

                overflow: 'hidden'
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
                    aspectRatio: { xs: '3/2', sm: '2.4/1', md: '16/9' },
                    minHeight: { md: 400 }
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
                    <Typography variant="h1" style={{ fontSize: '2rem', lineHeight: 1.2 }}>
                        {formatBuildingAddress(property.address)}
                        {building?.secondary_addresses?.length > 0 && (
                            <Button
                                size="small"
                                onClick={() => setShowAllAddresses(!showAllAddresses)}
                                startIcon={showAllAddresses ? <RemoveIcon /> : <AddIcon />}
                                sx={{
                                    ml: 1,
                                    textTransform: 'none',
                                    verticalAlign: 'middle',
                                    fontWeight: 'bold'
                                }}
                            >
                                {showAllAddresses ? 'hide' : `${building.secondary_addresses.length} more`}
                            </Button>
                        )}
                    </Typography>

                    <Collapse in={showAllAddresses}>
                        <Stack spacing={0.5} mt={1} mb={2}>
                            {building?.secondary_addresses?.map((addr: string, idx: number) => (
                                <Typography key={idx} variant="body1" color="text.secondary">
                                    • {addr}
                                </Typography>
                            ))}
                        </Stack>
                    </Collapse>

                    <Box mt={1}>
                        <FullAddressInfo property={property} />
                    </Box>
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
