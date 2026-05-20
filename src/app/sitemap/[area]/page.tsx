import React from 'react'
import { type Metadata } from 'next'

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
    const neighborhoodNames: string[] = []

    rawNeighborhoods.forEach((item) => {
        if (typeof item === 'string') {
            neighborhoodNames.push(item)
        } else if (item && typeof item === 'object') {
            if (Array.isArray(item.neighborhoods)) {
                neighborhoodNames.push(...item.neighborhoods)
            } else if (item.name) {
                neighborhoodNames.push(item.name)
            }
        }
    })

    const uniqueNeighborhoods = Array.from(new Set(neighborhoodNames)).sort((a, b) => a.localeCompare(b))

    return (
        <StaticPageTemplate title={`Neighborhoods of ${areaName}`}>
            <GroupTemplate
                title={`Browse ${areaName} areas or search all ${areaName} condos`}
                items={uniqueNeighborhoods.map((hood) => ({
                    name: hood,
                    link: `/r/sitemap/${area}/${sanitizeUrl(hood)}`
                }))}
            />
        </StaticPageTemplate>
    )
}

export default AreaSitemapPage
