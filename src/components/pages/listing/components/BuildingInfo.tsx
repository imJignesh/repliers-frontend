
'use client'

import React from 'react'
import { Stack, Typography, Paper, Box } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import EventIcon from '@mui/icons-material/Event'
import ApartmentIcon from '@mui/icons-material/Apartment'

import { useProperty } from 'providers/PropertyProvider'

const BuildingInfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number | null | undefined }) => {
    if (value === null || value === undefined || value === '') return null;

    // Hide single character shorthand like 'C' or 'U' unless it's a number
    if (typeof value === 'string' && value.length === 1 && !/\d/.test(value)) return null;

    return (
        <Stack direction="row" spacing={1} alignItems="center">
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
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 0.2 }}>
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight="normal" lineHeight={1}>
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

    const hasData = building.price_sqft || building.avg_price_sqft || building.built_year_ext || building.floors_units

    if (!hasData) return null

    return (

        <Stack spacing={0} padding={0}>


            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
            }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 24px)' } }}>
                    <BuildingInfoItem
                        icon={SquareFootIcon}
                        label="Price/Sqft Range"
                        value={building.price_sqft}
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 24px)' } }}>
                    <BuildingInfoItem
                        icon={TrendingUpIcon}
                        label="Avg Price/Sqft"
                        value={building.avg_price_sqft}
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 24px)' } }}>
                    <BuildingInfoItem
                        icon={EventIcon}
                        label="Completed"
                        value={building.built_year_ext}
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 24px)' } }}>
                    <BuildingInfoItem
                        icon={ApartmentIcon}
                        label="Building Scale"
                        value={building.floors_units}
                    />
                </Box>
            </Box>
        </Stack>

    )
}

export default BuildingInfo
