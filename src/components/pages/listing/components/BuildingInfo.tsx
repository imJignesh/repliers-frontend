
'use client'

import React from 'react'
import { Stack, Typography, Grid, Paper, Box } from '@mui/material'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import LayersIcon from '@mui/icons-material/Layers'
import EventIcon from '@mui/icons-material/Event'
import ApartmentIcon from '@mui/icons-material/Apartment'

import { useProperty } from 'providers/PropertyProvider'

const BuildingInfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number | null | undefined }) => {
    if (value === null || value === undefined || value === '') return null;

    // Hide single character shorthand like 'C' or 'U' unless it's a number
    if (typeof value === 'string' && value.length === 1 && !/\d/.test(value)) return null;

    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
                bgcolor: 'primary.light',
                color: 'primary.main',
                p: 1,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon fontSize="small" />
            </Box>
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: -0.5 }}>
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                    {value}
                </Typography>
            </Box>
        </Stack>
    )
}

const BuildingInfo = () => {
    const { property } = useProperty()
    const building = (property as any).building

    if (!building) return null

    const hasData = building.stories || building.total_units || building.year_built || building.amenities

    if (!hasData) return null

    return (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: '#fdfdfd' }}>
            <Stack spacing={3}>
                <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    Building Information
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <BuildingInfoItem
                            icon={LayersIcon}
                            label="Stories"
                            value={building.stories}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <BuildingInfoItem
                            icon={ApartmentIcon}
                            label="Total Units"
                            value={building.total_units}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <BuildingInfoItem
                            icon={EventIcon}
                            label="Year Built"
                            value={building.year_built}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <BuildingInfoItem
                            icon={CorporateFareIcon}
                            label="Slug"
                            value={building.slug}
                        />
                    </Grid>
                </Grid>

                {building.amenities && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Building Amenities
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                            {building.amenities.split(',').map((amenity: string) => (
                                <Box
                                    key={amenity}
                                    sx={{
                                        bgcolor: 'rgba(0,0,0,0.05)',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 5,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {amenity.trim()}
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Stack>
        </Paper>
    )
}

export default BuildingInfo
