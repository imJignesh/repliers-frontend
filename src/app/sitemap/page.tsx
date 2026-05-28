import React from 'react'
import { type Metadata } from 'next'
import { Box } from '@mui/material'
import ApartmentIcon from '@mui/icons-material/Apartment'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'

import { APILocations } from 'services/API'
import { StaticPageTemplate } from '@templates'
import { GroupTemplate } from '@pages/catalog/components'
import routes from '@configs/routes'
import { sanitizeUrl } from 'utils/urls'

import { headers } from 'next/headers'
import { getProtocolHost } from 'utils/urls'

export const generateMetadata = async (): Promise<Metadata> => {
    const host = getProtocolHost(await headers())
    const areas = await APILocations.fetchAreas()
    const totalListings = areas.reduce((sum, a) => sum + (a.listing_count || 0), 0)
    const totalBuildings = areas.reduce((sum, a) => sum + (a.building_count || 0), 0)

    return {
        title: `Find condos for Sale (${totalListings} Listings & ${totalBuildings} Buildings)`,
        alternates: {
            canonical: host + routes.sitemap
        },
        openGraph: {
            url: host + routes.sitemap
        }
    }
}

const SitemapPage = async () => {
    const areas = await APILocations.fetchAreas()
    const totalListings = areas.reduce((sum, a) => sum + (a.listing_count || 0), 0)
    const totalBuildings = areas.reduce((sum, a) => sum + (a.building_count || 0), 0)

    return (
        <StaticPageTemplate title="Find condos for Sale">
            <GroupTemplate
                title={`Areas (${areas.length})`}
                items={areas.sort((a, b) => a.name.localeCompare(b.name)).map((area) => ({
                    name: (
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <Box component="span">{area.name}</Box>
                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#999', fontSize: 11 }}>
                                    <ApartmentIcon sx={{ fontSize: 13, color: '#999' }} />
                                    {area.building_count || 0}
                                </Box>
                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#999', fontSize: 11 }}>
                                    <FormatListBulletedIcon sx={{ fontSize: 13, color: '#999' }} />
                                    {area.listing_count || 0}
                                </Box>
                            </Box>
                        </Box>
                    ),
                    link: `${routes.sitemap}/${sanitizeUrl(area.name)}`
                }))}
            />
        </StaticPageTemplate>
    )
}

export default SitemapPage
