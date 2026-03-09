import React from 'react'
import { type Metadata } from 'next'

import { APILocations } from 'services/API'
import { StaticPageTemplate } from '@templates'
import { GroupTemplate } from '@pages/catalog/components'
import { getCatalogUrl, sanitizeUrl } from 'utils/urls'
import { capitalize } from 'utils/strings'

type Props = {
    params: Promise<{ area: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { area } = await params
    return {
        title: `Neighborhoods - ${capitalize(area.replace(/-/g, ' '))}`
    }
}

const AreaSitemapPage = async ({ params }: Props) => {
    const { area } = await params

    // APILocations.fetchAreaNeighborhoods(area) handles slug transformation internally
    const neighborhoods = await APILocations.fetchAreaNeighborhoods(area)

    // Fetch areas to find the original display name for the title
    const areas = await APILocations.fetchAreas()
    const currentArea = areas.find(a => sanitizeUrl(a.name) === area)
    const areaName = currentArea ? currentArea.name : capitalize(area.replace(/-/g, ' '))

    return (
        <StaticPageTemplate title={`Neighborhoods of ${areaName}`}>
            <GroupTemplate
                title={`Browse ${areaName} areas or search all ${areaName} condos`}
                items={neighborhoods.sort((a, b) => a.localeCompare(b)).map((hood) => ({
                    name: hood,
                    link: `/r/sitemap/${area}/${sanitizeUrl(hood)}`
                }))}
            />
        </StaticPageTemplate>
    )
}

export default AreaSitemapPage
