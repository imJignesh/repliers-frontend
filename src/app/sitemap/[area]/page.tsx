import React from 'react'
import { type Metadata } from 'next'
import { Box, Stack } from '@mui/material'
import ApartmentIcon from '@mui/icons-material/Apartment'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'

import { APILocations } from 'services/API'
import { notFound } from 'next/navigation'
import { StaticPageTemplate } from '@templates'
import { GroupTemplate } from '@pages/catalog/components'
import { getCatalogUrl, sanitizeUrl } from 'utils/urls'
import { capitalize } from 'utils/strings'
import routes from '@configs/routes'

type Props = {
    params: Promise<{ area: string }>
}

import { headers } from 'next/headers'
import { getProtocolHost } from 'utils/urls'

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { area } = await params
    const rawLocationSlugs = [area]
    const slugValidation = await APILocations.validateSlugs(rawLocationSlugs)
    const hasInvalidSlug = rawLocationSlugs.some((slug) => slug in slugValidation && slugValidation[slug] === null)
    if (hasInvalidSlug) notFound()

    const host = getProtocolHost(await headers())
    const areas = await APILocations.fetchAreas()
    const currentArea = areas.find(a => sanitizeUrl(a.name) === area)
    const areaName = currentArea ? currentArea.name : capitalize(area.replace(/-/g, ' '))
    const listingCount = currentArea?.listing_count || 0
    const buildingCount = currentArea?.building_count || 0

    return {
        title: `Neighborhoods of ${areaName} (${listingCount} Listings & ${buildingCount} Buildings)`,
        alternates: {
            canonical: host + `${routes.sitemap}/${area}`
        },
        openGraph: {
            url: host + `${routes.sitemap}/${area}`
        }
    }
}

const AreaSitemapPage = async ({ params }: Props) => {
    const { area } = await params

    const rawLocationSlugs = [area]

    // Fetch data in parallel including slug validation
    const [areas, rawNeighborhoods, slugValidation] = await Promise.all([
        APILocations.fetchAreas(),
        APILocations.fetchAreaNeighborhoods(area, true),
        APILocations.validateSlugs(rawLocationSlugs)
    ])

    const hasInvalidSlug = rawLocationSlugs.some((slug) => slug in slugValidation && slugValidation[slug] === null)
    if (hasInvalidSlug) notFound()

    const currentArea = areas.find(a => sanitizeUrl(a.name) === area)
    const areaName = currentArea ? currentArea.name : capitalize(area.replace(/-/g, ' '))
    const listingCount = currentArea?.listing_count || 0
    const buildingCount = currentArea?.building_count || 0

    // Check if rawNeighborhoods is nested (array of CityWithNeighborhoods objects)
    const isNested = rawNeighborhoods.length > 0 &&
        typeof rawNeighborhoods[0] === 'object' &&
        rawNeighborhoods[0] !== null &&
        'neighborhoods' in rawNeighborhoods[0]

    const breadcrumbs = [
        { label: 'Sitemap', link: routes.sitemap },
        { label: areaName }
    ]

    return (
        <StaticPageTemplate
            title={`Neighborhoods of ${areaName}`}
            breadcrumbs={breadcrumbs}
        >
            {isNested ? (
                <Stack spacing={4}>
                    {(rawNeighborhoods as any[]).map((cityItem, index) => {
                        const cityName = cityItem.name
                        const cityListingCount = cityItem.listing_count || 0
                        const cityBuildingCount = cityItem.building_count || 0
                        const neighborhoods = (cityItem.neighborhoods || []) as any[]
                        const filteredNeighborhoods = neighborhoods.filter(
                            (hood) => (Number(hood.building_count) || 0) > 0 || (Number(hood.listing_count) || 0) > 0
                        )
                        if (!filteredNeighborhoods.length) return null

                        return (
                            <GroupTemplate
                                key={index}
                                title={`${cityName} (${cityListingCount} Listings & ${cityBuildingCount} Buildings)`}
                                items={filteredNeighborhoods.map((hood) => ({
                                    name: (
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                            <Box component="span">{hood.name}</Box>
                                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#999', fontSize: 11 }}>
                                                    <ApartmentIcon sx={{ fontSize: 13, color: '#999' }} />
                                                    {hood.building_count}
                                                </Box>
                                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#999', fontSize: 11 }}>
                                                    <FormatListBulletedIcon sx={{ fontSize: 13, color: '#999' }} />
                                                    {hood.listing_count}
                                                </Box>
                                            </Box>
                                        </Box>
                                    ),
                                    link: `${routes.sitemap}/${area}/${sanitizeUrl(cityName)}/${sanitizeUrl(hood.name)}`
                                }))}
                            />
                        )
                    })}
                </Stack>
            ) : (
                <GroupTemplate
                    title={`Browse ${areaName} areas (${listingCount} Listings & ${buildingCount} Buildings)`}
                    items={(rawNeighborhoods as any[])
                        .filter((hood) => (Number(hood.building_count) || 0) > 0 || (Number(hood.listing_count) || 0) > 0)
                        .map((hood) => ({
                            name: (
                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                    <Box component="span">{hood.name}</Box>
                                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#999', fontSize: 11 }}>
                                            <ApartmentIcon sx={{ fontSize: 13, color: '#999' }} />
                                            {hood.building_count}
                                        </Box>
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#999', fontSize: 11 }}>
                                            <FormatListBulletedIcon sx={{ fontSize: 13, color: '#999' }} />
                                            {hood.listing_count}
                                        </Box>
                                    </Box>
                                </Box>
                            ),
                            link: `${routes.sitemap}/${area}/${sanitizeUrl(hood.name)}`
                        }))}
                />
            )}
        </StaticPageTemplate>
    )
}

export default AreaSitemapPage
