import React from 'react'
import { type Metadata } from 'next'
import { Stack, Container, Typography } from '@mui/material'

import { APILocations } from 'services/API'
import { StaticPageTemplate } from '@templates'
import { GroupTemplate } from '@pages/catalog/components'
import { sanitizeUrl } from 'utils/urls'
import { capitalize } from 'utils/strings'

type Props = {
    params: Promise<{ area: string, neighborhood: string }>
}

import { headers } from 'next/headers'
import { getProtocolHost } from 'utils/urls'

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { area, neighborhood } = await params
    const host = getProtocolHost(await headers())
    return {
        title: `Listings & Buildings - ${capitalize(neighborhood.replace(/-/g, ' '))}`,
        alternates: {
            canonical: host + `/sitemap/${area}/${neighborhood}`
        }
    }
}

const NeighborhoodSitemapPage = async ({ params }: Props) => {
    const { area, neighborhood } = await params

    // Fetch data for the neighborhood
    const [listings, buildings, areas] = await Promise.all([
        APILocations.fetchNeighborhoodListings(neighborhood),
        APILocations.fetchNeighborhoodBuildings(neighborhood),
        APILocations.fetchAreas()
    ])

    // Resolve names for titles
    const currentArea = areas.find(a => sanitizeUrl(a.name) === area)
    const areaName = currentArea ? currentArea.name : capitalize(area.replace(/-/g, ' '))
    const neighborhoodName = capitalize(neighborhood.replace(/-/g, ' '))

    return (
        <StaticPageTemplate title={`${neighborhoodName}, ${areaName}`}>
            <Stack spacing={6}>
                {buildings.length > 0 && (
                    <GroupTemplate
                        title={`Buildings in ${neighborhoodName} | ${buildings.length}`}
                        items={buildings
                            .sort((a, b) => {
                                const nameA = typeof a === 'string' ? a : a.name
                                const nameB = typeof b === 'string' ? b : b.name
                                return nameA.localeCompare(nameB)
                            })
                            .map((building) => {
                                const name = typeof building === 'string' ? building : building.name
                                const slug = typeof building === 'string'
                                    ? building.replace(/\s+/g, '-').toLowerCase()
                                    : building.slug || building.name.replace(/\s+/g, '-').toLowerCase()

                                return {
                                    name,
                                    link: `/r/building/${slug}`
                                }
                            })}
                    />
                )}
                {listings.length > 0 && (
                    <GroupTemplate
                        title={`Listings in ${neighborhoodName} | ${listings.length}`}
                        items={listings.sort((a, b) => a.localeCompare(b)).map((listing) => {
                            // Example input: "(F3-- F6) Vienna-Rd-Tillsonburg X12670468 2"
                            const parts = listing.split(' ')
                            // Removing the last two parts (ID and Board) for the display name
                            const addressString = parts.slice(0, -2).join(' ')

                            // Anchor display: replace () with # and clean up inside
                            let displayName = addressString
                                .toLowerCase()
                                .replace(/\(([^)]+)\)/g, (match, p1) => '#' + p1.replace(/[\s-]+/g, '___DASH___'))
                                .replace(/-/g, ' ')

                            displayName = capitalize(displayName)
                                .replace(/___DASH___/g, '-')
                                .split(' ')
                                .map(word => word.startsWith('#') ? word.toUpperCase() : word)
                                .join(' ')

                            // Link: remove brackets and content from the full string for the slug
                            const cleanListing = listing.replace(/\([^)]*\)/g, '').trim()
                            const linkSlug = cleanListing.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-')

                            return {
                                name: displayName,
                                link: `/r/listing/${linkSlug}`,
                                rel: 'nofollow,noindex'
                            }
                        })}
                    />
                )}
                {buildings.length === 0 && listings.length === 0 && (
                    <Container>
                        <Stack spacing={2} py={4}>
                            <Typography variant="h5">Nothing found</Typography>
                            <Typography variant="body1">No buildings or listings found for this neighborhood.</Typography>
                        </Stack>
                    </Container>
                )}
            </Stack>
        </StaticPageTemplate>
    )
}

export default NeighborhoodSitemapPage
