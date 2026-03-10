import React from 'react'
import { type Metadata } from 'next'

import { APILocations } from 'services/API'
import { StaticPageTemplate } from '@templates'
import { GroupTemplate } from '@pages/catalog/components'
import { sanitizeUrl } from 'utils/urls'

import { headers } from 'next/headers'
import { getProtocolHost } from 'utils/urls'

export const generateMetadata = async (): Promise<Metadata> => {
    const host = getProtocolHost(await headers())
    return {
        title: 'Find condos for Sale',
        alternates: {
            canonical: host + '/sitemap'
        }
    }
}

const SitemapPage = async () => {
    const areas = await APILocations.fetchAreas()

    return (
        <StaticPageTemplate title="Find condos for Sale">
            <GroupTemplate
                title={`Areas | ${areas.length}`}
                items={areas.sort((a, b) => a.name.localeCompare(b.name)).map((area) => ({
                    name: area.name,
                    link: `/r/sitemap/${sanitizeUrl(area.name)}`
                }))}
            />
        </StaticPageTemplate>
    )
}

export default SitemapPage
