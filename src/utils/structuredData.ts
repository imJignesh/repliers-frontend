import routes from '@configs/routes'

import {
  type ApiQueryResponse,
  type Property,
  type PropertyAddress
} from 'services/API'

import { deriveBuildingProperty } from './properties/building'
import { formatShortAddress } from './properties/formatters'
import { getSeoUrl } from './properties/seo'
import {
  active,
  getBathrooms,
  getBedrooms,
  getSqft,
  scrubbed,
  sold
} from './properties'
import { notNA } from './strings'
import { getCDNPath, sanitizeUrl } from './urls'

export type BreadcrumbItem = { name: string; url: string }

// schema.org `description` expects plain text, not the markup some MLS feeds embed.
const toPlainText = (value?: string) =>
  value
    ? value
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || undefined
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

// Use the canonical, cumulative location hierarchy. Search-result URLs are UI
// state and must not be advertised as breadcrumb destinations to crawlers.
export const getPropertyBreadcrumbItems = (
  address: Pick<PropertyAddress, 'area' | 'city' | 'neighborhood'>,
  host: string,
  current: BreadcrumbItem
): BreadcrumbItem[] => {
  const { area, city, neighborhood } = address
  const items: BreadcrumbItem[] = [
    { name: 'For sale', url: host + routes.listings }
  ]
  const path: string[] = []

  if (notNA(area)) {
    path.push(sanitizeUrl(area))
    items.push({
      name: area,
      url: `${host}${routes.listings}/${path.join('/')}`
    })
  }
  if (notNA(city)) {
    path.push(sanitizeUrl(city))
    items.push({
      name: city,
      url: `${host}${routes.listings}/${path.join('/')}`
    })
  }
  if (notNA(neighborhood)) {
    path.push(sanitizeUrl(neighborhood))
    items.push({
      name: neighborhood,
      url: `${host}${routes.listings}/${path.join('/')}`
    })
  }

  items.push(current)
  return items
}

const getPostalAddress = (
  address: Pick<PropertyAddress, 'city' | 'state' | 'zip' | 'country'>,
  streetAddress: string
) => ({
  '@type': 'PostalAddress',
  ...(streetAddress ? { streetAddress } : {}),
  ...(address.city ? { addressLocality: address.city } : {}),
  ...(address.state ? { addressRegion: address.state } : {}),
  ...(!scrubbed(address.zip) && address.zip ? { postalCode: address.zip } : {}),
  addressCountry: address.country || 'CA'
})

const getGeo = (map?: Property['map']) =>
  map?.latitude && map?.longitude
    ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: map.latitude,
          longitude: map.longitude
        }
      }
    : {}

// Unit-level facts (beds, baths, size) belong to the Apartment entity only.
// `numberOfBedrooms` is the defined schema.org property; the previously used
// `numberOfBedroomsTotal` does not exist in the vocabulary (audit RT07).
const getUnitPlace = (
  property: Property,
  streetAddress: string,
  extra: Record<string, unknown> = {}
) => {
  const { address, details, map } = property
  const sqft = getSqft(property)
  const beds = getBedrooms(details).count
  const baths = getBathrooms(details).count

  return {
    '@type': 'Apartment',
    ...extra,
    ...(streetAddress ? { name: streetAddress } : {}),
    address: getPostalAddress(address, streetAddress),
    ...getGeo(map),
    ...(beds ? { numberOfBedrooms: beds } : {}),
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

type BuildingRecord = {
  total_units?: number | string | null
  floors_units?: string | null
}

/**
 * The verified total number of units in a building, from the curated
 * building record: the integer `total_units` column when present, otherwise
 * the "Floors: 24 | Total Units: 314" summary shown on the page as Building
 * Scale. Never the count of listings currently for sale (audit RT07).
 */
export const getBuildingUnitTotal = (
  building?: BuildingRecord | null
): number | null => {
  if (!building) return null
  const explicit = Number(building.total_units)
  if (Number.isInteger(explicit) && explicit > 0) return explicit
  const match = /total\s*units\s*:\s*([\d,]+)/i.exec(
    building.floors_units || ''
  )
  if (!match) return null
  const parsed = Number(match[1].replace(/,/g, ''))
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export const getListingJsonLd = (property: Property, host: string) => {
  const {
    address,
    details,
    images,
    mlsNumber,
    listPrice,
    soldPrice,
    timestamps
  } = property
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
    name:
      streetAddress || `${details?.propertyType || 'Condo'} in ${address.city}`,
    ...(description ? { description } : {}),
    ...(timestamps?.listingEntryDate
      ? { datePosted: timestamps.listingEntryDate }
      : {}),
    ...(images?.length
      ? { image: images.slice(0, 6).map((img) => getCDNPath(img, 'large')) }
      : {}),
    about: getUnitPlace(property, streetAddress),
    ...(active(property) && !scrubbed(price) && price
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

  const url = `${host}${routes.building}/${canonicalSlug}`
  const buildingId = `${url}#building`
  // The complex is addressed by street number and name only; the unit number
  // of whichever listing happened to come first is not the building's address.
  const buildingAddress = formatShortAddress(
    { ...p.address, unitNumber: undefined },
    true
  )
  const description = !scrubbed(p.details?.description)
    ? toPlainText(p.details?.description)
    : undefined
  const { min, max } =
    property.statistics?.listPrice || ({} as { min?: string; max?: string })
  const totalUnits = getBuildingUnitTotal(property.building)
  // `count` is the number of units currently listed, i.e. availability.
  const availableUnits = property.count || property.listings?.length || 0

  const unitOffers = (property.listings || [])
    .filter(
      (unit) => active(unit) && !scrubbed(unit.listPrice) && unit.listPrice
    )
    .slice(0, 10)
    .map((unit) => {
      const unitUrl = host + getSeoUrl(unit, { excludeQuery: true })
      const unitAddress = formatShortAddress(unit.address, true)
      return {
        '@type': 'Offer',
        '@id': `${unitUrl}#offer`,
        url: unitUrl,
        price: Number(unit.listPrice),
        priceCurrency: 'CAD',
        availability: 'https://schema.org/InStock',
        itemOffered: getUnitPlace(unit, unitAddress, {
          '@id': `${unitUrl}#unit`,
          containedInPlace: { '@id': buildingId }
        })
      }
    })

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
      '@type': 'ApartmentComplex',
      '@id': buildingId,
      name: buildingName,
      url,
      address: getPostalAddress(p.address, buildingAddress),
      ...getGeo(p.map),
      ...(totalUnits
        ? {
            numberOfAccommodationUnits: {
              '@type': 'QuantitativeValue',
              value: totalUnits
            }
          }
        : {}),
      ...(availableUnits
        ? {
            numberOfAvailableAccommodationUnits: {
              '@type': 'QuantitativeValue',
              value: availableUnits
            }
          }
        : {})
    },
    ...(min && max
      ? {
          offers: {
            '@type': 'AggregateOffer',
            url,
            lowPrice: Number(min),
            highPrice: Number(max),
            priceCurrency: 'CAD',
            ...(availableUnits ? { offerCount: availableUnits } : {}),
            ...(unitOffers.length ? { offers: unitOffers } : {})
          }
        }
      : {})
  }
}
