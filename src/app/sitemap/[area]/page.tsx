import React from 'react'
import { type Metadata } from 'next'
import { Stack } from '@mui/material'

import { APILocations } from 'services/API'
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
    const host = getProtocolHost(await headers())
    return {
        title: `Neighborhoods - ${capitalize(area.replace(/-/g, ' '))}`,
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

    // Fetch areas to find the original display name for the title
    const areas = await APILocations.fetchAreas()
    const currentArea = areas.find(a => sanitizeUrl(a.name) === area)
    const areaName = currentArea ? currentArea.name : capitalize(area.replace(/-/g, ' '))

    const rawNeighborhoods = await APILocations.fetchAreaNeighborhoods(area)

    // Check if rawNeighborhoods is nested (array of CityWithNeighborhoods objects)
    const isNested = rawNeighborhoods.length > 0 &&
        typeof rawNeighborhoods[0] === 'object' &&
        rawNeighborhoods[0] !== null &&
        'neighborhoods' in rawNeighborhoods[0]

    return (
        <StaticPageTemplate title={`Neighborhoods of ${areaName}`}>
            {isNested ? (
                <Stack spacing={4}>
                    {(rawNeighborhoods as any[]).map((cityItem, index) => {
                        const cityName = cityItem.name
                        const neighborhoods = (cityItem.neighborhoods || []) as string[]
                        if (!neighborhoods.length) return null

                        return (
                            <GroupTemplate
                                key={index}
                                title={cityName}
                                items={neighborhoods.map((hood) => ({
                                    name: hood,
                                    link: `${routes.sitemap}/${area}/${sanitizeUrl(cityName)}/${sanitizeUrl(hood)}`
                                }))}
                            />
                        )
                    })}
                </Stack>
            ) : (
                <GroupTemplate
                    title={`Browse ${areaName} areas or search all ${areaName} condos`}
                    items={(rawNeighborhoods as string[]).map((hood) => ({
                        name: hood,
                        link: `${routes.sitemap}/${area}/${sanitizeUrl(hood)}`
                    }))}
                />
            )}
        </StaticPageTemplate>
    )
}

export default AreaSitemapPage
