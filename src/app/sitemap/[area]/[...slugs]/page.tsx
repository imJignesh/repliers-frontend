import React from 'react'
import { type Metadata } from 'next'
import { Stack, Container, Typography } from '@mui/material'

import { APILocations } from 'services/API'
import { notFound } from 'next/navigation'
import { StaticPageTemplate } from '@templates'
import { GroupTemplate } from '@pages/catalog/components'
import { sanitizeUrl } from 'utils/urls'
import { capitalize } from 'utils/strings'
import routes from '@configs/routes'

type Props = {
    params: Promise<{ area: string, slugs: string[] }>
}

import { headers } from 'next/headers'
import { getProtocolHost } from 'utils/urls'

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { area, slugs } = await params
    const neighborhood = slugs[slugs.length - 1]
    const parentCity = slugs.length > 1 ? slugs[slugs.length - 2] : undefined
    const rawLocationSlugs = [area, ...(slugs ?? [])]
    const slugValidation = await APILocations.validateSlugs(rawLocationSlugs)
    const hasInvalidSlug = rawLocationSlugs.some((slug) => slug in slugValidation && slugValidation[slug] === null)
    if (hasInvalidSlug) notFound()

    const slugPath = slugs.join('/')
    const host = getProtocolHost(await headers())

    const [listings, buildings, areas] = await Promise.all([
        APILocations.fetchNeighborhoodListings(neighborhood, parentCity, area),
        APILocations.fetchNeighborhoodBuildings(neighborhood, parentCity, area),
        APILocations.fetchAreas()
    ])

    const currentArea = areas.find(a => sanitizeUrl(a.name) === area)
    const areaName = currentArea ? currentArea.name : capitalize(area.replace(/-/g, ' '))
    const neighborhoodName = capitalize(neighborhood.replace(/-/g, ' '))

    return {
        title: `${neighborhoodName}, ${areaName} (${listings.length} Listings & ${buildings.length} Buildings)`,
        alternates: {
            canonical: host + `${routes.sitemap}/${area}/${slugPath}`
        },
        openGraph: {
            url: host + `${routes.sitemap}/${area}/${slugPath}`
        }
    }
}

const NeighborhoodSitemapPage = async ({ params }: Props) => {
    const { area, slugs } = await params
    const neighborhood = slugs[slugs.length - 1]
    const parentCity = slugs.length > 1 ? slugs[slugs.length - 2] : undefined

    const rawLocationSlugs = [area, ...(slugs ?? [])]

    // Fetch data for the neighborhood in parallel including slug validation
    const [listings, buildings, areas, slugValidation] = await Promise.all([
        APILocations.fetchNeighborhoodListings(neighborhood, parentCity, area),
        APILocations.fetchNeighborhoodBuildings(neighborhood, parentCity, area),
        APILocations.fetchAreas(),
        APILocations.validateSlugs(rawLocationSlugs)
    ])

    const hasInvalidSlug = rawLocationSlugs.some((slug) => slug in slugValidation && slugValidation[slug] === null)
    if (hasInvalidSlug) notFound()

    // Resolve names for titles
    const currentArea = areas.find(a => sanitizeUrl(a.name) === area)
    const areaName = currentArea ? currentArea.name : capitalize(area.replace(/-/g, ' '))
    const neighborhoodName = capitalize(neighborhood.replace(/-/g, ' '))

    const breadcrumbs = [
        { label: 'Sitemap', link: routes.sitemap as string | undefined },
        { label: areaName, link: `${routes.sitemap}/${area}` as string | undefined }
    ]

    slugs.forEach((slug, idx) => {
        const isLast = idx === slugs.length - 1
        const label = capitalize(slug.replace(/-/g, ' '))
        const link = `${routes.sitemap}/${area}/${slugs.slice(0, idx + 1).join('/')}`
        breadcrumbs.push({
            label,
            link: isLast ? undefined : link
        })
    })

    return (
        <StaticPageTemplate
            title={`${neighborhoodName}, ${areaName}`}
            breadcrumbs={breadcrumbs}
        >
            <Stack spacing={6}>
                {buildings.length > 0 && (
                    <GroupTemplate
                        title={`Buildings in ${neighborhoodName} (${buildings.length})`}
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
                        title={`Listings in ${neighborhoodName} (${listings.length})`}
                        items={listings.sort((a, b) => a.localeCompare(b)).map((listing) => {
                            // Example input: "1208, 65, Ellen, St, Barrie, L4N 3A5 S12888060 1"
                            const parts = listing.split(' ')
                            // Removing the last two parts (ID and Board) for the display name
                            const addressString = parts.slice(0, -2).join(' ')

                            // Determine short display name (unit and street names only)
                            let displayName = ''
                            if (addressString.includes(',')) {
                                const addressParts = addressString.split(',').map(s => s.trim()).filter(Boolean)
                                if (addressParts.length >= 3) {
                                    // Remove last two parts (city and postal code/province)
                                    const shortParts = addressParts.slice(0, -2)
                                    if (shortParts.length >= 4) {
                                        // Format unit number nicely
                                        let unit = shortParts[0]
                                        if (/^\d+$/.test(unit)) {
                                            unit = `#${unit}`
                                        }
                                        const street = shortParts.slice(1).join(' ')
                                        displayName = `${unit} ${street}`
                                    } else {
                                        displayName = shortParts.join(' ')
                                    }
                                } else {
                                    displayName = addressParts.join(' ')
                                }

                                displayName = capitalize(displayName.toLowerCase())
                                    .split(' ')
                                    .map(word => word.startsWith('#') ? word.toUpperCase() : word)
                                    .join(' ')
                            } else {
                                // Fallback for legacy dashed format: replace () with # and clean up dashes/spaces
                                let cleanAddr = addressString
                                    .toLowerCase()
                                    .replace(/\(([^)]+)\)/g, (match, p1) => '#' + p1.replace(/[\s-]+/g, '___DASH___'))
                                    .replace(/-/g, ' ')

                                displayName = capitalize(cleanAddr)
                                    .replace(/___DASH___/g, '-')
                                    .split(' ')
                                    .map(word => word.startsWith('#') ? word.toUpperCase() : word)
                                    .join(' ')

                                // Strip city name from the end if present
                                const cityName = slugs.length > 1 ? capitalize(slugs[0].replace(/-/g, ' ')) : ''
                                if (cityName && displayName.endsWith(cityName)) {
                                    displayName = displayName.substring(0, displayName.length - cityName.length).replace(/,\s*$/, '').trim()
                                }
                            }

                            // Link: remove brackets and content from the full string for the slug
                            const cleanListing = listing.replace(/\([^)]*\)/g, '').trim()
                            const linkSlug = cleanListing.toLowerCase()
                                .replace(/[^a-z0-9\s-]/g, '') // Remove commas and non-alphanumeric chars except space/dash
                                .replace(/\s+/g, '-')
                                .replace(/-+/g, '-')

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
