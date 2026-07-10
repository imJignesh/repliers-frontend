import routes from '@configs/routes'

import { type ApiQueryResponse, type Property, type PropertyAddress } from 'services/API'

import { getBathrooms, getBedrooms, getSqft, scrubbed, sold } from './properties'
import { deriveBuildingProperty } from './properties/building'
import { formatShortAddress } from './properties/formatters'
import { getSeoUrl } from './properties/seo'
import { notNA } from './strings'
import { getCDNPath } from './urls'

export type BreadcrumbItem = { name: string; url: string }

// schema.org `description` expects plain text, not the markup some MLS feeds embed.
const toPlainText = (value?: string) =>
  value
    ? value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || undefined
    : undefined

export const getBreadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(({ name, url }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: url
  }))
})

// Slugs coming from the curated Laravel location records when available;
// otherwise derived from the display name the same way Laravel's Str::slug
// does (apostrophes dropped, everything else non-alphanumeric to hyphens).
const toLocationSlug = (name?: string) =>
  name
    ? name
        .toLowerCase()
        .replace(/['’.]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    : ''

export type BreadcrumbLocationSlugs = {
  area?: { slug?: string | null } | null
  city?: { slug?: string | null } | null
  locality?: { slug?: string | null } | null
}

// Canonical /locations/{area}/{city}/{neighborhood} trail (same URL scheme the
// Laravel sitemap publishes) — search URLs are not indexable landing pages.
export const getLocationBreadcrumbItems = (
  address: Pick<PropertyAddress, 'area' | 'city' | 'neighborhood'>,
  host: string,
  location?: BreadcrumbLocationSlugs | null
): BreadcrumbItem[] => {
  const { area, city, neighborhood } = address
  const items: BreadcrumbItem[] = []
  const segments: string[] = []

  const push = (name: string, slug: string) => {
    segments.push(slug)
    items.push({ name, url: `${host}${routes.listings}/${segments.join('/')}` })
  }

  if (notNA(area)) push(area, location?.area?.slug || toLocationSlug(area))
  if (notNA(city)) push(city, location?.city?.slug || toLocationSlug(city))
  if (notNA(neighborhood))
    push(neighborhood, location?.locality?.slug || toLocationSlug(neighborhood))

  return items
}

// Mirrors the visible trail in NavigationBreadcrumbs (listing & building pages)
// so the structured data matches what users actually see, per Google's guidance.
export const getPropertyBreadcrumbItems = (
  address: Pick<PropertyAddress, 'area' | 'city' | 'neighborhood'>,
  host: string,
  current: BreadcrumbItem,
  location?: BreadcrumbLocationSlugs | null
): BreadcrumbItem[] => [
  { name: 'For sale', url: host + routes.map },
  ...getLocationBreadcrumbItems(address, host, location),
  current
]

const getAboutPlace = (property: Property, streetAddress: string) => {
  const { address, details, map } = property
  const sqft = getSqft(property)
  const beds = getBedrooms(details).count
  const baths = getBathrooms(details).count

  return {
    '@type': 'Apartment',
    ...(streetAddress ? { name: streetAddress } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(streetAddress ? { streetAddress } : {}),
      ...(address.city ? { addressLocality: address.city } : {}),
      ...(address.state ? { addressRegion: address.state } : {}),
      ...(!scrubbed(address.zip) && address.zip ? { postalCode: address.zip } : {}),
      addressCountry: address.country || 'CA'
    },
    ...(map?.latitude && map?.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: map.latitude,
            longitude: map.longitude
          }
        }
      : {}),
    ...(beds ? { numberOfBedroomsTotal: beds } : {}),
    ...(baths ? { numberOfBathroomsTotal: baths } : {}),
    ...(sqft.number
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: sqft.number,
            unitCode: 'FTK'
          }
        }
      : {})
  }
}

export const getListingJsonLd = (property: Property, host: string) => {
  const { address, details, images, mlsNumber, listPrice, soldPrice, timestamps } = property
  const isSold = sold(property)
  const price = isSold ? soldPrice : listPrice
  const streetAddress = formatShortAddress(address, true)
  const url = host + getSeoUrl(property, { excludeQuery: true })
  const description = !scrubbed(details?.description)
    ? toPlainText(details?.description)
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    url,
    ...(mlsNumber ? { mlsNumber } : {}),
    name: streetAddress || `${details?.propertyType || 'Condo'} in ${address.city}`,
    ...(description ? { description } : {}),
    ...(timestamps?.listingEntryDate
      ? { datePosted: timestamps.listingEntryDate }
      : {}),
    ...(images?.length
      ? { image: images.slice(0, 6).map((img) => getCDNPath(img, 'large')) }
      : {}),
    about: getAboutPlace(property, streetAddress),
    ...(!scrubbed(price) && price
      ? {
          offers: {
            '@type': 'Offer',
            url,
            price: Number(price),
            priceCurrency: 'CAD',
            availability: isSold
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock'
          }
        }
      : {})
  }
}

export const getBuildingJsonLd = (
  property: ApiQueryResponse,
  host: string,
  buildingName: string,
  canonicalSlug: string
) => {
  const p = deriveBuildingProperty(property)
  if (!p || !canonicalSlug) return null

  const streetAddress = formatShortAddress(p.address, true)
  const url = `${host}${routes.building}/${canonicalSlug}`
  const description = !scrubbed(p.details?.description)
    ? toPlainText(p.details?.description)
    : undefined
  const { min, max } = property.statistics?.listPrice || ({} as { min?: string, max?: string })
  const unitCount = property.count

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    url,
    name: buildingName,
    ...(description ? { description } : {}),
    ...(p.images?.length
      ? { image: p.images.slice(0, 6).map((img) => getCDNPath(img, 'large')) }
      : {}),
    about: {
      ...getAboutPlace(p, streetAddress),
      '@type': 'ApartmentComplex',
      name: buildingName,
      ...(unitCount ? { numberOfAccommodationUnits: unitCount } : {})
    },
    ...(min && max
      ? {
          offers: {
            '@type': 'AggregateOffer',
            url,
            lowPrice: Number(min),
            highPrice: Number(max),
            priceCurrency: 'CAD',
            ...(unitCount ? { offerCount: unitCount } : {})
          }
        }
      : {})
  }
}
