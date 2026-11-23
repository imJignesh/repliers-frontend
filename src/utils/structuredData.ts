import { getBuildingScale } from 'utils/properties/buildingFacts'
import routes from '@configs/routes'

import {
  type ApiQueryResponse,
  type Property,
  type PropertyAddress
} from 'services/API'

import { deriveBuildingProperty } from './properties/building'
import { formatShortAddress } from './properties/formatters'
import { getSeoUrl } from './properties/seo'
import { type LocationCrumb } from './locationCrumbs'
import {
  active,
  getBathrooms,
  getBedrooms,
  getSqft,
  scrubbed,
  sold
} from './properties'
import { getCDNPath } from './urls'

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

/**
 * Technical audit TA12: location pages showed breadcrumbs but had no
 * BreadcrumbList. Names are the resolved area, city and neighbourhood; URLs
 * are the cumulative location slugs. Returns [] when they don't line up, so a
 * page never advertises a wrong trail.
 */
export const getLocationBreadcrumbItems = (
  names: Array<string | undefined | null>,
  slugs: string[],
  host: string
): BreadcrumbItem[] => {
  const levels = names.filter((n): n is string => Boolean(n && n.trim()))
  if (!levels.length || levels.length !== slugs.length) return []
  return [
    { name: 'For sale', url: host + routes.listings },
    ...levels.map((name, i) => ({
      name,
      url: host + routes.listings + '/' + slugs.slice(0, i + 1).join('/')
    }))
  ]
}

// Use the canonical, cumulative location hierarchy. Search-result URLs are UI
// state and must not be advertised as breadcrumb destinations to crawlers.
/**
 * Breadcrumb trail for a property page. Location levels come only from the
 * API's curated chain (see getLocationCrumbs); address text is never turned
 * into a URL (audit RT03).
 */
export const getPropertyBreadcrumbItems = (
  locationCrumbs: LocationCrumb[],
  host: string,
  current: BreadcrumbItem
): BreadcrumbItem[] => [
  { name: 'For sale', url: host + routes.listings },
  ...locationCrumbs.map((crumb) => ({
    name: crumb.name,
    url: host + crumb.url
  })),
  current
]

/**
 * Audit 4 T11: the feed's `city` is often a Toronto district ("Downtown",
 * "Midtown | Central", "North York") or "Hamilton City". schema.org
 * addressLocality is the municipality, so Toronto districts become
 * "Toronto" and a trailing " City" is dropped.
 */
export const getAddressLocality = (
  address: Partial<Pick<PropertyAddress, 'city' | 'area'>>
): string => {
  if (
    String(address.area || '')
      .trim()
      .toLowerCase() === 'toronto'
  ) {
    return 'Toronto'
  }
  return String(address.city || '')
    .replace(/\s+city$/i, '')
    .trim()
}

const getPostalAddress = (
  address: Partial<
    Pick<PropertyAddress, 'city' | 'area' | 'state' | 'zip' | 'country'>
  >,
  streetAddress: string
) => ({
  '@type': 'PostalAddress',
  ...(streetAddress ? { streetAddress } : {}),
  ...(getAddressLocality(address)
    ? { addressLocality: getAddressLocality(address) }
    : {}),
  // Every /r/ listing is in Ontario; the feed often leaves state empty.
  addressRegion: address.state || 'ON',
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
  // Audit R03: a self-contradicting Building Scale is not a verified total.
  const match = /total\s*units\s*:\s*([\d,]+)/i.exec(
    getBuildingScale(building.floors_units) || ''
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
    // Technical audit TA12: mlsNumber is not a schema.org property.
    ...(mlsNumber
      ? {
          identifier: {
            '@type': 'PropertyValue',
            propertyID: 'MLS',
            value: mlsNumber
          }
        }
      : {}),
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

  const images = p.images?.length
    ? { image: p.images.slice(0, 6).map((img) => getCDNPath(img, 'large')) }
    : {}

  const complex = {
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
  }

  // Audit 4 T11: a building with nothing for sale is a place, not a listing.
  if (!availableUnits || !(min && max)) {
    return {
      '@context': 'https://schema.org',
      ...complex,
      ...(description ? { description } : {}),
      ...images
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    url,
    name: buildingName,
    ...(description ? { description } : {}),
    ...images,
    about: complex,
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
